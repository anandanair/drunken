import React, { Component } from 'react';
import firebase from 'firebase'
import style from './style.css'
import { Jumbotron, CardBody, Toast, ToastHeader, Row, Col, ToastBody, Button, ListGroup, ListGroupItem, Badge } from 'reactstrap';
import { Card, CardTitle, CardHeader, CardColumns, CardSubtitle, CardFooter, CardText, CardImg, CardImgOverlay } from 'reactstrap';

import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.css";
import * as loadData from '../../../loaders/968-loading.json';
import * as loadData2 from '../../../loaders/8311-loading.json';

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
      userAddress: null
    }
    this.getShopData = this.getShopData.bind(this);
    this.getDrinks = this.getDrinks.bind(this);
    this.getCartDetails = this.getCartDetails.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.addMore = this.addMore.bind(this);

  }

  componentDidMount() {
    var shopId = this.props.match.params.shopId
    firebase.auth().onAuthStateChanged(currentUser => {
      this.setState({
        uid: currentUser.uid
      })
      this.getCartDetails(currentUser.uid)
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
        snapshot.forEach((childSnapshot) => {
          this.setState(state => {
            const cart = this.state.cart.concat(childSnapshot.val())
            const loadingCart = false
            return {
              cart, loadingCart
            }
          })
        })
      }
      else {
        this.setState({
          loadingCart: false
        })
      }
    })
  }

  addToCart(drinkKey) {
    console.log(drinkKey)
    // var val = {}
    database.ref(`shops/${this.state.shopId}/drinks/${drinkKey}`).once('value', (snapshot) => {
      // val = snapshot.val()
      // this.setState(state => {
      //   const cart = this.state.cart.concat(snapshot.val())
      //   return {
      //     cart
      //   }
      // })
      database.ref(`cart/${this.state.uid}/${this.state.shopId}/${drinkKey}`).set(snapshot.val()).then(() => {
        this.getCartDetails(this.state.uid)
      })
    })

  }

  addMore(drinkName, method) {
    this.setState({ cart: [], loadingCart: true })
    var { uid, shopId } = this.state
    database.ref(`cart/${uid}/${shopId}/${drinkName}/amount`).once('value', (snapshot) => {
      if (snapshot.val()) {
        if (method === "add") {
          database.ref(`cart/${uid}/${shopId}/${drinkName}`).update({
            amount: snapshot.val() + 1
          }).then(() => {
            this.getCartDetails(uid)
          })
        }
        else {
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
        }
      }
      else {
        if (method === "add") {
          database.ref(`cart/${uid}/${shopId}/${drinkName}`).update({
            amount: 2
          }).then(() => {
            this.getCartDetails(uid)
          })
        }
        else {
          database.ref(`cart/${uid}/${shopId}/${drinkName}`).remove().then(() => {
            this.getCartDetails(uid)
          })
        }

      }
    })
  }

  render() {
    var { shopData, drinks, cart, loading, loadingCart } = this.state
    return (
      <div>
        {loading ?
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
                        <div class="d-flex justify-content-center align-items-center">

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

                  </CardBody>
                  <CardFooter>
                    <Button color="primary" style={{ float: "right" }} >Buy Now</Button>
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
                            <CardHeader> {drink.name} </CardHeader>
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
                              <Button color="primary" onClick={() => { this.addToCart(drink.childKey) }} >Add To Cart</Button>
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