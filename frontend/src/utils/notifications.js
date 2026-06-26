const DEFAULT_PROPERTY_IMAGE = '/assets/default-property.svg';

export function getNotificationImage(data) {
  const img = data?.propertyImage;
  if (img && String(img).trim()) return String(img).trim();
  return DEFAULT_PROPERTY_IMAGE;
}

export function getNotificationPropertyPath(data) {
  if (data?.propertyUrl) return data.propertyUrl.startsWith('/') ? data.propertyUrl : `/${data.propertyUrl}`;
  if (data?.propertyId) return `/property/${data.propertyId}`;
  return null;
}

export function formatTimeAgo(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

export function showBrowserNotification({ title, body, image, url, tag }) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null;

  try {
    const n = new Notification(title, {
      body,
      icon: '/favicon.svg',
      image: image || DEFAULT_PROPERTY_IMAGE,
      tag: tag || 'harsh-notification',
      data: { url },
    });
    n.onclick = () => {
      window.focus();
      if (url) window.location.href = url;
      n.close();
    };
    return n;
  } catch {
    return null;
  }
}
