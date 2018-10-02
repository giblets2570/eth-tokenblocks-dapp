import React, { Component } from 'react'
import moment from 'moment'
import { 
  Modal, Row, Col, Table,
  Grid, ControlLabel,
  FormGroup, FormControl
} from 'reactstrap'
import {Button} from 'components'

class CurrentLoans extends Component {
  constructor(props){
    super(props)
    this.state = {}
  }
  componentDidMount(){

  }
  handleDayChange(day) {
    this.setState({ 
      executionDate: day 
    });
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  render(){
    let loans = [{
      amount: '2.5 ETH',
      length: '1 day',
      repayments: '1 day',
      interest: '0 %'
    }]
    let rows = loans.map((loan, key) => {
      return (
        <tr key={key}>
          <td>{key+1}</td>
          <td>{loan.amount}</td>
          <td>{loan.length}</td>
          <td>{loan.repayments}</td>
          <td>{loan.interest}</td>
          <td></td>
        </tr>
      )
    })
    return (
      <div>
        <Table striped>
          <thead>
            <tr>
              <th>#</th>
              <th>Amount</th>
              <th>Length</th>
              <th>Repayments</th>
              <th>Interest</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
        <Button color="primary" type="submit">
          Submit loan request through Dharma.io
        </Button>
        <br/>
        <a target='_blank' href='https://dharma.io/'>
          What is Dharma.io?
        </a>
      </div>
    )
  }
  
}

export default CurrentLoans