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
import Joyride from 'react-joyride';

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
    let {tutorialMode} = this.props
    return (
      <div>
        <Joyride
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton
          run={!!tutorialMode}
          debug={true}
          disableScrolling={false}
          steps={[
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <h4 style={{fontSize: '22px'}}>Hi! Wsfdsfdsfdsfsdlcome to TokenBlocks</h4>
                  <p style={{fontSize: '12px'}}>We are going to give your a quick tour so can fully understand what's going on</p>
                </div>
              ),
              placement: "center",
              disableBeacon: true,
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "body"
            },
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <p style={{fontSize: '12px'}}>Click here do view the shareholders in your fund</p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#Shareholders"
            },
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <p style={{fontSize: '12px'}}>
                    This tab shows the details in your fund. <br />
                    You can see the digital shares that are in your fund, and the distribution channels of your fund.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#FundDetails"
            },
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <p style={{fontSize: '12px'}}>
                    Using this tab, you can manage your fund. <br/>
                    Uploading dividends, documents, managing which email you recieve notifications to and which bank account you wish to use.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#ManageFund"
            },
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <p style={{fontSize: '12px'}}>
                    This tab shows you the funds charges that happen in your fund. <br/>
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#FundCharges"
            },
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <p style={{fontSize: '12px'}}>
                    Here is the table that shows all your funds
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#ManageIFAs"
            },
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <p style={{fontSize: '12px'}}>
                    Here is the table that shows all your funds
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#NAV"
            },
            {

            }
          ]}
        />
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
            render={(props) => <ManageFund {...props} fund={this.state.fund}/>}
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
