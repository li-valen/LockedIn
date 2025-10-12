import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-0hXTfU-L9b87YWcx2gTRT_G5IHKaL8w",
  authDomain: "lockedin-544ce.firebaseapp.com",
  projectId: "lockedin-544ce",
  storageBucket: "lockedin-544ce.firebasestorage.app",
  messagingSenderId: "880132322779",
  appId: "1:880132322779:web:bde3d03103c5ac0f08a3fe",
  measurementId: "G-PMML07PNJ2"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { GoogleAuthProvider, signInWithCredential };