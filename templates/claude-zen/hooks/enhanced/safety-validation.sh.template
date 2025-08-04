#!/usr/bin/env bash
# Enhanced Claude Code Hook: Safety Validation
# Validates potentially dangerous commands and provides safer alternatives

# Parse JSON input from Claude Code
INPUT="$1"
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
OPERATION_TYPE=$(echo "$INPUT" | jq -r '.tool_input.operation_type // "unknown"')

# Create log directory
mkdir -p "$HOME/.claude/enhanced-hooks"

# Log validation attempt
echo "$(date -Iseconds): Safety validation for $TOOL_NAME - $OPERATION_TYPE" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"

# Initialize validation result
VALIDATION_RESULT="{\"allowed\":true,\"warnings\":[],\"errors\":[],\"alternatives\":[]}"

# Dangerous command patterns
DANGEROUS_PATTERNS=(
    "rm\s+-rf\s+/"
    ">\s*/dev/"
    "curl.*\|\s*sh"
    "eval\s+\$\("
    "chmod\s+777"
    "sudo.*--preserve-env"
    ":\(\).*\{.*\|\|.*&.*\}"
    "dd\s+if=.*of=.*"
)

# High-risk commands
HIGH_RISK_COMMANDS=("dd" "fdisk" "mkfs" "format" "reboot" "shutdown" "halt" "init")

# Validate bash commands
if [[ -n "$COMMAND" ]]; then
    echo "$(date -Iseconds): Validating command: $COMMAND" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
    
    # Check dangerous patterns
    for pattern in "${DANGEROUS_PATTERNS[@]}"; do
        if echo "$COMMAND" | grep -qE "$pattern"; then
            echo "$(date -Iseconds): CRITICAL: Dangerous pattern detected: $pattern" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
            VALIDATION_RESULT=$(echo "$VALIDATION_RESULT" | jq '.allowed = false | .errors += [{"type":"DANGEROUS_PATTERN","message":"Command contains dangerous pattern: '"$pattern"'","severity":"CRITICAL"}]')
            break
        fi
    done
    
    # Check high-risk commands
    for risk_cmd in "${HIGH_RISK_COMMANDS[@]}"; do
        if [[ "$COMMAND" == *"$risk_cmd"* ]]; then
            echo "$(date -Iseconds): HIGH RISK: Command contains high-risk operation: $risk_cmd" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
            VALIDATION_RESULT=$(echo "$VALIDATION_RESULT" | jq '.warnings += [{"type":"HIGH_RISK_COMMAND","message":"Command contains high-risk operation: '"$risk_cmd"'","severity":"HIGH"}]')
        fi
    done
    
    # Generate safer alternatives
    if [[ "$COMMAND" == *"rm -rf"* ]]; then
        VALIDATION_RESULT=$(echo "$VALIDATION_RESULT" | jq '.alternatives += ["Use rm with specific files instead of -rf", "Use trash command for recoverable deletion"]')
    fi
    
    if [[ "$COMMAND" == *"curl"* && "$COMMAND" == *"| sh"* ]]; then
        VALIDATION_RESULT=$(echo "$VALIDATION_RESULT" | jq '.alternatives += ["Download script first: curl -O <url>", "Review downloaded script before execution"]')
    fi
    
    if [[ "$COMMAND" == *"chmod 777"* ]]; then
        VALIDATION_RESULT=$(echo "$VALIDATION_RESULT" | jq '.alternatives += ["Use chmod 755 for executables", "Use chmod 644 for regular files"]')
    fi
fi

# Validate file operations
if [[ -n "$FILE_PATH" ]]; then
    echo "$(date -Iseconds): Validating file operation: $FILE_PATH" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
    
    # Check sensitive system paths
    SENSITIVE_PATHS=("/" "/etc" "/bin" "/sbin" "/usr/bin" "/usr/sbin" "/boot" "/sys" "/proc")
    
    for sensitive_path in "${SENSITIVE_PATHS[@]}"; do
        if [[ "$FILE_PATH" == "$sensitive_path"* ]]; then
            if [[ "$OPERATION_TYPE" == "write" || "$OPERATION_TYPE" == "delete" ]]; then
                echo "$(date -Iseconds): HIGH RISK: $OPERATION_TYPE operation on sensitive path: $FILE_PATH" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
                VALIDATION_RESULT=$(echo "$VALIDATION_RESULT" | jq '.warnings += [{"type":"SENSITIVE_PATH","message":"'"$OPERATION_TYPE"' operation on sensitive system path: '"$FILE_PATH"'","severity":"HIGH"}]')
            fi
            break
        fi
    done
    
    # Check for path traversal
    if [[ "$FILE_PATH" == *".."* ]]; then
        echo "$(date -Iseconds): MEDIUM RISK: Path traversal detected: $FILE_PATH" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
        VALIDATION_RESULT=$(echo "$VALIDATION_RESULT" | jq '.warnings += [{"type":"PATH_TRAVERSAL","message":"Path traversal detected in file path","severity":"MEDIUM"}]')
    fi
fi

# Output validation result
echo "$VALIDATION_RESULT" | jq '.'

# Generate security report if risks detected
RISK_COUNT=$(echo "$VALIDATION_RESULT" | jq '.errors | length')
WARNING_COUNT=$(echo "$VALIDATION_RESULT" | jq '.warnings | length')

if [[ "$RISK_COUNT" -gt 0 || "$WARNING_COUNT" -gt 0 ]]; then
    echo "$(date -Iseconds): Security Report - Errors: $RISK_COUNT, Warnings: $WARNING_COUNT" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
    
    # Create detailed security report
    SECURITY_REPORT="$HOME/.claude/enhanced-hooks/security-report-$(date +%s).json"
    cat > "$SECURITY_REPORT" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "tool": "$TOOL_NAME",
    "command": "$COMMAND",
    "file_path": "$FILE_PATH",
    "operation_type": "$OPERATION_TYPE",
    "validation_result": $VALIDATION_RESULT,
    "recommendation": "Review security implications before proceeding"
}
EOF
    
    echo "$(date -Iseconds): Security report saved to: $SECURITY_REPORT" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
fi

# Exit with appropriate code
ALLOWED=$(echo "$VALIDATION_RESULT" | jq -r '.allowed')
if [[ "$ALLOWED" == "false" ]]; then
    echo "$(date -Iseconds): Operation blocked by safety validation" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
    exit 1
else
    echo "$(date -Iseconds): Operation allowed with $(echo "$VALIDATION_RESULT" | jq '.warnings | length') warnings" >> "$HOME/.claude/enhanced-hooks/safety-validation.log"
    exit 0
fi