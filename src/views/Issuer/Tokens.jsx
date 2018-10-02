import React from 'react'
import axios from 'utils/request'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Table,
  Button
} from "reactstrap";
import {
  PanelHeader,
  Stats,
  Statistics,
  CardCategory,
  Progress
} from "components";

import CreateToken from 'views/Issuer/CreateToken'

class Tokens extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tokens: []
    }
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens`);
    this.setState({ tokens: response.data });
  }
  componentWillReceiveProps(nextProps) {}
  onInputChange(key) {
    return (event) => {
      this.setState({ 
        [key]: event.target.value 
      })
    }
  }
  toggleTokenModal() {
    this.setState({
      tokenModal: !this.state.tokenModal
    })
  }
  createToken() {
    this.setState({
      tokenModal: true
    })
  }
  render() {
    let rows = this.state.tokens.map((token, key) => {
      return (
        <tr key={key}>
          <td>{key + 1}</td>
          <td>{token.name}</td>
          <td>{token.symbol}</td>
          <td>{token.totalSupply}</td>
        </tr>
      )
    })
    return (
      <div>
        <CreateToken isOpen={this.state.tokenModal} toggle={() => this.toggleTokenModal()} />
        <PanelHeader 
          size="sm" 
          content={
            <h1>{this.state.token ? this.state.token.name : 'Loading...'}</h1>
          }
        />
        <div className="content">
          <Row>
            <Col xs={12} md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <h3 style={{textAlign: 'center'}}>My Tokens</h3>
                  <Table responsive>
                    <thead>
                      <tr className="text-primary">
                        <th>#</th>
                        <th>Name</th>
                        <th>Symbol</th>
                        <th>Total Supply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </Table>
                  <Button color="primary" onClick={() => this.createToken()}>
                    Create token
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default Tokens
