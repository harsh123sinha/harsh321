import { brokerModel } from '../models/brokerModel.js';
import { propertyModel } from '../models/propertyModel.js';
import { userModel } from '../models/userModel.js';
import { sendBrokerReviewRequest } from '../services/notificationService.js';

function parseRating(value) {
  const n = parseFloat(String(value));
  if (!Number.isFinite(n) || n < 0 || n > 5) return null;
  return Math.round(n * 10) / 10;
}

function staffFromRequest(req) {
  if (req.user?.isAdmin) {
    return { staffType: 'admin', staffId: req.user.id || 0 };
  }
  if (req.user?.isSubAdmin) {
    return { staffType: 'subadmin', staffId: req.user.id };
  }
  return null;
}

export const submitBrokerInternalRating = async (req, res) => {
  try {
    const staff = staffFromRequest(req);
    if (!staff) {
      return res.status(403).json({ error: 'Admin or sub-admin only' });
    }

    const { brokerId, propertyId, rating, customerUserId } = req.body;
    const ratingN = parseRating(rating);
    if (!brokerId || ratingN == null) {
      return res.status(400).json({ error: 'Broker ID and rating (0–5) are required' });
    }
    if (!customerUserId) {
      return res.status(400).json({ error: 'Customer user ID is required to send review request' });
    }

    const broker = await brokerModel.findByPublicId(brokerId);
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    const customer = await userModel.findById(customerUserId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer user not found' });
    }

    let property = null;
    if (propertyId) {
      property = await propertyModel.findById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
    }

    await brokerModel.addInternalRating({
      brokerDbId: broker.id,
      propertyId: property?.id || null,
      rating: ratingN,
      staffType: staff.staffType,
      staffId: staff.staffId,
      customerUserId: customer.id,
    });

    await sendBrokerReviewRequest({
      userId: customer.id,
      broker,
      propertyId: property?.id || null,
    });

    res.status(201).json({
      success: true,
      message: 'Rating saved and customer notified',
    });
  } catch (error) {
    console.error('submitBrokerInternalRating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
