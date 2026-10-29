/**
 * Vercel Serverless Function: /api/currency
 * Real-time currency exchange rates proxy powered by ExchangeRate-API.
 * Securely supports optional EXCHANGE_RATE_API_KEY environment variable.
 */

const https = require('https');

// In-memory cache for serverless container lifecycle (TTL 1 hour)
let cachedData = null;
let lastFetchEpoch = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function fetchJson(endpointUrl) {
  return new Promise((resolve, reject) => {
    https.get(endpointUrl, {
      headers: {
        'User-Agent': 'Wayvora-Travel-Platform/1.0',
        'Accept': 'application/json'
      },
      timeout: 8000
    }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`API responded with HTTP status ${res.statusCode}`));
      }
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (err) {
          reject(new Error(`Failed to parse API response JSON: ${err.message}`));
        }
      });
    }).on('error', reject).on('timeout', () => {
      reject(new Error('Connection to exchange rate API timed out'));
    });
  });
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const forceRefresh = req.query?.refresh === 'true' || req.query?.force === 'true';
  const now = Date.now();

  // Return in-memory cache if still fresh and not forced
  if (!forceRefresh && cachedData && (now - lastFetchEpoch < CACHE_TTL_MS)) {
    return res.status(200).json({
      ...cachedData,
      fromCache: true
    });
  }

  // Check for private API key configured in Vercel environment variables
  const apiKey = process.env.EXCHANGE_RATE_API_KEY || process.env.CURRENCY_API_KEY;
  const endpoint = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    : `https://open.er-api.com/v6/latest/USD`;

  try {
    const data = await fetchJson(endpoint);
    const rates = data.conversion_rates || data.rates;

    if (!rates || typeof rates !== 'object') {
      throw new Error('Exchange rate API returned no conversion rates');
    }

    cachedData = {
      success: true,
      base: data.base_code || data.base || 'USD',
      rates: rates,
      timeLastUpdateUtc: data.time_last_update_utc || new Date().toUTCString(),
      timeNextUpdateUtc: data.time_next_update_utc || '',
      provider: apiKey ? 'ExchangeRate-API (Authenticated Pro)' : 'ExchangeRate-API (Live)',
      timestamp: now,
      isLive: true
    };
    lastFetchEpoch = now;

    return res.status(200).json(cachedData);
  } catch (err) {
    console.error('Failed to fetch real-time exchange rates in /api/currency:', err);

    // If live fetch fails but we have cached rates, return them with explicit outdated flag
    if (cachedData) {
      return res.status(200).json({
        ...cachedData,
        isLive: false,
        isOutdated: true,
        staleReason: err.message,
        fromCache: true
      });
    }

    return res.status(503).json({
      success: false,
      error: 'Live exchange-rate provider unavailable',
      details: err.message
    });
  }
};
