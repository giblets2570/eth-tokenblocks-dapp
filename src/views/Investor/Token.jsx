import React from 'react'
import axios from 'utils/request'
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

import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

import {
  chartsLine1,
  chartsLine2,
  chartsBar1,
  chartsBar2
} from "variables/charts";

import CreateTrade from 'components/CreateTrade/CreateTrade'

class Token extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      token: {},
      holdings: [],
      balance: null,
      orderModal: false,
      timestamp: 'none',
      colours: [
        "#55efc4",
        "#81ecec",
        "#74b9ff",
        "#a29bfe",
        "#00b894",
        "#00cec9",
        "#0984e3",
        "#6c5ce7",
        "#ffeaa7",
        "#fab1a0",
        "#ff7675",
        "#fd79a8",
        "#636e72",
        "#fdcb6e",
        "#e17055",
        "#d63031",
        "#e84393",
        "#2d3436"
      ]
    }
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${this.props.tokenId}`);
    let minutes = `${response.data.cutoffTime%(60*60)}`
    if(minutes.length === 1) minutes = `0${minutes}`
    response.data.cutoffTimeString = `${response.data.cutoffTime/(60*60)}:${minutes}`
    this.setState({ token: response.data });
    response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${this.props.tokenId}/holdings`);
    this.setState({ holdings: response.data })
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
  makeData(object){
    return {
      labels: Object.keys(object),
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
        <CreateTrade isOpen={this.state.orderModal} toggle={() => this.toggleOrderModal()} token={this.state.token} />
        <PanelHeader 
          size="sm" 
          content={
            <h1>{this.state.token ? this.state.token.name : 'Loading...'}</h1>
          }
        />
        <div className="content">
          <Row>
            <Col xs={12} md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <h3 style={{textAlign: 'center'}}>Fund Summary</h3>
                  <Row>
                    <Col xs={12} md={4}>
                      <Statistics
                        iconState="primary"
                        icon="ui-2_chat-round"
                        title={
                          (2345.56).toLocaleString()
                        }
                        subtitle="Current Balance"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <Statistics
                        iconState="success"
                        icon="business_money-coins"
                        title={
                          <span>
                            <small>£</small>{(3521.00).toLocaleString()}
                          </span>
                        }
                        subtitle="Fiat Equivalent"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <Statistics
                        iconState="info"
                        icon="users_single-02"
                        title={
                          <span>
                            <small>£</small>{(4325.00).toLocaleString()}
                          </span>
                        }
                        subtitle="Invested Value"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={4}>
                      <Statistics
                        iconState="danger"
                        icon="objects_support-17"
                        title={
                          <span>
                            <small>£</small>{(8298.00).toLocaleString()}
                          </span>
                        }
                        subtitle="Current Value"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <Statistics
                        iconState="primary"
                        icon="ui-2_chat-round"
                        title={((1034434 - 831297) * 100 / 1034434).toFixed(2) + "%"}
                        subtitle="Performance"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <Statistics
                        iconState="success"
                        // icon="business_money-coins"
                        title={
                          <Button color="primary" onClick={() => this.createOrder(this.state.token)}>
                            Place order
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
                    <Col xs={12} md={4}>
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
                    <Col xs={12} md={4}>
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
                    <Col xs={12} md={4}>
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
                    <Col xs={12} md={4}>
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
                    <Col xs={12} md={4}>
                      <Statistics
                        iconState="primary"
                        icon="ui-2_chat-round"
                        title={
                          <span>
                            <small>£</small>{(100000).toLocaleString()}
                          </span>
                        }
                        subtitle="Minimum order"
                      />
                    </Col>
                    <Col xs={12} md={4}>
                      <Statistics
                        iconState="success"
                        icon="business_money-coins"
                        title="Accumalating"
                        subtitle="Replication type"
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
                <CardBody style={{minHeight: '200px'}}>
                  <h3 style={{textAlign: 'center'}}>Exposure Summary</h3>
                  <Row>
                    <Col xs={12} md={4}>
                      <h6 className="info-title">Sector Breakdown</h6>
                      <Doughnut data={sectorData} />
                    </Col>
                    <Col xs={12} md={4}>
                      <h6 className="info-title">Currency Breakdown</h6>
                      <Doughnut data={currencyData} />
                    </Col>
                    <Col xs={12} md={4}>
                      <h6 className="info-title">Country Breakdown</h6>
                      <Doughnut data={countryData} />
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4" style={{textAlign: 'center'}}>
                    Fund Portfolio
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead className="text-primary">
                      <tr>
                        <th className="text-right">#</th>
                        <th>Name</th>
                        <th>Currency</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        this.state.holdings.map((holding,key) => {
                          return (
                            <tr key={key}>
                              <td>{key+1}</td>
                              <td>{holding.security.name}</td>
                              <td>{holding.security.currency}</td>
                              <td>{holding.securityAmount}</td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default Token
