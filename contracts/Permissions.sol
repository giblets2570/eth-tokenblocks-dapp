pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Permissions is Ownable {
	// Roles
    enum Role {
    	NONE, 		// 0
        INVESTOR, 	// 1
        BROKER, 	// 2
        CUSTODIAN, 	// 3
        FUND, 		// 4
        ADMIN, 		// 5
        CONTRACT 	// 6
    }

	mapping(address => Role) permissions;

	constructor() public {
		owner = msg.sender;
		// Set user as admin
		permissions[msg.sender] = Role(5);
	}

	function isAuthorized(address agent, uint role) public view returns(bool) {
		return uint(permissions[agent]) == role;
	}

	function setAuthorized(address agent, uint role) public onlyOwner {
		permissions[agent] = Role(role);
	}
}