#!/usr/bin/env bash
# Start development environment (Unix-like)
# Usage: ./scripts/start-dev.sh

set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "== CourseAI dev starter =="

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found in PATH. Please install/start Docker and retry." >&2
  exit 1
fi

echo "Starting PostgreSQL via docker-compose..."
docker-compose -f docker-compose.yml up -d

echo "Waiting for Postgres to be ready..."
for i in {1..30}; do
  if docker exec courseai_postgres pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! command -v go >/dev/null 2>&1; then
  echo "Go not found. Skipping backend start. Install Go 1.21+ to run backend locally."
else
  echo "Starting backend..."
  (cd backend && go run cmd/server/main.go) &
fi

echo "Starting frontend (Vite)..."
cd frontend
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev &

echo "Frontend dev server started. Backend/Postgres status depends on environment."
