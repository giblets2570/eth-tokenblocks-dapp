import React from 'react';
import axios from 'utils/request';
import CreateToken from 'views/Issuer/CreateToken';
import RegCheck from 'views/Issuer/RegCheck';
import {Route,Link} from 'react-router-dom';
import ShowFund from 'views/Issuer/ShowFund'
import {
  Card,CardHeader,CardBody,CardFooter,CardTitle,Row,Col,UncontrolledDropdown,
  DropdownToggle,DropdownMenu,DropdownItem,Table,Button,Tooltip
} from "reactstrap";
import { PanelHeader,Stats,Statistics,CardCategory,Progress } from "components";
import Joyride from 'react-joyride';

export default class Funds extends React.Component {
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
            <Link to={`/issuer/funds/${fund.id}/shareholders`}>
              <span id={`IssuerViewFund${key}`}>View</span>
            </Link>
          </td>
        </tr>
      )
    });
    let {tutorialMode} = this.props
    tutorialMode = tutorialMode && this.props.location.pathname === '/issuer/funds'
    return (
      <div>
        <CreateToken
          isOpen={this.state.fundModal}
          toggle={() => this.toggleTokenModal()}
          {...this.props}
        />
        <RegCheck
          isOpen={this.state.regModal}
          toggle={() => this.toggleRegModal()}
          fund={this.state.fund}
          {...this.props}
        />
        <PanelHeader
          size="sm"
          content={
            <h1>{this.state.fund ? this.state.fund.name : 'Loading...'}</h1>
          }
        />
        <Joyride
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton
          run={!!tutorialMode}
          debug={true}
          disableScrolling={false}
          steps={[
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <h4 style={{fontSize: '22px'}}>Hi! Welcome to TokenBlocks</h4>
                  <p style={{fontSize: '12px'}}>We are going to give your a quick tour so can fully understand what's going on</p>
                </div>
              ),
              placement: "center",
              disableBeacon: true,
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "body"
            },
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <p style={{fontSize: '12px'}}>Here is the table that shows all your funds</p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#IssuerAllFunds"
            },
            {
              content: (
                <div style={{textAlign: 'left'}}>
                  <p style={{fontSize: '12px'}}>Click here to view your fund</p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#IssuerViewFund0"
            }
          ]}
        />
      <Route
        path="/issuer/funds"
        exact={true}
        render={(props) => (
          <div className="content">
          <Row>
            <Col xs={12} md={12}>
              <Card className="card-stats card-raised">
                <CardBody id="IssuerAllFunds">
                  <h3 style={{textAlign: 'center'}}>My Funds</h3>
                  <Table responsive>
                    <thead>
                      <tr className="text-primary">
                        <th>#</th>
                        <th>Name</th>
                        <th></th>
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
                      <ShowFund
                        {...props}
                        tutorialMode={this.props.tutorialMode}
                      />
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
