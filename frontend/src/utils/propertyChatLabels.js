/**
 * Who the buyer chats with for this listing (owner / agent / office).
 */
export function getPropertyChatPartnerLabel(property) {
  if (!property) return 'owner';
  if (property.listed_by_staff) return 'Harsh To Let';
  const role = String(property.owner_role || '').toLowerCase();
  if (role === 'agent') return 'agent';
  if (role === 'owner') return 'owner';
  return 'owner';
}

/** Full CTA: "Chat with owner" / "Chat with agent" / "Chat with Harsh To Let" */
export function getPropertyChatButtonLabel(property, { busy = false } = {}) {
  if (busy) return 'Opening…';
  const who = getPropertyChatPartnerLabel(property);
  return `Chat with ${who}`;
}

/** Compact card CTA: "with owner" / "with agent" / "with office" */
export function getPropertyChatCompactLabel(property) {
  if (property?.listed_by_staff) return 'with office';
  const role = String(property?.owner_role || '').toLowerCase();
  if (role === 'agent') return 'with agent';
  return 'with owner';
}
