import { getFirebaseAdmin, isFirebaseConfigured } from '../config/firebaseAdmin.js';
import { fcmTokenModel } from '../models/fcmTokenModel.js';
import { getDefaultPropertyImageUrl, getFrontendOrigin } from '../utils/notificationPropertyMeta.js';

const INVALID_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

function resolvePushImage(imageUrl) {
  const img = String(imageUrl || '').trim();
  if (!img) return getDefaultPropertyImageUrl();
  if (/^https?:\/\//i.test(img)) return img;
  const origin = getFrontendOrigin();
  return `${origin}${img.startsWith('/') ? '' : '/'}${img}`;
}

function resolvePushLink(data = {}) {
  if (data.absolutePropertyUrl) return String(data.absolutePropertyUrl);
  if (data.propertyUrl) {
    const path = String(data.propertyUrl);
    if (path.startsWith('http')) return path;
    return `${getFrontendOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
  }
  if (data.propertyId) return `${getFrontendOrigin()}/property/${data.propertyId}`;
  return getFrontendOrigin();
}

export async function sendPushToUser(userId, { title, body, data = {}, imageUrl, link } = {}) {
  if (!isFirebaseConfigured()) {
    return { sent: 0, skipped: true, reason: 'firebase_not_configured' };
  }

  const admin = getFirebaseAdmin();
  if (!admin) {
    return { sent: 0, skipped: true, reason: 'firebase_init_failed' };
  }

  const tokens = await fcmTokenModel.findByUserId(userId);
  if (!tokens.length) {
    return { sent: 0, skipped: true, reason: 'no_tokens' };
  }

  const image = resolvePushImage(imageUrl || data.propertyImage);
  const clickLink = link || resolvePushLink(data);

  const stringData = Object.fromEntries(
    Object.entries({
      ...data,
      propertyImage: image,
      absolutePropertyUrl: clickLink,
    }).map(([k, v]) => [k, v == null ? '' : String(v)])
  );

  let sent = 0;
  const errors = [];

  for (const row of tokens) {
    try {
      await admin.messaging().send({
        token: row.fcm_token,
        notification: {
          title,
          body,
          imageUrl: image,
        },
        data: stringData,
        webpush: {
          notification: {
            title,
            body,
            icon: `${getFrontendOrigin()}/favicon.svg`,
            image,
          },
          fcmOptions: {
            link: clickLink,
          },
        },
        android: {
          priority: 'high',
          notification: {
            imageUrl: image,
            clickAction: clickLink,
          },
        },
      });
      sent += 1;
    } catch (err) {
      const code = err.code || err.errorInfo?.code;
      if (INVALID_TOKEN_CODES.has(code)) {
        await fcmTokenModel.deleteToken(row.fcm_token);
      } else {
        errors.push({ token: row.fcm_token.slice(0, 12), code, message: err.message });
      }
    }
  }

  return { sent, errors };
}
