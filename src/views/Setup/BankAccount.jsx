import React from 'react';
import {Button,ChooseAccount} from 'components';
import Auth from 'utils/auth';
import axios from 'utils/request';
import bgImage from 'assets/img/background.webp';
import {Redirect, Link} from 'react-router-dom';
import {
  Container,Col,Row,Form,CardHeader,CardBody,InputGroup,
  InputGroupAddon,InputGroupText,Card,Input,CardFooter,CardTitle
} from 'reactstrap';

export default class BankAccount extends React.Component {
  state = {user: Auth.user}
  setupBankAccount(){
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${this.state.user.id}`;
  }
  async componentDidMount(){
    let {data} = await axios.get(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}`);
    Auth.updateUser(data);
    this.setState({
      user: data
    })
  }
  setAccount(account){
    let {user} = this.state;
    user.truelayerAccountId = account.account_id;
    this.setState({ user: user })
  }
  nextPage(){
    this.setState({
      redirect: true
    })
  }
  connectBank(){
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${this.state.user.id}`;
  }
  render(){
    if(this.state.redirect) {
      return <Redirect to='/setup/dlt-setup'/>
    }
    let { user } = this.state;
    return (
      <div>
        <div>
          <div className="full-page-content">
            <div className="login-page">
              <Container>
                <Col xs={12} md={10} lg={8} className="ml-auto mr-auto">
                  <Form onSubmit={(e) => this.login(e)}>
                    <Card>
                      <CardHeader>
                        <CardTitle tag="h4">
                          Set up bank account
                        </CardTitle>
                      </CardHeader>
                      <CardBody>
                        <Container>
                          <Row>
                            <Col>
                              {
                                user.bankConnected
                                ? (
                                  <div>
                                    Connected bank
                                  </div>
                                )
                                : null
                              }
                              <Button
                                round
                                color='primary'
                                onClick={() => this.connectBank()}>
                                {
                                  user.bankConnected
                                  ? <span>Connect different bank account</span>
                                  : <span>Connect bank account</span>
                                }
                              </Button>
                              {
                                user.bankConnected
                                ? <ChooseAccount setAccount={(account) => this.setAccount(account)}/>
                                : null
                              }
                            </Col>
                          </Row>
                        </Container>
                      </CardBody>
                      <CardFooter>
                        {
                          user.bankConnected && user.truelayerAccountId
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
