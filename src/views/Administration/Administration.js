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
            showAddPinCode: false
        };

        this.showAddPinCode = this.showAddPinCode.bind(this);
        this.addPincode = this.addPincode.bind(this);
    }

    componentDidMount() {
        var ref = database.ref('/pinCode').once('value').then(function (snapshot) {
            console.log(snapshot.val().length)
        })
    }

    handleChange = name => event => {
        let value = event.target.value
        this.setState({
            [name]: value
        })
    }

    showAddPinCode() {
        this.setState({
            showAddPinCode: !this.state.showAddPinCode
        })
    }

    addPincode() {
        var total = 0
        var postData = {
            pinCode: this.state.pinCode
        }
        var ref = database.ref('/pinCode').once('value').then(function (snapshot) {
            total = snapshot.val().length
            console.log(total)
            console.log('pincode_' + (total + 1))
            database.ref((total + 1)).set({ postData },
                function (error) {
                    if (error) {
                        console.log("Error")
                    }
                    else {
                        console.log("Success")
                    }
                })
        })


    }



    render() {
        const { showAddPinCode } = this.state
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
                                        </Form>
                                        <p className="lead">
                                            <Button onClick={this.addPincode} color="primary">ADD PINCODE</Button>&nbsp;&nbsp;
                                            <Button color="secondary" onClick={this.showAddPinCode} >CLOSE</Button>
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
