
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, enableIndexedDbPersistence } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBmBopTi8eo7CfXnIkta_xnW-y98bXFQ3s",
  authDomain: "dreamstream-28360.firebaseapp.com",
  projectId: "dreamstream-28360",
  storageBucket: "dreamstream-28360.firebasestorage.app",
  messagingSenderId: "739633660375",
  appId: "1:739633660375:web:f30ad000a6205106d8cb92",
  measurementId: "G-GFHPX8M7CT",
  databaseURL: "https://dreamstream-28360-default-rtdb.firebaseio.com"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// Initialize auth with offline persistence
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Set language to device default

// Initialize Firestore with persistence
export const db = getFirestore(app);

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  console.error('Failed to enable offline persistence:', err);
});

// Initialize analytics only if supported
const analyticsPromise = isSupported().then(yes => yes ? getAnalytics(app) : null);
export const analytics = analyticsPromise;

// Function to check Firebase connection status
export const checkFirebaseConnection = async () => {
  try {
    // First try to disable network to clear any existing connection
    await disableNetwork(db);
    
    // Then try to enable network and wait for it to complete
    await enableNetwork(db);
    
    // If we get here, the connection was successful
    console.log('Firebase connection successful');
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    // Re-enable network in case of error to ensure we don't leave it disabled
    try {
      await enableNetwork(db);
    } catch (enableError) {
      console.error('Failed to re-enable network:', enableError);
    }
    return false;
  }
};
