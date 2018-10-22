import React from 'react';
import axios from 'utils/request';
import CreateToken from 'views/Issuer/CreateToken';
import RegCheck from 'views/Issuer/RegCheck';
import {Route,Link} from 'react-router-dom';
import ShowToken from 'views/Issuer/ShowToken'
import {
  Card,CardHeader,CardBody,CardFooter,CardTitle,Row,Col,UncontrolledDropdown,
  DropdownToggle,DropdownMenu,DropdownItem,Table,Button,Tooltip
} from "reactstrap";
import { PanelHeader,Stats,Statistics,CardCategory,Progress } from "components";

class Tokens extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      funds: [],
      fund: {},
      tooltipsOpen: false
    }
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}funds`);
    let funds = response.data
    this.setState({ funds: funds });
    console.log(this.props)
  }
  async componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }
  onInputChange(key) {
    return (event) => {
      this.setState({
        [key]: event.target.value
      })
    }
  }
  async toggleTokenModal() {
    if(this.state.fundModal){
      let response = await axios.get(`${process.env.REACT_APP_API_URL}funds`);
      this.setState({ funds: response.data });
    }
    this.setState({
      fundModal: !this.state.fundModal
    })
  }
  createToken() {
    this.setState({
      fundModal: true
    })
  }
  regCheck(fund){
    this.setState({
      fund: fund
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
    let rows = this.state.funds.map((fund, key) => {
      return (
        <tr key={key}>
          <td>{key + 1}</td>
          <td>{fund.name}</td>
          <td>
            <Button color="primary" onClick={() => this.regCheck(fund)} id={`RegCheck${key}`}>
              Regulation Check
            </Button>
          </td>
          <td>
            <Link to={`/issuer/funds/${fund.id}`}>
              View
            </Link>
          </td>
        </tr>
      )
    });
    return (
      <div>
        <CreateToken isOpen={this.state.fundModal} toggle={() => this.toggleTokenModal()} {...this.props} />
        <RegCheck isOpen={this.state.regModal} toggle={() => this.toggleRegModal()} fund={this.state.fund} {...this.props} />
        <PanelHeader
          size="sm"
          content={
            <h1>{this.state.fund ? this.state.fund.name : 'Loading...'}</h1>
          }
        />
      <Route
        path="/issuer/funds"
        exact={true}
        render={(props) => (
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
                        <th>Compliant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </Table>
                  <Button color="primary" onClick={() => this.createToken()} id="CreateToken">
                    Create fund
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Tooltip placement="right" isOpen={this.props.tooltipsOpen && !this.state.fundModal && !this.state.regModal} target="CreateToken">
            Click here to start creating a new fund
          </Tooltip>
          {
            rows.length
            ? (
              <Tooltip placement="right" isOpen={this.props.tooltipsOpen && !this.state.fundModal && !this.state.regModal} target={`RegCheck0`}>
                Click here to perform the regulation checks
              </Tooltip>
            )
            : null
          }
        </div>
        )}
        />
        <Route
          path="/issuer/funds/:id"
          render={(props) => (
            <div className="content">
              <Row>
                <Col xs={12} md={12}>
                  <Card className="card-stats card-raised">
                    <CardBody>
                      <ShowToken {...props} />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
          />
      </div>
    )
  }
}

export default Tokens
