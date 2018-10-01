pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ContractRegistry is Ownable {

	address public tokenFactory;
	address public permissions;
	address public oracle;
	address public tradeKernel;
	address public orderKernel;

	constructor() public {}

	function setPermissions(address _permissions) public onlyOwner {
		permissions = _permissions;
	}
	function setOracle(address _oracle) public onlyOwner {
		oracle = _oracle;
	}
	function setTokenFactory(address _tokenFactory) public onlyOwner {
		tokenFactory = _tokenFactory;
	}
	function setTradeKernel(address _tradeKernel) public onlyOwner {
		tradeKernel = _tradeKernel;
	}
	function setOrderKernel(address _orderKernel) public onlyOwner {
		orderKernel = _orderKernel;
	}
}