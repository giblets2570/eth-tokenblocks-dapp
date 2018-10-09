import React from "react";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
import axios from 'utils/request';
import AllTrades from 'views/Broker/OrderTrades';
import brokerRoutes from "routes/broker.jsx";

import { Route, Switch, Redirect } from "react-router-dom";
import { PrivateRoute, Header, Footer, Sidebar } from "components";


var ps;

class Broker extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      routes: brokerRoutes
    }
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
  render() {
    return (
      <div className="wrapper">
        <Sidebar {...this.props} routes={this.state.routes} />
        <div className="main-panel" ref="mainPanel">
          <Header {...this.props} />
          <Switch>
            {this.state.routes.map((prop, key) => {
              if (prop.collapse) {
                return prop.views.map((prop2, key2) => {
                  if(prop2.auth) {
                    return <PrivateRoute
                      path={prop2.path}
                      component={prop2.component}
                      key={key2}
                      role={prop2.auth}
                    />
                  } 
                  return (
                    <Route
                      path={prop2.path}
                      component={prop2.component}
                      key={key2}
                    />
                  );
                });
              }
              if (prop.redirect)
                return <Redirect from={prop.path} to={prop.pathTo} key={key} />;
              else if(prop.auth){
                return <PrivateRoute path={prop.path} component={prop.component} key={key} role={prop.auth}/>
              } return (
                <Route path={prop.path} component={prop.component} key={key} />
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

export default Broker;
