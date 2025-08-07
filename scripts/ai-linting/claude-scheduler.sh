#!/usr/bin/env bash

# Claude Scheduler - Runs every minute to check if old process exited

SMART_FIXER="$(dirname "$0")/smart-claude-fixer.sh"

echo "[$(date '+%H:%M:%S')] Checking if smart fixer can start..."

# Just try to run - it will check if another is running
if "$SMART_FIXER" run; then
    echo "[$(date '+%H:%M:%S')] Smart fixer started successfully"
else
    echo "[$(date '+%H:%M:%S')] Smart fixer already running or failed to start"
fi