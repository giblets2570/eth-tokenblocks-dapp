import React, { Component } from 'react'
import moment from 'moment'
import Select from "react-select";
import {
  Modal, Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row, Col, Table,
  Label,
  FormGroup, Input,
  Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap'

import CSVReader from "react-csv-reader";

import { Instructions, Checkbox, Button } from "components";
import axios from 'utils/request'
import { subscribeOnce } from 'utils/socket'
import { Redirect } from 'react-router-dom'
// react plugin used to create datetimepicker
import Datetime from "react-datetime";
import img1 from "assets/img/bg1.jpg";
import img2 from "assets/img/bg3.jpg";
import {loadBundle, sendMessage} from 'utils/encrypt';
import Auth from 'utils/auth';
import questions from 'views/Issuer/TokenQuestions'

class RegCheck extends Component {
  constructor(props){
    super(props)
    this.state = {
      holdings: []
    }
  }
  async componentDidMount(){

  }
  choose(key, value){
    this.setState({
      [key]: value
    })
  }
  handleDayChange(day) {
    this.setState({
      inceptionDate: day
    });
  }
  async componentWillReceiveProps(nextProps) {
    if(nextProps.isOpen && nextProps.token.id) {
      let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${nextProps.token.id}/holdings`);
      let holdings = response.data
      this.setState({ holdings: holdings })
    }else{
      this.setState({ holdings: [] })
    }
  }
  isCompliant() {
    if(!this.state.holdings.length) return 'Loading...';
    let aum = this.state.holdings.reduce((c, holding) => c + holding.securityAmount * holding.securityTimestamp.price, 0);
    this.state.holdings = this.state.holdings.map((holding) => {
      holding.weight = holding.securityAmount * holding.securityTimestamp.price / aum
      return holding
    })
    if(!this.state.holdings.every((holding) => !(holding.security.class === 'Equity' && holding.weight >= 0.20))){
      return <span style={{color: 'red'}}>Holding with over 20% in fund</span>
    }
    return <span style={{color: 'green'}}>Compliant</span>
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  below20(){
    if(!this.state.holdings.length) return 'Loading...';
    let aum = this.state.holdings.reduce((c, holding) => c + holding.securityAmount * holding.securityTimestamp.price, 0);
    this.state.holdings = this.state.holdings.map((holding) => {
      holding.weight = holding.securityAmount * holding.securityTimestamp.price / aum
      return holding
    })
    if(!this.state.holdings.every((holding) => !(holding.security.class === 'Equity' && holding.weight >= 0.20))){
      return <span style={{color: 'red'}}>No</span>
    }
    return <span style={{color: 'green'}}>Yes</span>
  }
  qualifying(){
    if(!this.state.holdings.length) return 'Loading...';
    for(let holding of this.state.holdings) {
      if(!['Equity','Cash'].includes(holding.security.class)){
        <span style={{color: 'red'}}>No</span>
      }
    }
    return <span style={{color: 'green'}}>Yes</span>
  }
  render(){
    let regulationRows = [{
      name: 'Single issuer exposure below 20%',
      result: this.below20()
    },{
      name: 'All securities are UCITS qualifying investments',
      result: this.qualifying()
    }].map((row, key) => {
      return (
        <tr key={key}>
          <td>{row.name}</td>
          <td>{row.result}</td>
        </tr>
      )
    })
    let investorRows = [{
      name: 'All investors are KYC\'d',
      result: <span style={{color: 'green'}}>Yes</span>
    }].map((row, key) => {
      return (
        <tr key={key}>
          <td>{row.name}</td>
          <td>{row.result}</td>
        </tr>
      )
    })
    let accountingRows = [
    ].map((row, key) => {
      return (
        <tr key={key}>
          <td>{row.name}</td>
          <td>{row.result}</td>
        </tr>
      )
    })
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this.props.toggle()}
        className="modal-notice"
        size="lg"
      >
        <ModalHeader toggle={() => this.props.toggle()}>
          Checks for {this.props.fund.name}
        </ModalHeader>
        <ModalBody>
          <h3>Regulation Checks</h3>
          <Table responsive>
            <thead>
              <tr className="text-primary">
                <th>Check</th>
                <th>Compliant</th>
              </tr>
            </thead>
            <tbody>
              {regulationRows}
            </tbody>
          </Table>
          <h3>Investor Checks</h3>
          <Table responsive>
            <thead>
              <tr className="text-primary">
                <th>Check</th>
                <th>Compliant</th>
              </tr>
            </thead>
            <tbody>
              {investorRows}
            </tbody>
          </Table>
          <h3>Accounting Checks</h3>
          <Table responsive>
            <thead>
              <tr className="text-primary">
                <th>Check</th>
                <th>Compliant</th>
              </tr>
            </thead>
            <tbody>
              {accountingRows}
            </tbody>
          </Table>
        </ModalBody>
      </Modal>
    )
  }

}

export default RegCheck
