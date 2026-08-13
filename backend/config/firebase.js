const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

let app;

const hasEnvCredentials =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasEnvCredentials) {
  // Production (Railway)
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
} else {
  // Local development
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      "Firebase credentials not found. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or provide serviceAccountKey.json"
    );
  }

  const serviceAccount = require(serviceAccountPath);
  app = initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore(app);
const admin = require("firebase-admin");

module.exports = { admin, db };
