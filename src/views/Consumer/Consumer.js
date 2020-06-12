import React, { Component } from 'react';
import { Button, Card, CardBody, CustomInput, Jumbotron, Modal, ModalBody, ModalHeader, ModalFooter, Form, FormGroup, Input, Label, CardHeader, CardDeck, CardImg, CardTitle, CardSubtitle, Collapse, Fade, CardFooter, Toast, ToastBody, ToastHeader, Badge, Col, Row } from 'reactstrap';
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
            shopId: null,
            drinks: [],
            showDrinks: false,
            loading: true,
            showSearch: false,
            allDrinks: [],
            showUpdate: false,
            currentDrink: null,
            updatePrice: null,
            updateStock: null,
        };

        this.toggle = this.toggle.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.addNewDrink = this.addNewDrink.bind(this);
        this.showDrinks = this.showDrinks.bind(this);
        this.addExistingDrink = this.addExistingDrink.bind(this);
        this.showSearch = this.showSearch.bind(this);
        this.deleteDrink = this.deleteDrink.bind(this);
        this.showUpdate = this.showUpdate.bind(this);
        this.updateDrink = this.updateDrink.bind(this);



    }


    componentDidMount() {
        this.setState({ loading: true })
        firebase.auth().onAuthStateChanged(currentUser => {
            database.ref(`users/${currentUser.uid}`).once('value')
                .then((snapshot) => {
                    var shopId = snapshot.val().shopId
                    this.setState({ shopId: shopId })
                    database.ref(`shops/${shopId}`).once('value')
                        .then((snapshot) => {
                            var obj = snapshot.val()
                            firebase.storage().ref(`shopCover/${shopId}`).getDownloadURL()
                                .then((url) => {
                                    obj.coverImage = url
                                    this.setState({
                                        shopDetails: obj,
                                        loading: false
                                    })
                                })
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

        database.ref(`shops/${shopId}/drinks/${drinkName}`).set({
            name: drinkName,
            description: drinkDesc,
            price: drinkPrice
        })

        firebase.storage().ref(`drinksImages/${drinkName}`).putString(fileb64String, 'data_url')
            .then(function (snapshot) {
                console.log(snapshot)
                firebase.storage().ref(`drinksImages/${drinkName}`).getDownloadURL().then((url) => {
                    database.ref(`shops/${shopId}/drinks/${drinkName}`).update({
                        imageUrl: url
                    })
                    database.ref(`drinks/${drinkName}`).set({
                        name: drinkName,
                        description: drinkDesc,
                        price: drinkPrice,
                        imageUrl: url
                    })

                })
            })
    }

    getDrinks(cb) {
        var drinksArray = []
        database.ref(`shops/${this.state.shopId}/drinks`).once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var childData = childSnapshot.val();
                childData.childKey = childSnapshot.key;
                childData.img = "test"
                firebase.storage().ref(`drinksImages/${childSnapshot.key}`).getDownloadURL().then((url) => {
                    childData.img = url
                    console.log(url)
                })
                drinksArray.push(childData)
            });
            console.log(drinksArray)
            cb(drinksArray)
        })
    }

    showDrinks() {
        this.getDrinks(cb => {
            console.log(cb)
            this.setState({
                drinks: cb,
                showDrinks: !this.state.showDrinks
            })
        })
    }

    showSearch() {
        this.getAllDrinks()
        this.setState({
            showSearch: true
        })
    }

    getAllDrinks() {
        var { shopId } = this.state
        database.ref(`drinks`).once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                var childData = childSnapshot.val()
                var childKey = childSnapshot.key
                database.ref(`shops/${shopId}/drinks/${childKey}`).once('value').then((snap) => {
                    var exist = snap.exists()
                    console.log(exist)
                    if (!exist) {
                        this.setState(state => {
                            const allDrinks = this.state.allDrinks.concat(childData)
                            return {
                                allDrinks
                            }
                        })
                    }
                })
            })
        })
    }

    addExistingDrink(name, description, price, imageUrl) {
        var { shopId } = this.state
        database.ref(`shops/${shopId}/drinks/${name}`).set({
            name: name,
            description: description,
            price: price,
            imageUrl: imageUrl
        })
        window.location.reload()
    }

    deleteDrink(name) {
        var { shopId } = this.state
        database.ref(`shops/${shopId}/drinks/${name}`).remove().then(() => {
            window.location.reload()
        })
    }

    showUpdate(name) {
        this.setState({
            currentDrink: name,
            showUpdate: !this.state.showUpdate
        })
    }

    updateDrink() {
        var { currentDrink, updatePrice, updateStock, shopId } = this.state
        console.log(currentDrink)
        database.ref(`shops/${shopId}/drinks/${currentDrink}`).update({
            price: updatePrice,
            stock: updateStock
        }).then(() => {
            this.setState({
                showUpdate: false,
                showDrinks: false
            })
            // window.location.reload()
        })
    }


    render() {
        const { shopDetails, showModal, shopId, loading, drinks, showDrinks, showSearch, allDrinks, showUpdate, currentDrink } = this.state
        return (
            <div>
                {!showSearch ?
                    !loading ?
                        <Fade>
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
                                        <Button onClick={this.showSearch} block >Search Drinks</Button>
                                    </Jumbotron>
                                </CardBody>
                            </Card>

                            {/* <Card> */}
                            {/* <CardBody> */}
                            <Button onClick={this.showDrinks} block >Show all Drinks</Button>

                            {/* </CardBody> */}
                            {/* </Card> */}

                            <Collapse isOpen={showDrinks} >
                                <Jumbotron>
                                    <CardDeck>
                                        {drinks.map(drink => (
                                            <Card key={drink.childKey}>
                                                <CardImg top width="100%" src={drink.imageUrl} alt="Card image cap" />
                                                <CardBody>


                                                    <Toast>
                                                        <ToastHeader> {drink.name} </ToastHeader>
                                                        <ToastBody>
                                                            {/* <CardTitle> {drink.name} </CardTitle> */}
                                                            <CardSubtitle> {drink.description} </CardSubtitle>
                                                            <CardSubtitle>Price: {drink.price} </CardSubtitle>
                                                        </ToastBody>
                                                    </Toast>
                                                    <Toast>
                                                        <ToastHeader>
                                                            <Row>
                                                                <Col>
                                                                    Stock
                                                            </Col>
                                                                <Col>
                                                                    {drink.stock ?
                                                                        drink.stock < 20 ? <Badge color="warning" > Stock running low </Badge>
                                                                            : <Badge color="success">in Stock</Badge>
                                                                        : <Badge color="danger">Out of Stock</Badge>
                                                                    }
                                                                </Col>
                                                            </Row>


                                                        </ToastHeader>
                                                        <ToastBody> {drink.stock ? drink.stock : 'Not yet updated'} </ToastBody>
                                                    </Toast>

                                                </CardBody>
                                                <CardFooter>
                                                    <Row>
                                                        <Col>
                                                            <Button onClick={() => { this.deleteDrink(drink.name) }} color="danger">Delete</Button>
                                                        </Col>
                                                        <Col>
                                                            <Button onClick={() => { this.showUpdate(drink.name) }} color="primary">Update</Button>
                                                        </Col>
                                                    </Row>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </CardDeck>
                                </Jumbotron>
                            </Collapse>

                            <Modal isOpen={showUpdate}>
                                <ModalHeader>Update Details for {currentDrink} </ModalHeader>
                                <ModalBody>
                                    <Form>
                                        <FormGroup>
                                            <Label>Price</Label>
                                            <Input onChange={this.handleChange("updatePrice")} type="number"></Input>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label>Stock</Label>
                                            <Input onChange={this.handleChange("updateStock")} type="number"></Input>
                                        </FormGroup>
                                    </Form>
                                </ModalBody>
                                <ModalFooter>
                                    <Button onClick={this.updateDrink}>Update</Button>
                                    <Button onClick={() => { this.showUpdate(null) }}>Close</Button>
                                </ModalFooter>
                            </Modal>

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

                        </Fade>
                        : <div>Loading</div>

                    : <Fade>
                        <div>
                            <Card>
                                <CardBody>
                                    <Jumbotron>
                                        <h3>Search for drinks</h3>
                                        <Input type="text" ></Input>
                                    </Jumbotron>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <CardDeck>
                                        {allDrinks.map((drink, index) => (
                                            <Card key={index} >
                                                <CardImg top width="100%" src={drink.imageUrl} alt="Card image cap" />
                                                <CardBody>
                                                    <CardTitle> {drink.name} </CardTitle>
                                                    <CardSubtitle> {drink.description} </CardSubtitle>
                                                    <CardSubtitle> {drink.price} </CardSubtitle>
                                                </CardBody>
                                                <CardFooter>
                                                    <Button onClick={() => this.addExistingDrink(drink.name, drink.description, drink.price, drink.imageUrl)} > Add </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </CardDeck>
                                </CardBody>
                            </Card>
                        </div>
                    </Fade>
                }
            </div>
        )
    }
}

export default Consumer;
