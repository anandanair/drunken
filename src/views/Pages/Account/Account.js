import React, { Component } from 'react';
import firebase from 'firebase'
import {
    Card, CardBody, CardHeader, Form, FormGroup, Input, Label, Button, Collapse,
    TabContent, TabPane, Nav, NavItem, NavLink, CardTitle, CardText, Row, Col, Badge, Fade
} from 'reactstrap';
import MapContainer from '../../MapContainer';
import AddressFrom from '../../Address/AddressForm';
import axios from 'axios';
// import { da } from 'date-fns/locale';
import classnames from 'classnames';

import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import "bootstrap/dist/css/bootstrap.css";
import * as loadData from '../../../loaders/12587-delivery-address.json';
import * as saveData from '../../../loaders/doneLoading.json';

import fbIcon from '../../../assets/icons/fbIcon.png';
import googleIcon from '../../../assets/icons/googleIcon.png';

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
    animationData: saveData.default,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
    }
}


const database = firebase.database();

class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            address: null,
            uid: null,
            latitude: 0,
            longitude: 0,
            activeTab: 1,
            googleLink: false,
            facebookLink: false,
            saving: false,

        }
        this.handleChange = this.handleChange.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
    }

    componentDidMount() {
        const auth = firebase.auth()
        auth.onAuthStateChanged(currentUser => {
            currentUser.providerData.forEach((profile) => {
                if (profile.providerId === 'google.com') {
                    this.setState({
                        googleLink: true
                    })
                }
            })
            database.ref(`users/${currentUser.uid}/address`).once('value', (snapshot) => {
                if (snapshot.val()) {
                    this.setState({
                        address: snapshot.val()
                    })
                }
            })
            this.setState({
                uid: currentUser.uid
            })
        })
        auth.getRedirectResult().then(function (result) {
            if (result.credential) {
                console.log(result.credential)
                // Accounts successfully linked.
                var credential = result.credential;
                var user = result.user;
                // ...
            }
        }).catch(function (error) {
            console.log(error)
            // Handle Errors here.
            // ...
        });
    }

    handleChange = name => event => {
        let value = event.target.value
        this.setState(state => {
            const address = this.state.address
            address[name] = value
            return {
                address
            }
        })
    }

    updateProfile() {
        this.setState({ saving: true })
        var { uid, address, latitude, longitude } = this.state
        database.ref(`users/${uid}`).update({
            address: address,
            latitude: latitude,
            longitude: longitude,

        }).then(() => {
            setTimeout(() => {
                this.setState({
                    saving: false
                })
            }, 1000);
        })
        if (localStorage.getItem('role') === "consumer") {
            database.ref(`users/${uid}/shopId`).once('value', (shopId) => {
                database.ref(`shops/${shopId.val()}`).update({
                    address: address,
                    latitude: latitude,
                    longitude: longitude,
                })
            })
        }
    }

    callbackData = (dataFromMap) => {
        this.setState({
            latitude: dataFromMap.lat,
            longitude: dataFromMap.lng
        })
        console.log(`${dataFromMap.lat},${dataFromMap.lng},200`)
        var address = {}
        axios.get('https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json', {
            'params': {
                'apiKey': "F9yEz4KbJ8g47GqiTVrfU_c3V9CwktUUOPpbOYmlHfk",
                'mode': 'retrieveAddresses',
                'prox': (`${dataFromMap.lat},${dataFromMap.lng},200`),
                'maxresults': 1,
            }
        }).then((response) => {
            address = response.data['Response']['View'][0].Result[0].Location.Address;
            const id = response.data['Response']['View'][0].Result[0].Location.LocationId;
            console.log(address)
            this.setState({
                address: address
            })
        });
    }

    getAddress = data => {
        console.log(data)
        this.setState({
            address: data
        })
    }

    toggleTab(tab) {
        this.setState({
            activeTab: tab
        })
    }

    linkToGoogle(isLinked, providerId, linkName) {
        const auth = firebase.auth()
        var googleProvider = new firebase.auth.GoogleAuthProvider();
        var facebookProvider = new firebase.auth.FacebookAuthProvider();
        if (isLinked) {
            auth.currentUser.unlink(providerId).then(() => {
                this.setState({
                    [linkName]: false
                })
            })
        }
        else {
            if (providerId === 'google.com') {
                auth.currentUser.linkWithRedirect(googleProvider)
                    .then(/* ... */)
                    .catch(/* ... */);
            }
            else {
                auth.currentUser.linkWithRedirect(facebookProvider)
                    .then(/* ... */)
                    .catch(/* ... */);
            }

        }



    }

    render() {
        const { address, activeTab, googleLink, facebookLink, saving } = this.state

        return (
            <div>
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === 1 })}
                            onClick={() => { this.toggleTab(1); }}
                        >
                            Update Address / Location
                            </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === 2 })}
                            onClick={() => { this.toggleTab(2); }}
                        >
                            Link
                            </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId={1}>
                        <Fade>
                            {saving
                                ? <FadeIn>
                                    <div className="d-flex justify-content-center align-items-center">

                                        <Lottie options={defaultOptions2} height="50%" width="50%" />

                                    </div>
                                </FadeIn>
                                : <div>
                                    <Card>
                                        <CardBody>
                                            <AddressFrom sendAddress={this.getAddress} />
                                        </CardBody>
                                    </Card>

                                    <Row>
                                        <Col>
                                            <MapContainer callbackFromMapContainer={this.callbackData} />
                                        </Col>
                                        {address ?
                                            <Col>

                                                <Card>
                                                    {/* <CardHeader>Update Addre</CardHeader> */}
                                                    <CardBody>
                                                        <Form>
                                                            <FormGroup>
                                                                <Label>Address</Label>
                                                                <Input type="textarea" value={address.Label} onChange={this.handleChange("Label")} ></Input>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label>Postal Code</Label>
                                                                <Input type="number" value={address.PostalCode} onChange={this.handleChange("PostalCode")} ></Input>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label>City</Label>
                                                                <Input type="text" value={address.City} onChange={this.handleChange("City")} ></Input>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label>District</Label>
                                                                <Input type="text" value={address.County} onChange={this.handleChange("County")} ></Input>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label>Country</Label>
                                                                <Input type="text" value={address.Country} onChange={this.handleChange("Country")} ></Input>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Button onClick={this.updateProfile} color="primary">Save</Button>
                                                            </FormGroup>
                                                        </Form>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            : <FadeIn>
                                                <div className="d-flex justify-content-center align-items-center">

                                                    <Lottie options={defaultOptions} height="50%" width="50%" />

                                                </div>
                                            </FadeIn>
                                        }
                                    </Row>
                                </div>
                            }
                        </Fade>
                    </TabPane>
                    <TabPane tabId={2} >
                        <Fade>
                            <Card>
                                <CardBody>
                                    <Button outline color="danger" onClick={() => { this.linkToGoogle(googleLink, 'google.com', 'googleLink') }} > <img src={googleIcon} /> {googleLink ? "Unlink account from Google" : "Link to Google"}</Button>
                                    <Button outline color="primary" onClick={() => { this.linkToGoogle(facebookLink, 'facebook.com', 'facebookLink') }} > <img src={fbIcon} /> {facebookLink ? "Unlink account from Facebook" : "Link to Facebook"}</Button>
                                </CardBody>
                            </Card>
                        </Fade>
                    </TabPane>
                </TabContent>
            </div >
        )
    }
}
export default Account;