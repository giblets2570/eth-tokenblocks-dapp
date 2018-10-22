import React from "react";
import axios from "utils/request";
import { Table } from "reactstrap";

class Accounts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async componentDidMount() {
    let {data} = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${this.props.token.id}/balances`);
    let balances = data.map((balance) => {
      balance.balance = parseFloat( balance.balance || 0 ) / Math.pow(10, this.props.token.decimals);
      return balance;
    });
    this.setState({
      balances: balances,
      loading: false
    })
  }
  render() {
    let rows = (this.state.balances||[])
    .map((balance,key) => {
      return (
        <tr key={key}>
          <td>{key+1}</td>
          <td>{balance.investor.address}</td>
          <td>{balance.investor.name}</td>
          <td>{balance.balance.toFixed(3)}</td>
        </tr>
      )
    })
    return (
      <Table responsive>
        <thead>
          <tr className="text-primary">
            <th className="text-center">#</th>
            <th>Account</th>
            <th>Alias</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
}

export default Accounts;
