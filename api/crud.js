const admin = require('firebase-admin');

function getDb() {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.FIREBASE_DATABASE_URL) {
      throw new Error('Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_DATABASE_URL env vars');
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
  return admin.database();
}

function checkAuth(req) {
  // Simple shared-secret gate. Pass via x-api-key header.
  if (!process.env.API_KEY) return true; // no key configured = open (dev only)
  return req.headers['x-api-key'] === process.env.API_KEY;
}

module.exports = async (req, res) => {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const path = String(req.query.path || '/');
  if (!path.startsWith('/')) {
    return res.status(400).json({ error: 'path must start with /' });
  }

  let db;
  try {
    db = getDb();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  const ref = db.ref(path);

  try {
    switch (req.method) {
      case 'GET': {
        const snap = await ref.once('value');
        return res.status(200).json({ path, data: snap.val() });
      }
      case 'POST': {
        // Create: push a new child under path, returns its key
        const child = await ref.push(req.body);
        return res.status(201).json({ path, key: child.key });
      }
      case 'PUT': {
        // Replace: overwrite everything at path
        await ref.set(req.body);
        return res.status(200).json({ path, ok: true });
      }
      case 'PATCH': {
        // Update: merge fields at path
        await ref.update(req.body);
        return res.status(200).json({ path, ok: true });
      }
      case 'DELETE': {
        await ref.remove();
        return res.status(200).json({ path, ok: true });
      }
      default:
        return res.status(405).json({ error: 'method not allowed' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
