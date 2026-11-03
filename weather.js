/**
 * Vercel Serverless Function: /api/weather
 * Queries real-time weather from Open-Meteo API
 */

const { fetchLiveWeather } = require('../server.js');

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const location = req.query?.location || req.query?.place || 'Goa';

  try {
    const weather = await fetchLiveWeather(location);
    if (!weather) {
      return res.status(404).json({ error: `Weather not found for location: ${location}` });
    }
    return res.status(200).json(weather);
  } catch (err) {
    console.error('Error in Vercel /api/weather:', err);
    return res.status(500).json({
      error: 'Failed to fetch weather',
      details: err.message
    });
  }
};
