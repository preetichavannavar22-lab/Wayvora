const { initFirebaseAdmin } = require('../api/firebase-admin.js');

async function listCollections() {
  const { db } = initFirebaseAdmin();
  if (!db) {
    console.error('Firebase Admin DB not initialized');
    process.exit(1);
  }

  const collections = await db.listCollections();
  console.log('Collections in Firestore:');
  for (const col of collections) {
    console.log(` - ${col.id}`);
    const snap = await col.limit(5).get();
    console.log(`   Count (at least): ${snap.size}`);
    snap.forEach(d => {
      console.log(`     Doc ID: ${d.id}`);
      const data = d.data();
      console.log(`       Data preview:`, Object.keys(data).slice(0, 10));
      if (data.email || data.name || data.subject || data.message || data.ticketId) {
        console.log(`       Preview values: email=${data.email}, name=${data.name}, ticketId=${data.ticketId}`);
      }
    });
  }
}

listCollections().catch(err => {
  console.error('Error listing collections:', err);
  process.exit(1);
});
