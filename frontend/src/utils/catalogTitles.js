/** OLX-style compact header title from search filters or catalog route. */
export function buildCatalogHeaderTitle(filters = {}, catalogKind = 'search') {
  const location = filters.location ? ` in ${filters.location}` : '';
  const type = filters.type || '';
  const other = (filters.other_type || '').trim();

  if (catalogKind === 'rent') return `For Rent: Properties${location || ' in Patna'}`;
  if (catalogKind === 'buy') return `For Sale: Properties${location || ' in Patna'}`;
  if (catalogKind === 'plot') return `Plots${location || ' in Patna'}`;
  if (catalogKind === 'shop') return `Shops for Rent${location || ' in Patna'}`;
  if (catalogKind === 'other') return `Other Properties${location || ' in Patna'}`;
  if (catalogKind === 'area') return `Flats for Rent${location}`;

  const isRent = type === 'rent' || type === 'plot_lease';
  const isBuy = type === 'buy' || type === 'plot_buy' || type === 'plot';
  const tx = isRent ? 'Rent' : isBuy ? 'Sale' : 'Properties';

  if (other.toLowerCase() === 'shop') {
    return `For ${tx}: Shops${location}`;
  }
  if (other.toLowerCase() === 'flat') {
    return `For ${tx}: Flats${location}`;
  }
  if (other.toLowerCase() === 'apartment') {
    return `For ${tx}: Apartments${location}`;
  }
  if (type === 'plot' || type === 'plot_lease' || type === 'plot_buy') {
    return `Plots${location || ' in Patna'}`;
  }
  if (type === 'other') {
    return `Other: ${other || 'Properties'}${location}`;
  }

  return `For ${tx}: Houses & Apartments${location || ' in Patna'}`;
}
