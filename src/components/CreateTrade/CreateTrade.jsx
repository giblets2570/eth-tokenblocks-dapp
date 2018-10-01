import React, { Component } from 'react'
import moment from 'moment'
import Select from "react-select";
import { 
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row, Col, Table,
  Label,
  FormGroup, Input, Button
} from 'reactstrap'

import { Instructions, Checkbox } from "components";
import axios from 'utils/request'
import { subscribeOnce } from 'utils/socket'
import { Redirect } from 'react-router-dom'
// react plugin used to create datetimepicker
import Datetime from "react-datetime";
import img1 from "assets/img/bg1.jpg";
import img2 from "assets/img/bg3.jpg";
import {loadBundle, sendMessage} from 'utils/encrypt';
import Auth from 'utils/auth';

async function createTrade(brokers, token, executionDate, amount) {
  let user = JSON.parse(localStorage.getItem('user'))
  let bundle = JSON.parse(localStorage.getItem(`bundle:${user.id}`))
  let investorBundle = loadBundle(bundle)
  let promises = brokers.map(async (broker) => {
    let response = await axios.get(`${process.env.REACT_APP_API_URL}users/${broker.id}/bundle`)
    return response.data
  })
  let brokerPublicBundles = await Promise.all(promises);

  // Create the trade, and make it readable by each broker
  let executionDateInt = Math.floor(executionDate.toDate().getTime() / 1000);
  let salt = Math.floor(Math.pow(2,32) * Math.random())
  let trade = {
    investorId: user.id,
    tokenId: token.id,
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
    let {ik, ek, sk, text} = sendMessage(investorBundle, brokerPublicBundle, `${amount}`);
    trade.brokers.push(brokers[i].id);
    trade.iks.push(ik);
    trade.eks.push(ek);

    trade.nominalAmounts.push(text);

    // Save the secret keys for decryption later
    let tradeKeys = JSON.parse(localStorage.getItem('tradeKeys')) || {};
    tradeKeys[`${token.id}:${brokers[i].id}:${salt}`] = sk;
    localStorage.setItem('tradeKeys', JSON.stringify(tradeKeys));
  }
  let response = await axios.post(`${process.env.REACT_APP_API_URL}trades`, trade)
  let newTrade = response.data
  return newTrade
}

