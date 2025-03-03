
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Check if a user has permission to access a specific resource
 * This can be used to validate client-side before attempting operations
 * that might be rejected by Firestore security rules
 */
export const checkUserPermissions = async (
  userId: string, 
  resourcePath: string, 
  action: 'read' | 'write' | 'delete'
): Promise<boolean> => {
  try {
    // If we're checking access to a user's own document, allow it
    if (resourcePath.startsWith(`users/${userId}`)) {
      return true;
    }
    
    // Get the user document to check role
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    const userRole = userData.role;
    
    // Super admins can do anything
    if (userRole === 'super_admin') {
      return true;
    }
    
    // Admins can access most resources
    if (userRole === 'admin' && !resourcePath.includes('audit_logs')) {
      return true;
    }
    
    // Regular members can only access their own data
    // Add more specific permission logic here as needed
    return false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

/**
 * Get the current Firebase Rules version for debugging
 */
export const getFirebaseRulesInfo = async (): Promise<string> => {
  try {
    // This is a mock function - there's no direct way to get rules versions client-side
    // In a real app, you might fetch this from a metadata document
    return "v1.0.0";
  } catch (error) {
    console.error('Error getting Firebase rules info:', error);
    return "unknown";
  }
};
