pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Permissions.sol";
import "./ETT.sol";

contract TradeKernel {
  // Error Codes
  enum Errors {
    TRADE_EXPIRED,  // Trade has already expired
    WRONG_SIGNATURE, // Trade has the wrong signature
    WRONG_PERMISSIONS // Sender doesn't have permissions
  }

  // Mappings of tradeHash => amount
  mapping (bytes32 => bytes32) public confirmed;
  // Mappings of tradeHash => canceller
  mapping (bytes32 => address) public cancelled;
  // Mappings of orderHash => true
  mapping (bytes32 => bool) public fundsTransfered;
  // Mappings of tradeHash => number tokens issued
  mapping (bytes32 => int) public distributed;

  Permissions permissions;

  event LogConfirmed(
    address indexed investor,
    address indexed broker,
    address token,
    bytes32 tradeHash);

  event LogCancel(
    address indexed investor,
    address indexed broker,
    address token,
    address indexed canceller,
    bytes32 tradeHash);

  event LogFundsTransfered(bytes32 tradeHash);

  event LogDistributed(
    address indexed investor,
    address token,
    int amount,
    bytes32 tradeHash);

  event LogError(uint8 indexed errorId, bytes32 indexed tradeHash);

  struct Order {
    address broker;
    address token;
    uint amount;
    uint verificationDate;
    bytes32[] tradeHashes;
    bytes32 orderHash;
  }

  struct Trade {
    address investor;
    address broker;
    address token;
    bytes32 nominalAmount;
    bytes32 price;
    uint executionDate;
    uint expirationTimestampInSec;
    bytes32 tradeHash;
  }

  constructor(address _permissions) public {
    permissions = Permissions(_permissions);
  }

  /*
  * Core kernel functions
  */

  /// @dev Fills the input trade.
  /// @param tradeAddresses Array of trade's investor, broker, token
  /// @param tradeBytes Array of trade's ik1, ik2, ek1, ek2, nominalAmount, price
  /// @param tradeValues Array of trade's executionDate, expirationTimestampInSec, and salt.
  /// @param v ECDSA signature parameter v.
  /// @param r ECDSA signature parameters r.
  /// @param s ECDSA signature parameters s.
  function confirmTrade(
      address[3] tradeAddresses,
      bytes32[2] tradeBytes,
      uint[3] tradeValues,
      uint8 v,
      bytes32 r,
      bytes32 s)
      public
      returns(uint)
  {
    Trade memory trade = Trade({
      investor: address(tradeAddresses[0]),
      broker: address(tradeAddresses[1]),
      token: address(tradeAddresses[2]),
      nominalAmount: tradeBytes[0],
      price: tradeBytes[1],
      executionDate: tradeValues[0],
      expirationTimestampInSec: tradeValues[1],
      tradeHash: getTradeHash(tradeAddresses, tradeBytes, tradeValues)
    });

    if(trade.broker != msg.sender) {
      emit LogError(uint8(Errors.WRONG_PERMISSIONS), trade.tradeHash);
      return 1;
    }

    if(recoverSigner(trade.tradeHash,v,r,s) != trade.investor) {
      emit LogError(uint8(Errors.WRONG_SIGNATURE), trade.tradeHash);
      return 1;
    }

    // if (block.timestamp >= trade.expirationTimestampInSec) {
    //     emit LogError(uint8(Errors.ORDER_EXPIRED), trade.tradeHash);
    //     require(false);
    // }

    confirmed[trade.tradeHash] = trade.nominalAmount;

    emit LogConfirmed(
      msg.sender,
      address(trade.broker),
      address(trade.token),
      trade.tradeHash
    );

    return 0;
  }

  /// @dev Cancels the input trade.
  /// @param tradeAddresses Array of trade's investor, broker, token
  /// @param tradeBytes Array of trade's ik1, ik2, ek1, ek2, nominalAmount, price
  /// @param tradeValues Array of trade's executionDate, expirationTimestampInSec, and salt.
  function cancelTrade(
    address[3] tradeAddresses,
    bytes32[2] tradeBytes,
    uint[3] tradeValues)
    public
  {
    Trade memory trade = Trade({
      investor: address(tradeAddresses[0]),
      broker: address(tradeAddresses[1]),
      token: address(tradeAddresses[2]),
      nominalAmount: tradeBytes[0],
      price: tradeBytes[1],
      executionDate: tradeValues[0],
      expirationTimestampInSec: tradeValues[1],
      tradeHash: getTradeHash(tradeAddresses, tradeBytes, tradeValues)
    });

    require(trade.broker == msg.sender || trade.investor == msg.sender);

    // if (block.timestamp >= trade.expirationTimestampInSec) {
    //     emit LogError(uint8(Errors.ORDER_EXPIRED), trade.tradeHash);
    //     require(false);
    // }

    cancelled[trade.tradeHash] = msg.sender;

    emit LogCancel(
      trade.investor,
      trade.broker,
      trade.token,
      msg.sender,
      trade.tradeHash
    );
  }

  /// @dev Funds are transfered to the fund
  /// @param tradeHash bytes32 of trade
  function transferFunds(bytes32 tradeHash)
    public
  {
    // require(permissions.isAuthorized(msg.sender, Permissions.Role.ADMIN));

    require(!fundsTransfered[tradeHash]);
    fundsTransfered[tradeHash] = true;

    emit LogFundsTransfered(tradeHash);
  }

  /// @dev Function to distribute tokens to investor
  /// @param tradeHash identifier of a trade
  /// @param distributeAddresses address for token investor broker
  /// @param distributeAmounts amounts for investor broker
  function distributeTokens(
    bytes32 tradeHash,
    address[] distributeAddresses,
    int[] distributeAmounts)
    public
  {
    address token = distributeAddresses[0];
    address investor = distributeAddresses[1];
    // require(permissions.isAuthorized(msg.sender, Permissions.Role.ADMIN));
    require(fundsTransfered[tradeHash]);
    require(distributed[tradeHash] == 0);
    address tokenOwner = ETT(token).owner();
    int amount = distributeAmounts[0];
    if(amount < 0) {
      uint256 uamount = uint(amount * -1);
      ETT(token).transferFrom(
        investor,
        tokenOwner,
        uamount
      );
    } else {
      ETT(token).transferFrom(
        tokenOwner,
        investor,
        uint(amount)
      );
    }
    // Distribute to broker
    // ETT(token).transferFrom(
    //   tokenOwner,
    //   broker,
    //   uint(distributeAmounts[1])
    // );
    distributed[tradeHash] = amount;
    emit LogDistributed(investor, token, amount, tradeHash);
  }

  /*
  * Constant public functions
  */

  /// @dev Calculates Keccak-256 hash of trade with specified parameters.
  /// @param tradeAddresses Array of trade's investor, broker, token
  /// @param tradeBytes Array of trade's nominalAmount, price
  /// @param tradeValues Array of trade's executionDate, expirationTimestampInSec, and salt.
  /// @return Keccak-256 hash of trade.
  function getTradeHash(
    address[3] tradeAddresses,
    bytes32[2] tradeBytes,
    uint[3] tradeValues)
    public
    view
    returns (bytes32)
  {
    return keccak256(
      abi.encodePacked(
        address(this),
        address(tradeAddresses[0]), // investor
        address(tradeAddresses[1]), // broker
        address(tradeAddresses[2]), // token
        tradeBytes[0],     // nominalAmount
        tradeBytes[1],     // price
        tradeValues[0],    // executionDate
        tradeValues[1],    // expirationTimestampInSec
        tradeValues[2]     // salt
      )
    );
  }

  /// @dev Returns the address of signature signer
  /// @param hash Signed Keccak-256 hash.
  /// @param v ECDSA signature parameter v.
  /// @param r ECDSA signature parameters r.
  /// @param s ECDSA signature parameters s.
  /// @return address of signer.
  function recoverSigner (
    bytes32 hash,
    uint8 v,
    bytes32 r,
    bytes32 s)
    public
    pure
    returns(address)
  {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
    return address(ecrecover(prefixedHash, v, r, s));
  }
}
