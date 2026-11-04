/**
 * WAYVORA - Customer Support API Endpoint
 * Handles support request submissions, Firestore persistence, and Resend email dispatches.
 * Also handles Administrator replies with official customer email notifications.
 * 
 * Works as a Vercel Serverless Function and is mounted directly in server.js.
 */

const {
  saveSupportTicket,
  updateSupportTicket,
  getSupportTicket,
  verifyAdminAuthToken,
  getUserAuthRecord,
  getUserAuthRecordByEmail
} = require('./firebase-admin.js');

const {
  sendCustomerAcknowledgement,
  sendAdminNotification,
  sendAdminReplyToCustomer,
  getConfig
} = require('./resend-service.js');

const {
  getConnectionStatus: getGmailStatus,
  sendAdminReplyWithGmail
} = require('./gmail-service.js');

const {
  sendAdminReplyWithSmtp,
  getConfig: getSmtpConfig,
  verifySmtpConnection
} = require('./gmail-smtp-service.js');

/**
 * Main HTTP Handler
 */
async function handleSupportRequest(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(204).end();
    }
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    const errorBody = { error: 'Method not allowed. Use POST.' };
    if (typeof res.status === 'function') {
      return res.status(405).json(errorBody);
    }
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorBody));
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const pathname = (req.url || '').split('?')[0];

    // -------------------------------------------------------------------------
    // ACTION: RESEND WEBHOOK (email.delivered, email.bounced, email.complained)
    // -------------------------------------------------------------------------
    const isWebhook = pathname.endsWith('/webhook') || (body.type && typeof body.type === 'string' && body.type.startsWith('email.'));
    if (isWebhook) {
      return await handleResendWebhook(req, res, body);
    }

    const isReply = pathname.endsWith('/reply') || body.action === 'reply';

    // -------------------------------------------------------------------------
    // ACTION: ADMIN REPLY TO TRAVELER
    // -------------------------------------------------------------------------
    if (isReply) {
      return await handleAdminReply(req, res, body);
    }

    // -------------------------------------------------------------------------
    // ACTION: SUBMIT NEW SUPPORT INQUIRY
    // -------------------------------------------------------------------------
    return await handleCreateSupportRequest(req, res, body);

  } catch (err) {
    console.error('[SupportAPI] Unhandled Error:', err);
    const errPayload = {
      success: false,
      error: 'Internal server error processing support request',
      details: err.message
    };
    if (typeof res.status === 'function') {
      return res.status(500).json(errPayload);
    }
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errPayload));
  }
}

/**
 * Handles creation of new support tickets
 */
