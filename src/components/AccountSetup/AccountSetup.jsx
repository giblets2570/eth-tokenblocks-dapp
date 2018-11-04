import React, { Component } from 'react'
import moment from 'moment'
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row, Col, Table,
  Grid, ControlLabel,
  FormGroup, FormControl,
  Tooltip
} from 'reactstrap'
import { Redirect } from 'react-router-dom'
import {Button} from 'components'
import Auth from 'utils/auth'
import web3Service from 'utils/getWeb3'

class AccountSetup extends Component {
  constructor(props){
    super(props)
    this.currencies = ['GBP', 'EUR', 'USD']
    this.state = {
      user: Auth.user,
      currentAddress: "",
      tooltipOpen: false
    }
    this.civicSip = new window.civic.sip({
      appId: 'ABC123'
    });
  }
  async componentDidMount(){
    this.setState({
      isOpen: this.props.match.path === "/investor/profile/setup",
      pending: false
    });
    console.log(this.props.match.path)
    await web3Service.promise
    let web3 = web3Service.instance
    web3.eth.getCoinbase((error, address) => {
      if (error) console.log(error);
      else {
        this.setState({
          currentAddress: address
        })
      }
    })
  }
  componentWillReceiveProps(nextProps) {
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
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${this.state.user.id}`;
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
    let user_address = this.state.user.address ? this.state.user.address.toLowerCase() : null
    let address = this.state.currentAddress ? this.state.currentAddress.toLowerCase() : null
    console.log(user_address, address)
    if(this.state.toggled) {
      return <Redirect to={this.props.returnTo} />
    }
    return (
      <form>
        <Row>
          <Col xs={12} md={12}>
            <p>Set up user address</p>
            <p>Current address: {user_address ? user_address : "None"}</p>
            {
              address
              ? address !== user_address
                ? (
                    <div>
                      <p>Detected local address: {address}</p>
                      <Button
                        round
                        id="MetamaskAddressAdd"
                        color="primary"
                        onClick={() => this.props.useAddress(address)}>
                        Use address
                      </Button>
                    </div>
                  )
                : <small>You've set up your user address</small>
              : (
                <div>
                  <p>Install metamask for user address.</p>
                  <a href='https://metamask.io/' target="_blank">
                    Learn more.
                  </a>
                </div>
              )
            }
          </Col>
        </Row>
        {
          // <Tooltip placement="right" isOpen={this.state.tooltipOpen} target="MetamaskAddressAdd">
          //   Give your token some final details, upload your tokens holdings and click submit
          // </Tooltip>
        }
        <div className="clearfix" />
      </form>
    )
      // <ModalFooter>
      //   <Button onClick={this.props.toggle}>Close</Button>
      // </ModalFooter>
  }

}

export default AccountSetup
