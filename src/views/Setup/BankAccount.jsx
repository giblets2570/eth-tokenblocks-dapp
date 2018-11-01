import React from 'react';
import {Button} from 'components';
import Auth from 'utils/auth';
import axios from 'utils/request';

export default class Nav extends React.Component {
  state = {user: Auth.user}
  setupBankAccount(){
    window.location.href = `${process.env.REACT_APP_API_URL}truelayer?id=${this.state.user.id}`;
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}users/${this.state.user.id}`);
    console.log(response.data)
    this.setState({
      user: response.data
    })
  }
  render(){
    let { user } = this.state;
    return (
      <div>
        {
          user.bankConnected
          ? (
            <div>
              <p>Bank account set up</p>
              <a href='/investor/tokens'>Continue to page</a>
            </div>
          )
          : (
            <Button
              color="primary"
              variant="contained"
              onClick={() => this.setupBankAccount()}>
              Set up Bank Account
            </Button>
          )

        }
      </div>
    )
  }
}
