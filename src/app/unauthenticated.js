import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { LoginCallback } from 'context/auth';
import Login from 'pages/login';

const UnauthenticatedApp = () => (
  <Switch>
    <Route exact path="/" component={Login} />
    <Route exact path="/login" component={LoginCallback} />
    <Route exact path="/logout">
      <Redirect to="/" />
    </Route>
    <Route>
      <Redirect to="/" />
    </Route>
  </Switch>
);

export default UnauthenticatedApp;
