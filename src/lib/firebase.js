import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyVNtI-fahkRQ_qx0SI5sgJHn7vUtPvM4",
  authDomain: "addiction-control-de7c2.firebaseapp.com",
  projectId: "addiction-control-de7c2",
  storageBucket: "addiction-control-de7c2.firebasestorage.app",
  messagingSenderId: "332515352902",
  appId: "1:332515352902:web:011006fd28f59e08680547",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
