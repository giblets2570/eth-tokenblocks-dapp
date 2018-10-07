import React from 'react';
import axios from 'utils/request';
import moment from 'moment';
import ShowTrade from 'views/Investor/ShowTrade'
import { Link, Route } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Table, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { subscribe } from 'utils/socket';
import { PanelHeader, Button } from "components";
import { decrypt } from 'utils/encrypt'

const emptyString = "0000000000000000000000000000000000000000000000000000000000000000"

class Trades extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageCount: 10,
      trades: []
    };
  }
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
        if(ob.price && ob.price.length && ob.price !== emptyString) {
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
      return 'Trade Confirmed'
    }if(trade.state === 2){
      // Need to figure out how to differentiate between
      return <Button color='success' onClick={() => this.claimTokens(trade)}>Claim tokens</Button>
    }else if(trade.state === 3){
      return 'Trade cancelled'
    }else if(trade.state === 4){
      return 'Trade rejected'
    }else {
      return 'Tokens claimed'
    }
  }
  render() {
    let rows = this.state.trades
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((trade, $index) => {
      let amount = parseFloat(trade.nominalAmount), buySell = 'Buy'
      if(amount < 0) {
        amount = -1 * amount
        buySell = 'Sell'
      }
      return (
        <tr key={$index}>
          <td scope="row">{$index+1}</td>
          <td>{trade.token.name}</td>
          <td>{buySell}</td>
          <td>{trade.currency}</td>
          <td>{amount}</td>
          <td>{trade.executionDate.format('DD/MM/YY')}</td>
          <td>{trade.createdAt.format('HH:mm [at] DD/MM/YY')}</td>
          <td>{trade.bestQuote}</td>
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
    return(
      <div>
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
                      <tr className="text-primary">
                        <th className="text-center">#</th>
                        <th>Name</th>
                        <th>Buy/Sell</th>
                        <th>Currency</th>
                        <th>Amount</th>
                        <th>Execution Date</th>
                        <th>Date</th>
                        <th>Quote</th>
                        <th>Status</th>
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
