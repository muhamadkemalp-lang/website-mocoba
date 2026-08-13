const admin = require("firebase-admin");

// Untuk deploy (Render/Railway/dll): pakai environment variables (FIREBASE_PROJECT_ID,
// FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) -- tidak perlu upload file JSON.
// Untuk lokal (development di laptop Anda): tetap bisa pakai file config/serviceAccountkey.json
// kalau environment variables di atas belum di-set.

let credential;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // \n di .env/environment variable biasanya ke-escape jadi teks "\\n", perlu diubah balik jadi baris baru asli
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
} else {
    const serviceAccount = require("./serviceAccountkey.json");
    credential = admin.credential.cert(serviceAccount);
}

admin.initializeApp({ credential });

const db = admin.firestore();
  
module.exports = { admin, db };