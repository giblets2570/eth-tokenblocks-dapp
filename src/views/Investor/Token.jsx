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

import { Line, Bar, Pie } from "react-chartjs-2";

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
    }
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${this.props.tokenId}`);
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
    console.log('HAHAHAHHAAH')
    this.setState({
      orderModal: !this.state.orderModal
    })
  }
  createOrder() {
    console.log('HAHAHAHHAAH')
    this.setState({
      orderModal: true
    })
  }
  render() {
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
                <CardBody>
                  <h3 style={{textAlign: 'center'}}>Exposure Summary</h3>
                  <Row>
                    <Col xs={12} md={4} className="ml-auto">
                      <h6 className="info-title">Sector Breakdown</h6>
                      <Pie data={chartsBar1.data} />
                    </Col>
                    <Col xs={12} md={4} className="ml-auto">
                      <h6 className="info-title">Currency Breakdown</h6>
                      <Pie data={chartsBar1.data} />
                    </Col>
                    <Col xs={12} md={4} className="ml-auto">
                      <h6 className="info-title">Country Breakdown</h6>
                      <Pie data={chartsBar1.data} />
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
