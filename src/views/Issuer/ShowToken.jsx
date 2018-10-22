import React from 'react';
import {
  Modal, ModalBody, ModalFooter, Label,
  ModalHeader, Row, Col, FormGroup,
  Nav, NavItem, NavLink, Input,
  TabContent, TabPane, Table
} from 'reactstrap';

import { Accounts, Button } from 'components';
import axios from 'utils/request';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import Auth from 'utils/auth';
import promisify from 'tiny-promisify';

const chartsBar = {
  data: {
    labels: [
      "January",
      "February",
      "March",
      "April",
      "May"
    ],
    datasets: [
      {
        backgroundColor: "#5f236e",
        data: [40, 26, 28, 45, 20]
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    tooltips: {
      bodySpacing: 4,
      mode: "nearest",
      intersect: 0,
      position: "nearest",
      xPadding: 10,
      yPadding: 10,
      caretPadding: 10
    },
    layout: {
      padding: { left: 0, right: 0, top: 15, bottom: 15 }
    }
  }
};

class ShowToken extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      fund: {},
      hTabs: "ht1",
      user: Auth.user,
      token: {},
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
        return token;
      })
      this.setState({
        fund: data,
        token: data.tokens[0],
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
    this.setState({
      token: this.state.fund.tokens.find((t) => String(t.id) === e.target.value)
    })
  }
  render(){
    if(this.state.toggled) {
      return <Redirect to={this.props.returnTo} />
    }
    return (
      <div>
        <Nav pills className="nav-pills-primary">
          <NavItem style={{cursor: 'pointer'}} id="DesigningToken">
            <NavLink
              className={this.state.hTabs === "ht1" ? "active" : ""}
              onClick={() => this.setState({ hTabs: "ht1" })}
              id="DesigningToken"
            >
              Fund details
            </NavLink>
          </NavItem>
          <NavItem style={{cursor: 'pointer'}} id="ReviewOptions">
            <NavLink
              className={this.state.hTabs === "ht2" ? "active" : ""}
              onClick={() => this.setState({ hTabs: "ht2" })}
            >
              Shareholders
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
                        <td>{token.fee}</td>
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
                  <th>Share class</th>
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
              {
                (this.state.fund.tokens||[])
                .map((token,key) => <option key={key} value={token.id}>{token.symbol}</option>)
              }
            </Input>
            <Accounts token={this.state.token} />
          </TabPane>
        </TabContent>
      </div>
    )
  }
}

export default ShowToken
