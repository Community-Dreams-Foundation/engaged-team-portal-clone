
import { useEffect } from 'react';
import { getIdToken, getIdTokenResult } from 'firebase/auth';
import { toast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import type { UserRole, ExtendedUser } from '@/types/auth';

export const useFirebaseToken = (
  setCurrentUser: (user: ExtendedUser | null) => void,
  setUserRole: (role: UserRole | undefined) => void
) => {
  useEffect(() => {
    console.log('Setting up Firebase token listener');
    let mounted = true;

    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      console.log('Token changed:', user?.email);
      try {
        if (user && mounted) {
          try {
            const token = await getIdToken(user, true);
            const tokenResult = await getIdTokenResult(user);
            const role = tokenResult.claims.role as UserRole;
            
            localStorage.setItem('authToken', token);
            if (mounted) {
              setUserRole(role);
              const extendedUser: ExtendedUser = Object.assign(user, { role });
              setCurrentUser(extendedUser);
            }
          } catch (error) {
            console.error('Error refreshing token:', error);
            if (mounted) {
              toast({
                variant: "destructive",
                title: "Session Error",
                description: "Failed to refresh authentication token"
              });
            }
          }
        } else if (mounted) {
          console.log('No authenticated user, clearing state');
          localStorage.removeItem('authToken');
          setCurrentUser(null);
          setUserRole(undefined);
        }
      } catch (error) {
        console.error('Firebase token processing error:', error);
        if (mounted) {
          setCurrentUser(null);
          setUserRole(undefined);
        }
      }
    });

    return () => {
      console.log('Cleaning up Firebase token listener');
      mounted = false;
      unsubscribe();
    };
  }, [setCurrentUser, setUserRole]);
};
