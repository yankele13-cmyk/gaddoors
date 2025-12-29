// src/services/db.js
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  getCountFromServer 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import i18n from '../i18n';

// Helper to generate localized description
export function generateDescription(name) {
  const key = `productDescriptions.${name}`;
  if (i18n.exists(key)) {
    return i18n.t(key);
  }
  return i18n.t('product.defaultDescription'); 
}

const HANDLE_KEYS = ["Modello Roma", "Modello Venezia", "Modello Firenze", "Modello Verona", "Modello Siena", "Modello Pisa", "Modello Lucca", "Modello San Gimignano", "Modello Positano", "Modello Amalfi", "Modello Sorrento", "Modello Capri", "Modello Portofino", "Modello Bellagio", "Modello Como"];
const DOOR_KEYS = ["Porte Milano", "Porte Torino", "Porte Bologna", "Porte Genova", "Porte Napoli", "Porte Palermo", "Porte Bari", "Porte Catania", "Porte Trieste", "Porte Padova", "Porte Parma", "Porte Modena", "Porte Brescia", "Porte Perugia", "Porte Livorno"];

/**
 * Récupère tous les produits de la collection "products" dans Firestore.
 * @returns {Promise<Array<Object>>} Une promesse qui résout en un tableau d'objets produits.
 */
export async function getProducts() {
  const productsCollection = collection(db, "products");
  const productsSnapshot = await getDocs(productsCollection);
  
  const productList = productsSnapshot.docs.map(doc => {
    const data = doc.data();
    // We now trust the Name in Firestore (since we ran the scripts)
    // But we might need to fix names if they are generic like "Porte 1" just for the demo logic?
    // The previous logic had a fallback for names based on ID char code.
    // I will preserve that logic for robustness if name is missing/generic, 
    // but prefer the stored name.
    
    let name = data.name;

    // Fallback logic from previous version regarding generating names if they look generic?
    // The previous code had:
    /*
    const isHandle = name.toLowerCase().includes('handle') || ...;
    if (isHandle) { ... name = HANDLE_KEYS[...] }
    */
    // Since we ran a migration script to fix names in DB, we should respect data.name mostly.
    // But duplicate logic was strict.
    // Let's keep it simple: assume DB is correct. If DB has "Modello Roma", we use it.
    // We only use generateDescription.

    return {
      ...data,
      id: doc.id, 
      originalName: data.name,
      name: name,
      // Priority: 1. DB description, 2. Generated localized description
      // Actually, we WANT localized description.
      // If DB has a static French string, we should ignore it if we want full localization?
      // Or we should prefer generateDescription if it finds a key?
      description: generateDescription(name)
    };
  });
  
  return productList;
}

/**
 * Récupère un produit spécifique par son ID depuis Firestore.
 * @param {string} productId L'ID du document produit à récupérer.
 * @returns {Promise<Object|null>} Une promesse qui résout avec l'objet produit ou null s'il n'est pas trouvé.
 */
export async function getProductById(productId) {
  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);

  if (productSnap.exists()) {
    const data = productSnap.data();
    const name = data.name;

    return { 
        id: productSnap.id, 
        ...data,
        originalName: data.name,
        name: name,
        description: generateDescription(name)
    };
  } else {
    console.warn(`Aucun produit trouvé avec l'ID : ${productId}`);
    return null;
  }
}

/**
 * Récupère toutes les réalisations de la collection "installations".
 * @returns {Promise<Array<Object>>}
 */
export async function getInstallations() {
  const installationsCollection = collection(db, "installations");
  const snapshot = await getDocs(installationsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Envoie un message de contact dans la collection "messages".
 * @param {Object} messageData Les données du message (nom, email, phone, message).
 * @returns {Promise<string>} L'ID du document créé.
 */
export async function sendMessage(messageData) {
  const messagesCollection = collection(db, "messages");
  const docRef = await addDoc(messagesCollection, {
    ...messageData,
    createdAt: serverTimestamp(), // Utilise le timestamp serveur pour la fiabilité
    read: false
  });
  return docRef.id;
}

// --- ADMIN HELPERS ---

export async function getRecentMessages(limitCount = 5) {
  const messagesCollection = collection(db, "messages");
  const q = query(messagesCollection, orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  }));
}

export async function getDashboardStats() {
  const messagesColl = collection(db, "messages");
  
  // Count unread messages
  const unreadQuery = query(messagesColl, where("read", "==", false));
  const unreadSnapshot = await getCountFromServer(unreadQuery);
  
  // Count total products
  const productsColl = collection(db, "products");
  const productsSnapshot = await getCountFromServer(productsColl);

  // Calculate Monthly Revenue (Real Data)
  const invoicesColl = collection(db, "invoices");
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const invoicesSnapshot = await getDocs(invoicesColl);
  
  let monthlyRevenue = 0;
  invoicesSnapshot.forEach(doc => {
    const data = doc.data();
    // Check if invoice date is in current month
    const invDate = data.createdAt ? data.createdAt.toDate() : (data.date ? new Date(data.date) : new Date());
    
    if (invDate >= startOfMonth) {
       monthlyRevenue += (data.totals?.totalTTC || 0);
    }
  });

  return {
    unreadMessages: unreadSnapshot.data().count,
    totalProducts: productsSnapshot.data().count,
    monthlyRevenue: monthlyRevenue, 
    pendingInstallations: 3 // Kept as mock for now or link to calendar logic later
  };
}

export async function getLeads() {
  const messagesCollection = collection(db, "messages");
  const q = query(messagesCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  }));
}

export async function updateLeadStatus(id, newStatus) {
  const docRef = doc(db, "messages", id);
  await updateDoc(docRef, { 
    status: newStatus,
    read: true, // Auto-mark as read if status changes
    updatedAt: serverTimestamp()
  });
}

// --- CALENDAR / APPOINTMENTS ---

export async function getAppointments() {
  const appointmentsCollection = collection(db, "appointments");
  const q = query(appointmentsCollection, orderBy("start", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      start: data.start?.toDate() || new Date(),
      end: data.end?.toDate() || new Date()
    };
  });
}

export async function addAppointment(appointmentData) {
  const appointmentsCollection = collection(db, "appointments");
  const docRef = await addDoc(appointmentsCollection, {
    ...appointmentData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function deleteAppointment(id) {
  const docRef = doc(db, "appointments", id);
  await deleteDoc(docRef);
}

// --- PRODUCTS CMS ---

export async function addProduct(productData) {
  const productsCollection = collection(db, "products");
  const docRef = await addDoc(productsCollection, {
    ...productData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateProduct(id, productData) {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProduct(id) {
  const docRef = doc(db, "products", id);
  await deleteDoc(docRef);
}

// --- STORAGE ---

export async function uploadProductImage(file) {
  if (!file) return null;
  const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}