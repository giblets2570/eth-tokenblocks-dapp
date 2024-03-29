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
const {fromRpcSig,bufferToHex} = require('ethereumjs-util');
const {makeNbytes,getSharedSecret,formatPublicKey,encrypt,encode,createBundle,loadBundle,saveBundle,formatPublicBundle,formatPrivateKey,sendMessage,verifyPKSig,decrypt,receiveMessage} = require('./src/utils/encrypt');

var accounts;

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
  "OrderHolding",
  "TradeBroker",
  "OrderTrade",
  "`Order`",
  "Trade"
]

let users = require('./users.json');
if(process.env.SEEDALL) {
  tables.push("User");
  tables.push("TokenBalance");
  tables.push("Token");
  tables.push("Fund");
  tables.push("NAVTimestamp");
  tables.push("Dividend");
  tables.push("DividendPayment");
  tables.push("SecurityTimestamp");
  tables.push("Security");
  tables.push("TokenHoldings");
  tables.push("TokenHolding");
}
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
let brokers = [users[1],users[2]];
let investor = users[3];
let custodian = users[4];
let fund = users[5];

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
let funds = require('./funds.json');
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
      let keys = Object.keys(user).filter((key) => key !== 'id' && key !== 'passwordHash')
      keys.push('address')
      let index = keys.indexOf('account');
      if(index >= 0) keys[index] = 'address';
      let values = keys.map((key) => {
        if(key === 'address') return accounts[user.id-1]
        if(key === 'password') return user.passwordHash
        return user[key]
      });
      let sql = "INSERT INTO `User` (" + keys.join(', ') + ") VALUES ('"+ values.join("', '") +"')"
      connection.query(sql, function (error, results, fields) {
        if (error) reject(error);
        resolve(results)
      });
    })
    user.bundle = createBundle(user.id);
    user.savedBundle = saveBundle(user.bundle);
    user.publicBundle = formatPublicBundle(user.bundle);

    let userLoggedin = await login(user.name)

    let response = await rp.put(`${process.env.API_URL}users/${user.id}`,{
      body: {
        ik: user.publicBundle.ik,
        spk: user.publicBundle.spk,
        signature: user.publicBundle.signature
      },
      headers:{Authorization:`Bearer ${userLoggedin.token}`},
      json: true
    })
  }
}
let createFunds = async () => {
  for (var i = 0; i < funds.length; i++) {
    let fund = funds[i]
    fund.tokens = fund.tokens.map((token) => {
      if(token.holdings) {
        token.initialAmount = token.initialAmount * Math.pow(10, token.decimals);
        return token
      }
      let holdings = securities.map((security) => {
        return {
          amount: Math.floor(Math.random() * 1000000),
          ...security
        }
      });
      holdings = chooseRandoms(holdings, 10);
      // I want the NAV to be 100
      // let desiredNav = 10000
      // let aum = holdings.reduce((c, holding) => c + holding.price * holding.amount, 0);
      // token.initialAmount = Math.floor(aum * Math.pow(10, token.decimals) / desiredNav);
      token.holdings = holdings;
      return token
    })

    let options = {
      method: 'POST',
      uri: `${process.env.API_URL}funds`,
      body: fund,
      headers: {
        Authorization: `Bearer ${loggedin.token}`
      },
      json: true
    }
    let response = await rp(options)
  }
}
let createTrades = async (numTrades = 1000) => {
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
    trade = await rp.post(`${process.env.API_URL}trades`, {
      body: trade,
      headers: { Authorization: `Bearer ${investorLoggedin.token}` },
      json: true
    })

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
      [trade.investor.address, accounts[broker.id-1], trade.token.address],
      [makeNbytes(tradeBroker.nominalAmount), makeNbytes(encryptedPrice)],
      [executionDateInt, trade.expirationTimestampInSec, trade.salt]
    ];


    let tradeHash = await tradeKernelInstance.getTradeHash(...formattedTrade, {from: accounts[investor.id-1]});
    // Accept the brokers price as investor
    let signature = await promisify(web3.eth.sign)(accounts[investor.id-1],tradeHash);

    // First, we have to update the update the trade
    // on the server to include this new information
    let response = await rp.put(`${process.env.API_URL}trades/${trade.id}`, {
      body: {
        hash: tradeHash,
        brokerId: broker.id,
        ik: tradeBroker.ik,
        ek: tradeBroker.ek,
        salt: trade.salt,
        nominalAmount: tradeBroker.nominalAmount,
        price: encryptedPrice,
        signature: signature,
      },
      headers:{Authorization:`Bearer ${investorLoggedin.token}`},
      json: true,
    })
    // console.log(response)
    // Confirm trade as broker
    let {r, s, v} = fromRpcSig(signature);
    // console.log(r, s, v)
    result = await tradeKernelInstance.confirmTrade(...formattedTrade, v, bufferToHex(r), bufferToHex(s), {from: accounts[broker.id-1]});
  }
  return tradeKeys
}
let createOrders = async () => {
  console.log("createOrders");
  let brokerLoggedin = brokers.map(async (broker) => {
    return await login(broker.name);
  });
  brokerLoggedin = await Promise.all(brokerLoggedin);
  let brokerBundles = brokers.map((broker) => broker.bundle);

  let promises = brokers.map(async (broker, $index) => {
    for(let tokenId = 1; tokenId <= tokens.length; tokenId++){
      // First need to get the trades for the day
      let day = moment()
      let response = await rp.get(`${process.env.API_URL}trades?tokenId=${tokenId}&executionDate=${day.format('YYYY-MM-DD')}&confirmed=1&page_count=9000000000`, {
        headers:{Authorization:`Bearer ${brokerLoggedin[$index].token}`},
        json: true
      })
      let {data, total} = response
      if(!data.length) continue;
      let trades = data.map((trade) => {
        trade.executionDate = moment(trade.executionDate)
        trade.createdAt = moment(trade.createdAt*1000)
        let ob = trade.tradeBrokers.find((ob) => ob.brokerId === broker.id);
        let message = {text: ob.nominalAmount,ik: ob.ik,ek: ob.ek};
        let total = receiveMessage(brokerBundles[$index], message);
        trade.sk = getSharedSecret(brokerBundles[$index], message);
        // console.log(trade)
        let [currency, nominalAmount] = total.split(':');
        trade.currency = currency;
        trade.nominalAmountDecrypted = (parseInt(nominalAmount)).toFixed(2);
        message = {text: ob.price,ik: ob.ik,ek: ob.ek};
        trade.priceDecrypted = receiveMessage(brokerBundles[$index], message);
        // if(ob.price && ob.price.length && ob.price !== emptyString) {
        // }
        trade.state = ob.state;
        return trade;
      });
      let totalTradeValue = trades.reduce((c, trade) => {
        c[trade.currency] = (c[trade.currency]||0) + parseFloat(trade.nominalAmountDecrypted);
        return c;
      }, {});

      // Get the holdings for the token
      let totalValue = totalTradeValue['GBP']
      let token = await rp.get(`${process.env.API_URL}tokens/${tokenId}`, {
        headers:{Authorization:`Bearer ${brokerLoggedin[$index].token}`},
        json: true
      });
      let orderHoldings = token.holdings;
      let aum = 0
      for (let i = 0; i < orderHoldings.length; i++) {
        let holding = orderHoldings[i];
        aum += (holding.securityTimestamp.price * holding.securityAmount);
      }
      for (let i = 0; i < orderHoldings.length; i++) {
        let holding = orderHoldings[i];
        holding.amount = (totalValue / aum) * holding.securityAmount
        holding.direction = holding.amount >= 0 ? 'Buy' : 'Sell'
      }

      // Create order
      const TradeKernelContract = require(`${process.env.CONTRACTS_FOLDER}TradeKernel.json`);
      const tradeKernel = contract(TradeKernelContract);
      tradeKernel.setProvider(web3.currentProvider);
      let tradeKernelInstance = await tradeKernel.deployed();

      let tradeHashes = trades.map((trade) => trade.hash)

      let amount = 100000 // I dunno what this is yet
      let executionDate = moment().format('YYYY-MM-DD')
      let executionDateInt = Math.floor(moment(executionDate).toDate().getTime() / 1000);

      let salt = Math.floor(Math.pow(2,32) * Math.random())

      let formattedOrder = [
        [accounts[broker.id-1], token.address],
        [amount, executionDateInt, salt],
        tradeHashes
      ]
      let orderHash = await tradeKernelInstance.getOrderHash(formattedOrder[0], formattedOrder[1], formattedOrder[2])
      let signature = await promisify(web3.eth.sign)(accounts[broker.id-1], orderHash)
      let {r, s, v} = fromRpcSig(signature)

      // console.log(this.state.user.address, orderHash, v, r, s);
      let signer = await tradeKernelInstance.recoverSigner(orderHash, v, bufferToHex(r), bufferToHex(s), {from: accounts[broker.id-1]});

      if(signer.toLowerCase() === accounts[broker.id-1].toLowerCase()){
        let result = await rp.post(`${process.env.API_URL}orders`, {
          body: {
            orderHoldings: orderHoldings,
            trades: trades,
            token: token.id,
            signature: signature,
            salt: salt,
            hash: orderHash,
            amount: amount,
            executionDate: moment(executionDateInt*1000).format('YYYY-MM-DD')
          },
          headers:{Authorization:`Bearer ${brokerLoggedin[$index].token}`},
          json: true
        });
      }else{
        console.log("Not valid");
      }

    }
  });
  await Promise.all(promises);
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
      address: accounts[user.id-1]
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

let saveJSON = (data, name) => {
  fs.writeFileSync(`bundles/${name}.json`, JSON.stringify(data));
}

let main = async () => {

  accounts = await promisify(web3.eth.getAccounts)()
  console.log(accounts.length)
  connection.connect();
  await cleanTables();
  if(process.env.SEEDALL) await createUsers();
  loggedin = await login('admin');
  if(process.env.SEEDALL) await createSecurities();
  if(process.env.SEEDALL) await createFunds();
  // loggedin = await login('broker2');
  // let tradeKeys = await createTrades(6);
  // await createOrders();
  connection.end();

  // saveJSON(tradeKeys,'tradeKeys')
  for(let user of users) {
    saveJSON(user.savedBundle,`bundle:${user.id}`)
  }
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
