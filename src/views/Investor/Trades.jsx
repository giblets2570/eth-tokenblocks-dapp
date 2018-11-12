import React from 'react';
import axios from 'utils/request';
import moment from 'moment';
import ShowTrade from 'views/Investor/ShowTrade'
import { Link, Route } from 'react-router-dom';
import {
  Card, CardBody, CardHeader, CardTitle, Row, Col,
  Table, Pagination, PaginationItem, PaginationLink
} from "reactstrap";
import { subscribe } from 'utils/socket';
import { PanelHeader, Button } from "components";
import { decrypt } from 'utils/encrypt'
import Joyride from 'react-joyride';

class Trades extends React.Component {
  state = {page: 0,pageCount: 10,trades: []};
  changePage(page) {
    this.setState({
      page: page
    });
    this.fetchTrades(page, this.state.pageCount);
  }
  async fetchTrades(page, pageCount) {
    let response = await axios.get(`${process.env.REACT_APP_API_URL}trades?page=${page}&page_count=${pageCount}`);
    let {data, total} = response.data;
    let trades = data.map((trade) => {
      trade.executionDate = moment(trade.executionDate)
      trade.createdAt = moment(trade.createdAt*1000)
      let tradeKeys = JSON.parse(localStorage.getItem('tradeKeys'))
      trade.tradeBrokers = trade.tradeBrokers.map((ob) => {
        let key = `${trade.token.id}:${ob.broker.id}:${trade.salt}`;
        let sk = JSON.parse(localStorage.getItem('tradeKeys'))[key];
        let total = decrypt(ob.nominalAmount, sk);
        let [currency, nominalAmount] = total.split(':');
        trade.currency = currency;
        trade.nominalAmount = (parseInt(nominalAmount) / 100.0).toFixed(2);
        if(ob.price && ob.price.length) {
          ob.priceDecrypted = decrypt(ob.price, sk);
        }
        return ob;
      })
      trade.bestQuote = trade.tradeBrokers.reduce((c, ob) => {
        if(ob.price && (c === null || parseFloat(ob.price) > c )) {
          c = parseFloat(ob.priceDecrypted);
        }
        return c;
      }, null);
      return trade;
    })
    for(let trade of trades) {
      subscribe(`trade-update:${trade.id}`, (id) => {
        this.fetchTrades(this.state.page, this.state.pageCount)
      })
    }
    this.setState({ trades: trades, total: total });
  }
  async componentDidMount(){
    this.fetchTrades(this.state.page, this.state.pageCount)
  }
  async claimTokens(trade) {
    let response = await axios.put(`${process.env.REACT_APP_API_URL}trades/${trade.id}/claim`);
    this.fetchTrades(this.state.page, this.state.pageCount)
  }
  stateString(trade){
    if(trade.state === 0){
      if(trade.signature){
        return 'Quote accepted'
      }else if(trade.bestQuote){
        return 'Quote received'
      }else{
        return 'Waiting for quotes'
      }
    }else if(trade.state === 1){
      return 'Waiting on NAV'
    }if(trade.state === 2){
      return 'Trade cancelled'
    }else if(trade.state === 3){
      return 'Trade rejected'
    }else if(trade.state === 4){
      return 'Waiting for funds'
    }else if(trade.state === 5){
      return <Button color='success' onClick={() => this.claimTokens(trade)}>{
        trade.nominalAmount >= 0
         ? "Claim digital shares"
         : "Sell digital shares"
      }</Button>
    }else{
      return trade.nominalAmount >= 0
       ? 'Digital shares claimed'
       : "Digital shares sold"
    }
  }
  render() {
    let rows = this.state.trades
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((trade, key) => {
      let amount = parseFloat(trade.nominalAmount), buySell = 'Buy'
      if(amount < 0) {
        amount = -1 * amount
        buySell = 'Sell'
      }
      return (
        <tr key={key}>
          <td scope="row">{key+1}</td>
          <td>{trade.token.symbol}</td>
          <td>{buySell}</td>
          <td>{trade.currency}</td>
          <td>{amount.toLocaleString()}</td>
          <td>{trade.executionDate.format('DD/MM/YY')}</td>
          <td>{trade.createdAt.format('HH:mm [at] DD/MM/YY')}</td>
          <td>{trade.bestQuote ? trade.bestQuote+"%" : null}</td>
          <td>{this.stateString(trade)}</td>
          <td>
            <Link to={`/investor/trades/${trade.id}`}>View</Link>
          </td>
        </tr>
      )
    })
    let pagination = this.state.total
    ? Array(Math.ceil(this.state.total / this.state.pageCount)).fill(null)
      .map((t, key) => (
        <PaginationItem active={this.state.page === key} key={key}>
          <PaginationLink onClick={() => this.changePage(key)}>{key+1}</PaginationLink>
        </PaginationItem>
      ))
    : [];
    let {tutorialMode} = this.props
    return(
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
                  <h4>Trade</h4>
                  <p>
                    When you start trading, all your trades will appear in this table.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorTradesRow"
            },
            {
              content: (
                <div>
                  <p>
                    This is the name of the digital share in the trade
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorTradesName"
            },
            {
              content: (
                <div>
                  <p>
                    This is the direction of the trade, meaning is it a buy or sell
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorTradesBuySell"
            },
            {
              content: (
                <div>
                  <p>
                    This is the currency of the trade
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorTradesCurrency"
            },
            {
              content: (
                <div>
                  <p>
                    This is the amount you wish to trade for in fiat currency.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorTradesAmount"
            },
            {
              content: (
                <div>
                  <p>
                    This is the date that the fund has executed the trade.
                    You will receive the NAV price that is for this day.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorTradesExecutionDate"
            },
            {
              content: (
                <div>
                  <p>
                    This is the price that the fund has quoted, given in percent above the NAV.
                    This means if the NAV is £100 on the execution date and the price is 1%, you will effectively pay £101 for each digital share.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorTradesQuote"
            },
            {
              content: (
                <div>
                  <p>
                    This is the state of the trade. It can have the following states:
                  </p>
                  <ol>
                    <li>Quote accepted</li>
                    <li>Quote received</li>
                    <li>Waiting for quotes</li>
                    <li>Waiting on NAV</li>
                    <li>Trade cancelled</li>
                    <li>Trade rejected</li>
                    <li>Waiting for funds</li>
                    <li>Claim/Sell digital shares</li>
                    <li>Digital shares claimed/sold</li>
                  </ol>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#InvestorTradesState"
            }
          ]}
        />
        <Route
          path="/investor/trades/:id"
          render={(props) => <ShowTrade {...props} returnTo='/investor/trades'/>
        }/>
        <PanelHeader
          size="sm"
          content={
            <h1>{this.state.token ? this.state.token.name : 'Loading...'}</h1>
          }
        />
        <div className="content">
          <Row>
            <Col xs={12} md={12}>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">My trades</CardTitle>
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead>
                      <tr className="text-primary" id={`InvestorTradesRow`}>
                        <th className="text-center">#</th>
                        <th id={`InvestorTradesName`}>Name</th>
                        <th id={`InvestorTradesBuySell`}>Buy/Sell</th>
                        <th id={`InvestorTradesCurrency`}>Currency</th>
                        <th id={`InvestorTradesAmount`}>Amount</th>
                        <th id={`InvestorTradesExecutionDate`}>Execution Date</th>
                        <th id={`InvestorTradesDate`}>Date</th>
                        <th id={`InvestorTradesQuote`}>Quote</th>
                        <th id={`InvestorTradesState`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </Table>
                  <Pagination>
                    {pagination}
                  </Pagination>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}



export default Trades
