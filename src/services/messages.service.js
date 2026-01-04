
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  addDoc,
  serverTimestamp 
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";

const COLLECTION_NAME = "messages";

export const MessagesService = {
  /**
   * Get all messages ordered by date desc
   */
  async getAllMessages() {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return { 
        success: true, 
        data: snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date() 
        })) 
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mark a message as read
   */
  async markAsRead(id) {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), { 
        read: true,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Delete a message
   */
  async deleteMessage(id) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (error) {
       return { success: false, error: error.message };
    }
  },

  /**
   * Reply to message (Simulated/Stub for now, or via Mail collection extension)
   */
  /**
   * Reply to message via Cloud Function (Gmail API)
   */
  async replyToMessage(id, replyContent, recipientEmail) {
    try {
       // Call Cloud Function
       const sendEmailReply = httpsCallable(functions, 'sendEmailReply');
       
       await sendEmailReply({
           messageId: id,
           recipientEmail: recipientEmail,
           subject: "Réponse de Gad Doors", // Could be dynamic if needed
           text: replyContent
       });

       return { success: true };
    } catch (error) {
        console.error("Reply Error:", error);
        return { success: false, error: error.message };
    }
  }
};
