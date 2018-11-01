import LoginPage from "views/Pages/LoginPage.jsx";
import RegisterPage from "views/Pages/RegisterPage.jsx";

const pagesRoutes = [
  {
    path: "/pages/register",
    name: "Register Page",
    short: "Register",
    mini: "RPP",
    icon: "tech_mobile",
    component: RegisterPage
  },
  {
    path: "/pages/login",
    name: "Login Page",
    short: "Login",
    mini: "LP",
    icon: "users_circle-08",
    component: LoginPage
  },
  {
    redirect: true,
    path: "/pages",
    pathTo: "/pages/register",
    name: "Register Page"
  }
];

export default pagesRoutes;
