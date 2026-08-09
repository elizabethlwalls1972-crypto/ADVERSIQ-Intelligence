#!/usr/bin/env bash
# Trigger a Render deploy for the specified service using env vars.
# Usage:
#   RENDER_API_KEY="<key>" RENDER_SERVICE_ID="<id>" ./scripts/trigger-render-deploy.sh

set -euo pipefail

if [ -z "${RENDER_API_KEY:-}" ] || [ -z "${RENDER_SERVICE_ID:-}" ]; then
  echo "RENDER_API_KEY and RENDER_SERVICE_ID must be set as env vars"
  echo "Example: RENDER_API_KEY=abcd RENDER_SERVICE_ID=012345 ./scripts/trigger-render-deploy.sh"
  exit 2
fi

echo "Triggering Render deploy for service: $RENDER_SERVICE_ID"

resp=$(curl -s -w "\n%{http_code}" -X POST "https://api.render.com/deploy/srv-${RENDER_SERVICE_ID}/deploys" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -d '{"clearCache": true}')

# separate body and status
body=$(echo "$resp" | sed '$d')
status=$(echo "$resp" | tail -n1)

if [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then
  echo "Deploy triggered successfully. Response:"
  echo "$body"
  exit 0
else
  echo "Deploy trigger failed (HTTP $status). Response:"
  echo "$body"
  exit 3
fi
