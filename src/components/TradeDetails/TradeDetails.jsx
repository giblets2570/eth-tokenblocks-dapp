import React from "react";
// used for making the prop types of this component
import PropTypes from "prop-types";
import { Row, Col } from 'reactstrap';
class TradeDetails extends React.Component {
  render() {
    return (
      <Row>
        <Col xs={6} style={{textAlign: 'center'}}>
          <h4>Buy/Sell</h4>
          <p style={{color: 'green'}}>{this.props.trade.buySell}</p>
        </Col>
        <Col xs={6} style={{textAlign: 'center'}}>
          <h4>Amount</h4>
          <p style={{color: 'green'}}>{this.props.trade.amount}</p>
        </Col>
        <Col xs={6} style={{textAlign: 'center'}}>
          <h4>Currency</h4>
          <p style={{color: 'green'}}>{this.props.trade.currency}</p>
        </Col>
        <Col xs={6} style={{textAlign: 'center'}}>
          <h4>Execution date</h4>
          <p style={{color: 'green'}}>{
            this.props.trade.executionDate
            ? this.props.trade.executionDate.format("DD/MM/YYYY")
            : null
          }</p>
        </Col>
      </Row>
    );
  }
}

TradeDetails.propTypes = {
  trade: PropTypes.object
};

export default TradeDetails;
