import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFslZZ5K_EmpwLva7V4Ww8cGxrhOmTyyQ",
  authDomain: "meseta-curatebot.firebaseapp.com",
  projectId: "meseta-curatebot",
  storageBucket: "meseta-curatebot.appspot.com",
  messagingSenderId: "532353352244",
  appId: "1:532353352244:web:2e1cd52d2c46e85a8a0061"
};

const app = firebase.initializeApp(firebaseConfig);

const auth = app.auth();
const firestore = app.firestore();

export {
  firebase,
  auth,
  firestore
};