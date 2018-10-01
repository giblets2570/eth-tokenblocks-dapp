import React from 'react'
import {Row, Col, FormGroup, Label, Input} from "reactstrap"
import {Button} from "components"
import Auth from 'utils/auth';
import axios from 'utils/request';

class ProfileForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      id: Auth.user.id,
      name: Auth.user.name,
      email: Auth.user.email,
      address: Auth.user.address
    }
  }

  handleChange(event,key) {
    console.log(event.target.value)
    this.setState({
      [key]: event.target.value
    })
  }

  async handleSubmit(e) {
    e.preventDefault()
    if (this.state.name.length < 2){
      return alert('Please fill in your name.')
    }
    let response = await axios.put(`${process.env.REACT_APP_API_URL}users/${this.state.id}`, this.state)
    Auth.updateUser(this.state)
  }

  render() {
    return(
      <form onSubmit={(e) => this.handleSubmit(e)}>
        <Row>
          <Col xs={12} md={4}>
            <FormGroup>
              <Label>Name</Label>
              <Input
                type="input"
                className='form-control'
                value={this.state.name}
                onChange={(e) => this.handleChange(e, 'name')}
                placeholder="Name"
              />
            </FormGroup>
          </Col>
          <Col xs={12} md={4}>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="input"
                className='form-control'
                value={this.state.email}
                onChange={(e) => this.handleChange(e, 'email')}
                placeholder="Email"
              />
            </FormGroup>
          </Col>
          <Col xs={12} md={4}>
            <FormGroup>
              <Label>Ethereum Address</Label>
              <Input
                type="input"
                className='form-control'
                value={this.state.address}
                onChange={(e) => this.handleChange(e, 'address')}
                placeholder="Ethereum Address..."
              />
            </FormGroup>
          </Col>
        </Row>
        <Button color="info" type="submit">
          Update Profile
        </Button>
        <div className="clearfix" />
      </form>
    )
  }
}

export default ProfileForm