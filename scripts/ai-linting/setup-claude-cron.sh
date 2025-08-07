#\!/usr/bin/env bash

# Setup cron job for smart Claude fixer - runs every minute

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SMART_FIXER="$SCRIPT_DIR/smart-claude-fixer.sh"

echo "Setting up cron job for Smart Claude Fixer..."
echo "Will run every minute to check if old process exited"

# Create cron entry
CRON_ENTRY="* * * * * $SMART_FIXER run >> /tmp/claude-fixer-cron.log 2>&1"

# Check if cron entry already exists
if crontab -l 2>/dev/null | grep -q "$SMART_FIXER"; then
    echo "Cron job already exists\!"
    echo "Current cron jobs:"
    crontab -l 2>/dev/null | grep claude
else
    # Add to cron
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "Cron job added successfully\!"
fi

echo ""
echo "Cron job will run every minute:"
echo "  - Check if old process finished (60 min limit)"  
echo "  - Start new session if no process running"
echo "  - Skip errors needing human input"
echo "  - Commit & push after each claude -p run"
echo ""
echo "View logs: tail -f /tmp/claude-fixer-cron.log"
echo "Status: npm run fix:smart:status"
echo "Stop: npm run fix:smart:stop"
echo ""
echo "To remove cron job:"
echo "crontab -e  # then delete the line with smart-claude-fixer.sh"
EOF < /dev/null
