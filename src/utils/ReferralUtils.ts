import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment,
  collection,
  query,
  where,
  getDocs,
  arrayUnion
} from 'firebase/firestore';

export const generateReferralCode = (userId: string): string => {
  // Generate a unique referral code using user ID and random characters
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${userId.substring(0, 4)}-${randomChars}`;
};

export const createReferralRecord = async (userId: string, userEmail: string) => {
  const db = getFirestore();
  const referralCode = generateReferralCode(userId);
  
  await setDoc(doc(db, 'referrals', userId), {
    userId,
    userEmail,
    referralCode,
    referralsCount: 0,
    successfulReferrals: 0,
    totalRewards: 0,
    createdAt: new Date(),
    referralHistory: []
  });
  
  return referralCode;
};

export const trackReferral = async (referralCode: string, newUserId: string) => {
  const db = getFirestore();
  
  // Find the referrer's document using the referral code
  const referralsRef = collection(db, 'referrals');
  const q = query(referralsRef, where('referralCode', '==', referralCode));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('Invalid referral code');
  }

  const referrerDoc = querySnapshot.docs[0];
  const referrerId = referrerDoc.id;

  // Update referrer's statistics
  await updateDoc(doc(db, 'referrals', referrerId), {
    referralsCount: increment(1),
    referralHistory: arrayUnion({
      newUserId,
      timestamp: new Date(),
      status: 'pending'
    })
  });
};

export const completeReferral = async (referrerId: string, newUserId: string) => {
  const db = getFirestore();
  const referralDoc = doc(db, 'referrals', referrerId);
  
  // Update successful referrals count and reward
  await updateDoc(referralDoc, {
    successfulReferrals: increment(1),
    totalRewards: increment(10), // $10 reward per successful referral
    'referralHistory': arrayUnion({
      newUserId,
      timestamp: new Date(),
      status: 'completed',
      rewardAmount: 10
    })
  });
};
