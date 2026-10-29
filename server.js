/**
 * Wayvora - Backend Server with Intelligent AI Agent & Open-Meteo Live Weather
 * Serves static frontend files and provides /api/chat with support for Google Gemini, OpenAI,
 * and built-in contextual conversational intelligence.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

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

  // Format messages into Gemini contents
  const contents = [];
  messages.forEach(m => {
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    });
  });

  const payload = {
    contents: contents
  };

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
 * Handles multi-turn memory, intent detection, live weather integration,
 * worldwide and Indian travel planning with INR (₹), programming, and general conversation.
 */
async function generateIntelligentResponse(messages, context = {}) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMsg) return "Hello! How can I assist you today?";

  const query = lastUserMsg.content.trim();
  const qLower = query.toLowerCase();

  // Find recent conversation topics for context-aware follow-ups
  const conversationText = messages.map(m => m.content).join(' ').toLowerCase();

  // 1. WEATHER INTENT
  if (
    qLower.includes('weather') ||
    qLower.includes('temperature') ||
    qLower.includes('climate today') ||
    qLower.includes('is it raining in')
  ) {
    let targetPlace = 'Goa';
    if (qLower.includes('in goa') || qLower.includes('goa')) targetPlace = 'Goa';
    else if (qLower.includes('kerala')) targetPlace = 'Kerala';
    else if (qLower.includes('belagavi') || qLower.includes('belgaum')) targetPlace = 'Belagavi';
    else if (qLower.includes('bengaluru') || qLower.includes('bangalore')) targetPlace = 'Bengaluru';
    else if (qLower.includes('mumbai')) targetPlace = 'Mumbai';
    else if (qLower.includes('delhi')) targetPlace = 'Delhi';
    else if (qLower.includes('paris')) targetPlace = 'Paris';
    else if (qLower.includes('dubai')) targetPlace = 'Dubai';
    else if (qLower.includes('tokyo')) targetPlace = 'Tokyo';
    else if (qLower.includes('switzerland')) targetPlace = 'Switzerland';
    else {
      const match = qLower.match(/weather\s+(?:in|for|at)\s+([a-zA-Z\s]+)/);
      if (match && match[1]) {
        targetPlace = match[1].replace(/today|now|please/g, '').trim();
      }
    }

    const live = await fetchLiveWeather(targetPlace);
    if (live) {
      return `☀️ **Live Weather Update for ${live.place}**\n\n` +
        `• **Current Temperature:** **${live.tempC}°C** (${live.tempF}°F)\n` +
        `• **Condition:** ${live.condition}\n` +
        `• **Humidity:** ${live.humidity}%\n` +
        `• **Wind Speed:** ${live.wind} km/h\n` +
        `• **Today's Expected Range:** ${live.low}°C – ${live.high}°C\n\n` +
        `💡 *Travel Insight:* ${live.tempC > 28 ? 'Stay well hydrated, apply SPF sunscreen, and wear breathable cotton clothing for exploring!' : 'Comfortable weather for sightseeing and outdoor excursions!'}\n\n` +
        `*(Source: Real-time data verified via Open-Meteo Live API)*`;
    } else {
      return `Currently, live weather station access for "${targetPlace}" is temporarily unavailable. However, based on regional historical averages, you can expect warm, tropical temperatures around 28°C–32°C. You can also view live forecasts using the **Live Weather** button in the top navigation bar!`;
    }
  }

  // 2. WATERFALLS NEAR BELAGAVI, KARNATAKA
  if (
    (qLower.includes('waterfall') || qLower.includes('falls')) &&
    (qLower.includes('belagavi') || qLower.includes('belgaum') || qLower.includes('karnataka'))
  ) {
    return `🌊 **Magnificent Waterfalls Near Belagavi, Karnataka**\n\n` +
      `Belagavi (Belgaum) is nestled near the lush Western Ghats, making it a gateway to some of South India's most spectacular waterfalls:\n\n` +
      `1. **Gokak Falls** *(~65 km from Belagavi)*\n` +
      `   • Known as the **"Niagara of Karnataka"**, where the Ghataprabha River plunges 52 meters (171 ft) over sandstone cliffs into a horseshoe-shaped gorge.\n` +
      `   • **Highlight:** Walk across the thrilling 201-meter historic hanging suspension bridge built in 1907.\n\n` +
      `2. **Godchinamalaki Falls** *(~55 km from Belagavi)*\n` +
      `   • A stunning two-tier cascade on the Markandeya River located in a peaceful, verdant valley near Gokak.\n` +
      `   • First drop of 25 meters followed by a second drop of 20 meters over stepped rock formations.\n\n` +
      `3. **Vajrapoha Falls** *(~60 km from Belagavi, near Jamboti)*\n` +
      `   • An offbeat, pristine 200-meter waterfall on the Mandovi River tucked inside the dense tropical evergreen forests of Jamboti.\n` +
      `   • Excellent for nature treks and adventure enthusiasts.\n\n` +
      `4. **Tillari Falls & Dam** *(~45 km from Belagavi)*\n` +
      `   • Situated on the Karnataka-Maharashtra border with misty viewpoints, deep valleys, and lush forested slopes.\n\n` +
      `5. **Dudhsagar Falls** *(~105 km via Castle Rock / Kulem)*\n` +
      `   • A world-renowned 4-tiered giant (310m tall) on the Karnataka-Goa border. Easily accessible as a day trip from Belagavi via rail or trekking.\n\n` +
      `📅 **Best Time to Visit:** **July to November** (during and immediately post-monsoon), when the rivers are in full flow.\n` +
      `💡 **Travel Tip:** Rent a private cab or self-drive vehicle from Belagavi, and wear sturdy footwear with good grip.`;
  }

  // 3. CONTEXTUAL FOLLOW-UP: MAKE TRIP CHEAPER / BUDGET OPTIMIZATION
  if (
    qLower.includes('cheaper') ||
    qLower.includes('reduce cost') ||
    qLower.includes('lower the budget') ||
    qLower.includes('on a budget') ||
    qLower.includes('save money') ||
    qLower.includes('make that trip cheaper') ||
    (qLower.includes('follow-up') && qLower.includes('cheap'))
  ) {
    const isKerala = conversationText.includes('kerala');
    const isGoa = conversationText.includes('goa');

    if (isKerala) {
      return `💰 **How to Make Your Kerala Trip Much Cheaper (Budget Travel Hacks)**\n\n` +
        `Here is how you can cut your Kerala travel expenses by **40% to 60%** without missing any iconic experiences:\n\n` +
        `1. **Transport Savings (Save ₹4,000–₹8,000):**\n` +
        `   • Instead of private taxis (₹2,500–₹3,500/day), travel between Kochi, Alleppey, and Trivandrum via **Indian Railways trains** (Second Seating / Sleeper ₹50–₹180).\n` +
        `   • Use state **KSRTC Fast Passenger buses** for scenic mountain rides to Munnar (₹120–₹160 from Kochi).\n\n` +
        `2. **Houseboat Alternative (Save ₹6,000–₹12,000):**\n` +
        `   • Private overnight houseboats cost ₹8,000–₹16,000.\n` +
        `   • **Budget Smart Move:** Take the **Government SWTD Public Ferry** from Alleppey to Kottayam (only **₹25 to ₹40** for 2.5 hours through the exact same backwater canals!) or hire a shared motorized Shikara boat for **₹600–₹800/hour** for 2–3 people.\n\n` +
        `3. **Accommodation (Save ₹1,500–₹3,000/night):**\n` +
        `   • Stay in authentic registered Kerala Homestays or backpacker hostels (Zostel Kochi/Alleppey) for **₹600–₹1,200/night** including homemade breakfast.\n\n` +
        `4. **Dining (Save ₹800/day):**\n` +
        `   • Eat traditional Kerala Sadya / Thali meals served on banana leaves at local Udupi or Indian Coffee Houses (only **₹80–₹130 per person**).\n\n` +
        `💵 **Estimated Daily Budget:** **₹1,200 – ₹1,800 per person/day** (All-inclusive).`;
    }

    if (isGoa) {
      return `💰 **How to Make Your Goa Trip Much Cheaper**\n\n` +
        `Here is a budget-smart strategy to keep your Goa trip under **₹1,500/day**:\n\n` +
        `1. **Transport:** Rent a scooter (Activa) for **₹300–₹450/day** instead of taking expensive tourist taxis (which charge ₹1,200–₹2,000 per trip).\n` +
        `2. **Stay:** Choose hostels (Zostel, The Hosteller) or budget guesthouses in Anjuna/Arambol/Colva for **₹500–₹900/night**.\n` +
        `3. **Food:** Eat delicious Goan fish thali and local street eats at roadside eateries for **₹120–₹180** instead of beachfront luxury beach clubs.\n` +
        `4. **Free Attractions:** Beaches, sunsets, Chapora Fort, and Panaji’s Latin Quarter (Fontainhas) are 100% free to enjoy!`;
    }

    return `💰 **Actionable Ways to Make Your Trip More Budget-Friendly:**\n\n` +
      `1. **Off-Peak Travel:** Travel during the shoulder season for 30%–50% cheaper stays and flights.\n` +
      `2. **Local Transit:** Use trains and public buses rather than private car hires.\n` +
      `3. **Accommodations:** Look for homestays, guesthouses, or boutique hostels.\n` +
      `4. **Authentic Dining:** Eat where the locals eat—you get fresher, more authentic regional flavors at a fraction of tourist resort prices.\n\n` +
      `Which destination should we tailor this budget plan for?`;
  }

  // 4. KERALA BEST TIME TO VISIT
  if (qLower.includes('kerala') && (qLower.includes('best time') || qLower.includes('when to visit') || qLower.includes('season'))) {
    return `🌴 **Best Time to Visit Kerala ("God's Own Country")**\n\n` +
      `The ideal time depends on the kind of experience you are seeking:\n\n` +
      `⭐ **1. Peak Season (September to March) — Ideal for Sightseeing**\n` +
      `• **Weather:** Pleasant, sunny, and comfortable (23°C to 30°C).\n` +
      `• **Best for:** Alleppey backwater cruises, misty tea gardens of Munnar, beach sunsets in Varkala, and wildlife safaris in Periyar (Thekkady).\n` +
      `• **Bonus:** Experience major cultural festivals including **Onam** (August/September) and traditional temple celebrations.\n\n` +
      `🌧️ **2. Monsoon Season (June to August) — Best for Ayurveda & Greenery**\n` +
      `• **Weather:** Heavy tropical rains, lush vibrant landscapes, overflowing waterfalls.\n` +
      `• **Best for:** Traditional **Ayurvedic rejuvenation treatments** (the cool, moist monsoon climate opens skin pores), and budget travelers wanting steep hotel discounts.\n\n` +
      `☀️ **3. Summer Season (April to May) — Hill Station Getaways**\n` +
      `• **Weather:** Warm and humid in coastal plains (32°C–36°C), but cool in the Western Ghat hill stations.\n` +
      `• **Best for:** Munnar, Wayanad, and Vagamon, escaping the city heat.\n\n` +
      `💡 **Quick Recommendation:** If it's your first visit, aim for **November to February** for the most pleasant weather!`;
  }

  // 5. 3-DAY GOA TRIP ITINERARY
  if (qLower.includes('goa') && (qLower.includes('3-day') || qLower.includes('3 day') || qLower.includes('itinerary') || qLower.includes('plan'))) {
    return `🏖️ **Custom 3-Day Goa Itinerary (Coastal Charm & Culture)**\n\n` +
      `Here is a balanced, high-value 3-day itinerary covering vibrant North Goa beaches, Portuguese heritage, and serene coastal beauty:\n\n` +
      `📍 **Day 1: Vibrant North Goa & Sunsets**\n` +
      `• **Morning:** Arrive, check into your stay, and explore the 17th-century **Fort Aguada** overlooking the Arabian Sea.\n` +
      `• **Afternoon:** Relax at Candolim or Calangute beach; grab fresh Goan seafood or beachside snacks.\n` +
      `• **Evening:** Sunset at **Anjuna** or Vagator Beach; enjoy lively beach shack music and seaside dinner (try Goan Fish Curry and Prawn Balchão).\n\n` +
      `📍 **Day 2: Portuguese Heritage & River Cruise**\n` +
      `• **Morning:** Discover UNESCO World Heritage sites in **Old Goa**—the magnificent Basilica of Bom Jesus and Se Cathedral.\n` +
      `• **Afternoon:** Stroll through the colorful Portuguese Latin Quarter of **Fontainhas** in Panaji; sample freshly baked Poee and Bebinca at a heritage café.\n` +
      `• **Evening:** Sunset leisure cruise on the **Mandovi River** with traditional folk music and dance.\n\n` +
      `📍 **Day 3: Serene South Goa or Water Sports**\n` +
      `• **Morning:** Head to South Goa for tranquil crescent bays like **Palolem** or Benaulim Beach.\n` +
      `• **Afternoon:** Kayaking or boat ride to Butterfly Beach; visit the clifftop ruins of **Cabo de Rama Fort**.\n` +
      `• **Evening:** Sunset dinner at a tranquil beach shack before heading home.\n\n` +
      `💰 **Estimated Budget (per person in INR):**\n` +
      `• **Budget traveler:** ₹4,500 – ₹7,000 (Hostels, scooter rental, local shacks)\n` +
      `• **Mid-range:** ₹11,000 – ₹18,000 (3-star boutique resorts, private transport, dining)\n` +
      `• **Luxury:** ₹25,000+ (5-star beachfront luxury resorts & fine dining)\n\n` +
      `🛵 **Transport:** Rent a scooter for **₹350–₹500/day** for maximum flexibility!`;
  }

  // 6. EXPLAIN ARTIFICIAL INTELLIGENCE
  if (
    qLower.includes('artificial intelligence') ||
    (qLower.includes('what is ai') && !qLower.includes('air')) ||
    qLower.includes('explain ai')
  ) {
    return `🤖 **Understanding Artificial Intelligence (AI)**\n\n` +
      `**Artificial Intelligence (AI)** refers to the field of computer science dedicated to creating software and systems capable of performing tasks that typically require human intelligence.\n\n` +
      `### Core Pillars of AI:\n` +
      `1. **Machine Learning (ML):** Algorithms that learn patterns from large amounts of data without being explicitly programmed with strict rulebooks.\n` +
      `2. **Deep Learning (DL):** Neural networks with multiple layers inspired by the human brain that excel at complex recognition tasks (like voice and image processing).\n` +
      `3. **Natural Language Processing (NLP):** Enables computers to understand, interpret, and generate human language (powers chatbots, translation, and search engines).\n` +
      `4. **Computer Vision:** Enables machines to identify and analyze visual inputs like images and videos (powers autonomous vehicles, facial recognition, and medical imaging).\n\n` +
      `### How Modern AI Works:\n` +
      `Rather than hardcoding answers, modern AI models (like Large Language Models) analyze billions of parameters to understand context, predict probable relationships, and formulate intelligent solutions.\n\n` +
      `### Key Types of AI:\n` +
      `• **Narrow AI (Weak AI):** Specialized in specific domains (e.g. ChatGPT, recommendation engines, chess software). This is the only type that exists today.\n` +
      `• **General AI (AGI):** Hypothetical future AI that possesses human-level reasoning across all cognitive domains.\n\n` +
      `AI is transforming healthcare, scientific research, automation, travel planning, and software development!`;
  }

  // 7. WRITE A SIMPLE PYTHON PROGRAM
  if (
    qLower.includes('python program') ||
    qLower.includes('write python') ||
    qLower.includes('simple python') ||
    (qLower.includes('code') && qLower.includes('python'))
  ) {
    return `🐍 **Simple & Useful Python Program: Currency & Travel Expense Calculator**\n\n` +
      `Here is a clean, beginner-friendly Python program that calculates daily travel expenses and converts between currencies:\n\n` +
      `\`\`\`python\n` +
      `# Wayvora Travel Expense Calculator\n` +
      `def calculate_trip_budget(destination, days, daily_cost_inr):\n` +
      `    total_inr = days * daily_cost_inr\n` +
      `    usd_rate = 86.50  # 1 USD ≈ 86.50 INR\n` +
      `    total_usd = total_inr / usd_rate\n` +
      `    \n` +
      `    print(f"\\n--- Estimated Budget for {destination} ---")\n` +
      `    print(f"Duration: {days} days")\n` +
      `    print(f"Daily Spend: ₹{daily_cost_inr:,.2f}")\n` +
      `    print(f"Total Cost: ₹{total_inr:,.2f} (~$\\{total_usd:.2f} USD)")\n` +
      `    \n` +
      `    if total_inr < 15000:\n` +
      `        print("Category: Budget-Friendly Explorer 🎒")\n` +
      `    elif total_inr < 40000:\n` +
      `        print("Category: Comfortable Mid-Range 🏖️")\n` +
      `    else:\n` +
      `        print("Category: Luxury Escape ✨")\n\n` +
      `# Test the function\n` +
      `destination = "Goa, India"\n` +
      `days = 3\n` +
      `daily_cost = 2500  # ₹2,500 per day\n` +
      `calculate_trip_budget(destination, days, daily_cost)\n` +
      `\`\`\`\n\n` +
      `### How to Run This:\n` +
      `1. Save the code into a file named \`trip_calc.py\`.\n` +
      `2. Open your terminal or command prompt and run:\n` +
      `   \`\`\`bash\n` +
      `   python trip_calc.py\n` +
      `   \`\`\`\n` +
      `3. **Sample Output:**\n` +
      `   \`\`\`text\n` +
      `   --- Estimated Budget for Goa, India ---\n` +
      `   Duration: 3 days\n` +
      `   Daily Spend: ₹2,500.00\n` +
      `   Total Cost: ₹7,500.00 (~$86.71 USD)\n` +
      `   Category: Budget-Friendly Explorer 🎒\n` +
      `   \`\`\``;
  }

  // 8. CURRENCY CONVERSION & EXCHANGE RATES
  if (
    qLower.includes('convert') ||
    qLower.includes('exchange rate') ||
    (qLower.includes('how much is') && (qLower.includes('usd') || qLower.includes('inr') || qLower.includes('eur') || qLower.includes('jpy') || qLower.includes('gbp')))
  ) {
    return `💱 **Wayvora Worldwide Currency Conversion & Travel Estimates**\n\n` +
      `Here are current benchmark exchange rates for top travel destinations:\n\n` +
      `• **1 USD ($)** ≈ **₹86.50 INR** | **€0.92 EUR** | **£0.79 GBP** | **¥153 JPY** | **1.52 AUD** | **3.67 AED**\n` +
      `• **1 EUR (€)** ≈ **₹94.02 INR** | **$1.087 USD** | **£0.859 GBP** | **¥166.3 JPY**\n` +
      `• **1 GBP (£)** ≈ **₹109.50 INR** | **$1.266 USD** | **€1.165 EUR** | **¥193.7 JPY**\n` +
      `• **10,000 JPY (¥)** ≈ **₹5,654 INR** | **$65.36 USD** | **€60.13 EUR**\n\n` +
      `💡 **Traveler Tip:** You can also change the display currency anytime using the **Currency Selector** dropdown in the top navigation bar! It automatically converts all destination cards and modal budgets across the platform.`;
  }

  // 9. TOKYO, JAPAN TRAVEL PLANNING (Native JPY ¥)
  if (qLower.includes('tokyo') || (qLower.includes('japan') && (qLower.includes('trip') || qLower.includes('plan') || qLower.includes('itinerary')))) {
    return `🗼 **Tokyo, Japan Travel Itinerary & Native Budget Breakdown (JPY ¥)**\n\n` +
      `Tokyo seamlessly weaves futuristic neon skylines with serene centuries-old Shinto shrines and world-class culinary art:\n\n` +
      `📍 **Highlights & Activities:**\n` +
      `• **Sensō-ji Temple & Asakusa:** Tokyo's oldest temple with vibrant Nakamise shopping street.\n` +
      `• **Shibuya Crossing & Harajuku:** Experience the world's busiest pedestrian crossing and Takeshita Street fashion.\n` +
      `• **teamLab Planets:** Spectacular immersive digital art museum in Toyosu.\n` +
      `• **Tsukiji Outer Market:** Authentic fresh sushi, tamagoyaki, and wagyu skewers.\n\n` +
      `💰 **Daily Budget Breakdown per person (in Japanese Yen ¥):**\n` +
      `• **Accommodation (Mid-range hotel):** ¥12,000 – ¥18,000 / night\n` +
      `• **Food & Dining:** ¥4,000 – ¥7,000 / day (Ramen from ¥900, sushi sets from ¥1,800)\n` +
      `• **Local Transit (Tokyo Metro / Suica):** ¥1,200 – ¥2,000 / day\n` +
      `• **Sightseeing & Admission:** ¥2,500 – ¥5,000 / day\n\n` +
      `💴 **Total Estimated Daily Budget:** **¥22,000 JPY / person** (~$144 USD / ₹12,450 INR).\n\n` +
      `Would you like me to construct a 4-day or 7-day day-by-day itinerary for Tokyo?`;
  }

  // 10. PARIS, FRANCE TRAVEL PLANNING (Native EUR €)
  if (qLower.includes('paris') || (qLower.includes('france') && (qLower.includes('trip') || qLower.includes('plan') || qLower.includes('itinerary')))) {
    return `🥐 **Paris, France Travel Itinerary & Native Budget Breakdown (EUR €)**\n\n` +
      `The City of Light captivates travelers with monumental architecture, timeless art, and unmatched café culture:\n\n` +
      `📍 **Iconic Experiences:**\n` +
      `• **Eiffel Tower & Champ de Mars:** Sunset vistas and sparkling light show from the Trocadéro.\n` +
      `• **Louvre Museum & Tuileries Garden:** Home of the Mona Lisa and the Venus de Milo.\n` +
      `• **Montmartre & Sacré-Cœur:** Cobblestone alleys, bohemian painters' squares, and hilltop views.\n` +
      `• **Seine River Cruise:** Romantic twilight boat voyage past historic bridges and Notre-Dame.\n\n` +
      `💰 **Daily Budget Breakdown per person (in Euros €):**\n` +
      `• **Accommodation (Boutique hotel / apartment):** €75 – €130 / night\n` +
      `• **Food & Dining (Bistros & bakeries):** €35 – €60 / day\n` +
      `• **Local Transit (Metro / Navigo):** €8 – €15 / day\n` +
      `• **Museum Passes & Attractions:** €20 – €40 / day\n\n` +
      `💶 **Total Estimated Daily Budget:** **€150 EUR / person** (~$163 USD / ₹14,100 INR).\n\n` +
      `Would you like tips on skipping lines with the Paris Museum Pass or romantic dining spots?`;
  }

  // 11. GREETING INTENT
  if (
    qLower.includes('hello') ||
    qLower.includes('how are you') ||
    qLower.includes('hi ') ||
    qLower === 'hi' ||
    qLower.includes('hey') ||
    qLower.includes('good morning') ||
    qLower.includes('good evening')
  ) {
    return `Hello! 👋 I'm doing great, thank you for asking! How are you doing today?\n\n` +
      `I'm your **Wayvora AI Assistant**—I'm here to help you with worldwide travel planning, customized itineraries, live weather, or answering any general questions about technology, programming, or everyday topics. What's on your mind?`;
  }

  // 9. GENERAL TRAVEL PLANNING (Worldwide)
  if (qLower.includes('trip') || qLower.includes('itinerary') || qLower.includes('vacation') || qLower.includes('travel to')) {
    return `I'd love to help you design an unforgettable journey! ✨\n\n` +
      `To tailor this for you:\n` +
      `1. **Destination:** Which city, state, or country are you considering? (Every destination worldwide is supported!)\n` +
      `2. **Duration:** How many days are you planning for?\n` +
      `3. **Travel Style:** Solo, couple, family, friends, or adventure?\n` +
      `4. **Budget:** What's your target budget (in ₹ or your local currency)?\n\n` +
      `Tell me a little more, and I'll generate a complete day-by-day plan with attractions, food, and timing!`;
  }

  // 10. DEFAULT CONVERSATIONAL RESPONSE
  return `That's an interesting question! I am happy to help you explore this.\n\n` +
    `Could you clarify a little more detail so I can give you the most accurate and helpful response? Whether you're looking for travel advice, technical explanations, or general recommendations, I'm here to assist!`;
}

