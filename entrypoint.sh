#!/bin/sh
# Build a minimal writable claude config dir with only what we need:
# credentials (from mounted ro dir) + our clean settings (no Windows hooks)
mkdir -p /tmp/claude-rw
# Copy credentials
cp /root/.claude/.credentials.json /tmp/claude-rw/.credentials.json 2>/dev/null || true
cp /root/.claude/--.credentials.json /tmp/claude-rw/--.credentials.json 2>/dev/null || true
# Copy our clean settings (no Windows hooks)
cp /claude-settings.json /tmp/claude-rw/settings.json
exec node /app/server.js
