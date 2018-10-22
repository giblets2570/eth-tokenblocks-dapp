import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import axios from 'utils/request';
import Token from 'views/Investor/Token'

import { Route, Switch, Redirect } from "react-router-dom";
import { PrivateRoute, Header, Footer, Sidebar } from "components";

var ps;

class Dashboard extends React.Component {
  constructor(props){
    super(props)
    this.state = {};
  }
  async componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(this.refs.mainPanel);
    }
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
      document.documentElement.className += " perfect-scrollbar-off";
      document.documentElement.classList.remove("perfect-scrollbar-on");
    }
  }
  componentDidUpdate(e) {
    if (e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainPanel.scrollTop = 0;
    }
  }
  showTooltips() {
    this.setState({
      tooltipsOpen: !this.state.tooltipsOpen
    })
  }
  render() {
    return (
      <div className="wrapper">
        <Sidebar {...this.props} />
        <div className="main-panel" ref="mainPanel">
          <Header {...this.props} showTooltips={() => this.showTooltips()}/>
          <Switch>
            {this.props.routes.map((prop, key) => {
              let Component = prop.component
              if (prop.collapse) {
                return prop.views.map((prop2, key2) => {
                  Component = prop2.component
                  if(prop2.auth) {
                    return <PrivateRoute
                      path={prop2.path}
                      render={(props) => <Component {...props} tooltipsOpen={this.state.tooltipsOpen} />}
                      key={key2}
                      role={prop2.auth}
                    />
                  } 
                  return (
                    <Route
                      path={prop2.path}
                      render={(props) => <Component {...props} tooltipsOpen={this.state.tooltipsOpen} />}
                      key={key2}
                    />
                  );
                });
              }
              if (prop.redirect)
                return <Redirect from={prop.path} to={prop.pathTo} key={key} />;
              else if(prop.auth){
                return (
                  <PrivateRoute
                    path={prop.path}
                    render={(props) => <Component {...props} tooltipsOpen={this.state.tooltipsOpen} />}
                    key={key}
                    role={prop.auth}
                  />
                )
              } return (
                <Route
                  path={prop.path} 
                  render={(props) => <Component {...props} tooltipsOpen={this.state.tooltipsOpen} />}
                  key={key} 
                />
              );
            })}
          </Switch>
          {// we don't want the Footer to be rendered on full screen maps page
          this.props.location.pathname.indexOf("full-screen-maps") !==
          -1 ? null : (
            <Footer fluid />
          )}
        </div>
      </div>
    );
  }
}

export default Dashboard;
