import PropertyListCard from './PropertyListCard';

/** Horizontal strip of listing cards for "Recommended for you". */
const RecommendedPropertyRow = ({ properties = [], listKey }) => {
  if (!properties?.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto overscroll-x-contain px-3 pb-2 snap-x snap-mandatory lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {properties.map((property, index) => (
          <div
            key={property.id}
            className="w-[min(92vw,22rem)] shrink-0 snap-start"
          >
            <PropertyListCard property={property} listKey={listKey} listIndex={index} />
          </div>
        ))}
    </div>
  );
};

export default RecommendedPropertyRow;
