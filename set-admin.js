/**
 * WAYVORA - Administrator Custom Claim Assignment Script
 * 
 * Securely assigns the custom claim { admin: true } using the modular Firebase Admin SDK API.
 * Runs 100% offline from the public internet. No public endpoints.
 * 
 * Target Project ID: wayvora-96c3d
 * Administrator UID: MXMCpQFfM7Zyp865ljTXiasFB2M2
 */

const fs = require('fs');
const path = require('path');

// Modular Firebase Admin SDK imports
let initializeApp, cert, getAuth;
try {
  ({ initializeApp, cert } = require('firebase-admin/app'));
  ({ getAuth } = require('firebase-admin/auth'));
} catch (e) {
  console.error("======================================================================");
  console.error("❌ ERROR: 'firebase-admin' package could not be loaded!");
  console.error("Please run: npm install firebase-admin");
  console.error("======================================================================");
  process.exit(1);
}

const EXPECTED_PROJECT_ID = "wayvora-96c3d";
const DEFAULT_ADMIN_UID = "MXMCpQFfM7Zyp865ljTXiasFB2M2";
const targetUid = process.argv[2] || DEFAULT_ADMIN_UID;

/**
 * Automatically searches for the Firebase Admin SDK service account key file
 * Supports the secrets/ folder, scripts/ folder, or root directory.
 */
function findServiceAccountKey() {
  const searchDirs = [
    path.join(__dirname, '..', 'secrets'), // WAYVORA/secrets
    path.join(__dirname, 'secrets'),      // scripts/secrets
    path.join(__dirname),                 // scripts/
    path.join(__dirname, '..')            // WAYVORA/
  ];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;

    // 1. Direct standard file name check
    const standardKeyPath = path.join(dir, 'serviceAccountKey.json');
    if (fs.existsSync(standardKeyPath)) return standardKeyPath;

    // 2. Scan directory for any downloaded Firebase Admin SDK JSON key
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.json') && (file.includes('adminsdk') || file.includes('wayvora-96c3d'))) {
        return path.join(dir, file);
      }
    }
  }
  return null;
}

const serviceAccountPath = findServiceAccountKey();

if (!serviceAccountPath) {
  console.error("======================================================================");
  console.error("❌ ERROR: Missing Service Account Key file!");
  console.error("======================================================================");
  console.error("Please place your downloaded Firebase Admin SDK private key JSON file in:");
  console.error("   WAYVORA/secrets/ [your-key-file].json");
  console.error("======================================================================");
  process.exit(1);
}

// Load service account (Never log private_key or secrets)
const serviceAccount = require(serviceAccountPath);

// Verify project ID matches WAYVORA
if (serviceAccount.project_id !== EXPECTED_PROJECT_ID) {
  console.error("======================================================================");
  console.error(`❌ ERROR: Project ID mismatch!`);
  console.error(`Expected: '${EXPECTED_PROJECT_ID}'`);
  console.error(`Found:    '${serviceAccount.project_id}'`);
  console.error("Please ensure you downloaded the key from Firebase project 'WAYVORA'.");
  console.error("======================================================================");
  process.exit(1);
}

// Initialize Admin SDK using modular initializeApp and cert
initializeApp({
  credential: cert(serviceAccount)
});

// Obtain Auth instance via modular getAuth()
const auth = getAuth();

async function assignAdminClaim(uid) {
  console.log("======================================================================");
  console.log(`✓ Detected Key File: secrets/${path.basename(serviceAccountPath)}`);
  console.log(`✓ Verified Firebase Project ID: ${serviceAccount.project_id}`);
  console.log(`🔍 Looking up user account for UID: ${uid}...`);

  try {
    const userRecord = await auth.getUser(uid);
    console.log(`✓ User found in Firebase Auth: ${userRecord.email || 'Registered User'}`);
    console.log(`Existing custom claims:`, userRecord.customClaims || "None");

    console.log(`🔐 Stamping custom claim { admin: true }...`);
    await auth.setCustomUserClaims(uid, { admin: true });

    // Verify claim propagation
    const updatedRecord = await auth.getUser(uid);
    console.log("======================================================================");
    console.log("🎉 SUCCESS! Administrator custom claim successfully assigned.");
    console.log(`Target User: ${updatedRecord.email}`);
    console.log(`Administrator UID: ${updatedRecord.uid}`);
    console.log(`Active Custom Claims:`, updatedRecord.customClaims);
    console.log("======================================================================");
    console.log("IMPORTANT NEXT STEP FOR THE WEBSITE:");
    console.log("If your administrator account is currently signed in on WAYVORA,");
    console.log("click 'Sign Out' and sign back in to refresh your Firebase ID token.");
    console.log("The '🛡️ Admin Portal' will then appear in the navigation bar.");
    console.log("======================================================================");
    process.exit(0);

  } catch (error) {
    console.error("======================================================================");
    console.error("❌ Failed to assign administrator custom claim:", error.message);
    if (error.code === 'auth/user-not-found') {
      console.error(`User with UID '${uid}' was not found in Firebase Authentication.`);
      console.error("Please check the UID in the Firebase Authentication console.");
    }
    console.error("======================================================================");
    process.exit(1);
  }
}

assignAdminClaim(targetUid);
