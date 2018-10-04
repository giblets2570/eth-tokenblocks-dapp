import React from 'react'
import axios from 'utils/request'
import Select from "react-select";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Table,
  Button
} from "reactstrap";
import {
  PanelHeader,
  Stats,
  Statistics,
  CardCategory,
  Progress
} from "components";

import { Line, Bar, Pie } from "react-chartjs-2";

import {
  chartsLine1,
  chartsLine2,
  chartsBar1,
  chartsBar2
} from "variables/charts";

import CreateTrade from 'components/CreateTrade/CreateTrade'

import { Route, Redirect } from 'react-router-dom'

class Accounts extends React.Component {
  constructor(props) {
    super(props)
    let pathEnd = this.props.location.pathname.split('/')[this.props.location.pathname.split('/').length-1]
    this.state = {
      tokens: [],
      token: {},
      tokenId: pathEnd !== 'accounts' ? parseInt(pathEnd) : null,
      balance: null,
      orderModal: false,
      timestamp: 'none',
    }
    console.log(this.state)
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens`);
    let tokenOptions = response.data.map((token) => ({value: token.id, label: token.symbol}))
    let tokenChoice = this.state.tokenId ? tokenOptions.find((option) => option.value === this.state.tokenId) : null
    this.setState({ 
      tokens: response.data,
      tokenOptions: tokenOptions,
      tokenChoice: tokenChoice
    });
  }
  async getBalances(tokenId){
    if(!tokenId) return;
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${tokenId}/balances`);
  }
  componentWillReceiveProps(nextProps) {
    
  }
  onInputChange(key) {
    return (event) => {
      this.setState({ 
        [key]: event.target.value 
      })
    }
  }
  toggleOrderModal() {
    this.setState({
      orderModal: !this.state.orderModal
    })
  }
  createOrder() {
    this.setState({
      orderModal: true
    })
  }
  render() {
    let pathEnd = this.props.location.pathname.split('/')[this.props.location.pathname.split('/').length-1]
    if(this.state.tokenChoice && this.state.tokenChoice.value && parseInt(pathEnd) !== this.state.tokenChoice.value) {
      return <Redirect to={`/investor/accounts/${this.state.tokenChoice.value}`}/>
    }
    let rows = [{
      account: '0x1bbf9f9429202f6c95b1890abfef0e09595d3c2f',
      alias: 'Fund',
      balance: '10000.1'
    },{
      account: '0x505199bd3a160dc9a8ca5dcdee2dde0a0fba17ac',
      alias: 'Investor',
      balance: '900.545'
    },{
      account: '0x2de27f04354bc2299a22860ae69061f2472eef4c',
      alias: 'Broker',
      balance: '891.1'
    },{
      account: '0x006da85075cf27348cd295dc66b3f0bbd5399a5c',
      alias: 'Investor 2',
      balance: '47.0'
    }].map((row, key) => (
      <tr>
        <td>{key+1}</td>
        <td>{row.account}</td>
        <td>{row.alias}</td>
        <td>{row.balance}</td>
      </tr>
    ))
    return (
      <div>
        <CreateTrade isOpen={this.state.orderModal} toggle={() => this.toggleOrderModal()} token={this.state.token} />
        <PanelHeader 
          size="sm" 
          content={
            <div>
              <h1>{this.state.token ? this.state.token.name : 'Loading...'}</h1>
            </div>
          }
        />
        <div className="content">
          <Row>
            <Col xs={12} md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <h3 style={{textAlign: 'center'}}>Accounts</h3>
                  <Select
                    className="react-select primary"
                    classNamePrefix="react-select"
                    placeholder="Choose token"
                    name="token"
                    value={this.state.tokenChoice}
                    options={this.state.tokenOptions}
                    onChange={(value) => {
                      this.setState({ 
                        tokenChoice: value
                      })
                    }}
                  />
                  <Row>
                    <Route path='/investor/accounts/:id' render={(props) => {
                      return (
                        <Table responsive>
                          <thead>
                            <tr className="text-primary">
                              <th className="text-center">#</th>
                              <th>Account</th>
                              <th>Alias</th>
                              <th>Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows}
                          </tbody>
                        </Table>
                      )
                    }} />
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default Accounts
