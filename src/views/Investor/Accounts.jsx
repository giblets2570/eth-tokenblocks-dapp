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

import { Route, Redirect } from 'react-router-dom'

class Accounts extends React.Component {
  constructor(props) {
    super(props)
    let pathEnd = this.props.location.pathname.split('/')[this.props.location.pathname.split('/').length-1]
    this.state = {
      tokens: [],
      tokenId: pathEnd !== 'accounts' ? parseInt(pathEnd) : null,
      balance: null,
      orderModal: false,
      timestamp: 'none',
      balances: []
    }
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
    this.getBalances(this.state.tokenId)
  }
  async getBalances(tokenId){
    if(!tokenId) return;
    this.setState({
      balances: [],
      loading: true
    })
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${tokenId}/balances`);
    let balances = response.data.map((balance) => {
      balance.balance = parseFloat(balance.balance || 0)
      return balance
    })

    this.setState({
      balances: response.data,
      loading: false
    })
  }
  componentWillReceiveProps(nextProps) {
    let oldLocationParts = this.props.location.pathname.split('/')
    let newLocationParts = nextProps.location.pathname.split('/')
    let oldLocationEnd = oldLocationParts[oldLocationParts.length - 1]
    let newLocationEnd = newLocationParts[newLocationParts.length - 1]
    if(oldLocationEnd !== newLocationEnd) {
      this.getBalances(newLocationEnd)
    }
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
    let rows = this.state.balances
    .filter((a) => a.balance)
    .sort((a,b) => {
      return b.balance - a.balance
    })
    .map((row, key) => (
      <tr key={key}>
        <td>{key+1}</td>
        <td>{row.investor.address}</td>
        <td>{row.investor.name}</td>
        <td>{(row.balance / Math.pow(10, row.token.decimals)).toFixed(2)}</td>
      </tr>
    ))
    return (
      <div>
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
                      if(this.state.loading) {
                        return <p>Loading...</p>
                      }
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
