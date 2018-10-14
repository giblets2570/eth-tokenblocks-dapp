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
  Button,
  Tooltip
} from "reactstrap";
import {
  PanelHeader,
  Stats,
  Statistics,
  CardCategory,
  Progress
} from "components";

import CreateToken from 'views/Issuer/CreateToken'
import RegCheck from 'views/Issuer/RegCheck'

class Tokens extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tokens: [],
      token: {},
      tooltipsOpen: false
    }
  }
  toggleTooltip() {
    // this.setState({
    //   tooltipsOpen: !this.state.tooltipsOpen
    // });
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens`);
    let tokens = response.data
    this.setState({ tokens: tokens });
    console.log(this.props)
  }
  async componentWillReceiveProps(nextProps) {
    console.log(nextProps) 
  }
  onInputChange(key) {
    return (event) => {
      this.setState({ 
        [key]: event.target.value 
      })
    }
  }
  async toggleTokenModal() {
    if(this.state.tokenModal){
      let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens`);
      this.setState({ tokens: response.data });
    }
    this.setState({
      tokenModal: !this.state.tokenModal
    })
  }
  createToken() {
    this.setState({
      tokenModal: true
    })
  }
  regCheck(token){
    this.setState({
      token: token
    })
    this.setState({
      regModal: true
    })
  }
  toggleRegModal() {
    this.setState({
      regModal: !this.state.regModal
    })
  }
  render() {
    let rows = this.state.tokens.map((token, key) => {
      return (
        <tr key={key}>
          <td>{key + 1}</td>
          <td>{token.name}</td>
          <td>{token.symbol}</td>
          <td>{(parseFloat(token.totalSupply) / Math.pow(10,token.decimals)).toFixed(2)}</td>
          <td>
            <Button color="primary" onClick={() => this.regCheck(token)} id={`RegCheck${key}`}>
              Regulation Check
            </Button>
          </td>
        </tr>
      )
    });
    return (
      <div>
        <CreateToken isOpen={this.state.tokenModal} toggle={() => this.toggleTokenModal()} {...this.props} />
        <RegCheck isOpen={this.state.regModal} toggle={() => this.toggleRegModal()} token={this.state.token} {...this.props} />
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
                        <th>Compliant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </Table>
                  <Button color="primary" onClick={() => this.createToken()} id="CreateToken">
                    Create token
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Tooltip placement="right" isOpen={this.props.tooltipsOpen && !this.state.tokenModal && !this.state.regModal} target="CreateToken">
            Click here to start creating a new token
          </Tooltip>
          {
            rows.length
            ? (
              <Tooltip placement="right" isOpen={this.props.tooltipsOpen && !this.state.tokenModal && !this.state.regModal} target={`RegCheck0`}>
                Click here to perform the regulation checks
              </Tooltip>
            )
            : null
          }
        </div>
      </div>
    )
  }
}

export default Tokens
