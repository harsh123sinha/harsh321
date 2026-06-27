-- Service/vendor images (separate from property images)
-- Run: Get-Content Backend/migrations/010_service_detail.sql | mysql.exe -u root -p your_db

CREATE TABLE IF NOT EXISTS service_detail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  detail_type ENUM('profile_photo','aadhar','hall_photo','listing') NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  title VARCHAR(200) NULL,
  description TEXT NULL,
  rate_amount DECIMAL(12,2) NULL,
  price_type ENUM('daily','monthly','per_trip','per_unit') NULL,
  material_type VARCHAR(80) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_service_detail_worker (worker_id),
  KEY idx_service_detail_worker_type (worker_id, detail_type),
  CONSTRAINT fk_service_detail_worker FOREIGN KEY (worker_id) REFERENCES worker(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
