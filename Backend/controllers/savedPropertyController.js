import { savedPropertyModel } from '../models/savedPropertyModel.js';
import { propertyModel } from '../models/propertyModel.js';

export const listSavedProperties = async (req, res) => {
  try {
    const properties = await savedPropertyModel.findByUserId(req.user.id);
    res.json({ success: true, properties, count: properties.length });
  } catch (error) {
    console.error('List saved properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSavedPropertyIds = async (req, res) => {
  try {
    const ids = await savedPropertyModel.getIdsByUserId(req.user.id);
    res.json({ success: true, ids });
  } catch (error) {
    console.error('Get saved property ids error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const saveProperty = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    if (!Number.isFinite(propertyId)) {
      return res.status(400).json({ error: 'Invalid property id' });
    }

    const property = await propertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await savedPropertyModel.add(req.user.id, propertyId, property.price);
    res.status(201).json({
      success: true,
      message: 'Property saved to your bookmarks',
      propertyId,
    });
  } catch (error) {
    console.error('Save property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unsaveProperty = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId, 10);
    if (!Number.isFinite(propertyId)) {
      return res.status(400).json({ error: 'Invalid property id' });
    }

    const removed = await savedPropertyModel.remove(req.user.id, propertyId);
    if (!removed) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({
      success: true,
      message: 'Property removed from bookmarks',
      propertyId,
    });
  } catch (error) {
    console.error('Unsave property error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
