-- =============================================================================
-- FRESH INSTALL — run once when you have NO `user` / `properties` / `sub_admins` tables
-- =============================================================================

CREATE DATABASE IF NOT EXISTS realestate
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE realestate;

CREATE TABLE IF NOT EXISTS user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('owner', 'agent', 'buyer') NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  accept_terms BOOLEAN DEFAULT TRUE,
  terms_accepted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  type ENUM('rent', 'buy', 'other', 'plot', 'plot_lease', 'plot_buy') NOT NULL,
  bhk INT,
  katha VARCHAR(100),
  balconies INT NULL DEFAULT NULL,
  bathrooms INT NULL DEFAULT NULL,
  garden TINYINT(1) NOT NULL DEFAULT 0,
  car_parking TINYINT(1) NOT NULL DEFAULT 0,
  floor_no VARCHAR(32) NULL DEFAULT NULL,
  bike_parking TINYINT(1) NOT NULL DEFAULT 0,
  shop_sqft_range VARCHAR(32) NULL DEFAULT NULL,
  shop_road_distance VARCHAR(191) NULL DEFAULT NULL,
  shop_token_amount DECIMAL(15, 2) NULL DEFAULT NULL,
  furnishing_status VARCHAR(32) NULL DEFAULT NULL,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  pincode VARCHAR(10),
  image_url TEXT,
  other_type VARCHAR(255),
  owner_id INT,
  featured BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sub_admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  hashed_password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NULL DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
