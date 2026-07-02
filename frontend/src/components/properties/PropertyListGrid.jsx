import PropertyListCard from './PropertyListCard';

const PropertyListGrid = ({ properties = [], className = '' }) => {
  if (!properties?.length) return null;

  return (
    <div
      className={`mx-auto grid max-w-7xl grid-cols-1 gap-2 px-3 sm:gap-3 sm:px-4 lg:grid-cols-2 lg:gap-5 lg:px-8 xl:gap-6 ${className}`}
    >
      {properties.map((property) => (
        <PropertyListCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export default PropertyListGrid;
