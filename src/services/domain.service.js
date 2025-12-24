import { db } from '../config/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

// Placeholder for Products Service
export const productsService = {
  getAll: async () => [],
  getById: async (id) => {},
  create: async (data) => {},
  update: async (id, data) => {},
  delete: async (id) => {}
};

// Placeholder for Leads Service
export const leadsService = {
  getAll: async () => [],
  updateStatus: async (id, status) => {}
};

// Placeholder for Orders Service
export const ordersService = {
  getAll: async () => [],
  create: async (orderData) => {}
};
