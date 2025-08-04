#!/usr/bin/env bash
# Claude Code Hook: Pre-Task Coordination
# Runs before Task tool calls to set up swarm coordination

# Parse JSON input from Claude Code
INPUT="$1"
TASK_TYPE=$(echo "$INPUT" | jq -r '.tool_input.subagent_type // "general"')
TASK_DESC=$(echo "$INPUT" | jq -r '.tool_input.description // ""')
TASK_PROMPT=$(echo "$INPUT" | jq -r '.tool_input.prompt // ""')

# Create log directory if it doesn't exist
mkdir -p "$HOME/.claude"

# Log the task initiation
echo "$(date -Iseconds): Initializing task coordination for $TASK_TYPE" >> "$HOME/.claude/task-log.txt"

# Initialize Claude Flow swarm if task involves coordination
if [[ "$TASK_TYPE" =~ (swarm|coordination|multi-agent) ]] || [[ "$TASK_PROMPT" =~ (swarm|agents|coordination) ]]; then
    echo "$(date -Iseconds): Swarm task detected, initializing coordination" >> "$HOME/.claude/task-log.txt"
    
    # Initialize swarm via Claude Flow MCP
    if command -v npx >/dev/null 2>&1; then
        npx claude-flow mcp swarm-init --topology="hierarchical" --max-agents=6 2>/dev/null || true
        echo "$(date -Iseconds): Swarm coordination initialized" >> "$HOME/.claude/task-log.txt"
    fi
fi

# Load memory context for session continuity
if command -v npx >/dev/null 2>&1; then
    npx claude-flow mcp memory-usage --action="load" --key="session-context" 2>/dev/null || true
fi

# Store task initiation data
TASK_DATA="{\"timestamp\":\"$(date -Iseconds)\",\"type\":\"$TASK_TYPE\",\"description\":\"$TASK_DESC\"}"
echo "$TASK_DATA" >> "$HOME/.claude/task-history.jsonl"

# Exit 0 to allow the task to proceed (never block tasks)
exit 0