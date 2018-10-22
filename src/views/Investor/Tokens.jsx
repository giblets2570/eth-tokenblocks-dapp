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
  FormGroup,
  Label
} from "reactstrap";
import Select from "react-select";
import {
  PanelHeader,
  Stats,
  Statistics,
  CardCategory,
  Progress
} from "components";

import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

import {
  chartsLine1,
  chartsLine2,
  chartsBar1,
  chartsBar2
} from "variables/charts";
import {Redirect} from 'react-router-dom'
import CreateTrade from 'components/CreateTrade/CreateTrade'
import Token from 'views/Investor/Token'

class Tokens extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tokens: [],
      token: null
    }
  }
  async componentDidMount(){
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens`);
    let tokens = response.data;
    let tokenSelect = tokens.map((bs) => ({value: bs, label: `${bs.name} - ${bs.symbol}` }));
    this.setState({
      tokens: tokens,
      tokenSelect: tokenSelect
    });
    let locationParts = this.props.location.pathname.split('/')
    let locationEnd = locationParts[locationParts.length-1]
    for (let i = 0; i < tokens.length; i++) {
      if(String(tokens[i].id) === locationEnd){
        this.setState({ token: tokenSelect[i] })
        break;
      }
    }
  }
  componentWillReceiveProps(nextProps) {

  }
  render() {
    if(this.state.redirect) {
      let locationParts = this.props.location.pathname.split('/')
      let locationEnd = locationParts[locationParts.length-1]
      if(String(this.state.token.value.id) !== locationEnd){
        return <Redirect to={`/investor/tokens/${this.state.token.value.id}`}/>
      }
    }
    return (
      <div>
        <PanelHeader
          size="sm"
          content={
            <p></p>
          }
        />
        <div className="content">
          <Row>
            <Col xs={12} md={12}>
              <Card className="card-stats card-raised">
                <CardBody>
                  <FormGroup>
                    <Label>Choose a Token</Label>
                    <Select
                      className="react-select primary"
                      classNamePrefix="react-select"
                      name="buySell"
                      options={this.state.tokenSelect}
                      value={this.state.token}
                      onChange={(value) => {
                        console.log(value)
                        this.setState({
                          token: value,
                          redirect: true
                        })
                      }}
                    />
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {
            this.state.token
            ? <Token {...this.props} tokenId={this.state.token.value.id}/>
            : null
          }
        </div>
      </div>
    )
  }
}

export default Tokens
