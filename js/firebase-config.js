/**
 * Wayvora - Firebase Configuration & Centralized Single-Instance Initializer
 * 
 * Project: WAYVORA (wayvora-96c3d)
 * Initializes Firebase App, Firebase Authentication, and Cloud Firestore once.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDG7-G_c1jTD5pT53xt52BRTogqlqnpcWk",
  authDomain: "wayvora-96c3d.firebaseapp.com",
  projectId: "wayvora-96c3d",
  storageBucket: "wayvora-96c3d.firebasestorage.app",
  messagingSenderId: "898723434931",
  appId: "1:898723434931:web:4509fbf99f063249b8bbc6",
  measurementId: "G-7XVC3MQ7J7"
};

/**
 * Checks whether the Firebase credentials are valid and present.
 */
function isFirebaseConfigured() {
  if (!FIREBASE_CONFIG || typeof FIREBASE_CONFIG !== "object") return false;
  
  const { apiKey, projectId } = FIREBASE_CONFIG;
  if (!apiKey || !projectId) return false;
  
  if (apiKey.includes("YOUR_FIREBASE_API_KEY") || apiKey.trim() === "") return false;
  if (projectId.includes("YOUR_PROJECT_ID") || projectId.trim() === "") return false;
  
  return true;
}

// Single-instance holders
let firebaseApp = null;
let firebaseAuth = null;
let firestore = null;
let firebaseAnalytics = null;
let _firebaseInitialized = false;

/**
 * Single-point initialization for Firebase
 * Ensures Firebase is initialized only once across the entire application lifecycle.
 */
function initFirebase() {
  if (_firebaseInitialized && firebaseApp) {
    return {
      app: firebaseApp,
      auth: firebaseAuth,
      firestore: firestore,
      analytics: firebaseAnalytics
    };
  }

  if (typeof firebase === "undefined" || !firebase.initializeApp) {
    console.warn("Firebase SDK is not loaded in this environment.");
    return null;
  }

  if (!isFirebaseConfigured()) {
    console.warn("Firebase configuration is missing or incomplete.");
    return null;
  }

  try {
    // Check if an app has already been initialized on the firebase global
    if (!firebase.apps || !firebase.apps.length) {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      firebaseApp = firebase.app();
    }

    if (typeof firebase.auth === "function") {
      firebaseAuth = firebase.auth();
    }

    if (typeof firebase.firestore === "function") {
      firestore = firebase.firestore();
    }

    if (typeof firebase.analytics === "function" && FIREBASE_CONFIG.measurementId) {
      try {
        firebaseAnalytics = firebase.analytics();
      } catch (analyticsErr) {
        // Analytics can fail quietly if blocked by browser ad/privacy extensions
      }
    }

    _firebaseInitialized = true;

    // Attach to global window object
    window.firebaseApp = firebaseApp;
    window.firebaseAuth = firebaseAuth;
    window.firestore = firestore;
    window.firebaseAnalytics = firebaseAnalytics;

    console.log("Firebase initialized successfully (single instance) for project:", FIREBASE_CONFIG.projectId);

    return {
      app: firebaseApp,
      auth: firebaseAuth,
      firestore: firestore,
      analytics: firebaseAnalytics
    };
  } catch (err) {
    console.error("Firebase single-point initialization error:", err);
    return null;
  }
}

// Auto-initialize once on script load if Firebase SDK is present
if (typeof firebase !== "undefined" && firebase.initializeApp && isFirebaseConfigured()) {
  initFirebase();
}

// Expose on global window object
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.isFirebaseConfigured = isFirebaseConfigured;
window.initFirebase = initFirebase;
window.firebaseApp = firebaseApp;
window.firebaseAuth = firebaseAuth;
window.firestore = firestore;

// Export for module/test runners
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    FIREBASE_CONFIG,
    isFirebaseConfigured,
    initFirebase,
    firebaseApp,
    firebaseAuth,
    firestore
  };
}
