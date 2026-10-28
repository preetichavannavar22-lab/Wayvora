/**
 * Wayvora - Firebase Configuration & Setup Validation
 * 
 * -------------------------------------------------------------
 * FIREBASE SETUP INSTRUCTIONS:
 * -------------------------------------------------------------
 * 1. Visit the Firebase Console: https://console.firebase.google.com/
 * 2. Create a new Firebase project (or use an existing one) named "Wayvora" (or your choice).
 * 3. In the project dashboard, click "Add app" and choose the Web icon (</>).
 * 4. Register your app (e.g., "Wayvora Web") and copy the firebaseConfig values below.
 * 5. In Firebase Console, go to "Authentication" -> "Sign-in method":
 *    - Enable "Email/Password" sign-in provider.
 * 6. (Optional for Cloud Sync) Go to "Firestore Database":
 *    - Click "Create database" (in production or test mode).
 *    - Location: choose your nearest region.
 * 7. Replace the placeholder values in the `FIREBASE_CONFIG` object below with your actual keys.
 * -------------------------------------------------------------
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
 * Checks whether the user has provided real Firebase credentials.
 * Returns true only if apiKey and projectId are non-empty and not the default template values.
 */
function isFirebaseConfigured() {
  if (!FIREBASE_CONFIG || typeof FIREBASE_CONFIG !== "object") return false;
  
  const { apiKey, projectId } = FIREBASE_CONFIG;
  if (!apiKey || !projectId) return false;
  
  // Verify it doesn't still have the placeholder string
  if (apiKey.includes("YOUR_FIREBASE_API_KEY") || apiKey.trim() === "") return false;
  if (projectId.includes("YOUR_PROJECT_ID") || projectId.trim() === "") return false;
  
  return true;
}

// Initialize Firebase App, Auth, and Firestore instances if the SDK is available
let firebaseApp = null;
let firebaseAuth = null;
let firestore = null;

if (typeof firebase !== "undefined" && firebase.initializeApp && isFirebaseConfigured()) {
  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      firebaseApp = firebase.app();
    }

    if (firebase.auth) {
      firebaseAuth = firebase.auth();
    }

    if (firebase.firestore) {
      firestore = firebase.firestore();
    }
  } catch (err) {
    console.warn("Firebase auto-init in firebase-config.js:", err);
  }
}

// Attach globally for browser and module access
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.isFirebaseConfigured = isFirebaseConfigured;
window.firebaseApp = firebaseApp;
window.firebaseAuth = firebaseAuth;
window.firestore = firestore;

// Export instances for module / test runners
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    FIREBASE_CONFIG,
    isFirebaseConfigured,
    firebaseApp,
    firebaseAuth,
    firestore
  };
}
