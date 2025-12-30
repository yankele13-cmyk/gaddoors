/**
 * CRM Service
 * Handles Leads, Appointments, and Measurements (Medidot)
 */
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_LEADS = 'leads';
const COLLECTION_APPOINTMENTS = 'appointments';
const COLLECTION_MEASUREMENTS = 'measurements';

export const CRMService = {

  // --- LEADS ---

  async getAllLeads() {
    try {
      const q = query(collection(db, COLLECTION_LEADS), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: leads };
    } catch (error) {
      console.error("Error getting leads:", error);
      return { success: false, error: error.message };
    }
  },

  async createLead(leadData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_LEADS), {
        ...leadData,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, data: { id: docRef.id, ...leadData } };
    } catch (error) {
      console.error("Error creating lead:", error);
      return { success: false, error: error.message };
    }
  },

  async updateLeadStatus(leadId, status) {
    try {
      const leadRef = doc(db, COLLECTION_LEADS, leadId);
      await updateDoc(leadRef, { 
        status, 
        updatedAt: serverTimestamp() 
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating lead status:", error);
      return { success: false, error: error.message };
    }
  },

  // --- APPOINTMENTS & CONVERSION ---

  /**
   * atomic convertLeadToAppointment
   * 1. Creates Appointment
   * 2. Updates Lead status to 'converted'
   * 3. Uses Batch for atomicity
   */
  async convertLeadToAppointment(leadId, appointmentData) {
    try {
      const batch = writeBatch(db);

      // 1. Create Appointment Reference
      // We use doc() with no ID to generate one, then set() instead of add() for batch
      const apptRef = doc(collection(db, COLLECTION_APPOINTMENTS));
      
      const start = appointmentData.date ? new Date(appointmentData.date) : new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const title = appointmentData.title || `${appointmentData.clientName || 'Client'} - ${appointmentData.type || 'Rendez-vous'}`;

      batch.set(apptRef, {
        ...appointmentData,
        relatedLeadId: leadId,
        start,
        end,
        title,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Update Lead Reference
      const leadRef = doc(db, COLLECTION_LEADS, leadId);
      batch.update(leadRef, {
        status: 'meeting_scheduled', // Or 'converted' depending on workflow
        relatedAppointmentId: apptRef.id,
        updatedAt: serverTimestamp()
      });

      // 3. Commit
      await batch.commit();

      return { success: true, data: { appointmentId: apptRef.id } };
    } catch (error) {
      console.error("Error converting lead:", error);
      return { success: false, error: error.message };
    }
  },

  async getAllAppointments() {
    try {
      const q = query(collection(db, COLLECTION_APPOINTMENTS), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const appts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: appts };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUpcomingAppointments(limitCount = 10) {
      try {
          const now = new Date().toISOString();
          // Assuming 'date' stored as ISO string in createAppointment (AppointmentModal)
          const q = query(
              collection(db, COLLECTION_APPOINTMENTS), 
              where('date', '>=', now),
              orderBy('date', 'asc'), 
              limit(limitCount)
          );
          const snapshot = await getDocs(q);
          const appts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return { success: true, data: appts };
      } catch (error) {
          return { success: false, error: error.message };
      }
  },

  async createAppointment(appointmentData) {
    try {
        // Prepare Calendar-compatible fields
        const start = appointmentData.date ? new Date(appointmentData.date) : new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration default
        const title = appointmentData.title || `${appointmentData.clientName || 'Client'} - ${appointmentData.type || 'Rendez-vous'}`;

        const docRef = await addDoc(collection(db, COLLECTION_APPOINTMENTS), {
            ...appointmentData,
            start, // Timestamp/Date for Calendar
            end,   // Timestamp/Date for Calendar
            title, // Title for Calendar
            status: 'scheduled',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, data: { id: docRef.id } };
    } catch (error) {
        return { success: false, error: error.message };
    }
  },

  // --- MEASUREMENTS (MEDIDOT) ---

  async createMeasurementReport(reportData) {
     try {
      const docRef = await addDoc(collection(db, COLLECTION_MEASUREMENTS), {
        ...reportData,
        createdAt: serverTimestamp()
      });
      return { success: true, data: { id: docRef.id } };
    } catch (error) {
      console.error("Error creating measurement:", error);
      return { success: false, error: error.message };
    }
  }
};
