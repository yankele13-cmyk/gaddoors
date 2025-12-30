import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ALLOWED_ADMINS } from '../config/constants';

const COLLECTION_NAME = 'users';

export const userService = {
  /**
   * Syncs a user to Firestore.
   * If the user doesn't exist, it creates a profile.
   * Checks legacy ALLOWED_ADMINS to auto-assign 'admin' role if applicable.
   */
  syncUser: async (authUser) => {
    if (!authUser) return null;

    const userRef = doc(db, COLLECTION_NAME, authUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      // Update last login
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
      return { uid: authUser.uid, ...userData };
    }

    // New User Logic
    // MIGRATION: Check if email is in the legacy hardcoded list
    const isLegacyAdmin = ALLOWED_ADMINS.includes(authUser.email);
    const role = isLegacyAdmin ? 'admin' : 'viewer'; // Default role is viewer

    const newUserData = {
      email: authUser.email,
      displayName: authUser.displayName || '',
      photoURL: authUser.photoURL || '',
      role: role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    };

    await setDoc(userRef, newUserData);
    return { uid: authUser.uid, ...newUserData };
  },

  /**
   * Get user profile by ID
   */
  getUserProfile: async (uid) => {
    if (!uid) return null;
    const userRef = doc(db, COLLECTION_NAME, uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { uid, ...userSnap.data() } : null;
  }
};
