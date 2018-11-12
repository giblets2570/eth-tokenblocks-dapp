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
import Joyride from 'react-joyride';

class Tokens extends React.Component {
  state = {tooltipsOpen: false}
  componentWillReceiveProps(nextProps){
    setTimeout(() => this.setState({
      tutorialMode: nextProps.tutorialMode &&
      nextProps.location.pathname === '/investor/funds'
    }))
  }
  render() {
    let {tutorialMode} = this.state
    return (
      <div>
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
                <div>
                  <h4>Hi! Welcome to TokenBlocks</h4>
                  <p>We are going to give your a quick tour so can fully understand what's going on</p>
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
                <div>
                  <h4>Fund Snapshot</h4>
                  <p>
                    Here are some details for the a digital share class.
                    You see the fund it belongs to, the symbol of the digital share and the current net asset value (NAV) per share.
                    Your current balance of this share, how much you invested and how much it is currently worth.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#FundRow0"
            },
            {
              content: (
                <div>
                  <h4>View fund</h4>
                  <p>
                    By clicking view, you'll be taken to a page with more information on the digital share.
                  </p>
                </div>
              ),
              styles: {
                options: {
                  zIndex: 10000
                }
              },
              target: "#ChooseToken0"
            },
          ]}
        />
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
                      <TokenChooser
                        {...props}
                        link='/investor/funds'
                        showBalances={true}
                      />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}
            exact={true}
          />
          <Route
            path='/investor/funds/:id'
            render={(props) => (
              <Token
                {...props}
                tutorialMode={this.props.tutorialMode}
              />
            )}
          />
        </div>
      </div>
    )
  }
}

export default Tokens
