import React from 'react'

import Tokens from 'views/Investor/Tokens'
import Trades from 'views/Investor/Trades'
import Accounts from 'views/Investor/Accounts'
import Profile from 'views/Investor/Profile'

var dashRoutes = [
  {
    path: "/investor/tokens",
    name: "Tokens",
    state: "openTokens",
    icon: "business_money-coins",
    auth: 'investor',
    component: Tokens
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
