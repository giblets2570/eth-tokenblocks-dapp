import React from 'react';
import {
  Modal, ModalBody, ModalFooter, Label,
  ModalHeader, Row, Col, FormGroup,
  Nav, NavItem, NavLink, Input,
  TabContent, TabPane, Table, Container
} from 'reactstrap';

import { Accounts, Button } from 'components';
import axios from 'utils/request';
import { Redirect, Route } from 'react-router-dom';
import moment from 'moment';
import Auth from 'utils/auth';
import promisify from 'tiny-promisify';
import NavView from 'views/Issuer/NavView';
import ManageFund from 'views/Issuer/ManageFund';
import FundDetails from 'views/Issuer/FundDetails';
import FundCharges from 'views/Issuer/FundCharges';

export default class ShowFund extends React.Component {
  state = {
    fund: {},
    user: Auth.user,
    token: {id: -5},
    aggregate: true,
    tabs: [
      {link: '/issuer/funds/:id/shareholders',id: 'Shareholders', name: 'Shareholders'},
      {link: '/issuer/funds/:id/fund-details',id: 'FundDetails', name: 'Fund details'},
      {link: '/issuer/funds/:id/manage-fund',id: 'ManageFund', name: 'Manage fund'},
      {link: '/issuer/funds/:id/fund-charges',id: 'FundCharges', name: 'Fund charges'},
      {link: '/issuer/funds/:id/manages-ifa',id: 'ManageIFAs', name: 'Manage IFAs'},
      {link: '/issuer/funds/:id/nav-view',id: 'NAV', name: 'NAV'}
    ]
  }
  async componentDidMount() {
    if(this.props.match.params.id) {
      this.setState({ isOpen: true });
      let {data} = await axios.get(`${process.env.REACT_APP_API_URL}funds/${this.props.match.params.id}`);
      this.setState({
        fund: data
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
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
    return (
      <div>
        <Nav pills className="nav-pills-primary">
          {
            this.state.tabs.map((tab,key) => {
              let link = tab.link.replace(':id',this.state.fund.id);
              return (
                <NavItem style={{cursor: 'pointer'}} id={tab.id} key={key}>
                  <NavLink
                    className={link === this.props.location.pathname ? "active" : ""}
                    href={link}
                    id={tab.id}
                    >
                    {tab.name}
                  </NavLink>
                </NavItem>
              )
            })
          }
        </Nav>
        <Container
          style={{padding: '30px'}}
          >
          <Route
            path={`/issuer/funds/:id/shareholders`}
            render={(props) => (
              <div>
                <Input
                  type="select"
                  style={{height: '100%'}}
                  value={this.state.token.id}
                  onChange={(e) => this.tokenView(e)}
                  >
                  <option value={-5}>All Digital Share Classes</option>
                  {
                    (this.state.fund.tokens||[])
                    .map((token,key) => <option key={key} value={token.id}>{token.symbol}</option>)
                  }
                </Input>
                <Accounts
                  aggregate={this.state.aggregate}
                  fund={this.state.fund}
                  token={this.state.token}
                  {...props}
                  />
              </div>
            )}
            />
          <Route
            path={`/issuer/funds/:id/fund-details`}
            render={(props) => <FundDetails {...props} fund={this.state.fund}/>}
            />
          <Route
            path={`/issuer/funds/:id/manage-fund`}
            render={(props) => <ManageFund {...props} />}
            />
          <Route
            path={`/issuer/funds/:id/fund-charges`}
            render={(props) => <FundCharges {...props} />}
            />
          <Route
            path={`/issuer/funds/:id/nav-view`}
            render={(props) => <NavView {...props} fund={this.state.fund}/>}
            />
        </Container>
      </div>
    )
  }
}
