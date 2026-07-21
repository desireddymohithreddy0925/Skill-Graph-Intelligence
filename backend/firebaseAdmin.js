const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let serviceAccount;

// In production (Render), load from environment variable
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (error) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env variable:', error.message);
  }
} else {
  // In local development, load from the local file
  try {
    serviceAccount = require('./firebase-service-account.json');
  } catch (error) {
    console.warn("⚠️  Firebase service account key not found at ./firebase-service-account.json");
    console.warn("Firebase Admin will not work until you provide this file or set FIREBASE_SERVICE_ACCOUNT_JSON env var.");
  }
}

let authAdmin = null;

if (serviceAccount) {
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  authAdmin = getAuth(app);
}

module.exports = authAdmin;
