const bluebird = require('bluebird');
const mysql = require('mysql');
const Promise = require("bluebird");
const rp = require('request-promise');
const Web3 = require('web3');
const moment = require('moment');
const fs = require('fs');
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const contract = require('truffle-contract');
const promisify = require('tiny-promisify');
const {fromRpcSig, bufferToHex} = require('ethereumjs-util');
const {makeNbytes,getSharedSecret,formatPublicKey,encrypt,encode,createBundle,loadBundle,saveBundle,formatPublicBundle,formatPrivateKey,sendMessage,verifyPKSig,decrypt} = require('./src/utils/encrypt');
let connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});
const shuffle = _a => {
  let a = _a.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
let chooseRandom = array => array[Math.floor(Math.random()*array.length)]
let chooseRandoms = (array, n) => shuffle(array).slice(0, n)
const tables = [
  "TokenHoldings",
  "TokenHolding",
  "OrderHolding",
  "TradeBroker",
  "OrderTrade",
  "SecurityTimestamp",
  "Security",
  "`Order`",
  "Trade",
  "TokenBalance",
  "Token",
]

let users = [{
  id: 1, name: 'admin', email: 'admin@admin.com', password: 'admin', role: 'admin', account: 0,
  passwordHash: '$pbkdf2-sha256$29000$lfJ.jxGC0HpPidF6r7X2Pg$mnlwqH3CNLooy9q8FI9Jej.ESblTfr7WGzXsKyKAlA4', 
},{
  id: 2, name: 'broker1', email: 'broker1@broker1.com', password: 'broker1', role: 'broker', account: 1,
  passwordHash: '$pbkdf2-sha256$29000$QQghJMQYI.S8V0qJsfYegw$Zxe48f0Uga3nNJRkkvMkX/ULc7AMgn9G3L17ORh6CY4', 
},{
  id: 3, name: 'broker2', email: 'broker2@broker2.com', password: 'broker2', role: 'broker', account: 3,
  passwordHash: '$pbkdf2-sha256$29000$gnCutfa.17pXypmT8r53zg$/qjz8z4q2sXZIy7bAGdGTYunNdgCVtFsGK2TXB74Ntc', 
},{
  id: 4, name: 'investor', email: 'investor@investor.com', password: 'investor', role: 'investor', account: 2,
  passwordHash: '$pbkdf2-sha256$29000$03pPCWHsXWttbY0xJkTonQ$2F7SBshVX/zsRccGWe4PftDe.1DtunTIQgeZl4DnU6I', 
},{
  id: 5, name: 'custodian', email: 'custodian@custodian.com', password: 'custodian', role: 'custodian', account: 5,
  passwordHash: '$pbkdf2-sha256$29000$hxBC6J3TGuO8dy4FQMiZkw$6Gicn.ohOheoFMGsrJvoAg38BMstr8QwCpdk00xzt.k', 
},{
  id: 6, name: 'fund', email: 'fund@fund.com', password: 'fund', role: 'issuer', account: 4,
  passwordHash: '$pbkdf2-sha256$29000$k9IaQ.hdy1nrXYtRivHe2w$81aKj1eGHd9s.YjSINps3dP7P1qHE0h5xMJ8pFagq94', 
}]
if(process.env.SEEDUSER) tables.push('User')
else {
  users = users.map((user) => {
    try{
      user.savedBundle = require(`./bundles/bundle:${user.id}.json`);
      user.bundle = loadBundle(user.savedBundle);
      user.publicBundle = formatPublicBundle(user.bundle);
    }catch(e){
      // console.log(e)
    }
    return user;
  })
}
let brokers = [users[1],users[2]]
let investor = users[3]
let custodian = users[4]
let fund = users[5]
var loggedin = {};
let securities = require('./securities.json')
let createOrderHoldingsString = (_h) => {
  let h = _h.map((__h) => __h.security.symbol).sort()
  let hhash = _h.reduce((cuml, r) => {
    cuml[r.security.symbol] = r.amount
    return cuml
  }, {})
  let holdingsString = JSON.stringify(h.map((__h) => ({symbol: __h, amount: hhash[__h]})));
  return holdingsString;
}
let tokens = [{
  "name": "S&P ETT",
  "symbol": "S&P",
  "decimals": 18,
  "cutoffTime": 64800,
  "fee": 25,
  "owner": fund['address']
},{
  "name": "FTSE 100 ETT",
  "symbol": "FTSE 100",
  "decimals": 18,
  "cutoffTime": 64800,
  "fee": 25,
  "owner": fund['address']
},{
  "name": "SX5E ETT",
  "symbol": "SX5E",
  "decimals": 18,
  "cutoffTime": 64800,
  "fee": 25,
  "owner": fund['address']
}]
let createSecurities = async () => {
  console.log("createSecurities")
  for (var i = 0; i < securities.length; i++) {
    let security = securities[i]
    let options = {
      method: 'POST',
      uri: `${process.env.API_URL}securities`,
      body: security,
      headers: {
        Authorization: `Bearer ${loggedin.token}`
      },
      json: true
    }
    let response = await rp(options)
    let price = Math.floor(Math.random() * 10)
    security.price = price
    await new Promise((resolve, reject) => {
      let sql = "INSERT INTO `SecurityTimestamp` (securityId, price, executionDate) VALUES ('"+ [response.id, price, moment().format("YYYY-MM-DD")].join("', '") +"')"
      connection.query(sql, function (error, results, fields) {
        if (error) reject(error);
        resolve(results)
      });
    })
  }
}
let createUsers = async () => {
  console.log("createUsers")
  for (var i = 0; i < users.length; i++) {
    let user = users[i];
    await new Promise((resolve, reject) => {
      let sql = "INSERT INTO `User` (name, email, password, address, role) VALUES ('"+ [user.name, user.email, user.passwordHash, web3.eth.accounts[user.account], user.role].join("', '") +"')"
      connection.query(sql, function (error, results, fields) {
        if (error) reject(error);
        resolve(results)
      });
    })
    user.bundle = createBundle(user.id);
    user.savedBundle = saveBundle(user.bundle);
    user.publicBundle = formatPublicBundle(user.bundle);
    let options = {
      method: 'PUT',
      uri: `${process.env.API_URL}users/${user.id}`,
      body: {
        ik: user.publicBundle.ik,
        spk: user.publicBundle.spk,
        signature: user.publicBundle.signature
      },
      json: true
    }
    let response = await rp(options)
  }
}
let createTrades = async (numTrades = 10) => {
  console.log("createTrades")
  let tradeKeys = {}

  let currencies = ['GBP'];
  let investorLoggedin = await login('investor')
  let brokerLoggedin = brokers.map(async (broker) => {
    return await login(broker.name)
  })
  brokerLoggedin = await Promise.all(brokerLoggedin)

  const TradeKernelContract = require(`${process.env.CONTRACTS_FOLDER}TradeKernel.json`);
  const tradeKernel = contract(TradeKernelContract);
  tradeKernel.setProvider(web3.currentProvider);

  tradeKernelInstance = await tradeKernel.deployed()

  for (let j = 0; j < numTrades; j++) {
    // Create the trade from the investors side
    let amount = `${chooseRandom(currencies)}:${(Math.random() * 1000000).toFixed(0)}`
    let tokenId = chooseRandom([1,2,3])
    let brokerPublicBundles = brokers.map((broker) => broker.publicBundle);
    let investorBundle = investor.bundle;
    let executionDate = moment();
    let executionDateInt = Math.floor(executionDate.toDate().getTime() / 1000);
    let salt = Math.floor(Math.pow(2,32) * Math.random());
    let trade = {
      investorId: investor.id,
      tokenId: tokenId,
      executionDate: executionDate.format('YYYY-MM-DD'),
      expirationTimestampInSec: executionDateInt,
      salt: salt,
      brokers: [],
      iks: [],
      eks: [],
      nominalAmounts: []
    }
    for (let i = 0; i < brokerPublicBundles.length; i++) {
      let brokerPublicBundle = brokerPublicBundles[i];
      let message = sendMessage(investorBundle, brokerPublicBundle, `${amount}`);
      trade.brokers.push(brokers[i].id);
      trade.iks.push(message.ik);
      trade.eks.push(message.ek);
      if(message.text.slice(0,2)!=='0x') message.text = '0x' + message.text
      trade.nominalAmounts.push(message.text);
      tradeKeys[`${tokenId}:${brokers[i].id}:${salt}`] = message.sk;
    }
    let options = {
      method: 'POST',
      uri: `${process.env.API_URL}trades`,
      body: trade,
      headers: { Authorization: `Bearer ${investorLoggedin.token}` },
      json: true
    };
    trade = await rp(options)

    // Give price as the brokers
    let price = Math.random().toFixed(2)
    let brokerIndex = Math.floor(Math.random()*brokers.length)
    let broker = brokers[brokerIndex];
    trade = await rp.get(`${process.env.API_URL}trades/${trade.id}`,{headers:{Authorization:`Bearer ${brokerLoggedin[brokerIndex].token}`},json: true})
    let tradeBroker = trade.tradeBrokers.find((ob) => ob.broker.id === broker.id);
    let sk = getSharedSecret(broker.bundle, tradeBroker);
    let encryptedPrice = encrypt(`${price}`, sk);
    if(encryptedPrice.slice(0,2) !== '0x') encryptedPrice = '0x' + encryptedPrice;
    let result = await rp.put(`${process.env.API_URL}trades/${trade.id}/set-price`, {
      body:{price: encryptedPrice},
      headers:{Authorization:`Bearer ${brokerLoggedin[brokerIndex].token}`},
      json:true
    });
    
    let formattedTrade = [
      [trade.investor.address, broker.address, trade.token.address], 
      [makeNbytes(tradeBroker.nominalAmount), makeNbytes(encryptedPrice)], 
      [executionDateInt, trade.expirationTimestampInSec, trade.salt]
    ];

    let tradeHash = await tradeKernelInstance.getTradeHash(...formattedTrade, {from: web3.eth.accounts[investor.account]});

    // // Accept the brokers price as investor
    // let signature = await promisify(web3.eth.sign)(web3.eth.accounts[investor.account],tradeHash);

    // // First, we have to update the update the trade
    // // on the server to include this new information
    // let response = await rp.put(`${process.env.API_URL}trades/${trade.id}`, {
    //   body: {
    //     hash: tradeHash,
    //     brokerId: broker.id,
    //     ik: tradeBroker.ik,
    //     ek: tradeBroker.ek,
    //     salt: trade.salt,
    //     nominalAmount: tradeBroker.nominalAmount,
    //     price: encryptedPrice,
    //     signature: signature,
    //   },
    //   headers:{Authorization:`Bearer ${investorLoggedin.token}`},
    //   json: true,
    // })

    // // Confirm trade as broker
    // let {r, s, v} = fromRpcSig(signature);
    // result = await tradeKernelInstance.confirmTrade(...formattedTrade, v, bufferToHex(r), bufferToHex(s), {from: web3.eth.accounts[broker.account]});
    // console.log(result);
  }
  return tradeKeys
}
let createOrders = async () => {
  for(let tokenId = 1; tokenId <= tokens.length; tokenId++){
    // let options = {
    //   method: 'GET',
    //   uri: `${process.env.API_URL}tokens/${tokenId}/holdings`,
    //   headers: { Authorization: `Bearer ${loggedin.token}` },
    //   json: true
    // };
    // let orderHoldings = await rp(options)
    // console.log(orderHoldings)
    // options = {
    //   method: 'GET',
    //   uri: `${process.env.API_URL}trades?tokenId=${tokenId}`,
    //   headers: { Authorization: `Bearer ${loggedin.token}` },
    //   json: true
    // };
    // let orderTrades = await rp(options)
    
    // for (let i = 0; i < orderHoldings.length; i++) {
    //   let holding = orderHoldings[i]
    //   holding.amount = holding.securityTimestamp.price * holding.securityAmount / totalValue
    //   holding.direction = holding.amount >= 0 ? 'Buy' : 'Sell'
    // }
  }
}
let login = async (name) => {
  console.log(`login ${name}`)
  let user = users.find((u) => u.name === name)
  let options = {
    method: 'POST',
    uri: `${process.env.API_URL}auth/login`,
    body: {
      email: user.email,
      password: user.password,
      address: web3.eth.accounts[user.account]
    },
    json: true
  };
  let response = await rp(options)
  return response
}
let cleanTables = async () => {
  console.log("cleanTables")
  await new Promise((resolve, reject) => {
    connection.query(`SET FOREIGN_KEY_CHECKS = 0`, function (error, results, fields) {
      if (error) reject(error);
      resolve(results)
    });
  })
  let promises = tables.map(async (table) => {
    return new Promise((resolve, reject) => {
      connection.query(`TRUNCATE TABLE ${table}`, function (error, results, fields) {
        if (error) reject(error);
        resolve(results)
      });
    })
  });
  await new Promise((resolve, reject) => {
    connection.query(`SET FOREIGN_KEY_CHECKS = 1`, function (error, results, fields) {
      if (error) reject(error);
      resolve(results)
    });
  })
}

let createTokens = async () => {
  for (var i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    let holdings = securities.map((security) => {
      return {
        amount: Math.floor(Math.random() * 1000000),
        ...security
      }
    });
    holdings = chooseRandoms(holdings, 10);
    // I want the NAV to be 100
    let desiredNav = 10000
    let aum = holdings.reduce((c, holding) => c + holding.price * holding.amount, 0);
    token.initialAmount = Math.floor(aum * Math.pow(10,token.decimals) / desiredNav);
    token.holdings = holdings;

    let options = {
      method: 'POST',
      uri: `${process.env.API_URL}tokens`,
      body: token,
      headers: {
        Authorization: `Bearer ${loggedin.token}`
      },
      json: true
    }
    let response = await rp(options)
    token.id = response.id
  }
}

let saveJSON = (data, name) => {
  fs.writeFileSync(`bundles/${name}.json`, JSON.stringify(data));
}

let main = async () => {
  connection.connect();
  await cleanTables();
  if(process.env.SEEDUSER) await createUsers();
  loggedin = await login('admin');
  await createSecurities();
  await createTokens();
  loggedin = await login('broker2');
  let tradeKeys = await createTrades(24);
  await createOrders();
  connection.end();

  saveJSON(tradeKeys,'tradeKeys')
  saveJSON(brokers[0].savedBundle,`bundle:${brokers[0].id}`)
  saveJSON(brokers[1].savedBundle,`bundle:${brokers[1].id}`)
  saveJSON(investor.savedBundle,`bundle:${investor.id}`)
  console.log("Done")
}

main()
.then(() => {
  process.exit()
})
.catch((err) => {
  console.log(err)
  process.exit(1)
})
