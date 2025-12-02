import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// REPLACE WITH YOUR FIREBASE CONFIG FROM CONSOLE
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP9a_q2HEk4zPzstKqvKz6txHAoh1Np3I",
  authDomain: "smart-expense-tracker-v3.firebaseapp.com",
  projectId: "smart-expense-tracker-v3",
  storageBucket: "smart-expense-tracker-v3.firebasestorage.app",
  messagingSenderId: "764384724018",
  appId: "1:764384724018:web:19655f441c85a1745a282b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
