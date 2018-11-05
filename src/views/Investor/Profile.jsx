import React from "react";
import { Link, Route } from 'react-router-dom';
import {
  Row, Input, Label, Col, FormGroup, ControlLabel,
  FormControl, Card, CardBody
} from "reactstrap";
import Auth from 'utils/auth'
import axios from 'utils/request';

import {
  ChooseAccount,
  PanelHeader,
  ProfileForm,
  CurrentLoans,
  AccountSetup,
  Button
} from "components";

export default class Profile extends React.Component {
  state = {
    user: Auth.user
  }
  componentDidMount(){
    let {addressLine1,addressLine2,city,postcode,country,juristiction} = this.state.user;
    this.setState({addressLine1,addressLine2,city,postcode,country,juristiction});
  }
  connectBank(){
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${this.state.user.id}`;
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  async useId(e){
    e.preventDefault() // Stop form submit
    let {user} = this.state
    try {
      let response = await axios.put(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}`, {
        identity: this.state.id
      });
      Auth.updateUser({ identity: this.state.id });
      let user = this.state.user;
      user.identity = this.state.id;
      this.setState({ user: user });
    } catch(e) {
      console.log(e);
    }
  }
  onChange(e) {
    this.setState({
      id: e.target.files[0].name
    })
  }
  async useAddress(address) {
    try{
      let response = await axios.put(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}`, {
        address: address
      });
      Auth.updateUser({ address: address });
      let user = this.state.user;
      user.address = address;
      this.setState({ user: user });
    }catch(e){
      alert("Ethereum address has already been taken by another user!");
    }
  }
  async saveAddress() {
    let addressDetails = {
      addressLine1: this.state.addressLine1,
      addressLine2: this.state.addressLine2,
      city: this.state.city,
      postcode: this.state.postcode,
      country: this.state.country,
      juristiction: this.state.country
    }
    let response = await axios.put(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}`, addressDetails);
    Auth.updateUser(addressDetails);
    this.setState({ user: Auth.user, updatedAddress: false });
  }
  render() {
    return (
      <div>
        <Route
          path="/investor/profile/setup"
          render={
            (props) => {
              console.log(props)
              return <AccountSetup {...props} returnTo='/investor/profile'/>
            }
          }
        />
        <PanelHeader
            size="sm"
            content={
              <h1></h1>
            }
          />
        <div className="content">
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <h4>Details</h4>
                  <ProfileForm user={this.state.user}/>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <h4>Ethereum address</h4>
                  <AccountSetup {...this.props} useAddress={(address) => this.useAddress(address)}/>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <h4>Bank account</h4>
                  {
                    this.state.user.bankConnected
                      ? <p>Already connected bank</p>
                      : null
                  }
                  <Button
                    round
                    color='primary'
                    onClick={() => this.connectBank()}>
                    {
                        this.state.user.bankConnected
                        ? <span>Connect different bank account</span>
                        : <span>Connect bank account</span>
                    }
                  </Button>
                  <ChooseAccount />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <h4>KYC Checks</h4>
                  <p style={{fontWeight: 700, fontSize: '14px'}}>Address</p>
                  <Row>
                    <Col xs={12} md={4}>
                      <FormGroup>
                        <Label>Line 1: * </Label>
                        <Input
                          type="input"
                          className='form-control'
                          value={this.state.addressLine1}
                          onChange={(e) => {
                            this.setState({ updatedAddress: true});
                            this.handleChange(e, 'addressLine1');
                          }}
                          placeholder="Address line 1..."
                        />
                      </FormGroup>
                    </Col>
                    <Col xs={12} md={4}>
                      <FormGroup>
                        <Label>Line 2: </Label>
                        <Input
                          type="input"
                          className='form-control'
                          value={this.state.addressLine2}
                          onChange={(e) => {
                            this.setState({ updatedAddress: true});
                            this.handleChange(e, 'addressLine2');
                          }}
                          placeholder="Address line 2..."
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={4}>
                      <FormGroup>
                        <Label>City: *</Label>
                        <Input
                          type="input"
                          className='form-control'
                          value={this.state.city}
                          onChange={(e) => {
                            this.setState({ updatedAddress: true});
                            this.handleChange(e, 'city');
                          }}
                          placeholder="City..."
                        />
                      </FormGroup>
                    </Col>
                    <Col xs={12} md={4}>
                      <FormGroup>
                        <Label>Postcode: *</Label>
                        <Input
                          type="input"
                          className='form-control'
                          value={this.state.postcode}
                          onChange={(e) => {
                            this.setState({ updatedAddress: true});
                            this.handleChange(e, 'postcode');
                          }}
                          placeholder="Postcode..."
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={4}>
                      <FormGroup>
                        <Label>Country: *</Label>
                        <Input
                          type="input"
                          className='form-control'
                          value={this.state.country}
                          onChange={(e) => {
                            this.setState({ updatedAddress: true});
                            this.handleChange(e, 'country');
                          }}
                          placeholder="Country..."
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={4}>
                      {
                        this.state.updatedAddress
                        ? (
                          <Button
                            round
                            color="primary"
                            onClick={() => this.saveAddress()}
                            >Save
                          </Button>
                        ): null
                      }
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <small>(* required for trading)</small>
                    </Col>
                  </Row>
                  <br/>
                  <form onSubmit={(e) => this.useId(e)}>
                    <p style={{fontWeight: 700, fontSize: '14px'}}>Upload document</p>
                    <input type="file" onChange={(e) => this.onChange(e)} />
                    {
                      this.state.id
                      ?(
                        <Button
                          round
                          type='submit'
                          color='primary'
                          >
                          Upload
                        </Button>
                      ): null
                    }
                    {
                      this.state.user.identity
                      ? <p>Pending verification...</p>
                      : null
                    }
                  </form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
