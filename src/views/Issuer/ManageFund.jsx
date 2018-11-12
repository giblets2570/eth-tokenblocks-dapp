import React from 'react';
import {Container,Row,Col,Table,FormGroup,Label,Input} from 'reactstrap';
import {Button} from 'components';
import axios from 'utils/request';
import moment from 'moment';

export default class ManageFund extends React.Component {
  state = {email: '', dividends: []}
  async componentWillReceiveProps(nextProps){
    if(nextProps.fund.id){
      let promises = nextProps.fund.tokens.map(async (token) => (
        await axios.get(`${process.env.REACT_APP_API_URL}tokens/${token.id}/dividends`)
      ));
      let promised = await Promise.all(promises);
      let dividends = promised.reduce((c, promise, index) => {
        let tokenDividends = promise.data.map((tokenDividend) => {
          tokenDividend.token = nextProps.fund.tokens[index];
          tokenDividend.createdAt = moment(tokenDividend.createdAt);
          tokenDividend.exDividendDate = moment(tokenDividend.exDividendDate);
          tokenDividend.paymentDate = moment(tokenDividend.paymentDate);
          return tokenDividend;
        });
        return c.concat(tokenDividends);
      }, []);
      this.setState({
        dividends: dividends
      })
    }
  }
  async uploadDividendFile(e){
    e.preventDefault()
    let response = await axios.get(`${process.env.REACT_APP_API_URL}policy?key=folder/my-file`);
    let url = response.data;
    response = await axios.put(url, this.state.dividendFile, {
      headers: {
        'Content-Type': this.state.dividendFile.type
      }
    });
  }
  handleChange(e, key) {
    this.setState({
      [key]: e.target.value
    })
  }
  chooseDividendFile(e){
    e.preventDefault()
    this.setState({
      dividendFile: e.target.files[0]
    })
  }
  payOut(dividend){
    console.log(dividend);
  }
  render(){
    let rows = this.state.dividends.map((dividend) => (
      <tr>
        <td>{dividend.token.symbol}</td>
        <td>{dividend.createdAt.format('DD/MM/YY')}</td>
        <td>{dividend.exDividendDate.format('DD/MM/YY')}</td>
        <td>{dividend.paymentDate.format('DD/MM/YY')}</td>
        <td>{(dividend.amount / 100).toLocaleString()}</td>
        <td>{dividend.currency}</td>
        <td>
          <Button
            color="primary"
            onClick={() => this.payOut(dividend)}
            >
            Pay out
          </Button>
        </td>
      </tr>
    ))
    return (
      <Container>
        <Row>
          <Col>
            <h3>Dividends</h3>
            <Table responsive>
              <tr>
                <th>Digital share</th>
                <th>Record date</th>
                <th>Ex-dividend date</th>
                <th>Pay date</th>
                <th>Gross dividend</th>
                <th>Dividend currency</th>
                <th></th>
              </tr>
              {rows}
            </Table>
            <form onSubmit={(e) => this.uploadDividendFile(e)}>
              <p style={{fontWeight: 700, fontSize: '14px'}}>
                Upload dividend: {" "}
                <input type="file" onChange={(e) => this.chooseDividendFile(e)} />
                {
                  this.state.dividendFile
                  ? (
                    <Button
                      round
                      type='submit'
                      color='primary'
                      >
                      Upload
                    </Button>
                  ) : null
                }
              </p>
            </form>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Documents</h3>
            <Button
              color="primary"
              >Upload</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Manage notifications</h3>
            <Col xs={6}>
              <FormGroup>
                <Label>Receive trade confirmations by email?</Label>
                <Input
                  type="text"
                  value={this.state.email}
                  placeholder="Enter receiving email here..."
                  onChange={(e) => {
                    this.setState({
                      updatedEmail: true
                    })
                    this.handleChange(e, 'email')
                  }}
                />
                {
                  this.state.updatedEmail
                  ? (
                    <Button
                      color='primary'
                      onClick={() => this.setState({
                        updatedEmail: false
                      })}>
                      Save email
                    </Button>
                  ) : null
                }
              </FormGroup>
            </Col>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Bank account</h3>
            <Button color='primary'>Set bank account</Button>
          </Col>
        </Row>

      </Container>
    )
  }
}
