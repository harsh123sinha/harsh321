-- =============================================================================
-- UPGRADE EXISTING DATABASE — run on your OLD `realestate` data
-- =============================================================================
-- Do not run this on a DB you just created with 00_fresh_install.sql (columns exist).
-- If one ALTER says "Duplicate column", skip that line only and continue.
-- =============================================================================

USE realestate;

ALTER TABLE properties
  MODIFY COLUMN type ENUM('rent', 'buy', 'other', 'plot', 'plot_lease', 'plot_buy') NOT NULL;

UPDATE properties
SET type = 'plot'
WHERE TRIM(COALESCE(type, '')) = ''
  AND TRIM(COALESCE(katha, '')) <> '';

ALTER TABLE properties
  ADD COLUMN balconies INT NULL DEFAULT NULL AFTER katha;

ALTER TABLE properties
  ADD COLUMN bathrooms INT NULL DEFAULT NULL AFTER balconies;

ALTER TABLE properties
  ADD COLUMN garden TINYINT(1) NOT NULL DEFAULT 0 AFTER bathrooms;

ALTER TABLE properties
  ADD COLUMN car_parking TINYINT(1) NOT NULL DEFAULT 0 AFTER garden;

ALTER TABLE properties
  ADD COLUMN floor_no VARCHAR(32) NULL DEFAULT NULL AFTER car_parking;

ALTER TABLE properties
  ADD COLUMN bike_parking TINYINT(1) NOT NULL DEFAULT 0 AFTER floor_no;

ALTER TABLE properties
  ADD COLUMN shop_sqft_range VARCHAR(32) NULL DEFAULT NULL AFTER bike_parking;

ALTER TABLE properties
  ADD COLUMN shop_road_distance VARCHAR(191) NULL DEFAULT NULL AFTER shop_sqft_range;

ALTER TABLE properties
  ADD COLUMN shop_token_amount DECIMAL(15,2) NULL DEFAULT NULL AFTER shop_road_distance;

ALTER TABLE properties
  ADD COLUMN furnishing_status VARCHAR(32) NULL DEFAULT NULL AFTER shop_token_amount;

ALTER TABLE properties
  MODIFY COLUMN district VARCHAR(100) NULL,
  MODIFY COLUMN state VARCHAR(100) NULL;

UPDATE properties SET state = 'Bihar' WHERE state IS NULL OR TRIM(state) = '';
UPDATE properties SET district = city WHERE district IS NULL OR TRIM(district) = '';
