/**
 * WAYVORA - Direct Vercel Route for /api/support/reply
 * Delegates directly to centralized support handler.
 */
const handleSupportRequest = require('../support.js');

module.exports = async function(req, res) {
  return await handleSupportRequest(req, res);
};
