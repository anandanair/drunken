import React, { Component } from 'react';
import {
    Jumbotron,
    Button,
    Card,
    CardBody,
    CardTitle, CardSubtitle, CardText,
    Fade, Collapse, Form, FormGroup, Label,
    Input,
    CustomInput,
    Row,
    Col
} from 'reactstrap';
import firebase from '../../firebase';
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import ReactLoading from "react-loading";
import "bootstrap/dist/css/bootstrap.css";
import * as legoData from '../../loaders/creatingLoading.json';
import * as doneData from '../../loaders/doneLoading.json';

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: legoData.default,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
}

const defaultOptions2 = {
    loop: false,
    autoplay: true,
    animationData: doneData.default,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
};

const database = firebase.database()

class Administration extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pinCode: 0,
            location: null,
            showAddPinCode: false,
            showAddShops: false,
            pinCodeArray: [],
            selectedPincodeIndex: 0,
            storeName: null,
            storeAddress: null,
            storeNumber: null,
            storeDescription: null,
            storeCoverPhoto: null,
            selectedPincode: null,
            validPin: true,
            fileb64String: null,
            loading: false,
            done: false

        };

        this.showAddPinCode = this.showAddPinCode.bind(this);
        this.addPincode = this.addPincode.bind(this);
        this.showAddShops = this.showAddShops.bind(this);
        this.addNewShop = this.addNewShop.bind(this);
        this.verifyPincode = this.verifyPincode.bind(this);
        this.handleFile = this.handleFile.bind(this);
    }

    componentDidMount() {
        var data = []
        database.ref('/pinCode').once('value')
            .then((snapshot) => {
                data = snapshot.val()
                this.setState({
                    pinCodeArray: data
                })
            })
    }

    handleChange = name => event => {
        let value = event.target.value
        this.setState({
            [name]: value
        })
    }

    verifyPincode(cb) {
        var pincode = this.state.selectedPincode

        var ref = database.ref(`pinCodes/${pincode}`).once('value')
            .then((snapshot) => {
                if (snapshot.val()) {
                    this.setState({
                        validPin: true
                    })
                    document.getElementById("verifyPincode").innerHTML = "Verified";
                    document.getElementById("verifyPincode").className = "btn btn-success";
                    cb(true);
                }
                else {
                    this.setState({
                        validPin: false
                    })
                    document.getElementById("verifyPincode").innerHTML = "Invalid";
                    document.getElementById("verifyPincode").className = "btn btn-warning";
                    cb(false);
                }
            })
    }

    getBase64(file, cb) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            cb(reader.result)
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }


    showAddPinCode() {
        this.setState({
            showAddPinCode: !this.state.showAddPinCode
        })
    }
    showAddShops() {
        this.setState({
            showAddShops: !this.state.showAddShops
        })
    }


    addPincode() {
        var total = 0
        var { pinCode, location } = this.state
        // console.log(pinCode.length)
        if (pinCode.length === 6) {
            var ref = database.ref('pinCodes').once('value').then((snapshot) => {
                console.log(snapshot.val())
                total = snapshot.val() ? snapshot.val().length : 0
                console.log(total)
                database.ref((`pinCodes/${pinCode}`)).set({
                    location: location
                },
                    function (error) {
                        if (error) {
                            console.log("Error")
                        }
                        else {
                            window.location.reload()
                            console.log("Success")
                        }
                    })
            })
        }
        else {
            alert("Please input valid Pincode !")
        }


    }

    handleFile(event) {
        // console.log(event.target.files[0])
        var file = event.target.files[0]
        if (file) {
            this.getBase64(file, (result) => {
                // console.log(result)
                this.setState({ fileb64String: result })
            })
        }
    }

    addNewShop() {

        var { selectedPincodeIndex, selectedPincode, fileb64String, storeAddress, storeCoverPhoto, storeDescription, storeName, storeNumber } = this.state
        var total = 0

        var date = new Date()

        var id = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getTime()}`

        this.verifyPincode((cb => {
            if (cb) {
                this.setState({ loading: true })
                var ref = database.ref(`shops/shop${id}`).set({
                    name: storeName,
                    address: storeAddress,
                    contactNumber: storeNumber,
                    displayPicture: storeCoverPhoto,
                    description: storeDescription
                })
                var ref = database.ref(`pinCodes/${selectedPincode}/availableShops`).once('value').then((snapshot) => {
                    console.log(snapshot.val())
                    total = snapshot.val() ? snapshot.val().length : 0
                    console.log(total)
                    var availableShops = []
                    database.ref(`pinCodes/${selectedPincode}/availableShops/${total}`).set({
                        shopId: `shop${id}`,
                        state: 'open'
                    })
                    firebase.storage().ref(`shopCover/shop${id}`).putString(fileb64String, 'data_url')
                        .then(function (snapshot) {
                            console.log('Uploaded a data_url string!');
                        })
                        .catch((error) => {
                            console.log(error)
                        })

                    //EMAIL CREATION
                    var storeEmail = (storeName.replace(/\s+/g, '')).toLowerCase()
                    firebase.auth().createUserWithEmailAndPassword(`${storeEmail}@drunken.com`, `${storeNumber}`)
                        .then((res) => {
                            database.ref(`users/${firebase.auth().currentUser.uid}`).set({
                                role: "consumer",
                                shopId: `shop${id}`
                            })
                            firebase.auth().signOut().then(() => {
                                var email = localStorage.getItem('userEmail')
                                var password = localStorage.getItem('userPassword')
                                firebase.auth().signInWithEmailAndPassword(email, password)
                                    .then(() => {
                                        this.setState({ done: true });
                                        setTimeout(() => {
                                            this.setState(
                                                {
                                                    loading: false
                                                }, () => { this.showAddShops() });
                                        }, 1000);
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    })


                            })
                        })
                        .catch(function (error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;
                            // ...
                        });
                })
            }
            else {
                alert("INVALID PINCODE !")
            }
        }))
    }



    render() {
        const { showAddPinCode, showAddShops, pinCodeArray, validPin, loading, done } = this.state
        return (
            <div>
                {loading
                    ? <FadeIn>
                        <div classname="d-flex justify-content-center align-items-center">
                            {!done ?
                                <Lottie options={defaultOptions} height="60%" width="60%" />
                                : <Lottie options={defaultOptions2} height="60%" width="60%" />
                            }
                        </div>
                    </FadeIn>
                    :
                    <div>
                        <Card>
                            <CardBody>
                                <Collapse isOpen={!showAddPinCode} >
                                    <div>
                                        <Jumbotron>
                                            <h1 className="display-3">Got a new location!</h1>
                                            <p className="lead">This is a simple hero unit, a simple Jumbotron-style component for calling extra attention to featured content or information.</p>
                                            <hr className="my-2" />
                                            <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>
                                            <p className="lead">
                                                <Button color="primary" onClick={this.showAddPinCode} >ADD NEW PINCODE HERE</Button>
                                            </p>
                                        </Jumbotron>
                                    </div>
                                </Collapse>
                                <Collapse isOpen={showAddPinCode} >
                                    <div>
                                        <Jumbotron>
                                            <h1 className="display-3">Add new location!</h1>
                                            <p className="lead">This is a simple hero unit, a simple Jumbotron-style component for calling extra attention to featured content or information.</p>
                                            <hr className="my-2" />
                                            <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>
                                            <Form>
                                                <FormGroup>
                                                    <Label for="pincode" >Pincode</Label>
                                                    <Input type="number" id="pincode" placeholder="Enter your pincode" onChange={this.handleChange("pinCode")}  ></Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="location">Location</Label>
                                                    <Input type="text" id="location" placeholder="Enter the name of the location" onChange={this.handleChange("location")} ></Input>
                                                </FormGroup>
                                            </Form>
                                            <p className="lead">
                                                <Button onClick={this.addPincode} color="primary">ADD PINCODE</Button>&nbsp;&nbsp;
                                             <Button color="secondary" onClick={this.showAddPinCode} >CLOSE</Button>
                                            </p>
                                        </Jumbotron>
                                    </div>
                                </Collapse>
                                <Collapse isOpen={!showAddShops} >
                                    <div>
                                        <Jumbotron>
                                            <h1 className="display-3">Got a new Shop!</h1>
                                            <p className="lead">This is a simple hero unit, a simple Jumbotron-style component for calling extra attention to featured content or information.</p>
                                            <hr className="my-2" />
                                            <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>
                                            <p className="lead">
                                                <Button color="primary" onClick={this.showAddShops} >ADD NEW SHOP HERE</Button>
                                            </p>
                                        </Jumbotron>
                                    </div>
                                </Collapse>
                                <Collapse isOpen={showAddShops} >
                                    <div>
                                        <Jumbotron>
                                            <h1 className="display-3">Add new Shop!</h1>
                                            <p className="lead">This is a simple hero unit, a simple Jumbotron-style component for calling extra attention to featured content or information.</p>
                                            <hr className="my-2" />
                                            <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>
                                            <Form>
                                                <FormGroup>
                                                    <Row>
                                                        <Col>
                                                            <Label for="pincode" >Enter Pincode</Label>
                                                        </Col>
                                                        <Col>
                                                            <Input type="number" id="sPincode" onChange={this.handleChange("selectedPincode")}></Input>
                                                        </Col>
                                                        <Col>
                                                            <Button id="verifyPincode" color="success" onClick={() => { this.verifyPincode((cb) => { }) }} >  Verify </Button>
                                                        </Col>

                                                        {!validPin ? <Col> <small color="danger" > Please enter a valid pincode ! </small></Col> : null}

                                                    </Row>

                                                </FormGroup>
                                                <FormGroup>
                                                    <Input type="text" placeholder="Enter you store's name" onChange={this.handleChange("storeName")} ></Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Input type="number" placeholder="Enter you store's contact number" onChange={this.handleChange("storeNumber")} ></Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Input type="textarea" placeholder="Enter description" onChange={this.handleChange("storeDescription")} ></Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Input type="textarea" placeholder="Enter you store's address" onChange={this.handleChange("storeAddress")} ></Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="exampleCustomFileBrowser">Upload Image for Shop</Label>
                                                    <CustomInput accept="jpg, jpeg, png" type="file" onChange={this.handleFile} id="exampleCustomFileBrowser" name="customFile" />
                                                </FormGroup>
                                            </Form>
                                            <p className="lead">
                                                <Button onClick={this.addNewShop} color="primary">ADD NEW SHOP</Button>&nbsp;&nbsp;
                                            <Button color="secondary" onClick={this.showAddShops} >CLOSE</Button>
                                            </p>
                                        </Jumbotron>
                                    </div>
                                </Collapse>
                            </CardBody>
                        </Card>
                    </div>
                }

            </div>
        )
    }
}

export default Administration;
