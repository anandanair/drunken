import React, { Component } from 'react';
import { Button } from 'reactstrap';
import firebase from '../../../firebase';

const database = firebase.database()

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pincode: null
    };

    this.getUserInfo = this.getUserInfo.bind(this);

  }

  getUserInfo() {
    console.log(firebase.auth().currentUser)
  }

  componentDidMount() {
    var ref = database.ref('/pinCode/pinCode_1').once('value').then(function (snapshot) {
      console.log(snapshot.val())
    })
  }



  render() {

    return (
      <div>
        <Button onClick={this.getUserInfo}> Get User Info </Button>
      </div>
    )
  }
}

export default Dashboard;
