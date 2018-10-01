import moment from "moment";
import React from "react";
import Auth from 'utils/auth'
import { Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle, Row, Col, Table } from "reactstrap";
import CSVReader from "react-csv-reader";
import { PanelHeader, Statistics, Button } from "components";
import Datetime from "react-datetime";
import axios from "utils/request"
import { receiveMessage, getSharedSecret, loadBundle } from 'utils/encrypt'
import web3Service from 'utils/getWeb3'
import {fromRpcSig, bufferToHex} from 'ethereumjs-util'
import promisify from 'tiny-promisify';
import contract from 'truffle-contract';
const emptyString = "0000000000000000000000000000000000000000000000000000000000000000"

class OrderTrades extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      token: {},
      holdings: [],
      trades: [],
      trade: null,
      orderModal: false,
      timestamp: 'none',
      date: moment(),
      totalTradeValue: null,
      executions: [],
      orderHoldings: [],
      user: Auth.user,
      bundle: loadBundle(Auth.getBundle()),
      order: {}
    }
  }
  async componentDidMount(){
    await this.fetchToken();
    await this.getTradeData(this.state.date);
    await this.getOrderData(this.state.date);
    await this.getHoldings();
  }
  async fetchToken() {
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${this.props.tokenId}`);
    this.setState({
      token: response.data
    })
  }
  getHoldings(){
    let totalValue = this.state.totalTradeValue['GBP']
    let orderHoldings = this.state.token.holdings;
    for (let i = 0; i < orderHoldings.length; i++) {
      let holding = orderHoldings[i]
      holding.amount = holding.securityTimestamp.price * holding.securityAmount / totalValue
      holding.direction = holding.amount >= 0 ? 'Buy' : 'Sell'
    }
    this.setState({
      orderHoldings: orderHoldings
    })
  }
  async getTradeData(day) {
    let trades = await axios.get(`${process.env.REACT_APP_API_URL}trades?tokenId=${this.props.tokenId}&executionDate=${day.format('YYYY-MM-DD')}&state=1`)
    trades = trades.data
    trades = trades.map((trade) => {
      trade.executionDate = moment(trade.executionDate)
      trade.createdAt = moment(trade.createdAt*1000)
      let ob = trade.tradeBrokers.find((ob) => ob.brokerId === this.state.user.id);
      let message = {text: ob.nominalAmount,ik: ob.ik,ek: ob.ek}
      let total = receiveMessage(this.state.bundle, message);
      trade.sk = getSharedSecret(this.state.bundle, message);
      let [currency, nominalAmount] = total.split(':');
      trade.currency = currency;
      trade.nominalAmountDecrypted = nominalAmount;
      if(ob.price && ob.price.length && ob.price !== emptyString) {
        message = {text: ob.price,ik: ob.ik,ek: ob.ek}
        trade.priceDecrypted = receiveMessage(this.state.bundle, message);
      }
      trade.state = ob.state
      return trade
    })
    this.setState({
      trades: trades,
      totalTradeValue: this.totalTradeValue(trades)
    })
  }
  async getOrderData(day) {
    try{
      let order = await axios.get(`${process.env.REACT_APP_API_URL}orders?tokenId=${this.props.tokenId}&executionDate=${day.format('YYYY-MM-DD')}&single=1`)
      order = order.data
      this.setState({
        order: order
      })
    }catch(e){

    }
  }
  totalTradeValue(trades){
    let values = trades.reduce((c, trade) => {
      c[trade.currency] = (c[trade.currency]||0) + parseFloat(trade.nominalAmountDecrypted);
      return c;
    }, {});
    return values;
  }
  async handleDayChange(day){
    let date = moment(day)
    this.setState({ 
      date: date
    });
    await this.getTradeData(date);
    await this.getOrderData(date);
    this.getHoldings()
  }
  complete(){
    this.setState({
      uploading: true
    })
    this.uploadOrder(this.state.token, this.state.orderHoldings, this.state.trades)
  }
  async uploadOrder(token, orderHoldings, trades){
    await web3Service.promise
    let web3 = web3Service.instance
    let address = web3.eth.accounts[0];
    if(!address) return alert("Please connect metamask")
    
    const TradeKernelContract = require(`../../${process.env.REACT_APP_CONTRACTS_FOLDER}TradeKernel.json`);
    const tradeKernel = contract(TradeKernelContract);
    tradeKernel.setProvider(web3.currentProvider);
    let tradeKernelInstance = await tradeKernel.deployed();

    let tradeHashes = trades.map((trade) => trade.hash)
    let amount = 100000 // I dunno what this is yet
    let executionDate = moment().format('YYYY-MM-DD')
    let executionDateInt = Math.floor(moment(executionDate).toDate().getTime() / 1000);

    // for (var i = 100 - 1; i >= 0; i--) {
    let salt = Math.floor(Math.pow(2,32) * Math.random())

    let formattedOrder = [
      [this.state.user.address, token.address],
      [amount, executionDateInt, salt],
      tradeHashes
    ]
    let orderHash = await tradeKernelInstance.getOrderHash(formattedOrder[0], formattedOrder[1], formattedOrder[2])
    let signature = await promisify(web3.personal.sign)(orderHash, address)
    let {r, s, v} = fromRpcSig(signature)

    // console.log(this.state.user.address, orderHash, v, r, s);
    let signer = await tradeKernelInstance.recoverSigner(orderHash, v, bufferToHex(r), bufferToHex(s), {from: address});


    let _signer = await promisify(web3.personal.ecRecover)(orderHash, signature)
    if(signer.toLowerCase() === this.state.user.address.toLowerCase()){
      let result = await axios.post(`${process.env.REACT_APP_API_URL}orders`, {
        orderHoldings: orderHoldings,
        trades: trades,
        token: token.id,
        signature: signature,
        salt: salt,
        hash: orderHash,
        amount: amount,
        executionDate: moment(executionDateInt*1000).format('YYYY-MM-DD')
      });
      this.setState({
        order: result.data
      })
    }else{
      console.log("Not valid");
    }
  }
  render(){
    return (
      <div>
        <PanelHeader 
          size="sm" 
          content={
            <div>
              <h1>{this.state.token ? this.state.token.name : 'Loading...'}</h1>
            </div>
          }
        />
        <div className="content">
          <Row>
            <Col xs={12} md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <Row>
                    <Col xs={12} md={6}>
                      <Statistics
                        iconState="primary"
                        icon="ui-2_chat-round"
                        title={
                          this.state.token.name
                          ? this.state.token.name
                          : "Loading..."
                        }
                        subtitle="Name"
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Statistics
                        iconState="primary"
                        icon="ui-2_chat-round"
                        title={
                          this.state.token.symbol
                          ? this.state.token.symbol
                          : 'Loading...' 
                        }
                        subtitle="Symbol"
                      />
                    </Col>
                  </Row>
                  <Row style={{padding: '40px'}}></Row>
                  <Row>
                    <Col xs={12} md={6}>
                      <Datetime
                        timeFormat={false}
                        value={this.state.date}
                        dateFormat="DD/MM/YYYY"
                        onChange={(day) => this.handleDayChange(day)}
                        inputProps={{ placeholder: "Datetime Picker Here" }}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <Statistics
                        iconState="primary"
                        icon="ui-2_chat-round"
                        title={
                          this.state.trades.length 
                        }
                        subtitle="Number of trades"
                      />
                    </Col>
                  </Row>
                  {
                    this.state.trades.length ? 
                    (
                      <Row>
                        <Col xs={12} md={6}>
                          <h3>Total order value</h3>
                          <Table striped>
                            <thead>
                              <tr>
                                <th>Currency</th>
                                <th>Buy</th>
                                <th>Sell</th>
                              </tr>
                            </thead>
                            <tbody>
                            {
                              Object.keys(this.state.totalTradeValue||{}).map((currency, key) => {
                                return (
                                  <tr key={key}>
                                    <td>{currency}</td>
                                    <td>{
                                      this.state.totalTradeValue[currency] >= 0
                                      ? (this.state.totalTradeValue[currency]).toFixed(2)
                                      : (0).toFixed(2)
                                    }</td>
                                    <td>{
                                      this.state.totalTradeValue[currency] < 0
                                      ? (-1 * this.state.totalTradeValue[currency]).toFixed(2)
                                      : (0).toFixed(2)
                                    }</td>
                                  </tr>
                                )
                              })
                            }
                            </tbody>
                          </Table>
                        </Col>
                        <Col xs={12} md={6}>
                          <h3>Order</h3>
                          <Table striped>
                            <thead>
                              <tr>
                                <th>Security</th>
                                <th>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                            {
                              this.state.order.id
                              ? (
                                this.state.order.orderHoldings.map((orderHolding, key) => {
                                  return (
                                    <tr key={key}>
                                      <td>{orderHolding.security.symbol}</td>
                                      <td>{orderHolding.amount.toFixed()}</td>
                                    </tr>
                                  )
                                })
                              )
                              : (
                                this.state.orderHoldings.map((orderHolding, key) => {
                                  return (
                                    <tr key={key}>
                                      <td>{orderHolding.security.symbol}</td>
                                      <td>{orderHolding.amount.toFixed()}</td>
                                    </tr>
                                  )
                                })
                              )
                            }
                            </tbody>
                          </Table>
                          {
                            this.state.order.id
                            ? (<p>
                                Verified by custodian: {
                                  this.state.order.verified
                                  ? <span style={{color: "green"}}>Yes</span>
                                  : <span style={{color: "red"}}>No</span>
                                }
                              </p>)
                            : null
                          }
                          <Button>
                            Download FIX
                          </Button>
                          {
                            this.state.order.id
                            ? (
                              null
                            ) : (
                              <Button onClick={() => this.complete()}>
                                Confirm completion
                              </Button>
                            )
                          }
                        </Col>
                      </Row>
                    ) : null
                  }
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default OrderTrades
