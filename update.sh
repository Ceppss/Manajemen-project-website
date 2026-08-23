#!/bin/bash
# Pull latest code, reinstall/rebuild what changed, restart the backend service.
# Run this from anywhere: bash ~/meditrans/update.sh
set -e

cd "$(dirname "$0")"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing backend dependencies..."
cd backend
npm ci --omit=dev

echo "==> Installing & building frontend..."
cd ../meditrans-app
npm ci
npm run build

echo "==> Restarting backend service..."
sudo systemctl restart meditrans

echo "==> Done. Status:"
sudo systemctl status meditrans --no-pager -l | head -10
