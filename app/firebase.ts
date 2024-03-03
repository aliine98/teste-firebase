// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAITIP21YQkC3GK4yeO5M0QwJeUF-V-NFc",
  authDomain: "artes-marciais-aa816.firebaseapp.com",
  projectId: "artes-marciais-aa816",
  storageBucket: "artes-marciais-aa816.appspot.com",
  messagingSenderId: "314154303454",
  appId: "1:314154303454:web:dc573309bea6c13d95e74f",
  measurementId: "G-8J0CQVKJ9S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
