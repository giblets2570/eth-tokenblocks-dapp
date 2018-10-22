import React from "react"
import Tokens from "views/Issuer/Tokens";

var issuerRoutes = [
  {
    path: "/issuer/funds",
    name: "Funds",
    icon: "business_money-coins",
    auth: "issuer",
    component: Tokens
  },
  { redirect: true, path: "/issuer", pathTo: "/issuer/funds", name: "Issuer" }
];
export default issuerRoutes;
