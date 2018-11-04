import React from 'react'
import axios from 'utils/request'
import {
  Card,CardHeader,CardBody,CardFooter,CardTitle,Row,Col,
  UncontrolledDropdown,DropdownToggle,DropdownMenu,DropdownItem,Table,Tooltip
} from "reactstrap";
import {
  Button,
  PanelHeader,
  Stats,
  Statistics,
  CardCategory,
  Progress
} from "components";

import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

import {
  chartsLine1,
  chartsLine2,
  chartsBar1,
  chartsBar2
} from "variables/charts";

import CreateTrade from 'components/CreateTrade/CreateTrade'

class Token extends React.Component {
  state = {
    token: {},
    holdings: [],
    balance: null,
    orderModal: false,
    timestamp: 'none',
    tooltipOpen: false,
    colours: [
      "#55efc4","#81ecec","#74b9ff","#a29bfe","#00b894",
      "#00cec9","#0984e3","#6c5ce7","#ffeaa7","#fab1a0",
      "#ff7675","#fd79a8","#636e72","#fdcb6e","#e17055",
      "#d63031","#e84393","#2d3436"
    ]
  }
  async getTokenData(props) {
    this.setState({
      token: {},
      holdings: [],
      balance: null,
    })
    if(!props.match.params.id) return;
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${props.match.params.id}`);
    let token = response.data;
    let minutes = `${token.cutoffTime%(60*60)}`
    if(minutes.length === 1) minutes = `0${minutes}`
    token.cutoffTimeString = `${token.cutoffTime/(60*60)}:${minutes}`
    token.totalSupply = parseFloat(token.totalSupply)
    this.setState({ token: token });

    response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${props.match.params.id}/nav`);
    let nav = response.data
    this.setState({ nav: nav })

