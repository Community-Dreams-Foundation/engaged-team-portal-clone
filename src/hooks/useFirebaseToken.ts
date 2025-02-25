
import { useEffect } from 'react';
import { User, getIdToken, getIdTokenResult } from 'firebase/auth';
import { toast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import type { UserRole, ExtendedUser } from '@/types/auth';

export const useFirebaseToken = (
  setCurrentUser: (user: ExtendedUser | null) => void,
  setUserRole: (role: UserRole | undefined) => void
) => {
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      console.log('Token changed:', user?.email);
      if (user) {
        try {
          const token = await getIdToken(user, true);
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
  }, [setCurrentUser, setUserRole]);
};
