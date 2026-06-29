import { workerModel } from '../models/workerModel.js';
import { workerCustomerReviewModel } from '../models/workerCustomerReviewModel.js';
import { notificationModel } from '../models/notificationModel.js';

function parseRating(value) {
  const n = parseFloat(String(value));
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.round(n * 10) / 10;
}

export const submitCustomerWorkerReview = async (req, res) => {
  try {
    const { workerId, employeeId, rating, comment, notificationId } = req.body;
    const ratingN = parseRating(rating);
    const commentText = String(comment || '').trim();

    if ((!workerId && !employeeId) || ratingN == null || !commentText) {
      return res.status(400).json({ error: 'Worker ID, rating (1–5), and comment are required' });
    }

    let worker = null;
    if (workerId) {
      worker = await workerModel.findById(parseInt(workerId, 10));
    } else {
      worker = await workerModel.findByEmployeeId(String(employeeId).trim());
    }

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    await workerCustomerReviewModel.addReview({
      workerId: worker.id,
      customerId: req.user.id,
      rating: ratingN,
      comment: commentText,
    });

    if (notificationId) {
      await notificationModel.markRead(req.user.id, notificationId);
    }

    const updated = await workerModel.findById(worker.id);

    res.status(201).json({
      success: true,
      message: 'Thank you for your review!',
      worker: {
        customerRating:
          updated.customer_rating_avg != null ? Number(updated.customer_rating_avg) : null,
        customerReviewCount: Number(updated.customer_review_count || 0),
      },
    });
  } catch (error) {
    console.error('submitCustomerWorkerReview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
