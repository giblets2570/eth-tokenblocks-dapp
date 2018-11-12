import React from "react"
import Funds from "views/Issuer/Funds";
import Trades from "views/Issuer/Trades";

var issuerRoutes = [
  {
    path: "/issuer/funds",
    name: "Funds",
    icon: "business_money-coins",
    auth: "issuer",
    component: Funds
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
