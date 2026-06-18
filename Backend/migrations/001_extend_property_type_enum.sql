-- Run once against your `realestate` (or equivalent) database.
-- Fixes: new plot listings use `plot_lease` / `plot_buy` but older schemas only allowed
-- ENUM('rent','buy','other','plot'). MySQL could store `type` as '' while `katha` was set,
-- so listings appeared in "My properties" but not on /plots.

USE realestate;

ALTER TABLE properties
  MODIFY COLUMN type ENUM('rent', 'buy', 'other', 'plot', 'plot_lease', 'plot_buy') NOT NULL;

-- Repair rows that were stored with an empty type due to the old ENUM
UPDATE properties
SET type = 'plot'
WHERE TRIM(COALESCE(type, '')) = ''
  AND TRIM(COALESCE(katha, '')) <> '';

-- After this, re-save a listing in the app if you need lease vs buy restored on repaired rows.
