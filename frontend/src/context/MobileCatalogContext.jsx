import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const MobileCatalogContext = createContext(null);

export function MobileCatalogProvider({ children }) {
  const [filterOpen, setFilterOpen] = useState(false);

  const openFilter = useCallback(() => setFilterOpen(true), []);
  const closeFilter = useCallback(() => setFilterOpen(false), []);

  const value = useMemo(
    () => ({ filterOpen, setFilterOpen, openFilter, closeFilter }),
    [filterOpen, openFilter, closeFilter]
  );

  return (
    <MobileCatalogContext.Provider value={value}>{children}</MobileCatalogContext.Provider>
  );
}

export function useMobileCatalog() {
  const ctx = useContext(MobileCatalogContext);
  if (!ctx) {
    return {
      filterOpen: false,
      setFilterOpen: () => {},
      openFilter: () => {},
      closeFilter: () => {},
    };
  }
  return ctx;
}
