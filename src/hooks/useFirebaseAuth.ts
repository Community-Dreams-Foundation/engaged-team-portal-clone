
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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
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
  }, [setCurrentUser, setUserRole, setLoading]);
};
