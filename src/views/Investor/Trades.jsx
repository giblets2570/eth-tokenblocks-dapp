import React from 'react';
import { Link, Route } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Table } from "reactstrap";
import { subscribe } from 'utils/socket';
import axios from 'utils/request';
import moment from 'moment';
import { PanelHeader, Button } from "components";
import { decrypt } from 'utils/encrypt'
import ShowTrade from 'views/Investor/ShowTrade'

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
  componentWillReceiveProps(nextProps) {
    
  }
  changePage(direction) {
    let page = Math.max(0, this.state.page + direction)
    this.setState({
      page: page
    })
    this.props.fetchTrades(page, this.state.pageCount);
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}trades?page=${this.state.page}&page_count=${this.state.pageCount}`);
    let trades = response.data;
    trades = trades.map((trade) => {
      trade.executionDate = moment(trade.executionDate)
      trade.createdAt = moment(trade.createdAt*1000)
      let tradeKeys = JSON.parse(localStorage.getItem('tradeKeys'))

      trade.tradeBrokers = trade.tradeBrokers.map((ob) => {
        let key = `${trade.token.id}:${ob.broker.id}:${trade.salt}`;
        let sk = JSON.parse(localStorage.getItem('tradeKeys'))[key];
        let total = decrypt(ob.nominalAmount, sk);
        let [currency, nominalAmount] = total.split(':');
        trade.currency = currency;
        trade.nominalAmount = nominalAmount;
        if(ob.price && ob.price.length && ob.price !== emptyString) {
          ob.priceDecrypted = decrypt(ob.price, sk);
        }
        return ob
      })
      return trade;
    })
    this.setState({ trades: trades });
  }
  async claimTokens(trade) {
    let response = await axios.put(`${process.env.REACT_APP_API_URL}trades/${trade.id}/claim`);
    console.log(response);
  }
  stateString(trade){
    if(trade.state === 0){
      if(trade.broker){
        return 'Waiting for trade confirmation'
      }else if(trade.price){
        return 'Quote received'
      }else{
        return 'Waiting for quotes'
      }
    }else if(trade.state === 1){
      return <Button onClick={() => this.claimTokens(trade)}>Claim tokens</Button>
    }if(trade.state === 2){
      return 'Tokens disbursed'
    }else if(trade.state === 3){
      return 'Trade cancelled'
    }else if(trade.state === 4){
      return 'Trade rejected'
    }
  }
  render() {
    let rows = this.state.trades
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((trade, $index) => {
      let bestQuote = trade.tradeBrokers.reduce((c, ob) => {
        if(ob.price && (c === null || parseFloat(ob.price) > c )) {
          c = parseFloat(ob.priceDecrypted)
        }
        return c
      }, null);
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
          <td>{bestQuote}</td>
          <td>{this.stateString(trade)}</td>
          <td>
            <Link to={`/investor/trades/${trade.id}`}>View</Link>
          </td>
        </tr>
      )
    })
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
