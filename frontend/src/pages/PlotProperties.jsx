import PaginatedPropertyListing from '../components/properties/PaginatedPropertyListing';
import PropertyCatalogShell from '../components/layout/PropertyCatalogShell';
import SearchBar from '../components/search/SearchBar';

const PlotProperties = () => {
  const desktopHero = (
    <div className="bg-[#0a1020] text-white pb-8 pt-8 sm:pb-10 sm:pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
          Plots for Sale in Patna
        </h1>
        <p className="text-base sm:text-lg text-white/75">
          Find the perfect plot to build your dream home
        </p>
        <div className="mt-6 sm:mt-8">
          <SearchBar variant="underline" presetType="plot" />
        </div>
      </div>
    </div>
  );

  return (
    <PropertyCatalogShell catalogKind="plot" presetType="plot" desktopHero={desktopHero}>
      <PaginatedPropertyListing
        queryKey={['properties', 'plot']}
        buildUrl={(limit, offset) => `/properties/type/plot?limit=${limit}&offset=${offset}`}
        emptyTitle="No Plots Found"
        countLabel={({ total, showing }) => (
          <p>
            <span className="font-semibold text-navy">{total.toLocaleString('en-IN')}</span> plots
            {total > showing ? (
              <span className="text-stone-500"> · showing {showing.toLocaleString('en-IN')}</span>
            ) : null}
          </p>
        )}
      />
    </PropertyCatalogShell>
  );
};

export default PlotProperties;
