import { doc, getDoc, setDoc, updateDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
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
    // SECURITY UPDATE: We no longer assign role here. The Cloud Function 'onUserCreate' handles it.
    // We just send the basic profile.
    
    const newUserData = {
      email: authUser.email,
      displayName: authUser.displayName || '',
      photoURL: authUser.photoURL || '',
      // role: 'viewer', // Don't even send it, let server default it.
      role: 'viewer', // Sent as default, but server overwrites if needed. 
                      // Actually, if we send it, we need to make sure rules allow CREATE with role.
                      // Ideally we send nothing and let trigger set it. 
                      // But our UI checks role immediately. 
                      // Let's send 'viewer' always.
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
  },

  /**
   * Get All Users (Admin view)
   */
  getAllUsers: async () => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return { 
            success: true, 
            data: snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) 
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
  },

  /**
   * Update User Role
   */
  updateUserRole: async (uid, newRole) => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        await updateDoc(userRef, { 
            role: newRole,
            updatedAt: serverTimestamp() 
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating role:", error);
        return { success: false, error: error.message };
    }
  }
};
