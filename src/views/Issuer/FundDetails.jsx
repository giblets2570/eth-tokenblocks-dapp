import React from 'react';
import axios from 'utils/request';
import {Row,Col,Table,FormGroup,Label,Input} from 'reactstrap';

export default class FundDetails extends React.Component {
  state = {
    distributionChannels: [{
      name: "Issuer Platform",
      id: 1
    },{
      name: "Tokenblocks Platform",
      id: 2
    },{
      name: "Hargreaves Lansdown",
      id: 3
    },{
      name: "Barclays Stockbrokers",
      id: 4
    },{
      name: "Fidelity FundNetwork",
      id: 5
    }],
    fund: {}
  }
  async componentWillReceiveProps(nextProps){
    console.log(nextProps)
    let {fund} = nextProps
    if(fund){
      let promises = (fund.tokens||[]).map(async (token, key) => {
        token.distributionChannels = this.state.distributionChannels
          .map((d) => d.id)
          .filter((d) => {
            if(d==2) return true
          });
        let {data} = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${token.id}/nav`);
        token.nav = data.price
        return token;
      })
      fund.tokens = await Promise.all(promises)
      this.setState({
        fund: fund
      })
    }
  }
  render(){
    return (
      <div>
        <Row>
          <Col>
            <h4>Fund name: {this.state.fund.name}</h4>
          </Col>
        </Row>
        <Table responsive>
          <thead>
            <tr className="text-primary">
              <th>Share class</th>
              <th>OCF</th>
              <th>Shares outstanding</th>
              <th>Currency</th>
              <th>Minimum order</th>
              <th>NAV</th>
              <th>Price time</th>
            </tr>
          </thead>
          <tbody>
            {
              (this.state.fund.tokens||[])
              .map((token, key) => {
                return (
                  <tr key={key}>
                    <td>{token.symbol}</td>
                    <td>{(token.fee/100).toFixed(2)}%</td>
                    <td>{Math.round(parseFloat(token.totalSupply) / Math.pow(10,18)).toLocaleString()}</td>
                    <td>{"GBP"}</td>
                    <td>£{(token.minimumOrder/100).toLocaleString()}</td>
                    <td>£{(token.nav/100).toLocaleString()}</td>
                    <td>{"12:30pm"}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
        <Row>
          <Col>
            <h4>Distribution channels</h4>
          </Col>
        </Row>
        <Table responsive>
          <thead>
            <tr className="text-primary">
              <th style={{width: "180px"}}>Share class</th>
              {
                (this.state.distributionChannels||[])
                .map((channel, key) => (<th key={key}>{channel.name}</th>))
              }
            </tr>
          </thead>
          <tbody>
            {
              (this.state.fund.tokens||[])
              .map((token, key) => {
                return (
                  <tr key={key}>
                    <td>{token.symbol}</td>
                    {
                      (this.state.distributionChannels||[])
                      .map((channel, key) => {
                        return (
                          <td key={key}>
                            <FormGroup check>
                              <Label check>
                                <Input
                                  checked={
                                    token.distributionChannels.includes(channel.id)
                                  }
                                  type="checkbox"
                                  disabled={true}/>
                                <span className="form-check-sign" />
                              </Label>
                            </FormGroup>
                          </td>
                        )
                      })
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      </div>
    )
  }
}
