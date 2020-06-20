import React, { Component } from 'react';
import firebase from 'firebase'
import { CardBody, Fade, Card, Jumbotron, Button } from 'reactstrap';
import axios from 'axios';


const database = firebase.database()

class Payment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            orderDetails: {},
            orderId: null,
            currentUser: null
        }
        this.test = this.test.bind(this);
    }

    componentDidMount() {
        console.log(this.props.location.state)
        if (this.props.location.state) {
            var orderId = this.props.location.state.orderId
            firebase.auth().onAuthStateChanged(currentUser => {
                this.setState({
                    currentUser: currentUser
                }, ()=>{
                    console.log(this.state.currentUser)
                })
                database.ref(`users/${currentUser.uid}/orders/${orderId}`).once('value', (order) => {
                    this.setState({
                        orderDetails: order.val()
                    })
                })

            })
            this.setState({
                orderId: orderId
            })
        }
    }

    test() {
        var { orderDetails, currentUser } = this.state
        const appId = '18632092873e9de8586dd726f23681'
        const secretKey = 'ff321dc95736a299ca6bd67e8a2568fb601b88e9'
        var postData = new FormData();
        postData.append('appId', '18632092873e9de8586dd726f23681')
        postData.append('secretKey', 'ff321dc95736a299ca6bd67e8a2568fb601b88e9')
        postData.append('orderId', orderDetails.orderId)
        postData.append('orderAmount', orderDetails.price)
        postData.append('orderCurrency', 'INR')
        postData.append('orderNote', 'tesing')
        postData.append('customerEmail', currentUser.email)
        postData.append('customerName', currentUser.name)
        postData.append('customerPhone', '94653810')
        postData.append('returnUrl', 'http://localhost:3000/#/shop20205201592658631427/payment')
        postData.append('notifyUrl', 'http://localhost:3000/#/shop20205201592658631427/payment')
       
        

    }

    render() {
        return (
            <div>
                <Fade>
                    <Card>
                        <CardBody>
                            <Jumbotron>
                                <h1 className="display-3">Payment</h1>
                                <Button onClick={this.test} > test</Button>
                            </Jumbotron>
                        </CardBody>
                    </Card>
                </Fade>
            </div>
        )
    }
}

export default Payment