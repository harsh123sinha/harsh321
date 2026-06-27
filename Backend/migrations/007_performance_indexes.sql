-- =============================================================================
-- PERFORMANCE INDEXES — optional manual run (idempotent via ensurePerformanceIndexes on boot)
--
-- PowerShell:
--   Get-Content .\migrations\007_performance_indexes.sql |
--     & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p realestate
--
-- Prefer: npm run db:migrate  (applies indexes automatically, skips existing)
-- =============================================================================

USE realestate;

-- properties — search, catalogue, recommendations
CREATE INDEX idx_properties_listing_type ON properties (listing_status, type);
CREATE INDEX idx_properties_listing_featured ON properties (listing_status, featured);
CREATE INDEX idx_properties_listing_price ON properties (listing_status, price);
CREATE INDEX idx_properties_type_bhk ON properties (type, listing_status, bhk);
CREATE INDEX idx_properties_owner ON properties (owner_id);
CREATE INDEX idx_properties_city ON properties (city);
CREATE INDEX idx_properties_bhk ON properties (bhk);
CREATE INDEX idx_properties_price ON properties (price);
CREATE INDEX idx_properties_katha ON properties (katha);
CREATE INDEX idx_properties_shop_sqft ON properties (shop_sqft_range);
CREATE INDEX idx_properties_furnishing ON properties (furnishing_status);

-- user — buyer role filters in search-history jobs
CREATE INDEX idx_user_role ON user (role);

-- brokers
CREATE INDEX idx_brokers_user_id ON brokers (user_id);

-- search_history — cron date windows + type matching
CREATE INDEX idx_search_searched_at ON search_history (searched_at);
CREATE INDEX idx_search_property_type ON search_history (property_type);

-- broker reviews
CREATE INDEX idx_reviews_customer ON broker_customer_reviews (customer_id);

-- saved properties
CREATE INDEX idx_saved_property_id ON saved_properties (property_id);

-- notifications — inbox pagination
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at);
