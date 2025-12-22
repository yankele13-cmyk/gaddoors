// src/services/db.js
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; // Importe l'instance de la base de données

/**
 * Récupère tous les produits de la collection "products" dans Firestore.
 * @returns {Promise<Array<Object>>} Une promesse qui résout en un tableau d'objets produits.
 */
// Dictionnaire des descriptions uniques par ville (simulant une base de données riche)
const CITY_DESCRIPTIONS = {
  // --- POIGNÉES (HANDLES) ---
  "Modello Roma": {
    city: "Roma",
    desc: "Un design intemporel inspiré du Colisée. Finition laiton vieilli pour un rendu noble et historique. Idéale pour les intérieurs classiques."
  },
  "Modello Venezia": {
    city: "Venezia",
    desc: "Lignes fluides rappelant les canaux vénitiens. Chrome brillant pour une touche d'éclat et de luxe dans un intérieur moderne."
  },
  "Modello Firenze": {
    city: "Firenze",
    desc: "L'art de la Renaissance à portée de main. Finition bronze sculptée, offrant une ergonomie parfaite et un style artistique."
  },
  "Modello Verona": {
    city: "Verona",
    desc: "Romantique et robuste. Alliage de zinc noir mat, parfait pour contraster avec des portes claires. Un charme discret."
  },
  "Modello Siena": {
    city: "Siena",
    desc: "Terre de Sienne et couleurs chaudes. Finition cuivre brossé, apportant une chaleur unique à votre décoration."
  },
  "Modello Pisa": {
    city: "Pisa",
    desc: "Une audace architecturale. Design légèrement incliné pour une prise en main originale et confortable. Finition nickel satiné."
  },
  "Modello Lucca": {
    city: "Lucca",
    desc: "Protégée et solide. Design massif et sécurisant, finition acier brossé pour une durabilité à toute épreuve."
  },
  "Modello San Gimignano": {
    city: "San Gimignano",
    desc: "La hauteur du style. Poignée allongée et fine, idéale pour les grandes portes modernes. Finition titane."
  },
  "Modello Positano": {
    city: "Positano",
    desc: "La douceur de la côte amalfitaine. Formes arrondies et finition céramique blanche pour une touche méditerranéenne."
  },
  "Modello Amalfi": {
    city: "Amalfi",
    desc: "Luxe côtier. Incrustations discrètes et finition or pâle. Parfaite pour une entrée lumineuse et sophistiquée."
  },
  "Modello Sorrento": {
    city: "Sorrento",
    desc: "Citron et soleil. Finition laiton doré vif, pour illuminer une porte sombre avec un contraste saisissant."
  },
  "Modello Capri": {
    city: "Capri",
    desc: "L'élégance insulaire. Design minimaliste ultra-fin, finition chrome miroir. La pureté absolue."
  },
  "Modello Portofino": {
    city: "Portofino",
    desc: "Le chic exclusif. Finition cuir piqué sur métal, pour un toucher luxueux et une esthétique incomparable."
  },
  "Modello Bellagio": {
    city: "Bellagio",
    desc: "La perle du lac. Lignes aquatiques et fluides, finition nickel noir poli. Un bijou pour votre porte."
  },
  "Modello Como": {
    city: "Como",
    desc: "Sérénité et profondeur. Design carré et rigoureux, finition gris anthracite texturé. Pour les intérieurs contemporains."
  },

  // --- PORTES (DOORS) ---
  "Porte Milano": {
    city: "Milano",
    desc: "L'avant-garde du design. Porte blindée avec panneau extérieur en verre trempé noir et inserts en acier. Sécurité A2P BP3."
  },
  "Porte Torino": {
    city: "Torino",
    desc: "Industrielle et chic. Finition aspect béton ciré avec détails métalliques. Isolation phonique 45dB pour un calme absolu."
  },
  "Porte Bologna": {
    city: "Bologna",
    desc: "La tradition savante. Bois massif de chêne teinté, moulures profondes. Serrure 7 points pour une sécurité traditionnelle renforcée."
  },
  "Porte Genova": {
    city: "Genova",
    desc: "L'ouverture sur le monde. Porte avec hublot sécurisé et grille en fer forgé marin. Idéale pour les maisons bord de mer."
  },
  "Porte Napoli": {
    city: "Napoli",
    desc: "Vibrante et solide. Panneau rouge profond laqué, structure renforcée contre les effractions violentes. Un caractère affirmé."
  },
  "Porte Palermo": {
    city: "Palermo",
    desc: "Solaire et riche. Finition bois clair avec marqueterie fine. Une porte d'entrée qui raconte une histoire. Isolation thermique A+."
  },
  "Porte Bari": {
    city: "Bari",
    desc: "Sobriété des Pouilles. Blanc pur mat, lignes horizontales gravées. Parfaite pour les architectures minimalistes modernes."
  },
  "Porte Catania": {
    city: "Catania",
    desc: "La force du volcan. Finition pierre de lave sombre (composite). Résistance extrême aux intempéries et aux chocs."
  },
  "Porte Trieste": {
    city: "Trieste",
    desc: "Le carrefour des cultures. Design austro-hongrois revisité, finition bois foncé et laiton. Élégance diplomatique."
  },
  "Porte Padova": {
    city: "Padova",
    desc: "L'intelligence structurelle. Cœur en acier, habillage bois composite sans entretien. La technologie au service du quotidien."
  },
  "Porte Parma": {
    city: "Parma",
    desc: "Raffinement classique. Couleur crème douce, poignée centrée. Une élégance discrète pour les belles demeures."
  },
  "Porte Modena": {
    city: "Modena",
    desc: "Vitesse et ligne. Inspirée des supercars, finition rouge laqué ou noir carbone. Charnières invisibles et serrure biométrique."
  },
  "Porte Brescia": {
    city: "Brescia",
    desc: "L'acier pur. Porte entièrement métallique avec fintion brute vernie. Pour les lofts et les espaces industriels."
  },
  "Porte Perugia": {
    city: "Perugia",
    desc: "Cœur vert. Porte eco-conçue avec bois certifié et isolation en liège naturel. Haute performance thermique."
  },
  "Porte Livorno": {
    city: "Livorno",
    desc: "Portuaire et robuste. Peinture époxy résistante au sel et à l'humidité. La porte idéale pour les zones exposées."
  }
};

