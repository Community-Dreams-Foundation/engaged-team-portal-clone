
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-1YNZvFUEiWosWXxJd4I7HNZq4XoGtQk",
  authDomain: "dreamstream-c3a8c.firebaseapp.com",
  projectId: "dreamstream-c3a8c",
  storageBucket: "dreamstream-c3a8c.appspot.com",
  messagingSenderId: "168581716208",
  appId: "1:168581716208:web:3e3a7c7d6c7c7c7d6c7c7c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
