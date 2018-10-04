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

class Profile extends Component {
  connectBank(){
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${Auth.user.id}`;
  }
  render() {
    return (
      <div>
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
                  <ProfileForm/>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <CurrentLoans/>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <Button color='primary' onClick={() => this.connectBank()}>Connect bank account</Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Route 
            path="/dashboard/profile/setup" 
            render={
              (props) => <AccountSetup {...props} returnTo='/dashboard/profile'/>
            }
          />
        </div>
      </div>
    );
  }
}

export default Profile;
