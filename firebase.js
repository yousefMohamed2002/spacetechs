import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // لازم نستورد Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBL5KgNkqVPAnEtXsgjP_xyebb_Fl_Ww-U",
  authDomain: "my-card-ceb2d.firebaseapp.com",
  projectId: "my-card-ceb2d",
  storageBucket: "my-card-ceb2d.firebasestorage.app",
  messagingSenderId: "558894555296",
  appId: "1:558894555296:web:e8a4b6f8261b02882129c5",
  measurementId: "G-LXCZH9HHH1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// التصدير اللي كان ناقص والسبب في الـ Error
export const db = getFirestore(app);