#!/usr/bin/env bash
# Claude Code Hook: Session Summary
# Runs when Claude Code stops to generate session analytics

# Parse JSON input from Claude Code (though Stop hooks don't get much context)
INPUT="$1"

# Create log directory
mkdir -p "$HOME/.claude"

# Calculate session duration
SESSION_START=${CLAUDE_SESSION_START:-$(date +%s)}
SESSION_END=$(date +%s)
DURATION=$((SESSION_END - SESSION_START))

# Generate session summary
SUMMARY="{\"session_end\":\"$(date -Iseconds)\",\"duration_seconds\":$DURATION,\"session_id\":\"${CLAUDE_SESSION_ID:-$(date +%s)}\"}"

# Log session completion
echo "$(date -Iseconds): Session completed. Duration: ${DURATION}s" >> "$HOME/.claude/session-log.txt"
echo "$SUMMARY" >> "$HOME/.claude/session-summaries.jsonl"

# Generate session analytics if we have the data
if command -v jq >/dev/null 2>&1; then
    # Count commands executed in this session
    if [[ -f "$HOME/.claude/command-history.jsonl" ]]; then
        COMMANDS_COUNT=$(wc -l < "$HOME/.claude/command-history.jsonl" 2>/dev/null || echo "0")
    else
        COMMANDS_COUNT=0
    fi
    
    # Count file edits in this session
    if [[ -f "$HOME/.claude/edit-history.jsonl" ]]; then
        EDITS_COUNT=$(wc -l < "$HOME/.claude/edit-history.jsonl" 2>/dev/null || echo "0")
    else
        EDITS_COUNT=0
    fi
    
    # Count tasks initiated
    if [[ -f "$HOME/.claude/task-history.jsonl" ]]; then
        TASKS_COUNT=$(wc -l < "$HOME/.claude/task-history.jsonl" 2>/dev/null || echo "0")
    else
        TASKS_COUNT=0
    fi
    
    # Generate analytics summary
    ANALYTICS="{\"timestamp\":\"$(date -Iseconds)\",\"duration_seconds\":$DURATION,\"commands\":$COMMANDS_COUNT,\"edits\":$EDITS_COUNT,\"tasks\":$TASKS_COUNT}"
    echo "$ANALYTICS" >> "$HOME/.claude/session-analytics.jsonl"
    
    echo "Session Stats: ${COMMANDS_COUNT} commands, ${EDITS_COUNT} edits, ${TASKS_COUNT} tasks" >> "$HOME/.claude/session-log.txt"
fi

# Store session learning in Claude Flow (background)
if command -v npx >/dev/null 2>&1; then
    npx claude-flow mcp memory-usage --action="store" --key="session-summary" --value="$SUMMARY" 2>/dev/null &
fi

# Clean up old log files (keep last 30 days)
find "$HOME/.claude" -name "*.jsonl" -type f -mtime +30 -delete 2>/dev/null || true
find "$HOME/.claude" -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true

# Generate a human-readable session report
if [[ -f "$HOME/.claude/command-history.jsonl" ]] && command -v jq >/dev/null 2>&1; then
    echo "=== Claude Code Session Report ===" >> "$HOME/.claude/session-report.txt"
    echo "Session ended: $(date)" >> "$HOME/.claude/session-report.txt"
    echo "Duration: ${DURATION} seconds" >> "$HOME/.claude/session-report.txt"
    echo "" >> "$HOME/.claude/session-report.txt"
    
    # Most used commands
    echo "Top Commands:" >> "$HOME/.claude/session-report.txt"
    jq -r '.command' "$HOME/.claude/command-history.jsonl" 2>/dev/null | \
        awk '{print $1}' | sort | uniq -c | sort -nr | head -5 >> "$HOME/.claude/session-report.txt" 2>/dev/null || true
    
    echo "" >> "$HOME/.claude/session-report.txt"
    
    # Success rate
    TOTAL_COMMANDS=$(wc -l < "$HOME/.claude/command-history.jsonl" 2>/dev/null || echo "1")
    SUCCESS_COMMANDS=$(jq -r 'select(.exit_code == 0)' "$HOME/.claude/command-history.jsonl" 2>/dev/null | wc -l || echo "0")
    SUCCESS_RATE=$((SUCCESS_COMMANDS * 100 / TOTAL_COMMANDS))
    echo "Command Success Rate: ${SUCCESS_RATE}% (${SUCCESS_COMMANDS}/${TOTAL_COMMANDS})" >> "$HOME/.claude/session-report.txt"
    
    echo "=================================" >> "$HOME/.claude/session-report.txt"
    echo "" >> "$HOME/.claude/session-report.txt"
fi

exit 0