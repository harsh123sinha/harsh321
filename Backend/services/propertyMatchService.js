import { propertyModel } from '../models/propertyModel.js';
import { searchHistoryModel } from '../models/searchHistoryModel.js';
import { deliverNotification } from './notificationService.js';
import { buildSearchMatchNotification } from '../utils/notificationTemplates.js';

/**
 * Notify buyers whose search history matches a newly listed property.
 */
export async function notifyMatchingBuyers(propertyId) {
  const property = await propertyModel.findById(propertyId);
  if (!property) return { notified: 0 };

  const matches = await searchHistoryModel.findMatchingForProperty(property);
  const notifiedUsers = new Set();
  let notified = 0;

  for (const searchRow of matches) {
    if (searchRow.user_id === property.owner_id) continue;
    if (notifiedUsers.has(searchRow.user_id)) continue;

    const tpl = buildSearchMatchNotification(property, searchRow);
    const row = await deliverNotification({
      userId: searchRow.user_id,
      type: 'search_match',
      title: tpl.title,
      body: tpl.body,
      data: tpl.data,
      referenceKey: tpl.referenceKey,
      sendPush: true,
    });

    if (row) {
      notifiedUsers.add(searchRow.user_id);
      notified += 1;
    }
  }

  return { notified, candidates: matches.length };
}
