import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { PATNA_LOCATION_OPTIONS } from '../constants/patnaLocations';

function mergeAreaOptions(base, extra) {
  const map = new Map();
  for (const o of base) map.set(String(o.value), o);
  for (const name of extra || []) {
    const v = String(name || '').trim();
    if (!v) continue;
    if (map.has(v)) continue;
    map.set(v, { value: v, label: v });
  }
  return Array.from(map.values());
}

export function useAreaOptions() {
  const q = useQuery({
    queryKey: ['public', 'areas'],
    queryFn: async () => {
      const res = await api.get('/public/areas');
      return res.data?.areas || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  return {
    ...q,
    options: mergeAreaOptions(PATNA_LOCATION_OPTIONS, q.data),
  };
}

