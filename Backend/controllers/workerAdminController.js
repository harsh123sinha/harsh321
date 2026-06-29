import { workerModel } from '../models/workerModel.js';
import { workerReviewModel } from '../models/workerReviewModel.js';
import { workerCustomerReviewModel } from '../models/workerCustomerReviewModel.js';
import { userModel } from '../models/userModel.js';
import { sendWorkerReviewRequest } from '../services/notificationService.js';

function parseRating(value) {
  const n = parseFloat(String(value));
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
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

export const submitWorkerInternalReview = async (req, res) => {
  try {
    const staff = staffFromRequest(req);
    if (!staff) {
      return res.status(403).json({ error: 'Admin or sub-admin only' });
    }

    const workerId = parseInt(req.params.workerId, 10);
    const { rating, customerUserId } = req.body;
    const ratingN = parseRating(rating);

    if (!workerId) {
      return res.status(400).json({ error: 'Valid worker ID is required' });
    }
    if (ratingN == null) {
      return res.status(400).json({ error: 'Rating (1–5) is required' });
    }
    if (!customerUserId) {
      return res.status(400).json({ error: 'Customer user ID is required to send review request' });
    }

    const worker = await workerModel.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const customer = await userModel.findById(customerUserId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer user not found' });
    }

    await workerReviewModel.addInternalRating({
      workerId,
      rating: ratingN,
      staffType: staff.staffType,
      staffId: staff.staffId,
      customerUserId: customer.id,
    });

    await sendWorkerReviewRequest({
      userId: customer.id,
      worker,
    });

    const updated = await workerModel.findById(workerId);

    res.status(201).json({
      success: true,
      message: 'Rating saved and customer notified',
      harsh_rating_avg:
        updated?.harsh_rating_avg != null ? Number(updated.harsh_rating_avg) : null,
      review_count: Number(updated?.review_count || 0),
    });
  } catch (error) {
    console.error('submitWorkerInternalReview:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWorkerReviewsAdmin = async (req, res) => {
  try {
    const staff = staffFromRequest(req);
    if (!staff) {
      return res.status(403).json({ error: 'Admin or sub-admin only' });
    }

    const workerId = parseInt(req.params.workerId, 10);
    if (!workerId) {
      return res.status(400).json({ error: 'Valid worker ID is required' });
    }

    const worker = await workerModel.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    const internalReviews = await workerReviewModel.findByWorkerId(workerId);
    const customerReviews = await workerCustomerReviewModel.findByWorkerId(workerId);

    res.json({
      success: true,
      internalReviews,
      customerReviews,
      harsh_rating_avg: worker.harsh_rating_avg != null ? Number(worker.harsh_rating_avg) : null,
      review_count: Number(worker.review_count || 0),
      customer_rating_avg:
        worker.customer_rating_avg != null ? Number(worker.customer_rating_avg) : null,
      customer_review_count: Number(worker.customer_review_count || 0),
    });
  } catch (error) {
    console.error('getWorkerReviewsAdmin:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
