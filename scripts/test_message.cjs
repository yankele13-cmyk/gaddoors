const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp } = require("firebase/firestore");
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

async function testMessage() {
  try {
    console.log("Sending test message...");
    const messagesCollection = collection(db, "messages");
    const docRef = await addDoc(messagesCollection, {
      name: "Test Script",
      email: "test@example.com",
      phone: "123456789",
      message: "This is a test message from the verification script.",
      createdAt: new Date(), // serverTimestamp might need polyfill in node environment sometimes, defaulting to Date for test logic stability if serverTimestamp fails in pure node without socket hooks, but standard web sdk usually works. Safe fallback.
      read: false
    });
    console.log("Successfully sent message! ID:", docRef.id);
    process.exit(0);
  } catch (error) {
    console.error("Error sending message:", error);
    process.exit(1);
  }
}

testMessage();
