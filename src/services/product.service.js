/**
 * Product Service
 * Handles Product Catalog & Image Uploads
 */
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  serverTimestamp, 
  writeBatch,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

const COLLECTION_NAME = 'products';

export const ProductService = {
  
  // --- UTILS ---

  // Upload Image with Progress
  uploadImage(file, onProgress) {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file); // Note: Requires uploadBytesResumable import

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  },

  // --- CRUD ---

  async getAllProducts() {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: products };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, error: error.message };
    }
  },

  // Pagination (Moved from legacy service)
  async getPage(lastVisible = null, pageSize = 20) {
    try {
        let q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(pageSize));
        if (lastVisible) {
            q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(pageSize));
        }

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        
        return { items, lastDoc };
    } catch (error) {
        console.error("Error fetching page:", error);
        return { items: [], lastDoc: null, error: error.message };
    }
  },

  async getProductById(id) {
    try {
      console.log(`[ProductService] Fetching ID: "${id}"`); // DEBUG

      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } 
      
      // Fallback: Try finding it by Query (sometimes fixes weird path issues)
      console.warn("[ProductService] Direct getDoc failed. Trying query fallback...");
      const q = query(collection(db, COLLECTION_NAME), where('__name__', '==', id));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const d = querySnap.docs[0];
        console.log("[ProductService] Found via Query Fallback!");
        return { success: true, data: { id: d.id, ...d.data() } };
      }

      console.warn("[ProductService] All attempts failed. Product not found.");
      
      // ULTIMATE FALLBACK: Fetch ALL products and search in memory
      // (Inefficient but helps diagnose if List Page sees it but GetDoc doesn't)
      console.warn("[ProductService] Attempting Ultimate Fallback (Scan All)");
      const allRes = await this.getAllProducts();
      if (allRes.success) {
          const found = allRes.data.find(p => p.id === id || p.id.trim() === id.trim());
          if (found) {
              console.log("[ProductService] Found via Scan All! (ID Issue?)");
              return { success: true, data: found };
          }
      }

      // Log Char Codes to debug invisible characters
      console.log("ID Char Codes:", id.split('').map(c => c.charCodeAt(0)));
      
      return { success: false, error: "Product not found (ID: " + id + ")" };

    } catch (error) {
      console.error("[ProductService] Error:", error);
      return { success: false, error: error.message };
    }
  },

  async deleteProduct(id) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // --- INTEGRITY & VALIDATION ---

  /**
   * Helper to check name uniqueness
   * Returns TRUE if unique (safe), THROW ERROR if duplicate found
   */
  async checkNameUnique(name, excludeId = null) {
      const q = query(collection(db, COLLECTION_NAME), where('name', '==', name));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
          // If excluding (Update mode), check if the found doc is NOT the current one
          const conflict = snapshot.docs.find(d => {
              const dId = d.id;
              const exId = excludeId || '';
              
              // DEBUG LOGS (Reduced noise)
              // console.log(`[checkNameUnique] Match? ${dId} vs ${exId}`);
              
              // Strict equality check on trimmed IDs is safer
              return String(dId).trim() !== String(exId).trim();
          });
          
          if (conflict) {
              console.error(`[checkNameUnique] Conflict Found! ID: ${conflict.id}`);
              throw new Error(`Le nom "${name}" est déjà utilisé par un autre produit (ID: ${conflict.id}). Veuillez choisir un autre nom ou modifier l'autre produit.`);
          }
      }
      return true;
  },

  /**
   * ONE-SHOT SCRIPT: Clean Duplicates
   * Renames duplicates to "Name (Doublon X)"
   */
  async cleanDuplicates() {
      // ... implementation ...
  },

  /**
   * ONE-SHOT SCRIPT: Rename Doors to Italian Cities
   * Filter: Category includes "Porte"
   * Format: "Modello [City]"
   */
  async renameDoorsToItalianCities() {
    const cities = [
      "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna",
      "Firenze", "Bari", "Catania", "Venezia", "Verona", "Messina", "Padova",
      "Trieste", "Brescia", "Taranto", "Prato", "Parma", "Modena", "Reggio Calabria",
      "Reggio Emilia", "Perugia", "Ravenna", "Livorno", "Cagliari", "Foggia",
      "Rimini", "Salerno", "Ferrara", "Sassari", "Latina", "Giugliano", "Monza",
      "Siracusa", "Pescara", "Bergamo", "Forli", "Trento", "Vicenza", "Terni",
      "Bolzano", "Novara", "Piacenza", "Ancona", "Andria", "Arezzo", "Udine",
      "Cesena", "Lecce", "Pesaro", "Barletta", "Alessandria", "La Spezia", "Pisa",
      "Lucca", "Pistoia", "Guidonia", "Catanzaro", "Treviso", "Brindisi", "Torre del Greco"
    ];

    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const batch = writeBatch(db);
      let count = 0;
      let doorCount = 0;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const category = data.category || "";
        
        // Filter: Must contain "Porte" (Case-sensitive usually, but let's be safe)
        if (category.includes("Porte")) {
          // Assign city based on index (Modulo to reuse cities if needed)
          const city = cities[doorCount % cities.length];
          const newName = `Modello ${city}`;
          
          // Add suffix number if we loop around cities to keep uniqueness
          const suffix = Math.floor(doorCount / cities.length) > 0 ? ` ${Math.floor(doorCount / cities.length) + 1}` : "";
          const finalName = newName + suffix;

          batch.update(docSnap.ref, { name: finalName });
          count++;
          doorCount++;
        }
      });

      if (count > 0) {
        await batch.commit();
      }
      return { success: true, count, message: `${count} portes renommées avec succès.` };

    } catch (error) {
      console.error("Rename Script Error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ONE-SHOT SCRIPT: Rename Handles (Poignées) to Italian Design Names
   * Filter: Category includes "Poignée" or "Handle"
   * Format: "Maniglia [Name]"
   */
   async renameHandlesToItalianDesign() {
    const names = [
      "Enzo", "Marco", "Luca", "Matteo", "Giovanni", "Paolo", "Roberto",
      "Stefano", "Antonio", "Francesco", "Angelo", "Giorgio", "Luigi", "Pietro",
      "Carlo", "Dario", "Fabio", "Guido", "Mario", "Sergio", "Vito", "Bruno",
      "Franco", "Leo", "Massimo", "Nello", "Pino", "Rino", "Silvio", "Tino",
      "Ugo", "Valerio", "Walter", "Zeno", "Elio", "Nino", "Renzo", "Gino",
      "Aldo", "Dante", "Romeo", "Valentino", "Leonardo", "Raffaello", "Donatello",
      "Michelangelo", "Salvatore", "Vincenzo", "Rocco", "Mariano", "Giuseppe"
    ];

    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const batch = writeBatch(db);
      let count = 0;
      let handleCount = 0;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const category = (data.category || "").toLowerCase();
        const name = (data.name || "").toLowerCase();
        
        // Filter: Check Category OR Name for "Poignée/Handle"
        // Also check "Accessoires" if name implies it's a handle
        const isHandle = 
            category.includes("poignée") || 
            category.includes("poignee") || 
            category.includes("handle") ||
            name.includes("poignée") || 
            name.includes("poignee") || 
            name.includes("handle") ||
            name.includes("maniglia"); // In case already renamed partially

        if (isHandle) {
          // Assign name based on index (Modulo to reuse names if needed)
          const designName = names[handleCount % names.length];
          const newName = `Maniglia ${designName}`;
          
          // Add suffix number if we loop around names to keep uniqueness
          const suffix = Math.floor(handleCount / names.length) > 0 ? ` ${Math.floor(handleCount / names.length) + 1}` : "";
          const finalName = newName + suffix;
          
          console.log(`[RenameHandles] Renaming "${data.name}" -> "${finalName}"`); // LOG

          batch.update(docSnap.ref, { name: finalName });
          count++;
          handleCount++;
        }
      });

      if (count > 0) {
        await batch.commit();
      }
      return { success: true, count, message: `${count} poignées renommées avec succès.` };

    } catch (error) {
      console.error("Rename Handles Script Error:", error);
      return { success: false, error: error.message };
    }
  },

  // --- SPECIAL ACTIONS ---

  /**
   * uploadAndCreate
   * 1. Uploads image file to specific path
   * 2. Gets URL
   * 3. Creates Firestore Doc
   */
  async uploadAndCreate(productData, imageFile) {
    try {
      await this.checkNameUnique(productData.name); // Check Uniqueness

      let imageUrl = null;

      if (imageFile) {
        // Upload Logic
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Create Doc
      // Ensure we don't accidentally write id or other system fields if passed
      // CRITICAL FIX: Ensure 'image' (FileList) is NOT in safeData
      const { id: _, image, ...safeData } = productData;

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...safeData,
        price: Number(productData.price) || 0,
        stock: Number(productData.stock) || 0,
        imageUrl: imageUrl || productData.imageUrl || null, // Fallback if url provided as string
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { success: true, data: { id: docRef.id } };
    } catch (error) {
      console.error("Error in uploadAndCreate:", error);
      return { success: false, error: error.message };
    }
  },

  async updateProduct(id, updates, newImageFile = null) {
    try {
      if (updates.name) {
          await this.checkNameUnique(updates.name, id); // Check Uniqueness (Excluding self)
      }

      let finalUpdates = { ...updates };
      // CRITICAL FIX: Ensure 'image' (FileList) is removed
      delete finalUpdates.image;
      
      // Security: Strip system fields that should not be manually updated here
      delete finalUpdates.id;
      delete finalUpdates.createdAt;
      delete finalUpdates.updatedAt; // We set it manually below

      finalUpdates.updatedAt = serverTimestamp();
      
      if (finalUpdates.price !== undefined) finalUpdates.price = Number(finalUpdates.price) || 0;
      if (finalUpdates.stock !== undefined) finalUpdates.stock = Number(finalUpdates.stock) || 0;

      if (newImageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${newImageFile.name}`);
        const snapshot = await uploadBytes(storageRef, newImageFile);
        finalUpdates.imageUrl = await getDownloadURL(snapshot.ref);
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, finalUpdates);
      
      return { success: true };
    } catch (error) {
      console.error("Error updating product:", error);
      let message = error.message;
      if (message.includes("No document to update")) {
        message = "Ce produit semble avoir été supprimé. Veuillez rafraîchir la page.";
      }
      return { success: false, error: message };
    }
  }
};
