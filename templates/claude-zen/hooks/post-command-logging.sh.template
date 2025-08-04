#!/usr/bin/env bash
# Claude Code Hook: Post-Command Logging
# Runs after Bash commands to log and analyze command patterns

# Parse JSON input from Claude Code
INPUT="$1"
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
DESCRIPTION=$(echo "$INPUT" | jq -r '.tool_input.description // "No description"')
EXIT_CODE=$(echo "$INPUT" | jq -r '.tool_result.exit_code // 0')
STDOUT=$(echo "$INPUT" | jq -r '.tool_result.stdout // ""')
STDERR=$(echo "$INPUT" | jq -r '.tool_result.stderr // ""')

# Create log directory
mkdir -p "$HOME/.claude"

# Create structured log entry
LOG_ENTRY="{\"timestamp\":\"$(date -Iseconds)\",\"command\":\"$COMMAND\",\"description\":\"$DESCRIPTION\",\"exit_code\":$EXIT_CODE,\"success\":$([ "$EXIT_CODE" = "0" ] && echo "true" || echo "false")}"

# Log to command history file
echo "$LOG_ENTRY" >> "$HOME/.claude/command-history.jsonl"

# Log to human-readable format
echo "$(date -Iseconds): [$EXIT_CODE] $COMMAND - $DESCRIPTION" >> "$HOME/.claude/bash-commands.log"

# Store successful commands for pattern learning (background)
if [[ "$EXIT_CODE" == "0" ]] && command -v npx >/dev/null 2>&1; then
    npx claude-flow mcp memory-usage --action="store" --key="successful-command" --value="$LOG_ENTRY" 2>/dev/null &
fi

# Store failed commands for error analysis (background)
if [[ "$EXIT_CODE" != "0" ]] && command -v npx >/dev/null 2>&1; then
    ERROR_DATA="{\"command\":\"$COMMAND\",\"exit_code\":$EXIT_CODE,\"stderr\":\"$STDERR\",\"timestamp\":\"$(date -Iseconds)\"}"
    npx claude-flow mcp memory-usage --action="store" --key="failed-command" --value="$ERROR_DATA" 2>/dev/null &
fi

# Detect potentially dangerous commands and log warnings
if [[ "$COMMAND" =~ (rm -rf|sudo rm|format|mkfs|dd if=) ]]; then
    echo "$(date -Iseconds): WARNING: Potentially dangerous command executed: $COMMAND" >> "$HOME/.claude/security-warnings.log"
fi

# Track command categories for analytics
CATEGORY="other"
if [[ "$COMMAND" =~ ^(git) ]]; then
    CATEGORY="git"
elif [[ "$COMMAND" =~ ^(npm|yarn|pnpm) ]]; then
    CATEGORY="package-manager"
elif [[ "$COMMAND" =~ ^(docker) ]]; then
    CATEGORY="docker"
elif [[ "$COMMAND" =~ ^(cd|ls|pwd|find|grep) ]]; then
    CATEGORY="filesystem"
elif [[ "$COMMAND" =~ ^(curl|wget) ]]; then
    CATEGORY="network"
fi

CATEGORY_LOG="{\"timestamp\":\"$(date -Iseconds)\",\"category\":\"$CATEGORY\",\"command\":\"$COMMAND\"}"
echo "$CATEGORY_LOG" >> "$HOME/.claude/command-categories.jsonl"

exit 0