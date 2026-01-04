import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDN_RmrN0PeUWhJRsdlldN7bo9ZlzT5ZLU",
  authDomain: "studio-587322716-5bb8b.firebaseapp.com",
  projectId: "studio-587322716-5bb8b",
  storageBucket: "studio-587322716-5bb8b.firebasestorage.app",
  messagingSenderId: "352288848431",
  appId: "1:352288848431:web:0ad2d8f8b4c5ab26e124da"
};

// Initialize Firebase
// This check prevents Firebase from crashing by initializing twice in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
