// const admin = require("firebase-admin");
// const serviceAccount = require("../config/firebaseServiceAccount.json");
// require("dotenv").config();

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.DATABASE_URL
// });

// const db = admin.database(); // or admin.firestore()

// module.exports = { admin, db };


const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const admin = require("firebase-admin");

function getFirebaseCredential() {
  // Option 1: Load from individual environment variables
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  // Option 2: Load from full JSON string from environment variable (e.g. on hosting platforms)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return admin.credential.cert(parsed);
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", err.message);
    }
  }

  // Option 3: Fallback to local config file if it exists
  const localKeyPath = path.resolve(__dirname, "../config/firebaseServiceAccount.json");
  if (fs.existsSync(localKeyPath)) {
    const serviceAccount = require(localKeyPath);
    return admin.credential.cert(serviceAccount);
  }

  throw new Error(
    "Firebase credentials not found! Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your .env file, or place firebaseServiceAccount.json in backend/config/."
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getFirebaseCredential(),
    databaseURL: process.env.DATABASE_URL || process.env.FIREBASE_DB_URL,
  });
}

const db = admin.database();

module.exports = { admin, db };
