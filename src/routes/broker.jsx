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
    collapse: true,
    path: "/broker/tokens",
    name: "Tokens",
    state: "openTokens",
    icon: "education_atom",
    auth: 'broker',
    views: [{
      path: `/broker/tokens/1`,
      name: `S&P`,
      component: (props) => <AllTrades {...props} tokenId={1}/>
    },{
      path: `/broker/tokens/2`,
      name: `FTSE 100`,
      component: (props) => <AllTrades {...props} tokenId={2}/>
    },{
      path: `/broker/tokens/3`,
      name: `SFSX`,
      component: (props) => <AllTrades {...props} tokenId={3}/>
    }]
  },
  { redirect: true, path: "/", pathTo: "/broker", name: "Broker" }
];
export default brokerRoutes;
