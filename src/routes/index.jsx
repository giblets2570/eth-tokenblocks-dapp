
import issuerRoutes from "routes/issuer.jsx";
// import brokerRoutes from "routes/broker.jsx";
import investorRoutes from "routes/investor.jsx";
// import custodianRoutes from "routes/custodian.jsx";
import setupRoutes from "routes/setup.jsx";

import Pages from "layouts/Pages/Pages.jsx";
import Dashboard from "layouts/Dashboard/Dashboard.jsx";
import Setup from "layouts/Setup/Setup.jsx";

var indexRoutes = [
  // { path: "/broker", name: "Broker", component: Dashboard, auth: 'broker', routes: brokerRoutes},
  // { path: "/custodian", name: "Custodian", component: Dashboard, auth: 'custodian', routes: custodianRoutes},
  { path: "/pages", name: "Pages", component: Pages },
  { path: "/investor", name: "Investor", component: Dashboard, auth: 'investor', routes: investorRoutes},
  { path: "/issuer", name: "Issuer", component: Dashboard, auth: 'issuer', routes: issuerRoutes},
  { path: "/setup", name: "Setup", component: Setup, auth: 'investor', routes: setupRoutes},
];

export default indexRoutes;
