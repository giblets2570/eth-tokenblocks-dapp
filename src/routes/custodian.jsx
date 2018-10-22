import React from "react"
import Orders from "views/Custodian/Orders";

var custodianRoutes = [
  {
    path: "/custodian/orders",
    name: "Orders",
    icon: "design_app",
    auth: "custodian",
    component: Orders
  },
  { redirect: true, path: "/custodian", pathTo: "/custodian/orders", name: "Custodian" }
];
export default custodianRoutes;
