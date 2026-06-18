import PropertyCard from './PropertyCard';

const PropertyCarousel = ({ properties }) => {
  if (!properties?.length) return null;
  return (
    <div className="-mx-1">
      <p className="mb-2 text-xs font-medium text-slate-600">Swipe for more →</p>
      <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 snap-x snap-mandatory scrollbar-thin touch-pan-x [-webkit-overflow-scrolling:touch]">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </div>
  );
};

export default PropertyCarousel;
