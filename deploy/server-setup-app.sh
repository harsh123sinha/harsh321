#!/bin/bash
set -euo pipefail

APP_DIR=/var/www/harshtoletservices
DB_PASS=$(cat /root/.htls_db_pass)
JWT_SECRET=$(cat /root/.htls_jwt_secret)

ENV_FILE="$APP_DIR/Backend/.env"

# Production overrides (AWS keys already copied from local .env via scp)
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' "$ENV_FILE"
sed -i "s/^DB_HOST=.*/DB_HOST=127.0.0.1/" "$ENV_FILE"
sed -i "s/^DB_USER=.*/DB_USER=htls/" "$ENV_FILE"
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASS}|" "$ENV_FILE"
sed -i 's/^DB_NAME=.*/DB_NAME=realestate/' "$ENV_FILE"
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" "$ENV_FILE"
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://harshtoletservices.in,https://www.harshtoletservices.in|' "$ENV_FILE"
sed -i 's|^SMTP_USER=.*|SMTP_USER=harshtoletservices@gmail.com|' "$ENV_FILE"
sed -i 's|^SMTP_FROM=.*|SMTP_FROM=harshtoletservices@gmail.com|' "$ENV_FILE"

cd "$APP_DIR/Backend"
npm install --omit=dev
npm run db:migrate

pm2 delete htls-api 2>/dev/null || true
pm2 start server.js --name htls-api --cwd "$APP_DIR/Backend"
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

cp /root/deploy/frontend.env.production "$APP_DIR/frontend/.env.production"
cd "$APP_DIR/frontend"
npm install
npm run build

cp /root/deploy/nginx-harshtoletservices.conf /etc/nginx/sites-available/harshtoletservices
ln -sf /etc/nginx/sites-available/harshtoletservices /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "DEPLOY_DONE"
