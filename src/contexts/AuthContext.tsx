
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  onIdTokenChanged,
  getIdTokenResult
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
import type { UserRole, ExtendedUser, AuditLog } from '@/types/auth';

interface AuthContextType {
  currentUser: ExtendedUser | null;
  userRole: UserRole | undefined;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  isNewUser: boolean;
  logAuditEvent: (action: string, details: Record<string, any>) => Promise<void>;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>();
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting persistence:', error);
        toast({ 
          variant: "destructive", 
          title: "Authentication Error", 
          description: "Failed to enable persistent login" 
        });
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      console.log('Token changed:', user?.email);
      if (user) {
        try {
          const token = await user.getIdToken(true);
          const tokenResult = await getIdTokenResult(user);
          const role = tokenResult.claims.role as UserRole;
          
          localStorage.setItem('authToken', token);
          setUserRole(role);
          
          // Update the extended user object
          const extendedUser: ExtendedUser = Object.assign(user, { role });
          setCurrentUser(extendedUser);
          
        } catch (error) {
          console.error('Error refreshing token:', error);
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "Failed to refresh authentication token"
          });
        }
      } else {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        setUserRole(undefined);
      }
    });

    return unsubscribe;
  }, []);

  const logAuditEvent = async (action: string, details: Record<string, any>) => {
    if (!currentUser) return;

    try {
      const auditLog: AuditLog = {
        userId: currentUser.uid,
        action,
        details,
        timestamp: Date.now()
      };

      await addDoc(collection(db, 'audit_logs'), auditLog);
      console.log('Audit log created:', action);
    } catch (error) {
      console.error('Error creating audit log:', error);
      toast({
        variant: "destructive",
        title: "Audit Log Error",
        description: "Failed to log admin action"
      });
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setIsNewUser(true);
      
      // Set default role as member
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        role: 'member',
        createdAt: Date.now()
      });

      toast({ title: "Account created successfully", description: "Welcome to DreamStream!" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error creating account", description: error.message });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login success:', result.user.email);
      
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userData = userDoc.data();
      const role = userData?.role as UserRole;
      
      setUserRole(role);
      setIsNewUser(false);
      
      if (role === 'super_admin') {
        await logAuditEvent('super_admin_login', { email });
      }

      toast({ title: "Logged in successfully", description: "Welcome back!" });
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
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // New user - set default role
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: 'member',
          createdAt: Date.now()
        });
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
        const userData = userDoc.data();
        setUserRole(userData.role as UserRole);
        
        if (userData.role === 'super_admin') {
          await logAuditEvent('super_admin_google_login', { email: result.user.email });
        }
      }

      toast({ title: "Logged in successfully", description: "Welcome to DreamStream!" });
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({ variant: "destructive", title: "Google login failed", description: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (currentUser && userRole === 'super_admin') {
        await logAuditEvent('super_admin_logout', { email: currentUser.email });
      }
      
      await signOut(auth);
      localStorage.removeItem('authToken');
      setUserRole(undefined);
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

  const isSuperAdmin = () => userRole === 'super_admin';
  const isAdmin = () => userRole === 'admin' || userRole === 'super_admin';

  useEffect(() => {
    console.log('Setting up Firebase auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const role = userData?.role as UserRole;
        
        const extendedUser: ExtendedUser = Object.assign(user, { role });
        setCurrentUser(extendedUser);
        setUserRole(role);
      } else {
        setCurrentUser(null);
        setUserRole(undefined);
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    loading,
    isNewUser,
    logAuditEvent,
    isSuperAdmin,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
