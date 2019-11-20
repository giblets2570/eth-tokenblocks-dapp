
import issuerRoutes from "routes/issuer.jsx";
import investorRoutes from "routes/investor.jsx";
import setupRoutes from "routes/setup.jsx";

import Pages from "layouts/Pages/Pages.jsx";
import Dashboard from "layouts/Dashboard/Dashboard.jsx";
import Setup from "layouts/Setup/Setup.jsx";

var indexRoutes = [
  { path: "/pages", name: "Pages", component: Pages },
  { path: "/investor", name: "Investor", component: Dashboard, auth: 'investor', routes: investorRoutes},
  { path: "/issuer", name: "Issuer", component: Dashboard, auth: 'issuer', routes: issuerRoutes},
  { path: "/setup", name: "Setup", component: Setup, auth: 'investor', routes: setupRoutes},
  { path: "/", name: "Redirect" },
];

export default indexRoutes;
