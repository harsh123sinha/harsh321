-- Optional: property facing (N, E, S, W, NE, NW, SE, SW)
ALTER TABLE properties
  ADD COLUMN facing VARCHAR(8) NULL DEFAULT NULL AFTER furnishing_status;
