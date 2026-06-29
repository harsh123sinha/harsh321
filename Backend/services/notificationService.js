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

export async function sendBrokerReviewRequest({ userId, broker, propertyId }) {
  const referenceKey = `broker_review_${broker.id}_${propertyId || 'general'}_${Date.now()}`;
  return deliverNotification({
    userId,
    type: 'broker_review_request',
    title: 'Review your broker',
    body: 'Please kindly review our broker.',
    data: {
      type: 'broker_review_request',
      openReviewModal: true,
      brokerId: broker.broker_id,
      brokerDbId: broker.id,
      brokerName: broker.name,
      brokerPhoto: broker.photo_url || null,
      propertyId: propertyId || null,
    },
    referenceKey,
    sendPush: true,
  });
}

export async function sendWorkerReviewRequest({ userId, worker }) {
  const referenceKey = `worker_review_${worker.id}_${Date.now()}`;
  return deliverNotification({
    userId,
    type: 'worker_review_request',
    title: 'Review your service provider',
    body: 'Please share your experience with our vendor.',
    data: {
      type: 'worker_review_request',
      openWorkerReviewModal: true,
      workerId: worker.id,
      employeeId: worker.employee_id || null,
      workerName: worker.name,
      workerPhoto: worker.worker_image_url || worker.hall_image_url || null,
      workerProfession: worker.profession || null,
    },
    referenceKey,
    sendPush: true,
  });
}
