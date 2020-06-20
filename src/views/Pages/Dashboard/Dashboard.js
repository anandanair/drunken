import React, { Component } from 'react';
import { Button, Jumbotron, Card, CardBody, CustomInput, Input, FormGroup, Label, Form, Row, Col, Collapse, CardHeader, CardImg, CardColumns, ToastHeader, Toast, ToastBody, CardFooter } from 'reactstrap';
import firebase from '../../../firebase';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import theme from './style.css';
import { Link } from 'react-router-dom';
import MapContainer from '../../MapContainer';
import axios from 'axios';


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
      pinAvailable: false,
      emailVerified: false,
    };
    this.getLocation = this.getLocation.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.searchPin = this.searchPin.bind(this)
    this.getAddress = this.getAddress.bind(this)
    this.callbackData = this.callbackData.bind(this)
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(currentUser => {
      var role = localStorage.getItem('role')
      if (role === "consumer") {
        this.setState({
          emailVerified: true
        })
      }
      else {
        this.setState({
          emailVerified: currentUser.emailVerified
        })
      }
    })
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
    this.setState({
      availableShops: []
    })
    var { searchPincode } = this.state
    database.ref(`pinCodes/${searchPincode}`).once('value').then((snapshot) => {
      var value = snapshot.val()
      if (value) {
        if (value.availableShops) {
          value.availableShops.map(shop => {
            var obj = {}
            database.ref(`shops/${shop.shopId}`).once('value', (snapshot) => {
              var val = snapshot.val()
              if (val.address.Label) {
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
              }
            })
          })
        }
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

  callbackData(data) {
    console.log(data)
    axios.get('https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json', {
      'params': {
        'apiKey': "F9yEz4KbJ8g47GqiTVrfU_c3V9CwktUUOPpbOYmlHfk",
        'mode': 'retrieveAddresses',
        'prox': (`${data.lat},${data.lng},200`),
        'maxresults': 1,
      }
    }).then((response) => {
      const address = response.data['Response']['View'][0].Result[0].Location.Address;
      this.setState({
        searchPincode: address.PostalCode
      })
    });
  }

  getAddress(data) {
    console.log(data.PostalCode)
    this.setState({
      searchPincode: data.PostalCode
    })
  }

  render() {
    const { invalidPin, pinAvailable, availableShops, emailVerified, searchPincode } = this.state

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
        {emailVerified ?
          <div>
            <Card>
              <CardBody>
                {/* <Jumbotron> */}
                <FormGroup row>
                  <Col>
                    <MapContainer callbackFromMapContainer={this.callbackData} />
                    <br /><br /><br /><br /><br /><br /><br />
                  </Col>
                  <Col style={{ display: "flex" }}>
                    <Input onChange={this.handleChange("searchPincode")} value={searchPincode} placeholder="Search your postal code" type="number"></Input>

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
                {/* </Jumbotron> */}
              </CardBody>
            </Card>
            <Collapse isOpen={availableShops.length > 0}>
              <Card>
                <CardBody>
                  <Slider {...settings} >
                    {availableShops.map(shop => (
                      <div key={shop.shopId}>
                        <Link to={`shops/${shop.shopId}/${shop.name}`}>
                          <Card >
                            <CardImg className="zoom" top src={shop.imageUrl} alt="Card image cap" />
                            <CardBody>
                              <Toast>
                                <ToastHeader> {shop.name} </ToastHeader>
                                <ToastBody> {shop.address.Label ? shop.address.Label : shop.address} </ToastBody>
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
          :
          <div> Please verify your email address to Shop :) </div>
        }


      </div>
    )
  }
}

export default Dashboard;
