import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

const COLLECTION_NAME = 'products';

export const productsService = {
  // GET ALL (with sorting)
  getAll: async () => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // ADD PRODUCT
  create: async (productData) => {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...productData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  // UPDATE PRODUCT
  update: async (id, productData) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
  },

  // DELETE PRODUCT
  delete: async (id) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  // UPLOAD IMAGE (Returns Promise with URL)
  uploadImage: (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

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
  }
};
