const Permissions = artifacts.require('./Permissions.sol');
const TokenFactory = artifacts.require('./TokenFactory.sol');

module.exports = (deployer, network, accounts) => {
  var permissions, tokenFactory;

  Permissions.deployed()
  .then((instance) => {
    permissions = instance
    return permissions.setAuthorized(accounts[1], 2)
  })
  .then(() => {
    return permissions.setAuthorized(accounts[3], 2)
  })
  .then(() => {
    return permissions.setAuthorized(accounts[2], 1)
  })
  .then(() => {
    return permissions.setAuthorized(accounts[5], 3)
  })
  .then(() => {
    return permissions.setAuthorized(accounts[0], 5)
  })
  .then(() => {
    return TokenFactory.deployed()
  })
  .then((instance) => {
    tokenFactory = instance 
    permissions.setAuthorized(tokenFactory.address, 6)
  })
};





