import React, { Component } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import { Button, Card, CardBody, CardFooter, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import firebase from '../../../firebase';
import Auth from '../../../auth';

const database = firebase.database()


class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: null,
      password: null,
      loading: false,
      redirectToReferrer: false,
      loginPage: true,
      newEmail: null,
      newPassword: null,

    }
    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.showRegister = this.showRegister.bind(this);
    this.register = this.register.bind(this);

  }

  showRegister() {
    this.setState({
      loginPage: !this.state.loginPage
    })
  }


  handleChange = name => event => {
    let value = event.target.value
    this.setState({
      [name]: value
    })
  }

  login() {
    // window.location.href = "/dashboard"
    var { email, password } = this.state
    localStorage.setItem('userEmail', email)
    localStorage.setItem('userPassword', password)
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((res) => {
        firebase.auth().currentUser.getIdToken()
          .then((idToken) => {
            localStorage.setItem('token', idToken)
            localStorage.setItem('refreshToken', idToken)

            var ref = database.ref(`users/${firebase.auth().currentUser.uid}/role`).once('value').then((snapshot) => {
              console.log(snapshot.val())
            })

            Auth.authenticate(() => {
              this.setState({ redirectToReferrer: true })
            })
            // console.log(idToken)
          })
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
  }

  register() {
    var { newEmail, newPassword } = this.state
    console.log(newEmail, newPassword)
    firebase.auth().createUserWithEmailAndPassword(newEmail, newPassword)
      .then((res) => {
        firebase.auth().currentUser.getIdToken()
          .then((idToken) => {
            localStorage.setItem('token', idToken)
            localStorage.setItem('refreshToken', idToken)
            database.ref(`users/${firebase.auth().currentUser.uid}`).set({
              role: "customer"
            })
            Auth.authenticate(() => {
              this.setState({ redirectToReferrer: true })
            })
            console.log(idToken)
          })
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      })
  }

  render() {
    const { loading, redirectToReferrer, loginPage } = this.state
    return (
      <div>
        {
          loading ? null :
            redirectToReferrer ? <Redirect to='/' />
              : loginPage ?
                <div className="app flex-row align-items-center">
                  <Container>
                    <Row className="justify-content-center">
                      <Col md="8">
                        <CardGroup>
                          <Card className="p-4">
                            <CardBody>
                              <Form>
                                <h1>Login</h1>
                                <p className="text-muted">Sign In to your account</p>
                                <InputGroup className="mb-3">
                                  <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                      <i className="icon-user"></i>
                                    </InputGroupText>
                                  </InputGroupAddon>
                                  <Input type="text" onChange={this.handleChange("email")} placeholder="Username" autoComplete="username" />
                                </InputGroup>
                                <InputGroup className="mb-4">
                                  <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                      <i className="icon-lock"></i>
                                    </InputGroupText>
                                  </InputGroupAddon>
                                  <Input type="password" onChange={this.handleChange("password")} placeholder="Password" autoComplete="current-password" />
                                </InputGroup>
                                <Row>
                                  <Col xs="6">
                                    <Button color="primary" href='#' id="loginBtn" onClick={this.login} className="px-4">Login</Button>
                                  </Col>
                                  <Col xs="6" className="text-right">
                                    <Button color="link" onClick={this.showRegister} className="px-0" >Register Now</Button>
                                    <Button color="link" className="px-0" >Forgot password?</Button>
                                  </Col>
                                </Row>
                              </Form>
                            </CardBody>
                          </Card>
                          <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                            <CardBody className="text-center">
                              <div>
                                <h2>Sign up</h2>
                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.</p>
                                {/* <Link to="/register"> */}
                                <Button color="primary" onClick={this.showRegister} className="mt-3" active tabIndex={-1}>Register Now!</Button>
                                {/* </Link> */}
                              </div>
                            </CardBody>
                          </Card>
                        </CardGroup>
                      </Col>
                    </Row>
                  </Container>
                </div>
                :
                <div className="app flex-row align-items-center">
                  <Container>
                    <Row className="justify-content-center">
                      <Col md="9" lg="7" xl="6">
                        <Card className="mx-4">
                          <CardBody className="p-4">
                            <Form>
                              <h1>Register</h1>
                              <p className="text-muted">Create your account</p>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="icon-user"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input type="text" placeholder="Username" autoComplete="username" />
                              </InputGroup>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>@</InputGroupText>
                                </InputGroupAddon>
                                <Input type="text" onChange={this.handleChange("newEmail")} placeholder="Email" autoComplete="email" />
                              </InputGroup>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="icon-lock"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input type="password" onChange={this.handleChange("newPassword")} placeholder="Password" autoComplete="new-password" />
                              </InputGroup>
                              <InputGroup className="mb-4">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="icon-lock"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input type="password" placeholder="Repeat password" autoComplete="new-password" />
                              </InputGroup>
                              <Button onClick={this.register} color="success" block>Create Account</Button>
                            </Form>
                          </CardBody>
                          <CardFooter className="p-4">
                            <Row>
                              <Col xs="12" sm="4">
                                <Button className="btn-facebook mb-1" block><span>facebook</span></Button>
                              </Col>
                              <Col xs="12" sm="4">
                                <Button className="btn-twitter mb-1" block><span>twitter</span></Button>
                              </Col>
                              <Col xs="12" sm="4">
                                <Button onClick={this.showRegister} className="btn-email mb-1" block><span>Log In</span></Button>
                              </Col>
                            </Row>
                          </CardFooter>
                        </Card>
                      </Col>
                    </Row>
                  </Container>
                </div>
        }
      </div >
    );
  }
}

export default Login;
