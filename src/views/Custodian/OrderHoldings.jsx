import React from 'react';
import { Modal, ModalHeader, ModalBody, Card, CardBody, CardHeader, CardTitle, Table, Grid, Row, Col } from 'reactstrap';
import { Link, Route, Redirect } from 'react-router-dom';
import moment from 'moment';
import contract from 'truffle-contract';
import {PanelHeader, Button} from 'components';
import web3Service from 'utils/getWeb3';
import Auth from 'utils/auth';
import axios from 'utils/request';

class Orders extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      order: {}
    };
  }
  async componentWillReceiveProps(nextProps){
    if(nextProps.order.id){
      let response = await axios.get(`${process.env.REACT_APP_API_URL}orders/${nextProps.order.id}`)
      let order = response.data
      this.setState({
        order: order
      })
    }
  }
  render() {
    let rows = (this.state.order.orderHoldings || []).map((row, key) => {
      return (
        <tr key={key}>
          <td>{key+1}</td>
          <td>{row.security.symbol}</td>
          <td>{row.amount}</td>
        </tr>
      )
    })
    return(
      <Modal
        isOpen={this.props.isOpen}
        toggle={() => this.props.toggle()}
        className="modal-notice"
        size="lg"
      >
        <ModalHeader toggle={() => this.props.toggle()}>
          Securities bought in order
        </ModalHeader>
        <ModalBody>
          <Table responsive>
            <thead>
              <tr className="text-primary">
                <th className="text-center">#</th>
                <th>Security</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </Table>
        </ModalBody>
      </Modal>
    )
  }
}

export default Orders
