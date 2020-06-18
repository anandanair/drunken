import React, { Component } from 'react';
import { GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import CurrentLocation from './Map';

export class MapContainer extends Component {
  state = {
    showingInfoWindow: false,  //Hides or the shows the infoWindow
    activeMarker: {},          //Shows the active marker upon click
    selectedPlace: {}          //Shows the infoWindow to the selected place upon a marker
  };

  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });

  onClose = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  sendToAccounts = data => {
    this.props.callbackFromMapContainer(data)
  }

  render() {
    return (
      <CurrentLocation
        centerAroundCurrentLocation
        google={this.props.google}
        callbackFromMap={this.sendToAccounts}
      >
        <Marker onClick={this.onMarkerClick} name={'current location'} />
        <InfoWindow
          marker={this.state.activeMarker}
          visible={this.state.showingInfoWindow}
          onClose={this.onClose}
        >
          <div>
            <h4>{this.state.selectedPlace.name}</h4>
          </div>
        </InfoWindow>
      </CurrentLocation>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyDvK7lysx9fYl_CyaKpAdWoTIXOxOzcHKU'
})(MapContainer);