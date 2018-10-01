import React from 'react'

import Dashboard from "views/Dashboard/Dashboard.jsx";
import Buttons from "views/Components/Buttons.jsx";
import GridSystem from "views/Components/GridSystem.jsx";
import Panels from "views/Components/Panels.jsx";
import SweetAlert from "views/Components/SweetAlertPage.jsx";
import Notifications from "views/Components/Notifications.jsx";
import Icons from "views/Components/Icons.jsx";
import Typography from "views/Components/Typography.jsx";
import RegularForms from "views/Forms/RegularForms.jsx";
import ExtendedForms from "views/Forms/ExtendedForms.jsx";
import ValidationForms from "views/Forms/ValidationForms.jsx";
import Wizard from "views/Forms/Wizard/Wizard.jsx";
import RegularTables from "views/Tables/RegularTables.jsx";
import ExtendedTables from "views/Tables/ExtendedTables.jsx";
import ReactTable from "views/Tables/ReactTable.jsx";
import GoogleMaps from "views/Maps/GoogleMaps.jsx";
import FullScreenMap from "views/Maps/FullScreenMap.jsx";
import VectorMap from "views/Maps/VectorMap.jsx";
import Charts from "views/Charts/Charts.jsx";
import Calendar from "views/Calendar/Calendar.jsx";
import Widgets from "views/Widgets/Widgets.jsx";
import UserPage from "views/Pages/UserPage.jsx";
import TimelinePage from "views/Pages/TimelinePage.jsx";
import RTL from "views/Pages/RTL.jsx";


import Token from 'views/Investor/Token'
import Trades from 'views/Investor/Trades'
import Accounts from 'views/Investor/Accounts'
import Profile from 'views/Investor/Profile'


import pagesRoutes from "./pages.jsx";
import axios from 'utils/request'

var pages = [
  {
    path: "/timeline-page",
    name: "Timeline Page",
    mini: "TP",
    component: TimelinePage
  },
  { path: "/user-page", name: "User Profile", mini: "UP", component: UserPage },
  { path: "/rtl-support", name: "RTL Support", mini: "RS", component: RTL }
].concat(pagesRoutes);

var dashRoutes = [
  {
    collapse: true,
    path: "/investor/tokens",
    name: "Tokens",
    state: "openTokens",
    icon: "education_atom",
    auth: 'investor',
    views: [{
      path: `/investor/tokens/1`,
      name: `S&P`,
      component: (props) => <Token {...props} tokenId={1}/>
    },{
      path: `/investor/tokens/2`,
      name: `FTSE 100`,
      component: (props) => <Token {...props} tokenId={2}/>
    },{
      path: `/investor/tokens/3`,
      name: `SFSX`,
      component: (props) => <Token {...props} tokenId={3}/>
    }]
  },
  {
    path: "/investor/trades",
    name: "Trades",
    icon: "design_app",
    auth: 'investor',
    component: Trades
  },
  {
    path: "/investor/accounts",
    name: "Accounts",
    icon: "design_app",
    auth: 'investor',
    component: Accounts
  },
  {
    path: "/investor/profile",
    name: "Profile",
    icon: "design_app",
    auth: 'investor',
    component: Profile
  },
  // {
  //   path: "/dashboard",
  //   name: "Dashboard",
  //   icon: "design_app",
  //   component: Dashboard
  // },
  // {
  //   collapse: true,
  //   path: "/pages",
  //   name: "Pages",
  //   state: "openPages",
  //   icon: "design_image",
  //   views: pages
  // },
  // {
  //   collapse: true,
  //   path: "/components",
  //   name: "Components",
  //   state: "openComponents",
  //   icon: "education_atom",
  //   views: [
  //     {
  //       path: "/components/buttons",
  //       name: "Buttons",
  //       mini: "B",
  //       component: Buttons
  //     },
  //     {
  //       path: "/components/grid-system",
  //       name: "Grid System",
  //       mini: "GS",
  //       component: GridSystem
  //     },
  //     {
  //       path: "/components/panels",
  //       name: "Panels",
  //       mini: "P",
  //       component: Panels
  //     },
  //     {
  //       path: "/components/sweet-alert",
  //       name: "Sweet Alert",
  //       mini: "SA",
  //       component: SweetAlert
  //     },
  //     {
  //       path: "/components/notifications",
  //       name: "Notifications",
  //       mini: "N",
  //       component: Notifications
  //     },
  //     { path: "/components/icons", name: "Icons", mini: "I", component: Icons },
  //     {
  //       path: "/components/typography",
  //       name: "Typography",
  //       mini: "T",
  //       component: Typography
  //     }
  //   ]
  // },
  // {
  //   collapse: true,
  //   path: "/forms",
  //   name: "Forms",
  //   state: "openForms",
  //   icon: "design_bullet-list-67",
  //   views: [
  //     {
  //       path: "/forms/regular-forms",
  //       name: "Regular Forms",
  //       mini: "RF",
  //       component: RegularForms
  //     },
  //     {
  //       path: "/forms/extended-forms",
  //       name: "Extended Forms",
  //       mini: "EF",
  //       component: ExtendedForms
  //     },
  //     {
  //       path: "/forms/validation-forms",
  //       name: "Validation Forms",
  //       mini: "VF",
  //       component: ValidationForms
  //     },
  //     { path: "/forms/wizard", name: "Wizard", mini: "W", component: Wizard }
  //   ]
  // },
  // {
  //   collapse: true,
  //   path: "/tables",
  //   name: "Tables",
  //   state: "openTables",
  //   icon: "files_single-copy-04",
  //   views: [
  //     {
  //       path: "/tables/regular-tables",
  //       name: "Regular Tables",
  //       mini: "RT",
  //       component: RegularTables
  //     },
  //     {
  //       path: "/tables/extended-tables",
  //       name: "Extended Tables",
  //       mini: "ET",
  //       component: ExtendedTables
  //     },
  //     {
  //       path: "/tables/react-table",
  //       name: "React Table",
  //       mini: "RT",
  //       component: ReactTable
  //     }
  //   ]
  // },
  // {
  //   collapse: true,
  //   path: "/maps",
  //   name: "Maps",
  //   state: "openMaps",
  //   icon: "location_pin",
  //   views: [
  //     {
  //       path: "/maps/google-maps",
  //       name: "Google Maps",
  //       mini: "GM",
  //       component: GoogleMaps
  //     },
  //     {
  //       path: "/maps/full-screen-maps",
  //       name: "Full Screen Map",
  //       mini: "FSM",
  //       component: FullScreenMap
  //     },
  //     {
  //       path: "/maps/vector-maps",
  //       name: "Vector Map",
  //       mini: "VM",
  //       component: VectorMap
  //     }
  //   ]
  // },
  // {
  //   path: "/widgets",
  //   name: "Widgets",
  //   icon: "objects_diamond",
  //   component: Widgets
  // },
  // {
  //   path: "/charts",
  //   name: "Charts",
  //   icon: "business_chart-pie-36",
  //   component: Charts
  // },
  // {
  //   path: "/calendar",
  //   name: "Calendar",
  //   icon: "media-1_album",
  //   component: Calendar
  // },
  { redirect: true, path: "/", pathTo: "/dashboard", name: "Dashboard" }
];

export default dashRoutes;
