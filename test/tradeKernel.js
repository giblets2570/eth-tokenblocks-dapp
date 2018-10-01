require('babel-polyfill');
const { 
  encrypt,
  decrypt,
  decryptMessage,
  createBundle,
  formatPublicBundle,
  sendMessage,
  receiveMessage,
  saveBundle,
  loadBundle,
  joinKeysInto1,
  splitKeyInto2,
  getSharedSecret,
  makeNbytes
} = require('../src/utils/encrypt');

const abi = require('ethereumjs-abi');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const TokenFactory = artifacts.require("./TokenFactory.sol");
const TradeKernel = artifacts.require("./TradeKernel.sol");
const Permissions = artifacts.require("./Permissions.sol");
const ETT = artifacts.require("./ETT.sol");
const defaultAddress = "0x0000000000000000000000000000000000000000"

const moment = require('moment');

let createTrade = async (investorBundle, brokerBundle, token, broker, investor, amount, price, salt, tradeKernel) => {
  // console.log(investorBundle, brokerBundle, token, broker, investor, amount, price, salt, tradeKernelAddress);
  // console.log(investorBundle, brokerBundle, amount)
  let amountMessage = await sendMessage(investorBundle, brokerBundle, amount);
  let {ik, ek, sk} = amountMessage
  let priceEncrypted = encrypt(price, sk)

  let priceDecrypted = decrypt(priceEncrypted, sk)
  let executionDateInt = Math.floor(new Date().getTime());
  let trade = [
    [investor, broker, token],
    [makeNbytes(amountMessage.text), makeNbytes(priceEncrypted)],
    [1537052400, 1537135792, salt]
  ];
  console.log(trade)
  let tradeHash = await tradeKernel.getTradeHash(trade[0], trade[1], trade[2]);

  if(tradeHash.substring(0,2) !== '0x') tradeHash = '0x' + tradeHash;
  let signature = await web3.eth.sign(investor, tradeHash);
  let r = signature.substr(0, 66);
  let s = '0x' + signature.substr(66, 64);
  let v = parseInt(signature.substr(130, 2)) + 27;


  let signer = await tradeKernel.recoverSigner(tradeHash, v, r, s);
  if(signer.toLowerCase() !== investor.toLowerCase()) throw {message: "Error"}

  return {trade, tradeHash, r, s, v, sk}
}

let createOrder = async (broker, token, trades, tradeKernel) => {

  let tradeHashes = trades.map((trade) => trade.tradeHash)
  let sks = trades.map((trade) => '0x'+trade.sk)
  let order = [
    [broker, token],
    [100000, 1537128394, 0],
    tradeHashes,
    sks
  ];

  let orderHash = await tradeKernel.getOrderHash(order[0], order[1], order[2]);

  if(orderHash.substring(0,2) !== '0x') orderHash = '0x' + orderHash;
  let signature = web3.eth.sign(broker, orderHash);
  let r = signature.substr(0, 66);
  let s = '0x' + signature.substr(66, 64);
  let v = parseInt(signature.substr(130, 2)) + 27;

  return {order, orderHash, r, s, v}
}


let generateTrades = (investorBundle, broker1PublicBundle, tokenAddress, broker1Address, investorAddress, num=10) => {
  return Array(num).fill().map(() => {
    let amount = (1000000000 * Math.random()).toFixed(2)
    let price = (1000000000 * Math.random()).toFixed(2)
    return [investorBundle, broker1PublicBundle, tokenAddress, broker1Address, investorAddress, amount, price, Math.floor(Math.pow(2,32) * Math.random())]
  })
}

