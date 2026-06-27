-- Worker pricing: daily or monthly
-- Run: Get-Content Backend/migrations/009_worker_pricing.sql | mysql.exe -u root -p your_db

ALTER TABLE worker
  ADD COLUMN IF NOT EXISTS price_type ENUM('daily','monthly') NOT NULL DEFAULT 'daily' AFTER off_day;

-- MySQL 8.0 may not support IF NOT EXISTS on ADD COLUMN; run manually if column already exists.
-- ALTER TABLE worker CHANGE COLUMN price_per_day price_amount DECIMAL(12,2) NOT NULL;
