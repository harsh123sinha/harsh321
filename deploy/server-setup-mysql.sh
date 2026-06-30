#!/bin/bash
set -euo pipefail

DB_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)
echo "$DB_PASS" > /root/.htls_db_pass
echo "$JWT_SECRET" > /root/.htls_jwt_secret
chmod 600 /root/.htls_db_pass /root/.htls_jwt_secret

systemctl enable mysql
systemctl start mysql

mysql -e "CREATE DATABASE IF NOT EXISTS realestate CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'htls'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "ALTER USER 'htls'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON realestate.* TO 'htls'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

mysql realestate < /var/www/harshtoletservices/Backend/migrations/00_fresh_install.sql
echo "MySQL ready"
