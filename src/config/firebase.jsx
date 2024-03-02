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
  getDocs as firestoreGetDocs,
  query as firestoreQuery,
  Timestamp as firestoreTimeStamp,
  where as firestoreWhere,
  deleteDoc as firestoreDelteDoc,
  updateDoc as firestoreUpdateDoc,
  runTransaction as firestoreRunTransaction,
} from "firebase/firestore";
import { signOut as firebaseSignOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBw9svY2hlRnUfP7B4FvN3ceAk1ZVFUKG0",
  authDomain: "know-99521.firebaseapp.com",
  databaseURL: "https://know-99521-default-rtdb.firebaseio.com",
  projectId: "know-99521",
  storageBucket: "know-99521.appspot.com",
  messagingSenderId: "1081865848898",
  appId: "1:1081865848898:web:db17d9ef1a3ac18f3185db",
};

// const firebaseConfig = {
//   apiKey: "AIzaSyDGNFX0PLgZjEs30YPCzG22njE2lX4gMRc",
//   authDomain: "knowtify-98d21.firebaseapp.com",
//   projectId: "knowtify-98d21",
//   storageBucket: "knowtify-98d21.appspot.com",
//   messagingSenderId: "714406488736",
//   appId: "1:714406488736:web:b6a8804df90cc56e3577c5",
//   measurementId: "G-0Z0TV248GG",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const fsTimeStamp = firestoreTimeStamp;
export const doc = firestoreDoc;
export const setDoc = firestoreSetDoc;
export const getDoc = firestoreGetDoc;
export const collection = firestoreColletion;
export const addDoc = firestoreAddDoc;
export const getDocs = firestoreGetDocs;
export const query = firestoreQuery;
export const where = firestoreWhere;
export const deleteDoc = firestoreDelteDoc;
export const updateDoc = firestoreUpdateDoc;
export const runTransaction = firestoreRunTransaction;

//handle signOut
export const signOut = () => {
  return firebaseSignOut(auth);
};
