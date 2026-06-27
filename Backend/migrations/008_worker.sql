-- Worker profiles + worker user role
-- Run: Get-Content Backend/migrations/008_worker.sql | mysql.exe -u root -p your_db

ALTER TABLE `user`
  MODIFY COLUMN role ENUM('owner', 'agent', 'buyer', 'worker') NOT NULL;

CREATE TABLE IF NOT EXISTS worker (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  worker_image_url VARCHAR(512) NOT NULL,
  profession VARCHAR(120) NOT NULL,
  aadhar_image_url VARCHAR(512) NOT NULL,
  description TEXT NOT NULL,
  working_hours_per_day DECIMAL(4,1) NOT NULL,
  off_day VARCHAR(40) NOT NULL,
  price_per_day DECIMAL(12,2) NOT NULL,
  profile_complete TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_worker_user (user_id),
  CONSTRAINT fk_worker_user FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
