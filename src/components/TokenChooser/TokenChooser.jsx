import React from 'react';
import {Row,Col,Card,CardBody,Table,Tooltip} from 'reactstrap';
import {Link} from 'react-router-dom';
import axios from 'utils/request';

export default class TokenChooser extends React.Component {
  state = { tokens: [] }
  async componentDidMount(){
    this.setState({ tooltipsOpen: false })
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens`);
    let tokens = response.data;
    this.setState({tokens: tokens});
    setTimeout(() => {
      this.setState({
        tooltipsOpen: tokens.length && this.props.tooltipsOpen
      })
    })
    if(this.props.showBalances){
      let promises = tokens.map((token) => axios.get(`${process.env.REACT_APP_API_URL}tokens/${token.id}/balance`));
      let balances = await Promise.all(promises);
      balances = balances.map((balance) => balance.data);

      tokens = tokens.map((token,index) => {
        token.balance = (balances[index].balance || 0) / Math.pow(10, token.decimals)
        return token
      })
      this.setState({tokens: tokens})

      promises = tokens.map((token) => axios.get(`${process.env.REACT_APP_API_URL}tokens/${token.id}/nav`));
      let navs = await Promise.all(promises);
      navs = navs.map((nav) => nav.data);
      tokens = tokens.map((token,index) => {
        token.nav = navs[index].price
        return token
      })
      this.setState({tokens: tokens})

      promises = tokens.map((token) => axios.get(`${process.env.REACT_APP_API_URL}tokens/${token.id}/invested`));
      let investeds = await Promise.all(promises);
      investeds = investeds.map((invested) => invested.data);
      tokens = tokens.map((token,index) => {
        token.invested = investeds[index].totalAmount
        return token
      })
      this.setState({tokens: tokens})

    }
  }
  componentWillReceiveProps(nextProps){
    setTimeout(() => this.setState({
      tooltipsOpen: this.state.tokens.length && nextProps.tooltipsOpen
    }));
  }
  render(){
    return (
      <Table>
        <thead>
          <tr>
            <th>Fund</th>
            <th>Digital share</th>
            <th>NAV</th>
            {
              this.props.showBalances
              ?<th>Balance</th>
              :null
            }
            {
              this.props.showBalances
              ?<th>Invested value</th>
              :null
            }
            {
              this.props.showBalances
              ?<th>Current value</th>
              :null
            }
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            (this.state.tokens||[]).map((token, key) => (
              <tr key={key} id={`FundRow${key}`}>
                <td>
                  {token.name}
                </td>
                <td>
                  {token.symbol}
                </td>
                <td>
                  £{((token.nav||0)/100).toLocaleString()}
                </td>
                {
                  this.props.showBalances
                  ? (
                    <td>
                      {(token.balance||0).toLocaleString()}
                    </td>
                  ) : null
                }
                {
                  this.props.showBalances
                  ? (
                    <td>
                      £{((token.invested||0)/100).toLocaleString()}
                    </td>
                  ) : null
                }
                {
                  this.props.showBalances
                  ? (
                    <td>
                      £{((token.balance||0)*((token.nav||0)/100)).toLocaleString()}
                    </td>
                  ) : null
                }
                <td>
                  <Link
                    to={`${this.props.link}/${token.id}`}
                    >
                    <span id={`ChooseToken${key}`}>View</span>
                  </Link>
                </td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    )
  }
}
