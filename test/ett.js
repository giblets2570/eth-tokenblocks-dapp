require('babel-polyfill');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const TokenFactory = artifacts.require("./TokenFactory.sol");
const ETT = artifacts.require("./ETT.sol");

// const defaultAddress = "0x0000000000000000000000000000000000000000";
// let holdings = require('../migrations/holdings-test.json');

// function createHoldingsString(_h) {
//   let h = _h.map((__h) => __h.ticker).sort()
//   let hhash = _h.reduce((cuml, r) => {
//     cuml[r.ticker] = r.stock
//     return cuml
//   }, {})
//   let holdingsString = JSON.stringify(h.map((__h) => ({ticker: __h, stock: hhash[__h]})));
//   return holdingsString;
// }

// let holdingsString = createHoldingsString(holdings);
// contract('ETT', async (accounts) => {

//   let tokenFactory, tokenAddress, ett

//   before(async () => {
//     tokenFactory = await TokenFactory.deployed();
//     tokenAddress = await tokenFactory.tokenAddresses.call(0);
//     ett = await ETT.at(tokenAddress);
//   });

//   it("should get the previous holdings", async () => {
//     let hashedHoldings = web3.sha3(holdingsString);
//     let signature = web3.eth.sign(accounts[0], hashedHoldings);
//     let r = `0x${signature.substring(2).substring(0,64)}`;
//     let s = `0x${signature.substring(2).substring(64,128)}`;
//     let v = parseInt(signature.substring(2).substring(128,130)) + 27;

//     await ett.updateHoldings(v, r, s, {from: accounts[0]});

//     let verifiedHoldings = await ett.verifyHoldings.call(hashedHoldings, {from: accounts[0]});
//     expect(verifiedHoldings).to.be.equal(true);
//   });
// });