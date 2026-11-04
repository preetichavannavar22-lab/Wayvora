const { initFirebaseAdmin } = require('../api/firebase-admin.js');
const { app } = initFirebaseAdmin();

async function updateAuthorizedDomains() {
  try {
    const token = await app.options.credential.getAccessToken();
    console.log("Token acquired.");

    const newDomains = [
      'localhost',
      'wayvora-96c3d.firebaseapp.com',
      'wayvora-96c3d.web.app',
      'wayvora-jade.vercel.app',
      'wayvora.vercel.app'
    ];

    const payload = JSON.stringify({
      authorizedDomains: newDomains
    });

    const https = require('https');
    const req = https.request('https://identitytoolkit.googleapis.com/admin/v2/projects/wayvora-96c3d/config?updateMask=authorizedDomains', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log("Status:", res.statusCode);
        console.log("Response:", data);
      });
    });

    req.write(payload);
    req.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

updateAuthorizedDomains();
