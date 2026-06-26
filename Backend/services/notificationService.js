import { notificationModel } from '../models/notificationModel.js';
import { userModel } from '../models/userModel.js';
import { sendPushToUser } from './fcmService.js';
import { buildWelcomeNotification } from '../utils/notificationTemplates.js';

/**
 * Create in-app notification and optionally send FCM push.
 * Returns null if duplicate (reference_key unique constraint).
 */
export async function deliverNotification({
  userId,
  type,
  title,
  body,
  data = {},
  referenceKey,
  sendPush = true,
}) {
  const row = await notificationModel.create({
    userId,
    type,
    title,
    body,
    data,
    referenceKey,
  });

  if (!row) return null;

  if (sendPush) {
    const pushResult = await sendPushToUser(userId, {
      title,
      body,
      data,
      imageUrl: data?.propertyImage,
      link: data?.absolutePropertyUrl,
    });
    if (pushResult.sent > 0) {
      await notificationModel.markPushSent(row.id);
    }
  }

  return row;
}

export async function sendWelcomeNotification(userId, userName) {
  const tpl = buildWelcomeNotification(userName);
  return deliverNotification({
    userId,
    type: 'welcome',
    title: tpl.title,
    body: tpl.body,
    data: tpl.data,
    referenceKey: tpl.referenceKey,
    sendPush: true,
  });
}

export async function sendWelcomeAfterSignup(userId) {
  const user = await userModel.findById(userId);
  if (!user) return null;
  return sendWelcomeNotification(userId, user.name);
}
