const admin = require("firebase-admin");
const serviceAccount = require("../config/firebaseServiceAccount.json");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

const db = admin.database(); // or admin.firestore()

module.exports = { admin, db };
