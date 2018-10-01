import React, { Component } from 'react'
import moment from 'moment'
import { 
  Modal, Row, Col, Table,
  Grid, ControlLabel,
  FormGroup, FormControl
} from 'reactstrap'
import { Redirect } from 'react-router-dom'
import {Button} from 'components'

class AccountSetup extends Component {
  constructor(props){
    super(props)
    this.currencies = ['GBP', 'EUR', 'USD']
    this.state = {}
    this.civicSip = new window.civic.sip({ appId: 'ABC123' });
  }
  componentDidMount(){
    this.props.getCurrentAddress()
    this.setState({
      isOpen: this.props.match.path === "/dashboard/profile/setup",
      pending: false
    });
  }
  componentWillReceiveProps(nextProps) {
    console.log(this.props)
    console.log("Does this get called?")
    this.setState({
      isOpen: nextProps.match.path === "/dashboard/profile/setup",
    });
    console.log(nextProps)
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  toggle(){
    this.setState({
      toggled: true
    })
  }
  connectBank(){
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${this.props.user.id}`;
  }
  connectCivic(){
    let civicSip = new window.civic.sip({ appId: 'ABC123' });
    civicSip.signup({ style: 'popup', scopeRequest: civicSip.ScopeRequests.BASIC_SIGNUP });

    // Listen for data
    civicSip.on('auth-code-received', function (event) {
      /*
        event: {
          event: "scoperequest:auth-code-received",
          response: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJqdGkiOiI2Y2EwNTEzMi0wYTJmLTQwZjItYTg2Yi03NTkwYmRjYzBmZmUiLCJpYXQiOjE0OTQyMjUxMTkuMTk4LCJleHAiOjE0OTQyMjUyOTkuMTk4LCJpc3MiOiJjaXZpYy1zaXAtaG9zdGVkLXNlcnZpY2UiLCJhdWQiOiJodHRwczovL3BoNHg1ODA4MTUuZXhlY3V0ZS1hcGkudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vZGV2Iiwic3ViIjoiY2l2aWMtc2lwLWhvc3RlZC1zZXJ2aWNlIiwiZGF0YSI6eyJjb2RlVG9rZW4iOiJjY2E3NTE1Ni0wNTY2LTRhNjUtYWZkMi1iOTQzNjc1NDY5NGIifX0.gUGzPPI2Av43t1kVg35diCm4VF9RUCF5d4hfQhcSLFvKC69RamVDYHxPvofyyoTlwZZaX5QI7ATiEMcJOjXRYQ",
          type: "code"
        }
      */

      // encoded JWT Token is sent to the server
      var jwtToken = event.response;

      // Your function to pass JWT token to your server
      // sendAuthCode(jwtToken);
      console.log(jwtToken)
    });

    civicSip.on('user-cancelled', function (event) {
      console.log('user-cancelled')
      /*
        event:
        {
          event: "scoperequest:user-cancelled"
        }
      */
     });

    civicSip.on('read', function (event) {
      console.log('read')
      /*
        event:
        {
          event: "scoperequest:read"
        }
      */
    });

     // Error events.
     civicSip.on('civic-sip-error', function (error) {
        // handle error display if necessary.
        console.log('   Error type = ' + error.type);
        console.log('   Error message = ' + error.message);
     });
  }
  render(){
    console.log("Is me render?")
    let user_address = this.props.user.address ? this.props.user.address.toLowerCase() : null
    let address = this.props.address ? this.props.address.toLowerCase() : null
    if(this.state.toggled) {
      return <Redirect to={this.props.returnTo} />
    }
    return (
      <Modal show={this.state.isOpen} onHide={() => this.toggle()}>
        <Modal.Header closeButton>
          <Modal.Title>Set Up Your Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <Row>
              <Col xs={12} md={12}>
                <h3>Set up ethereum address</h3>
                {
                  this.props.address
                  ? (
                    <div>
                      <p>Address: {this.props.address}</p>
                      {
                        address !== user_address
                        ? <Button bsStyle="info" fill onClick={() => this.props.useAddress(this.props.address)}>Use address</Button>
                        : <small>You've set up your ethereum address</small>
                      }
                    </div>
                  )
                  : (
                    <div>
                      <p>Install metamask for ethereum address.</p>
                      <a href='https://metamask.io/' target="_blank">
                        Learn more.  
                      </a>
                    </div>
                  )
                }
              </Col>
              <Col xs={12} md={12}>
                <h3>Set up KYC checks</h3>
                {
                  //<Button bsStyle="info" fill onClick={() => this.connectCivic()}>Log in with Civic</Button>
                }
                <Button bsStyle="info" fill onClick={() => this.connectBank()}>Connect bank account</Button>
                {
                  this.props.user.bankConnected
                  ? (
                      <div>
                        <small>You've connected your bank account</small>
                      </div>
                    )
                  : null 
                }
              </Col>
            </Row>
            <div className="clearfix" />
          </form>
        </Modal.Body>
      </Modal>
    )
      // <Modal.Footer>
      //   <Button onClick={this.props.toggle}>Close</Button>
      // </Modal.Footer>
  }
  
}

export default AccountSetup