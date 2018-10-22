
import issuerRoutes from "routes/issuer.jsx";
import brokerRoutes from "routes/broker.jsx";
import investorRoutes from "routes/dashboard.jsx";
import custodianRoutes from "routes/custodian.jsx";

import Pages from "layouts/Pages/Pages.jsx";
import Dashboard from "layouts/Dashboard/Dashboard.jsx";

var indexRoutes = [
  { path: "/pages", name: "Pages", component: Pages },
  { path: "/investor", name: "Investor", component: Dashboard, auth: 'investor', routes: investorRoutes},
  { path: "/broker", name: "Broker", component: Dashboard, auth: 'broker', routes: brokerRoutes},
  { path: "/custodian", name: "Custodian", component: Dashboard, auth: 'custodian', routes: custodianRoutes},
  { path: "/issuer", name: "Issuer", component: Dashboard, auth: 'issuer', routes: issuerRoutes},
];

export default indexRoutes;
