
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
      const errorMessage = error.code ? `Error (${error.code}): ${error.message}` : error.message;
      toast({ 
        variant: "destructive", 
        title: "Error creating account", 
        description: errorMessage || "Failed to create account. Please check your internet connection."
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login operation for:', email);
      
      const isConnected = await checkFirebaseConnection();
      if (!isConnected) {
        console.error('Firebase connection check failed');
        throw new Error('Firebase is offline. Please check your internet connection.');
      }
      
      console.log('Firebase connection check passed, attempting authentication...');
      let result;
      try {
        result = await signInWithEmailAndPassword(auth, email, password);
        console.log('Firebase login successful for:', result.user.email);
      } catch (authError: any) {
        console.error('Firebase authentication error:', authError);
        throw authError;
      }
      
      console.log('Fetching user document...');
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', result.user.uid));
        console.log('User document exists:', userDoc.exists());
      } catch (firestoreError) {
        console.error('Firestore fetch error:', firestoreError);
        throw new Error('Failed to fetch user data from Firestore');
      }
      
      let role: UserRole;
      
      if (!userDoc.exists()) {
        console.log('Creating user document for new user');
        try {
          await createUserDocument(result.user.uid, email);
          role = 'member';
        } catch (createDocError) {
          console.error('Error creating user document:', createDocError);
          throw new Error('Failed to create user document');
        }
      } else {
        const userData = userDoc.data();
        role = userData?.role as UserRole;
        console.log('User role from document:', role);
      }
      
      if (role === 'super_admin') {
        try {
          await logAuditEvent(result.user.uid, 'super_admin_login', { email });
        } catch (auditError) {
          console.error('Failed to log audit event:', auditError);
          // Continue login process even if audit logging fails
        }
      }

      console.log('Login successful, returning role:', role);
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
      } else if (error.code) {
        errorMessage = `Authentication error (${error.code}): ${error.message}`;
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
