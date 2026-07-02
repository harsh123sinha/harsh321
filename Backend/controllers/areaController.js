import { areaModel } from '../models/areaModel.js';

export const listAreas = async (req, res) => {
  try {
    const areas = await areaModel.list();
    res.json({ success: true, areas });
  } catch (error) {
    console.error('listAreas error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addArea = async (req, res) => {
  try {
    const { name } = req.body || {};
    const n = String(name || '').trim();
    if (!n) return res.status(400).json({ error: 'Area name is required' });
    if (n.length > 120) return res.status(400).json({ error: 'Area name is too long' });
    await areaModel.add(n);
    const areas = await areaModel.list();
    res.json({ success: true, areas });
  } catch (error) {
    console.error('addArea error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

