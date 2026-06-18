-- Run once against your `realestate` database (phpMyAdmin or mysql CLI).
-- Tracks which staff member created a user row; optional admin contact from ADMIN_PHONE in .env.

ALTER TABLE user
  ADD COLUMN created_by_type VARCHAR(20) NULL DEFAULT NULL COMMENT 'self|admin|subadmin' AFTER phone_number,
  ADD COLUMN created_by_email VARCHAR(255) NULL DEFAULT NULL AFTER created_by_type,
  ADD COLUMN created_by_name VARCHAR(255) NULL DEFAULT NULL AFTER created_by_email,
  ADD COLUMN created_by_phone VARCHAR(20) NULL DEFAULT NULL AFTER created_by_name;

ALTER TABLE sub_admins
  ADD COLUMN phone VARCHAR(15) NULL DEFAULT NULL AFTER email;

-- Allow users created by staff without a phone until you set one (optional; skip if you prefer NOT NULL)
ALTER TABLE user MODIFY COLUMN phone_number VARCHAR(10) NULL;
