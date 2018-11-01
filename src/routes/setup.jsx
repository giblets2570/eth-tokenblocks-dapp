import DLTSetup from "views/Setup/DLTSetup.jsx";
import BankAccount from "views/Setup/BankAccount.jsx";

const pagesRoutes = [
  {
    path: "/setup/bank-account",
    name: "Bank Account",
    short: "Register",
    component: DLTSetup
  },
  {
    path: "/setup/dlt-setup",
    name: "DLT Setup",
    short: "Login",
    component: BankAccount
  },
  { redirect: true, path: "/setup", pathTo: "/setup/bank-account", name: "Bank Account" }
];

export default pagesRoutes;
