
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserRole, ExtendedUser } from '@/types/auth';
import { toast } from '@/components/ui/use-toast';

export const useFirebaseAuth = (
  setCurrentUser: (user: ExtendedUser | null) => void,
  setUserRole: (role: UserRole | undefined) => void,
  setLoading: (loading: boolean) => void
) => {
  useEffect(() => {
    console.log('Setting up Firebase auth listener');
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed. User:', user?.email);
      
      if (!mounted) {
        console.log('Component unmounted, skipping state updates');
        return;
      }

      try {
        if (user) {
          console.log('Fetching user document for:', user.email);
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, 'users', user.uid));
            console.log('User document exists:', userDoc.exists());
          } catch (firestoreError) {
            console.error('Error fetching user document:', firestoreError);
            throw new Error('Failed to fetch user data');
          }
          
          if (!userDoc.exists()) {
            console.warn('User document missing');
            const role: UserRole = 'member';
            const extendedUser = Object.assign(user, { role });
            setCurrentUser(extendedUser);
            setUserRole(role);
          } else {
            const userData = userDoc.data();
            const role = userData?.role as UserRole;
            console.log('User role from Firestore:', role);
            const extendedUser = Object.assign(user, { role });
            setCurrentUser(extendedUser);
            setUserRole(role);
          }
        } else {
          console.log('No user found, clearing state');
          setCurrentUser(null);
          setUserRole(undefined);
        }
      } catch (error: any) {
        console.error('Error in auth state change:', error);
        const errorMessage = error.code 
          ? `Authentication error (${error.code}): ${error.message}`
          : error.message || 'Failed to load user data';
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: errorMessage
        });
        setCurrentUser(null);
        setUserRole(undefined);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      console.log('Cleaning up Firebase auth listener');
      mounted = false;
      unsubscribe();
    };
  }, [setCurrentUser, setUserRole, setLoading]);
};
