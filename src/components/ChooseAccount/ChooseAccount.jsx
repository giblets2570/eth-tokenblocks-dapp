import React from 'react';
import Auth from 'utils/auth';
import axios from 'utils/request';
import {Table} from 'reactstrap';
import {Button} from 'components';

export default class ChooseAccount extends React.Component {
  state = {user: Auth.user, accounts: []};
  componentDidMount(){
    this.getAccounts();
  }
  async getAccounts(){
    let {data} = await axios.get(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}/bank-accounts`);
    this.setState({
      accounts: data
    });
    this.getBalance()
  }
  async getBalance(){
    if(this.state.user.truelayerAccountId) {
      let response = await axios.get(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}/balance`);
      this.setState({ balance: response.data });
    }
  }
  async choose(account){
    this.setState({balance: null})
    let {user} = this.state;
    let {data} = await axios.put(`${process.env.REACT_APP_API_URL}users/${user.id}`, {
      truelayerAccountId: account.account_id
    });
    user.truelayerAccountId = account.account_id;
    Auth.updateUser(user);
    this.setState({ user: user });
    this.getBalance()
    if(this.props.setAccount) {
      this.props.setAccount(account);
    }
  }
  render(){
    return (
      <div>
        <Table responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Number</th>
              <th>Sort code</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.accounts.map((account, key) => (
                <tr key={key}>
                  <td>{account.display_name}</td>
                  <td>{account.account_number.number}</td>
                  <td>{account.account_number.sort_code}</td>
                  <td>
                    {
                      this.state.user.truelayerAccountId === account.account_id
                      ? (
                        <span style={{color: 'green'}}>
                          Connected
                        </span>
                      ): (
                        <Button
                          round
                          color="primary"
                          onClick={() => this.choose(account)}
                          >
                          Choose
                        </Button>
                      )
                    }
                  </td>
                  <td>
                    {
                      this.state.user.truelayerAccountId === account.account_id
                      ? (
                        this.state.balance
                        ? <span>£{this.state.balance.available} available</span>
                        : "Loading..."
                      )
                      : null
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      </div>
    );
  }
}
