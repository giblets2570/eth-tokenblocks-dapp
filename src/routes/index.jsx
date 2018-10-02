import Pages from "layouts/Pages/Pages.jsx";
import Broker from "layouts/Broker/Broker.jsx";
import Issuer from "layouts/Issuer/Issuer.jsx";
import Dashboard from "layouts/Dashboard/Dashboard.jsx";
import Custodian from "layouts/Custodian/Custodian.jsx";

var indexRoutes = [
  { path: "/pages", name: "Pages", component: Pages },
  { path: "/investor", name: "Investor", component: Dashboard, auth: 'investor'},
  { path: "/broker", name: "Broker", component: Broker, auth: 'broker'},
  { path: "/custodian", name: "Custodian", component: Custodian, auth: 'custodian'},
  { path: "/issuer", name: "Issuer", component: Issuer, auth: 'issuer'},
];

export default indexRoutes;
