-- Run in phpMyAdmin (pick your database, often `realestate`).
-- Adds amenities + optional location; safe to run once after 001_extend_property_type_enum.sql (order optional).

USE realestate;

-- New listing details (nullable for plots / older rows)
ALTER TABLE properties
  ADD COLUMN balconies INT NULL DEFAULT NULL AFTER katha,
  ADD COLUMN bathrooms INT NULL DEFAULT NULL AFTER balconies,
  ADD COLUMN garden TINYINT(1) NOT NULL DEFAULT 0 AFTER bathrooms,
  ADD COLUMN car_parking TINYINT(1) NOT NULL DEFAULT 0 AFTER garden,
  ADD COLUMN floor_no VARCHAR(32) NULL DEFAULT NULL AFTER car_parking;

-- If MySQL errors "Duplicate column name", columns already exist — skip the ALTER above.

-- Optional: allow NULL on legacy location columns (app fills district/state from city)
ALTER TABLE properties
  MODIFY COLUMN district VARCHAR(100) NULL,
  MODIFY COLUMN state VARCHAR(100) NULL;

-- Backfill for existing rows
UPDATE properties SET state = 'Bihar' WHERE state IS NULL OR TRIM(state) = '';
UPDATE properties SET district = city WHERE district IS NULL OR TRIM(district) = '';
