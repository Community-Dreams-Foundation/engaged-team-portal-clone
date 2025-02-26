
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  getIdTokenResult,
  AuthError
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, checkFirebaseConnection } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import { createUserDocument, logAuditEvent } from '@/utils/authUtils';
import type { UserRole } from '@/types/auth';

export const useAuthOperations = () => {
  const signup = async (email: string, password: string) => {
    try {
      console.log('Starting signup operation...');
      
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        throw new Error('Firebase is offline. Please check your internet connection.');
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth:', result.user.uid);
      await createUserDocument(result.user.uid, email);
      console.log('User document created in Firestore');
      toast({ title: "Account created successfully", description: "Welcome to DreamStream!" });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({ 
        variant: "destructive", 
        title: "Error creating account", 
        description: error.message || "Failed to create account. Please check your internet connection."
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login operation for email:', email);
      
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        throw new Error('Firebase is offline. Please check your internet connection.');
      }
      
      // Attempt to sign in
      console.log('Attempting Firebase authentication...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful for:', result.user.email);
      
      // Fetch user document
      console.log('Fetching user document...');
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      console.log('User document exists:', userDoc.exists());
      
      if (!userDoc.exists()) {
        console.warn('User document not found, creating one...');
        await createUserDocument(result.user.uid, result.user.email);
      }
      
      const userData = userDoc.data();
      const role = userData?.role as UserRole;
      console.log('User role:', role);
      
      if (role === 'super_admin') {
        await logAuditEvent(result.user.uid, 'super_admin_login', { email });
      }

      toast({ title: "Logged in successfully", description: "Welcome back!" });
      return role;
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An unexpected error occurred during login.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Unable to connect to authentication service. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      toast({ 
        variant: "destructive", 
        title: "Login failed", 
        description: errorMessage
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      console.log('Google login success:', result.user.email);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await createUserDocument(result.user.uid, result.user.email);
        return 'member' as UserRole;
      } else {
        const userData = userDoc.data();
        const role = userData.role as UserRole;
        
        if (role === 'super_admin') {
          await logAuditEvent(result.user.uid, 'super_admin_google_login', { email: result.user.email });
        }
        
        return role;
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({ variant: "destructive", title: "Google login failed", description: error.message });
      throw error;
    }
  };

  const handleLogout = async (userId: string, userRole: UserRole | undefined) => {
    try {
      if (userRole === 'super_admin') {
        await logAuditEvent(userId, 'super_admin_logout', { });
      }
      
      await signOut(auth);
      localStorage.removeItem('authToken');
      toast({ title: "Logged out successfully" });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({ variant: "destructive", title: "Logout failed", description: error.message });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Password reset email sent", description: "Check your email for further instructions" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Password reset failed", description: error.message });
      throw error;
    }
  };

  return {
    signup,
    login,
    signInWithGoogle,
    handleLogout,
    resetPassword
  };
};
