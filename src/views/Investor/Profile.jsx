import React, { Component } from "react";
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
import {PanelHeader, ProfileForm, CurrentLoans, AccountSetup, Button} from "components";
import axios from 'utils/request';

class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: Auth.user
    };
  }
  connectBank(){
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${this.state.user.id}`;
  }
  async useAddress(address) {
    console.log(address)
    let response = await axios.put(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}`, {
      address: address
    })
    Auth.updateUser({
      address: address
    })
    let user = this.state.user
    user.address = address
    this.setState({ user: user })
  }
  render() {
    console.log("Here")
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
          {
            // <Row>
            //   <Col md={12}>
            //     <Card className="card-stats card-raised">
            //       <CardBody>
            //         <CurrentLoans/>
            //       </CardBody>
            //     </Card>
            //   </Col>
            // </Row>
          }
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <p>KYC Checks</p>
                  <Button color='primary' onClick={() => this.connectBank()}>Connect bank account</Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default Profile;
