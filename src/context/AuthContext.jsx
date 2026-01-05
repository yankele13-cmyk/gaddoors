import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService } from '../services/userService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // Separate state for role

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync user with Firestore and get profile + role
        try {
          const userProfile = await userService.syncUser(firebaseUser);
          setCurrentUser(firebaseUser);
          setUserRole(userProfile?.role || 'viewer');
        } catch (error) {
          console.error("Error syncing user profile:", error);
          // Graceful degradation: Keep user logged in, but with limited role.
          // This prevents the "Double Login" issue where a sync fail forces a logout/redirect.
          setCurrentUser(firebaseUser);
          setUserRole('viewer');
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loginWithGoogle,
    logout,
    // Helper to check if current user is admin (DYNAMIC CHECK)
    isAdmin: userRole === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
