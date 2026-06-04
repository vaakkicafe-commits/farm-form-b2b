import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "farm-form-b2b.firebaseapp.com",
  projectId: "farm-form-b2b",
  storageBucket: "farm-form-b2b.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Authentication and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
