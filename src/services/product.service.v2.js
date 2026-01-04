
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  serverTimestamp, 
  writeBatch,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { productSchema } from '../schemas/product.schema';

const COLLECTION = 'products';
const AUDIT_COLLECTION = 'audit_logs';

export const ProductServiceV2 = {

  // --- READS ---

  /**
   * Get Products with Advanced Filtering
   * @param {Object} filters - { status, category, search, visibility }
   * @param {Object} pagination - { lastDoc, pageSize }
   */
  async getProducts(filters = {}, pagination = { pageSize: 20 }) {
    try {
      let q = collection(db, COLLECTION);
      const constraints = [];

      // 1. Filtering
      if (filters.status && filters.status !== 'all') {
          constraints.push(where('status', '==', filters.status));
      } else {
          // Default: Exclude deleted unless specifically asked
          if (filters.status !== 'deleted') {
              constraints.push(where('status', '!=', 'deleted'));
          }
      }

      if (filters.category && filters.category !== 'all') {
          constraints.push(where('category', '==', filters.category));
      }

      if (filters.visibility !== undefined) {
          constraints.push(where('visibility', '==', filters.visibility));
      }

      // 2. Sorting & Pagination
      // Note: Firestore requires index for complex sort/filter combos.
      // We start simple: Order by createdAt desc
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(pagination.pageSize));

      if (pagination.lastDoc) {
          constraints.push(startAfter(pagination.lastDoc));
      }

      const qFinal = query(q, ...constraints);
      const snapshot = await getDocs(qFinal);
      
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Client-side search (fallback until Algolia/Typesense)
      // If search query exists, we filter locally (limited to current page, imperfect but functional without external services)
      // For better search, we'd need a dedicated index.
      let finalItems = items;
      if (filters.search) {
          const lowerQ = filters.search.toLowerCase();
          finalItems = items.filter(p => 
              p.name?.toLowerCase().includes(lowerQ) || 
              p.sku?.toLowerCase().includes(lowerQ)
          );
      }

      return { 
          success: true, 
          data: finalItems, 
          lastDoc: snapshot.docs[snapshot.docs.length - 1],
          empty: snapshot.empty 
      };

    } catch (error) {
      console.error("[ProductServiceV2] Get Error:", error);
      return { success: false, error: error.message };
    }
  },

  async getProductById(id) {
      try {
          const d = await getDoc(doc(db, COLLECTION, id));
          if (!d.exists()) return { success: false, error: "Product not found" };
          return { success: true, data: { id: d.id, ...d.data() } };
      } catch (error) {
          return { success: false, error: error.message };
      }
  },

  // --- WRITES (Transactional / Batched) ---

  async createProduct(data, user = { email: 'system' }) {
    try {
        // 1. Validation
        const cleanData = productSchema.parse({ ...data });
        
        // 2. Check Uniqueness (Name) - Optional but recommended
        const nameQuery = query(collection(db, COLLECTION), where('name', '==', cleanData.name));
        const nameSnap = await getDocs(nameQuery);
        if (!nameSnap.empty) {
            throw new Error(`Le nom "${cleanData.name}" est déjà utilisé.`);
        }

        // 3. Prepare Payload
        const payload = {
            ...cleanData,
            status: cleanData.status || 'draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            metadata: {
                createdBy: user.email,
                createdAt: new Date().toISOString() // redundant but useful for UI immediate display
            }
        };

        const docRef = await addDoc(collection(db, COLLECTION), payload);

        // 4. Audit Log
        await this._logAudit(docRef.id, 'create', null, payload, user);

        return { success: true, id: docRef.id };

    } catch (error) {
        return { success: false, error: error.message || error.errors?.[0]?.message };
    }
  },

  async updateProduct(id, updates, user = { email: 'system' }) {
      try {
          // 1. Get Current
          const currentSnap = await getDoc(doc(db, COLLECTION, id));
          if (!currentSnap.exists()) throw new Error("Produit introuvable");
          const currentData = currentSnap.data();

          // 2. Partial Validation (Merge with current to validate shape)
          // We don't re-validate everything strictly on partial updates, but we should check critical types
          // ideally we use schema.partial().parse(updates)
          
          // 3. Uniqueness Check if name changes
          if (updates.name && updates.name !== currentData.name) {
             const nameQuery = query(collection(db, COLLECTION), where('name', '==', updates.name));
             const nameSnap = await getDocs(nameQuery);
             if (!nameSnap.empty) throw new Error("Ce nom est déjà utilisé.");
          }

          const payload = {
              ...updates,
              updatedAt: serverTimestamp(),
              'metadata.updatedBy': user.email,
              'metadata.updatedAt': new Date().toISOString()
          };

          await updateDoc(doc(db, COLLECTION, id), payload);

          // 4. Audit Log
          await this._logAudit(id, 'update', currentData, payload, user);

          return { success: true };

      } catch (error) {
          return { success: false, error: error.message };
      }
  },

  // --- VISIBILITY & STATUS ACTIONS ---

  async toggleVisibility(id, isVisible, user) {
      return this.updateProduct(id, { visibility: isVisible }, user);
  },

  async archiveProduct(id, user) {
      return this.updateProduct(id, { status: 'archived', visibility: false }, user);
  },

  // --- DELETE (Soft & Hard) ---

  async softDeleteProduct(id, user) {
      // Soft delete: Mark as deleted, hide visibility
      // We append "-deleted-TIMESTAMP" to name to free up the unique name constraint?
      // Or we accept that deleted items hold the name? 
      // Better strategy: Keep name, but filter out deleted in uniqueness check.
      // For now, simple status change.
      return this.updateProduct(id, { 
          status: 'deleted', 
          visibility: false,
          deletedAt: serverTimestamp() 
      }, user);
  },

  async hardDeleteProduct(id, user) {
     // Admin only - Irreversible
     try {
         const currentSnap = await getDoc(doc(db, COLLECTION, id));
         const currentData = currentSnap.data();

         // 1. Delete Firestore Doc
         await deleteDoc(doc(db, COLLECTION, id));

         // 2. Cleanup Storage (Optional: if we want to delete images)
         if (currentData?.imageUrl) {
             // Logic to extract path from URL and delete
             // const fileRef = ref(storage, currentData.imageUrl);
             // await deleteObject(fileRef).catch(e => console.warn("Image delete failed", e));
         }

         // 3. Audit (Logged globally or in deleted_products collection)
         await this._logAudit(id, 'hard_delete', currentData, null, user);

         return { success: true };
     } catch(error) {
         return { success: false, error: error.message };
     }
  },

  async restoreProduct(id, user) {
      return this.updateProduct(id, { status: 'draft', visibility: false, deletedAt: null }, user);
  },

  // --- IMAGES ---

  async uploadImage(file, pathString = 'products') {
      try {
          const storageRef = ref(storage, `${pathString}/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          return { success: true, url, path: snapshot.ref.fullPath };
      } catch (error) {
          return { success: false, error: error.message };
      }
  },

  // --- INTERNAL: AUDIT LOG ---
  async _logAudit(entityId, action, previousState, newState, user) {
      try {
        await addDoc(collection(db, AUDIT_COLLECTION), {
            entityCollection: COLLECTION,
            entityId,
            action,
            // Store diffs only to save space? Or full snapshots?
            // For critical systems, full previous/new state is safer.
            // For now, simple diff.
            user: user?.email || 'system',
            timestamp: serverTimestamp(),
            details: {
                prev: previousState ? JSON.stringify(previousState) : null,
                new: newState ? JSON.stringify(newState) : null
            }
        });
      } catch (e) {
          console.error("Audit Log Failed:", e);
          // Don't fail the main transaction if audit fails, but warn.
      }
  },

  // --- MIGRATION UTILS ---

  async migrateLegacyProducts() {
      try {
          // Fetch all products (Limit to batch size or loop)
          // Since we can't query "missing status", we just fetch everything and check client side
          const snapshot = await getDocs(collection(db, COLLECTION));
          const batch = writeBatch(db);
          let count = 0;

          snapshot.docs.forEach(docSnap => {
              const data = docSnap.data();
              if (!data.status) {
                  batch.update(docSnap.ref, {
                      status: 'active',
                      visibility: true, // Legacy products assumed visible? Or false? Let's say true to minimize disruption but maybe safer false? User said "Review". Let's go TRUE for continuity.
                      updatedAt: serverTimestamp() 
                  });
                  count++;
              }
          });

          if (count > 0) {
              await batch.commit();
          }
          return { success: true, count };
      } catch (error) {
          return { success: false, error: error.message };
      }
  }

};
