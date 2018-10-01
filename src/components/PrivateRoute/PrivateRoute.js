import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import Auth from 'utils/auth'

function PrivateRoute ({component: Component, role, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => Auth.isAuthenticated(role)
        ? <Component {...props} />
        : <Redirect to={{
          pathname: '/pages/login',
          state: { from: props.location }
        }} />}
    />
  )
}

export default PrivateRoute