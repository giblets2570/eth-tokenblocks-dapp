import React from 'react';
import web3Service from 'utils/getWeb3';
import {Button} from 'components';
import Auth from 'utils/auth';
import axios from 'utils/request';

export default class DLTSetup extends React.Component {
  state = {
    web3: null,
    user: Auth.user
  };
  async componentDidMount(){
    await web3Service.promise
    let web3 = web3Service.instance
    this.setState({ web3: web3 });
    web3.eth.getAccounts((err, accounts) => this.setState({account: accounts[0]}))

  }
  render(){
    let { user, web3 } = this.state;
    if(!web3) return <p>Loading...</p>
    if(!this.state.account) return <p>Please set up ethereum client</p>

    return (
      <div>
        <p>Current Address: {this.state.account}</p>
        {
          user.address = this.state.account
          ? <p>Currently using this address</p>
          : <Button
              color="primary"
              onClick={() => this.setupBankAccount()}>
              Use this address?
            </Button>
        }
      </div>
    )
  }
}
