import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import { Route, Switch, Redirect } from "react-router-dom";

import { SetupHeader, Footer, Button } from "components";
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
import setupRoutes from "routes/setup.jsx";

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
      <div>
        <SetupHeader {...this.props} />
        <div className="wrapper wrapper-full-page" ref="fullPages">
          <div className="full-page section-image">
            <Switch>
              {setupRoutes.map((prop, key) => {
                if (prop.redirect)
                  return (
                    <Redirect from={prop.path} to={prop.pathTo} key={key} />
                  );
                return (
                  <Route
                    path={prop.path}
                    component={prop.component}
                    key={key}
                  />
                );
              })}
            </Switch>
            <Footer fluid />
          </div>
        </div>
      </div>
    );
  }
}
