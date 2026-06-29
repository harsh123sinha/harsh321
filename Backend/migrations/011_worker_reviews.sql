-- Worker internal reviews (admin / sub-admin)
-- Applied via ensureWorkerSchema() on boot.

CREATE TABLE IF NOT EXISTS worker_internal_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  rating DECIMAL(3,2) NOT NULL,
  comment TEXT NOT NULL,
  given_by_staff_type ENUM('admin','subadmin') NOT NULL,
  given_by_staff_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_worker_reviews_worker (worker_id, created_at),
  CONSTRAINT fk_worker_reviews_worker FOREIGN KEY (worker_id) REFERENCES worker(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
