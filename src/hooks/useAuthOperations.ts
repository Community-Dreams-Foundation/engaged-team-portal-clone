
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  getIdTokenResult
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import { createUserDocument, logAuditEvent } from '@/utils/authUtils';
import type { UserRole } from '@/types/auth';

export const useAuthOperations = () => {
  const signup = async (email: string, password: string) => {
    try {
      console.log('Starting signup operation...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created in Firebase Auth:', result.user.uid);
      await createUserDocument(result.user.uid, email);
      console.log('User document created in Firestore');
      toast({ title: "Account created successfully", description: "Welcome to DreamStream!" });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({ variant: "destructive", title: "Error creating account", description: error.message });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Starting login operation...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login success:', result.user.email);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      console.log('Retrieved user document:', userDoc.exists());
      const userData = userDoc.data();
      const role = userData?.role as UserRole;
      
      if (role === 'super_admin') {
        await logAuditEvent(result.user.uid, 'super_admin_login', { email });
      }

      toast({ title: "Logged in successfully", description: "Welcome back!" });
      return role;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({ variant: "destructive", title: "Login failed", description: error.message });
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