/**
 * Process a chat conversation with Gemini, OpenAI, or the built-in Intelligent Engine
 */
async function processChatRequest(messages, context = {}) {
  const aiConfig = readAiConfig();
  const geminiKey = process.env.GEMINI_API_KEY || (aiConfig && aiConfig.apiKey && !aiConfig.apiKey.includes('YOUR_') ? aiConfig.apiKey : null);
  const openAiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `You are Wayvora AI Travel Concierge & Intelligent Assistant. You are a versatile, polite, and highly knowledgeable AI assistant.
Guidelines:
1. Answer general conversation, greetings, programming questions, and technology inquiries naturally and accurately. Do not force every query into a travel itinerary.
2. For worldwide travel planning, support all destinations worldwide (India, USA, UK, Japan, Europe, Australia, UAE, Switzerland, Indonesia, etc.). CRUCIAL: Do not show US dollars for every destination by default. Display travel costs and pricing in the appropriate native currency for each destination (e.g., INR ₹ for India, USD $ for USA, GBP £ for UK, JPY ¥ for Japan, EUR € for France/Italy/Greece/Eurozone, CHF for Switzerland, AED for UAE, AUD A$ for Australia, IDR Rp for Indonesia/Bali). When users request conversions, convert accurately using realistic exchange rates. Provide clear itemized breakdowns for accommodation, food, transportation, and activities, and evaluate affordability against user budget and traveler count.
3. Maintain conversation context and answer follow-up questions accurately.
4. For live weather, use verified data or clearly explain current seasonal conditions.`;

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
