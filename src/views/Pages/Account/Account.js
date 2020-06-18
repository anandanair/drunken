import React, { Component } from 'react';
import firebase from 'firebase'
import { Card, CardBody, CardHeader, Form, FormGroup, Input, Label, Button } from 'reactstrap';
import MapContainer from '../../MapContainer';
import AddressFrom from '../../Address/AddressForm';
import axios from 'axios';
import { da } from 'date-fns/locale';

const database = firebase.database()

class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            address: null,
            uid: null,
            latitude: 0,
            longitude: 0,
        }
        this.handleChange = this.handleChange.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged(currentUser => {
            this.setState({
                uid: currentUser.uid
            })
        })
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
        var { uid, address } = this.state
        database.ref(`users/${uid}`).update({
            address: address,
            latitude: this.state.latitude,
            longitude: this.state.longitude,

        })
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

    render() {
        const { address } = this.state
        return (
            <div>

                <Card>
                    <CardBody>
                        <MapContainer callbackFromMapContainer={this.callbackData} />
                        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <AddressFrom sendAddress={this.getAddress} />
                    </CardBody>
                </Card>
                {address ?
                    <Card>
                        <CardHeader>Update User Profile</CardHeader>
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
                    : <div>Address not okay</div>}
            </div>
        )
    }
}
export default Account;