
import { createContext, useContext, useEffect, useState } from 'react';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { checkRole, logAuditEvent } from '@/utils/authUtils';
import { useFirebaseToken } from '@/hooks/useFirebaseToken';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import type { UserRole, ExtendedUser } from '@/types/auth';
import type { AuthContextType } from '@/types/authContext';

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
    console.log('Setting up Firebase persistence...');
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

  useFirebaseToken(setCurrentUser, setUserRole);
  useFirebaseAuth(setCurrentUser, setUserRole, setLoading);

  const value = {
    currentUser,
    userRole,
    login: async (email: string, password: string) => {
      console.log('AuthContext: Starting login process');
      const role = await login(email, password);
      console.log('AuthContext: Setting user role:', role);
      setUserRole(role);
      setIsNewUser(false);
    },
    signup: async (email: string, password: string) => {
      console.log('AuthContext: Starting signup process');
      await signup(email, password);
      setIsNewUser(true);
    },
    logout: async () => {
      console.log('AuthContext: Starting logout process');
      if (currentUser) {
        await handleLogout(currentUser.uid, userRole);
        setUserRole(undefined);
      }
    },
    resetPassword,
    signInWithGoogle: async () => {
      console.log('AuthContext: Starting Google sign-in process');
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
