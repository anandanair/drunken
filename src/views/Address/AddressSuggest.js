import React, { Component } from 'react';
import AddressItem from './AddressItem';
// app/src/AddressInput.js
class AddressSuggest extends Component {
    render() {
        return (
            <AddressItem
                label="Search postal code"
                value={this.props.query}
                onChange={this.props.onChange}
                placeholder="Please enter your postal code" />
        );
    }
}

export default AddressSuggest;
