
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBmBopTi8eo7CfXnIkta_xnW-y98bXFQ3s",
  authDomain: "dreamstream-28360.firebaseapp.com",
  projectId: "dreamstream-28360",
  storageBucket: "dreamstream-28360.firebasestorage.app",
  messagingSenderId: "739633660375",
  appId: "1:739633660375:web:f30ad000a6205106d8cb92",
  measurementId: "G-GFHPX8M7CT"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

