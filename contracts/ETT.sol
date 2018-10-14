pragma solidity ^0.4.24;

import "./StandardToken.sol";
import "./Permissions.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ETT is StandardToken, Ownable {

  string public name;
  string public symbol;
  uint public cutoffTime;
  uint8 public decimals;
  uint8 public fee;
  bytes32 public holdingsHash;

  mapping(bytes32 => uint) dateTotalSupply_;
  mapping(bytes32 => bytes32) dateHoldingsHash;
  mapping(bytes32 => bool) endOfDays;

  Permissions public permissions;

  event TotalSupplyUpdate(address token, address owner, uint oldTotalSupply, uint newTotalSupply, uint time);
  event EndOfDay(address token, address owner, uint totalSupply, uint time);
  event FeeTaken(address token, address owner, uint value, uint time);

  constructor(
    string _name,
    uint8 _decimals,
    string _symbol,
    uint _initialAmount,
    string _holdingsString,
    uint _cutoffTime,
    uint8 _fee,
    address _owner,
    address _permissions)
  public {
    fee = _fee;
    name = _name;
    owner = _owner;
    symbol = _symbol;
    decimals = _decimals;
    cutoffTime = _cutoffTime;

    holdingsHash = keccak256(abi.encodePacked(_holdingsString));
    totalSupply_ = _initialAmount;
    // Give the owner the initial amount
    balances[_owner] = _initialAmount;

    permissions = Permissions(_permissions);
  }
  /// @dev Gives the owner of the token their fee
  function _takeFee() internal {
    uint numerator = totalSupply_.mul(fee);
    uint denomiator = (uint(360).mul(10000)).sub(fee);
    uint value = numerator.div(denomiator);
    totalSupply_ = totalSupply_.add(value);
    balances[owner] = balances[owner].add(value);
    emit FeeTaken(address(this), owner, value, now);
  }

  function dateTotalSupply(string dateString) public view returns(uint){
    bytes32 dateHash = keccak256(abi.encodePacked(dateString));
    return dateTotalSupply_[dateHash];
  }

  /// @dev Update the total supply of tokens.
  /// @param amount amount to change supply by
  function updateTotalSupply(int amount, string holdingsString, string dateString) public {
    // require(permissions.isAuthorized(msg.sender, uint(Permissions.Role.ADMIN)));
    uint uamount = uint(amount);
    uint oldTotalSupply = totalSupply_;
    if(amount > 0) {
      totalSupply_ = totalSupply_.add(uamount);
      balances[owner] = balances[owner].add(uamount);
    } else {
      require(totalSupply_ >= uamount);
      totalSupply_ = totalSupply_.sub(uamount);
      balances[owner] = balances[owner].sub(uamount);
    }
    bytes32 dateHash = keccak256(abi.encodePacked(dateString));
    dateTotalSupply_[dateHash] = totalSupply_;
    holdingsHash = keccak256(abi.encodePacked(holdingsString));
    dateHoldingsHash[dateHash] = holdingsHash;
    emit TotalSupplyUpdate(address(this), owner, oldTotalSupply, totalSupply_, now);
  }

  /// @dev Update the total AUM of the fund
  function endOfDay(string dateString) public {
    // require(permissions.isAuthorized(msg.sender, uint(Permissions.Role.ADMIN)));
    bytes32 dateHash = keccak256(abi.encodePacked(dateString));
    require(!endOfDays[dateHash]);
    endOfDays[dateHash] = true;
    
    // Now take the fee
    _takeFee();
    
    // Now I need to create the tokens
    emit EndOfDay(address(this),owner,totalSupply_,now);
  }
  
  /// @dev Transfer token for a specified address
  /// @param _to The address to transfer to.
  /// @param _value The amount to be transferred.
  function transfer(address _to, uint _value) public returns (bool) {
    // require(!permissions.isAuthorized(msg.sender, 0));
    return super.transfer(_to, _value);
  }

  /// @dev Transfer tokens from one address to another
  /// @param _from address The address which you want to send tokens from
  /// @param _to address The address which you want to transfer to
  /// @param _value uint the amount of tokens to be transferred
  function transferFrom(
    address _from,
    address _to,
    uint _value
  )
    public
    returns (bool)
  {
    require(_value <= balances[_from]);
    require(_to != address(0));

    // if(!permissions.isAuthorized(msg.sender, uint(Permissions.Role.CONTRACT))) {
    //   require(_value <= allowed[_from][msg.sender]);
    //   allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    // }

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);

    emit Transfer(_from, _to, _value);
    return true;
  }

}