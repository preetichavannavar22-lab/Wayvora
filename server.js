/**
 * Wayvora Local Development Server & API Gateway
 * Serves static frontend files and provides /api/chat with support for Google Gemini, OpenAI,
 * and built-in contextual conversational intelligence.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const AIEngine = require('./js/ai-engine.js');

const PORT = 5500;
const PUBLIC_DIR = path.resolve(__dirname);

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webp': 'image/webp'
};

// Known coordinates for instant fast weather lookups
const LOCATION_COORDS = {
  'goa': { lat: 15.4909, lon: 73.8278, name: 'Goa', state: 'Goa', country: 'India' },
  'kerala': { lat: 9.9312, lon: 76.2673, name: 'Kerala (Kochi)', state: 'Kerala', country: 'India' },
  'belagavi': { lat: 15.8497, lon: 74.4977, name: 'Belagavi', state: 'Karnataka', country: 'India' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, name: 'Bengaluru', state: 'Karnataka', country: 'India' },
  'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai', state: 'Maharashtra', country: 'India' },
  'delhi': { lat: 28.6139, lon: 77.2090, name: 'New Delhi', state: 'Delhi', country: 'India' },
  'jaipur': { lat: 26.9124, lon: 75.7873, name: 'Jaipur', state: 'Rajasthan', country: 'India' },
  'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris', country: 'France' },
  'dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai', country: 'UAE' },
  'tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo', country: 'Japan' },
  'london': { lat: 51.5074, lon: -0.1278, name: 'London', country: 'UK' },
  'new york': { lat: 40.7128, lon: -74.0060, name: 'New York', country: 'USA' },
  'switzerland': { lat: 46.6863, lon: 7.8632, name: 'Interlaken', country: 'Switzerland' },
  'bali': { lat: -8.4095, lon: 115.1889, name: 'Bali', country: 'Indonesia' }
};

/**
 * Fetch live weather from Open-Meteo for a given place name
 */
