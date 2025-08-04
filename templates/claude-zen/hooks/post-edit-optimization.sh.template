#!/usr/bin/env bash
# Claude Code Hook: Post-Edit Optimization  
# Runs after Edit, MultiEdit, or Write operations to optimize files

# Parse JSON input from Claude Code
INPUT="$1"
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
OPERATION=$(echo "$INPUT" | jq -r '.tool_name // ""')
NEW_STRING=$(echo "$INPUT" | jq -r '.tool_input.new_string // ""')

# Exit early if no file path
if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Create log directory
mkdir -p "$HOME/.claude"

# Log the edit operation
echo "$(date -Iseconds): Post-edit processing for $FILE_PATH ($OPERATION)" >> "$HOME/.claude/edit-log.txt"

# Security check: avoid dangerous paths
if [[ "$FILE_PATH" =~ \.\. ]] || [[ "$FILE_PATH" =~ ^/ ]]; then
    echo "$(date -Iseconds): Skipping potentially dangerous path: $FILE_PATH" >> "$HOME/.claude/edit-log.txt"
    exit 0
fi

# Auto-format TypeScript/JavaScript files
if [[ "$FILE_PATH" =~ \.(ts|js|tsx|jsx)$ ]]; then
    if command -v prettier >/dev/null 2>&1 && [[ -f "$FILE_PATH" ]]; then
        prettier --write "$FILE_PATH" 2>/dev/null || true
        echo "$(date -Iseconds): Formatted $FILE_PATH with Prettier" >> "$HOME/.claude/edit-log.txt"
    fi
fi

# Auto-format Python files
if [[ "$FILE_PATH" =~ \.py$ ]]; then
    if command -v black >/dev/null 2>&1 && [[ -f "$FILE_PATH" ]]; then
        black "$FILE_PATH" 2>/dev/null || true
        echo "$(date -Iseconds): Formatted $FILE_PATH with Black" >> "$HOME/.claude/edit-log.txt"
    fi
fi

# Auto-format Rust files
if [[ "$FILE_PATH" =~ \.rs$ ]]; then
    if command -v rustfmt >/dev/null 2>&1 && [[ -f "$FILE_PATH" ]]; then
        rustfmt "$FILE_PATH" 2>/dev/null || true
        echo "$(date -Iseconds): Formatted $FILE_PATH with rustfmt" >> "$HOME/.claude/edit-log.txt"
    fi
fi

# Auto-format Go files
if [[ "$FILE_PATH" =~ \.go$ ]]; then
    if command -v gofmt >/dev/null 2>&1 && [[ -f "$FILE_PATH" ]]; then
        gofmt -w "$FILE_PATH" 2>/dev/null || true
        echo "$(date -Iseconds): Formatted $FILE_PATH with gofmt" >> "$HOME/.claude/edit-log.txt"
    fi
fi

# Update neural patterns with edit information (background process)
if command -v npx >/dev/null 2>&1; then
    npx claude-flow mcp neural-train --operation="file-edit" --file="$FILE_PATH" 2>/dev/null &
fi

# Store edit in memory for learning (background process)  
if command -v npx >/dev/null 2>&1; then
    EDIT_DATA="{\"file\":\"$FILE_PATH\",\"operation\":\"$OPERATION\",\"timestamp\":$(date +%s)}"
    npx claude-flow mcp memory-usage --action="store" --key="recent-edit" --value="$EDIT_DATA" 2>/dev/null &
fi

# Log edit details for analysis
EDIT_LOG="{\"timestamp\":\"$(date -Iseconds)\",\"file\":\"$FILE_PATH\",\"operation\":\"$OPERATION\"}"
echo "$EDIT_LOG" >> "$HOME/.claude/edit-history.jsonl"

exit 0