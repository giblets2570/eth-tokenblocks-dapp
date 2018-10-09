import React from 'react'
import Trades from 'views/Broker/Trades';
import AllTrades from 'views/Broker/OrderTrades';

var brokerRoutes = [
  {
    path: "/broker/trades",
    name: "Trades",
    icon: "design_app",
    auth: 'broker',
    component: Trades
  },
  {
    path: "/broker/tokens",
    name: "Tokens",
    state: "openTokens",
    icon: "education_atom",
    auth: 'broker',
    component: (props) => <AllTrades {...props}/>
  },
  { redirect: true, path: "/", pathTo: "/broker", name: "Broker" }
];
export default brokerRoutes;