const HANDLE_KEYS = Object.keys(CITY_DESCRIPTIONS).filter(k => k.startsWith("Modello"));
const DOOR_KEYS = Object.keys(CITY_DESCRIPTIONS).filter(k => k.startsWith("Porte"));

function generateDescription(name) {
  if (CITY_DESCRIPTIONS[name]) {
    return CITY_DESCRIPTIONS[name].desc;
  }
  return "Produit de haute qualité alliant sécurité et design italien.";
}

export async function getProducts() {
  const productsCollection = collection(db, "products");
  const productsSnapshot = await getDocs(productsCollection);
  
  let handleIndex = 0;
  let doorIndex = 0;

  const productList = productsSnapshot.docs.map(doc => {
    const data = doc.data();
    let name = data.name;

    // Detection
    const isHandle = name.toLowerCase().includes('handle') || 
                     name.toLowerCase().includes('poignée') || 
                     data.category === 'Poignées';
                     
    const isDoor = name.toLowerCase().includes('porte') || 
                   name.toLowerCase().includes('door') || 
                   data.category === 'Portes Intérieures' ||
                   data.category === 'Portes Blindées';

    if (isHandle) {
      // On cycle sur les clés disponibles
      name = HANDLE_KEYS[handleIndex % HANDLE_KEYS.length];
      handleIndex++;
    } else if (isDoor) {
      name = DOOR_KEYS[doorIndex % DOOR_KEYS.length];
      doorIndex++;
    }

    return {
      ...data,
      id: doc.id, 
      originalName: data.name,
      name: name,
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
    let name = data.name;

    const isHandle = name.toLowerCase().includes('handle') || 
                     name.toLowerCase().includes('poignée') || 
                     data.category === 'Poignées';
                     
    const isDoor = name.toLowerCase().includes('porte') || 
                   name.toLowerCase().includes('door') || 
                   data.category === 'Portes Intérieures' ||
                   data.category === 'Portes Blindées';

    if (isHandle) {
       const charCode = productId.charCodeAt(0) + (productId.charCodeAt(1) || 0);
       name = HANDLE_KEYS[charCode % HANDLE_KEYS.length];
    } else if (isDoor) {
       const charCode = productId.charCodeAt(0) + (productId.charCodeAt(1) || 0);
       name = DOOR_KEYS[charCode % DOOR_KEYS.length];
    }

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
  const docRef = await addDoc(messagesCollection, {
    ...messageData,
    createdAt: serverTimestamp(), // Utilise le timestamp serveur pour la fiabilité
    read: false
  });
  return docRef.id;
}

// --- ADMIN HELPERS ---

import { query, orderBy, limit, where, getCountFromServer } from "firebase/firestore";

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

  return {
    unreadMessages: unreadSnapshot.data().count,
    totalProducts: productsSnapshot.data().count,
    // Mocked financial stats for now
    monthlyRevenue: 45000,
    pendingInstallations: 3
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
  // Convert JS Dates to Firestore Timestamps implicitly or explicitly if needed, 
  // but addDoc handles Date objects well usually. 
  // We ensure clean data passing.
  const docRef = await addDoc(appointmentsCollection, {
    ...appointmentData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
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

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadProductImage(file) {
  if (!file) return null;
  const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}