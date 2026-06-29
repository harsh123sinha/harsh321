import { getProfessionEmoji, getServiceCategoryVisual } from '../../constants/serviceCategoryVisuals';

const SIZE_MAP = {
  xs: { box: 'h-8 w-8', emoji: 'text-sm', icon: 'h-3.5 w-3.5', radius: 'rounded-lg' },
  sm: { box: 'h-10 w-10', emoji: 'text-base', icon: 'h-4 w-4', radius: 'rounded-xl' },
  marquee: {
    box: 'h-10 w-10 sm:h-16 sm:w-16',
    emoji: 'text-sm sm:text-2xl',
    icon: 'h-4 w-4 sm:h-7 sm:w-7',
    radius: 'rounded-lg sm:rounded-2xl',
  },
  md: { box: 'h-14 w-14 sm:h-16 sm:w-16', emoji: 'text-xl sm:text-2xl', icon: 'h-6 w-6 sm:h-7 sm:w-7', radius: 'rounded-2xl' },
  lg: { box: 'h-16 w-16 sm:h-20 sm:w-20', emoji: 'text-2xl sm:text-3xl', icon: 'h-8 w-8', radius: 'rounded-2xl' },
};

/**
 * Colorful pseudo-3D tile for a service category or profession.
 * Uses category gradient + optional profession emoji override.
 */
export default function ServiceCategory3DIcon({
  categoryId,
  professionId = null,
  emoji = null,
  size = 'md',
  showLucide = false,
  className = '',
}) {
  const visual = getServiceCategoryVisual(categoryId);
  const { Icon } = visual;
  const displayEmoji =
    emoji || (professionId ? getProfessionEmoji(professionId) : visual.emoji);
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const [c1, c2, c3] = visual.gradient;

  return (
    <div
      className={`svc-3d-tile shrink-0 ${className}`}
      style={{ '--svc-shadow': visual.shadow, '--svc-glow': visual.glow }}
    >
      <div className="svc-3d-tile__cube">
        <div
          className={`svc-3d-tile__face ${s.box} ${s.radius} flex items-center justify-center`}
          style={{
            background: `linear-gradient(145deg, ${c1} 0%, ${c2} 48%, ${c3} 100%)`,
          }}
        >
          <span className={`svc-3d-tile__emoji select-none ${s.emoji}`} aria-hidden>
            {showLucide ? <Icon className={`${s.icon} text-white drop-shadow-md`} strokeWidth={1.75} /> : displayEmoji}
          </span>
          <span className="svc-3d-tile__shine" aria-hidden />
        </div>
        <span className="svc-3d-tile__depth" aria-hidden />
      </div>
    </div>
  );
}
