import React, { Component } from 'react';
import { Link, useHistory, Redirect } from 'react-router-dom';
import { Button, Card, CardBody, CardFooter, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row, FormFeedback } from 'reactstrap';
import firebase from '../../../firebase';
import Auth from '../../../auth';
import DatePicker from 'react-datepicker';
import subDays from "date-fns/subDays";
import "react-datepicker/dist/react-datepicker.css";
import './Login.css'

import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import ReactLoading from "react-loading";
import "bootstrap/dist/css/bootstrap.css";
import * as checkIn from '../../../loaders/checkIn.json';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: checkIn.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
}



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
      newName: "",
      repeatPassword: null,
      repeatValid: false,
      emailValid: false,
      newDOB: null,
    }
    this.login = this.login.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.showRegister = this.showRegister.bind(this);
    this.register = this.register.bind(this);
    this.verifyPassword = this.verifyPassword.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);

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
        this.setState({ loading: true })
        firebase.auth().currentUser.getIdToken()
          .then((idToken) => {
            localStorage.setItem('token', idToken)
            localStorage.setItem('refreshToken', idToken)

            var ref = database.ref(`users/${firebase.auth().currentUser.uid}/role`).once('value').then((snapshot) => {
              localStorage.setItem('role', snapshot.val())
            })
            setTimeout(() => {
              Auth.authenticate(() => {
                this.setState({ loading: false, redirectToReferrer: true })
              })
            }, 1000);
            // console.log(idToken)
          })
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage)
        document.getElementById('errorMessage').innerHTML = errorMessage
        // ...
      });
  }

  register() {
    var { newEmail, newPassword, newName, newDOB, emailValid, repeatValid } = this.state

    if (newName) {
      document.getElementById('newName').className = 'is-valid form-control'
      if (newDOB) {
        document.getElementById('newDOB').className = 'is-valid form-control'
        if (emailValid) {
          console.log(repeatValid)
          if (repeatValid) {
            this.setState({ loading: true })
            firebase.auth().createUserWithEmailAndPassword(newEmail, newPassword)
              .then(() => {
                firebase.auth().currentUser.getIdToken()
                  .then((idToken) => {
                    localStorage.setItem('token', idToken)
                    localStorage.setItem('refreshToken', idToken)
                    localStorage.setItem('role', 'customer')
                    var user = firebase.auth().currentUser
                    user.sendEmailVerification()
                    database.ref(`users/${user.uid}`).set({
                      role: "customer",
                      dateOfBirth: newDOB
                    })
                    user.updateProfile({
                      displayName: newName,
                    })
                    setTimeout(() => {
                      Auth.authenticate(() => {
                        this.setState({ loading: true, redirectToReferrer: true })
                      })
                    }, 1000);
                  })
              })
              .catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
              })
          }
          else {
            this.verifyPassword('repeatPassword')
          }
        }
        else {
          this.verifyEmail()
        }
      }
      else {
        document.getElementById('newDOB').className = 'is-invalid form-control'
      }
    }
    else {
      document.getElementById('newName').className = 'is-invalid form-control'
    }

  }

  verifyPassword = name => event => {
    var { newPassword, repeatPassword } = this.state
    if (name === "repeatPassword") {
      if (newPassword !== repeatPassword) {
        document.getElementById('repeatPassword').className = 'is-invalid form-control'
        this.setState({
          repeatValid: false
        })
      }
      else {
        document.getElementById('repeatPassword').className = 'is-valid form-control'
        this.setState({
          repeatValid: true
        })
      }
    }
    else {
      if (newPassword.length < 6) {
        document.getElementById('newPassword').className = 'is-invalid form-control'
      }
      else {
        document.getElementById('newPassword').className = 'is-valid form-control'
      }
    }
  }

  verifyEmail() {
    var { newEmail } = this.state
    if (/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]{3}/.test(newEmail)) {
      document.getElementById("newEmail").className = 'is-valid form-control'
      this.setState({ emailValid: true })
    }
    else {
      document.getElementById("newEmail").className = 'is-invalid form-control'
      this.setState({ emailValid: false })
    }

  }

  setStartDate(date) {
    this.setState({
      newDOB: date
    })
  }

  forgotPassword(){
    var { email} = this.state
    firebase.auth().sendPasswordResetEmail(email).then(()=>{
      alert("An email has been send to your verified email... Please follow the instructions.")
    })
  }

  render() {
    const { loading, redirectToReferrer, loginPage, newDOB } = this.state
    return (
      <div>
        {
          loading ?
            <FadeIn>
              <div className="d-flex justify-content-center align-items-center">

                <Lottie options={defaultOptions} height="100%" width="100%" />

              </div>
            </FadeIn>
            :
            redirectToReferrer ? <Redirect to='/' />
              : loginPage ?
                <div className="app flex-row align-items-center">
                  <Container className="container">
                    <Row className="justify-content-center">
                      <Col md="8">
                        <CardGroup>
                          <Card className="p-4">
                            <CardBody>
                              <Form>
                                <h1>Login To Drunken Master</h1>
                                <p className="text-muted">Sign In to your account</p>
                                <InputGroup className="mb-3">
                                  <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                      <i className="icon-user"></i>
                                    </InputGroupText>
                                  </InputGroupAddon>
                                  <Input type="text" id="loginEmail" onChange={this.handleChange("email")} placeholder="Username" />
                                </InputGroup>
                                <InputGroup className="mb-4">
                                  <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                      <i className="icon-lock"></i>
                                    </InputGroupText>
                                  </InputGroupAddon>
                                  <Input type="password" id="loginPassword" onChange={this.handleChange("password")} placeholder="Password" />
                                </InputGroup>
                                <div style={{ color: "red" }} id="errorMessage" ></div>
                                <Row>
                                  <Col xs="6">
                                    <Button color="primary" href='#' id="loginBtn" onClick={this.login} className="px-4">Login</Button>
                                  </Col>
                                  <Col xs="6" className="text-right">
                                    <Button color="link" onClick={this.showRegister} className="px-0" >Register Now</Button>
                                    <Button color="link" onClick={this.forgotPassword}  className="px-0" >Forgot password?</Button>
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
                                <Input id='newName' onChange={this.handleChange("newName")} type="text" placeholder="Name" />
                              </InputGroup>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="icon-calendar"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <DatePicker
                                  id="newDOB"
                                  className='form-control'
                                  selected={newDOB}
                                  onChange={date => this.setStartDate(date)}
                                  maxDate={subDays(new Date(), 6570)}
                                  placeholderText="Select your DOB"
                                  showYearDropdown
                                  showMonthDropdown
                                />
                              </InputGroup>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>@</InputGroupText>
                                </InputGroupAddon>
                                <Input type="text" id="newEmail" onBlur={this.verifyEmail} onChange={this.handleChange("newEmail")} placeholder="Email" />
                              </InputGroup>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="icon-lock"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input type="password" id="newPassword" onBlur={this.verifyPassword("newPassword")} onChange={this.handleChange("newPassword")} placeholder="Password" />
                                <FormFeedback>Password must be more that 6 characters</FormFeedback>
                              </InputGroup>
                              <InputGroup className="mb-4">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="icon-lock"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input type="password" id="repeatPassword" onBlur={this.verifyPassword("repeatPassword")} placeholder="Repeat password" onChange={this.handleChange("repeatPassword")} />
                                <FormFeedback>Passwords do not match</FormFeedback>
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
