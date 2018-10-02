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
    }
  }
  async componentDidMount(){

  }
  choose(key, value){
    console.log(key, value)
    this.setState({
      [key]: value
    })
  }
  handleDayChange(day) {
    this.setState({ 
      inceptionDate: day 
    });
  }
  componentWillReceiveProps(nextProps) {
    
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
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
  makeQuestion(question) {
    return (
      <Row>
        <Col xs={12}>
          <span>{question.question}</span>
          <br/>
          {
            question.values
            .filter((value, key) => {
              if(!question.requirements) return true;
              return question.requirements.values[key].includes(this.state[question.requirements.key])
            })
            .map((value, key) => {
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
  render(){
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this.props.toggle()}
        className="modal-notice"
        size="lg"
      >
        <ModalHeader toggle={() => this.props.toggle()}>
          Create new token
        </ModalHeader>
        <ModalBody>
          <Nav pills className="nav-pills-primary">
            <NavItem>
              <NavLink
                className={this.state.hTabs === "ht1" ? "active" : ""}
                onClick={() => this.setState({ hTabs: "ht1" })}
              >
                Designing the Token
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={this.state.hTabs === "ht2" ? "active" : ""}
                onClick={() => this.setState({ hTabs: "ht2" })}
              >
                Review and Compare Your Options
              </NavLink>
            </NavItem>
            <NavItem>
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
                this.state.questions1.map((question) => this.makeQuestion(question))
              }
            </TabPane>
            <TabPane tabId="ht2">
              {
                this.state.questions2.map((question) => this.makeQuestion(question))
              }
            </TabPane>
            <TabPane tabId="ht3">
              <Form 
                onSubmit={() => this.setState({})}
                className="form-horizontal"
                >
                <Row>
                  <Label md={3}>Fund Name</Label>
                  <Col xs={12} md={9}>
                    <FormGroup>
                      <Input type="text" />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Label md={3}>Fund Issuer</Label>
                  <Col xs={12} md={9}>
                    <FormGroup>
                      <Input type="email" />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Label md={3}>Inception Date</Label>
                  <Col xs={12} md={9}>
                    <Datetime
                      timeFormat={false}
                      onChange={(day) => this.handleDayChange(day)}
                      inputProps={{ placeholder: "Click here to choose date..." }}
                    />
                  </Col>
                </Row>
                <Button
                  color="primary"
                  type="submit"
                  >
                  Submit
                </Button>
              </Form>
            </TabPane>
          </TabContent>
          <div className="clearfix" />
        </ModalBody>
        <ModalFooter className="justify-content-center">
          {this.showButton()}
        </ModalFooter>
      </Modal>
    )
  }
  
}

export default CreateToken