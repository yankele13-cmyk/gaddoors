const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
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
const storage = getStorage(app);

async function uploadFile(localPath, storagePath) {
  try {
    const fullLocalPath = path.join(__dirname, '../public', localPath);
    if (!fs.existsSync(fullLocalPath)) {
      console.warn(`File not found: ${fullLocalPath}`);
      return null;
    }
    
    const buffer = fs.readFileSync(fullLocalPath);
    const storageRef = ref(storage, storagePath);
    
    // Simple mime type detection
    const ext = path.extname(localPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';

    const metadata = { contentType };
    
    // Check if file already exists/upload
    // Note: uploadBytes overwrites by default which is fine here
    const snapshot = await uploadBytes(storageRef, buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.error(`Error uploading ${localPath}:`, err.message);
    return null;
  }
}

async function migrateCollection(collectionName) {
  console.log(`Migrating collection: ${collectionName}...`);
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  
  let updatedCount = 0;
  
  for (const document of snapshot.docs) {
    const data = document.data();
    // Check if image is local (starts with /images/)
    // Adjust field name based on collection (products has imageUrl, installations has imageUrl)
    const currentUrl = data.imageUrl;
    
    if (currentUrl && currentUrl.startsWith('/images/')) {
       // Remove leading slash for local path construction if needed, mostly strictly path join works with relative but /images is root relative in web
       // We'll treat it as relative to public
       const storagePath = currentUrl.substring(1); // images/category/file.jpg
       
       console.log(`Uploading ${currentUrl}...`);
       const newUrl = await uploadFile(currentUrl, storagePath);
       
       if (newUrl) {
         await updateDoc(doc(db, collectionName, document.id), {
           imageUrl: newUrl
         });
         updatedCount++;
         console.log(`Updated ${document.id}`);
       }
    }
  }
  console.log(`Finished ${collectionName}: ${updatedCount} documents updated.`);
}

async function runMigration() {
  await migrateCollection('products');
  await migrateCollection('installations');
  console.log("Migration complete.");
  process.exit(0);
}

runMigration();
