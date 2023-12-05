// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  doc as firestoreDoc,
  setDoc as firestoreSetDoc,
  getDoc as firestoreGetDoc,
  collection as firestoreColletion,
  addDoc as firestoreAddDoc,
} from "firebase/firestore";
import { signOut as firebaseSignOut } from "firebase/auth";
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

//
export const signOut = () => {
  return firebaseSignOut(auth);
};

export const doc = firestoreDoc;
export const setDoc = firestoreSetDoc;
export const getDoc = firestoreGetDoc;
export const collection = firestoreColletion;
export const addDoc = firestoreAddDoc;

// // Get a reference to a Firestore collection
// export const getFirestoreCollection = (collectionName) => {
//   return collection(db, collectionName);
// };

// // Add a new document to the specified collection
// export const addDocument = async (collectionRef, data) => {
//   try {
//     const docRef = await addDoc(collectionRef, data);
//     console.log("Document written with ID: ", docRef.id);
//     return docRef.id; // Return the ID of the added document if needed
//   } catch (error) {
//     console.error("Error adding document: ", error);
//     throw error; // Rethrow the error to handle it in the calling code
//   }
// };
