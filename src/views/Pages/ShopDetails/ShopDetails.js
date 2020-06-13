import React, { Component } from 'react';
import firebase from 'firebase'
import style from './style.css'
import { Jumbotron } from 'reactstrap';

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
        <Jumbotron>
        <img src={shopData.imageUrl} className="img-fluid" alt="Responsive image"/>
        
        </Jumbotron>
        </div>
    )
  }
}

export default ShopDetails