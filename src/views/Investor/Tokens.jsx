import React from 'react'
import axios from 'utils/request'
import {
  Card,CardHeader,CardBody,CardFooter,CardTitle,Row,
  Col,UncontrolledDropdown,DropdownToggle,DropdownMenu,
  DropdownItem,Table,Button,FormGroup,Label,Tooltip
} from "reactstrap";
import Select from "react-select";
import {
  PanelHeader,Stats,Statistics,
  CardCategory,Progress,TokenChooser
} from "components";

import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

import {
  chartsLine1,
  chartsLine2,
  chartsBar1,
  chartsBar2
} from "variables/charts";
import {Redirect,Route,Link} from 'react-router-dom';
import CreateTrade from 'components/CreateTrade/CreateTrade';
import Token from 'views/Investor/Token';

class Tokens extends React.Component {
  state = {tooltipsOpen: false}
  componentWillReceiveProps(nextProps){
    setTimeout(() => this.setState({
      tooltipsOpen: nextProps.tooltipsOpen &&
      nextProps.location.pathname === '/investor/funds'
    }))
  }
  render() {
    return (
      <div>
        <PanelHeader
          size="sm"
          content={
            <p></p>
          }
        />
        <div className="content">
          <Route
            path='/investor/funds'
            render={(props) => (
              <Row>
                <Col xs={12} md={12}>
                  <Card className="card-stats card-raised">
                    <CardBody id="InvestorTokenChooser">
                      <TokenChooser {...props} tooltipsOpen={this.state.tooltipsOpen} link='/investor/funds'/>
                    </CardBody>
                  </Card>
                </Col>
                <Tooltip placement="top" isOpen={this.state.tooltipsOpen} target="InvestorTokenChooser">
                  Here is where you choose your tokens to invest in
                </Tooltip>
              </Row>
            )}
            exact={true}
          />
          <Route
            path='/investor/funds/:id'
            render={(props) => (
              <Token
                {...props}
                tooltipsOpen={this.props.tooltipsOpen}
              />
            )}
          />
        </div>
      </div>
    )
  }
}

export default Tokens
