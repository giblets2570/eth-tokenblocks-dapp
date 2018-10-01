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
  
  uint public NAV;
  bool private feeTakeable;

  mapping(bytes32 => uint) dateTotalSupply_;
  mapping(bytes32 => uint) dateNAV_;

  Permissions public permissions;

  event TotalSupplyUpdate(uint oldTotalSupply, uint newTotalSupply, address owner, uint time);
  event NavUpdate(uint NAV, address owner, uint time);
  event FeeTaken(uint amount, uint time);

  constructor(
    string _name,
    uint8 _decimals,
    string _symbol,
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
    
    NAV = 0;
    totalSupply_ = 0;

    permissions = Permissions(_permissions);
  }
  /// @dev Gives the owner of the token their fee
  function _takeFee() internal {
    uint amount = fee * totalSupply_ / 10000;
    totalSupply_ = totalSupply_.add(amount);
    balances[owner] = balances[owner].add(amount);
  }

  function dateTotalSupply(string dateString) public view returns(uint){
    bytes32 dateHash = keccak256(abi.encodePacked(dateString));
    return dateTotalSupply_[dateHash];
  }

  function dateNAV(string dateString) public view returns(uint){
    bytes32 dateHash = keccak256(abi.encodePacked(dateString));
    return dateNAV_[dateHash];
  }

  /// @dev Update the total supply of tokens.
  /// @param amount amount to change supply by
  function updateTotalSupply(int amount, string dateString) public {
    require(permissions.isAuthorized(msg.sender, uint(Permissions.Role.ADMIN)));
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
    _takeFee();
    bytes32 dateHash = keccak256(abi.encodePacked(dateString));
    dateTotalSupply_[dateHash] = totalSupply_;
    emit TotalSupplyUpdate(oldTotalSupply, totalSupply_, owner, now);
  }

  /// @dev Update the total NAV of the fund
  /// @param _NAV new NAV
  function updateNAV(uint _NAV, string dateString) public {
    require(permissions.isAuthorized(msg.sender, uint(Permissions.Role.ADMIN)));
    NAV = _NAV;
    bytes32 dateHash = keccak256(abi.encodePacked(dateString));
    dateNAV_[dateHash] = NAV;
    emit NavUpdate(NAV, owner, now);
  }
  
  /// @dev Transfer token for a specified address
  /// @param _to The address to transfer to.
  /// @param _value The amount to be transferred.
  function transfer(address _to, uint _value) public returns (bool) {
    require(!permissions.isAuthorized(msg.sender, 0));
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

    if(!permissions.isAuthorized(msg.sender, uint(Permissions.Role.CONTRACT))) {
      require(_value <= allowed[_from][msg.sender]);
      allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    }

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);

    emit Transfer(_from, _to, _value);
    return true;
  }

}