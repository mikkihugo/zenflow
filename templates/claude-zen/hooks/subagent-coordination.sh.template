#!/usr/bin/env bash
# Claude Code Hook: Subagent Coordination
# Runs when subagent tasks complete to coordinate learning and performance

# Parse JSON input from Claude Code
INPUT="$1"
AGENT_TYPE=$(echo "$INPUT" | jq -r '.subagent_type // "unknown"')
TASK_SUCCESS=$(echo "$INPUT" | jq -r '.task_success // true')
TASK_RESULT=$(echo "$INPUT" | jq -r '.task_result // ""')
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // ""')
EXECUTION_TIME=$(echo "$INPUT" | jq -r '.execution_time // 0')

# Create log directory
mkdir -p "$HOME/.claude"

# Log subagent completion
echo "$(date -Iseconds): Subagent coordination for $AGENT_TYPE (success: $TASK_SUCCESS)" >> "$HOME/.claude/agent-log.txt"

# Store agent performance data
PERFORMANCE_DATA="{\"agent_type\":\"$AGENT_TYPE\",\"agent_id\":\"$AGENT_ID\",\"completion_time\":\"$(date -Iseconds)\",\"success\":$TASK_SUCCESS,\"execution_time\":$EXECUTION_TIME}"
echo "$PERFORMANCE_DATA" >> "$HOME/.claude/agent-performance.jsonl"

# Update swarm coordination status (background)
if command -v npx >/dev/null 2>&1; then
    npx claude-flow mcp agent-update --type="$AGENT_TYPE" --status="completed" --success="$TASK_SUCCESS" 2>/dev/null &
fi

# Store agent performance in memory for learning (background)
if command -v npx >/dev/null 2>&1; then
    npx claude-flow mcp memory-usage --action="store" --key="agent-performance" --value="$PERFORMANCE_DATA" 2>/dev/null &
fi

# Trigger neural learning from agent results (background)
if command -v npx >/dev/null 2>&1; then
    npx claude-flow mcp neural-train --operation="agent-completion" --agent="$AGENT_TYPE" --success="$TASK_SUCCESS" 2>/dev/null &
fi

# Track agent type performance for analytics
AGENT_ANALYTICS="{\"timestamp\":\"$(date -Iseconds)\",\"agent_type\":\"$AGENT_TYPE\",\"success\":$TASK_SUCCESS,\"execution_time\":$EXECUTION_TIME}"
echo "$AGENT_ANALYTICS" >> "$HOME/.claude/agent-analytics.jsonl"

# Generate agent performance summary if we have enough data
if command -v jq >/dev/null 2>&1 && [[ -f "$HOME/.claude/agent-performance.jsonl" ]]; then
    AGENT_COUNT=$(jq -r "select(.agent_type == \"$AGENT_TYPE\")" "$HOME/.claude/agent-performance.jsonl" | wc -l)
    
    # Generate summary every 10 completions
    if (( AGENT_COUNT % 10 == 0 )); then
        SUCCESS_COUNT=$(jq -r "select(.agent_type == \"$AGENT_TYPE\" and .success == true)" "$HOME/.claude/agent-performance.jsonl" | wc -l)
        SUCCESS_RATE=$((SUCCESS_COUNT * 100 / AGENT_COUNT))
        
        echo "$(date -Iseconds): $AGENT_TYPE agent summary: ${SUCCESS_RATE}% success rate over $AGENT_COUNT tasks" >> "$HOME/.claude/agent-log.txt"
        
        # Store performance trend in memory
        if command -v npx >/dev/null 2>&1; then
            TREND_DATA="{\"agent_type\":\"$AGENT_TYPE\",\"success_rate\":$SUCCESS_RATE,\"task_count\":$AGENT_COUNT,\"timestamp\":\"$(date -Iseconds)\"}"
            npx claude-flow mcp memory-usage --action="store" --key="agent-trend" --value="$TREND_DATA" 2>/dev/null &
        fi
    fi
fi

# If agent failed, log for debugging
if [[ "$TASK_SUCCESS" != "true" ]]; then
    FAILURE_DATA="{\"timestamp\":\"$(date -Iseconds)\",\"agent_type\":\"$AGENT_TYPE\",\"agent_id\":\"$AGENT_ID\",\"result\":\"$TASK_RESULT\"}"
    echo "$FAILURE_DATA" >> "$HOME/.claude/agent-failures.jsonl"
    echo "$(date -Iseconds): Agent failure - $AGENT_TYPE: $TASK_RESULT" >> "$HOME/.claude/agent-log.txt"
fi

exit 0