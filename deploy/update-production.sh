#!/bin/bash
# Pull latest code from GitHub and redeploy Harsh To Let Services on this VPS.
# Usage (on server as root):
#   bash /root/deploy/update-production.sh
#   bash /root/deploy/update-production.sh main
set -euo pipefail

APP_DIR=/var/www/harshtoletservices
DEPLOY_DIR=/root/deploy
BRANCH="${1:-main}"

echo "==> Deploying branch: ${BRANCH}"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "ERROR: $APP_DIR is not a git repository."
  exit 1
fi

cd "$APP_DIR"
echo "==> git fetch && pull"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

if [[ -f "$DEPLOY_DIR/frontend.env.production" ]]; then
  echo "==> Sync frontend production env"
  cp "$DEPLOY_DIR/frontend.env.production" "$APP_DIR/frontend/.env.production"
fi

echo "==> Backend: install, migrate, restart"
cd "$APP_DIR/Backend"
npm install --omit=dev
npm run db:migrate
pm2 restart htls-api

echo "==> Frontend: install, build"
cd "$APP_DIR/frontend"
npm install
npm run build

if [[ -f "$DEPLOY_DIR/nginx-harshtoletservices.conf" ]]; then
  echo "==> Reload nginx (if config changed)"
  cp "$DEPLOY_DIR/nginx-harshtoletservices.conf" /etc/nginx/sites-available/harshtoletservices
  nginx -t
  systemctl reload nginx
fi

echo ""
echo "DEPLOY_DONE — https://www.harshtoletservices.in"
pm2 list | head -6
