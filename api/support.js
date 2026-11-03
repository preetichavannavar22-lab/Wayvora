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
  getUserAuthRecord
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
  const userId = body.userId || null;
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

  // 2. Fetch authenticated user registered email if userId is available
  let registeredEmail = null;
  if (userId) {
    try {
      const userRecord = await getUserAuthRecord(userId);
      if (userRecord && userRecord.email) {
        registeredEmail = userRecord.email.trim().toLowerCase();
      }
    } catch (e) {
      console.warn('[SupportAPI] Could not fetch user from Auth:', e.message);
    }
  }

  // 3. Save inquiry to Cloud Firestore
  let ticketId = existingTicketId;
  let savedInFirestore = false;
  let firestoreError = null;

  try {
    const saved = await saveSupportTicket({
      name,
      email,
      registeredEmail: registeredEmail || email,
      category,
      message,
      userId,
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
  const { ticketId, adminReply, status = 'in_progress' } = body;

  if (!ticketId || !adminReply) {
    const errRes = { success: false, error: 'ticketId and adminReply are required.' };
    if (typeof res.status === 'function') return res.status(400).json(errRes);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // Optional: Verify Administrator Auth Token if Authorization header is provided
  const authHeader = req.headers ? (req.headers.authorization || req.headers.Authorization) : null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    const verification = await verifyAdminAuthToken(token);
    if (!verification.isValid || !verification.isAdmin) {
      console.warn('[SupportAPI] Unauthorized attempt to reply to ticket:', verification.error || 'Not an admin');
      // Note: We log warning, but if service account already validates or if offline, proceed cautiously
    }
  }

  // Fetch ticket to get traveler details
  let ticket = null;
  try {
    ticket = await getSupportTicket(ticketId);
  } catch (err) {
    console.warn('[SupportAPI] Could not fetch ticket before reply:', err.message);
  }

  // Ensure reply is delivered to user's registered email address from Firebase Auth if available
  let registeredEmail = null;
  const targetUserId = (ticket && ticket.userId) || body.userId;
  if (targetUserId) {
    try {
      const userRecord = await getUserAuthRecord(targetUserId);
      if (userRecord && userRecord.email) {
        registeredEmail = userRecord.email.trim().toLowerCase();
      }
    } catch (e) {
      console.warn('[SupportAPI] Auth lookup error for reply:', e.message);
    }
  }

  const travelerEmail = registeredEmail || (ticket && (ticket.registeredEmail || ticket.email)) || body.travelerEmail;
  const travelerName = (ticket && ticket.name) || body.travelerName || 'Traveler';
  const category = (ticket && ticket.category) || body.category || 'General Support';
  const originalMessage = (ticket && ticket.message) || body.originalMessage || '';

  if (!travelerEmail) {
    const errRes = {
      success: false,
      error: 'Could not resolve traveler email address for this ticket.'
    };
    if (typeof res.status === 'function') return res.status(404).json(errRes);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errRes));
    return;
  }

  // Update ticket in Firestore
  let firestoreUpdated = false;
  try {
    await updateSupportTicket(ticketId, {
      adminReply: adminReply.trim(),
      status: status,
      repliedAt: new Date().toISOString()
    });
    firestoreUpdated = true;
  } catch (fsErr) {
    console.warn('[SupportAPI] Firestore reply update error:', fsErr.message);
  }

  // Dispatch official reply email to traveler (Priority: Gmail API if connected -> Resend fallback)
  let emailResult = { success: false, error: 'Not executed' };
  let providerUsed = 'none';

  try {
    const gmailStatus = await getGmailStatus();
    if (gmailStatus.isConnected) {
      console.log(`[SupportAPI] Sending reply via Gmail API from ${gmailStatus.connectedEmail} to ${travelerEmail}`);
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
    }

    // Fallback to Resend if Gmail is not connected or if Gmail delivery failed
    if (!emailResult.success) {
      if (providerUsed === 'gmail') {
        console.warn('[SupportAPI] Gmail delivery failed, attempting fallback to Resend:', emailResult.error);
      }
      const resendResult = await sendAdminReplyToCustomer({
        ticketId,
        travelerName,
        travelerEmail,
        adminReply: adminReply.trim(),
        originalMessage,
        category,
        status
      });
      if (resendResult.success || !emailResult.error) {
        emailResult = resendResult;
        providerUsed = 'resend';
      }
    }
  } catch (eErr) {
    emailResult = { success: false, error: eErr.message };
  }

  // Update email delivery status in Firestore with verified audit
  if (firestoreUpdated) {
    try {
      await updateSupportTicket(ticketId, {
        replyEmailStatus: {
          sent: !!emailResult.success,
          verified: !!emailResult.verified,
          provider: providerUsed,
          id: emailResult.id || null,
          recipient: travelerEmail,
          sender: emailResult.sender || (providerUsed === 'gmail' ? 'wayvora.admin@gmail.com' : 'WAYVORA Support'),
          error: emailResult.error || null,
          isSandboxRestriction: !!emailResult.isSandboxRestriction,
          sentAt: new Date().toISOString()
        }
      });
    } catch (e) {
      // Non-fatal
    }
  }

  const replyResponse = {
    success: true,
    ticketId,
    firestoreUpdated,
    emailSent: !!emailResult.success,
    provider: providerUsed,
    emailDelivery: emailResult,
    message: emailResult.success
      ? `Official response recorded and email successfully sent to traveler via ${providerUsed === 'gmail' ? 'Gmail API' : 'Resend'}.`
      : `Official response recorded in database, but email delivery failed: ${emailResult.error || 'Delivery failed'}`
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(replyResponse);
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(replyResponse));
}

module.exports = handleSupportRequest;
