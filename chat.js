/**
 * Vercel Serverless Function: /api/chat
 * Handles multi-turn AI travel concierge & general conversations
 */

const { processChatRequest } = require('../server.js');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0 && body.message) {
      const hist = Array.isArray(body.history) ? body.history : [];
      messages = [...hist, { role: 'user', content: body.message }];
    }

    if (messages.length === 0) {
      return res.status(400).json({ error: 'No messages provided' });
    }

    const context = body.context || {};
    const result = await processChatRequest(messages, context);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in Vercel /api/chat:', err);
    return res.status(500).json({
      error: 'Failed to process AI chat request',
      details: err.message
    });
  }
};
