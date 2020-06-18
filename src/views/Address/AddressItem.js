 
import React, { Component } from 'react';

class AddressItem extends Component {
  render() {
    return (
        <div className="row form-group justify-content-start">
            <label className="col-sm-4 col-form-label">{this.props.label}</label>
            <div className="col-xl-8">
              <input
                type="text"
                defaultValue={this.props.value}
                onChange={this.props.onChange}
                className="form-control"
                placeholder={this.props.placeholder} />
            </div>
        </div>
      );
  }
}

export default AddressItem;
