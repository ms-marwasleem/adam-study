#!/bin/sh
# Rebuilds apps-script/Code.gs from the backend and the shared stats code.
cd "$(dirname "$0")"
cat apps-script/backend.gs assets/stats.js > apps-script/Code.gs
echo "apps-script/Code.gs rebuilt"
