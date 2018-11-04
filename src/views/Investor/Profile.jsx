import React from "react";
import { Link, Route } from 'react-router-dom';
import {
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Card,
  CardBody
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
  connectBank(){
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${this.state.user.id}`;
  }
  async useAddress(address) {
    try{
      let response = await axios.put(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}`, {
        address: address
      })
      Auth.updateUser({
        address: address
      })
      let user = this.state.user
      user.address = address
      this.setState({ user: user })
    }catch(e){
      console.log(e.Message)
    }
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
                  <ProfileForm user={this.state.user}/>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <AccountSetup {...this.props} useAddress={(address) => this.useAddress(address)}/>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <p>Bank account</p>
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
        </div>
      </div>
    );
  }
}
