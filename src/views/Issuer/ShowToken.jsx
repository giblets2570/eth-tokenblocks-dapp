import React from 'react';
import {
  Modal, ModalBody, ModalFooter, Label,
  ModalHeader, Row, Col, FormGroup,
  Nav, NavItem, NavLink, Input,
  TabContent, TabPane, Table, Container
} from 'reactstrap';

import { Accounts, Button } from 'components';
import axios from 'utils/request';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import Auth from 'utils/auth';
import promisify from 'tiny-promisify';

class ShowToken extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      fund: {},
      hTabs: "ht2",
      user: Auth.user,
      token: {
        id: -5
      },
      aggregate: true,
      juristictionBar: {
        data: {},
        options: {}
      },
      investorTypeBar: {
        data: {},
        options: {}
      }
    }
  }
  async componentDidMount() {
    if(this.props.match.params.id) {
      this.setState({ isOpen: true });
      let distributionChannels = [{
        name: "Issuer Platform",
        id: 1
      },{
        name: "Tokenblocks Platform",
        id: 2
      },{
        name: "Hargreaves Lansdown",
        id: 3
      },{
        name: "Barclays Stockbrokers",
        id: 4
      },{
        name: "Fidelity FundNetwork",
        id: 5
      }];
      let {data} = await axios.get(`${process.env.REACT_APP_API_URL}funds/${this.props.match.params.id}`);
      data.tokens = data.tokens.map((token, key) => {
        token.distributionChannels = distributionChannels
          .map((d) => d.id)
          .filter((d) => {
            if(d==1) return true
            return d > 1 && (key+d) % 2
          })

        let aum = token.holdings.reduce((c, holding) => c + holding.securityAmount * holding.securityTimestamp.price, 0) / 100.0;
        token.holdings = token.holdings.map((holding) => {
          holding.weight = holding.securityAmount * holding.securityTimestamp.price / (aum)
          return holding
        });

        let nav = aum * Math.pow(10, token.decimals) / token.totalSupply
        token.nav = nav
        return token;
      })
      this.setState({
        fund: data,
        distributionChannels: distributionChannels
      })
    }
  }
  toggle(){
    this.setState({
      toggled: true
    })
  }
  tokenView(e) {
    if(parseInt(e.target.value) === -5) {
      this.setState({
        token: {},
        aggregate: true
      })
    }else{
      this.setState({
        token: this.state.fund.tokens.find((t) => String(t.id) === e.target.value),
        aggregate: false
      })
    }
  }
  handleChange(e, key) {
    this.setState({
      [key]: e.target.value
    })
  }
  render(){
    if(this.state.toggled) {
      return <Redirect to={this.props.returnTo} />
    }
    return (
      <div>
        <Nav pills className="nav-pills-primary">
          <NavItem style={{cursor: 'pointer'}} id="ReviewOptions">
            <NavLink
              className={this.state.hTabs === "ht2" ? "active" : ""}
              onClick={() => this.setState({ hTabs: "ht2" })}
              >
              Shareholders
            </NavLink>
          </NavItem>
          <NavItem style={{cursor: 'pointer'}} id="DesigningToken">
            <NavLink
              className={this.state.hTabs === "ht1" ? "active" : ""}
              onClick={() => this.setState({ hTabs: "ht1" })}
              id="DesigningToken"
            >
              Fund details
            </NavLink>
          </NavItem>
          <NavItem style={{cursor: 'pointer'}} id="ManageFund">
            <NavLink
              className={this.state.hTabs === "ht3" ? "active" : ""}
              onClick={() => this.setState({ hTabs: "ht3" })}
              id="ManageFund"
            >
              Manage fund
            </NavLink>
          </NavItem>
          <NavItem style={{cursor: 'pointer'}} id="FundCharges">
            <NavLink
              className={this.state.hTabs === "ht4" ? "active" : ""}
              onClick={() => this.setState({ hTabs: "ht4" })}
              id="FundCharges"
            >
              Fund charges
            </NavLink>
          </NavItem>
          <NavItem style={{cursor: 'pointer'}} id="ManageIFAs">
            <NavLink
              className={this.state.hTabs === "ht5" ? "active" : ""}
              onClick={() => this.setState({ hTabs: "ht5" })}
              id="ManageIFAs"
            >
              Manage IFAs
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent
          activeTab={this.state.hTabs}
          className="tab-space"
          >
          <TabPane tabId="ht1">
            <Row>
              <Col>
                <h4>Fund name: {this.state.fund.name}</h4>
              </Col>
            </Row>
            <Table responsive>
              <thead>
                <tr className="text-primary">
                  <th>Share class</th>
                  <th>OCF</th>
                  <th>Shares outstanding</th>
                  <th>Currency</th>
                  <th>Minimum order</th>
                  <th>NAV</th>
                  <th>Bid/Offer Spread</th>
                  <th>Price time</th>
                </tr>
              </thead>
              <tbody>
                {
                  (this.state.fund.tokens||[])
                  .map((token, key) => {
                    return (
                      <tr key={key}>
                        <td>{token.symbol}</td>
                        <td>{(token.fee/100).toFixed(2)}%</td>
                        <td>{Math.round(parseFloat(token.totalSupply) / Math.pow(10,18)).toLocaleString()}</td>
                        <td>{"GBp"}</td>
                        <td>£{(token.minimumOrder/100).toLocaleString()}</td>
                        <td>{token.nav.toFixed(2)}</td>
                        <td>{"0.59%"}</td>
                        <td>{"12:30pm"}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
            <Row>
              <Col>
                <h4>Distribution channels</h4>
              </Col>
            </Row>
            <Table responsive>
              <thead>
                <tr className="text-primary">
                  <th style={{width: "180px"}}>Share class</th>
                  {
                    (this.state.distributionChannels||[])
                    .map((channel, key) => {
                      return <th key={key}>{channel.name}</th>
                    })
                  }
                </tr>
              </thead>
              <tbody>
                {
                  (this.state.fund.tokens||[])
                  .map((token, key) => {
                    return (
                      <tr key={key}>
                        <td>{token.symbol}</td>
                        {
                          (this.state.distributionChannels||[])
                          .map((channel, key) => {
                            return (
                              <td key={key}>
                                <FormGroup check>
                                  <Label check>
                                    <Input
                                      checked={
                                        token.distributionChannels.includes(channel.id)
                                      }
                                      type="checkbox"
                                      disabled={true}/>
                                    <span className="form-check-sign" />
                                  </Label>
                                </FormGroup>
                              </td>
                            )
                          })
                        }
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
          </TabPane>
          <TabPane tabId="ht2">
            <Input
              type="select"
              style={{height: '100%'}}
              value={this.state.token.id}
              onChange={(e) => this.tokenView(e)}
              >
              <option value={-5}>All Share Classes</option>
              {
                (this.state.fund.tokens||[])
                .map((token,key) => <option key={key} value={token.id}>{token.symbol}</option>)
              }
            </Input>
            <Accounts aggregate={this.state.aggregate} fund={this.state.fund} token={this.state.token} />
          </TabPane>
          <TabPane tabId="ht3">
            <Container>
              <Row>
                <Col>
                  <h3>Dividends</h3>
                  <Table responsive>
                    <tr>
                      <th>Record date</th>
                      <th>Ex-dividend date</th>
                      <th>Pay date</th>
                      <th>Gross dividend</th>
                      <th>Dividend currency</th>
                    </tr>
                    <tr>
                      <td>18/12/18</td>
                      <td>16/12/18</td>
                      <td>23/12/18</td>
                      <td>0.54</td>
                      <td>GBP</td>
                    </tr>
                  </Table>
                  <Button
                    color="primary"
                    >Upload
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h3>Documents</h3>
                  <Button color="primary">Upload</Button>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h3>Manage notifications</h3>
                  <Col xs={6}>
                    <FormGroup>
                      <Label>Receive trade confirmations by email?</Label>
                      <Input
                        type="text"
                        value={this.state.email}
                        placeholder="Enter receiving email here..."
                        onChange={(e) => {
                          this.setState({
                            updatedEmail: true
                          })
                          this.handleChange(e, 'email')
                        }}
                      />
                      {
                        this.state.updatedEmail
                        ? (
                          <Button
                            color='primary'
                            onClick={() => this.setState({
                              updatedEmail: false
                            })}>
                            Save email
                          </Button>
                        ) : null
                      }
                    </FormGroup>
                  </Col>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h3>Bank account</h3>
                  <Button color='primary'>Set bank account</Button>
                </Col>
              </Row>

            </Container>
          </TabPane>
          <TabPane tabId="ht4">
            <Table responsive>
              <tr>
                <th>Charge type</th>
                <th>Number of events</th>
                <th>Charge per event</th>
                <th>Total charge</th>
              </tr>
              <tr>
                <td>Contract notes</td>
                <td>2</td>
                <td>£800</td>
                <td>£{(1600).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Dividend payments</td>
                <td>6</td>
                <td>£15</td>
                <td>£90</td>
              </tr>
              <tr>
                <td>Document disemination</td>
                <td>57</td>
                <td>£4</td>
                <td>£{(57*4).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Cash reconciliation</td>
                <td>78</td>
                <td>£4.5</td>
                <td>£{(78*4.5).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Emails sent</td>
                <td>45</td>
                <td>£4</td>
                <td>£{(45*4).toLocaleString()}</td>
              </tr>
            </Table>
          </TabPane>
        </TabContent>
      </div>
    )
  }
}

export default ShowToken
