import { fcmTokenModel } from '../models/fcmTokenModel.js';
import { notificationModel } from '../models/notificationModel.js';

export const registerFcmToken = async (req, res) => {
  try {
    const { fcmToken, deviceLabel } = req.body;
    if (!fcmToken || typeof fcmToken !== 'string') {
      return res.status(400).json({ error: 'fcmToken is required' });
    }

    await fcmTokenModel.upsert(req.user.id, fcmToken.trim(), {
      deviceLabel: deviceLabel || 'web',
      userAgent: req.headers['user-agent'] || null,
    });

    res.json({ success: true, message: 'FCM token registered' });
  } catch (error) {
    console.error('Register FCM token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (fcmToken) {
      await fcmTokenModel.deleteByUserAndToken(req.user.id, fcmToken.trim());
    } else {
      await fcmTokenModel.deleteAllForUser(req.user.id);
    }
    res.json({ success: true, message: 'FCM token removed' });
  } catch (error) {
    console.error('Remove FCM token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const result = await notificationModel.listForUser(req.user.id, { page, limit });
    res.json({ success: true, ...result, page, limit });
  } catch (error) {
    console.error('List notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationModel.unreadCount(req.user.id);
    res.json({ success: true, count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await notificationModel.markRead(req.user.id, id);
    if (!ok) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await notificationModel.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