class CreateTrade extends Component {
  constructor(props){
    super(props)
    this.currencies = ['GBP', 'EUR', 'USD']
    this.state = {
      toggled: false,
      amount: '0',
      collateralAmount: '',
      token: {},
      dropdownOpen: false,
      buySell: 'Buy',
      collateral: 'Fiat',
      currency: this.currencies[0],
      status: 0,
      brokers: [],
      executionDate: moment(),
      minDate: moment()
    }
  }
  async componentDidMount(){
    this.setState({
      redirect: false
    })
    if(
      moment().hours() > this.props.token.cutoff_time_hours  ||
      (moment().hours() === this.props.token.cutoff_time_hours && moment().minutes() >= this.props.token.cutoff_time_minutes)
    ){
      this.setState({ 
        minDate: moment().add(1, 'day'), 
        executionDate: moment().add(1, 'day')  
      })
    }
    let response = await axios.get(`${process.env.REACT_APP_API_URL}users?role=broker`);
    this.setState({ brokers: response.data })
  }
  handleDayChange(day) {
    this.setState({ 
      executionDate: day 
    });
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.token){
      if(
        moment().hours() > nextProps.token.cutoff_time_hours  ||
        (moment().hours() === nextProps.token.cutoff_time_hours && moment().minutes() >= nextProps.token.cutoff_time_minutes)
      ){
        this.setState({ 
          minDate: moment().add(1, 'day'), 
          executionDate: moment().add(1, 'day')  
        })
      }
    }
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  async create(e){
    e.preventDefault()
    let currency = this.state.currency.value
    let buySell = this.state.buySell.value
    let collateral = this.state.collateral.value
    let amount = `${this.state.amount}`;
    if(buySell === 'Sell'){
      amount = '-' + amount;
    }
    amount = currency + ':' + amount
    let brokers = this.state.brokers.filter((b) => b.checked)
    if(!brokers.length) {
      alert("Requires broker to create a trade");
      return
    }
    this.setState({ status: 1 })
    let newTrade = await createTrade(brokers, this.props.token, this.state.executionDate, amount);
    console.log(newTrade)
    this.setState({ newTrade: newTrade })
  }
  toggleBuySell() {
    this.setState({
      dropdownBuySellOpen: !this.state.dropdownBuySellOpen
    });
  }
  toggleCurrency() {
    this.setState({
      dropdownCurrencyOpen: !this.state.dropdownCurrencyOpen
    });
  }
  setBuySell(buySell){
    this.setState({
      buySell: buySell
    });
  }
  setCurrency(currency){
    this.setState({
      currency: currency
    });
  }
  toggle(broker){
    let brokers = this.state.brokers.map((b) => {
      if(b.id === broker.id) {
        b.checked = !b.checked;
      }
      return b
    })
    this.setState({
      brokers: brokers
    })
  }
  showButton(){
    if(this.state.status === 0){
      return (
        <Button onClick={(event) => this.create(event)} color="info" type="submit">
          Submit
        </Button>
      )
    }else if(this.state.status === 1){
      return (
        <p>Pending...</p>
      )
    }else if(this.state.status === 2){
      return (<p style={{color: 'green'}}>Complete!</p>)
    }
  }
  render(){
    if(this.state.newTrade && this.state.newTrade.id) {
      return <Redirect to={"/investor/trades/"+this.state.newTrade.id} />
    }
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this.props.toggle()}
        className="modal-notice text-center"
      >
        <ModalHeader toggle={() => this.props.toggle()}>
          Create trade for {this.props.token.symbol} tokens
        </ModalHeader>
        <ModalBody>
          <form>
            <Row>
              <Col xs={6}>
                <FormGroup>
                  <Label>Buy/Sell</Label>
                  <Select
                    className="react-select primary"
                    classNamePrefix="react-select"
                    placeholder="Single Select"
                    name="buySell"
                    value={this.state.buySell}
                    options={
                      ['Buy', 'Sell'].map((bs) => ({value: bs, label: bs}))
                    }
                    onChange={(value) =>
                      this.setState({ buySell: value })
                    }
                  />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Label>Amount</Label>
                  <Input
                    rows="5"
                    type="input"
                    className='form-control'
                    value={this.state.amount}
                    onChange={(e) => this.handleChange(e, 'amount')}
                    placeholder="Amount"
                  />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Label>Currency</Label>
                  <Select
                    className="react-select primary"
                    classNamePrefix="react-select"
                    placeholder="Single Select"
                    name="currency"
                    value={this.state.currency}
                    options={
                      this.currencies.map((currency) => ({value: currency, label: currency}))
                    }
                    onChange={(value) =>
                      this.setState({ currency: value })
                    }
                  />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Label>Execution date</Label>
                  <Datetime
                    timeFormat={false}
                    onChange={(day) => this.handleDayChange(day)}
                    inputProps={{ placeholder: "Datetime Picker Here" }}
                  />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Label>Collateral Method</Label>
                  <Select
                    className="react-select primary"
                    classNamePrefix="react-select"
                    placeholder="Single Select"
                    name="collateral"
                    value={this.state.collateral}
                    options={
                      ['Fiat', 'Ethereum'].map((collateral) => ({value: collateral, label: collateral}))
                    }
                    onChange={(value) =>
                      this.setState({ collateral: value })
                    }
                  />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Label>Collateral Amount</Label>
                  <div className='form-control'>{parseFloat(this.state.amount || '0')/2}</div>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <FormGroup>
                  <Label>Brokers</Label>
                  <Table>
                    <tbody>
                      {
                        this.state.brokers.map((broker, index) => {
                          let number = "checkbox" + index;
                          return ( 
                            <tr key={index} className='pointer'>
                              <td>
                                <Checkbox
                                  inputProps={{
                                    onClick: () => this.toggle(broker)
                                  }}
                                />
                              </td>
                              <td> {broker.name} </td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </Table>
                </FormGroup>
              </Col>
            </Row>
            <div className="clearfix" />
          </form>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          {this.showButton()}
        </ModalFooter>
      </Modal>
    )
  }
  
}

export default CreateTrade