import React from 'react';

const Dashboard = React.lazy(() => import('./views/Pages/Dashboard'));
const Administration = React.lazy(() => import('./views/Administration'));
const Consumer = React.lazy(() => import('./views/Consumer'));
const Login = React.lazy(() => import('./views/Login/Login'));
const ShopDetails = React.lazy(() => import('./views/Pages/ShopDetails'));
const Logout = React.lazy(() => import('./views/Login/Logout'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/admin', name: 'Administration', component: Administration },
  { path: '/consumer', name: 'Consumer', component: Consumer },
  { path: '/login', name: 'Login', component: Login },
  { path: '/shops/:shopId/:shopName', name: 'Shop', component: ShopDetails },
  { path: '/logout', name: 'Logout', component: Logout },
];

export default routes;
