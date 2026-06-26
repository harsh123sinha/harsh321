import { getImageUrl } from '../../utils/api';
import {
  getNotificationImage,
  formatTimeAgo,
} from '../../utils/notifications';

const NotificationItem = ({ notification, onClick, compact = false }) => {
  const { data, title, body, created_at, is_read } = notification;
  const imageSrc = getImageUrl(getNotificationImage(data));
  const hasProperty = Boolean(data?.propertyId);
  const subtitle = data?.typeLabel || data?.propertyTitle;
  const location = data?.propertyLocation;
  const price = data?.propertyPriceLabel;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
        compact ? 'px-4 py-3' : 'px-5 py-4'
      } ${!is_read ? 'bg-gold/5' : ''} ${!is_read && !compact ? 'border-l-4 border-l-gold' : ''}`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/assets/default-property.svg';
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-navy line-clamp-1 ${compact ? 'text-sm' : 'text-base'}`}>
            {title}
          </p>

          {hasProperty ? (
            <>
              {subtitle && (
                <p className={`text-navy/90 mt-0.5 line-clamp-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {subtitle}
                </p>
              )}
              {location && (
                <p className={`text-gray line-clamp-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {location}
                </p>
              )}
              {price && (
                <p className={`font-semibold text-gold mt-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {price}
                </p>
              )}
            </>
          ) : (
            <p className={`text-gray mt-0.5 line-clamp-2 whitespace-pre-line ${compact ? 'text-xs' : 'text-sm'}`}>
              {body}
            </p>
          )}

          <p className={`text-gray/70 mt-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {formatTimeAgo(created_at)}
          </p>
        </div>
      </div>
    </button>
  );
};

export default NotificationItem;
