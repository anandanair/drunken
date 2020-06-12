import React, { Component } from 'react';
import { Button, Card, CardBody, CustomInput, Jumbotron, Modal, ModalBody, ModalHeader, ModalFooter, Form, FormGroup, Input, Label } from 'reactstrap';
import firebase from '../../firebase';

const database = firebase.database()

class Consumer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            shopDetails: null,
            showModal: false,
            fileb64String: null,
            drinkName: null,
            drinkPrice: null,
            drinkDesc: null,
            shopId: null
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.addNewDrink = this.addNewDrink.bind(this);



    }


    componentDidMount() {
        firebase.auth().onAuthStateChanged(currentUser => {
            database.ref(`users/${currentUser.uid}`).once('value').then((snapshot) => {
                var shopId = snapshot.val().shopId
                this.setState({ shopId: shopId })
                database.ref(`shops/${shopId}`).once('value').then((snapshot) => {
                    var obj = snapshot.val()
                    firebase.storage().ref(`shopCover/${shopId}`).getDownloadURL().then((url) => {
                        obj.coverImage = url
                        this.setState({
                            shopDetails: obj
                        })
                    })

                })
                database.ref(`shops/${shopId}/drinks`).once('value').then((snapshot) => {
                    console.log(snapshot.val())
                })
            })

        })



    }

    toggle() {
        this.setState({ showModal: !this.state.showModal })
    }

    handleChange = name => event => {
        let value = event.target.value
        this.setState({
            [name]: value
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

    handleFile(event) {
        // console.log(event.target.files[0])
        var file = event.target.files[0]
        if (file) {
            this.getBase64(file, (result) => {
                // console.log(result)
                this.setState({ fileb64String: result })
                console.log(result)


            })
        }
    }

    addNewDrink() {
        const { drinkName, drinkDesc, drinkPrice, fileb64String, shopId } = this.state

        var newKey = database.ref(`shops/${shopId}/drinks`).push({
            name: drinkName,
            description: drinkDesc,
            price: drinkPrice
        }).key
        database.ref(`drinks/${drinkName}`).set({
            name: drinkName,
            description: drinkDesc,
            price: drinkPrice,
            imageId: newKey
        })

        firebase.storage().ref(`drinksImages/${newKey}`).putString(fileb64String, 'data_url').then(function (snapshot) {
            console.log('Uploaded a data_url string!');
        })
    }



    render() {
        const { shopDetails, showModal } = this.state
        return (
            <div>
                {shopDetails ?
                    <div>
                        {/* <Jumbotron>
                            <img src={shopDetails.coverImage} class="img-fluid" alt="Responsive image" />
                        </Jumbotron> */}
                        <Card>
                            <CardBody>
                                <Jumbotron>
                                    <h1 className="display-3">Welcome to {shopDetails.name}</h1>
                                    <p className="lead">This is a simple hero unit, a simple Jumbotron-style component for calling extra attention to featured content or information.</p>
                                    <hr className="my-2" />
                                    <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>
                                    <p className="lead">
                                    </p>
                                    <Button onClick={this.toggle} block >Add Drinks</Button>
                                </Jumbotron>
                            </CardBody>
                        </Card>
                        <Modal isOpen={showModal} >
                            <ModalHeader>Modal title</ModalHeader>
                            <ModalBody>
                                <Form>
                                    <FormGroup>
                                        <Label>Drink Name</Label>
                                        <Input onChange={this.handleChange("drinkName")} type="text"></Input>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Description</Label>
                                        <Input onChange={this.handleChange("drinkDesc")} type="text"></Input>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Price</Label>
                                        <Input onChange={this.handleChange("drinkPrice")} type="text"></Input>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="exampleCustomFileBrowser">Upload Image for Shop</Label>
                                        <CustomInput accept="jpg, jpeg, png" type="file" onChange={this.handleFile} id="exampleCustomFileBrowser" name="customFile" />
                                    </FormGroup>
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={this.addNewDrink}>Do Something</Button>{' '}
                                <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                            </ModalFooter>
                        </Modal>

                    </div>
                    : <div>Loading</div>
                }
            </div>
        )
    }
}

export default Consumer;
