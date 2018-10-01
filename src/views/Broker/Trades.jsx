import React from 'react';
import { Link, Route } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Table, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { subscribe } from 'utils/socket';
import axios from 'utils/request';
import moment from 'moment';
import { PanelHeader, Button } from "components";
import ShowTrade from 'views/Investor/ShowTrade';
import Auth from 'utils/auth';
import {decrypt, receiveMessage,loadBundle} from 'utils/encrypt';
const emptyString = "0000000000000000000000000000000000000000000000000000000000000000"

class Trades extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageCount: 10,
      trades: [],
      user: Auth.user,
      bundle: loadBundle(Auth.getBundle())
    };
  }
  componentWillReceiveProps(nextProps) {
    
  }
  changePage(page) {
    // let page = Math.max(0, this.state.page + direction)
    this.setState({
      page: page
    })
    this.getTrades();
  }

  componentDidMount(){
    this.getTrades()
  }
  async getTrades(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}trades?page=${this.state.page}&page_count=${this.state.pageCount}`);
    let trades = response.data;
    trades = trades.map((trade) => {
      trade.executionDate = moment(trade.executionDate);
      trade.createdAt = moment(trade.createdAt*1000);
      let ob = trade.tradeBrokers.find((ob) => ob.brokerId === this.state.user.id);
      let message = {text: ob.nominalAmount,ik: ob.ik,ek: ob.ek};
      let total = receiveMessage(this.state.bundle, message);
      let [currency, nominalAmount] = total.split(':');
      trade.currency = currency;
      trade.nominalAmount = nominalAmount;
      if(ob.price && ob.price.length && ob.price !== emptyString) {
        // if(ob.price.length > 32){
        //   ob.price = web3.toAscii(ob.price);
        // }
        message = {text: ob.price,ik: ob.ik,ek: ob.ek};
        trade.priceDecrypted = receiveMessage(this.state.bundle, message);
      }
      trade.state = ob.state;
      return trade;
    })
    this.setState({ trades: trades });
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
      return 'Trade confirmed'
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
      let amount = parseFloat(trade.nominalAmount), buySell = 'Buy'
      if(amount < 0) {
        amount = -1 * amount
        buySell = 'Sell'
      }
      return (
        <tr key={$index}>
          <td scope="row">{$index+1}</td>
          <td>{trade.token.name}</td>
          <td>{trade.investor.name}</td>
          <td>{buySell}</td>
          <td>{trade.currency}</td>
          <td>{amount}</td>
          <td>{trade.executionDate.format('DD/MM/YY')}</td>
          <td>{trade.priceDecrypted}</td>
          <td>{this.stateString(trade)}</td>
          <td>
            <Link to={`/broker/trades/${trade.id}`}>View</Link>
          </td>
        </tr>
      )
    })
    return(
      <div>
        <Route 
          path="/broker/trades/:id" 
          render={(props) => <ShowTrade {...props} returnTo='/broker/trades'/>
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
                  <CardTitle tag="h4">Incoming trades</CardTitle>
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead>
                      <tr className="text-primary">
                        <th className="text-center">#</th>
                        <th>Name</th>
                        <th>Investor</th>
                        <th>Buy/Sell</th>
                        <th>Currency</th>
                        <th>Amount</th>
                        <th>Execution Date</th>
                        <th>Quote</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </Table>
                  <Pagination>
                    <PaginationItem active={this.state.page === 0}>
                      <PaginationLink onClick={() => this.changePage(0)}>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem active={this.state.page === 1}>
                      <PaginationLink onClick={() => this.changePage(1)}>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem active={this.state.page === 2}>
                      <PaginationLink onClick={() => this.changePage(2)}>3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem active={this.state.page === 3}>
                      <PaginationLink onClick={() => this.changePage(3)}>4</PaginationLink>
                    </PaginationItem>
                    <PaginationItem active={this.state.page === 4}>
                      <PaginationLink onClick={() => this.changePage(4)}>5</PaginationLink>
                    </PaginationItem>
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
