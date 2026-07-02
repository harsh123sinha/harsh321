import {
  Bath,
  Car,
  Compass,
  Layers,
  LayoutGrid,
  Sofa,
  Store,
  TreePine,
  Building2,
} from 'lucide-react';
import {
  formatIndianPrice,
  getFacingLabel,
  getFurnishingLabel,
  getShopSqftRangeLabel,
} from '../../utils/helpers';

const isShop = (property) => String(property.other_type || '').toLowerCase() === 'shop';

const isPlot = (property) =>
  property.type === 'plot' ||
  property.type === 'plot_lease' ||
  property.type === 'plot_buy' ||
  (String(property.katha || '').trim() !== '' && !property.bhk && !isShop(property));

const parkingText = (property) => {
  if (property.car_parking && property.bike_parking) return 'Car + bike';
  if (property.car_parking) return 'Car parking';
  if (property.bike_parking) return 'Bike parking';
  return '';
};

/** Icon + label rows for mobile card (2 columns below title). BHK omitted — shown on image. */
export const buildMobileIconSpecs = (property) => {
  const shop = isShop(property);
  const plot = isPlot(property);
  const items = [];

  if (shop) {
    const size = getShopSqftRangeLabel(property.shop_sqft_range);
    if (size) items.push({ Icon: Store, text: size });
    if (property.shop_road_distance) {
      items.push({ Icon: Layers, text: `Road ${property.shop_road_distance}` });
    }
    const facing = getFacingLabel(property.facing);
    if (facing) items.push({ Icon: Compass, text: facing });
    const token =
      property.shop_token_amount != null && Number(property.shop_token_amount) > 0
        ? formatIndianPrice(property.shop_token_amount)
        : '';
    if (token) items.push({ Icon: LayoutGrid, text: `Token ${token}` });
    const park = parkingText(property);
    if (park) items.push({ Icon: Car, text: park });
    return items;
  }

  if (plot) {
    if (property.katha) items.push({ Icon: LayoutGrid, text: `${property.katha} Katha` });
    const facing = getFacingLabel(property.facing);
    if (facing) items.push({ Icon: Compass, text: facing });
    if (property.floor_no) items.push({ Icon: Layers, text: `Floor ${property.floor_no}` });
    const park = parkingText(property);
    if (park) items.push({ Icon: Car, text: park });
    if (property.garden) items.push({ Icon: TreePine, text: 'Garden' });
    return items;
  }

  if (property.bathrooms != null && Number(property.bathrooms) > 0) {
    items.push({ Icon: Bath, text: `${property.bathrooms} Bath` });
  }
  const furnish = getFurnishingLabel(property.furnishing_status);
  if (furnish) items.push({ Icon: Sofa, text: furnish });
  const facing = getFacingLabel(property.facing);
  if (facing) items.push({ Icon: Compass, text: facing });
  if (property.floor_no) items.push({ Icon: Layers, text: `Floor ${property.floor_no}` });
  const balconyN = Number(property.balconies);
  if (balconyN > 0) items.push({ Icon: Building2, text: `${balconyN} Balcony` });
  const park = parkingText(property);
  if (park) items.push({ Icon: Car, text: park });
  if (property.garden) items.push({ Icon: TreePine, text: 'Garden' });

  return items;
};
