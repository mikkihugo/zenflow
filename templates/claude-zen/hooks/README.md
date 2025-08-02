# Claude Code Hooks - Proper Implementation

## 🚀 **Overview**

Claude Code hooks are shell commands that execute automatically at specific points in Claude's workflow. This template provides pre-configured hooks that integrate with Claude Flow MCP tools for enhanced AI development workflows.

## 📖 **Official Hook Types**

Claude Code supports these hook events:

1. **`PreToolUse`** - Runs before tool calls (can block them)
2. **`PostToolUse`** - Runs after tool calls complete  
3. **`Notification`** - Runs when Claude Code sends notifications
4. **`Stop`** - Runs when Claude Code finishes responding
5. **`Subagent Stop`** - Runs when subagent tasks complete

## ⚙️ **Configuration in `.claude/settings.json`**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Task",
        "hooks": [
          {
            "type": "command", 
            "command": "hooks/pre-task-coordination.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "hooks/post-edit-optimization.sh"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "hooks/post-command-logging.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "hooks/session-summary.sh"
          }
        ]
      }
    ],
    "Subagent Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "hooks/subagent-coordination.sh"
          }
        ]
      }
    ]
  }
}
```

## 📁 **Hook Files Structure**

```
hooks/
├── README.md                      # This documentation
├── pre-task-coordination.sh       # PreToolUse: Task coordination
├── post-edit-optimization.sh      # PostToolUse: File optimization
├── post-command-logging.sh        # PostToolUse: Command logging
├── session-summary.sh             # Stop: Session completion
├── subagent-coordination.sh       # Subagent Stop: Agent coordination
├── utils/
│   ├── claude-flow-integration.sh # Claude Flow MCP helpers
│   ├── memory-sync.sh             # Memory operations
│   └── logging.sh                 # Logging utilities
└── config/
    └── hook-config.json           # Hook configuration
```

## 🎯 **Hook Implementation Examples**

### **Pre-Task Coordination Hook**

Runs before Task tool calls to set up swarm coordination:

```bash
#!/usr/bin/env bash
# hooks/pre-task-coordination.sh

# Parse JSON input from Claude Code
TASK_TYPE=$(echo "$1" | jq -r '.tool_input.subagent_type // "general"')
TASK_DESC=$(echo "$1" | jq -r '.tool_input.description // "No description"')

# Log the task initiation
echo "$(date): Initializing task coordination for $TASK_TYPE" >> ~/.claude/task-log.txt

# Initialize Claude Flow swarm if needed
if [[ "$TASK_TYPE" =~ (swarm|coordination|multi-agent) ]]; then
    npx claude-flow mcp swarm-init --topology="hierarchical" --max-agents=6 2>/dev/null || true
    echo "$(date): Swarm coordination initialized" >> ~/.claude/task-log.txt
fi

# Load memory context
npx claude-flow mcp memory-usage --action="load" --key="session-context" 2>/dev/null || true

# Exit 0 to allow the task to proceed
exit 0
```

### **Post-Edit Optimization Hook**

Runs after file edits to optimize and format code:

```bash
#!/usr/bin/env bash  
# hooks/post-edit-optimization.sh

# Parse file information
FILE_PATH=$(echo "$1" | jq -r '.tool_input.file_path // ""')
OPERATION=$(echo "$1" | jq -r '.tool_name // ""')

if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

echo "$(date): Post-edit processing for $FILE_PATH ($OPERATION)" >> ~/.claude/edit-log.txt

# Auto-format TypeScript/JavaScript files
if [[ "$FILE_PATH" =~ \.(ts|js|tsx|jsx)$ ]]; then
    if command -v prettier >/dev/null 2>&1; then
        prettier --write "$FILE_PATH" 2>/dev/null || true
        echo "$(date): Formatted $FILE_PATH with Prettier" >> ~/.claude/edit-log.txt
    fi
fi

# Auto-format Python files
if [[ "$FILE_PATH" =~ \.py$ ]]; then
    if command -v black >/dev/null 2>&1; then
        black "$FILE_PATH" 2>/dev/null || true
        echo "$(date): Formatted $FILE_PATH with Black" >> ~/.claude/edit-log.txt
    fi
fi

# Update neural patterns with edit information
npx claude-flow mcp neural-train --operation="file-edit" --file="$FILE_PATH" 2>/dev/null || true

