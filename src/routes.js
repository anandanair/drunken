import React from 'react';

const Dashboard = React.lazy(() => import('./views/Pages/Dashboard'));
const Administration = React.lazy(() => import('./views/Administration'));
const Login = React.lazy(() => import('./views/Login/Login'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/admin', name: 'Administration', component: Administration },
  { path: '/login', name: 'Administration', component: Login },
];

export default routes;
