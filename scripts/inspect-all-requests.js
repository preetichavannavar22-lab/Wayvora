const { initFirebaseAdmin } = require('../api/firebase-admin.js');

async function inspectAllSupportRequests() {
  const { db } = initFirebaseAdmin();
  const snapshot = await db.collection('support_requests').get();
  console.log(`Total support_requests found: ${snapshot.size}`);

  const list = [];
  snapshot.forEach(doc => {
    const d = doc.data();
    list.push({
      id: doc.id,
      name: d.name,
      email: d.email,
      registeredEmail: d.registeredEmail,
      userId: d.userId,
      category: d.category,
      source: d.source,
      status: d.status,
      message: d.message,
      adminReply: d.adminReply,
      repliedAt: d.repliedAt,
      replyEmailStatus: d.replyEmailStatus,
      replyHistory: d.replyHistory,
      createdAt: d.createdAt
    });
  });

  // Sort by createdAt descending
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  console.log('--- RECENT 30 SUPPORT REQUESTS ---');
  list.slice(0, 30).forEach((t, i) => {
    console.log(`\n[${i+1}] ID: ${t.id} | Status: ${t.status} | Created: ${t.createdAt}`);
    console.log(`    Name: ${t.name} | Form Email: ${t.email} | Registered: ${t.registeredEmail} | UID: ${t.userId}`);
    console.log(`    Category: ${t.category} | Source: ${t.source}`);
    console.log(`    Message: "${(t.message || '').replace(/\n/g, ' ')}"`);
    console.log(`    Admin Reply: "${(t.adminReply || '').replace(/\n/g, ' ')}"`);
    if (t.replyEmailStatus) {
      console.log(`    ReplyEmailStatus:`, JSON.stringify(t.replyEmailStatus));
    }
    if (t.replyHistory && t.replyHistory.length > 0) {
      console.log(`    Reply History (${t.replyHistory.length}):`, JSON.stringify(t.replyHistory));
    }
  });
}

inspectAllSupportRequests().catch(console.error);
