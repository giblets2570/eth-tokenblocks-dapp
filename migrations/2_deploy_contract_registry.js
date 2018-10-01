const ContractRegistry = artifacts.require('./ContractRegistry.sol');

const TokenFactory = artifacts.require('./TokenFactory.sol');

const TradeKernel = artifacts.require('./TradeKernel.sol');
const Permissions = artifacts.require('./Permissions.sol');

const ETT = artifacts.require('./ETT.sol');

module.exports = (deployer, network, accounts) => {
  var registry, tokenFactory, permissions, tradeKernel;

  deployer.deploy(ContractRegistry, {from: accounts[0]})
  .then((instance) => {
    registry = instance;
    return deployer.deploy(Permissions, {from: accounts[0]});
  })
  .then((instance) => {
    permissions = instance;
    return registry.setPermissions(permissions.address, {from: accounts[0]});
  })  
  .then(() => {
    return deployer.deploy(TradeKernel, permissions.address, {from: accounts[0]});
  })
  .then((instance) => {
    tradeKernel = instance
    return registry.setTradeKernel(tradeKernel.address, {from: accounts[0]});
  })
  .then(() => {
    return deployer.deploy(TokenFactory, permissions.address, {from: accounts[0]});
  })
  .then((instance) => {
    tokenFactory = instance
    return registry.setTokenFactory(tokenFactory.address, {from: accounts[0]});
  })
  
};