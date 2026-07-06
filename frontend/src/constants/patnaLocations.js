/** Values that mean “whole Patna / any area” — excluded from pick lists in forms. */
export const BROAD_PATNA_LOCATION_VALUES = new Set(['', 'Patna']);

export function withoutBroadPatnaOptions(options) {
  return (options || []).filter((o) => !BROAD_PATNA_LOCATION_VALUES.has(o.value));
}

/**
 * Common localities & areas in Patna (for search dropdown).
 * Chip label is "Location"; these labels appear only inside the dropdown.
 * Empty value = broad Patna / any-area style match on the backend.
 */
export const PATNA_LOCATION_OPTIONS = [
  { value: '', label: 'Any area' },
  { value: 'Patna', label: 'Patna (whole city)' },
  { value: 'Boring Road', label: 'Boring Road' },
  { value: 'Bailey Road', label: 'Bailey Road' },
  { value: 'Rajiv Nagar', label: 'Rajiv Nagar' },
  { value: 'Raja Bazar', label: 'Raja Bazar' },
  { value: 'Kankarbagh', label: 'Kankarbagh' },
  { value: 'Mithapur', label: 'Mithapur' },
  { value: 'Ramkrishna Nagar', label: 'Ramkrishna Nagar' },
  { value: 'Shastri Nagar', label: 'Shastri Nagar' },
  { value: 'Kadamkuan', label: 'Kadamkuan' },
  { value: 'Didarganj', label: 'Didarganj' },
  { value: 'Gulzarbagh', label: 'Gulzarbagh' },
  { value: 'Patna City', label: 'Patna City' },
  { value: 'Ashiana Nagar', label: 'Ashiana Nagar' },
  { value: 'Ashiana', label: 'Ashiana' },
  { value: 'Aashiyana Nagar', label: 'Aashiyana Nagar' },
  { value: 'Punaichak', label: 'Punaichak' },
  { value: 'Kumhrar', label: 'Kumhrar' },
  { value: 'Rajendra Nagar', label: 'Rajendra Nagar' },
  { value: 'Patliputra', label: 'Patliputra' },
  { value: 'Pataliputra Colony', label: 'Pataliputra Colony' },
  { value: 'Saguna More', label: 'Saguna More' },
  { value: 'Danapur', label: 'Danapur' },
  { value: 'Danapur Cantonment', label: 'Danapur Cantonment' },
  { value: 'Phulwari Sharif', label: 'Phulwari Sharif' },
  { value: 'Rupaspur', label: 'Rupaspur' },
  { value: 'Anisabad', label: 'Anisabad' },
  { value: 'Beur', label: 'Beur' },
  { value: 'Bihta', label: 'Bihta' },
  { value: 'Khagaul', label: 'Khagaul' },
  { value: 'Digha', label: 'Digha' },
  { value: 'Ramjaichak', label: 'Ramjaichak' },
  { value: 'Gandhi Maidan', label: 'Gandhi Maidan' },
  { value: 'Patna Junction Area', label: 'Patna Junction' },
  { value: 'Exhibition Road', label: 'Exhibition Road' },
  { value: 'Fraser Road', label: 'Fraser Road' },
  { value: 'Buddha Colony', label: 'Buddha Colony' },
  { value: 'Kidwaipuri', label: 'Kidwaipuri' },
  { value: 'Sri Krishna Puri', label: 'Sri Krishna Puri' },
  { value: 'New Capital Complex', label: 'New Capital Complex' },
  { value: 'Jai Prakash Narayan Park', label: 'Jai Prakash Narayan Park' },
  { value: 'Jai Prakash Narayan International Airport', label: 'Patna Airport' },
  { value: 'Samanpura', label: 'Samanpura' },
  { value: 'Hajipur', label: 'Hajipur' },
  { value: 'Sampatchak', label: 'Sampatchak' },
  { value: 'Fatuha', label: 'Fatuha' },
  { value: 'Masaurhi', label: 'Masaurhi' },
  { value: 'Naubatpur', label: 'Naubatpur' },
  { value: 'Barh', label: 'Barh (near Patna)' },
  { value: 'Munger', label: 'Munger (near Patna)' },
];

/** Locality list for forms — no “whole Patna” / “any area”. */
export const PATNA_AREA_PICK_OPTIONS = withoutBroadPatnaOptions(PATNA_LOCATION_OPTIONS);
