/**
 * WAYVORA - Backend Firebase Admin SDK Helper
 * 
 * Provides centralized, secure server-side Firebase Admin & Firestore operations.
 * Never exposed to frontend clients.
 */

const fs = require('fs');
const path = require('path');

let adminApp = null;
let firestoreDb = null;
let authService = null;

/**
 * Automatically locates the Firebase Admin SDK service account key
 */
function findServiceAccountKey() {
  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(__dirname, '..', 'secrets', 'wayvora-96c3d-firebase-adminsdk-fbsvc-d05817b4b7.json'),
    path.join(__dirname, '..', 'secrets', 'serviceAccountKey.json'),
    path.join(__dirname, '..', 'serviceAccountKey.json')
  ].filter(Boolean);

  for (const cPath of candidates) {
    if (fs.existsSync(cPath)) {
      return cPath;
    }
  }

  // Scan secrets directory for any adminsdk json file
  const secretsDir = path.join(__dirname, '..', 'secrets');
  if (fs.existsSync(secretsDir)) {
    try {
      const files = fs.readdirSync(secretsDir);
      for (const file of files) {
        if (file.endsWith('.json') && (file.includes('adminsdk') || file.includes('wayvora'))) {
          return path.join(secretsDir, file);
        }
      }
    } catch (e) {
      // Ignore directory scan errors
    }
  }

  return null;
}

/**
 * Initializes Firebase Admin SDK if not already initialized
 */
function initFirebaseAdmin() {
  if (adminApp && firestoreDb) {
    return { app: adminApp, db: firestoreDb, auth: authService };
  }

  try {
    const { initializeApp, cert, getApps } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    const { getAuth } = require('firebase-admin/auth');

    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else {
      const keyPath = findServiceAccountKey();
      if (keyPath) {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || 'wayvora-96c3d'
        });
      } else if (process.env.FIREBASE_CONFIG || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        adminApp = initializeApp();
      } else {
        console.warn('Firebase Admin: No service account key found. Backend Firestore operations may be limited.');
        return { app: null, db: null, auth: null };
      }
    }

    firestoreDb = getFirestore(adminApp);
    authService = getAuth(adminApp);
    return { app: adminApp, db: firestoreDb, auth: authService };
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK:', err.message);
    return { app: null, db: null, auth: null };
  }
}

/**
 * Save a new support request in Firestore
 * Collection: support_requests
 */
async function saveSupportTicket({ name, email, category, message, userId = null, ticketId = null, registeredEmail = null }) {
  const { db } = initFirebaseAdmin();
  if (!db) {
    throw new Error('Firestore Database is not available on the server.');
  }

  const { FieldValue } = require('firebase-admin/firestore');

  const ticketData = {
    name: (name || '').trim(),
    email: (email || '').trim().toLowerCase(),
    registeredEmail: (registeredEmail || email || '').trim().toLowerCase(),
    category: category || 'General Inquiry',
    message: (message || '').trim(),
    status: 'open',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };

  if (userId) {
    ticketData.userId = userId;
  }

  let docRef;
  if (ticketId) {
    docRef = db.collection('support_requests').doc(ticketId);
    await docRef.set(ticketData, { merge: true });
  } else {
    docRef = await db.collection('support_requests').add(ticketData);
  }

  return {
    id: docRef.id,
    ...ticketData
  };
}

/**
 * Update support request details or email delivery status
 */
async function updateSupportTicket(ticketId, updates) {
  const { db } = initFirebaseAdmin();
  if (!db) {
    throw new Error('Firestore Database is not available on the server.');
  }

  const { FieldValue } = require('firebase-admin/firestore');
  const docRef = db.collection('support_requests').doc(ticketId);

  const payload = {
    ...updates,
    updatedAt: FieldValue.serverTimestamp()
  };

  await docRef.update(payload);
  return true;
}

/**
 * Retrieve a specific support ticket by ID
 */
async function getSupportTicket(ticketId) {
  const { db } = initFirebaseAdmin();
  if (!db) return null;

  const doc = await db.collection('support_requests').doc(ticketId).get();
  if (!doc.exists) return null;

  return { id: doc.id, ...doc.data() };
}

/**
 * Verifies a Firebase Auth ID Token and checks admin status
 */
async function verifyAdminAuthToken(idToken) {
  const { auth } = initFirebaseAdmin();
  if (!auth) return false;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const isAdmin = decodedToken.admin === true || decodedToken.uid === 'MXMCpQFfM7Zyp865ljTXiasFB2M2';
    return { isValid: true, isAdmin, uid: decodedToken.uid, email: decodedToken.email };
  } catch (err) {
    return { isValid: false, isAdmin: false, error: err.message };
  }
}

/**
 * Retrieve user record from Firebase Authentication by UID
 */
async function getUserAuthRecord(uid) {
  if (!uid) return null;
  const { auth } = initFirebaseAdmin();
  if (!auth) return null;

  try {
    const userRecord = await auth.getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified
    };
  } catch (err) {
    console.warn(`[FirebaseAdmin] Could not fetch user ${uid}:`, err.message);
    return null;
  }
}

module.exports = {
  initFirebaseAdmin,
  saveSupportTicket,
  updateSupportTicket,
  getSupportTicket,
  verifyAdminAuthToken,
  getUserAuthRecord
};
