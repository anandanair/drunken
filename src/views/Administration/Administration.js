import React, { Component } from 'react';
import {
    Jumbotron,
    Button,
    Card,
    CardBody,
    CardTitle, CardSubtitle, CardText,
    Fade, Collapse, Form, FormGroup, Label,
    Input
} from 'reactstrap';
import firebase from '../../firebase';

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

        };

        this.showAddPinCode = this.showAddPinCode.bind(this);
        this.addPincode = this.addPincode.bind(this);
        this.showAddShops = this.showAddShops.bind(this);
        this.addNewShop = this.addNewShop.bind(this);
        this.verifyPincode = this.verifyPincode.bind(this);
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

                    cb(true);
                }
                else {
                    this.setState({
                        validPin: false
                    })
                    cb(false);
                }
            })
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

    addNewShop() {
        var { selectedPincodeIndex, selectedPincode, validPin, storeAddress, storeCoverPhoto, storeDescription, storeName, storeNumber } = this.state
        var total = 0

        var date = new Date()

        var id = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getTime()}`

        this.verifyPincode((cb => {

            if (cb) {
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

                    //EMAIL CREATION
                    firebase.auth().createUserWithEmailAndPassword(`${storeName}@drunken.com`, `${storeNumber}`)
                        .then((res) => {
                            database.ref(`users/${firebase.auth().currentUser.uid}`).set({
                                role: "consumer"
                            })
                            firebase.auth().signOut().then(() => {
                                var email = localStorage.getItem('userEmail')
                                var password = localStorage.getItem('userPassword')
                                firebase.auth().signInWithEmailAndPassword(email, password)
                                .then(()=>{
                                    window.location.reload();
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
        const { showAddPinCode, showAddShops, pinCodeArray, validPin } = this.state
        return (
            <div>
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
                                                <Label for="pincode" >Enter Pincode</Label>
                                                <Input type="number" id="sPincode" onChange={this.handleChange("selectedPincode")}></Input>
                                                {!validPin ? <small color="red" > Please enter a valid pincode ! </small> : null}
                                                <Button color="success" onClick={() => { this.verifyPincode((cb) => { }) }} > Verify </Button>
                                                {/*                                                  <Input defaultValue="test" type="select" id="sPincode" onChange={this.handleChange("selectedPincodeIndex")} >
                                                     <option value="test" disabled >Please select a pincode !</option>
//                                                     {pinCodeArray.map((arr, i) => ( */}
                                                {/* //                                                         <op tion key={i} value={i} > {`${arr.pinCode} / ${arr.location}`} </option> */}
                                                {/* //                                                     ))} */}
                                                {/* //                                                 </Input> */}
                                            </FormGroup>
                                            <FormGroup>
                                                <Input type="text" placeholder="Enter you store's name" onChange={this.handleChange("storeName")} ></Input>
                                            </FormGroup>
                                            <FormGroup>
                                                <Input type="number" placeholder="Enter you store's contact number" onChange={this.handleChange("storeNumber")} ></Input>
                                            </FormGroup>
                                            <FormGroup>
                                                <Input type="text" placeholder="Enter description" onChange={this.handleChange("storeDescription")} ></Input>
                                            </FormGroup>
                                            <FormGroup>
                                                <Input type="text" placeholder="Enter you store's address" onChange={this.handleChange("storeAddress")} ></Input>
                                            </FormGroup>
                                            <FormGroup>
                                                <Input type="text" placeholder="Add a cover photo" onChange={this.handleChange("storeCoverPhoto")} ></Input>
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

            </div>
        )
    }
}

export default Administration;
