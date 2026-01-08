const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, getDocs, collection, query, where, serverTimestamp } = require("firebase/firestore");
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

const TEAM_DATA = [
    {
        email: "yankele13@gmail.com",
        data: {
            displayName: "Yaacov Meyer",
            role: "admin",
            phone: "+972552783693", // Normalized format
            phoneNumber: "+972552783693" // Normalized format
        }
    },
    {
        email: "eliezer@gaddoors.com", // Placeholder to identify this record
        matchByName: "Eliezer", // If email fails, try name
        id: "eliezer_partner", // Hardcoded ID for ghost profile
        data: {
            displayName: "Eliezer",
            role: "admin",
            phone: "", // User will fill this
            email: "eliezer@gaddoors.com" // Placeholder
        }
    }
];

async function seedTeam() {
  try {
    console.log("Seeding Team Data...");
    
    // Get all current users to match
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    for (const member of TEAM_DATA) {
        let targetId = member.id;
        
        // Try to find existing user by email
        const existing = users.find(u => 
            (u.email && u.email.toLowerCase() === member.email.toLowerCase()) ||
            (member.matchByName && u.displayName && u.displayName.toLowerCase().includes(member.matchByName.toLowerCase()))
        );

        if (existing) {
            targetId = existing.id;
            console.log(`Found existing user for ${member.data.displayName}: ${targetId}`);
        } else {
            console.log(`Creating new user for ${member.data.displayName} with ID: ${targetId || 'AUTO'}`);
        }

        if (targetId) {
            // Update existing or specific ID
            await setDoc(doc(db, "users", targetId), {
                ...member.data,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } else {
            // Should not happen for Eliezer as we gave ID, but for Yaacov if not found?
            // If Yaacov not found, we probably shouldn't create a fake one unless we want to.
            // But Yaacov SHOULD exist if he logged in.
            // If he hasn't logged in, we create a ghost profile.
             console.log(`Creating default profile for ${member.data.displayName} (Ghost)`);
             // Generate ID if needed, but we used email as key logic mostly
             // Let's use a safe ID
             const safeId = member.email.replace(/[^a-zA-Z0-9]/g, '_');
             await setDoc(doc(db, "users", safeId), {
                 ...member.data,
                 createdAt: serverTimestamp()
             }, { merge: true });
        }
    }

    console.log("Successfully seeded team!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding team:", error);
    process.exit(1);
  }
}

seedTeam();
