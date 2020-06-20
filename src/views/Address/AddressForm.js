import React, { Component } from 'react';
import AddressSuggest from './AddressSuggest';
import axios from 'axios';

class AddressForm extends Component {
    constructor(props) {
        super(props);

        this.state = this.getInitialState();

        this.onQuery = this.onQuery.bind(this);

    }

    onQuery(evt) {
        const query = evt.target.value;
        if (query.length === 6) {
            if (!query.length > 0) {
                this.setState(this.getInitialState());
                return;
            }
            const self = this;
            axios.get('https://geocoder.ls.hereapi.com/search/6.2/geocode.json', {
                'params': {
                    'apiKey': "F9yEz4KbJ8g47GqiTVrfU_c3V9CwktUUOPpbOYmlHfk",
                    'searchText': query,
                    'maxresults': 1,
                }
            }).then((response) => {
                const address = response.data['Response']['View'][0].Result[0].Location.Address;
                const id = response.data['Response']['View'][0].Result[0].Location.LocationId;
                address.Latitude = response.data['Response']['View'][0].Result[0].Location.DisplayPosition.Latitude
                address.Longitude = response.data['Response']['View'][0].Result[0].Location.DisplayPosition.Longitude
                this.props.sendAddress(address)
                self.setState({
                    'address': address,
                    'searchText': query,
                    'locationId': id,
                });
            });
        }
    }

    getInitialState() {
        return {
            'address': {
                'street': '',
                'city': '',
                'state': '',
                'postalCode': '',
                'country': ''
            },
            'query': '',
            'locationId': '',
            'isChecked': false,
            'coords': {}
        }
    }
    render() {

        return (
            <div className="container">
                <AddressSuggest
                    query={this.state.query}
                    onChange={this.onQuery}
                />
            </div>
        );
    }
}

export default AddressForm;