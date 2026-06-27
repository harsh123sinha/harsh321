-- Recommendation query performance — superseded by 007_performance_indexes.sql
-- and automatic ensurePerformanceIndexes() on server boot.
-- Safe to run once; duplicate index names will error (ignore).
USE realestate;

-- listing_status + type for active catalogue filters
CREATE INDEX idx_properties_reco_status_type ON properties (listing_status, type);

-- location facets used in recommendation pre-filter
CREATE INDEX idx_properties_reco_city ON properties (city);
CREATE INDEX idx_properties_reco_bhk ON properties (bhk);
CREATE INDEX idx_properties_reco_price ON properties (price);
