import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error", error);
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
