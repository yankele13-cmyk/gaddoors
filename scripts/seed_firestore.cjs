const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, deleteDoc } = require("firebase/firestore");
// const { getAuth, signInAnonymously } = require("firebase/auth");
const fs = require('fs');
const path = require('path');

// Manual env parsing
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes if any
  }
});

// Configuration
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);

const PRODUCTS_FILE = path.join(__dirname, '../products.json');

async function seedDatabase() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const products = JSON.parse(data);

    console.log(`Found ${products.length} products to seed.`);
    
    // Optional: clear existing products? No, let's just append for now to be safe, or maybe check duplicates.
    // Let's just add them.
    
    const collectionRef = collection(db, "products");

    let count = 0;
    for (const product of products) {
        // Simple check to avoid crazy duplicates if re-run (optional), but for now just add.
        // Actually, let's remove "id" from the object we save, firestore generates it.
        // OR use the filename as ID? Using filename as ID is better for idempotency.
        
        // Let's try to setDoc with custom ID if possible, but addDoc is easier.
        // I'll stick to addDoc but I'll log.
        
        const { id, ...productData } = product; // Remove ID if we want Firestore to generate
        // Actually, keeping the filename-based ID might be useful for tracking.
        // But typical Firestore usage is auto-ID.
        // Let's keep it as a field 'imageId' or something? 
        // No, let's just save the whole object.

        await addDoc(collectionRef, product);
        count++;
        if (count % 5 === 0) console.log(`Seeded ${count} products...`);
    }

    console.log(`Successfully seeded ${count} products!`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
