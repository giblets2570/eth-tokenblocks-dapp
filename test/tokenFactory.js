require('babel-polyfill');
const TokenFactory = artifacts.require("./TokenFactory.sol");
const Permissions = artifacts.require("./Permissions.sol");
const ETT = artifacts.require("./ETT.sol");

const defaultAddress = "0x0000000000000000000000000000000000000000"

contract('TokenFactory', async (accounts) => {

  let tokenFactory, permissions, fundAddress = accounts[4];
  let token = {
    name: "S&P 500 ETT",
    symbol: "S&P 500 ETT",
    decimals: 18,
    cutoffTime: 64000,
    initialAmount: 1000000,
    holdingsString: `[]`,
    fee: 25,
    owner: fundAddress
  }
  before(async () => {
    tokenFactory = await TokenFactory.deployed();
    permissions = await Permissions.deployed();

    await permissions.setAuthorized(accounts[0], 5, {from: accounts[0]});
    await permissions.setAuthorized(tokenFactory.address, 6, {from: accounts[0]});
  })

  it("should be able to create a token", async () => {
    console.log([token.name, 
      token.decimals, 
      token.symbol, 
      token.initialAmount,
      token.holdingsString,
      token.cutoffTime, 
      token.fee,
      token.owner].length)
    let transaction = await tokenFactory.createETT(
      token.name, 
      token.decimals, 
      token.symbol, 
      token.initialAmount,
      token.holdingsString,
      token.cutoffTime, 
      token.fee,
      token.owner,
      {from: accounts[0]}
    );
  });

  it("should be able to retrieve the correct address for a token from symbol", async () => {
    let address = await tokenFactory.tokenFromSymbol(token.symbol);
    let numTokens = await tokenFactory.numTokens.call();
    let actualAddress = await tokenFactory.tokenAddresses.call(numTokens - 1);
    expect(actualAddress).to.equal(address);
  });

  it("the fund should be the owner", async () => {
    let address = await tokenFactory.tokenFromSymbol(token.symbol);
    let tokenContract = await ETT.at(address);
    let owner = await tokenContract.owner();
    expect(owner).to.equal(fundAddress);
  });
});
