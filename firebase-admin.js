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
    path.join(__dirname, '..', '..', 'secrets', 'wayvora-96c3d-firebase-adminsdk-fbsvc-d05817b4b7.json'),
    path.join(process.cwd(), 'secrets', 'wayvora-96c3d-firebase-adminsdk-fbsvc-d05817b4b7.json'),
    path.join(__dirname, '..', 'secrets', 'serviceAccountKey.json'),
    path.join(__dirname, '..', '..', 'secrets', 'serviceAccountKey.json'),
    path.join(process.cwd(), 'secrets', 'serviceAccountKey.json'),
    path.join(__dirname, '..', 'serviceAccountKey.json')
  ].filter(Boolean);

  for (const cPath of candidates) {
    if (fs.existsSync(cPath)) {
      return cPath;
    }
  }

  // Scan potential secrets directories for any adminsdk json file
  const searchDirs = [
    path.join(__dirname, '..', 'secrets'),
    path.join(__dirname, '..', '..', 'secrets'),
    path.join(process.cwd(), 'secrets')
  ];

  for (const secretsDir of searchDirs) {
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

    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Support Vercel environment variable with raw service account JSON or base64 JSON
      try {
        let rawVal = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        if (!rawVal.startsWith('{')) {
          try {
            rawVal = Buffer.from(rawVal, 'base64').toString('utf8');
          } catch (b64Err) {
            // Keep raw if base64 decode fails
          }
        }
        const serviceAccount = JSON.parse(rawVal);
        if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'wayvora-96c3d'
        });
      } catch (parseErr) {
        console.warn('Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', parseErr.message);
      }
    } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Support Vercel environment variables split into individual parameters
      try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        adminApp = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID || 'wayvora-96c3d',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey
          }),
          projectId: process.env.FIREBASE_PROJECT_ID || 'wayvora-96c3d'
        });
      } catch (envKeyErr) {
        console.warn('Firebase Admin: Failed to initialize with individual env credentials:', envKeyErr.message);
      }
    }

    if (!adminApp && getApps().length === 0) {
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

    if (adminApp) {
      try {
        const { getFirestore } = require('firebase-admin/firestore');
        firestoreDb = getFirestore(adminApp);
      } catch (fsErr) {
        console.warn('Firebase Admin: Failed to initialize Firestore:', fsErr.message);
      }

      try {
        const { getAuth } = require('firebase-admin/auth');
        authService = getAuth(adminApp);
      } catch (authErr) {
        console.warn('Firebase Admin: Failed to initialize Auth:', authErr.message);
      }
    }

    return { app: adminApp, db: firestoreDb, auth: authService };
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK:', err.message);
    return { app: null, db: null, auth: null };
  }
}

/**
 * Save support request via Firestore REST API when Admin db is unavailable
 */
