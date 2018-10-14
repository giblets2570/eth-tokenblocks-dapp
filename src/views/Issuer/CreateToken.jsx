import React, { Component } from 'react'
import moment from 'moment'
import Select from "react-select";
import { 
  Modal, Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row, Col, Table,
  Label, UncontrolledTooltip,
  FormGroup, Input, Tooltip,
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

class CreateToken extends Component {
  constructor(props){
    super(props)
    this.state = {
      hTabs: "ht1",
      questions1: questions.questions1,
      questions2: questions.questions2,
      name: '',
      symbol: '',
      decimals: 18,
      initialAmountString: '',
      cutoffTime: 64800,
      fee: 25
    }
  }
  choose(key, value){
    this.setState({
      [key]: value
    }, () => {
      let q1keys = this.state.questions1.map((q)=>q.key);
      let q2keys = this.state.questions2.map((q)=>q.key);
      this.setState({
        q1done: q1keys.every((key) => this.state[key]),
        q2done: q2keys.every((key) => this.state[key])
      })
    });
  }
  handleDayChange(day) {
    this.setState({ 
      inceptionDate: day 
    });
  }
  componentWillReceiveProps(nextProps) {
    setTimeout(() => this.setState({
      tooltipOpen: nextProps.tooltipsOpen && nextProps.isOpen
    }));
  }
  componentDidMount(){
    // this.setState({
    //   tooltipsOpen: this.props.tooltipsOpen
    // })
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  async create(e){
    e.preventDefault()
    this.setState({
      uploading: true
    })
    let token = this.state
    token.initialAmount = parseFloat(this.state.initialAmountString) * Math.pow(10,token.decimals)
    try {
      let response = await axios.post(`${process.env.REACT_APP_API_URL}tokens`, token);
      this.props.toggle()
    }catch(e) {
      console.log(e)
    }
    this.setState({
      uploading: false
    })
  }
  showButton(){
    if(this.state.status === 0){
      return (
        <Button color="info">
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
  handleForce(data){
    let keys = data[0]
    let parsed = data.slice(1).map((line) => {
      let entry = {}
      for(let i = 0; i < keys.length; i++) {
        entry[keys[i]] = line[i]
      }
      entry.amount = parseFloat((entry.amount||'').replace(/,/g,''))
      entry.price = parseFloat((entry.price||'').replace(/,/g,'')) * 100
      return entry
    }).filter((entry) => keys.every((key) => entry[key]))
    console.log(parsed)
    this.setState({
      holdings: parsed
    })
  }
  handleDarkSideForce(data){
    console.log(data)
  }
  makeQuestion(question, key) {
    let values = question.values
      .filter((value, key) => {
        if(!question.requirements) return true;
        return question.requirements.values[key].includes(this.state[question.requirements.key])
      });
    if(!values.length) return null;
    return (
      <Row key={key}>
        <Col xs={12}>
          <span>{question.question}</span>
          <br/>
          {
            values.map((value, key) => {
              return (
                <Button
                  size="sm"
                  key={key}
                  color="primary"
                  simple={this.state[question.key] !== value} 
                  onClick={() => this.choose(question.key,value)}>
                  {value}
                </Button>
              )
            })
          }
        </Col>
      </Row>
    )
  }
  toggle() {
    this.setState({
      tooltipOpen: this.props.tooltipOpen
    });
  }
  render(){
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this.props.toggle()}
        className="modal-notice"
        size="lg"
        fade={false}
      >
        <ModalHeader toggle={() => this.props.toggle()}>
          Create new token
        </ModalHeader>
        <ModalBody>
          <Nav pills className="nav-pills-primary">
            <NavItem style={{cursor: 'pointer'}} id="DesigningToken">
              <NavLink
                className={this.state.hTabs === "ht1" ? "active" : ""}
                onClick={() => this.setState({ hTabs: "ht1" })}
                id="DesigningToken"
              >
                Designing the Token
              </NavLink>
            </NavItem>
            <NavItem style={{cursor: 'pointer'}} id="ReviewOptions">
              <NavLink
                className={this.state.hTabs === "ht2" ? "active" : ""}
                onClick={() => this.setState({ hTabs: "ht2" })}
              >
                Review and Compare Your Options
              </NavLink>
            </NavItem>
            <NavItem style={{cursor: 'pointer'}} id="ConfirmTokenOptions">
              <NavLink
                className={this.state.hTabs === "ht3" ? "active" : ""}
                onClick={() => this.setState({ hTabs: "ht3" })}
              >
                Confirm
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent
            activeTab={this.state.hTabs}
            className="tab-space"
          >
            <TabPane tabId="ht1">
              {
                this.state.questions1.map((question, key) => this.makeQuestion(question, key))
              }
              <Row>
                <Col>
                  {
                    this.state.q1done
                    ? (
                      <Button color="primary" onClick={() => this.setState({ hTabs: "ht2" })}>
                        Next <i className="now-ui-icons arrows-1_minimal-right" />
                      </Button>
                    )
                    : null
                  }
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="ht2">
              {
                this.state.questions2.map((question, key) => this.makeQuestion(question, key))
              }
              <Row>
                <Col>
                  {
                    this.state.q2done
                    ? (
                      <Button color="primary" onClick={() => this.setState({ hTabs: "ht3" })}>
                        Next <i className="now-ui-icons arrows-1_minimal-right" />
                      </Button>
                    )
                    : null
                  }
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="ht3">
              <Form 
                onSubmit={(e) => this.create(e)}
                className="form-horizontal"
                >
                <Row>
                  <Label md={3}>Fund Name</Label>
                  <Col xs={12} md={9}>
                    <FormGroup>
                      <Input type="text" value={this.state.name} onChange={(e) => this.handleChange(e, 'name')}/>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Label md={3}>Fund symbol</Label>
                  <Col xs={12} md={9}>
                    <FormGroup>
                      <Input type="text" value={this.state.symbol} onChange={(e) => this.handleChange(e, 'symbol')}/>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Label md={3}>Fund fee</Label>
                  <Col xs={12} md={9}>
                    <FormGroup>
                      <Input type="number" value={this.state.fee} onChange={(e) => this.handleChange(e, 'fee')}/>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Label md={3}>Initial number of tokens</Label>
                  <Col xs={12} md={9}>
                    <FormGroup>
                      <Input type="number" value={this.state.initialAmountString} onChange={(e) => this.handleChange(e, 'initialAmountString')}/>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={3}></Col>
                  <Col xs={12} md={9}>
                    <CSVReader
                      cssClass="csv-input"
                      label="Upload fund composition"
                      onFileLoaded={(data) => this.handleForce(data)}
                      onError={(data) => this.handleDarkSideForce(data)}
                      inputId="ObiWan"
                    />
                  </Col>
                </Row>
                <Button
                  color="primary"
                  type="submit"
                  disabled={this.state.uploading}
                  >
                  {this.state.uploading ? 'Loading...' : 'Submit'}
                </Button>
              </Form>
            </TabPane>
          </TabContent>
          <div className="clearfix" />
        </ModalBody>
        <ModalFooter className="justify-content-center">
          {this.showButton()}
        </ModalFooter>
        <Tooltip placement="top" isOpen={this.state.tooltipOpen && this.state.hTabs === "ht1"} target="DesigningToken">
          Choose from below the options for your tokens
        </Tooltip>
        <Tooltip placement="top" isOpen={this.state.tooltipOpen && this.state.hTabs === "ht2"} target="ReviewOptions">
          These options are filtered from the previous view
        </Tooltip>
        <Tooltip placement="top" isOpen={this.state.tooltipOpen && this.state.hTabs === "ht3"} target="ConfirmTokenOptions">
          Give your token some final details, upload your tokens holdings and click submit
        </Tooltip>
      </Modal>
    )
  }
  
}

export default CreateToken