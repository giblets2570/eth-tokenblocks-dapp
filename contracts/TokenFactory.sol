pragma solidity ^0.4.24;

import "./ETT.sol";
import "./Permissions.sol";

contract TokenFactory {
    mapping(address => address[]) public created;
    mapping(address => bool) public isETT; //verify without having to do a bytecode check.
    uint public numTokens;
    mapping(uint => address) public tokenAddresses;
    mapping(bytes32 => address) public symbolToAddresses;
    Permissions public permissions;
    
    event TokenCreated(address indexed tokenAddress, string name, uint8 decimals, string symbol, uint cutoffTime, uint8 fee, address owner, uint initialAmount);

    constructor(address _permissions) public {
        //upon creation of the factory, deploy a ETT (parameters are meaningless) and store the bytecode provably.
        permissions = Permissions(_permissions);
        numTokens = 0;
    }
    function createETT(
        string _name, 
        uint8 _decimals, 
        string _symbol, 
        uint _initialAmount,
        string _holdingsString,
        uint _cutoffTime,
        uint8 _fee,
        address _owner)
    public returns (address) {
        // require(permissions.isAuthorized(msg.sender, uint(Permissions.Role.ADMIN)));
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        require(symbolToAddresses[symbolHash] == address(0));
        ETT newToken = (new ETT(_name,_decimals,_symbol,_initialAmount,_holdingsString,_cutoffTime,_fee,_owner,address(permissions)));

        created[msg.sender].push(address(newToken));
        isETT[address(newToken)] = true;
        
        tokenAddresses[numTokens] = address(newToken);
        numTokens += 1;

        symbolToAddresses[symbolHash] = address(newToken);

        emit TokenCreated(address(newToken),_name,_decimals,_symbol,_cutoffTime,_fee,_owner,_initialAmount);

        return address(newToken);
    }
    function tokenFromSymbol(string _symbol) public view returns (address){
        bytes32 symbolHash = keccak256(abi.encodePacked(_symbol));
        require(symbolToAddresses[symbolHash] != address(0));
        return symbolToAddresses[symbolHash];
    }
    function symbolHash(string _symbol) public pure returns (bytes32){
        return keccak256(abi.encodePacked(_symbol));
    }
}