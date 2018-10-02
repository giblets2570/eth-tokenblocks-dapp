import React from 'react';
import TradeBrokers from 'views/Investor/TradeBrokers';
import { 
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader, Row, Col } from 'reactstrap';
import { Button, GiveQuotes } from 'components';
import axios from 'utils/request';
import { Redirect } from 'react-router-dom';
import { subscribeOnce, subscribe } from 'utils/socket';
import moment from 'moment';
import {decrypt,receiveMessage,loadBundle,getSharedSecret,encrypt,splitKeyInto2,makeNbytes} from 'utils/encrypt';
import web3Service from 'utils/getWeb3';
import contract from 'truffle-contract';
import Auth from 'utils/auth';
import {fromRpcSig, bufferToHex} from 'ethereumjs-util'
import promisify from 'tiny-promisify';
const emptyString = "0000000000000000000000000000000000000000000000000000000000000000";

class ShowTrade extends React.Component {
  constructor(props){
    super(props)
    this.currencies = ['GBP', 'EUR', 'USD']
    this.state = {
      trade: {},
      user: Auth.user
    }
  }
  async confirmPrice(trade, broker) {
    await web3Service.promise
    let web3 = web3Service.instance
    const TradeKernelContract = require(`../../${process.env.REACT_APP_CONTRACTS_FOLDER}TradeKernel.json`);
    const tradeKernel = contract(TradeKernelContract);
    tradeKernel.setProvider(web3.currentProvider);
    let address = await promisify(web3.eth.getCoinbase)()
    let tradeKernelInstance = await tradeKernel.deployed();
    let ob = trade.tradeBrokers.find((_ob) => _ob.brokerId === broker.id)
    let [ik1, ik2] = splitKeyInto2(ob.ik)
    let [ek1, ek2] = splitKeyInto2(ob.ek)
    let executionDateInt = Math.floor(moment(trade.executionDate).toDate().getTime() / 1000)
    
    let formattedTrade = [
      [trade.investor.address, broker.address, trade.token.address], 
      [makeNbytes(trade.nominalAmount), makeNbytes(ob.price)], 
      [executionDateInt, trade.expirationTimestampInSec, trade.salt]
    ];
    let tradeHash = await tradeKernelInstance.getTradeHash(...formattedTrade, {from: address});
    let signature = await promisify(web3.personal.sign)(tradeHash, address);
    let {r, s, v} = fromRpcSig(signature);
    let signer = await tradeKernelInstance.recoverSigner(tradeHash, v, bufferToHex(r), bufferToHex(s), {from: address});
    if(signer.toLowerCase() === trade.investor.address.toLowerCase()){
      // First, we have to update the update the trade
      // on the server to include this new information
      let response = await axios.put(`${process.env.REACT_APP_API_URL}trades/${trade.id}`, {
        hash: tradeHash,
        brokerId: broker.id,
        ik: ob.ik,
        ek: ob.ek,
        salt: trade.salt,
        nominalAmount: ob.nominalAmount,
        price: ob.price,
        signature: signature
      })
    }
  }
  async getTrade(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}trades/${this.props.match.params.id}`);
    let trade = response.data
    trade.executionDate = moment(trade.executionDate)
    if(this.state.user.role === 'broker'){
      let bundle = Auth.getBundle();
      bundle = loadBundle(bundle);
      let ob = trade.tradeBrokers.find((ob) => ob.broker.id === this.state.user.id);
      let message = {text: ob.nominalAmount,ik: ob.ik,ek: ob.ek}
      trade.nominalAmount = ob.nominalAmount
      trade.nominalAmountDecrypted = receiveMessage(bundle, message);
      if(ob.price && ob.price.length && ob.price !== emptyString){
        message = {text: ob.price,ik: ob.ik,ek: ob.ek}
        trade.price = ob.price
        trade.priceDecrypted = receiveMessage(bundle, message);
      }
    }else{
      trade.tradeBrokers = trade.tradeBrokers.map((ob) => {
        let key = `${trade.token.id}:${ob.broker.id}:${trade.salt}`;
        let sk = JSON.parse(localStorage.getItem('tradeKeys'))[key];
        trade.nominalAmountDecrypted = decrypt(ob.nominalAmount, sk);
        trade.nominalAmount = ob.nominalAmount
        if(ob.price && ob.price.length && ob.price !== emptyString) {
          ob.priceDecrypted = decrypt(ob.price, sk);
        }
        return ob
      })
    }
    this.setState({ trade: response.data });
  }
  async componentDidMount() {
    this.setState({
      isOpen: !!this.props.match.params.id,
      pending: false
    });
    this.getTrade();
    subscribe(`trade-update:${this.props.match.params.id}`, () => {
      this.getTrade();
    })
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.for && nextProps.for !== nextProps.trade.id){
      this.props.getTrade(nextProps.for);
    }
  }
  async acceptInvestor() {
    await web3Service.promise
    let web3 = web3Service.instance
    this.setState({
      pending: true
    });
    const TradeKernelContract = require(`../../${process.env.REACT_APP_CONTRACTS_FOLDER}TradeKernel.json`);
    const tradeKernel = contract(TradeKernelContract);
    tradeKernel.setProvider(web3.currentProvider);
    let address = await promisify(web3.eth.getCoinbase)();
    if(!address) return alert("No address")
    let tradeKernelInstance = await tradeKernel.deployed();
    let executionDateInt = Math.floor(moment(this.state.trade.executionDate).toDate().getTime() / 1000)
    let formattedTrade = [
      [
        this.state.trade.investor.address, 
        this.state.trade.broker.address, 
        this.state.trade.token.address
      ], 
      [
        makeNbytes(this.state.trade.nominalAmount), 
        makeNbytes(this.state.trade.price)
      ], 
      [executionDateInt, this.state.trade.expirationTimestampInSec, this.state.trade.salt]
    ];
    let {r, s, v} = fromRpcSig(this.state.trade.signature);
    let signer = await tradeKernelInstance.recoverSigner(this.state.trade.hash, v, bufferToHex(r), bufferToHex(s), {from: address});
    let result = await tradeKernelInstance.confirmTrade(...formattedTrade, v, bufferToHex(r), bufferToHex(s), {from: address});
    subscribeOnce(`trade-broker-confirm:${this.state.trade.id}`, () => {
      this.getTrade();
    })
  }
  async cancel(){
    await web3Service.promise
    let web3 = web3Service.instance
    let {trade} = this.state
    if(trade.state === 0){
      let result = await axios.delete(`${process.env.REACT_APP_API_URL}trades/${trade.id}`);
    } else if(trade.state === 1) { // Already accepted on the blockchain
      const TradeKernelContract = require(`../../${process.env.REACT_APP_CONTRACTS_FOLDER}TradeKernel.json`);
      const tradeKernel = contract(TradeKernelContract);
      tradeKernel.setProvider(web3.currentProvider);
      web3.eth.getCoinbase(async (error, address) => {
        if (error) console.error(error);
        let tradeKernelInstance = await tradeKernel.deployed();
        let executionDateInt = Math.floor(moment(trade.executionDate).toDate().getTime() / 1000)
        let formattedTrade = [
          [trade.investor.address, trade.broker.address, trade.token.address], 
          ['0x'+trade.nominalAmount, '0x'+trade.price], 
          [executionDateInt, trade.expirationTimestampInSec, trade.salt]
        ];
        console.log(formattedTrade)
        let r = trade.signature.substr(0, 66);
        let s = '0x' + trade.signature.substr(66, 64);
        let v = parseInt(trade.signature.substr(130, 2)) + 27;
        let result = await tradeKernelInstance.cancelTrade(...formattedTrade, {from: address});
        // console.log(result);
      })
    }
  }
  stateShow(){
    if(this.state.trade.state === 0 && this.state.user.role === 'investor') {
      return (
        <Button color="info"
          onClick={() => this.cancel()}>
          Cancel
        </Button> 
      )
    } else if(this.state.trade.state === 1) {
      return (
        <Button color="info"
          onClick={() => this.cancel()}>
          {this.state.user.role === 'investor' ? 'Cancel' : 'Reject'}
        </Button> 
      )
    } else if(this.state.trade.state === 2) {

    } else if(this.state.trade.state === 3) {
      return (
        <p style={{color: 'red'}}>Trade cancelled by investor</p>
      )
    } else if(this.state.trade.state === 4) {
      return (
        <p style={{color: 'red'}}>Trade cancelled by broker</p>
      )
    }
  }
  async createQuote(trade, price) {
    let bundle = Auth.getBundle();
    bundle = loadBundle(bundle);
    let tradeBroker = trade.tradeBrokers.find((ob) => ob.broker.id === this.state.user.id);
    let sk = getSharedSecret(bundle, tradeBroker);
    let encryptedPrice = encrypt(`${price}`, sk);
    if(encryptedPrice.slice(0,2) !== '0x') encryptedPrice = '0x' + encryptedPrice;
    let result = await axios.put(`${process.env.REACT_APP_API_URL}trades/${trade.id}/set-price`, {price: encryptedPrice});
  }
  roleShow(){
    if(this.state.user.role === 'broker'){
      let tradeBroker = (this.state.trade.tradeBrokers||[]).find((ob) => ob.broker.id === this.state.user.id)
      if(!tradeBroker) return null;
      if(!this.state.trade.priceDecrypted) {
        return (<GiveQuotes createQuote={(trade, price) => this.createQuote(trade, price)} token={this.state.token} trade={this.state.trade}/>);
      }
      if(!this.state.trade.broker || this.state.trade.broker.id !== tradeBroker.broker.id){
        return (
          <div>
            <h4 style={{textAlign: 'center'}}>Your quoted price: <span style={{color: 'green'}}>{this.state.trade.priceDecrypted}</span></h4>
            <p style={{textAlign: 'center'}}>Waiting for investor to confirm</p>
            <GiveQuotes createQuote={(trade, price) => this.createQuote(trade, price)} token={this.state.token} trade={this.state.trade}/>
          </div>
        )
      }
      if(this.state.trade.state === 0) {
        return (
          <div>
            <p style={{textAlign: 'center'}}>
              Investor has accepted your quote
            </p>
            <Button color="info"
              onClick={() => this.acceptInvestor()}>
              Confirm Trade
            </Button> 
          </div>
        )
      }
      return (
        <div>
          <h4 style={{textAlign: 'center'}}>Your quoted price: <span style={{color: 'green'}}>{this.state.trade.priceDecrypted}</span></h4>
          <h5 style={{textAlign: 'center'}}>Accepted</h5>
        </div>
      )
    }else{
      return (<TradeBrokers trade={this.state.trade} confirmPrice={(trade, price) => this.confirmPrice(trade, price)}  />);
    }
  }
  toggle(){
    this.setState({
      toggled: true
    })
  }
  render(){
    if(this.state.toggled) {
      return <Redirect to={this.props.returnTo} />
    }
    let currency, amount, buySell = 'Buy'
    if(this.state.trade.nominalAmountDecrypted) {
      [currency, amount] = this.state.trade.nominalAmountDecrypted.split(':');
      if(parseFloat(amount) < 0) {
        buySell = 'Sell';
        amount = amount.substring(1);
      }
    }
    return (
      <Modal 
        isOpen={this.state.isOpen}
        toggle={() => this.toggle()}
        fade={false}
        className="modal-notice text-center">
        <ModalHeader toggle={() => this.toggle()}>
          Trade for {
            this.state.trade.token
            ? this.state.trade.token.symbol
            : null
          } tokens
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={6} style={{textAlign: 'center'}}>
              <h4>Buy/Sell</h4>
              <p style={{color: 'green'}}>{buySell}</p>
            </Col>
            <Col xs={6} style={{textAlign: 'center'}}>
              <h4>Amount</h4>
              <p style={{color: 'green'}}>{amount}</p>
            </Col>
            <Col xs={6} style={{textAlign: 'center'}}>
              <h4>Currency</h4>
              <p style={{color: 'green'}}>{currency}</p>
            </Col>
            <Col xs={6} style={{textAlign: 'center'}}>
              <h4>Execution date</h4>
              <p style={{color: 'green'}}>{
                this.state.trade.executionDate
                ? this.state.trade.executionDate.format("DD/MM/YYYY")
                : null
              }</p>
            </Col>
          </Row>
          <Row>
            <Col>
              {this.roleShow()}
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          {this.stateShow()}
        </ModalFooter>
      </Modal>
    )
  }
}
  
export default ShowTrade