import React from "react";
import {
  Row, Col, Modal, ModalHeader, ModalBody,
  FormGroup, Label, Input, ModalFooter,
  Table
} from "reactstrap";
import axios from 'utils/request';

class ManageAccountHolder extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      commissionRate: "",
      ifa: "",
    }
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
    let trades = await axios.get(`${process.env.REACT_APP_API_URL}trades?investorId=${props.investor.id}&tokenId=${props.token.id}`);
  }
  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this.props.toggle()}
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
                  <tr>
                    <th>Buy/Sell</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Execution Date</th>
                    <th>Creation Date</th>
                    <th>Quote</th>
                  </tr>
                  <tr>
                    {

                    }
                  </tr>
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
