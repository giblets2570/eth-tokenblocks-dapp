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
  .then((instance) => {
    tokenFactory = instance
    console.log(`setAuthorized: 0xdda3d83B3f4218FF3aCa68471d539daf8a4c8c95`);
    return permissions.setAuthorized("0xdda3d83B3f4218FF3aCa68471d539daf8a4c8c95", 2) //broker
  })
  .then(() => {
    console.log(`setAuthorized: 0x1bbf9F9429202f6C95B1890abfeF0e09595D3c2F`);
    return permissions.setAuthorized("0x1bbf9F9429202f6C95B1890abfeF0e09595D3c2F", 2) //broker
  })
  .then(() => {
    console.log(`setAuthorized: 0xcb6efeeA21445C2964Eda40a783b7A98A1774DC4`);
    return permissions.setAuthorized("0xcb6efeeA21445C2964Eda40a783b7A98A1774DC4", 1) //investor
  })
  .then(() => {
    console.log(`setAuthorized: 0x394439460e2Cf489CF3c8b3c96e17424542Bc785`);
    return permissions.setAuthorized("0x394439460e2Cf489CF3c8b3c96e17424542Bc785", 3) //custodian
  })
  .then(() => {
    console.log(`setAuthorized: 0x5589c3389e83288B055a53f7Cd6FFb59358aD172`);
    return permissions.setAuthorized("0x5589c3389e83288B055a53f7Cd6FFb59358aD172", 5) //custodian
  })
  .then(() => {
    console.log(`setAuthorized: ${tokenFactory.address}`);
    return permissions.setAuthorized(tokenFactory.address, 6)
  })
};