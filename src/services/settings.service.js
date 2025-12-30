import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SETTINGS_COLLECTION = 'settings';
const GENERAL_DOC_ID = 'general';

export const SettingsService = {
  /**
   * Fetch General Settings (Categories, VAT)
   * Returns: { success: true, data: { productCategories: [], vatRate: 0.17 } }
   */
  async getGeneralSettings() {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        // Fallback defaults if DB is empty/fails
        console.warn("Settings document not found. Using defaults.");
        return { 
          success: true, 
          data: { 
            productCategories: ["Porte Intérieure", "Porte Blindée", "Poignée", "Serrure"],
            vatRate: 0.17
          } 
        };
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      return { success: false, error: error.message };
    }
  }
};
