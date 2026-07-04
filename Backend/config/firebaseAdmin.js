import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let initialized = false;

function loadServiceAccount() {
  const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (jsonPath) {
    const abs = resolve(jsonPath);
    if (!existsSync(abs)) {
      console.warn(`⚠️  Firebase service account file not found: ${abs}`);
      return null;
    }
    try {
      return JSON.parse(readFileSync(abs, 'utf8'));
    } catch (err) {
      console.warn('⚠️  Failed to read Firebase service account:', err.message);
      return null;
    }
  }

  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline) {
    return JSON.parse(inline);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
    return { project_id: projectId, client_email: clientEmail, private_key: privateKey };
  }

  return null;
}

export function isFirebaseConfigured() {
  return Boolean(loadServiceAccount());
}

export function getFirebaseAdmin() {
  if (initialized) return admin;

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    return null;
  }

  admin.initializeApp({
    credential: admin.cert(serviceAccount),
  });
  initialized = true;
  return admin;
}
