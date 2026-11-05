const path = require('path');
const fs = require('fs');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const keyPath = path.join(__dirname, '..', 'secrets', 'wayvora-96c3d-firebase-adminsdk-fbsvc-d05817b4b7.json');
console.log('Using service account key at:', keyPath);
console.log('Key exists?', fs.existsSync(keyPath));

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id || 'wayvora-96c3d'
});

const auth = getAuth(app);

async function inspectUser() {
  console.log('\n--- Checking user by email: wayvora.admin@gmail.com ---');
  try {
    const userByEmail = await auth.getUserByEmail('wayvora.admin@gmail.com');
    console.log('User found by email:');
    console.log('  UID:', userByEmail.uid);
    console.log('  Email:', userByEmail.email);
    console.log('  Custom Claims:', JSON.stringify(userByEmail.customClaims));
    console.log('  Email Verified:', userByEmail.emailVerified);
    console.log('  Disabled:', userByEmail.disabled);
    console.log('  TokensValidAfterTime:', userByEmail.tokensValidAfterTime);
  } catch (e) {
    console.log('User not found by email wayvora.admin@gmail.com:', e.message);
  }

  console.log('\n--- Checking hardcoded adminUid: MXMCpQFfM7Zyp865ljTXiasFB2M2 ---');
  try {
    const userByUid = await auth.getUser('MXMCpQFfM7Zyp865ljTXiasFB2M2');
    console.log('User found by UID MXMCpQFfM7Zyp865ljTXiasFB2M2:');
    console.log('  UID:', userByUid.uid);
    console.log('  Email:', userByUid.email);
    console.log('  Custom Claims:', JSON.stringify(userByUid.customClaims));
  } catch (e) {
    console.log('User not found by UID MXMCpQFfM7Zyp865ljTXiasFB2M2:', e.message);
  }

  console.log('\n--- Listing all users in Firebase Auth ---');
  const list = await auth.listUsers(20);
  console.log(`Found ${list.users.length} users:`);
  list.users.forEach(u => {
    console.log(` - UID: ${u.uid} | Email: ${u.email} | Claims: ${JSON.stringify(u.customClaims)}`);
  });
}

inspectUser().catch(console.error);
