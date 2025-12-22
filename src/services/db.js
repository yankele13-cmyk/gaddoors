// src/services/db.js
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; // Importe l'instance de la base de données

/**
 * Récupère tous les produits de la collection "products" dans Firestore.
 * @returns {Promise<Array<Object>>} Une promesse qui résout en un tableau d'objets produits.
 */
export async function getProducts() {
  const productsCollection = collection(db, "products");
  const productsSnapshot = await getDocs(productsCollection);
  
  const productList = productsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id, // Assure que le vrai ID de document écrase tout autre champ 'id'
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
    return { id: productSnap.id, ...productSnap.data() };
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