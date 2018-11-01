import React from "react"
import Tokens from "views/Issuer/Tokens";
import Trades from "views/Issuer/Trades";

var issuerRoutes = [
  {
    path: "/issuer/funds",
    name: "Funds",
    icon: "business_money-coins",
    auth: "issuer",
    component: Tokens
  },
  {
    path: "/issuer/trades",
    name: "Trades",
    icon: "design_app",
    auth: 'issuer',
    component: Trades
  },
  { redirect: true, path: "/issuer", pathTo: "/issuer/funds", name: "Issuer" }
];
export default issuerRoutes;
