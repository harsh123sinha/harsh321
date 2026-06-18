/**
 * Maps Add/Manage property UI (same categories as SearchBar TYPE) to API `type` + `other_type`.
 */

export const ADD_PROPERTY_CATEGORIES = [
  { id: 'homes', label: 'Homes & flats' },
  { id: 'plot', label: 'Plot' },
  { id: 'shop', label: 'Shop' },
  { id: 'flat', label: 'Flat' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'other', label: 'Other' },
];

/**
 * @param {{ category: string, transaction: string, plotTransaction: string, otherDescription: string }}
 * @returns {{ type: string, other_type: string }}
 */
export function mapAddPropertyToApiType({
  category,
  transaction,
  plotTransaction,
  otherDescription,
}) {
  const ot = String(otherDescription || '').trim();
  switch (category) {
    case 'plot':
      return plotTransaction === 'buy'
        ? { type: 'plot_buy', other_type: '' }
        : { type: 'plot_lease', other_type: '' };
    case 'other':
      return { type: 'other', other_type: ot };
    case 'shop':
      return { type: transaction === 'buy' ? 'buy' : 'rent', other_type: 'Shop' };
    case 'flat':
      return { type: transaction === 'buy' ? 'buy' : 'rent', other_type: 'Flat' };
    case 'apartment':
      return { type: transaction === 'buy' ? 'buy' : 'rent', other_type: 'Apartment' };
    default: {
      const otd = String(otherDescription || '').trim();
      return { type: transaction === 'buy' ? 'buy' : 'rent', other_type: otd };
    }
  }
}

/**
 * Reverse map for editing an existing row.
 * @returns {{ category: string, transaction: string, plotTransaction: string, otherDescription: string }}
 */
export function mapPropertyRowToCategoryForm(property) {
  const t = String(property?.type || '').trim();
  const kathaPresent = property?.katha != null && String(property.katha).trim() !== '';

  if (t === 'plot_buy') {
    return { category: 'plot', transaction: 'rent', plotTransaction: 'buy', otherDescription: '' };
  }
  if (t === 'plot_lease' || t === 'plot' || (t === '' && kathaPresent)) {
    return { category: 'plot', transaction: 'rent', plotTransaction: 'lease', otherDescription: '' };
  }
  if (t === 'other') {
    return {
      category: 'other',
      transaction: 'rent',
      plotTransaction: 'lease',
      otherDescription: String(property.other_type || ''),
    };
  }
  const ot = String(property?.other_type || '').trim();
  const tx = t === 'buy' ? 'buy' : 'rent';
  if (ot === 'Shop') return { category: 'shop', transaction: tx, plotTransaction: 'lease', otherDescription: '' };
  if (ot === 'Flat') return { category: 'flat', transaction: tx, plotTransaction: 'lease', otherDescription: '' };
  if (ot === 'Apartment') return { category: 'apartment', transaction: tx, plotTransaction: 'lease', otherDescription: '' };
  if ((t === 'rent' || t === 'buy') && ot) {
    return { category: 'homes', transaction: tx, plotTransaction: 'lease', otherDescription: ot };
  }
  return { category: 'homes', transaction: tx, plotTransaction: 'lease', otherDescription: '' };
}
