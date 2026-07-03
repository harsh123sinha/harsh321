import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { label: 'Rent', path: '/rent', key: 'rent' },
  { label: 'Buy', path: '/buy', key: 'buy' },
  { label: 'Plot', path: '/plots', key: 'plot' },
  { label: 'Shop', path: '/shop', key: 'shop' },
];

const ROTATE_MS = 3000;

const CategoryRotator = ({ activeKey }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const startIndex = Math.max(
    0,
    CATEGORIES.findIndex((c) => c.key === activeKey || c.path === pathname)
  );
  const [index, setIndex] = useState(startIndex >= 0 ? startIndex : 0);
  const [anim, setAnim] = useState('in');

  useEffect(() => {
    const timer = setInterval(() => {
      setAnim('out');
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % CATEGORIES.length);
        setAnim('in');
      }, 280);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  const current = CATEGORIES[index];

  return (
    <button
      type="button"
      onClick={() => navigate(current.path)}
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 touch-manipulation"
      aria-label={`Browse ${current.label} — tap to open`}
    >
      <span
        className={`block max-w-full truncate text-[10px] font-bold uppercase tracking-wide text-navy transition-all duration-300 ${
          anim === 'out' ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {current.label}
      </span>
      <span className="text-[9px] font-medium text-stone-500">Browse</span>
    </button>
  );
};

export default CategoryRotator;
