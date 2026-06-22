const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let serviceAccount;
try {
  serviceAccount = require('./firebase-service-account.json');
} catch (error) {
  console.warn("⚠️  Firebase service account key not found at ./firebase-service-account.json");
  console.warn("Firebase Admin will not work until you provide this file.");
}

let authAdmin = null;

if (serviceAccount) {
  const app = initializeApp({
    credential: cert(serviceAccount)
  });
  authAdmin = getAuth(app);
}

module.exports = authAdmin;
