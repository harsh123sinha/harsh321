import { missionRegistrationModel } from '../models/missionRegistrationModel.js';
import { notifyMissionRegistration } from '../services/staffAlertService.js';

function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(String(mobile || '').replace(/\D/g, ''));
}

function isValidPincode(pincode) {
  if (!pincode) return true;
  return /^\d{6}$/.test(String(pincode).trim());
}

function generateGroupCode() {
  return `HTLS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const registerMissionInterest = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      groupMode,
      groupCode,
      area,
      pincode,
      bhk,
      floor,
      familySize,
      fundsRange,
      timeline,
      consent,
    } = req.body;

    const mobileDigits = String(mobile || '').replace(/\D/g, '');

    if (!String(name || '').trim()) {
      return res.status(400).json({ error: 'Full name is required.' });
    }
    if (!isValidMobile(mobileDigits)) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
    }
    if (!['match', 'group'].includes(groupMode)) {
      return res.status(400).json({ error: 'Select Match Me or I Have My Own Group.' });
    }
    if (!String(bhk || '').trim()) {
      return res.status(400).json({ error: 'BHK preference is required.' });
    }
    if (!String(fundsRange || '').trim()) {
      return res.status(400).json({ error: 'Money in hand range is required.' });
    }
    if (!consent) {
      return res.status(400).json({ error: 'You must accept the consent statement.' });
    }
    if (!isValidPincode(pincode)) {
      return res.status(400).json({ error: 'Pincode must be 6 digits.' });
    }

    const finalGroupCode =
      groupMode === 'group'
        ? String(groupCode || '').trim() || generateGroupCode()
        : null;

    const id = await missionRegistrationModel.create({
      name: String(name).trim(),
      mobile: mobileDigits,
      email: String(email || '').trim() || null,
      group_mode: groupMode,
      group_code: finalGroupCode,
      area: String(area || '').trim() || null,
      pincode: String(pincode || '').trim() || null,
      bhk: String(bhk).trim(),
      floor_pref: floor || null,
      family_size: familySize || null,
      funds_range: fundsRange,
      timeline: timeline || null,
      consent: true,
    });

    const reg = {
      id,
      name: String(name).trim(),
      mobile: mobileDigits,
      bhk: String(bhk).trim(),
      group_mode: groupMode,
    };
    notifyMissionRegistration(reg);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your interest is registered. Our team will contact you soon.',
      registrationId: id,
      groupCode: finalGroupCode,
    });
  } catch (error) {
    console.error('Mission register error:', error);
    res.status(500).json({ error: 'Could not save registration. Please try again.' });
  }
};

export const adminListMissionRegistrations = async (req, res) => {
  try {
    const rows = await missionRegistrationModel.findAll({
      status: req.query.status,
      q: req.query.q,
    });
    res.json({ success: true, registrations: rows });
  } catch (error) {
    console.error('List mission registrations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const adminUpdateMissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'matched', 'closed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await missionRegistrationModel.updateStatus(req.params.id, status);
    res.json({ success: true });
  } catch (error) {
    console.error('Update mission status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
