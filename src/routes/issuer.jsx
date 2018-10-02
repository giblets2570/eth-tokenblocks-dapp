import React from "react"
import Tokens from "views/Issuer/Tokens";

var issuerRoutes = [
  {
    path: "/issuer/tokens",
    name: "Tokens",
    icon: "business_money-coins",
    auth: "issuer",
    component: Tokens
  },
  { redirect: true, path: "/", pathTo: "/issuer", name: "Issuer" }
];
export default issuerRoutes;
