import React from 'react';
import {Card, CardBody, CardHeader, CardTitle, Table, Grid, Row, Col } from 'reactstrap';
import { Link, Route, Redirect } from 'react-router-dom';
import moment from 'moment';
import contract from 'truffle-contract';
import {PanelHeader, Button} from 'components';
import web3Service from 'utils/getWeb3';
import Auth from 'utils/auth';
import axios from 'utils/request';
import {fromRpcSig, bufferToHex} from 'ethereumjs-util'
import OrderHoldings from './OrderHoldings'

class Orders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      user: Auth.user,
      page: 0,
      pageCount: 10,
      order: {}
    };
  }
  async fetchOrderData(page, pageCount) {
    await web3Service.promise
    let web3 = web3Service.instance
    let response = await axios.get(`${process.env.REACT_APP_API_URL}orders?page=${page}&page_count=${pageCount}`)
    let {data, total} = response.data
    this.setState({
      orders: data,
      total: total
    })
  }
  componentDidMount(){
    this.fetchOrderData(this.state.page, this.state.pageCount);
  }
  async verifyOrder(order) {
    await web3Service.promise
    let web3 = web3Service.instance
    let address = web3.eth.accounts[0]
    if(!address) return alert("Please connect metamask");

    let {r, s, v} = fromRpcSig(order.signature)
    let tradeHashes = order.orderTrades.map((orderTrade) => orderTrade.trade.hash)
    let sks = order.orderTrades.map((orderTrade) => {
      if("0x" !== orderTrade.trade.sk.slice(0,2)) orderTrade.trade.sk = '0x' + orderTrade.trade.sk;
      return orderTrade.trade.sk;
    })
    let executionDateInt = Math.floor(moment(order.executionDate).toDate().getTime() / 1000);
    let formattedOrder = [
      [order.broker.address, order.token.address],
      [order.amount,executionDateInt,order.salt],
      tradeHashes,
      sks
    ]

    const TradeKernelContract = require(`../../${process.env.REACT_APP_CONTRACTS_FOLDER}TradeKernel.json`);
    const tradeKernel = contract(TradeKernelContract);
    tradeKernel.setProvider(web3.currentProvider);
    
    let tradeKernelInstance = await tradeKernel.deployed();

    let orderHash = await tradeKernelInstance.getOrderHash(formattedOrder[0], formattedOrder[1], formattedOrder[2])
    let signer = await tradeKernelInstance.recoverSigner(orderHash, v, bufferToHex(r), bufferToHex(s), {from: address});
    let verifiedOrder = await tradeKernelInstance.verifyOrder(...formattedOrder, v, bufferToHex(r), bufferToHex(s), {from: address});

    let orders = this.state.orders.map((o) => {
      let _order = Object.assign({}, o);
      if(_order.id === order.id){
        _order.state = 1;
      }
      return _order;
    })
    this.setState({
      orders: orders
    })
  }
  viewOrder(order) {
    this.setState({
      order: order,
      orderModal: true
    });
  }
  toggleOrderModal(){
    this.setState({
      orderModal: !this.state.orderModal,
      order: this.state.order.id ? {} : this.state.order
    })
  }
  render() {
    let rows = (this.state.orders||[])
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((order, $index) => {
      return (
        <tr key={$index} >
          <td scope="row">{$index+1}</td>
          <td>{order.broker.name}</td>
          <td>{order.token.name}</td>
          <td>{moment(order.executionDate).format("DD/MM/YYYY")}</td>
          <td>
            {
              order.state === 0 ? 
              (
                <Button 
                  color='primary'
                  onClick={() => this.verifyOrder(order)}>
                  Verify order
                </Button>
              ) : <span style={{color: 'green'}}>Verified</span>
            }
          </td>
          <td>
            <Button 
              color='primary'
              onClick={() => this.viewOrder(order)}>
              View order
            </Button>
          </td>
        </tr>
      )
    })
    return(
      <div>
        <OrderHoldings isOpen={this.state.orderModal} toggle={() => this.toggleOrderModal()} order={this.state.order} />
        <PanelHeader 
          size="sm" 
          content={
            <h1>{
              this.state.token ? this.state.token.name : 'Loading...'
            }</h1>
          }
        />
        <div className="content">
          <Row>
            <Col md={12}>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Fund Orders to Confirm</CardTitle>
                </CardHeader>
                <CardBody>
                  <Table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Broker</th>
                        <th>Token</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
              <Card
                
                legend={
                  <div className="legend">
                    <i className="pe-7s-angle-left" style={{fontSize: '40px', cursor: 'pointer'}} onClick={() => this.changePage(-1)}/>
                    <i className="pe-7s-angle-right" style={{fontSize: '40px', cursor: 'pointer'}} onClick={() => this.changePage(1)}/>
                  </div>
                }
              />
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default Orders
