import React from 'react';
import {Button} from 'components';
import Auth from 'utils/auth';
import axios from 'utils/request';
import web3Service from 'utils/getWeb3';
import {
  Container,
  Col,
  Row,
  Form,
  CardHeader,
  CardBody,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Card,
  Input,
  CardFooter,
  CardTitle
} from 'reactstrap';
import bgImage from "assets/img/background.webp";
import {Redirect, Link} from 'react-router-dom';

export default class DLTSetup extends React.Component {
  state = {
    web3: null,
    user: Auth.user
  };
  async componentDidMount(){
    await web3Service.promise
    let web3 = web3Service.instance
    this.setState({ web3: web3 });
    web3.eth.getAccounts((err, accounts) => this.setState({
      account: accounts[0] ? accounts[0].toLowerCase() : null
    }))
  }
  async saveAddress(address){
    await axios.put(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}`, {
      address: address
    });
    let { user } = this.state;
    user.address = address;
    Auth.updateUser(user);
    this.setState({ user: user });
  }
  nextPage(){
    this.setState({ redirect: true });
  }
  render(){
    if(this.state.redirect) {
      return <Redirect to='/investor/funds'/>
    }
    let { user, web3 } = this.state;
    let userAddress = user && user.address ? user.address.toLowerCase() : null
    return (
      <div>
        <div>
          <div className="full-page-content">
            <div className="login-page">
              <Container>
                <Col xs={12} md={8} lg={6} className="ml-auto mr-auto">
                  <Form onSubmit={(e) => this.login(e)}>
                    <Card>
                      <CardHeader>
                        <CardTitle tag="h4">
                          Set up DLT
                        </CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Container>
                          <Row>
                            <Col>
                              {
                                web3 ? null : <p>Loading...</p>
                              }
                              {
                                this.state.account
                                ? (
                                  <div>
                                    <p>Current Address: {this.state.account}</p>
                                    {
                                      userAddress === this.state.account
                                      ? (<p>DLT account set up</p>)
                                      : (
                                          <Button
                                            block
                                            round
                                            color="primary"
                                            onClick={() => this.saveAddress(this.state.account)}>
                                            Use this address?
                                          </Button>
                                        )
                                    }
                                  </div>
                                )
                                : (
                                  <div>
                                    <p>Please set up ethereum client</p>
                                  </div>
                                )
                              }
                            </Col>
                          </Row>
                        </Container>
                      </CardBody>
                      <CardFooter>
                        {
                          userAddress === this.state.account
                          ? (
                            <Button
                              block
                              round
                              type='submit'
                              color="primary"
                              size="lg"
                              className="mb-3"
                              onClick={() => this.nextPage()}
                              >
                              Continue {"     "} <i className={"now-ui-icons arrows-1_minimal-right"} />
                            </Button>
                          )
                          : null
                        }
                        <Link to={'/investor/funds'} >Skip for now</Link>
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
      </div>
    )
  }
}
