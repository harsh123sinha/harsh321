import { brokerModel } from '../models/brokerModel.js';
import { notificationModel } from '../models/notificationModel.js';

function parseRating(value) {
  const n = parseFloat(String(value));
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.round(n * 10) / 10;
}

export const submitCustomerBrokerReview = async (req, res) => {
  try {
    const { brokerId, propertyId, rating, comment, notificationId } = req.body;
    const ratingN = parseRating(rating);
    const commentText = String(comment || '').trim();

    if (!brokerId || ratingN == null || !commentText) {
      return res.status(400).json({ error: 'Broker ID, rating (1–5), and comment are required' });
    }

    const broker = await brokerModel.findByPublicId(brokerId);
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }

    await brokerModel.addCustomerReview({
      brokerDbId: broker.id,
      customerId: req.user.id,
      propertyId: propertyId ? parseInt(propertyId, 10) : null,
      rating: ratingN,
      comment: commentText,
    });

    if (notificationId) {
      await notificationModel.markRead(req.user.id, notificationId);
    }

    const updated = await brokerModel.findById(broker.id);

    res.status(201).json({
      success: true,
      message: 'Thank you for your review!',
      broker: {
        customerRating: updated.customer_rating_avg != null ? Number(updated.customer_rating_avg) : null,
        customerReviewCount: Number(updated.customer_review_count || 0),
      },
    });
  } catch (error) {
    console.error('submitCustomerBrokerReview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
