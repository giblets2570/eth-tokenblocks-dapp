import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Form,
  Container,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "reactstrap";

import { Button } from "components";
import axios from 'utils/request';
import Auth from 'utils/auth';
import nowLogo from "assets/img/now-logo.png";
import { Redirect } from 'react-router-dom';
import bgImage from "assets/img/bg14.jpg";
import { loadBundle, createBundle, saveBundle, formatPublicBundle } from "utils/encrypt";

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async login() {
    let response = await axios.post(`${process.env.REACT_APP_API_URL}auth/login`,{
      email: this.state.email,
      password: this.state.password
    })
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
    this.setState({ loggedIn: true, user: user })
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
        route = '/investor/trades'
      }else if(this.state.user.role === 'broker'){
        route = '/broker/trades'
      }else if(this.state.user.role === 'custodian'){
        route = '/custodian/orders'
      }
      return <Redirect to={route} />
    }
    return (
      <div>
        <div className="full-page-content">
          <div className="login-page">
            <Container>
              <Col xs={12} md={8} lg={4} className="ml-auto mr-auto">
                <Form>
                  <Card className="card-login card-plain">
                    <CardHeader>
                      <div className="logo-container">
                        <img src={nowLogo} alt="now-logo" />
                      </div>
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
                        color="primary"
                        size="lg"
                        href="#pablo"
                        className="mb-3"
                        onClick={() => this.login()}
                      >
                        Get Started
                      </Button>
                      <div className="pull-left">
                        <h6>
                          <a href="/pages/register-page" className="link footer-link">
                            Create Account
                          </a>
                        </h6>
                      </div>
                      <div className="pull-right">
                        <h6>
                          <a href="#" className="link footer-link">
                            Need Help?
                          </a>
                        </h6>
                      </div>
                    </CardFooter>
                  </Card>
                </Form>
              </Col>
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
