import { brokerModel } from '../models/brokerModel.js';

function formatBroker(b) {
  if (!b) return null;
  return {
    id: b.id,
    brokerId: b.broker_id,
    name: b.name,
    photoUrl: b.photo_url,
    areaOfWork: b.area_of_work,
    yearsOfExperience: b.years_of_experience,
    harshRating: b.harsh_rating_avg != null ? Number(b.harsh_rating_avg) : null,
    customerRating: b.customer_rating_avg != null ? Number(b.customer_rating_avg) : null,
    customerReviewCount: Number(b.customer_review_count || 0),
    combinedScore:
      b.harsh_rating_avg != null || b.customer_rating_avg != null
        ? (Number(b.harsh_rating_avg || 0) + Number(b.customer_rating_avg || 0)) /
          (b.harsh_rating_avg != null && b.customer_rating_avg != null ? 2 : 1)
        : 0,
  };
}

export const searchBrokers = async (req, res) => {
  try {
    const area = req.query.area || '';
    // UX: when user opens /broker with empty search, show all brokers
    // (new brokers may not appear in the "top rated" limited list yet).
    const rows = await brokerModel.searchByArea(area);
    res.json({
      success: true,
      brokers: rows.map(formatBroker),
      searched: Boolean(area.trim()),
    });
  } catch (error) {
    console.error('searchBrokers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBrokerDetail = async (req, res) => {
  try {
    const broker = await brokerModel.findByPublicId(req.params.brokerId);
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }
    res.json({ success: true, broker: formatBroker(broker) });
  } catch (error) {
    console.error('getBrokerDetail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBrokerReviews = async (req, res) => {
  try {
    const broker = await brokerModel.findByPublicId(req.params.brokerId);
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }
    const reviews = await brokerModel.getCustomerReviews(broker.id);
    res.json({
      success: true,
      broker: formatBroker(broker),
      reviews: reviews.map((r) => ({
        id: r.id,
        customerName: r.customer_name,
        rating: Number(r.rating),
        comment: r.comment,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    console.error('getBrokerReviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBrokerProperties = async (req, res) => {
  try {
    const broker = await brokerModel.findByPublicId(req.params.brokerId);
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }
    const properties = await brokerModel.getPropertiesForBroker(broker.id, broker.user_id);
    res.json({
      success: true,
      broker: formatBroker(broker),
      properties,
    });
  } catch (error) {
    console.error('getBrokerProperties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const lookupBrokerByPublicId = async (req, res) => {
  try {
    const id = String(req.query.brokerId || req.query.id || '').trim();
    if (!id) {
      return res.status(400).json({ error: 'Broker ID is required' });
    }
    const broker = await brokerModel.findByPublicId(id);
    if (!broker) {
      return res.status(404).json({ error: 'Broker not found' });
    }
    res.json({ success: true, broker: formatBroker(broker) });
  } catch (error) {
    console.error('lookupBrokerByPublicId error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
