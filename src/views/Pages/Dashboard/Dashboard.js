import React, { Component } from 'react';
import { Button, Jumbotron, Card, CardBody, CustomInput, Input, FormGroup, Label, Form, Row, Col, Collapse, CardHeader, CardImg, CardColumns, ToastHeader, Toast, ToastBody, CardFooter } from 'reactstrap';
import firebase from '../../../firebase';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import theme from './style.css';
import { Link } from 'react-router-dom';



const database = firebase.database()

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pincode: null,
      latitude: 0,
      longitude: 0,
      searchPincode: 0,
      availableShops: [],
      invalidPin: false,
      pinAvailable: false
    };
    this.getLocation = this.getLocation.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.searchPin = this.searchPin.bind(this)
  }

  getUserInfo() {
    console.log(firebase.auth().currentUser)
  }

  componentDidMount() {
    this.getLocation()
  }


  getLocation() {
    var latitude, longitude = 0
    navigator.geolocation.getCurrentPosition(function (position) {
      latitude = position.coords.latitude
      longitude = position.coords.longitude
    });
    this.setState({
      latitude: latitude,
      longitude: longitude,
    })
  }

  handleChange = name => event => {
    var value = event.target.value
    this.setState({
      [name]: value
    })
  }

  searchPin() {
    var { searchPincode } = this.state
    database.ref(`pinCodes/${searchPincode}`).once('value').then((snapshot) => {
      var value = snapshot.val()
      if (value) {
        value.availableShops.map(shop => {
          var obj = {}
          database.ref(`shops/${shop.shopId}`).once('value', (snapshot) => {
            var val = snapshot.val()
            obj.name = val.name
            obj.address = val.address
            obj.shopId = shop.shopId
            firebase.storage().ref(`shopCover/${shop.shopId}`).getDownloadURL().then((url) => {
              obj.imageUrl = url
              this.setState(state => {
                const availableShops = this.state.availableShops.concat(obj)
                return {
                  availableShops
                }
              })
            })
          })
        })
        this.setState({
          invalidPin: false,
          pinAvailable: true
        })
      }
      else {
        this.setState({
          invalidPin: true,
          pinAvailable: false
        })
      }
    })
  }

  showShop() {

  }

  render() {
    const { invalidPin, pinAvailable, availableShops } = this.state

    var settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      initialSlide: 0,
      slidesToScroll: 3,
      swipeToSlide: true,
    };

    return (
      <div>

        <Card>
          <CardBody>
            <Jumbotron>
              <FormGroup row>
                <Col>
                  <Input onChange={this.handleChange("searchPincode")} placeholder="Search your postal code" type="number"></Input>
                </Col>
                <Col >
                  <Button color="primary" onClick={this.searchPin} >Search</Button>
                </Col>
              </FormGroup>
              <Collapse isOpen={invalidPin}>
                <FormGroup>
                  <div style={{ color: "red" }} >Postal Code cannot be find ! Please enter a valid Postal Code.</div>
                </FormGroup>
              </Collapse>
              <Collapse isOpen={pinAvailable}>
                <FormGroup>
                  <div style={{ color: "green" }} >Delivery to this Postal Code is available !</div>
                </FormGroup>
              </Collapse>
            </Jumbotron>
          </CardBody>
        </Card>
        <Collapse isOpen={availableShops.length > 0}>
          <Card>
            <CardBody>
              <Slider {...settings} >
                {availableShops.map(shop => (
                  <div>
                    <Link to={`shops/${shop.shopId}/${shop.name}`}>
                      <Card onClick={this.showShop} >
                        <CardImg className="zoom" top src={shop.imageUrl} alt="Card image cap" />
                        <CardBody>
                          <Toast>
                            <ToastHeader> {shop.name} </ToastHeader>
                            <ToastBody> {shop.address} </ToastBody>
                          </Toast>
                        </CardBody>
                      </Card>
                    </Link>
                    <div>
                      <p>&nbsp;</p>
                    </div>
                  </div>
                ))}
              </Slider>

            </CardBody>
          </Card>
        </Collapse>


      </div>
    )
  }
}

export default Dashboard;
