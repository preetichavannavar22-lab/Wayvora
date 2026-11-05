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
  verifyUserAuthToken,
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
    const pathname = (req.url || '').split('?')[0].replace(/\.js$/, '');

    let vercelPath = '';
    if (req.query && req.query.path) {
      vercelPath = (Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path)).toLowerCase();
    }

    // -------------------------------------------------------------------------
    // ACTION: RESEND WEBHOOK (email.delivered, email.bounced, email.complained)
    // -------------------------------------------------------------------------
    const isWebhook = pathname.endsWith('/webhook') || vercelPath.endsWith('webhook') || (body.type && typeof body.type === 'string' && body.type.startsWith('email.'));
    if (isWebhook) {
      return await handleResendWebhook(req, res, body);
    }

    const isReply = pathname.endsWith('/reply') || vercelPath.endsWith('reply') || body.action === 'reply';

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
  let authToken = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    authToken = authHeader.split('Bearer ')[1].trim();
  }

  // Reject direct unauthenticated requests
  if (!authToken) {
    const errRes = {
      success: false,
      error: 'Unauthorized: You must be registered and signed in to WAYVORA to submit an inquiry or support request.'
    };
    if (typeof res.status === 'function') return res.status(401).json(errRes);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  const tokenVerification = await verifyUserAuthToken(authToken);
  if (!tokenVerification || !tokenVerification.isValid || !tokenVerification.uid) {
    console.warn('[SupportAPI] Token verification error:', tokenVerification?.error || 'Invalid token');
    const errRes = {
      success: false,
      error: 'Unauthorized: Invalid or expired authentication token. Please sign in to submit an inquiry.'
    };
    if (typeof res.status === 'function') return res.status(401).json(errRes);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  verifiedUid = tokenVerification.uid;
  verifiedEmail = (tokenVerification.email || email).trim().toLowerCase();

  // 2b. Verify user exists in Firebase Authentication (optional enrichment via Admin SDK)
  let userRecord = null;
  try {
    userRecord = await getUserAuthRecord(verifiedUid);
  } catch (uErr) {
    console.warn('[SupportAPI] User lookup in Admin Auth non-fatal:', uErr.message);
  }

  // Use verified UID and email from Admin Auth if available, or directly from the verified token
  userId = (userRecord && userRecord.uid) || verifiedUid;
  registeredEmail = (userRecord && userRecord.email) ? userRecord.email.trim().toLowerCase() : verifiedEmail;

  if (!userId || !registeredEmail) {
    const errRes = {
      success: false,
      error: 'Forbidden: A registered WAYVORA traveler account was not found for this user.'
    };
    if (typeof res.status === 'function') return res.status(403).json(errRes);
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

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
      ticketId: existingTicketId,
      idToken: authToken
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

  // 3. Dispatch Emails via Resend (guarded by kill-switch)
  const now = new Date().toISOString();
  let userEmailResult = { success: false, error: 'Not executed' };
  let adminEmailResult = { success: false, error: 'Not executed' };

  if (process.env.SUPPORT_REPLY_KILL_SWITCH === 'true') {
    console.warn('[SupportAPI] KILL-SWITCH ACTIVE: Inquiry confirmation emails suppressed.');
    userEmailResult = { success: false, error: 'Outgoing emails disabled via server kill switch.', killSwitchActive: true };
    adminEmailResult = { success: false, error: 'Outgoing emails disabled via server kill switch.', killSwitchActive: true };
  } else {
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
  const { ticketId, adminReply = '', status = 'in_progress', provider: requestedProvider, idempotencyKey } = body;

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

  // 2. Validate ticket ID is provided
  if (!ticketId || typeof ticketId !== 'string' || !ticketId.trim()) {
    const errRes = { success: false, error: 'ticketId is required.' };
    if (typeof res.status === 'function') return res.status(400).json(errRes);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  const cleanTicketId = ticketId.trim();

  // 3. STRICT FIRESTORE LOOKUP: Fetch ticket from database using exact ticket ID
  // NEVER use cached, sample, or fallback ticket details
  let ticket = null;
  try {
    ticket = await getSupportTicket(cleanTicketId);
  } catch (err) {
    console.error(`[SupportAPI] Error fetching ticket #${cleanTicketId}:`, err.message);
  }

  if (!ticket) {
    const errRes = {
      success: false,
      error: `Ticket #${cleanTicketId} not found in database. Outgoing replies require an authentic existing ticket.`
    };
    if (typeof res.status === 'function') return res.status(404).json(errRes);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // 4. STRICT TICKET OWNERSHIP VERIFICATION:
  // Recipient email MUST be resolved from Firebase Authentication for the ticket owner
  let userRecord = null;
  const ticketUserId = ticket.userId;

  if (ticketUserId) {
    try {
      userRecord = await getUserAuthRecord(ticketUserId);
    } catch (e) {
      console.warn(`[SupportAPI] Ticket owner lookup by UID (${ticketUserId}) failed:`, e.message);
    }
  }

  if (!userRecord && (ticket.registeredEmail || ticket.email)) {
    const candidate = (ticket.registeredEmail || ticket.email).trim().toLowerCase();
    try {
      userRecord = await getUserAuthRecordByEmail(candidate);
    } catch (e) {
      console.warn(`[SupportAPI] Ticket owner lookup by email (${candidate}) failed:`, e.message);
    }
  }

  if (!userRecord || !userRecord.email) {
    const errRes = {
      success: false,
      error: `Cannot send reply: The owner of ticket #${cleanTicketId} does not have a verified account in Firebase Authentication. Replies are strictly restricted to registered users.`
    };
    if (typeof res.status === 'function') return res.status(400).json(errRes);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // Recipient email is strictly retrieved from the verified Firebase Auth account
  const travelerEmail = userRecord.email.trim().toLowerCase();
  const targetUserId = userRecord.uid;

  // Ensure inquiry details belong to the SAME Firestore ticket (never accept client overrides)
  const travelerName = ticket.name || userRecord.displayName || 'Traveler';
  const category = ticket.category || 'General Support';
  const originalMessage = ticket.message || '';

  // 5. STATUS-ONLY UPDATE CHECK:
  // If no adminReply is provided, simply update ticket status without sending any email
  const trimmedReply = (adminReply || '').trim();
  if (!trimmedReply) {
    try {
      await updateSupportTicket(cleanTicketId, {
        status: status,
        updatedAt: new Date().toISOString()
      });
      const statusRes = {
        success: true,
        ticketId: cleanTicketId,
        status: status,
        emailSent: false,
        message: `Ticket #${cleanTicketId.slice(0, 8)} status updated to ${status}. No email dispatched because no new reply text was entered.`
      };
      if (typeof res.status === 'function') return res.status(200).json(statusRes);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(statusRes));
      return;
    } catch (stErr) {
      const errRes = { success: false, error: 'Failed to update ticket status: ' + stErr.message };
      if (typeof res.status === 'function') return res.status(500).json(errRes);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(errRes));
      return;
    }
  }

  // 6. SERVER-SIDE DUPLICATE-SEND PROTECTION & IDEMPOTENCY:
  // Check if this identical reply has already been delivered for this ticket
  const isDuplicateReply = (
    ticket.adminReply &&
    ticket.adminReply.trim().toLowerCase() === trimmedReply.toLowerCase() &&
    ticket.replyEmailStatus &&
    ticket.replyEmailStatus.sent === true
  ) || (
    Array.isArray(ticket.replyHistory) &&
    ticket.replyHistory.some(r =>
      (r.reply || '').trim().toLowerCase() === trimmedReply.toLowerCase() &&
      r.emailSent === true
    )
  ) || (
    idempotencyKey &&
    ticket.lastIdempotencyKey === idempotencyKey
  );

  if (isDuplicateReply) {
    console.log(`[SupportAPI] Duplicate reply detected for ticket #${cleanTicketId}. Suppressing duplicate email dispatch.`);
    if (status && status !== ticket.status) {
      await updateSupportTicket(cleanTicketId, { status: status, updatedAt: new Date().toISOString() });
    }
    const dupRes = {
      success: true,
      ticketId: cleanTicketId,
      status: status || ticket.status,
      emailSent: false,
      duplicateBlocked: true,
      message: `Ticket #${cleanTicketId.slice(0, 8)} status updated. Identical reply was already emailed previously — duplicate email suppressed.`,
      emailDelivery: {
        sent: false,
        skipped: true,
        reason: 'Duplicate reply: identical message was already delivered to ' + travelerEmail
      }
    };
    if (typeof res.status === 'function') return res.status(200).json(dupRes);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dupRes));
    return;
  }

  // 7. SERVER-SIDE KILL SWITCH FOR SUPPORT REPLIES:
  // When active, all outgoing support-reply emails are blocked immediately.
  const isKillSwitchActive = process.env.SUPPORT_REPLY_KILL_SWITCH === 'true';
  const now = new Date().toISOString();
  let emailResult = { success: false, error: 'Not executed' };
  let providerUsed = 'none';

  if (isKillSwitchActive) {
    console.warn(`[SupportAPI] KILL-SWITCH ACTIVE: Outgoing email for ticket #${cleanTicketId} to ${travelerEmail} was blocked.`);
    emailResult = {
      success: false,
      error: 'Outgoing support emails are temporarily disabled via server-side kill switch (SUPPORT_REPLY_KILL_SWITCH=true).',
      killSwitchActive: true
    };
  } else {
    // 8. Dispatch official reply email to verified traveler via Gmail API
    const gmailStatus = await getGmailStatus();
    const smtpConfig = getSmtpConfig();

    try {
      if (requestedProvider === 'gmail' || (gmailStatus.isConnected && requestedProvider !== 'resend' && requestedProvider !== 'gmail_smtp')) {
        console.log(`[SupportAPI] Dispatching admin reply to ${travelerEmail} via Gmail API (from ${gmailStatus.connectedEmail || 'wayvora.admin@gmail.com'})...`);
        emailResult = await sendAdminReplyWithGmail({
          ticketId: cleanTicketId,
          travelerName,
          travelerEmail,
          adminReply: trimmedReply,
          originalMessage,
          category,
          status
        });
        if (emailResult.success) {
          providerUsed = 'gmail';
        }
      } else if (requestedProvider === 'gmail_smtp' || (smtpConfig.isConfigured && requestedProvider !== 'resend' && !gmailStatus.isConnected)) {
        console.log(`[SupportAPI] Dispatching admin reply to ${travelerEmail} via Gmail SMTP (from ${smtpConfig.user})...`);
        emailResult = await sendAdminReplyWithSmtp({
          ticketId: cleanTicketId,
          travelerName,
          travelerEmail,
          adminReply: trimmedReply,
          originalMessage,
          category,
          status
        });
        if (emailResult.success) {
          providerUsed = 'gmail_smtp';
        }
      } else if (requestedProvider === 'resend' || (!gmailStatus.isConnected && !smtpConfig.isConfigured)) {
        console.log(`[SupportAPI] Dispatching admin reply to ${travelerEmail} via Resend API...`);
        emailResult = await sendAdminReplyToCustomer({
          ticketId: cleanTicketId,
          travelerName,
          travelerEmail,
          adminReply: trimmedReply,
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
  }

  // 9. Build audit entries
  const replyEntry = {
    reply: trimmedReply,
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
    killSwitchActive: !!emailResult.killSwitchActive,
    isSandboxRestriction: !!emailResult.isSandboxRestriction,
    sentAt: now
  };

  // 10. Update ticket in Firestore (saving reply, status, associating userId, preserving replyHistory and recording idempotency)
  let firestoreUpdated = false;
  try {
    const { FieldValue } = require('firebase-admin/firestore');
    const updatePayload = {
      adminReply: trimmedReply,
      status: status,
      repliedAt: now,
      replyHistory: FieldValue.arrayUnion(replyEntry),
      replyEmailStatus: replyEmailStatus
    };

    if (idempotencyKey) {
      updatePayload.lastIdempotencyKey = idempotencyKey;
    }
    if (targetUserId) {
      updatePayload.userId = targetUserId;
    }
    if (travelerEmail) {
      updatePayload.registeredEmail = travelerEmail;
    }

    await updateSupportTicket(cleanTicketId, updatePayload);
    firestoreUpdated = true;
  } catch (fsErr) {
    console.warn('[SupportAPI] Firestore reply update error:', fsErr.message);
  }

  // 11. Return comprehensive, accurate response
  const providerLabel = providerUsed === 'gmail_smtp'
    ? 'Gmail SMTP (wayvora.admin@gmail.com)'
    : (providerUsed === 'gmail' ? 'Gmail API' : 'Resend');

  const replyResponse = {
    success: true,
    ticketId: cleanTicketId,
    recipient: travelerEmail,
    firestoreUpdated,
    emailSent: !!emailResult.success,
    provider: providerUsed,
    emailDelivery: replyEmailStatus,
    message: emailResult.success
      ? `Official response recorded and email successfully delivered to ${travelerEmail} via ${providerLabel}${emailResult.id ? ' (Message ID: ' + emailResult.id + ')' : ''}.`
      : (emailResult.killSwitchActive
          ? `Official response recorded in database. (Outgoing email blocked: kill switch is active).`
          : `Official response recorded in database, but email delivery to ${travelerEmail} could not complete: ${emailResult.error || 'Delivery failed'}`)
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
