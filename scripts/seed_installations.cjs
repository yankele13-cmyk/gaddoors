const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const fs = require('fs');
const path = require('path');

// Manual env parsing
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

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

const INSTALLATIONS_FILE = path.join(__dirname, '../installations.json');

async function seedInstallations() {
  try {
    const data = fs.readFileSync(INSTALLATIONS_FILE, 'utf8');
    const installations = JSON.parse(data);

    console.log(`Found ${installations.length} installations to seed.`);
    
    const collectionRef = collection(db, "installations");

    let count = 0;
    for (const item of installations) {
        await addDoc(collectionRef, item);
        count++;
        if (count % 5 === 0) console.log(`Seeded ${count} installations...`);
    }

    console.log(`Successfully seeded ${count} installations!`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding installations:", error);
    process.exit(1);
  }
}

seedInstallations();
