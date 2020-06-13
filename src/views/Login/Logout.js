import React, { Component } from 'react';
import firebase from '../../firebase';

export default class Logout extends Component {

    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount(){
        this.signout()
    }

    signout() {
        firebase.auth().signOut()
            .then(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('tokens');
                window.location.reload()
            })
        console.log("signout")
    }

    render() {
        return (
            <div></div>
        )
    }
}
