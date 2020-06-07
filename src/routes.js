import React from 'react';

const Dashboard = React.lazy(() => import('./views/Pages/Dashboard'));
const Administration = React.lazy(() => import('./views/Administration'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/admin', name: 'Administration', component: Administration },
];

export default routes;
