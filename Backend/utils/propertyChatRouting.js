/**
 * Decide who receives buyer inquiries for a property listing.
 */
export function resolvePropertyChatRoute(property) {
  const staff = property?.listed_by_staff;
  if (staff === 'admin' || staff === 'subadmin') {
    return {
      channel: 'staff',
      listed_by_staff: staff,
      recipient_user_id: null,
    };
  }

  const ownerId = property?.owner_id;
  if (!ownerId) {
    return {
      channel: 'staff',
      listed_by_staff: 'admin',
      recipient_user_id: null,
    };
  }

  const role = String(property.owner_role || '').toLowerCase();
  if (role === 'agent') {
    return { channel: 'agent', recipient_user_id: ownerId, listed_by_staff: null };
  }

  return { channel: 'owner', recipient_user_id: ownerId, listed_by_staff: null };
}

export function buildPropertyChatFirstMessage(property) {
  const location = [property?.location, property?.city].filter(Boolean).join(', ') || 'Patna';
  const other = String(property?.other_type || '').toLowerCase();

  let label = 'property';
  if (property?.listing_kind === 'project') {
    label = 'project';
  } else if (other === 'shop') {
    label = 'shop';
  } else if (other === 'plot' || ['plot', 'plot_lease', 'plot_buy'].includes(property?.type)) {
    label = 'plot';
  } else if (property?.bhk) {
    label = `${property.bhk} BHK flat`;
  } else if (other === 'flat') {
    label = 'flat';
  } else if (other === 'apartment') {
    label = 'apartment';
  }

  return `Hi, is this ${label} in ${location} still available?`;
}

export function chatRecipientLabel(property, route) {
  if (route.channel === 'staff') {
    return 'Harsh To Let Services';
  }
  if (route.channel === 'agent') {
    return property?.owner_name ? `Agent ${property.owner_name}` : 'Listing agent';
  }
  return property?.owner_name ? `Owner ${property.owner_name}` : 'Property owner';
}
