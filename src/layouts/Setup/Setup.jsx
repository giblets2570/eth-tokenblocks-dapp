import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Switch, Redirect } from "react-router-dom";

import { PagesHeader, Footer, Button } from "components";
import {
  Container,
  Row,
  Col,
  TabContent,
  TabPane,
  Card,
  CardTitle,
  CardText,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import pagesRoutes from "routes/pages.jsx";

import './Setup.css';

var ps;

export default class Setup extends React.Component {
  state = {}
  setTab(props){
    let activeTab = props.routes.findIndex((route) => {
      return props.location.pathname.indexOf(route.path) > -1
    });
    this.setState({
      activeTab: activeTab
    })
  }
  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(this.refs.fullPages);
    }
    this.setTab(this.props)
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
    }
  }
  componentWillReceiveProps(nextProps){
    this.setTab(nextProps)
  }
  toggle(route){
    this.setState({
      redirect: route.path
    })
  }
  render() {
    if(this.state.redirect && this.props.location.pathname !== this.state.redirect) {
      return <Redirect to={this.state.redirect}/>
    }
    console.log(this.state.activeTab)
    return (
      <div className="Setup">
        <header className="Setup-header">
          <Container>
            <Row>
              <Col xs={2}></Col>
              <Col xs={8}>
                <Nav tabs>
                  {
                    this.props.routes
                    .filter((route) => !route.redirect)
                    .map((route, key) => {
                      return (
                        <NavLink
                          key={key}
                          className={{ active: this.state.activeTab === key }}
                          onClick={() => { this.toggle(route); }}
                          >
                          {route.name}
                        </NavLink>
                      )
                    })
                  }
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                  {
                    this.props.routes
                    .filter((route) => !route.redirect)
                    .map((route, key) => (
                      <TabPane tabId={key} key={key}>
                        <Route path={route.path} component={route.component}/>
                      </TabPane>
                    ))
                  }
                </TabContent>
              </Col>
              <Col xs={2}></Col>
            </Row>
          </Container>
        </header>
        <Footer fluid />
      </div>
    );
  }
}