# Store edit in memory for learning
npx claude-flow mcp memory-usage --action="store" --key="recent-edit" --value="{\"file\":\"$FILE_PATH\",\"operation\":\"$OPERATION\",\"timestamp\":$(date +%s)}" 2>/dev/null || true

exit 0
```

### **Command Logging Hook**

Logs bash commands for analysis and learning:

```bash
#!/usr/bin/env bash
# hooks/post-command-logging.sh

# Parse command information
COMMAND=$(echo "$1" | jq -r '.tool_input.command // ""')
DESCRIPTION=$(echo "$1" | jq -r '.tool_input.description // "No description"')
EXIT_CODE=$(echo "$1" | jq -r '.tool_result.exit_code // 0')

# Log to structured file
LOG_ENTRY="{\"timestamp\":\"$(date -Iseconds)\",\"command\":\"$COMMAND\",\"description\":\"$DESCRIPTION\",\"exit_code\":$EXIT_CODE}"
echo "$LOG_ENTRY" >> ~/.claude/command-history.jsonl

# Store successful commands for pattern learning
if [[ "$EXIT_CODE" == "0" ]]; then
    npx claude-flow mcp memory-usage --action="store" --key="successful-command" --value="$LOG_ENTRY" 2>/dev/null || true
fi

exit 0
```

### **Session Summary Hook**

Generates session summary when Claude Code stops:

```bash
#!/usr/bin/env bash
# hooks/session-summary.sh

SESSION_START=${CLAUDE_SESSION_START:-$(date +%s)}
SESSION_END=$(date +%s)
DURATION=$((SESSION_END - SESSION_START))

# Generate session summary
SUMMARY="{\"session_end\":\"$(date -Iseconds)\",\"duration_seconds\":$DURATION,\"session_id\":\"${CLAUDE_SESSION_ID:-unknown}\"}"

echo "$(date): Session completed. Duration: ${DURATION}s" >> ~/.claude/session-log.txt
echo "$SUMMARY" >> ~/.claude/session-summaries.jsonl

# Store session learning
npx claude-flow mcp memory-usage --action="store" --key="session-summary" --value="$SUMMARY" 2>/dev/null || true

# Generate session analytics
if command -v jq >/dev/null 2>&1; then
    COMMANDS_COUNT=$(wc -l < ~/.claude/command-history.jsonl 2>/dev/null || echo "0")
    EDITS_COUNT=$(wc -l < ~/.claude/edit-log.txt 2>/dev/null || echo "0")
    
    echo "Session Stats: ${COMMANDS_COUNT} commands, ${EDITS_COUNT} edits" >> ~/.claude/session-log.txt
fi

exit 0
```

### **Subagent Coordination Hook**

Coordinates when subagent tasks complete:

```bash
#!/usr/bin/env bash
# hooks/subagent-coordination.sh

# Parse subagent information
AGENT_TYPE=$(echo "$1" | jq -r '.subagent_type // "unknown"')
TASK_RESULT=$(echo "$1" | jq -r '.task_result // ""')

echo "$(date): Subagent coordination for $AGENT_TYPE" >> ~/.claude/agent-log.txt

# Update swarm coordination
npx claude-flow mcp agent-update --type="$AGENT_TYPE" --status="completed" 2>/dev/null || true

# Store agent performance data
PERFORMANCE_DATA="{\"agent_type\":\"$AGENT_TYPE\",\"completion_time\":\"$(date -Iseconds)\",\"success\":true}"
npx claude-flow mcp memory-usage --action="store" --key="agent-performance" --value="$PERFORMANCE_DATA" 2>/dev/null || true

# Trigger neural learning from agent results
npx claude-flow mcp neural-train --operation="agent-completion" --agent="$AGENT_TYPE" 2>/dev/null || true

exit 0
```

## 🛠️ **Utility Scripts**

### **Claude Flow Integration Helper**

```bash
#!/usr/bin/env bash
# hooks/utils/claude-flow-integration.sh

# Helper functions for Claude Flow MCP integration

claude_flow_available() {
    command -v npx >/dev/null 2>&1 && npx claude-flow --version >/dev/null 2>&1
}

