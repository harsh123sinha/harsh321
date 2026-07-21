import { staffAlertModel } from '../models/staffAlertModel.js';

const CATEGORY_LABELS = {
  worker: 'Worker',
  owner: 'Owner',
  agent: 'Broker / Agent',
  buyer: 'Buyer',
  mission: 'Mission',
  property: 'Property',
  demand: 'User demand',
  chat: 'Property chat',
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

export async function notifyUserDemand(demand) {
  await notifyStaffAlert({
    category: 'demand',
    title: 'New user property demand',
    body: `${demand.contact_phone} · ${demand.category}${demand.location ? ` · ${demand.location}` : ''}`,
    linkPath: '/admin/demands',
    referenceId: demand.id,
  });
}

export async function notifyStaffPropertyChat({
  chatId,
  propertyId,
  buyerName,
  buyerPhone,
  propertyTitle,
  preview,
}) {
  await notifyStaffAlert({
    category: 'chat',
    title: 'New property chat inquiry',
    body: `${buyerName || 'Buyer'} · ${buyerPhone || '—'} · ${propertyTitle || 'Listing'} · ${preview || ''}`,
    linkPath: `/admin/property-chats/${chatId}`,
    referenceId: chatId,
  });
}

export async function notifyStaffPropertyListed(property, owner, staffType) {
  const contactPhone =
    property?.belongs_to_phone || owner?.phone_number || '—';
  const contactName = owner?.name || 'Client owner';
  await notifyStaffAlert({
    category: 'property',
    title: 'Property listed by staff',
    body: `${property?.title || 'Listing'} · Belongs to: ${contactName} · ${contactPhone}`,
    linkPath: staffType === 'subadmin' ? '/subadmin/properties' : '/admin/properties',
    referenceId: property?.id,
  });
}
