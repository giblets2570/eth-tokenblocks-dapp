pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Permissions is Ownable {
	// Roles
    enum Role {
    	NONE,
        INVESTOR,
        BROKER,
        CUSTODIAN,
        FUND,
        ADMIN,
        CONTRACT
    }

	mapping(address => Role) permissions;

	constructor() public {}

	function isAuthorized(address agent, uint role) public view returns(bool) {
		return uint(permissions[agent]) == role;
	}

	function setAuthorized(address agent, uint role) public onlyOwner {
		permissions[agent] = Role(role);
	}
}