async function saveSupportTicketViaRest({ name, email, category, message, userId, ticketId, registeredEmail, source, idToken }) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'wayvora-96c3d';
  const apiKey = process.env.FIREBASE_API_KEY ||
                 process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
                 process.env.VITE_FIREBASE_API_KEY ||
                 'AIzaSyDG7-G_c1jTD5pT53xt52BRTogqlqnpcWk';

  const nowIso = new Date().toISOString();
  const fields = {
    name: { stringValue: (name || '').trim() },
    email: { stringValue: (email || '').trim().toLowerCase() },
    registeredEmail: { stringValue: (registeredEmail || email || '').trim().toLowerCase() },
    category: { stringValue: category || 'General Inquiry' },
    message: { stringValue: (message || '').trim() },
    source: { stringValue: source || 'support_ticket' },
    status: { stringValue: 'open' },
    replyHistory: { arrayValue: { values: [] } },
    createdAt: { timestampValue: nowIso },
    updatedAt: { timestampValue: nowIso }
  };
  if (userId) {
    fields.userId = { stringValue: userId };
  }

  const generatedId = ticketId || ('TKT-' + Date.now().toString(36).toUpperCase());
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/support_requests?documentId=${encodeURIComponent(generatedId)}&key=${apiKey}`;

  const headers = {
    'Content-Type': 'application/json'
  };
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ fields })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Firestore REST API returned HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const docName = data.name || '';
  const savedId = docName.split('/').pop() || generatedId;

  return {
    id: savedId,
    name: (name || '').trim(),
    email: (email || '').trim().toLowerCase(),
    registeredEmail: (registeredEmail || email || '').trim().toLowerCase(),
    category: category || 'General Inquiry',
    message: (message || '').trim(),
    source: source || 'support_ticket',
    status: 'open',
    replyHistory: [],
    createdAt: nowIso,
    updatedAt: nowIso,
    userId: userId || null
  };
}

/**
 * Save a new support request in Firestore
 * Collection: support_requests
 */
async function saveSupportTicket({ name, email, category, message, userId = null, ticketId = null, registeredEmail = null, source = 'support_ticket', idToken = null }) {
  const { db } = initFirebaseAdmin();
  if (db) {
    const { FieldValue } = require('firebase-admin/firestore');

    const ticketData = {
      name: (name || '').trim(),
      email: (email || '').trim().toLowerCase(),
      registeredEmail: (registeredEmail || email || '').trim().toLowerCase(),
      category: category || 'General Inquiry',
      message: (message || '').trim(),
      source: source || 'support_ticket',
      status: 'open',
      replyHistory: [],
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

  // Fallback to Firestore REST API if idToken is available
  if (idToken) {
    return await saveSupportTicketViaRest({
      name, email, category, message, userId, ticketId, registeredEmail, source, idToken
    });
  }

  throw new Error('Firestore Database is not available on the server.');
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
 * Verifies a Firebase Auth ID Token for any authenticated user.
 * 1. Attempts verification with Firebase Admin SDK (if initialized).
 * 2. If Admin SDK is not initialized or throws, falls back to Google Identity Toolkit REST API
 *    (accounts:lookup) using the Firebase Web API key.
 */
async function verifyUserAuthToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    return { isValid: false, error: 'No ID token provided.' };
  }

  // 1. Try Firebase Admin SDK first
  try {
    const { auth } = initFirebaseAdmin();
    if (auth && typeof auth.verifyIdToken === 'function') {
      const decoded = await auth.verifyIdToken(idToken);
      if (decoded && decoded.uid) {
        const emailLower = (decoded.email || '').toLowerCase().trim();
        const isAdmin = (
          decoded.admin === true ||
          decoded.uid === 'MXMCpQFfM7Zyp865ljTXiasFB2M2' ||
          emailLower === 'wayvora.admin@gmail.com'
        );
        return {
          isValid: true,
          uid: decoded.uid,
          email: decoded.email || null,
          displayName: decoded.name || null,
          emailVerified: !!decoded.email_verified,
          isAdmin,
          decoded
        };
      }
    }
  } catch (adminErr) {
    console.warn('[FirebaseAdmin] Admin verifyIdToken unavailable or threw error:', adminErr.message);
  }

  // 2. Fallback to Google Identity Toolkit REST API
  try {
    const apiKey = process.env.FIREBASE_API_KEY ||
                   process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
                   process.env.VITE_FIREBASE_API_KEY ||
                   'AIzaSyDG7-G_c1jTD5pT53xt52BRTogqlqnpcWk';

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const data = await res.json();
    if (res.ok && data.users && data.users.length > 0) {
      const u = data.users[0];
      const emailLower = (u.email || '').toLowerCase().trim();
      let isAdmin = (
        u.localId === 'MXMCpQFfM7Zyp865ljTXiasFB2M2' ||
        emailLower === 'wayvora.admin@gmail.com'
      );
      if (u.customAttributes) {
        try {
          const claims = JSON.parse(u.customAttributes);
          if (claims.admin === true) isAdmin = true;
        } catch (cErr) {}
      }
      return {
        isValid: true,
        uid: u.localId,
        email: u.email || null,
        displayName: u.displayName || null,
        emailVerified: !!u.emailVerified,
        isAdmin,
        rawUser: u
      };
    } else {
      const errMsg = (data && data.error && data.error.message) || `HTTP ${res.status}`;
      return { isValid: false, error: errMsg };
    }
  } catch (restErr) {
    return { isValid: false, error: restErr.message };
  }
}

/**
 * Verifies a Firebase Auth ID Token and checks admin status
 */
async function verifyAdminAuthToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    return { isValid: false, isAdmin: false, error: 'No ID token provided.' };
  }

  const userAuth = await verifyUserAuthToken(idToken);
  if (!userAuth.isValid) {
    return { isValid: false, isAdmin: false, error: userAuth.error || 'Token verification failed.' };
  }

  return {
    isValid: true,
    isAdmin: !!userAuth.isAdmin,
    uid: userAuth.uid,
    email: userAuth.email
  };
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
      email: userRecord.email ? userRecord.email.toLowerCase().trim() : null,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified
    };
  } catch (err) {
    console.warn(`[FirebaseAdmin] Could not fetch user ${uid}:`, err.message);
    return null;
  }
}

/**
 * Retrieve user record from Firebase Authentication by registered email
 */
async function getUserAuthRecordByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const { auth } = initFirebaseAdmin();
  if (!auth) return null;

  try {
    const cleanEmail = email.toLowerCase().trim();
    const userRecord = await auth.getUserByEmail(cleanEmail);
    return {
      uid: userRecord.uid,
      email: userRecord.email ? userRecord.email.toLowerCase().trim() : null,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified
    };
  } catch (err) {
    // Non-fatal if user is a guest or not yet registered
    return null;
  }
}

module.exports = {
  initFirebaseAdmin,
  saveSupportTicket,
  updateSupportTicket,
  getSupportTicket,
  verifyAdminAuthToken,
  verifyUserAuthToken,
  getUserAuthRecord,
  getUserAuthRecordByEmail
};
