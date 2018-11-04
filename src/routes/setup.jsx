import DLTSetup from "views/Setup/DLTSetup.jsx";
import BankAccount from "views/Setup/BankAccount.jsx";

const pagesRoutes = [
  {
    path: "/setup/bank-account",
    name: "Bank Account",
    short: "Bank Account",
    component: BankAccount
  },
  {
    path: "/setup/dlt-setup",
    name: "DLT Setup",
    short: "DLT Setup",
    component: DLTSetup
  },
  { redirect: true, path: "/setup", pathTo: "/setup/bank-account", name: "Bank Account" }
];

export default pagesRoutes;
