import PaginatedPropertyListing from '../components/properties/PaginatedPropertyListing';
import SearchBar from '../components/search/SearchBar';

const OtherProperties = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0a1020] text-white pb-8 pt-8 sm:pb-10 sm:pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Other Properties in Patna
          </h1>
          <p className="text-base sm:text-lg text-white/75">
            Commercial spaces, warehouses, and more
          </p>
          <div className="mt-6 sm:mt-8">
            <SearchBar variant="underline" />
          </div>
        </div>
      </div>

      <div className="py-8 sm:py-12">
        <PaginatedPropertyListing
          queryKey={['properties', 'other']}
          buildUrl={(limit, offset) => `/properties/type/other?limit=${limit}&offset=${offset}`}
          countLabel={({ total, showing }) => (
            <p>
              Showing <span className="font-semibold text-navy">{showing}</span> of{' '}
              <span className="font-semibold text-navy">{total}</span> properties
            </p>
          )}
        />
      </div>
    </div>
  );
};

export default OtherProperties;
