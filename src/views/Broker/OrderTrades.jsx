import moment from "moment";
import React from "react";
import Auth from 'utils/auth'
import { Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle, Row,
  Col, Table,
  Label, FormGroup } from "reactstrap";
import Select from "react-select";
import CSVReader from "react-csv-reader";
import {Redirect} from 'react-router-dom'
import { PanelHeader, Statistics, Button } from "components";
import Datetime from "react-datetime";
import axios from "utils/request"
import { receiveMessage, getSharedSecret, loadBundle } from 'utils/encrypt'
import {fromRpcSig, bufferToHex} from 'ethereumjs-util'
import promisify from 'tiny-promisify';
import OrderTradeToken from 'views/Broker/OrderTradeToken'
import contract from 'truffle-contract';
const emptyString = "0000000000000000000000000000000000000000000000000000000000000000"

class OrderTrades extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tokens: [],
      token: null
    }
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens`);
    let tokens = response.data;
    let tokenSelect = tokens.map((bs) => ({value: bs, label: `${bs.name} - ${bs.symbol}`}));
    this.setState({
      tokens: tokens,
      tokenSelect: tokenSelect
    });
    let locationParts = this.props.location.pathname.split('/')
    let locationEnd = locationParts[locationParts.length-1]
    for (let i = 0; i < tokens.length; i++) {
      if(String(tokens[i].id) === locationEnd){
        this.setState({ token: tokenSelect[i] })
        break;
      }
    }
  }
  render(){
    if(this.state.redirect) {
      let locationParts = this.props.location.pathname.split('/')
      let locationEnd = locationParts[locationParts.length-1]
      if(String(this.state.token.value.id) !== locationEnd){
        return <Redirect to={`/broker/tokens/${this.state.token.value.id}`}/>
      }
    }
    return (
      <div>
        <PanelHeader
          size="sm"
          content={
            <div>
              <h1>{this.state.token ? this.state.token.name : 'Loading...'}</h1>
            </div>
          }
        />
        <div className="content">
          <Row>
            <Col xs={12} md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <FormGroup>
                    <Label>Choose a Token</Label>
                    <Select
                      className="react-select primary"
                      classNamePrefix="react-select"
                      name="buySell"
                      options={this.state.tokenSelect}
                      value={this.state.token}
                      onChange={(value) => {
                        console.log(value)
                        this.setState({
                          token: value,
                          redirect: true
                        })
                      }}
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {
            this.state.token
            ? <OrderTradeToken {...this.props} tokenId={this.state.token.value.id}/>
            : null
          }
        </div>
      </div>
    )
  }
}

export default OrderTrades
