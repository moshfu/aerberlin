#!/usr/bin/env bash
set -a
if [ -f /home/AER/website/aerberlin/.env.production ]; then
  source /home/AER/website/aerberlin/.env.production
else
  echo "Missing .env.production file" >&2
  exit 1
fi
set +a

# Ensure Next.js listens only on localhost and on the port nginx expects.
export PORT="${PORT:-3400}"
exec /usr/bin/npm run start -- -H 127.0.0.1 -p "${PORT}"
