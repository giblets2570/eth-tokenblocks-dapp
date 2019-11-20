const ContractRegistry = artifacts.require('./ContractRegistry.sol');
const TokenFactory = artifacts.require('./TokenFactory.sol');
const TradeKernel = artifacts.require('./TradeKernel.sol');
const Permissions = artifacts.require('./Permissions.sol');

const ETT = artifacts.require('./ETT.sol');

module.exports = (deployer, network, accounts) => {
  var registry, tokenFactory, permissions, tradeKernel;

  console.log('ContractRegistry: deploy');
  deployer.deploy(ContractRegistry, {from: accounts[0]})
  .then((instance) => {
    registry = instance;
    console.log('Permissions: deploy');
    return deployer.deploy(Permissions, {from: accounts[0]});
  })
  .then((instance) => {
    permissions = instance
    console.log('TradeKernel: deploy');
    return deployer.deploy(TradeKernel, permissions.address, {from: accounts[0]});
  })
  .then((instance) => {
    tradeKernel = instance
    console.log('TokenFactory: deploy');
    return deployer.deploy(TokenFactory, permissions.address, {from: accounts[0]});
  })
};
