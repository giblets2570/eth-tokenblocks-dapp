import React from 'react'

import Token from 'views/Investor/Token'
import Trades from 'views/Investor/Trades'
import Accounts from 'views/Investor/Accounts'
import Profile from 'views/Investor/Profile'

var dashRoutes = [
  {
    collapse: true,
    path: "/investor/tokens",
    name: "Tokens",
    state: "openTokens",
    icon: "business_money-coins",
    auth: 'investor',
    views: [{
      path: `/investor/tokens/1`,
      name: `S&P`,
      component: (props) => <Token {...props} tokenId={1}/>
    },{
      path: `/investor/tokens/2`,
      name: `FTSE 100`,
      component: (props) => <Token {...props} tokenId={2}/>
    },{
      path: `/investor/tokens/3`,
      name: `SFSX`,
      component: (props) => <Token {...props} tokenId={3}/>
    }]
  },
  {
    path: "/investor/trades",
    name: "Trades",
    icon: "files_paper",
    auth: 'investor',
    component: Trades
  },
  {
    path: "/investor/accounts",
    name: "Accounts",
    icon: "business_globe",
    auth: 'investor',
    component: Accounts
  },
  {
    path: "/investor/profile",
    name: "Profile",
    icon: "users_single-02",
    auth: 'investor',
    component: Profile
  },
  { redirect: true, path: "/", pathTo: "/dashboard", name: "Dashboard" }
];

export default dashRoutes;
