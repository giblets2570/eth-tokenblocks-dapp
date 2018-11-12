import React from 'react'
import axios from 'utils/request'
import {
  Card,CardHeader,CardBody,CardFooter,CardTitle,Row,Col,
  UncontrolledDropdown,DropdownToggle,DropdownMenu,DropdownItem,Table,Tooltip
} from "reactstrap";
import {Button,PanelHeader,Stats,Statistics,CardCategory,Progress} from "components";
import Joyride from 'react-joyride';
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import CreateTrade from 'components/CreateTrade/CreateTrade';

class Token extends React.Component {
  state = {
    token: {},
    holdings: [],
    balance: null,
    tradeModal: false,
    timestamp: 'none',
    tooltipOpen: false,
    colours: [
      "#55efc4","#81ecec","#74b9ff","#a29bfe","#00b894",
      "#00cec9","#0984e3","#6c5ce7","#ffeaa7","#fab1a0",
      "#ff7675","#fd79a8","#636e72","#fdcb6e","#e17055",
      "#d63031","#e84393","#2d3436"
    ]
  }
  constructor(props){
    super(props)
    this.joyride = React.createRef();
  }
  handleJoyrideCallback(args) {
    if(args.index === 3) {
      this.setState({
        tutorialMode: false,
        tradeModal: true
      }, () => {
        setTimeout(() => {
          this.joyride.current.helpers.index(3)
          this.setState({ tutorialMode: true })
        }, 100)
      })
    }
    if(args.index === 4) {
      this.setState({ tradeModal: false })
    }
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
    this.getTokenData(this.props);
  }
  componentWillReceiveProps(nextProps) {
    let {tutorialMode} = nextProps;
    this.setState({ tutorialMode: tutorialMode })
    setTimeout(() => {
      this.setState({ tutorialMode: !this.state.tradeModal && nextProps.tutorialMode })
    })
  }
  onInputChange(key) {
    return (e) => {
      this.setState({ [key]: e.target.value })
    }
  }
  toggleTradeModal() {
    this.setState({ tradeModal: !this.state.tradeModal })
  }
  createTrade() {
    this.setState({ tradeModal: true })
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
    let {tutorialMode} = this.state;
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
        <Joyride
          ref={this.joyride}
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton
          run={!!tutorialMode}
          debug={true}
          disableScrolling={false}
          callback={(args) => this.handleJoyrideCallback(args)}
          steps={[
            {
              content: (
                <div>
                  <h4>Hi! Welcome to TokenBlocks</h4>
                  <p>We are going to give your a quick tour so can fully understand what's going on</p>
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
                <div>
                  <h4>Fund Summary</h4>
                  <p>
                    Here you can see some fund data.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#FundSummary"
            },
            {
              content: (
                <div>
                  <h4>Create a trade</h4>
                  <p>
                    Click here to create a trade
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#CreateTradeToken"
            },
            {
              content: (
                <div>
                  <h4>Create a trade</h4>
                  <p>
                    Click here to create a trade
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#CreateTradeModal"
            },
            {
              content: (
                <div>
                  <h4>Investor Summary</h4>
                  <p>
                    Here is your data regarding this fund.
                    It shows your performance with the fund, showing how much you have made with this investment.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorSummary"
            },
            {
              content: (
                <div>
                  <h4>Fund Portfolio</h4>
                  <p>
                    Here are the shares and amounts that the fund contains.
                    Each day after trading has completed, it will be updated by the fund manager.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#FundPortfolio"
            },
          ]}
        />
        <CreateTrade
          isOpen={this.state.tradeModal}
          toggle={() => this.toggleTradeModal()}
          token={this.state.token}
          tooltipsOpen={this.props.tooltipsOpen}
          />
        <Row>
          <Col xs={12} md={12}>
            <Card className="card-stats card-raised" id="FundSummary">
              <CardBody>
                <h3 style={{textAlign: 'center'}}>Fund Summary</h3>
                <Row>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="primary"
                      icon="design_app"
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
                      icon="business_globe"
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
                      iconState="primary"
                      icon="ui-1_bell-53"
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
                      iconState="success"
                      icon="business_money-coins"
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
                      iconState="primary"
                      icon={
                        this.state.token.incomeCategory&& this.state.token.incomeCategory[0] === 'd'
                        ? "arrows-1_share-66"
                        : "loader_refresh"
                      }
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
                          id="CreateTradeToken"
                          round
                          color="primary"
                          onClick={() => this.createTrade(this.state.token)}>
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
            <Card className="card-stats card-raised" id="InvestorSummary">
              <CardBody>
                <h3 style={{textAlign: 'center'}}>Investor Summary</h3>
                <Row>
                  <Col xs={12} md={3}>
                    <Statistics
                      iconState="primary"
                      icon="education_paper"
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
                      iconState="success"
                      icon="business_money-coins"
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
                      iconState="success"
                      icon="business_money-coins"
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
                      icon="objects_spaceship"
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
        <Row>
          <Col xs={12}>
            <Card className="card-stats card-raised" id="FundPortfolio">
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
                      <th>Sector</th>
                      <th>Country</th>
                      <th>Amount</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.holdings
                      .sort((a, b) => b.weight - a.weight)
                      .map((holding,key) => {
                        return (
                          <tr key={key}>
                            <td>{key+1}</td>
                            <td>{holding.security.symbol}</td>
                            <td>{holding.security.currency}</td>
                            <td>{holding.security.sector}</td>
                            <td>{holding.security.country}</td>
                            <td>{holding.securityAmount.toLocaleString()}</td>
                            <td>{(holding.weight*100).toFixed(2)}%</td>
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
    )
  }
}

export default Token
