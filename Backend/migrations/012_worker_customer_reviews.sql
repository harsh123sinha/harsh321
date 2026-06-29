-- Worker customer reviews + internal review flow updates
-- Applied via ensureWorkerSchema() on boot.

CREATE TABLE IF NOT EXISTS worker_customer_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  customer_id INT NOT NULL,
  rating DECIMAL(3,2) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_worker_customer_reviews_worker (worker_id, created_at),
  CONSTRAINT fk_worker_customer_reviews_worker FOREIGN KEY (worker_id) REFERENCES worker(id) ON DELETE CASCADE,
  CONSTRAINT fk_worker_customer_reviews_customer FOREIGN KEY (customer_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
