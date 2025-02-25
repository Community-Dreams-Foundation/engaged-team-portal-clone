
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  onIdTokenChanged,
  getIdTokenResult
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { checkRole } from '@/utils/authUtils';
import type { UserRole, ExtendedUser } from '@/types/auth';

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
  const { signup, login, signInWithGoogle, handleLogout, resetPassword } = useAuthOperations();

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

  useEffect(() => {
    console.log('Setting up Firebase auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      
      if (user) {
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
    login: async (email: string, password: string) => {
      const role = await login(email, password);
      setUserRole(role);
      setIsNewUser(false);
    },
    signup: async (email: string, password: string) => {
      await signup(email, password);
      setIsNewUser(true);
    },
    logout: async () => {
      if (currentUser) {
        await handleLogout(currentUser.uid, userRole);
        setUserRole(undefined);
      }
    },
    resetPassword,
    signInWithGoogle: async () => {
      const role = await signInWithGoogle();
      setUserRole(role);
      setIsNewUser(!role);
      toast({ title: "Logged in successfully", description: "Welcome to DreamStream!" });
    },
    loading,
    isNewUser,
    logAuditEvent: async (action: string, details: Record<string, any>) => {
      if (currentUser) {
        await logAuditEvent(currentUser.uid, action, details);
      }
    },
    ...checkRole(userRole)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

