import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ORDER_STATUS, APP_CONFIG } from '../config/constants';

const COLLECTION_NAME = 'orders';

export const ordersService = {
  // GET ALL ORDERS
  getAll: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // CREATE ORDER (SNAPSHOT PATTERN)
  // We receive "live" objects, we must flatten them into snapshots
  create: async (quoteData) => {
    const { client, items, logistics } = quoteData;

    // 1. Calculate Financials (Server-side like validation logic)
    const itemsTotal = items.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0);
    
    // Logistics Logic
    let deliveryCost = APP_CONFIG.LOGISTICS?.BASE_PRICE || 250;
    if (logistics.floor > 2 && !logistics.hasElevator) {
        deliveryCost += (logistics.floor - 2) * (APP_CONFIG.LOGISTICS?.FLOOR_SURCHARGE || 50);
    }
    // If Crane selected (manually added as item or flag? Let's check schema. MD said logistics object)
    // For now we assume logic is simple standard delivery.

    const subTotal = itemsTotal + deliveryCost;
    const vatAmount = subTotal * APP_CONFIG.VAT_RATE;
    const totalGt = subTotal + vatAmount;

    // 2. Construct The Document
    const orderDoc = {
      humanId: `CMD-${Date.now().toString().slice(-6)}`, // Simple ID gen
      status: ORDER_STATUS.DRAFT,
      
      clientSnapshot: {
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address
      },

      logistics: {
        ...logistics,
        calculatedDeliveryCost: deliveryCost
      },

      items: items.map(item => ({
        productId: item.productId,
        name: item.name, // Snapshot Name
        quantity: item.quantity,
        unitPriceSnapshot: item.priceSnapshot, // Snapshot Price
        totalPrice: item.priceSnapshot * item.quantity,
        specs: item.specs || {}, // Technical specs (Door config)
        roomLabel: item.roomLabel || ''
      })),

      financials: {
        subTotal,
        logisticsCost: deliveryCost,
        vatRate: APP_CONFIG.VAT_RATE, // Snapshot VAT rate
        vatAmount,
        totalGt,
        balanceDue: totalGt // Initially full amount due
      },

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    return await addDoc(collection(db, COLLECTION_NAME), orderDoc);
  },

  // UPDATE ORDER STATUS
  updateStatus: async (id, status) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }
};
