// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-7a8f7.firebaseapp.com",
  projectId: "mern-estate-7a8f7",
  storageBucket: "mern-estate-7a8f7.appspot.com",
  messagingSenderId: "16789405814",
  appId: "1:16789405814:web:56b45ef2e97e42c2765f57"
};

// Initialize Firebase
const app=initializeApp(firebaseConfig);
export const storage=getStorage(app);
export {app};
