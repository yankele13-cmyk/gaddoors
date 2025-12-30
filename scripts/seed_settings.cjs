const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const { getAuth, signInAnonymously } = require("firebase/auth");
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
const auth = getAuth(app);

const SETTINGS_DATA = {
    productCategories: [
        "Porte Intérieure",
        "Porte Blindée",
        "Porte Extérieure",
        "Poignée",
        "Serrure",
        "Accessoire"
    ],
    vatRate: 0.17, // Example, easy to change later
    maintenanceMode: false
};

async function seedSettings() {
  try {
    console.log("Seeding settings/general (Public Mode)...");
    
    // Use setDoc with merge: true to avoid overwriting unrelated fields if they existed
    await setDoc(doc(db, "settings", "general"), SETTINGS_DATA, { merge: true });

    console.log("Successfully seeded settings!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding settings:", error);
    process.exit(1);
  }
}

seedSettings();
