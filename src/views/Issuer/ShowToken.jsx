import React from 'react';
import {
  Modal, ModalBody, ModalFooter,
  ModalHeader, Row, Col,
  Nav, NavItem, NavLink,
  TabContent, TabPane, Table
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
      hTabs: "ht1",
      user: Auth.user
    }
  }
  async componentDidMount() {
    if(this.props.match.params.id) {
      this.setState({ isOpen: true });
      let {data} = await axios.get(`${process.env.REACT_APP_API_URL}funds/${this.props.match.params.id}`);
      console.log(data)
      this.setState({ fund: data })
    }
  }
  toggle(){
    this.setState({
      toggled: true
    })
  }
  render(){
    if(this.state.toggled) {
      return <Redirect to={this.props.returnTo} />
    }
    let rows = (this.state.fund.tokens||[])
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
                {rows}
              </tbody>
            </Table>
          </TabPane>
          <TabPane tabId="ht2">
            {
              (this.state.fund.tokens||[])
              .map((token, key) => {
                return (
                  <div key={key}>
                    <h4>{token.symbol}</h4>
                    <Accounts token={token} />
                  </div>
                )
              })
            }
          </TabPane>
        </TabContent>
      </div>
    )
  }
}

export default ShowToken
