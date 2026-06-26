-- FCM notifications, search history, saved properties
-- Run once: mysql -u root -p realestate < migrations/003_fcm_notifications.sql

CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  fcm_token VARCHAR(512) NOT NULL,
  device_label VARCHAR(100) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  UNIQUE KEY uq_fcm_token (fcm_token),
  INDEX idx_user_fcm_user (user_id),
  CONSTRAINT fk_fcm_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  location VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  property_type VARCHAR(32) NULL,
  bhk INT NULL,
  katha VARCHAR(100) NULL,
  other_type VARCHAR(255) NULL,
  shop_sqft_range VARCHAR(32) NULL,
  min_price DECIMAL(15,2) NULL,
  max_price DECIMAL(15,2) NULL,
  source ENUM('search_bar','chatbot','api') NOT NULL DEFAULT 'search_bar',
  searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_user_date (user_id, searched_at),
  INDEX idx_search_match (location, property_type, bhk),
  CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM(
    'welcome',
    'search_match',
    'daily_recommendation',
    'saved_price_drop',
    'saved_update',
    'saved_unavailable',
    'saved_verified'
  ) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data_json JSON NULL,
  reference_key VARCHAR(191) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  push_sent TINYINT(1) NOT NULL DEFAULT 0,
  push_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_notification_dedup (user_id, type, reference_key),
  INDEX idx_notifications_user (user_id, is_read, created_at),
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saved_properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  saved_price DECIMAL(15,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_saved_user_property (user_id, property_id),
  INDEX idx_saved_user (user_id),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS property_price_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  old_price DECIMAL(15,2) NULL,
  new_price DECIMAL(15,2) NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_price_history_property (property_id, changed_at),
  CONSTRAINT fk_price_history_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional columns for saved-property alerts — applied at runtime via ensureNotificationSchema.js
