#!/usr/bin/env bash

# Setup cron for Smart Claude Fixer

SMART_FIXER="/home/mhugo/code/claude-code-zen/scripts/ai-linting/smart-claude-fixer.sh"

echo "Setting up cron job..."

# Create cron entry - runs every minute
CRON_ENTRY="* * * * * $SMART_FIXER run >> /tmp/claude-cron.log 2>&1"

# Add to cron if not exists
if ! crontab -l 2>/dev/null | grep -q "smart-claude-fixer"; then
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "Cron job added!"
else
    echo "Cron job already exists"
fi

echo ""
echo "Every minute cron will:"
echo "- Check if 60min process finished"
echo "- Start new if none running"  
echo "- Run claude -p with simple prompt"
echo "- Commit & push changes"
echo ""
echo "Logs: tail -f /tmp/claude-cron.log"
echo "Remove: crontab -e"