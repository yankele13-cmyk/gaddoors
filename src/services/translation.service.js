import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SETTINGS_COLLECTION = 'settings';
const DOC_ID = 'document_translations';

const DEFAULT_TRANSLATIONS = {
  fr: {
    // En-têtes
    quoteTitle: "DEVIS",
    invoiceTitle: "FACTURE",
    quoteInvoiceTitle: "DEVIS / FACTURE",
    workOrderTitle: "FICHE DE TRAVAIL",
    
    // Labels Client
    clientLabel: "Client :",
    
    // Colonnes Tableau
    colDescription: "Description",
    colQty: "Qté",
    colUnitPrice: "P.U.",
    colTotal: "Total",
    
    // Totaux
    subTotalLabel: "Sous-total HT :",
    vatLabel: "TVA (17%) :",
    totalLabel: "Total TTC :",
    
    // Pied de page
    footerText: "Merci de votre confiance - Gad Doors",
    internalDocWarning: "DOCUMENT INTERNE - NE PAS REMETTRE AU CLIENT (KABLAN)"
  },
  he: {
    // En-têtes
    quoteTitle: "הצעת מחיר",
    invoiceTitle: "חשבונית",
    quoteInvoiceTitle: "הצעת מחיר / חשבונית",
    workOrderTitle: "הוראת עבודה",
    
    // Labels Client
    clientLabel: "לכבוד:",
    
    // Colonnes Tableau
    colDescription: "תיאור",
    colQty: "כמות",
    colUnitPrice: "מחיר יח'",
    colTotal: 'סה"כ',
    
    // Totaux
    subTotalLabel: 'סה"כ לפני מע"מ:',
    vatLabel: 'מע"מ (17%):',
    totalLabel: 'סה"כ לתשלום:',
    
    // Pied de page
    footerText: "תודה שבחרתם גד דורס",
    internalDocWarning: "מסמך פנימי - לא למסירה ללקוח (קבלן)"
  }
};

export const TranslationService = {
  
  /**
   * Fetch all translations.
   * If does not exist, creates it with defaults.
   */
  getAll: async () => {
    try {
      const ref = doc(db, SETTINGS_COLLECTION, DOC_ID);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        return { ...DEFAULT_TRANSLATIONS, ...snap.data() };
      } else {
        // Initialize with defaults
        await setDoc(ref, DEFAULT_TRANSLATIONS);
        return DEFAULT_TRANSLATIONS;
      }
    } catch (error) {
      console.error("Error fetching translations:", error);
      return DEFAULT_TRANSLATIONS; // Fallback
    }
  },

  /**
   * Update translations for a specific language
   * @param {string} lang 'fr' | 'he'
   * @param {object} translations Key-value pairs
   */
  updateLanguage: async (lang, translations) => {
    try {
      const ref = doc(db, SETTINGS_COLLECTION, DOC_ID);
      // We use dot notation to update nested fields without overwriting others
      // ex: { "fr.quoteTitle": "Devis Pro" }
      // But simpler is to merge the whole language object if we pass the whole object.
      // Or we can just update the `lang` field.
      
      await setDoc(ref, { [lang]: translations }, { merge: true });
      return { success: true };
    } catch (error) {
      console.error("Error updating translations:", error);
      return { success: false, error };
    }
  }
};
