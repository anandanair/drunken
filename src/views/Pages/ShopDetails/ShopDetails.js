import React, { Component } from 'react';
import firebase from 'firebase'

const database = firebase.database()

class ShopDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shopData: {},
      shopId: null,
    }
    this.getShopData = this.getShopData.bind(this);

  }

  componentDidMount() {
    var shopId = this.props.match.params.shopId
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
          shopData: value
        })
      })
    })
  }

  render() {
    var { shopData } = this.state
    return (
      <div>
        <img src={shopData.imageUrl} />
      </div>
    )
  }
}

export default ShopDetails