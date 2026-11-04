const { initFirebaseAdmin } = require('../api/firebase-admin.js');

async function inspectTickets() {
  const { db } = initFirebaseAdmin();
  if (!db) {
    console.error('Firebase Admin DB not initialized');
    process.exit(1);
  }

  console.log('--- FETCHING ALL SUPPORT TICKETS FROM FIRESTORE ---');
  const snapshot = await db.collection('support_tickets').get();
  console.log(`Total tickets found: ${snapshot.size}`);

  const tickets = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    tickets.push({
      id: doc.id,
      ticketId: data.ticketId || doc.id,
      name: data.name,
      email: data.email,
      registeredEmail: data.registeredEmail,
      userId: data.userId,
      category: data.category,
      source: data.source,
      status: data.status,
      message: (data.message || '').slice(0, 80),
      adminReply: (data.adminReply || '').slice(0, 80),
      replyHistoryCount: Array.isArray(data.replyHistory) ? data.replyHistory.length : 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      emailDelivery: data.emailDelivery
    });
  });

  // Sort by createdAt or updatedAt descending
  tickets.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  console.log(JSON.stringify(tickets.slice(0, 20), null, 2));
}

inspectTickets().catch(err => {
  console.error('Error inspecting tickets:', err);
  process.exit(1);
});
