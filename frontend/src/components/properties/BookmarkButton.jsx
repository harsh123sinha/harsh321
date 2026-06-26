import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useBookmarks } from '../../hooks/useBookmarks';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const BookmarkButton = ({ propertyId, size = 'md', className = '', showLabel = false }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark, isToggling } = useBookmarks();
  const saved = isBookmarked(propertyId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save properties');
      navigate('/login');
      return;
    }

    try {
      await toggleBookmark(propertyId);
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isToggling}
      aria-label={saved ? 'Remove bookmark' : 'Save property'}
      title={saved ? 'Remove from saved' : 'Save property'}
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors disabled:opacity-60 ${className}`}
    >
      <Bookmark
        className={`${sizeMap[size] || sizeMap.md} ${saved ? 'fill-gold text-gold' : 'text-current'}`}
        aria-hidden
      />
      {showLabel && (
        <span className="text-sm font-medium">{saved ? 'Saved' : 'Save'}</span>
      )}
    </button>
  );
};

export default BookmarkButton;