async function handleCreateSupportRequest(req, res, body) {
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();
  const category = (body.category || 'General Inquiry').trim();
  let userId = body.userId || null;
  let registeredEmail = (body.registeredEmail || '').trim().toLowerCase() || null;
  const existingTicketId = body.ticketId || null;

  // 1. Validation
  if (!name || !email || !message) {
    const errRes = {
      success: false,
      error: 'Missing required fields: name, email, and message are required.'
    };
    if (typeof res.status === 'function') return res.status(400).json(errRes);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const errRes = {
      success: false,
      error: 'Invalid email address format provided.'
    };
    if (typeof res.status === 'function') return res.status(400).json(errRes);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // 2. Strict Authentication Requirement: Caller must be a registered, authenticated Firebase user
  const authHeader = req.headers ? (req.headers.authorization || req.headers.Authorization) : null;
  let verifiedUid = null;
  let verifiedEmail = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    const { auth } = require('./firebase-admin.js').initFirebaseAdmin();
    if (auth) {
      try {
        const decoded = await auth.verifyIdToken(token);
        if (decoded && decoded.uid) {
          verifiedUid = decoded.uid;
          verifiedEmail = (decoded.email || '').trim().toLowerCase();
        }
      } catch (tokenErr) {
        console.warn('[SupportAPI] Token verification error:', tokenErr.message);
        const errRes = {
          success: false,
          error: 'Unauthorized: Invalid or expired authentication token. Please sign in to submit an inquiry.'
        };
        if (typeof res.status === 'function') return res.status(401).json(errRes);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(errRes));
        return;
      }
    }
  }

  // Reject direct unauthenticated requests
  if (!verifiedUid) {
    const errRes = {
      success: false,
      error: 'Unauthorized: You must be registered and signed in to WAYVORA to submit an inquiry or support request.'
    };
    if (typeof res.status === 'function') return res.status(401).json(errRes);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // 2b. Verify user exists in Firebase Authentication
  let userRecord = null;
  try {
    userRecord = await getUserAuthRecord(verifiedUid);
  } catch (uErr) {
    console.warn('[SupportAPI] User not found in Firebase Auth:', uErr.message);
  }

  if (!userRecord || !userRecord.email) {
    const errRes = {
      success: false,
      error: 'Forbidden: A registered WAYVORA traveler account was not found for this user.'
    };
    if (typeof res.status === 'function') return res.status(403).json(errRes);
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  userId = userRecord.uid;
  registeredEmail = userRecord.email.trim().toLowerCase();
  const source = body.source || (category === 'planning' || category === 'feature' ? 'about_inquiry' : 'support_ticket');

  // 3. Save inquiry to Cloud Firestore
  let ticketId = existingTicketId;
  let savedInFirestore = false;
  let firestoreError = null;

  try {
    const saved = await saveSupportTicket({
      name,
      email: registeredEmail,
      registeredEmail,
      category,
      message,
      userId,
      source,
      ticketId: existingTicketId
    });
    ticketId = saved.id;
    savedInFirestore = true;
  } catch (fsErr) {
    console.warn('[SupportAPI] Firestore save warning:', fsErr.message);
    firestoreError = fsErr.message;
    if (!ticketId) {
      ticketId = 'TKT-' + Date.now().toString(36).toUpperCase();
    }
  }

  // 3. Dispatch Emails via Resend
  const now = new Date().toISOString();
  let userEmailResult = { success: false, error: 'Not executed' };
  let adminEmailResult = { success: false, error: 'Not executed' };

  try {
    userEmailResult = await sendCustomerAcknowledgement({
      ticketId,
      name,
      email,
      category,
      message,
      createdAt: now
    });
  } catch (uErr) {
    userEmailResult = { success: false, error: uErr.message };
  }

  try {
    adminEmailResult = await sendAdminNotification({
      ticketId,
      name,
      email,
      category,
      message,
      userId,
      createdAt: now
    });
  } catch (aErr) {
    adminEmailResult = { success: false, error: aErr.message };
  }

  // 4. Update Firestore with email delivery audit status
  if (savedInFirestore && ticketId) {
    try {
      await updateSupportTicket(ticketId, {
        emailDelivery: {
          userEmail: {
            sent: !!userEmailResult.success,
            id: userEmailResult.id || null,
            error: userEmailResult.error || null,
            isSandboxRestriction: !!userEmailResult.isSandboxRestriction
          },
          adminEmail: {
            sent: !!adminEmailResult.success,
            id: adminEmailResult.id || null,
            error: adminEmailResult.error || null,
            isSandboxRestriction: !!adminEmailResult.isSandboxRestriction
          },
          lastAttemptAt: now
        }
      });
    } catch (auditErr) {
      console.warn('[SupportAPI] Could not record email audit to Firestore:', auditErr.message);
    }
  }

  // 5. Determine overall delivery success
  const emailSent = !!(userEmailResult.success || adminEmailResult.success);
  const config = getConfig();

  let messageText = '';
  if (userEmailResult.success) {
    messageText = `Your support inquiry (#${ticketId.slice(0, 8)}) was received and a confirmation email has been dispatched to ${email}.`;
  } else if (!config.isConfigured) {
    messageText = `Your support inquiry (#${ticketId.slice(0, 8)}) was securely recorded in our database, but email delivery is pending server secret configuration.`;
  } else if (userEmailResult.isSandboxRestriction) {
    messageText = `Your support inquiry was recorded (#${ticketId.slice(0, 8)}), but test delivery is restricted by Resend sandbox to the account owner's email.`;
  } else {
    messageText = `Your support inquiry was recorded (#${ticketId.slice(0, 8)}), but confirmation email could not be delivered: ${userEmailResult.error || 'Delivery failed'}.`;
  }

  const responsePayload = {
    success: true,
    ticketId,
    emailSent,
    firestoreSaved: savedInFirestore,
    firestoreError,
    message: messageText,
    emailDelivery: {
      userEmail: userEmailResult,
      adminEmail: adminEmailResult
    }
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(responsePayload);
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(responsePayload));
}

/**
 * Handles Administrator responses to tickets
 */
async function handleAdminReply(req, res, body) {
  const { ticketId, adminReply, status = 'in_progress', provider: requestedProvider } = body;

  // 1. Strict Administrator Authentication Verification
  const authHeader = req.headers ? (req.headers.authorization || req.headers.Authorization) : null;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const errRes = {
      success: false,
      error: 'Unauthorized: Administrator authentication token is required to send official replies.'
    };
    if (typeof res.status === 'function') return res.status(401).json(errRes);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const verification = await verifyAdminAuthToken(token);
  if (!verification || !verification.isValid || !verification.isAdmin) {
    console.warn('[SupportAPI] Unauthorized attempt to reply to ticket:', verification?.error || 'User is not an admin');
    const errRes = {
      success: false,
      error: 'Forbidden: Insufficient privileges. Only verified administrators can reply to support requests.'
    };
    if (typeof res.status === 'function') return res.status(403).json(errRes);
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // 2. Validate required inputs
  if (!ticketId || !adminReply || !adminReply.trim()) {
    const errRes = { success: false, error: 'ticketId and adminReply are required.' };
    if (typeof res.status === 'function') return res.status(400).json(errRes);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // 3. Fetch ticket to get traveler details
  let ticket = null;
  try {
    ticket = await getSupportTicket(ticketId);
  } catch (err) {
    console.warn('[SupportAPI] Could not fetch ticket before reply:', err.message);
  }

  if (!ticket && !body.travelerEmail) {
    const errRes = { success: false, error: `Ticket #${ticketId} not found in database.` };
    if (typeof res.status === 'function') return res.status(404).json(errRes);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // 4. Resolve traveler's registered email address from Firebase Auth
  let registeredEmail = null;
  let targetUserId = (ticket && ticket.userId) || body.userId || null;

  // 4a. If targetUserId is available, fetch user record from Firebase Auth
  if (targetUserId) {
    try {
      const userRecord = await getUserAuthRecord(targetUserId);
      if (userRecord && userRecord.email) {
        registeredEmail = userRecord.email.trim().toLowerCase();
      }
    } catch (e) {
      console.warn('[SupportAPI] Auth lookup by UID error:', e.message);
    }
  }

  // 4b. If still no registeredEmail, look up Firebase Auth by ticket or body email
  const candidateEmail = (body.travelerEmail || (ticket && (ticket.registeredEmail || ticket.email)) || '').trim().toLowerCase();
  if (!registeredEmail && candidateEmail) {
    try {
      const userRecord = await getUserAuthRecordByEmail(candidateEmail);
      if (userRecord && userRecord.email) {
        registeredEmail = userRecord.email.trim().toLowerCase();
        if (!targetUserId) targetUserId = userRecord.uid;
      }
    } catch (e) {
      // Non-fatal if guest
    }
  }

  // 4c. STRICT REQUIREMENT: Recipient must belong to an existing registered Firebase Authentication account
  if (!registeredEmail) {
    const errRes = {
      success: false,
      error: 'Cannot send reply: The recipient does not have a registered WAYVORA account in Firebase Authentication. Replies are strictly restricted to registered users.'
    };
    if (typeof res.status === 'function') return res.status(400).json(errRes);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // Retrieve recipient email strictly from Firebase Authentication
  const travelerEmail = registeredEmail;
  const travelerName = (ticket && ticket.name) || body.travelerName || 'Traveler';
  const category = (ticket && ticket.category) || body.category || 'General Support';
  const originalMessage = (ticket && ticket.message) || body.originalMessage || '';

  // 5. Dispatch official reply email to traveler via Gmail API (Google OAuth 2.0)
  // Sender email: wayvora.admin@gmail.com
  const now = new Date().toISOString();
  let emailResult = { success: false, error: 'Not executed' };
  let providerUsed = 'none';

  const gmailStatus = await getGmailStatus();
  const smtpConfig = getSmtpConfig();

  try {
    // 5a. Primary & Required: Gmail API via Google OAuth 2.0 (Sender: wayvora.admin@gmail.com)
    if (requestedProvider === 'gmail' || (gmailStatus.isConnected && requestedProvider !== 'resend' && requestedProvider !== 'gmail_smtp')) {
      console.log(`[SupportAPI] Dispatching admin reply to ${travelerEmail} via Gmail API (from ${gmailStatus.connectedEmail || 'wayvora.admin@gmail.com'})...`);
      emailResult = await sendAdminReplyWithGmail({
        ticketId,
        travelerName,
        travelerEmail,
        adminReply: adminReply.trim(),
        originalMessage,
        category,
        status
      });
      if (emailResult.success) {
        providerUsed = 'gmail';
      }
    } else if (requestedProvider === 'gmail_smtp' || (smtpConfig.isConfigured && requestedProvider !== 'resend' && !gmailStatus.isConnected)) {
      // Alternate fallback to Gmail SMTP if explicitly requested or if OAuth is unconfigured
      console.log(`[SupportAPI] Dispatching admin reply to ${travelerEmail} via Gmail SMTP (from ${smtpConfig.user})...`);
      emailResult = await sendAdminReplyWithSmtp({
        ticketId,
        travelerName,
        travelerEmail,
        adminReply: adminReply.trim(),
        originalMessage,
        category,
        status
      });
      if (emailResult.success) {
        providerUsed = 'gmail_smtp';
      }
    } else if (requestedProvider === 'resend' || (!gmailStatus.isConnected && !smtpConfig.isConfigured)) {
      // Fallback to Resend API when Gmail is unconfigured or explicitly requested
      console.log(`[SupportAPI] Dispatching admin reply to ${travelerEmail} via Resend API...`);
      emailResult = await sendAdminReplyToCustomer({
        ticketId,
        travelerName,
        travelerEmail,
        adminReply: adminReply.trim(),
        originalMessage,
        category,
        status
      });
      if (emailResult.success) {
        providerUsed = 'resend';
      }
    } else {
      emailResult = {
        success: false,
        error: 'Gmail API is not connected. Please authorize Gmail in the Admin Dashboard or configure GOOGLE_REFRESH_TOKEN.'
      };
    }
  } catch (eErr) {
    console.error('[SupportAPI] Exception during email dispatch:', eErr);
    emailResult = { success: false, error: eErr.message };
  }

  // 6. Build audit entries
  const replyEntry = {
    reply: adminReply.trim(),
    repliedAt: now,
    status: status,
    sentBy: verification.email || 'WAYVORA Administrator',
    provider: providerUsed,
    emailSent: !!emailResult.success,
    messageId: emailResult.id || null,
    error: emailResult.error || null
  };

  const replyEmailStatus = {
    sent: !!emailResult.success,
    verified: !!emailResult.verified,
    provider: providerUsed,
    id: emailResult.id || null,
    recipient: travelerEmail,
    sender: emailResult.sender || (providerUsed.includes('gmail') ? 'wayvora.admin@gmail.com' : 'WAYVORA Support'),
    status: emailResult.success ? 'sent' : 'failed',
    error: emailResult.error || null,
    isSandboxRestriction: !!emailResult.isSandboxRestriction,
    sentAt: now
  };

  // 7. Update ticket in Firestore (saving reply, status, associating userId, and preserving replyHistory)
  let firestoreUpdated = false;
  try {
    const { FieldValue } = require('firebase-admin/firestore');
    const updatePayload = {
      adminReply: adminReply.trim(),
      status: status,
      repliedAt: now,
      replyHistory: FieldValue.arrayUnion(replyEntry),
      replyEmailStatus: replyEmailStatus
    };

    if (targetUserId) {
      updatePayload.userId = targetUserId;
    }
    if (registeredEmail) {
      updatePayload.registeredEmail = registeredEmail;
    }

    await updateSupportTicket(ticketId, updatePayload);
    firestoreUpdated = true;
  } catch (fsErr) {
    console.warn('[SupportAPI] Firestore reply update error:', fsErr.message);
  }

  // 8. Return comprehensive, accurate response (Never claim success if email delivery failed)
  const providerLabel = providerUsed === 'gmail_smtp'
    ? 'Gmail SMTP (wayvora.admin@gmail.com)'
    : (providerUsed === 'gmail' ? 'Gmail API' : 'Resend');

  const replyResponse = {
    success: true, // Ticket was recorded in Firestore
    ticketId,
    recipient: travelerEmail,
    firestoreUpdated,
    emailSent: !!emailResult.success,
    provider: providerUsed,
    emailDelivery: replyEmailStatus,
    message: emailResult.success
      ? `Official response recorded and email successfully delivered to ${travelerEmail} via ${providerLabel}${emailResult.id ? ' (Message ID: ' + emailResult.id + ')' : ''}.`
      : `Official response recorded in database, but email delivery to ${travelerEmail} could not complete: ${emailResult.error || 'Delivery failed'}`
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(replyResponse);
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(replyResponse));
}

/**
 * Handles incoming webhooks from Resend for delivered, bounced, and complained statuses
 */
async function handleResendWebhook(req, res, body) {
  try {
    const eventType = body.type; // e.g. 'email.delivered', 'email.bounced', 'email.complained'
    const eventData = body.data || {};
    const emailId = eventData.email_id || eventData.id;

    console.log(`[SupportAPI] Resend Webhook event: ${eventType} for ID: ${emailId}`);

    if (emailId && (eventType === 'email.delivered' || eventType === 'email.bounced' || eventType === 'email.complained')) {
      const { initFirebaseAdmin } = require('./firebase-admin.js');
      const { db } = initFirebaseAdmin();
      if (db) {
        let statusString = 'sent';
        if (eventType === 'email.delivered') statusString = 'delivered';
        if (eventType === 'email.bounced') statusString = 'bounced';
        if (eventType === 'email.complained') statusString = 'complained';

        const snapshot = await db.collection('support_requests')
          .where('replyEmailStatus.id', '==', emailId)
          .limit(5)
          .get();

        const updates = [];
        snapshot.forEach(doc => {
          updates.push(doc.ref.update({
            'replyEmailStatus.status': statusString,
            'replyEmailStatus.lastEventAt': new Date().toISOString(),
            ...(eventType === 'email.bounced' ? { 'replyEmailStatus.bounceReason': eventData.bounce?.message || 'Bounced by recipient mail server' } : {})
          }));
        });
        await Promise.all(updates);
      }
    }

    const okRes = { received: true };
    if (typeof res.status === 'function') return res.status(200).json(okRes);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(okRes));
  } catch (err) {
    console.error('[SupportAPI] Webhook error:', err);
    if (typeof res.status === 'function') return res.status(500).json({ error: err.message });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

handleSupportRequest.handleSupportRequest = handleSupportRequest;
module.exports = handleSupportRequest;
