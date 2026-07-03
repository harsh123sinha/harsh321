import { staffAlertModel } from '../models/staffAlertModel.js';

export const getStaffAlerts = async (req, res) => {
  try {
    const [alerts, unreadCount] = await Promise.all([
      staffAlertModel.listRecent(40),
      staffAlertModel.unreadCount(),
    ]);
    res.json({ success: true, alerts, unreadCount });
  } catch (error) {
    console.error('getStaffAlerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markStaffAlertRead = async (req, res) => {
  try {
    await staffAlertModel.markRead(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAllStaffAlertsRead = async (req, res) => {
  try {
    await staffAlertModel.markAllRead();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
