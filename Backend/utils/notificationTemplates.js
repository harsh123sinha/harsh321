import {
  buildPropertyNotificationData,
  formatPropertyPriceLabel,
  formatPropertyTypeLabel,
  buildPropertyLocationLabel,
} from './notificationPropertyMeta.js';

export function buildWelcomeNotification(userName) {
  const name = String(userName || 'there').trim() || 'there';
  return {
    title: '🏠 Welcome to Harsh To Let Services',
    body: `Hello ${name},\n\nWelcome to Harsh To Let Services.\n\nनमस्ते, Harsh To Let Services में आपका स्वागत है।\n\nLet's find your dream home together.`,
    referenceKey: 'welcome',
    data: { type: 'welcome' },
  };
}

export function buildSearchMatchNotification(property, searchRow) {
  const meta = buildPropertyNotificationData(property);
  const typeLabel = formatPropertyTypeLabel(property);
  const loc = buildPropertyLocationLabel(property) || searchRow.location || 'your area';
  const priceLabel = formatPropertyPriceLabel(property);

  return {
    title: '🏠 New Property Match Found',
    body: `${typeLabel} available in ${loc} • ${priceLabel}`,
    referenceKey: `match:property:${property.id}:search:${searchRow.id}`,
    data: {
      type: 'search_match',
      ...meta,
    },
    imageUrl: meta.propertyImage,
    link: meta.absolutePropertyUrl,
  };
}

export function buildDailyRecommendationNotification(matchCount) {
  const n = Number(matchCount) || 0;
  return {
    title: '🏠 New Recommendations Available',
    body:
      n > 0
        ? `Based on your recent searches, we found ${n} new ${n === 1 ? 'property' : 'properties'} matching your preferences.`
        : 'Based on your recent searches, we found new properties matching your preferences.',
    referenceKey: `daily:${new Date().toISOString().slice(0, 10)}`,
    data: { type: 'daily_recommendation' },
  };
}
