#!/bin/bash

# Claude Code Zen - Terminal Broadcast Script
# Notifies all user terminals when files change or service reloads

MESSAGE="$1"
TIMESTAMP=$(date '+%H:%M:%S')

# Default message if none provided
if [ -z "$MESSAGE" ]; then
    MESSAGE="🔄 Claude Code Zen: File changes detected, service reloading..."
fi

# Broadcast to all user terminals
echo "[$TIMESTAMP] $MESSAGE" | wall

# Also send to all user TTYs specifically
for tty in $(who | grep "$(whoami)" | awk '{print $2}'); do
    echo -e "\n\033[1;32m[$TIMESTAMP]\033[0m \033[1;36m$MESSAGE\033[0m" > /dev/$tty 2>/dev/null || true
done

# Log to syslog as well
logger -t claude-zen "$MESSAGE"

# Send desktop notification if available
if command -v notify-send >/dev/null 2>&1; then
    notify-send "Claude Code Zen" "$MESSAGE" --icon=dialog-information 2>/dev/null || true
fi

# Write to a shared status file that can be monitored
echo "[$TIMESTAMP] $MESSAGE" >> /tmp/claude-zen-status.log

# Keep only last 100 lines
tail -n 100 /tmp/claude-zen-status.log > /tmp/claude-zen-status.log.tmp
mv /tmp/claude-zen-status.log.tmp /tmp/claude-zen-status.log

echo "✅ Broadcast sent: $MESSAGE"