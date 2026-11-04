/**
 * WAYVORA - Firebase Cloud Functions
 * 
 * Secure backend email pipeline using the Resend API.
 * Never expose RESEND_API_KEY in frontend code.
 * 
 * Features:
 * 1. onSupportRequestCreated: Firestore trigger automatically fires on new ticket creation,
 *    saving acknowledgements and admin alerts.
 * 2. onAdminReplyCreated: Firestore trigger sends official reply emails when an admin responds.
 * 3. sendSupportEmailHttp: HTTPS endpoint for direct programmatic invocations.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Resend Configuration via Cloud Functions Environment / Secrets
const getResendApiKey = () => process.env.RESEND_API_KEY || (functions.config().resend && functions.config().resend.key) || '';
const getFromEmail = () => process.env.RESEND_FROM_EMAIL || 'WAYVORA Support <onboarding@resend.dev>';
const getAdminEmail = () => process.env.ADMIN_EMAIL || 'wayvora.admin@gmail.com';

/**
 * Escapes HTML entities
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends an email using Resend
 */
async function sendResendMail({ to, subject, html, text, replyTo }) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    console.warn('[CloudFunctions] RESEND_API_KEY is not set. Email delivery skipped.');
    return { success: false, error: 'RESEND_API_KEY missing' };
  }

  const { Resend } = require('resend');
  const resend = new Resend(apiKey);

  const payload = {
    from: getFromEmail(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html
  };

  if (text) payload.text = text;
  if (replyTo) payload.reply_to = replyTo;

  try {
    const res = await resend.emails.send(payload);
    if (res.error) {
      console.error('[CloudFunctions] Resend API Error:', res.error);
      return { success: false, error: res.error.message, statusCode: res.error.statusCode };
    }
    return { success: true, id: res.data && res.data.id };
  } catch (err) {
    console.error('[CloudFunctions] Resend Network Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 1. Firestore Trigger: On Support Request Created
 * Automatically dispatches acknowledgment to traveler and alert to administrator.
 */
exports.onSupportRequestCreated = functions.firestore
  .document('support_requests/{ticketId}')
  .onCreate(async (snap, context) => {
    const ticketId = context.params.ticketId;
    const data = snap.data();
    if (!data) return null;

    const { name, email, category, message, userId } = data;
    const shortId = ticketId.slice(0, 8).toUpperCase();
    const safeName = escapeHtml(name || 'Traveler');
    const safeCategory = escapeHtml(category || 'General Support');
    const safeMsg = escapeHtml(message || '').replace(/\n/g, '<br/>');

    console.log(`[CloudFunctions] Processing new support ticket #${shortId} from ${email}`);

    // 1. Send acknowledgement to traveler
    const userAckHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #38bdf8; padding-bottom: 10px;">WAYVORA Support Confirmation</h2>
        <p>Hello <strong>${safeName}</strong>,</p>
        <p>We have received your support request (Ticket <strong>#${shortId}</strong>). Our team will review your inquiry and follow up within 24–48 hours.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Category:</strong> ${safeCategory}</p>
          <p><strong>Your Inquiry:</strong><br/><em>${safeMsg}</em></p>
        </div>
        <p style="font-size: 13px; color: #64748b;">You can also track ticket status directly in your WAYVORA account under "My Submitted Inquiries".</p>
        <p>Best regards,<br/><strong>The WAYVORA Support Team</strong></p>
      </div>
    `;

    const userEmailResult = await sendResendMail({
      to: email,
      subject: `[WAYVORA #${shortId}] We've received your request: ${safeCategory}`,
      html: userAckHtml,
      text: `Hello ${name},\n\nWe received your request #${shortId}: ${category}.\n\nMessage:\n${message}\n\nOur team will follow up within 24-48 hours.`,
      replyTo: getAdminEmail()
    });

    // 2. Send notification to admin (with reply_to set to traveler)
    const adminHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e1b4b; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">🚨 New Support Inquiry (#${shortId})</h2>
        <p><strong>Traveler:</strong> ${safeName} (&lt;${escapeHtml(email)}&gt;)</p>
        <p><strong>Category:</strong> ${safeCategory}</p>
        <p><strong>Account:</strong> ${userId ? 'UID: ' + escapeHtml(userId) : 'Guest'}</p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #6366f1; margin: 15px 0;">
          <p><em>${safeMsg}</em></p>
        </div>
        <p>To reply to this traveler directly, simply hit Reply in your email client.</p>
      </div>
    `;

    const adminEmailResult = await sendResendMail({
      to: getAdminEmail(),
      subject: `[WAYVORA Support] New Ticket #${shortId}: ${safeCategory} (${safeName})`,
      html: adminHtml,
      text: `New support ticket #${shortId} from ${name} <${email}>\nCategory: ${category}\n\nMessage:\n${message}`,
      replyTo: `${name} <${email}>`
    });

    // Update ticket with delivery results
    return snap.ref.update({
      emailDelivery: {
        userEmail: userEmailResult,
        adminEmail: adminEmailResult,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }
    });
  });

/**
 * 2. Firestore Trigger: On Admin Reply Updated
 * Automatically sends the official reply email when adminReply field is set.
 */
exports.onAdminReplyUpdated = functions.firestore
  .document('support_requests/{ticketId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data() || {};
    const afterData = change.after.data() || {};
    const ticketId = context.params.ticketId;

    // Check if adminReply was newly added or changed
    if (!afterData.adminReply || afterData.adminReply === beforeData.adminReply) {
      return null;
    }

    const { name, email, adminReply, category, message, status } = afterData;
    const shortId = ticketId.slice(0, 8).toUpperCase();
    const safeName = escapeHtml(name || 'Traveler');
    const safeReply = escapeHtml(adminReply).replace(/\n/g, '<br/>');

    console.log(`[CloudFunctions] Dispatching admin reply for ticket #${shortId} to ${email}`);

    const replyHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #38bdf8; padding-bottom: 10px;">WAYVORA Support Update</h2>
        <p>Hello <strong>${safeName}</strong>,</p>
        <p>An official representative from the WAYVORA Support Team has answered your inquiry (Ticket <strong>#${shortId}</strong>):</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 6px; margin: 15px 0;">
          <strong style="color: #166534;">Official Response:</strong>
          <p style="margin-top: 8px; color: #14532d;">${safeReply}</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">If you have further questions, you can reply directly to this email.</p>
        <p>Best regards,<br/><strong>WAYVORA Support Concierge</strong></p>
      </div>
    `;

    const result = await sendResendMail({
      to: email,
      subject: `[WAYVORA Update] Response to Ticket #${shortId}: ${category || 'General Support'}`,
      html: replyHtml,
      text: `Hello ${name},\n\nAn official response has been added to ticket #${shortId}:\n\n${adminReply}\n\nYou can reply directly to this email.\n\nWAYVORA Support`,
      replyTo: getAdminEmail()
    });

    return change.after.ref.update({
      replyEmailStatus: {
        sent: !!result.success,
        id: result.id || null,
        error: result.error || null,
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });
  });

/**
 * 3. Direct HTTPS Cloud Function endpoint
 */
exports.sendSupportEmail = functions.https.onRequest(async (req, res) => {
  const handler = require('../api/support.js');
  return handler(req, res);
});
