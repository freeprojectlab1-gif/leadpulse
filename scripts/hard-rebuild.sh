#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

kill_ports() {
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 5001/tcp 5173/tcp 2>/dev/null || true
  fi
}

echo "[hard-rebuild] Clearing old ports and WhatsApp session..."
kill_ports
echo "[hard-rebuild] Keeping WhatsApp session so rebuild does not force re-scan."

echo "[hard-rebuild] Building frontend..."
(cd "$ROOT_DIR" && npm run build)

echo "[hard-rebuild] Starting backend on :5001..."
cd "$BACKEND_DIR"
node server.js