init_swarm() {
    local topology=${1:-"mesh"}
    local max_agents=${2:-4}
    
    if claude_flow_available; then
        npx claude-flow mcp swarm-init --topology="$topology" --max-agents="$max_agents" 2>/dev/null
        return $?
    fi
    return 1
}

store_memory() {
    local key="$1"
    local value="$2"
    
    if claude_flow_available; then
        npx claude-flow mcp memory-usage --action="store" --key="$key" --value="$value" 2>/dev/null
        return $?
    fi
    return 1
}

neural_train() {
    local operation="$1"
    local data="$2"
    
    if claude_flow_available; then
        npx claude-flow mcp neural-train --operation="$operation" --data="$data" 2>/dev/null
        return $?
    fi
    return 1
}
```

### **Logging Utility**

```bash
#!/usr/bin/env bash
# hooks/utils/logging.sh

LOG_DIR="$HOME/.claude"
mkdir -p "$LOG_DIR"

log_info() {
    echo "$(date -Iseconds) [INFO] $*" >> "$LOG_DIR/hooks.log"
}

log_error() {
    echo "$(date -Iseconds) [ERROR] $*" >> "$LOG_DIR/hooks.log" >&2
}

log_debug() {
    if [[ "${CLAUDE_DEBUG:-}" == "true" ]]; then
        echo "$(date -Iseconds) [DEBUG] $*" >> "$LOG_DIR/hooks.log"
    fi
}
```

## 🎯 **Best Practices**

### **1. Error Handling**
```bash
# Always handle errors gracefully
command_that_might_fail 2>/dev/null || true

# Check if tools are available before using them
if command -v prettier >/dev/null 2>&1; then
    prettier --write "$FILE_PATH"
fi
```

### **2. Security Considerations**
```bash
# Validate inputs from JSON
FILE_PATH=$(echo "$1" | jq -r '.tool_input.file_path // ""')
if [[ -z "$FILE_PATH" ]] || [[ "$FILE_PATH" =~ \.\. ]]; then
    exit 0  # Skip potentially dangerous paths
fi
```

### **3. Performance Optimization**
```bash
# Use background processes for non-critical operations
npx claude-flow mcp memory-usage --action="store" --key="$key" --value="$value" &

# Set timeouts for external commands
timeout 10s external_command || true
```

### **4. Conditional Execution**
```bash
# Only run for specific file types
if [[ "$FILE_PATH" =~ \.(ts|js)$ ]]; then
    # TypeScript/JavaScript specific processing
fi

# Only run for specific operations
if [[ "$OPERATION" == "Write" ]]; then
    # Handle new file creation
fi
```

## 📊 **Monitoring and Analytics**

### **View Hook Logs**
```bash
# View recent hook activity
tail -f ~/.claude/hooks.log

# View command history
jq '.' ~/.claude/command-history.jsonl | tail -20

# View session summaries  
jq '.' ~/.claude/session-summaries.jsonl
```

### **Hook Performance Analysis**
```bash
# Count hook executions by type
grep -c "pre-task-coordination" ~/.claude/hooks.log
grep -c "post-edit-optimization" ~/.claude/hooks.log

# Analyze command success rates
jq -r 'select(.exit_code == 0)' ~/.claude/command-history.jsonl | wc -l
```

## 🚀 **Installation**

1. **Copy hooks to your project:**
   ```bash
   cp -r templates/claude-zen/hooks/ ./hooks/
   chmod +x hooks/*.sh
   ```

2. **Update `.claude/settings.json`:**
   ```bash
   # Merge the hook configuration into your existing settings
   jq -s '.[0] * .[1]' .claude/settings.json hooks-settings.json > .claude/settings-new.json
   mv .claude/settings-new.json .claude/settings.json
   ```

3. **Test hooks:**
   ```bash
   # Test individual hooks
   echo '{"tool_input":{"subagent_type":"test"}}' | hooks/pre-task-coordination.sh
   
   # Enable debug logging
   export CLAUDE_DEBUG=true
   ```

## 🔧 **Customization**

Edit the hook scripts to customize behavior for your specific needs:

- **Modify file patterns** in post-edit hooks
- **Add project-specific** validation in pre-task hooks  
- **Integrate with your tools** (linters, formatters, CI/CD)
- **Customize logging formats** and destinations
- **Add notification integrations** (Slack, Discord, etc.)

---

**✅ Hooks are now implemented according to official Claude Code documentation!**