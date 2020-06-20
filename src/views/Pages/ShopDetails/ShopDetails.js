import React, { Component } from 'react';
import firebase from 'firebase'
import style from './style.css'
import { Jumbotron, CardBody, Toast, ToastHeader, Row, Col, ToastBody, Button, ListGroup, ListGroupItem, Badge, FormGroup, Label } from 'reactstrap';
import { Card, CardTitle, CardHeader, CardColumns, CardSubtitle, CardFooter, CardText, CardImg, CardImgOverlay } from 'reactstrap';

import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.css";
import * as loadData from '../../../loaders/968-loading.json';
import * as loadData2 from '../../../loaders/8311-loading.json';
import { getPreciseDistance } from 'geolib';
import { da, th } from 'date-fns/locale';
import { Link, Redirect } from 'react-router-dom';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: loadData.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
}

const defaultOptions2 = {
  loop: true,
  autoplay: true,
  animationData: loadData2.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
}


const database = firebase.database()

class ShopDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shopData: {},
      shopId: null,
      drinks: [],
      cart: [],
      uid: null,
      loading: true,
      loadingCart: false,
      userAddress: null,
      totlaItems: 0,
      totalPrice: 0,
      deliveryFee: 0,
      redirectToReferrer: false,
      orderId: null
    }
    this.getShopData = this.getShopData.bind(this);
    this.getDrinks = this.getDrinks.bind(this);
    this.getCartDetails = this.getCartDetails.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.addMore = this.addMore.bind(this);
    this.buyNow = this.buyNow.bind(this);

  }

  componentDidMount() {
    var shopId = this.props.match.params.shopId
    firebase.auth().onAuthStateChanged(currentUser => {
      this.setState({
        uid: currentUser.uid
      })
      this.getCartDetails(currentUser.uid)
      this.getUserAddress(currentUser.uid)
      this.calculateDeliveryFee(shopId, currentUser.uid)
    })
    this.getDrinks(shopId, (cb) => {
      this.setState({
        drinks: cb
      })
    })
    this.setState({
      shopId: shopId
    })
    this.getShopData(shopId)
  }

  getUserAddress(uid) {
    database.ref(`users/${uid}/address`).once('value', (snapshot) => {
      this.setState({
        userAddress: snapshot.val()
      })
    })
  }

  getShopData(shopId) {
    database.ref(`shops/${shopId}`).once('value', (snapshot) => {
      var value = snapshot.val();
      firebase.storage().ref(`shopCover/${shopId}`).getDownloadURL().then((url) => {
        value.imageUrl = url;
        this.setState({
          shopData: value,
          loading: false
        })
      })
    })
  }

  getDrinks(shopId, cb) {
    var drinksArray = []
    database.ref(`shops/${shopId}/drinks`).once('value', function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        childData.childKey = childSnapshot.key;
        childData.img = "test"
        firebase.storage().ref(`drinksImages/${childSnapshot.key}`).getDownloadURL().then((url) => {
          childData.img = url
        })
        drinksArray.push(childData)
      });
      // console.log(drinksArray)
      cb(drinksArray)
    })
  }

  getCartDetails(uid) {
    this.setState({
      cart: [],
      loadingCart: true
    })
    database.ref(`cart/${uid}/${this.state.shopId}`).once('value', (snapshot) => {
      if (snapshot.val()) {
        var total = 0
        var totalP = 0
        snapshot.forEach((childSnapshot) => {
          total = total + childSnapshot.val().amount
          totalP = totalP + (parseFloat(childSnapshot.val().price) * childSnapshot.val().amount)
          this.setState(state => {
            const cart = this.state.cart.concat(childSnapshot.val())
            const loadingCart = false
            const totlaItems = total
            const totalPrice = totalP
            return {
              cart, loadingCart, totlaItems, totalPrice
            }
          })
        })
      }
      else {
        this.setState({
          loadingCart: false,
          totlaItems: 0,
          totalPrice: 0
        })
      }
    })
  }

  addToCart(drinkKey) {
    var { uid, shopId } = this.state

    database.ref(`shops/${shopId}/drinks/${drinkKey}`).once('value', (snapshot) => {
      let drinkData = snapshot.val()
      drinkData.amount = 1

      database.ref(`cart/${uid}/${shopId}/${drinkKey}/amount`).once('value', (data) => {
        if (data.val()) {
          database.ref(`cart/${uid}/${shopId}/${drinkKey}`).update({
            amount: data.val() + 1
          }).then(() => {
            this.getCartDetails(uid)
            this.updateStock(drinkKey, 'subtract')
          })
        }
        else {
          database.ref(`cart/${uid}/${shopId}/${drinkKey}`).set(drinkData).then(() => {
            this.getCartDetails(uid)
            this.updateStock(drinkKey, 'subtract')
          })
        }
      })
    })

  }

  updateStock(drinkKey, method) {
    var { uid, shopId } = this.state
    let currentStock = 0
    database.ref(`shops/${shopId}/drinks/${drinkKey}/stock`).once('value', (snapshot) => {
      currentStock = snapshot.val()
      if (method === 'subtract') {
        database.ref(`shops/${shopId}/drinks/${drinkKey}`).update({
          stock: currentStock - 1
        }).then(() => {
          this.getDrinks(shopId, (cb) => {
            this.setState({
              drinks: cb
            })
          })
        })
      }
      else {
        database.ref(`shops/${shopId}/drinks/${drinkKey}`).update({
          stock: currentStock + 1
        }).then(() => {
          this.getDrinks(shopId, (cb) => {
            this.setState({
              drinks: cb
            })
          })
        })
      }
    })


  }

  addMore(drinkName, method) {
    var { uid, shopId } = this.state
    if (method === "add") {
      database.ref(`shops/${shopId}/drinks/${drinkName}/stock`).once('value', (stock) => {
        if (stock.val() < 1) {
          alert("The selected item cannot be added to the cart! Please wait until stock is available! ")
        }
        else {
          this.setState({ cart: [], loadingCart: true })
          database.ref(`cart/${uid}/${shopId}/${drinkName}/amount`).once('value', (snapshot) => {
            if (snapshot.val()) {
              // if (method === "add") {
              this.updateStock(drinkName, "subtract")
              database.ref(`cart/${uid}/${shopId}/${drinkName}`).update({
                amount: snapshot.val() + 1
              }).then(() => {
                this.getCartDetails(uid)
              })
              // }
            }
          })
        }
      })
    }
    else {
      this.setState({ cart: [], loadingCart: true })
      this.updateStock(drinkName, "add")
      database.ref(`cart/${uid}/${shopId}/${drinkName}/amount`).once('value', (snapshot) => {
        if (snapshot.val() === 1) {
          database.ref(`cart/${uid}/${shopId}/${drinkName}`).remove().then(() => {
            this.getCartDetails(uid)
          })
        }
        else {
          database.ref(`cart/${uid}/${shopId}/${drinkName}`).update({
            amount: snapshot.val() - 1
          }).then(() => {
            this.getCartDetails(uid)
          })
        }
      })
    }
  }

  buyNow() {
    let date = new Date()
    var { uid, userAddress, shopId, totalPrice } = this.state
    var id = `${date.getFullYear()}${date.getMonth()}${date.getDate()}-${uid.substr(0, 4)}-${date.getTime().toString().substr(8, 5)}`
    var order = {
      orderId: id,
      customerId: uid,
      shopId: shopId,
      price: totalPrice
    }
    database.ref(`users/${uid}/orders/${id}`).set(order).then(() => {
      this.setState({ orderId: id, redirectToReferrer: true })
    })



  }

  calculateDeliveryFee(shopId, uid) {
    let shopCoords = {}
    let customerCoords = {}
    database.ref(`shops/${shopId}`).once('value', (shopData) => {
      shopCoords.latitude = shopData.val().latitude
      shopCoords.longitude = shopData.val().longitude
    }).then(() => {
      database.ref(`users/${uid}`).once('value', (userData) => {
        customerCoords.latitude = userData.val().latitude
        customerCoords.longitude = userData.val().longitude
      }).then(() => {
        var totalDistance = getPreciseDistance(shopCoords, customerCoords)
        console.log(totalDistance)
        if (totalDistance < 5000) {
          this.setState({
            deliveryFee: 20
          })
        }
        else {
          this.setState({
            deliveryFee: totalDistance * 0.004
          })
        }
      })
    })
  }

  render() {
    var { shopData, shopId, drinks, cart, orderId, loading, loadingCart, userAddress, totlaItems, totalPrice, deliveryFee, redirectToReferrer } = this.state
    return (
      <div>
        {redirectToReferrer ?
          <Redirect to={{
            pathname: `/${shopId}/payment`,
            state: { orderId: orderId }
          }} />
          : loading ?
            <FadeIn>
              <div className="d-flex justify-content-center align-items-center">

                <Lottie options={defaultOptions} height="50%" width="50%" />

              </div>
            </FadeIn>
            :
            <div>
              <Row>
                <Col lg={8} className="noPadding" >
                  <Card className="style">
                    <CardImg width="100%" src={shopData.imageUrl} alt="" />
                    <CardBody>
                      <Jumbotron>
                        <h1 className="display-3"> {shopData.name} </h1>
                        <p className="lead"> {shopData.description} </p>
                        <hr className="my-2" />
                      </Jumbotron>
                    </CardBody>
                  </Card>
                </Col>
                <Col className="noPadding">
                  <Card>
                    <CardHeader>Cart</CardHeader>
                    <CardBody>
                      {loadingCart ?
                        <FadeIn>
                          <div className="d-flex justify-content-center align-items-center">

                            <Lottie options={defaultOptions2} height="50%" width="50%" />

                          </div>
                        </FadeIn>
                        :
                        <div>
                          <ListGroup>
                            {cart.map((cart, index) => (
                              <ListGroupItem key={index} >
                                <Row>
                                  <Col sm={5} >
                                    {cart.name}
                                  </Col>
                                  <Col >
                                    <Badge pill> {cart.amount ? cart.amount : 1} </Badge>
                                  </Col>
                                  <Col>
                                    <Button onClick={() => { this.addMore(cart.name, "subtract") }} outline color="danger" > -</Button>
                                  </Col>
                                  <Col>
                                    <Button onClick={() => { this.addMore(cart.name, "add") }} outline color="primary" > +</Button>
                                  </Col>
                                </Row>
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        </div>
                      }
                      {userAddress ?
                        <div>
                          <FormGroup row>
                            <Col sm={4} >Delivery to</Col>
                            <Col> <b>{userAddress.Label}</b> </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Col sm={4} >Quanity</Col>
                            <Col> <b>{totlaItems}</b> </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Col sm={4} >Delivery Fee</Col>
                            <Col> <b>{deliveryFee} Rs</b> </Col>
                          </FormGroup>
                          <FormGroup row>
                            <Col sm={4} >Total Price</Col>
                            <Col> <b>{totalPrice + deliveryFee} Rs</b> </Col>
                          </FormGroup>
                        </div>
                        : <div>
                          Please update your address before ordering !
                      </div>
                      }
                    </CardBody>
                    <CardFooter>
                      {/* <Link to={`/${shopId}/payment`} > */}
                      <Button color="primary" style={{ float: "right" }} onClick={this.buyNow}  >Buy Now</Button>
                      {/* </Link> */}
                    </CardFooter>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Card>
                    <CardHeader> Drinks </CardHeader>
                    <CardBody>
                      <Row>
                        {drinks.map(drink => (
                          <Col key={drink.childKey} sm={3}>
                            <Card key={drink.childKey}>
                              <CardHeader>
                                <Row>
                                  <Col sm={7}>
                                    {drink.name}
                                  </Col>
                                  <Col>
                                    <Badge color={drink.stock ? drink.stock < 20 && drink.stock > 0 ? "warning" : "danger" : "danger"} > {drink.stock ? drink.stock < 20 && drink.stock > 0 ? "Running Out" : "Out of Stock" : "Out of Stock"} </Badge>
                                  </Col>
                                </Row>
                              </CardHeader>
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
                              </CardBody>
                              <CardFooter>
                                {drink.stock
                                  ? drink.stock < 1
                                    ? <Button disabled >Add to Cart</Button>
                                    : <Button color="primary" onClick={() => { this.addToCart(drink.childKey) }} >Add To Cart</Button>
                                  : <Button disabled >Add to Cart</Button>}

                              </CardFooter>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              {/* <img src={shopData.imageUrl} className="img-fluid" alt={shopData.name}/> */}
            </div>
        }
      </div>

    )
  }
}

export default ShopDetails