    response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${props.match.params.id}/holdings`);
    let holdings = response.data
    let aum = holdings.reduce((c, holding) => c + holding.securityAmount * holding.securityTimestamp.price, 0) / 100.0;
    holdings = holdings.map((holding) => {
      holding.weight = holding.securityAmount * holding.securityTimestamp.price / (100 * aum)
      return holding
    });
    this.setState({ holdings: holdings });

    response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${props.match.params.id}/balance`);
    let balance = response.data.balance || 0
    balance = Math.abs(parseFloat(balance)) / Math.pow(10, token.decimals)
    this.setState({ balance: balance });
    this.setState({ currentValue: balance * nav.price })
    response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${props.match.params.id}/invested`);
    this.setState({ investedValue: response.data.totalAmount });
  }
  componentDidMount(){
    this.getTokenData(this.props)
  }
  componentWillReceiveProps(nextProps) {
    setTimeout(() => {
      this.setState({
        tooltipOpen: !this.state.orderModal && nextProps.tooltipsOpen
      })
    })
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
  makeData(object){
    return {
      labels: Object.keys(object),
      options: {
        legend: {
          display: false
        }
      },
      datasets: [{
        data: Object.keys(object).map((c) => object[c]),
        backgroundColor: this.state.colours.slice(0, Object.keys(object).length),
        hoverBackgroundColor: this.state.colours.slice(0, Object.keys(object).length),
      }]
    }
  }
  render() {
    let sectors = {}, currencies = {}, countries = {}
    for(let holding of this.state.holdings){
      sectors[holding.security.sector] = (sectors[holding.security.sector]||0)+1;
      currencies[holding.security.currency] = (currencies[holding.security.currency]||0)+1;
      countries[holding.security.country] = (countries[holding.security.country]||0)+1;
    }
    let countryData = this.makeData(countries)
    let sectorData = this.makeData(sectors)
    let currencyData = this.makeData(currencies)
    return (
      <div>
        <CreateTrade
          isOpen={this.state.orderModal}
          toggle={() => this.toggleOrderModal()}
          token={this.state.token}
          tooltipsOpen={this.props.tooltipsOpen}
          />
        <Row>
          <Col xs={12} md={12}>
            <Card className="card-stats card-raised">
              <CardBody>
                <h3 style={{textAlign: 'center'}}>Fund Summary</h3>
                <Row>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="danger"
                      icon="objects_support-17"
                      title={
                        this.state.token.name
                        ? this.state.token.name
                        : "Loading..."
                      }
                      subtitle="Name"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="primary"
                      icon="ui-2_chat-round"
                      title={
                        this.state.token.symbol
                        ? this.state.token.symbol
                        : "Loading..."
                      }
                      subtitle="Symbol"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="success"
                      icon="business_money-coins"
                      title={
                        this.state.token.name
                        ? this.state.token.name
                        : "Loading..."
                      }
                      subtitle="Underlying index"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="danger"
                      icon="objects_support-17"
                      title={
                        this.state.token.cutoffTimeString
                        ? this.state.token.cutoffTimeString
                        : "Loading..."
                      }
                      subtitle="Fund cutoff"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="primary"
                      icon="ui-2_chat-round"
                      title={
                        typeof this.state.token.minimumOrder === 'number'
                        ? (<span>
                            <small>£</small>{(this.state.token.minimumOrder/100).toLocaleString()}
                          </span>)
                        : null
                      }
                      subtitle="Minimum order"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="success"
                      icon="business_money-coins"
                      title={
                        this.state.token.incomeCategory
                        ? this.state.token.incomeCategory.charAt(0).toUpperCase()
                          + this.state.token.incomeCategory.substr(1)
                        : null
                      }
                      subtitle="Income type"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="success"
                      icon="business_money-coins"
                      title={
                        typeof this.state.nav === 'object'
                        ? (<span>
                            <small>£</small>{(this.state.nav.price/100).toLocaleString()}
                          </span>)
                        : 'Loading...'
                      }
                      subtitle="Current NAV (per token)"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="success"
                      icon="business_money-coins"
                      title={
                        this.state.token.fee
                        ? (<span>
                            {this.state.token.fee}
                          </span>)
                        : 'Loading...'
                      }
                      subtitle="Fee (bp per annum)"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="success"
                      title={
                        <Button
                          id="CreateOrderToken"
                          round
                          color="primary"
                          onClick={() => this.createOrder(this.state.token)}>
                          Place trade
                        </Button>
                      }
                      subtitle=""
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={12}>
            <Card className="card-stats card-raised">
              <CardBody>
                <h3 style={{textAlign: 'center'}}>Investor Summary</h3>
                <Row>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="primary"
                      icon="ui-2_chat-round"
                      title={
                        typeof this.state.balance === 'number'
                        ? this.state.balance.toLocaleString()
                        : 'Loading...'
                      }
                      subtitle="Number of tokens"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="info"
                      icon="users_single-02"
                      title={
                        typeof this.state.investedValue === 'number'
                        ? (<span>
                            <small>£</small>{(this.state.investedValue/100).toLocaleString()}
                          </span>)
                        : 'Loading...'
                      }
                      subtitle="Invested Value"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="danger"
                      icon="objects_support-17"
                      title={
                        typeof this.state.currentValue === 'number'
                        ? (<span>
                            <small>£</small>{(this.state.currentValue/100).toLocaleString()}
                          </span>)
                        : 'Loading...'
                      }
                      subtitle="Current Value"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="primary"
                      icon="ui-2_chat-round"
                      title={
                        typeof this.state.currentValue === 'number' && typeof this.state.investedValue === 'number'
                        ? this.state.investedValue
                          ? (
                            (this.state.currentValue - this.state.investedValue) * 100 / this.state.investedValue
                          ).toFixed(2) + '%'
                          : '0%'
                        : 'Loading...'
                      }
                      subtitle="Performance"
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {
          // <Row>
          //   <Col xs={12}>
          //     <Card>
          //       <CardHeader>
          //         <CardTitle tag="h4" style={{textAlign: 'center'}}>
          //           Fund Portfolio
          //         </CardTitle>
          //       </CardHeader>
          //       <CardBody>
          //         <Table responsive>
          //           <thead className="text-primary">
          //             <tr>
          //               <th className="text-right">#</th>
          //               <th>Name</th>
          //               <th>Currency</th>
          //               <th>Sector</th>
          //               <th>Country</th>
          //               <th>Amount</th>
          //               <th>Weight</th>
          //             </tr>
          //           </thead>
          //           <tbody>
          //             {
          //               this.state.holdings
          //               .sort((a, b) => b.weight - a.weight)
          //               .map((holding,key) => {
          //                 return (
          //                   <tr key={key}>
          //                     <td>{key+1}</td>
          //                     <td>{holding.security.symbol}</td>
          //                     <td>{holding.security.currency}</td>
          //                     <td>{holding.security.sector}</td>
          //                     <td>{holding.security.country}</td>
          //                     <td>{holding.securityAmount.toLocaleString()}</td>
          //                     <td>{(holding.weight*100).toFixed(2)}%</td>
          //                   </tr>
          //                 )
          //               })
          //             }
          //           </tbody>
          //         </Table>
          //       </CardBody>
          //     </Card>
          //   </Col>
          // </Row>
        }
        <Tooltip placement="right" isOpen={!this.state.orderModal && this.state.tooltipOpen} target="CreateOrderToken">
          Place an order for this token by clicking the button below
        </Tooltip>
      </div>
    )
  }
}

export default Token
