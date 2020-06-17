import React, { Component } from 'react';
import firebase from 'firebase'
import style from './style.css'
import { Jumbotron, CardBody, Toast, ToastHeader, Row, Col, ToastBody, Button } from 'reactstrap';
import { Card, CardTitle, CardHeader, CardColumns, CardSubtitle, CardFooter, CardText, CardImg, CardImgOverlay } from 'reactstrap';

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
      loading: true
    }
    this.getShopData = this.getShopData.bind(this);
    this.getDrinks = this.getDrinks.bind(this);
    this.getCartDetails = this.getCartDetails.bind(this);
    this.addToCart = this.addToCart.bind(this);

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
      console.log(drinksArray)
      cb(drinksArray)
    })
  }

  getCartDetails(uid) {
    database.ref(`cart/${uid}`).once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        this.setState(state => {
          const cart = this.state.cart.concat(childSnapshot.val())
          return {
            cart
          }
        })
      })
    })
  }

  addToCart(drinkKey) {
    console.log(drinkKey)
    // var val = {}
    database.ref(`shops/${this.state.shopId}/drinks/${drinkKey}`).once('value', (snapshot) => {
      // val = snapshot.val()
      this.setState(state => {
        const cart = this.state.cart.concat(snapshot.val())
        return {
          cart
        }
      })
      database.ref(`cart/${this.state.uid}/${drinkKey}`).set(snapshot.val())
    })

  }

  render() {
    var { shopData, drinks, cart, loading } = this.state
    return (
      <div>
        {loading ? <div> Loading </div> :
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
                    <div>
                      {cart.map((cart, index) => (
                        <div key={index} > {cart.name} </div>
                      ))}
                    </div>
                  </CardBody>
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
                        <Col sm={3}>
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