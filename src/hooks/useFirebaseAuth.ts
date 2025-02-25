
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserRole, ExtendedUser } from '@/types/auth';

export const useFirebaseAuth = (
  setCurrentUser: (user: ExtendedUser | null) => void,
  setUserRole: (role: UserRole | undefined) => void,
  setLoading: (loading: boolean) => void
) => {
  useEffect(() => {
    console.log('Setting up Firebase auth listener');
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user?.email);
      
      try {
        if (user && mounted) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          console.log('Retrieved user document:', userDoc.exists());
          const userData = userDoc.data();
          const role = userData?.role as UserRole;
          
          const extendedUser: ExtendedUser = Object.assign(user, { role });
          setCurrentUser(extendedUser);
          setUserRole(role);
        } else if (mounted) {
          setCurrentUser(null);
          setUserRole(undefined);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (mounted) {
          setCurrentUser(null);
          setUserRole(undefined);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setCurrentUser, setUserRole, setLoading]);
};

