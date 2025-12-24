/**
 * Operations (Ops) Service
 * Handles Installers & external resources
 */
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_INSTALLERS = 'installers';

export const OpsService = {

  async getAllInstallers() {
    try {
      const q = query(collection(db, COLLECTION_INSTALLERS), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const installers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: installers };
    } catch (error) {
      console.error("Error fetching installers:", error);
      return { success: false, error: error.message };
    }
  },

  async createInstaller(installerData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_INSTALLERS), {
        ...installerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, data: { id: docRef.id, ...installerData } };
    } catch (error) {
      console.error("Error creating installer:", error);
      return { success: false, error: error.message };
    }
  },

  async updateInstaller(id, updates) {
    try {
      const docRef = doc(db, COLLECTION_INSTALLERS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteInstaller(id) {
    try {
      await deleteDoc(doc(db, COLLECTION_INSTALLERS, id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
