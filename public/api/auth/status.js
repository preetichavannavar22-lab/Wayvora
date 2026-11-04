const handleAuthRequest = require('../auth.js');

module.exports = async function(req, res) {
  return await handleAuthRequest(req, res);
};
