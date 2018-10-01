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
    this.setState({ tokens: response.data });
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
    if(this.state.tokenId && this.state.tokenId.value && parseInt(pathEnd) !== this.state.tokenId.value) {
      return <Redirect to={`/investor/accounts/${this.state.tokenId.value}`}/>
    }
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
                    value={this.state.tokenId}
                    options={
                      this.state.tokens.map((token) => ({value: token.id, label: token.symbol}))
                    }
                    onChange={value =>
                      this.setState({ 
                        tokenId: value,
                        redirect: true
                      })
                    }
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
                            {}
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
