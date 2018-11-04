import React from "react";
import {
  Row, Col, Modal, ModalHeader, ModalBody,
  FormGroup, Label, Input, ModalFooter,
  Table
} from "reactstrap";
import axios from 'utils/request';
import moment from 'moment';
import {decrypt} from 'utils/encrypt'
const emptyString = "0000000000000000000000000000000000000000000000000000000000000000"

class ManageAccountHolder extends React.Component {
  state = {
    commissionRate: "",
    ifa: "",
    trades: []
  }
  handleChange(e, key) {
    this.setState({
      [key]: e.target.value
    })
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.token.id && nextProps.investor.id) {
      this.getTrades(nextProps)
    }
  }
  async getTrades(props) {
    console.log(props)
    let response = await axios.get(`${process.env.REACT_APP_API_URL}trades?investorId=${props.investor.id}&tokenId=${props.token.id}&state=6`);
    let trades = response.data.data.map((trade) => {
      trade.executionDate = moment(trade.executionDate);
      trade.createdAt = moment(trade.createdAt*1000);
      let total = decrypt(trade.nominalAmount, trade.sk);
      let [currency, nominalAmount] = total.split(':');
      trade.currency = currency;
      trade.nominalAmount = (parseInt(nominalAmount) / 100.0).toFixed(2);
      trade.priceDecrypted = decrypt(trade.price, trade.sk);

      trade.amount = parseFloat(trade.nominalAmount),
      trade.buySell = 'Buy'
      if(trade.amount < 0) {
        trade.amount = -1 * trade.amount
        trade.buySell = 'Sell'
      }
      return trade;
    })
    this.setState({
      trades: trades
    })
  }
  toggle(){
    this.setState({ trades: [] })
    this.props.toggle()
  }
  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this.toggle()}
        className="modal-notice text-center"
        fade={false}
        size="lg"
        >
        <ModalHeader toggle={() => this.props.toggle()}>
          Investor/product detail: {this.props.investor.name}
        </ModalHeader>
        <ModalBody>
          <form>
            <Row>
              <Col xs={6}>
                <FormGroup>
                  <Label>Set commission rate</Label>
                  <Input
                    type="text"
                    className='form-control'
                    value={this.state.commissionRate}
                    onChange={(e) => this.handleChange(e, 'commissionRate')}
                    placeholder="Amount"
                  />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <Label>Set IFA</Label>
                  <Input
                    type="text"
                    className='form-control'
                    value={this.state.ifa}
                    onChange={(e) => this.handleChange(e, 'ifa')}
                    placeholder="Amount"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <h4>View contract notes</h4>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Buy/Sell</th>
                      <th>Currency</th>
                      <th>Amount</th>
                      <th>Execution Date</th>
                      <th>Creation Date</th>
                      <th>Quote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.trades.map((trade, key) => (
                        <tr key={key}>
                          <td>{trade.buySell}</td>
                          <td>{trade.currency}</td>
                          <td>{trade.amount}</td>
                          <td>{trade.executionDate.format('DD/MM/YY')}</td>
                          <td>{trade.createdAt.format('DD/MM/YY')}</td>
                          <td>{trade.priceDecrypted}%</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
            <div className="clearfix" />
          </form>
        </ModalBody>
        <ModalFooter className="justify-content-center"></ModalFooter>
      </Modal>
    );
  }
}

export default ManageAccountHolder;
