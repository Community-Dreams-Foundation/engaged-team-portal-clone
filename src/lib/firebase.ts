
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

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

// Initialize auth with offline persistence
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Set language to device default

// Initialize Firestore
export const db = getFirestore(app);

// Initialize analytics only if supported
const analyticsPromise = isSupported().then(yes => yes ? getAnalytics(app) : null);
export const analytics = analyticsPromise;

// Function to check Firebase connection status
export const checkFirebaseConnection = async () => {
  try {
    await disableNetwork(db); // First disable the network
    await enableNetwork(db); // Then try to enable it
    return true;
  } catch (error) {
    console.error('Firebase connection error:', error);
    return false;
  }
};
