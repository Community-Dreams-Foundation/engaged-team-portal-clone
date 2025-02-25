
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
  onIdTokenChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  isNewUser: boolean;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
          localStorage.setItem('authToken', token);
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
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsNewUser(true);
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
      setIsNewUser(false);
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
      setIsNewUser(false);
      if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        setIsNewUser(true);
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

  useEffect(() => {
    console.log('Setting up Firebase auth listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    loading,
    isNewUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

