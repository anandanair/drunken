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
            uid: null
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
        this.setState({
            [name]: value
        })
    }

    updateProfile() {
        var { uid, address } = this.state
        database.ref(`users/${uid}`).update({
            address: address
        })
    }

    callbackData = (dataFromMap) => {
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

    getAddress = data =>{
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
                                    <Input type="textarea" value={address.Label} ></Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Postal Code</Label>
                                    <Input type="textarea" value={address.PostalCode} ></Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label>City</Label>
                                    <Input type="textarea" value={address.City} ></Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label>Country</Label>
                                    <Input type="textarea" value={address.Country} ></Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label>District</Label>
                                    <Input type="textarea" value={address.County} ></Input>
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