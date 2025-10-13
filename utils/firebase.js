// utils/firebase.js
import { initializeApp } from "../firebase/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "../firebase/firebase-auth.js";
import { getFirestore } from "../firebase/firebase-firestore.js";

// ⚙️ Replace this block with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-0hXTfU-L9b87YWcx2gTRT_G5IHKaL8w",
  authDomain: "lockedin-544ce.firebaseapp.com",
  projectId: "lockedin-544ce",
  storageBucket: "lockedin-544ce.firebasestorage.app",
  messagingSenderId: "880132322779",
  appId: "1:880132322779:web:bde3d03103c5ac0f08a3fe",
  measurementId: "G-PMML07PNJ2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { GoogleAuthProvider, signInWithCredential };
