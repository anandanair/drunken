import React, { Component } from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
// import { renderRoutes } from 'react-router-config';
import './App.scss';
import Auth from './auth';




const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Login/Login'));
const Register = React.lazy(() => import('./views/Login/Register'));
const Page404 = React.lazy(() => import('./views/Login/Page404'));
const Page500 = React.lazy(() => import('./views/Login/Page500'));

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    Auth.isAuthenticated === true
      ? <Component {...props} />
      : <Login {...props} />
  )} />
)

class App extends Component {

  render() {
    return (
      <HashRouter>
        <React.Suspense fallback={loading()}>
          <Switch>
            {/* <Route exact path="/login" name="Login Page" render={props => <Login {...props} />} />
            <Route exact path="/register" name="Register Page" render={props => <Register {...props} />} />
            <Route exact path="/404" name="Page 404" render={props => <Page404 {...props} />} />
            <Route exact path="/500" name="Page 500" render={props => <Page500 {...props} />} /> */}
            {/* <Route path="/" name="Home" render={props => <DefaultLayout {...props} />} /> */}
            <PrivateRoute path='/' name="Home" component={DefaultLayout} />
            {/* <AuthRoute exact path="/" name="Home" component={DefaultLayout} /> */}
            {/* <Route path="/" name="Home" render={props => <Login {...props}/>} /> */}
          </Switch>
        </React.Suspense>
      </HashRouter>
    );
  }
}

export default App;
