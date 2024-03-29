import React from 'react';
import TradeBrokers from 'views/Investor/TradeBrokers';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader, Row, Col
} from 'reactstrap';
import { TradeDetails, Button, GiveQuotes } from 'components';
import axios from 'utils/request';
import { Redirect } from 'react-router-dom';
import { subscribeOnce, subscribe } from 'utils/socket';
import moment from 'moment';
import {decrypt,receiveMessage,loadBundle,getSharedSecret,encrypt,splitKeyInto2,makeNbytes} from 'utils/encrypt';
import web3Service from 'utils/getWeb3';
import contract from 'truffle-contract';
import Auth from 'utils/auth';
import {fromRpcSig, bufferToHex} from 'ethereumjs-util';
import promisify from 'tiny-promisify';
const emptyString = "0000000000000000000000000000000000000000000000000000000000000000";

class ShowTrade extends React.Component {
  state = {trade: {},user: Auth.user};
  async confirmPrice(trade, broker) {
    await web3Service.promise
    let web3 = web3Service.instance
    const TradeKernelContract = require(`../../${process.env.REACT_APP_CONTRACTS_FOLDER}TradeKernel.json`);
    const tradeKernel = contract(TradeKernelContract);
    tradeKernel.setProvider(web3.currentProvider);
    let address = await promisify(web3.eth.getCoinbase)()
    if(!address) return alert("Please connect Metamask")
    let tradeKernelInstance = await tradeKernel.deployed();
    let ob = trade.tradeBrokers.find((_ob) => _ob.brokerId === broker.id)
    let [ik1, ik2] = splitKeyInto2(ob.ik)
    let [ek1, ek2] = splitKeyInto2(ob.ek)
    let executionDateInt = Math.floor(moment(trade.executionDate).toDate().getTime() / 1000)
    let formattedTrade = [
      [trade.investor.address, broker.address, trade.token.address],
      [makeNbytes(ob.nominalAmount), makeNbytes(ob.price)],
      [executionDateInt, trade.expirationTimestampInSec, trade.salt]
    ];
    let tradeHash = await tradeKernelInstance.getTradeHash(...formattedTrade, {from: address});
    let signature = await promisify(web3.eth.personal.sign)(tradeHash, address);
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
    if(
      this.state.user.role === 'broker' ||
      this.state.user.role === 'issuer'
    ){
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
    trade.buySell = 'Buy'
    if(trade.nominalAmountDecrypted) {
      [trade.currency, trade.amount] = trade.nominalAmountDecrypted.split(':');
      if(parseFloat(trade.amount) < 0) {
        trade.buySell = 'Sell';
        trade.amount = trade.amount.substring(1);
      }
      trade.amount = (parseInt(trade.amount) / 100).toFixed(2)
    }
    this.setState({ trade: trade });
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
  async getConfirmations(txHash) {
    try {
      await web3Service.promise
      let web3 = web3Service.instance

      // Get transaction details
      const trx = await web3.eth.getTransaction(txHash)

      // Get current block number
      const currentBlock = await web3.eth.getBlockNumber()

      // When transaction is unconfirmed, its block number is null.
      // In this case we return 0 as number of confirmations
      return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber
    }
    catch (error) {
      console.log(error)
    }
  }
  async acceptInvestor() {
    await web3Service.promise
    let web3 = web3Service.instance
    this.setState({ pending: true });
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
    this.setState({ acceptingInvestor: true })
    let transaction = await tradeKernelInstance.confirmTrade(...formattedTrade, v, bufferToHex(r), bufferToHex(s), {from: address});

    let result = await axios.put(`${process.env.REACT_APP_API_URL}trades/${this.state.trade.id}`, {
      txHash: transaction.tx
    });
    this.setState({ acceptingInvestor: false })

    // subscribeOnce(`trade-broker-confirm:${this.state.trade.id}`, () => {
    //   this.getTrade();
    // })
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
    if(this.state.trade.state <= 1) {
      return (
        <Button
          color="danger"
          onClick={() => this.cancel()}>
          {this.state.user.role === 'investor' ? 'Cancel' : 'Reject'}
        </Button>
      )
    } else if(this.state.trade.state === 2) {

    } else if(this.state.trade.state === 3) {
      return (
        <p style={{color: 'red', textAlign: 'center'}}>Trade cancelled by investor</p>
      )
    } else if(this.state.trade.state === 4) {
      return (
        <p style={{color: 'red', textAlign: 'center'}}>Trade cancelled by broker</p>
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
    if(
      this.state.user.role === 'broker' ||
      this.state.user.role === 'issuer'
    ){
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
      if(this.state.trade.state === 0 && !this.state.trade.txHash) {
        if(this.state.acceptingInvestor){
          return (
            <div>
              <p style={{textAlign: 'center'}}>
                Investor has accepted your quote: <span style={{color: 'green'}}>{this.state.trade.priceDecrypted}</span><br/>
                <span style={{color: 'green'}}>Pending...</span>
              </p>
            </div>
          )
        }else{
          return (
            <div>
              <p style={{textAlign: 'center'}}>
                Investor has accepted your quote: <span style={{color: 'green'}}>{this.state.trade.priceDecrypted}</span>
              </p>
              <Button
                color="success"
                onClick={() => this.acceptInvestor()}>
                Confirm Trade
              </Button>
            </div>
          )
        }
      }
      if(this.state.trade.state === 0 && this.state.trade.txHash) {
        return (
          <div>
            <h4 style={{textAlign: 'center'}}>Your quoted price: <span style={{color: 'green'}}>{this.state.trade.priceDecrypted}</span></h4>
            <h5 style={{textAlign: 'center'}}>Accepted</h5>
          </div>
        )
      }
      return (
        <div>
          <h4 style={{textAlign: 'center'}}>Your quoted price: <span style={{color: 'green'}}>{this.state.trade.priceDecrypted}</span></h4>
          <h5 style={{textAlign: 'center'}}>Accepted</h5>
        </div>
      )
    }else {
      return (
        <TradeBrokers
          trade={this.state.trade}
          confirmPrice={(trade, price) => this.confirmPrice(trade, price)}
        />
      );
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
          <TradeDetails trade={this.state.trade}/>
          <Row>
            <Col>
              {this.stateShow()}
            </Col>
          </Row>
          {
            this.state.trade.state < 3
            ? (
              <Row>
                <Col>
                  {this.roleShow()}
                </Col>
              </Row>
            ): null
          }
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </Modal>
    )
  }
}

export default ShowTrade
