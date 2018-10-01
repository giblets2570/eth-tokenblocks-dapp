import React from 'react'
import { subscribeOnce } from 'utils/socket'
import { FormInputs, Button } from 'components';
import {FormGroup, Label, Input} from 'reactstrap';

class GiveQuotes extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      toggled: false,
      price: '',
      status: 0
    }
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  submit(e){
    e.preventDefault()
    this.props.createQuote(
      this.props.trade,
      this.state.price
    )
  }
  render(){
    let confirmButton;
    if(this.state.status === 0){
      confirmButton = (
        <Button color="info" onClick={(event) => this.submit(event)} >
          Confirm
        </Button>
      )
    } else if(this.state.status === 1) {
      confirmButton = <p>Pending...</p>
    }
    return (
      <div className="content">
        <h3>Give quote for {this.props.token ? this.props.token.symbol : ''} tokens</h3>
        <FormGroup>
          <Input
            type="input"
            className='form-control'
            value={this.state.price}
            onChange={(e) => this.handleChange(e, 'price')}
            placeholder="Price..."
          />
        </FormGroup>
        {confirmButton}
      </div>
    )
  }
}
  
export default GiveQuotes