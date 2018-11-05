import React from "react";
import {
  Card,CardBody,CardHeader,CardFooter,Form,Container,Col,
  Input,InputGroup,InputGroupAddon,InputGroupText,Row,CardTitle
} from "reactstrap";

import { Button, InfoArea } from "components";
import axios from 'utils/request';
import Auth from 'utils/auth';
import nowLogo from "assets/img/now-logo.png";
import logo from "assets/img/logo.webp";
import { Redirect, Link } from 'react-router-dom';
import bgImage from "assets/img/background.webp";
import { loadBundle, createBundle, saveBundle, formatPublicBundle } from "utils/encrypt";
import NotificationAlert from "react-notification-alert";

class LoginPage extends React.Component {
  state = {};
  notify(message) {
    let options = {
      place: 'bl',
      message: (
        <div>
          {message}
        </div>
      ),
      type: 'info',
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 2
    };
    this.refs.notificationAlert.notificationAlert(options);
  }
  async login(e) {
    e.preventDefault()
    this.setState({
      logging: true
    })
    let response;
    try{
      response = await axios.post(`${process.env.REACT_APP_API_URL}auth/login`,{
        email: this.state.email,
        password: this.state.password
      })
    }catch(e){
      this.setState({
        logging: false
      })
      return this.notify("Wrong email/password")
    }
    let {user, token} = response.data
    Auth.authenticate(user, token);
    if(!(user.ik && user.signature && user.spk)) {
      let bundle;
      if(localStorage.getItem(`bundle:${user.id}`)){
        try{
          let loadedBundle = JSON.parse(localStorage.getItem(`bundle:${user.id}`));
          bundle = loadBundle(loadedBundle)
        }catch(e){
          console.log(e)
        }
      }
      if(!bundle){
        bundle = createBundle(user.id);
        let savedBundle = saveBundle(bundle);
      }

      let publicBundle = formatPublicBundle(bundle);
      let response = await axios.put(`${process.env.REACT_APP_API_URL}users/${user.id}`, {
        ik: publicBundle.ik,
        spk: publicBundle.spk,
        signature: publicBundle.signature
      })
    }else{
      let loadedBundle = JSON.parse(localStorage.getItem(`bundle:${user.id}`))
    }

    this.setState({ user: user }, () => {
      this.setState({ loggedIn: true })
    })
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  render() {
    if(this.state.loggedIn) {
      let route;
      if(this.state.user.role === 'investor'){
        if(!this.state.user.address) {
          route = '/investor/profile'
        }else{
          route = '/investor/trades'
        }
      }else if(this.state.user.role === 'broker'){
        route = '/broker/trades'
      }else if(this.state.user.role === 'custodian'){
        route = '/custodian/orders'
      }else if(this.state.user.role === 'issuer'){
        route = '/issuer/tokens'
      }

      return <Redirect to={route} />
    }
    return (
      <div>
        <div className="full-page-content">
          <div className="login-page">
            <NotificationAlert ref="notificationAlert" />
            <Container>
              <Row className="justify-content-center">
                <Col lg={5} md={8} xs={12} className="mt-5">
                  <InfoArea
                    icon="now-ui-icons business_money-coins"
                    iconColor="primary"
                    title="0 Platform Transaction Fees"
                    titleColor="info"
                    description="Digital shares of funds we work with use a single distributed ledger to transfer ownership. No middle man means no fees - bam."
                  />
                  <InfoArea
                    icon="now-ui-icons business_bank"
                    iconColor="primary"
                    title="Same Funds, Same Protection, Better Performance"
                    titleColor="info"
                    description="Our technology reduces the management costs of the fund. Same fund, different share class, better performance."
                  />
                  <InfoArea
                    icon="now-ui-icons ui-2_like"
                    iconColor="info"
                    title="Mates Rates - Trade digital shares directly with your mates, no spreads"
                    titleColor="info"
                    description="Finally an easily accessible secondary market for mutual funds. Trade whenever with whoever."
                  />
                </Col>
                <Col lg={4} md={8} xs={12}>
                  <Form onSubmit={(e) => this.login(e)}>
                    <Card className="card-login card-plain">
                      <CardHeader className="text-center">
                        <div className="logo-container">
                          <img src={logo} alt="now-logo" />
                        </div>
                        <CardTitle tag="h4">Login</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <InputGroup
                          className={
                            "no-border form-control-lg " +
                            (this.state.emailFocus ? "input-group-focus" : "")
                          }
                          >
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="now-ui-icons users_circle-08" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            type="text"
                            placeholder="Email..."
                            onChange={(e) => this.handleChange(e, 'email')}
                            onFocus={e => this.setState({ emailFocus: true })}
                            onBlur={e => this.setState({ emailFocus: false })}
                            />
                        </InputGroup>
                        <InputGroup
                          className={
                            "no-border form-control-lg " +
                            (this.state.passwordFocus ? "input-group-focus" : "")
                          }
                          >
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="now-ui-icons text_caps-small" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            type="password"
                            placeholder="Password..."
                            onChange={(e) => this.handleChange(e, 'password')}
                            onFocus={e => this.setState({ passwordFocus: true })}
                            onBlur={e => this.setState({ passwordFocus: false })}
                            />
                        </InputGroup>
                      </CardBody>
                      <CardFooter>
                        <Button
                          block
                          round
                          type='submit'
                          color="primary"
                          disabled={this.state.logging}
                          size="lg"
                          className="mb-3"
                        >
                          {
                            this.state.logging
                            ? "Logging in..."
                            : "Get Started"
                          }
                        </Button>
                        <div className="pull-left">
                          <h6>
                            <Link to="/pages/register" className="link footer-link">
                              Create Account
                            </Link>
                          </h6>
                        </div>
                      </CardFooter>
                    </Card>
                  </Form>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
        <div
          className="full-page-background"
          style={{ backgroundImage: "url(" + bgImage + ")" }}
        />
      </div>
    );
  }
}

export default LoginPage;
