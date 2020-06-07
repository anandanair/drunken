import firebase from "firebase";

const config = {
  apiKey: "AIzaSyCas5W421wUM42mOKvWCkKEzJ9ec16ZJmQ",
  authDomain: "drunken-master-4e45d.firebaseapp.com",
  databaseURL: "https://drunken-master-4e45d.firebaseio.com",
  projectId: "drunken-master-4e45d",
  storageBucket: "drunken-master-4e45d.appspot.com",
  messagingSenderId: "1096859393875",
  appId: "1:1096859393875:web:c56819e476fcad2817cba6",
  measurementId: "G-VTDKK09RQS"
};

firebase.initializeApp(config);

export default firebase;
