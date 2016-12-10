import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router'
import BusRoutes from './BusRoutes';
import BusesMap from './BusesMap';
import './index.css';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={BusRoutes} />
    <Route path="/map" component={BusesMap} />
  </Router>
), document.getElementById('root'));
