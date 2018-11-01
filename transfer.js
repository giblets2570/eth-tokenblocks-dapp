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
let users = require("./users.json");

let login = async (name) => {
  let user = users.find((u) => u.name === name)
  let options = {
    method: 'POST',
    uri: `${process.env.API_URL}auth/login`,
    body: {
      email: user.email,
      password: user.password,
      address: web3.eth.accounts[user.id-1]
    },
    json: true
  };
  let response = await rp(options)
  return response
}
let getTokens = async () => {
  let loggedin = await login("investor");
  let tokens = await rp.get(`${process.env.API_URL}tokens`,{headers:{Authorization:`Bearer ${loggedin.token}`},json: true});
  return tokens;
}
let getContracts = async (tokens) => {
  const ETTContract = require(`${process.env.CONTRACTS_FOLDER}ETT.json`);
  const ett = contract(ETTContract);
  ett.setProvider(web3.currentProvider);
  let tokenContracts = tokens.map(async(token) => {
    return await ett.at(token.address);
  })
  return await Promise.all(tokenContracts)
}

let main = async () => {
  let tokens = await getTokens()
  let contracts = await getContracts(tokens);
  let adminUser = users[0];
  let investorUsers = users.filter((user) => user.name.includes("investor"));

  for(let _contract of contracts) {
    for(let user of users) {
      if(Math.random() < 0.7) continue;
      let amount = Math.round(Math.random() * 145333020 + 1345);
      try {
        let balance = await _contract.balanceOf(web3.eth.accounts[adminUser.id-1], {from: web3.eth.accounts[adminUser.id-1]});
        console.log(balance)
        let result = await _contract.transferFrom(web3.eth.accounts[adminUser.id-1], web3.eth.accounts[user.id-1], amount * Math.pow(10,18), {from: web3.eth.accounts[adminUser.id-1]});
        console.log(result);
      }catch(e){
        console.log(`Failed ${_contract.address}`)
      }
    }
  }
}

main()
// let transfer =
