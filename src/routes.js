import React from 'react';

const Dashboard = React.lazy(() => import('./views/Pages/Dashboard'));
const Administration = React.lazy(() => import('./views/Administration'));
const Consumer = React.lazy(() => import('./views/Consumer'));
const Login = React.lazy(() => import('./views/Login/Login'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/admin', name: 'Administration', component: Administration },
  { path: '/consumer', name: 'Consumer', component: Consumer },
  { path: '/login', name: 'Login', component: Login },
];

export default routes;
