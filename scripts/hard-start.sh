#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cleanup() {
  if [[ -n "${backend_pid:-}" ]]; then
    kill "$backend_pid" 2>/dev/null || true
  fi
  if [[ -n "${frontend_pid:-}" ]]; then
    kill "$frontend_pid" 2>/dev/null || true
  fi
}

kill_ports() {
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 5001/tcp 5173/tcp 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

echo "[hard-start] Clearing old ports and WhatsApp session..."
kill_ports
echo "[hard-start] Keeping WhatsApp session so reconnect can happen automatically."

echo "[hard-start] Starting backend on :5001..."
(cd "$BACKEND_DIR" && node server.js) &
backend_pid=$!

echo "[hard-start] Starting frontend on :5173..."
(cd "$FRONTEND_DIR" && npm run dev) &
frontend_pid=$!

echo "[hard-start] Backend PID: $backend_pid"
echo "[hard-start] Frontend PID: $frontend_pid"
echo "[hard-start] Waiting for one of the processes to stop..."

set +e
wait -n "$backend_pid" "$frontend_pid"
exit_code=$?
set -e

cleanup
exit "$exit_code"
