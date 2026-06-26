-- Broker discovery, ratings, and reviews — applied via ensureBrokerSchema() on boot.

CREATE TABLE IF NOT EXISTS brokers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  broker_id VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(512) NULL,
  area_of_work VARCHAR(255) NOT NULL,
  years_of_experience INT NOT NULL DEFAULT 0,
  user_id INT NULL,
  harsh_rating_avg DECIMAL(3,2) NULL,
  customer_rating_avg DECIMAL(3,2) NULL,
  customer_review_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_brokers_area (area_of_work),
  CONSTRAINT fk_broker_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- broker_internal_ratings, broker_customer_reviews, properties.broker_id added at runtime.
