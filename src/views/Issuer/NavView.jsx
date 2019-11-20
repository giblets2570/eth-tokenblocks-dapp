import React from 'react';
import moment from 'moment';
import {Row,Col,FormGroup,Label,Input} from 'reactstrap';
import {Button} from 'components';
import web3Service from 'utils/getWeb3';
import contract from 'truffle-contract';
import promisify from 'tiny-promisify';
import axios from 'utils/request';
import Auth from 'utils/auth';
import { loadBundle, getSharedSecret } from 'utils/encrypt';

export default class NavView extends React.Component {
  state = {user: Auth.user, today: moment().format('YYYY-MM-DD')}
  async uploadNAV() {
    let response = await axios.get(`${process.env.REACT_APP_API_URL}trades?tokenId=${this.state.token.id}&executionDate=${this.state.today}`);
    let trades = response.data.data
    for(let trade of trades) {
      // need to derive the secret key
      let bundle = Auth.getBundle();
      bundle = loadBundle(bundle);
      let tradeBroker = trade.tradeBrokers.find((ob) => ob.brokerId === this.state.user.id);
      let sk = getSharedSecret(bundle, tradeBroker);
      // Need to save this sk on trade
      await axios.put(`${process.env.REACT_APP_API_URL}trades/${trade.id}`, { sk: sk });
    }

    let nav = prompt("Give todays NAV");
    try {
      nav = parseInt(parseFloat(nav)*100);
    }catch(e){
      return console.log(`${nav} isn't a number`);
    }
    this.setState({ pending: true })
    await web3Service.promise;
    let web3 = web3Service.instance;
    const ETTContract = require(`../../${process.env.REACT_APP_CONTRACTS_FOLDER}ETT.json`);
    const ett = contract(ETTContract);
    ett.setProvider(web3.currentProvider);
    let address = await promisify(web3.eth.getCoinbase)()
    if(!address) return alert("Please connect Metamask")
    let ettInstance = await ett.at(this.state.token.address);
    let dateString = moment().format('YYYY-MM-DD')
    try{
      let tx = await ettInstance.updateNAV(nav, dateString, {from: address});
      console.log(tx)
    }catch(e){
      console.log(e)
    }

    response = await axios.post(`${process.env.REACT_APP_API_URL}tokens/${this.state.token.id}/nav-update`, {
      time: Math.floor(new Date().valueOf() / 1000),
      value: nav
    });

    console.log(response)

    this.setState({
      nav: {
        executionDate: dateString,
        price: nav
      },
      pending: false
    })
  }
  async setToken(e){
    let token = this.props.fund.tokens.find((t) => t.id === parseInt(e.target.value));
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${token.id}/nav`);
    let nav = response.data
    this.setState({
      token: token,
      nav: nav
    });
  }
  render() {
    return (
      <div>
        <Row>
          <Col>
            <label for="token-select">Choose a token:</label>
            <select
              onChange={(e) => this.setToken(e)}
              id="token-select">
              <option></option>
              {
                (this.props.fund.tokens||[]).map((token, key) => (
                  <option key={key} value={token.id}>{token.symbol}</option>
                ))
              }
            </select>
          </Col>
        </Row>
        <br/>
        {
          this.state.token
          ? (
            this.state.nav.executionDate === this.state.today
            ? (
              <p>Todays NAV: £{(this.state.nav.price/100).toLocaleString()}</p>
            )
            : (
              this.state.pending
              ? (
                <Row>
                  <Col>
                    <p>Pending...</p>
                  </Col>
                </Row>
              )
              : (
                <Row>
                  <Col>
                    <Button
                      color="primary"
                      onClick={() => this.uploadNAV()}
                      >
                      Upload todays NAV
                    </Button>
                  </Col>
                </Row>
              )
            )
          )
          : null
        }
      </div>
    )
  }
}
