import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import { Router, Route, Switch } from "react-router-dom";
import { PrivateRoute } from "components"

import "bootstrap/dist/css/bootstrap.css";
import "assets/scss/now-ui-dashboard.css?v=1.2.0";
import "assets/css/demo.css";

import indexRoutes from "routes/index.jsx";

const hist = createBrowserHistory();

ReactDOM.render(
  <Router history={hist}>
    <Switch>
      {indexRoutes.map((prop, key) => {
        if(prop.auth){
          return (<PrivateRoute
            path={prop.path}
            component={prop.component}
            key={key}
            role={prop.auth}
          />)
        }
        return (
          <Route path={prop.path} key={key} component={prop.component} />
        );
      })}
    </Switch>
  </Router>,
  document.getElementById("root")
);