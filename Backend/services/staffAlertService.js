import { staffAlertModel } from '../models/staffAlertModel.js';

const CATEGORY_LABELS = {
  worker: 'Worker',
  owner: 'Owner',
  agent: 'Broker / Agent',
  buyer: 'Buyer',
  mission: 'Mission',
  property: 'Property',
};

export function staffCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

/** Fire-and-forget staff portal alert (admin + sub-admin share one queue). */
export async function notifyStaffAlert({ category, title, body, linkPath, referenceId }) {
  try {
    await staffAlertModel.create({
      category,
      title,
      body,
      link_path: linkPath,
      reference_id: referenceId,
    });
  } catch (err) {
    console.error('staff alert create failed:', err.message);
  }
}

export async function notifyNewUserSignup(user) {
  const role = String(user?.role || '').toLowerCase();
  const cat = ['worker', 'owner', 'agent', 'buyer'].includes(role) ? role : 'buyer';
  await notifyStaffAlert({
    category: cat,
    title: `New ${staffCategoryLabel(cat)} registered`,
    body: `${user?.name || 'User'} · ${user?.phone_number || '—'} · ${user?.email || '—'}`,
    linkPath: '/admin/users',
    referenceId: user?.id,
  });
}

export async function notifyMissionRegistration(reg) {
  await notifyStaffAlert({
    category: 'mission',
    title: 'New mission interest registration',
    body: `${reg.name} · ${reg.mobile} · ${reg.bhk} · ${reg.group_mode === 'group' ? 'Own group' : 'Match me'}`,
    linkPath: '/admin/mission',
    referenceId: reg.id,
  });
}

export async function notifyStaffPropertyListed(property, owner, staffType) {
  await notifyStaffAlert({
    category: 'property',
    title: 'Property listed by staff',
    body: `${property?.title || 'Listing'} · Owner: ${owner?.name || '—'} · ${owner?.phone_number || '—'}`,
    linkPath: staffType === 'subadmin' ? '/subadmin/properties' : '/admin/properties',
    referenceId: property?.id,
  });
}