contract('TradeKernel', async (accounts) => {

  let tokenFactory, tradeKernel, tokenAddress, 
      tradeKernelAddress, amount,
      investorBundle, investorPublicBundle, 
      broker1Bundle, broker1PublicBundle, 
      broker2Bundle, broker2PublicBundle,
      invBroker1sk, invBroker2sk,
      permissions, permissionsAddress,
      possibleTrades

  let amounts = [9000,9000,9000,1,9000,9000,1,500]
  let total = amounts.reduce((c, s) => c + s, 0)
  let investorAddress = accounts[1];
  let broker1Address = accounts[2];
  let broker2Address = accounts[3];
  let custodianAddress = accounts[4];
  let fundAddress = accounts[5];
  let fundFee = 25;

  before(async () => {
    amount = `EUR:${100000}`;
    price = `0.03`
    permissions = await Permissions.deployed();
    investorBundle = createBundle(1);
    broker1Bundle = createBundle(2);
    broker2Bundle = createBundle(3);
    investorPublicBundle = formatPublicBundle(investorBundle);
    broker1PublicBundle = formatPublicBundle(broker1Bundle);
    broker2PublicBundle = formatPublicBundle(broker2Bundle);

    // Need to add the investor and broker to the smart contract
    await permissions.setAuthorized(accounts[0], 5, {from: accounts[0]});
    await permissions.setAuthorized(accounts[0], 5, {from: accounts[0]});
    await permissions.setAuthorized(investorAddress, 1, {from: accounts[0]});
    await permissions.setAuthorized(broker1Address, 2, {from: accounts[0]});
    await permissions.setAuthorized(broker2Address, 2, {from: accounts[0]});
    await permissions.setAuthorized(custodianAddress, 3, {from: accounts[0]});

    tradeKernel = await TradeKernel.deployed();
    await permissions.setAuthorized(tradeKernel.address, 6, {from: accounts[0]});
    tokenFactory = await TokenFactory.deployed();
    await permissions.setAuthorized(tokenFactory.address, 6, {from: accounts[0]});
    await tokenFactory.createETT("Verify Token", 3, "VTX", 64800, fundFee, fundAddress, {from: accounts[0]});
    tokenAddress = await tokenFactory.tokenAddresses.call(0);

    possibleTrades = amounts.map((amount) => {
      let price = '0.5'
      let amountString = 'EUR:' + (amount / 100).toFixed(2)
      return [investorBundle, broker1PublicBundle, tokenAddress, broker1Address, investorAddress, amount, price, Math.floor(Math.pow(2,32) * Math.random())]
    })
  });

  it("should be able to create a trade with a broker address", async () => {
    var salt = Math.floor(Math.pow(2,32) * Math.random())
    let {trade, tradeHash, v, r, s} = await createTrade(
      investorBundle, broker1PublicBundle,
      tokenAddress, broker1Address, investorAddress,
      amount, price,
      salt, tradeKernel
    )
    // console.log(trade)
    let signerAddress = await tradeKernel.recoverSigner.call(tradeHash, v, r, s);
    let result = await tradeKernel.confirmTrade(...trade, v, r, s, {from: broker1Address});

    expect(signerAddress).to.equal(investorAddress)
  });
  
  it("should be able to create all trades", async () => {
    // let generated = generateTrades(investorBundle, broker1PublicBundle, tokenAddress, broker1Address, investorAddress, 1)
    // let allTrades = possibleTrades.concat(generated)
    for (let i = 0; i < possibleTrades.length; i++) {
      let t = possibleTrades[i]
      // console.log(t);
      let {trade, tradeHash, v, r, s, sk} = await createTrade(...t, tradeKernel);
      // console.log(trade);
      let result = await tradeKernel.confirmTrade(...trade, v, r, s, {from: broker1Address});
      t.tradeHash = tradeHash;
      t.sk = sk;
    }
  });

  it("should be able to create an order with possible trades", async () => {
    let {order, orderHash, v, r, s} = await createOrder(broker1Address, tokenAddress, possibleTrades, tradeKernel);
    let result = await tradeKernel.verifyOrder(...order, v, r, s, {from: custodianAddress});
  });

  describe("after the tokens have been created", async () => {

    let invested = 1000000
    let token, totalSupply, owner
    before(async () => {
      token = ETT.at(tokenAddress)
      let date = moment().format('YYYY-MM-DD')
      let tx = await token.updateTotalSupply(invested, date, {from: accounts[0]})
      totalSupply = await token.totalSupply.call();
      owner = await token.owner.call();
    })

    it("should have given the fund their fee", async () => {
      let fundBalance = await token.balanceOf.call(fundAddress);
      expect(fundBalance.toNumber()).to.equal(invested + Math.floor(invested * fundFee / 10000));
    })

    it("should be able to move tokens to investor", async () => {
      let i = 0;
      let sentAmount = 0
      for(let _a of amounts) {
        let t = possibleTrades[i];
        i += 1;
        let a = Math.floor(_a  * invested / total);
        sentAmount += a;
        await tradeKernel.distributeTokens(t.tradeHash,t[4],t[2],a,{from: accounts[0]});
      }
      let investorBalance = await token.balanceOf.call(investorAddress);
      expect(investorBalance.toNumber()).to.equal(sentAmount)
    });

  });

});
