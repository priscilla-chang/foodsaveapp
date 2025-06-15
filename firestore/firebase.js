// firebase.js
//b
//a
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
//c

//d

const firebaseConfig = {
  apiKey: 'AIzaSyCs56YYb2T8D_5QpAVf1mze2LVv7UYC62A',
  authDomain: 'smarttigerapp-3af6f.firebaseapp.com',
  projectId: 'smarttigerapp-3af6f',
  storageBucket: 'smarttigerapp-3af6f.appspot.com',
  messagingSenderId: '310785757553',
  appId: '1:310785757553:web:f12870dcb4f1762fcaa6d0',
  measurementId: 'G-TEZ5MEKHNY',
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export { app, auth, db };