async function fetchLiveWeather(placeName) {
  const norm = placeName.toLowerCase().trim();
  let coords = LOCATION_COORDS[norm];

  if (!coords) {
    for (const k of Object.keys(LOCATION_COORDS)) {
      if (norm.includes(k)) {
        coords = LOCATION_COORDS[k];
        break;
      }
    }
  }

  // If not in local coordinates map, try Open-Meteo Geocoding
  if (!coords) {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=1`;
      const geoData = await httpGetJson(geoUrl);
      if (geoData && geoData.results && geoData.results.length > 0) {
        const top = geoData.results[0];
        coords = {
          lat: top.latitude,
          lon: top.longitude,
          name: top.name,
          country: top.country || ''
        };
      }
    } catch (e) {
      console.warn('Geocoding lookup error:', e.message);
    }
  }

  if (!coords) {
    return null;
  }

  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const wData = await httpGetJson(weatherUrl);
    if (wData && wData.current) {
      const c = wData.current;
      const tempC = Math.round(c.temperature_2m);
      const tempF = Math.round((tempC * 9) / 5 + 32);
      const code = c.weather_code;
      const condition = getWeatherConditionString(code);
      const humidity = c.relative_humidity_2m;
      const wind = c.wind_speed_10m;
      const high = wData.daily ? Math.round(wData.daily.temperature_2m_max[0]) : tempC + 3;
      const low = wData.daily ? Math.round(wData.daily.temperature_2m_min[0]) : tempC - 4;

      return {
        place: coords.name,
        country: coords.country || 'India',
        tempC,
        tempF,
        condition,
        humidity,
        wind,
        high,
        low,
        source: 'Open-Meteo Live API'
      };
    }
  } catch (err) {
    console.warn('Weather fetch error:', err.message);
  }

  return null;
}

function getWeatherConditionString(code) {
  if (code === 0) return 'Clear Sky & Sunshine';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Misty / Foggy';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Passing Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Pleasant & Fair';
}

function httpGetJson(reqUrl) {
  return new Promise((resolve, reject) => {
    https.get(reqUrl, { headers: { 'User-Agent': 'Wayvora-Travel-Platform/1.0' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// In-memory currency cache (TTL: 1 hour)
let cachedServerCurrency = null;
let lastServerCurrencyFetchTime = 0;
const SERVER_CURRENCY_CACHE_TTL = 3600000;

async function fetchLiveCurrency(force = false) {
  const now = Date.now();
  if (!force && cachedServerCurrency && (now - lastServerCurrencyFetchTime < SERVER_CURRENCY_CACHE_TTL)) {
    return { ...cachedServerCurrency, fromCache: true };
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY || process.env.CURRENCY_API_KEY;
  const apiUrl = apiKey 
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    : `https://open.er-api.com/v6/latest/USD`;

  try {
    const data = await httpGetJson(apiUrl);
    const rawRates = data.conversion_rates || data.rates;
    if (!rawRates) throw new Error('Missing rates in response');

    cachedServerCurrency = {
      success: true,
      base: data.base_code || data.base || 'USD',
      rates: rawRates,
      timeLastUpdateUtc: data.time_last_update_utc || new Date().toUTCString(),
      timeNextUpdateUtc: data.time_next_update_utc || '',
      provider: apiKey ? 'ExchangeRate-API (Authenticated Pro)' : 'ExchangeRate-API (Live)',
      timestamp: now,
      isLive: true
    };
    lastServerCurrencyFetchTime = now;
    return cachedServerCurrency;
  } catch (err) {
    console.error('Failed to fetch live currency rates from API:', err.message);
    if (cachedServerCurrency) {
      return {
        ...cachedServerCurrency,
        isLive: false,
        isOutdated: true,
        staleReason: err.message,
        fromCache: true
      };
    }
    throw err;
  }
}

function readAiConfig() {
  try {
    const configPath = path.join(PUBLIC_DIR, 'ai-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Call Google Gemini REST API if user configured GEMINI_API_KEY
 */
async function callGeminiApi(apiKey, model, messages, systemPrompt) {
  const modelName = model || 'gemini-1.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  // Format messages into Gemini contents with alternating roles
  const contents = [];
  let currentRole = null;
  let currentParts = [];

  for (const m of messages) {
    if (!m || !m.content) continue;
    const role = m.role === 'assistant' ? 'model' : 'user';
    if (role === currentRole) {
      currentParts.push({ text: m.content });
    } else {
      if (currentRole) {
        contents.push({ role: currentRole, parts: currentParts });
      }
      currentRole = role;
      currentParts = [{ text: m.content }];
    }
  }
  if (currentRole) {
    contents.push({ role: currentRole, parts: currentParts });
  }

  // Ensure first message is user
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.shift();
  }

  const payload = { contents };
  if (systemPrompt) {
    payload.system_instruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(payload);
    const parsed = new URL(apiUrl);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.candidates && json.candidates[0] && json.candidates[0].content) {
            const reply = json.candidates[0].content.parts.map(p => p.text).join('\n');
            resolve(reply);
          } else if (json.error) {
            reject(new Error(json.error.message || 'Gemini API Error'));
          } else {
            reject(new Error('Unexpected Gemini API response structure'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

/**
 * Call OpenAI API if configured
 */
async function callOpenAiApi(apiKey, model, messages, systemPrompt) {
  const modelName = model || 'gpt-4o-mini';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const fullMessages = [];
  if (systemPrompt) {
    fullMessages.push({ role: 'system', content: systemPrompt });
  }
  messages.forEach(m => {
    fullMessages.push({ role: m.role, content: m.content });
  });

  const payload = {
    model: modelName,
    messages: fullMessages,
    temperature: 0.7
  };

  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(payload);
    const parsed = new URL(apiUrl);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.choices && json.choices[0] && json.choices[0].message) {
            resolve(json.choices[0].message.content);
          } else if (json.error) {
            reject(new Error(json.error.message || 'OpenAI API Error'));
          } else {
            reject(new Error('Unexpected OpenAI response structure'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

/**
 * Built-in Contextual Intelligence Engine
 * Multilingual, context-aware, fault-tolerant natural language travel concierge.
 * Supports English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), Hinglish, and Kanglish.
 */
async function generateIntelligentResponse(messages, context = {}) {
  try {
    return await AIEngine.processConversation(messages, fetchLiveWeather);
  } catch (err) {
    console.error('Error in built-in conversational intelligence engine:', err);
    return "Hello! I am your **Wayvora AI Assistant & Travel Concierge**. How can I help you plan your next trip or answer your travel questions today?";
  }
}
/**
 * Process a chat conversation with Gemini, OpenAI, or the built-in Intelligent Engine
 */
async function processChatRequest(messages, context = {}) {
  const aiConfig = readAiConfig();
  const geminiKey = process.env.GEMINI_API_KEY || (aiConfig && aiConfig.apiKey && !aiConfig.apiKey.includes('YOUR_') ? aiConfig.apiKey : null);
  const openAiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `You are Wayvora AI Travel Assistant & Intelligent Concierge, an advanced, highly conversational, and friendly AI assistant powered by the Wayvora travel platform.

CORE PERSONALITY & BEHAVIOUR (ChatGPT-Like):
1. Conversational & Empathetic: Speak naturally, warmly, intelligently, and helpfully—just like ChatGPT. Never sound like a rigid questionnaire or customer service form.
2. Natural Language Tolerance: Understand any broken English, spelling mistakes, typos, slang, abbreviations, and informal or incomplete sentences (e.g., "I want go Goa 3 days", "suggest cheap trip for family", "I have 10000 rupees where can I go?", "I want cold place with snow", "Plan something for me and my friends"). NEVER correct or criticize user grammar or spelling. Understand their true intent effortlessly.
3. Multilingual Fluency:
   - Fluent in English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), Hinglish (Hindi in Roman script, e.g., "mujhe 3 din ka sasta trip chahiye"), and Kanglish (Kannada in Roman script, e.g., "nange Goa trip plan madi", "nan friends jothe trip hogbeku").
   - Automatically detect the user's language and reply in the EXACT SAME language and script/style. If they switch languages, seamlessly switch with them.
4. Smart Clarification (Max ONE Question):
   - If a request is vague (e.g., "Plan a trip for me"), understand the intent and ask only ONE simple, warm follow-up question (e.g., "I'd love to help! Do you already have a destination in mind, or would you like me to recommend some great places based on your budget?").
   - If enough information is provided (e.g., "I want go Goa 3 days"), DO NOT interrogate the user! Start helping immediately with a rich, day-wise plan.
5. Context Awareness & Multi-Turn Memory:
   - Remember all previous context in this conversation (destination, days, budget, travel companions).
   - Handle follow-ups intelligently without asking the user to repeat info (e.g., if discussing Kerala and user says "Make it cheaper", adjust that same Kerala trip with budget transit, homestays, and affordable food; if user says "4 days", adjust the duration; if user says "What about food?", suggest local cuisine).
6. Practical Recommendations & Accurate Budgets:
   - Consider destination, days, budget in Indian Rupees (₹ INR) for Indian destinations or appropriate local/converted currency, travelers, style (solo, couple, family, friends), weather, and activities.
   - Provide realistic, itemized breakdowns (stay, transport, dining, sightseeing) and explain why the destination fits.
   - Distinguish realistic estimates from verified prices; never claim to have booked tickets or made hotel reservations.
7. Wayvora Integration:
   - Mention Wayvora features organically when helpful: the interactive Day-by-Day Trip Planner tab, ☀️ Live Weather tool, Multi-Currency Converter, and the India Travel Hub (64 Places).
8. Non-Travel & General Queries:
   - If user asks general questions (coding, science, technology, greetings, culture), answer naturally and accurately without forcing travel into it.`;

  let replyText = null;
  let providerUsed = 'built-in';

  // 1. Try Gemini if key is provided
  if (geminiKey) {
    try {
      replyText = await callGeminiApi(geminiKey, (aiConfig && aiConfig.model) || 'gemini-1.5-flash', messages, systemPrompt);
      providerUsed = 'gemini';
    } catch (geminiErr) {
      console.warn('Gemini API call failed, falling back to intelligent engine:', geminiErr.message);
    }
  }

  // 2. Try OpenAI if key is provided and Gemini wasn't used
  if (!replyText && openAiKey) {
    try {
      replyText = await callOpenAiApi(openAiKey, 'gpt-4o-mini', messages, systemPrompt);
      providerUsed = 'openai';
    } catch (openAiErr) {
      console.warn('OpenAI API call failed, falling back to intelligent engine:', openAiErr.message);
    }
  }

  // 3. Fallback to built-in Intelligence Engine
  if (!replyText) {
    replyText = await generateIntelligentResponse(messages, context);
    providerUsed = 'built-in-intelligence';
  }

  return {
    reply: replyText,
    provider: providerUsed,
    timestamp: new Date().toISOString()
  };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // -------------------------------------------------------------
  // API ENDPOINT: /api/chat
  // -------------------------------------------------------------
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        let messages = Array.isArray(data.messages) ? data.messages : [];
        if (messages.length === 0 && data.message) {
          const hist = Array.isArray(data.history) ? data.history : [];
          messages = [...hist, { role: 'user', content: data.message }];
        }

        if (messages.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No messages provided' }));
          return;
        }

        const result = await processChatRequest(messages, data.context || {});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));

      } catch (err) {
        console.error('Error in /api/chat:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to process AI chat request', details: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // API ENDPOINT: /api/weather
  // -------------------------------------------------------------
  if (pathname === '/api/weather' && req.method === 'GET') {
    const loc = parsedUrl.query.location || 'Goa';
    try {
      const weather = await fetchLiveWeather(loc);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(weather || { error: 'Weather not found' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // -------------------------------------------------------------
  // API ENDPOINT: /api/currency (Live Exchange Rates)
  // -------------------------------------------------------------
  if (pathname === '/api/currency' && req.method === 'GET') {
    const force = parsedUrl.query.refresh === 'true' || parsedUrl.query.force === 'true';
    try {
      const currencyData = await fetchLiveCurrency(force);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(currencyData));
    } catch (e) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Exchange rate provider temporarily unavailable',
        details: e.message
      }));
    }
    return;
  }

  // -------------------------------------------------------------
  // STATIC FILES SERVING
  // -------------------------------------------------------------
  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';

  // Security guard: Strictly block access to administrative scripts, service keys, and environment files
  const lowerReqPath = reqPath.toLowerCase();
  if (
    lowerReqPath.startsWith('/scripts') ||
    lowerReqPath.startsWith('/secrets') ||
    lowerReqPath.includes('serviceaccount') ||
    lowerReqPath.includes('credentials') ||
    lowerReqPath.endsWith('.key.json') ||
    lowerReqPath.includes('.env')
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: Access to administrative credentials and private scripts is denied.');
    return;
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

if (require.main === module) {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Wayvora Full-Stack Server running at http://127.0.0.1:${PORT}/`);
  });
}

module.exports = {
  server,
  fetchLiveWeather,
  fetchLiveCurrency,
  processChatRequest
};
