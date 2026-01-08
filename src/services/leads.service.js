import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    doc, 
    serverTimestamp, 
    query, 
    orderBy,
    where 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import { LEAD_STATUS } from '../config/constants';
  
  /* 
   * LEGACY SERVICE - based on 'messages' collection 
   * Used by LeadKanban.jsx. 
   * Ideally should be migrated to `crm.service.js` ('leads' collection) in future.
   */
  const COLLECTION_NAME = 'messages'; // Using 'messages' as leads source for now as per schema analysis
  
  export const leadsService = {
    // GET ALL LEADS (sorted by newest)
    getAll: async () => {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Normalize status if missing
        status: doc.data().status || LEAD_STATUS.NEW 
      }));
    },
  
    // UPDATE STATUS
    updateStatus: async (id, newStatus) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        // If moving to contacted, mark as read
        read: true 
      });
    },
  
    // ADD INTERNAL NOTE
    addNote: async (id, noteText, author = 'Admin') => {
        // This assumes we have a subcollection or array. 
        // For simplicity in this structure, we'll append to an array in the doc.
        const docRef = doc(db, COLLECTION_NAME, id);
        // We can't easily arrayUnion with objects without full Firestore roundtrip or knowing exact structure matches.
        // Reading first is safer for complex objects or just use simple array if mapped.
        // Let's rely on client side merging for now or simple arrayUnion if strictly supported.
        // Actually, we'll just update a 'notes' field.
        // Since we didn't migrate old data, let's assume 'notes' is a string or array.
        // For Greenfield, let's make it an array.
        
        // This requires reading the doc first to append safely without arrayUnion limitations on objects 
        // or using arrayUnion with exact object.
        // Let's Keep it simple: Just update "lastNote" field for Kanban view 
        // and maybe append to a notes string.
        
        // BETTER: Subcollection 'notes' is cleaner for CRM.
        const notesColl = collection(db, COLLECTION_NAME, id, 'notes');
        await addDoc(notesColl, {
            text: noteText,
            author,
            createdAt: serverTimestamp()
        });
    },

    // GET NOTES
    getNotes: async (leadId) => {
        const notesColl = collection(db, COLLECTION_NAME, leadId, 'notes');
        const q = query(notesColl, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  };
