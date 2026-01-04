/**
 * Finance Service
 * Handles Quotes (Devis) and Invoices (Factures)
 * CRITICAL: Implements Snapshot Logic for Quotes
 */
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  limit, 
  serverTimestamp,
  arrayUnion,
  getDoc,
  runTransaction,
  startAfter 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { APP_CONFIG, ORDER_STATUS } from '../config/constants';

const COLLECTION_QUOTES = 'quotes';
const COLLECTION_INVOICES = 'invoices';
const COLLECTION_ORDERS = 'orders';

export const FinanceService = {

  // --- QUOTES (DEVIS) ---

  /**
   * createQuote - SNAPSHOT PATTERN
   * Copies product details (name, price) at the moment of creation.
   * Does NOT rely on referencing the products collection later.
   */
  async createQuote(leadId, items) {
    try {
      // 1. Calculate Totals & Prepare Snapshot Items
      let subtotal = 0;
      
      const snapshotItems = items.map(item => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;

        // CRITICAL: We return a clean object with NO references to external logic
        return {
          productId: item.id || null, // Optional ref
          name: item.name, // Hard copy
          description: item.description || "",
          priceAtCreation: Number(item.price), // Hard copy
          quantity: Number(item.quantity),
          lineTotal: lineTotal,
          specs: item.specs || {} // Specific configuration (dimensions etc)
        };
      });

      const tax = subtotal * 0.17; // Israeli VAT 17%
      const total = subtotal + tax;

      // 2. Create Document
      const docRef = await addDoc(collection(db, COLLECTION_QUOTES), {
        leadId,
        items: snapshotItems,
        subtotal,
        tax,
        total,
        currency: 'ILS', // Default
        status: 'draft',
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 Days validity
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, data: { id: docRef.id, total } };
    } catch (error) {
      console.error("Error creating quote:", error);
      return { success: false, error: error.message };
    }
  },

  async getAllQuotes() {
    try {
      const q = query(collection(db, COLLECTION_QUOTES), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const quotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: quotes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getRecentOrders(limitCount = 50) {
    try {
        const q = query(collection(db, COLLECTION_ORDERS), orderBy('createdAt', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data: orders };
    } catch (error) {
        return { success: false, error: error.message };
    }
  },

  // --- ORDERS & PAYMENTS ---

  // --- ORDERS & PAYMENTS ---
  
  // PAGINATION for Orders
  async getOrdersPage(lastVisible = null, pageSize = 20) {
    try {
        let q = query(collection(db, COLLECTION_ORDERS), orderBy('createdAt', 'desc'), limit(pageSize));
        if (lastVisible) {
            q = query(collection(db, COLLECTION_ORDERS), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(pageSize));
        }

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        
        return { items, lastDoc };
    } catch (error) {
        console.error("Error fetching orders page:", error);
        return { items: [], lastDoc: null, error: error.message };
    }
  },

  /**
   * createOrderFromQuote (Unified Logic)
   * Calculates Financials, Logistics, and Creates Order Snapshot
   */
  async createOrderFromQuote(quoteData) {
    try {
        const { client, items, logistics } = quoteData;

        // 1. Calculate Financials (Server-side validation logic)
        // Ensure priceSnapshot is used if available, else fallback to current price
        const itemsTotal = items.reduce((sum, item) => sum + ((item.priceSnapshot || item.price || 0) * item.quantity), 0);
        
        // Logistics Logic
        let deliveryCost = APP_CONFIG.LOGISTICS?.BASE_PRICE || 250;
        if (logistics && logistics.floor > 2 && !logistics.hasElevator) {
            deliveryCost += (logistics.floor - 2) * (APP_CONFIG.LOGISTICS?.FLOOR_SURCHARGE || 50);
        }

        const subTotal = itemsTotal + deliveryCost;
        const vatAmount = subTotal * (APP_CONFIG.VAT_RATE || 0.17);
        const totalGt = subTotal + vatAmount;

        // 2. Construct The Document
        const orderDoc = {
          humanId: `CMD-${Date.now().toString().slice(-6)}`,
          status: ORDER_STATUS.DRAFT || 'draft',
          
          clientSnapshot: {
            name: client.name || '',
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || ''
          },

          logistics: {
            zone: logistics?.zone || '',
            floor: Number(logistics?.floor) || 0,
            hasElevator: Boolean(logistics?.hasElevator),
            calculatedDeliveryCost: deliveryCost
          },

          items: items.map(item => ({
            productId: item.productId || item.id,
            name: item.name, 
            quantity: Number(item.quantity),
            unitPriceSnapshot: Number(item.priceSnapshot || item.price), 
            totalPrice: Number(item.priceSnapshot || item.price) * Number(item.quantity),
            specs: item.specs || {}, 
            roomLabel: item.roomLabel || ''
          })),

          financials: {
            subTotal,
            logisticsCost: deliveryCost,
            vatRate: APP_CONFIG.VAT_RATE || 0.17,
            vatAmount,
            totalGt,
            balanceDue: totalGt, // Initially full amount
            amountPaid: 0 // Explicitly init
          },

          payments: [],
          installerId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, COLLECTION_ORDERS), orderDoc);
        return { success: true, data: { id: docRef.id } };

    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error: error.message };
    }
  },

  async convertQuoteToOrder(quoteId) {
    try {
        const quoteRef = doc(db, COLLECTION_QUOTES, quoteId);
        const quoteSnap = await getDoc(quoteRef);

        if (!quoteSnap.exists()) throw new Error("Devis introuvable");

        const quoteData = quoteSnap.data();

        // Create Order with 'pending_payment'
        const orderData = {
            ...quoteData,
            quoteId: quoteId,
            status: 'pending_payment',
            amountPaid: 0,
            payments: [],
            installerId: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const orderRef = await addDoc(collection(db, COLLECTION_ORDERS), orderData);
        return { success: true, data: { id: orderRef.id } };

    } catch (error) {
        return { success: false, error: error.message };
    }
  },

  async getOrderById(orderId) {
      try {
          const docRef = doc(db, COLLECTION_ORDERS, orderId);
          const snap = await getDoc(docRef);
          if (snap.exists()) return { success: true, data: { id: snap.id, ...snap.data() } };
          return { success: false, error: "Commande introuvable" };
      } catch (error) {
          return { success: false, error: error.message };
      }
  },

  async deleteOrder(orderId) {
    try {
        await deleteDoc(doc(db, COLLECTION_ORDERS, orderId));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
  },

  async updateOrder(orderId, updates) {
      try {
          const docRef = doc(db, COLLECTION_ORDERS, orderId);
          await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
          return { success: true };
      } catch (error) {
          return { success: false, error: error.message };
      }
  },

  async updateOrderStatus(id, status) {
    try {
        const docRef = doc(db, COLLECTION_ORDERS, id);
        await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
  },

  /**
   * addPayment
   * Updates Payment Array AND recalculates Status
   */
  async addPayment(orderId, paymentData) {
    try {
      const { type, amount, date, reference, bankName, dueDate } = paymentData;

      if (!amount || !date) {
        throw new Error("Montant et date requis");
      }

      // 1. Strict Validation
      if (type === 'check') {
        if (!bankName || !dueDate) {
          throw new Error("Pour les chèques, Nom de Banque et Date d'échéance sont obligatoires.");
        }
      }

      const paymentRecord = {
        id: Date.now().toString(), // Simple ID
        type, 
        amount: Number(amount),
        date,
        reference: reference || '',
        bankName: type === 'check' ? bankName : null,
        dueDate: type === 'check' ? dueDate : null,
        recordedAt: new Date().toISOString()
      };

      // 2. Transaction to ensure Atomic Update of Balance & Status
      const orderRef = doc(db, COLLECTION_ORDERS, orderId);
      
      await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(orderRef);
          if (!sfDoc.exists()) throw new Error("Document does not exist!");

          const currentData = sfDoc.data();
          const newAmountPaid = (Number(currentData.amountPaid) || 0) + Number(amount);
          const totalInfo = Number(currentData.total);
          
          let newStatus = currentData.status;

          // Status Logic
          if (newAmountPaid >= totalInfo - 1) { // Tolerance of 1 shekel for rounding
              newStatus = 'paid'; // Fully Paid (logic could be 'installation_scheduled' if separate workflow)
          } else if (newAmountPaid > 0) {
              newStatus = 'partial_payment';
          }

          transaction.update(orderRef, {
              amountPaid: newAmountPaid,
              payments: arrayUnion(paymentRecord),
              status: newStatus,
              updatedAt: serverTimestamp()
          });
      });

      return { success: true, data: paymentRecord };

    } catch (error) {
      console.error("Error adding payment:", error);
      return { success: false, error: error.message };
    }
  },

  async createInvoiceFromQuote(quoteId, quoteData) {
     try {
       // Deep copy relevant data
       const invoiceData = {
         relatedQuoteId: quoteId,
         items: quoteData.items,
         subtotal: quoteData.subtotal,
         tax: quoteData.tax,
         total: quoteData.total,
         status: 'issued',
         payments: [], // Start empty
         createdAt: serverTimestamp()
       };
       
       const docRef = await addDoc(collection(db, COLLECTION_INVOICES), invoiceData);
       return { success: true, data: { id: docRef.id } };
     } catch (error) {
       return { success: false, error: error.message };
     }
  }
};
