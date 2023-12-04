// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBw9svY2hlRnUfP7B4FvN3ceAk1ZVFUKG0",
  authDomain: "know-99521.firebaseapp.com",
  databaseURL: "https://know-99521-default-rtdb.firebaseio.com",
  projectId: "know-99521",
  storageBucket: "know-99521.appspot.com",
  messagingSenderId: "1081865848898",
  appId: "1:1081865848898:web:db17d9ef1a3ac18f3185db",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
