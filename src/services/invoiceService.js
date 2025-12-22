import { collection, addDoc, getDocs, doc, updateDoc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const INVOICES_COLLECTION = "invoices";

/**
 * Creates a new invoice in Firestore.
 * @param {Object} invoiceData The invoice data to save.
 * @returns {Promise<string>} The ID of the created invoice.
 */
export async function createInvoice(invoiceData) {
  // Calculate totals to ensure backend consistency (optional, but good practice)
  // We assume frontend passes calculated values, but we could re-calc here.
  
  const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
    ...invoiceData,
    status: 'pending', // Default status
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/**
 * Retrieves all invoices ordered by creation date (newest first).
 * @returns {Promise<Array>} List of invoices.
 */
export async function getInvoices() {
  const q = query(collection(db, INVOICES_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert timestamp to Date object if present
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    date: doc.data().date || new Date().toISOString().split('T')[0]
  }));
}

/**
 * Updates the status of an invoice (e.g., 'paid').
 * @param {string} invoiceId 
 * @param {string} status 
 */
export async function updateInvoiceStatus(invoiceId, status) {
  const docRef = doc(db, INVOICES_COLLECTION, invoiceId);
  await updateDoc(docRef, { 
    status,
    updatedAt: serverTimestamp()
  });
}
