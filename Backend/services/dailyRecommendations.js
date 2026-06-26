import { searchHistoryModel } from '../models/searchHistoryModel.js';
import { propertyModel } from '../models/propertyModel.js';
import { notificationModel } from '../models/notificationModel.js';
import { deliverNotification } from './notificationService.js';
import { buildDailyRecommendationNotification } from '../utils/notificationTemplates.js';

function propertyMatchesSearch(property, search) {
  const plotTypes = ['plot', 'plot_lease', 'plot_buy'];
  const isPlot =
    plotTypes.includes(property.type) ||
    (String(property.type || '').trim() === '' && String(property.katha || '').trim() !== '');

  if (search.property_type) {
    if (isPlot && !plotTypes.includes(search.property_type) && search.property_type !== 'plot') {
      return false;
    }
    if (!isPlot && search.property_type && property.type !== search.property_type) {
      return false;
    }
  }

  if (search.bhk && property.bhk && Number(property.bhk) !== Number(search.bhk)) {
    return false;
  }

  if (search.other_type && property.other_type) {
    const s = String(search.other_type).toLowerCase();
    const p = String(property.other_type).toLowerCase();
    if (!p.includes(s) && !s.includes(p)) return false;
  }

  const loc = String(search.location || '').trim();
  if (loc) {
    const hay = `${property.location || ''} ${property.city || ''} ${property.district || ''}`.toLowerCase();
    if (!hay.includes(loc.toLowerCase())) return false;
  }

  const price = Number(property.price);
  if (Number.isFinite(price)) {
    if (search.min_price != null && price < Number(search.min_price)) return false;
    if (search.max_price != null && price > Number(search.max_price) * 1.15) return false;
  }

  return true;
}

export async function runDailyRecommendations() {
  const buyerIds = await searchHistoryModel.findBuyerIdsWithRecentSearches(30);
  let sent = 0;

  const allProperties = await propertyModel.getAll();
  const dateKey = new Date().toISOString().slice(0, 10);

  for (const userId of buyerIds) {
    const existing = await notificationModel.exists(
      userId,
      'daily_recommendation',
      `daily:${dateKey}`
    );
    if (existing) continue;

    const searches = await searchHistoryModel.findRecentByUser(userId, 30);
    if (!searches.length) continue;

    let matchCount = 0;
    for (const property of allProperties) {
      if (property.owner_id === userId) continue;
      const matchesAny = searches.some((s) => propertyMatchesSearch(property, s));
      if (matchesAny) matchCount += 1;
    }

    if (matchCount === 0) continue;

    const tpl = buildDailyRecommendationNotification(matchCount);
    tpl.referenceKey = `daily:${dateKey}`;

    const row = await deliverNotification({
      userId,
      type: 'daily_recommendation',
      title: tpl.title,
      body: tpl.body,
      data: { ...tpl.data, matchCount: String(matchCount) },
      referenceKey: tpl.referenceKey,
      sendPush: true,
    });

    if (row) sent += 1;
  }

  return { sent, buyers: buyerIds.length };
}
