#!/usr/bin/env bash
# Enhanced Claude Code Hook: Auto-Agent Assignment
# Intelligently assigns optimal agents based on file types and operations

# Parse JSON input from Claude Code
INPUT="$1"
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
OPERATION_TYPE=$(echo "$INPUT" | jq -r '.tool_input.operation_type // ""')
DESCRIPTION=$(echo "$INPUT" | jq -r '.tool_input.description // ""')

# Create log directory
mkdir -p "$HOME/.claude/enhanced-hooks"

# Log assignment attempt
echo "$(date -Iseconds): Auto-agent assignment for $TOOL_NAME - $OPERATION_TYPE" >> "$HOME/.claude/enhanced-hooks/agent-assignment.log"

# Initialize assignment result
ASSIGNMENT_RESULT="{\"success\":true,\"assigned_agent\":null,\"reasoning\":\"\",\"confidence\":0.0,\"alternatives\":[]}"

# Detect file type
FILE_TYPE="unknown"
if [[ -n "$FILE_PATH" ]]; then
    case "${FILE_PATH##*.}" in
        ts|tsx)
            FILE_TYPE="typescript"
            ;;
        js|jsx)
            FILE_TYPE="javascript"
            ;;
        py)
            FILE_TYPE="python"
            ;;
        rs)
            FILE_TYPE="rust"
            ;;
        go)
            FILE_TYPE="golang"
            ;;
        java)
            FILE_TYPE="java"
            ;;
        cpp|cc|cxx|c|h|hpp)
            FILE_TYPE="cpp"
            ;;
        md)
            FILE_TYPE="markdown"
            ;;
        json)
            FILE_TYPE="json"
            ;;
        yaml|yml)
            FILE_TYPE="yaml"
            ;;
        sql)
            FILE_TYPE="sql"
            ;;
    esac
fi

# Classify operation type
CLASSIFIED_OPERATION="general"
case "$OPERATION_TYPE" in
    *test*)
        CLASSIFIED_OPERATION="testing"
        ;;
    *debug*)
        CLASSIFIED_OPERATION="debugging"
        ;;
    *refactor*)
        CLASSIFIED_OPERATION="refactoring"
        ;;
    *review*)
        CLASSIFIED_OPERATION="code-review"
        ;;
    *document*)
        CLASSIFIED_OPERATION="documentation"
        ;;
    *analyze*)
        CLASSIFIED_OPERATION="analysis"
        ;;
    *optimize*)
        CLASSIFIED_OPERATION="optimization"
        ;;
    *security*)
        CLASSIFIED_OPERATION="security"
        ;;
    *deploy*)
        CLASSIFIED_OPERATION="deployment"
        ;;
    *ui*|*frontend*)
        CLASSIFIED_OPERATION="frontend"
        ;;
    *api*|*backend*)
        CLASSIFIED_OPERATION="backend"
        ;;
    *ml*|*ai*)
        CLASSIFIED_OPERATION="machine-learning"
        ;;
esac

echo "$(date -Iseconds): Detected file type: $FILE_TYPE, operation: $CLASSIFIED_OPERATION" >> "$HOME/.claude/enhanced-hooks/agent-assignment.log"

# Agent assignment logic
select_optimal_agent() {
    local file_type="$1"
    local operation="$2"
    local description="$3"
    
    # File type based assignment
    case "$file_type" in
        typescript|javascript)
            if [[ "$operation" == "frontend" ]]; then
                echo '{"type":"frontend-dev","name":"Frontend Developer","confidence":0.9,"reasoning":"TypeScript/JavaScript frontend development specialist"}'
            elif [[ "$operation" == "testing" ]]; then
                echo '{"type":"unit-tester","name":"Unit Test Specialist","confidence":0.85,"reasoning":"TypeScript/JavaScript testing expertise"}'
            else
                echo '{"type":"fullstack-dev","name":"Full-Stack Developer","confidence":0.8,"reasoning":"TypeScript/JavaScript development capabilities"}'
            fi
            ;;
        python)
            if [[ "$operation" == "machine-learning" || "$description" == *"ml"* || "$description" == *"ai"* ]]; then
                echo '{"type":"ai-ml-specialist","name":"AI/ML Specialist","confidence":0.95,"reasoning":"Python machine learning and AI expertise"}'
            elif [[ "$operation" == "testing" ]]; then
                echo '{"type":"unit-tester","name":"Python Test Specialist","confidence":0.8,"reasoning":"Python testing frameworks expertise"}'
            else
                echo '{"type":"developer","name":"Python Developer","confidence":0.85,"reasoning":"Python development expertise"}'
            fi
            ;;
        rust)
            echo '{"type":"specialist","name":"Rust Systems Specialist","confidence":0.9,"reasoning":"Rust systems programming and performance optimization"}'
            ;;
        golang)
            if [[ "$operation" == "backend" ]]; then
                echo '{"type":"dev-backend-api","name":"Go Backend Developer","confidence":0.9,"reasoning":"Go backend and API development specialist"}'
            else
                echo '{"type":"developer","name":"Go Developer","confidence":0.85,"reasoning":"Go development expertise"}'
            fi
            ;;
        java)
            echo '{"type":"developer","name":"Java Developer","confidence":0.85,"reasoning":"Java enterprise development expertise"}'
            ;;
        cpp)
            echo '{"type":"specialist","name":"C++ Systems Specialist","confidence":0.9,"reasoning":"C++ systems programming and performance optimization"}'
            ;;
        markdown)
            if [[ "$operation" == "documentation" ]]; then
                echo '{"type":"technical-writer","name":"Technical Writer","confidence":0.95,"reasoning":"Documentation and technical writing specialist"}'
            else
                echo '{"type":"documenter","name":"Documentation Specialist","confidence":0.8,"reasoning":"Markdown documentation expertise"}'
            fi
            ;;
        sql)
            echo '{"type":"database-architect","name":"Database Architect","confidence":0.9,"reasoning":"SQL and database design expertise"}'
            ;;
        *)
            # Operation-based fallback
            case "$operation" in
                testing)
                    echo '{"type":"unit-tester","name":"Test Specialist","confidence":0.7,"reasoning":"General testing capabilities"}'
                    ;;
                debugging)
                    echo '{"type":"debug","name":"Debug Specialist","confidence":0.75,"reasoning":"Debugging and troubleshooting expertise"}'
                    ;;
                security)
                    echo '{"type":"security-analyzer","name":"Security Analyst","confidence":0.8,"reasoning":"Security analysis and vulnerability assessment"}'
                    ;;
                deployment)
                    echo '{"type":"deployment-ops","name":"DevOps Engineer","confidence":0.85,"reasoning":"Deployment and operations expertise"}'
                    ;;
                documentation)
                    echo '{"type":"documenter","name":"Documentation Specialist","confidence":0.8,"reasoning":"Technical documentation expertise"}'
                    ;;
                analysis)
                    echo '{"type":"analyst","name":"Code Analyst","confidence":0.75,"reasoning":"Code analysis and review capabilities"}'
                    ;;
                *)
                    echo '{"type":"coder","name":"General Developer","confidence":0.6,"reasoning":"General development capabilities"}'
                    ;;
            esac
            ;;
    esac
}

# Generate alternatives
generate_alternatives() {
    local file_type="$1"
    local operation="$2"
    
    local alternatives="[]"
    
    # Add general alternatives
    alternatives=$(echo "$alternatives" | jq '. += [{"type":"developer","name":"General Developer","confidence":0.5}]')
    alternatives=$(echo "$alternatives" | jq '. += [{"type":"specialist","name":"Domain Specialist","confidence":0.6}]')
    
    # Add operation-specific alternatives
    case "$operation" in
        testing)
            alternatives=$(echo "$alternatives" | jq '. += [{"type":"integration-tester","name":"Integration Test Specialist","confidence":0.7}]')
            alternatives=$(echo "$alternatives" | jq '. += [{"type":"e2e-tester","name":"E2E Test Specialist","confidence":0.65}]')
            ;;
        documentation)
            alternatives=$(echo "$alternatives" | jq '. += [{"type":"technical-writer","name":"Technical Writer","confidence":0.8}]')
            alternatives=$(echo "$alternatives" | jq '. += [{"type":"readme-writer","name":"README Specialist","confidence":0.7}]')
            ;;
        security)
            alternatives=$(echo "$alternatives" | jq '. += [{"type":"security-architect","name":"Security Architect","confidence":0.85}]')
            alternatives=$(echo "$alternatives" | jq '. += [{"type":"security-manager","name":"Security Manager","confidence":0.75}]')
            ;;
    esac
    
    echo "$alternatives"
}

# Perform agent assignment
OPTIMAL_AGENT=$(select_optimal_agent "$FILE_TYPE" "$CLASSIFIED_OPERATION" "$DESCRIPTION")
ALTERNATIVES=$(generate_alternatives "$FILE_TYPE" "$CLASSIFIED_OPERATION")

# Update assignment result
ASSIGNMENT_RESULT=$(echo "$ASSIGNMENT_RESULT" | jq --argjson agent "$OPTIMAL_AGENT" --argjson alts "$ALTERNATIVES" '
    .assigned_agent = $agent | 
    .reasoning = $agent.reasoning | 
    .confidence = $agent.confidence | 
    .alternatives = $alts
')

echo "$(date -Iseconds): Assigned agent: $(echo "$OPTIMAL_AGENT" | jq -r '.type') with confidence $(echo "$OPTIMAL_AGENT" | jq -r '.confidence')" >> "$HOME/.claude/enhanced-hooks/agent-assignment.log"

# Check current agent workload (mock implementation)
check_agent_workload() {
    local agent_type="$1"
    
    # Mock workload check - would integrate with actual agent registry
    local workload_file="$HOME/.claude/enhanced-hooks/agent-workload-$agent_type.json"
    
    if [[ -f "$workload_file" ]]; then
        local current_workload=$(cat "$workload_file" | jq -r '.current_workload // 0')
        local max_workload=$(cat "$workload_file" | jq -r '.max_workload // 100')
        local utilization=$(echo "scale=2; $current_workload / $max_workload" | bc -l 2>/dev/null || echo "0.5")
        
        echo "$utilization"
    else
        # Default utilization
        echo "0.3"
    fi
}

# Update workload information
AGENT_TYPE=$(echo "$OPTIMAL_AGENT" | jq -r '.type')
CURRENT_UTILIZATION=$(check_agent_workload "$AGENT_TYPE")
ASSIGNMENT_RESULT=$(echo "$ASSIGNMENT_RESULT" | jq --arg util "$CURRENT_UTILIZATION" '.assigned_agent.current_utilization = ($util | tonumber)')

# Adjust confidence based on workload
if (( $(echo "$CURRENT_UTILIZATION > 0.8" | bc -l 2>/dev/null || echo "0") )); then
    echo "$(date -Iseconds): High workload detected for $AGENT_TYPE, reducing confidence" >> "$HOME/.claude/enhanced-hooks/agent-assignment.log"
    ASSIGNMENT_RESULT=$(echo "$ASSIGNMENT_RESULT" | jq '.confidence = (.confidence * 0.8)')
fi

# Output assignment result
echo "$ASSIGNMENT_RESULT" | jq '.'

# Log assignment decision
ASSIGNMENT_LOG="$HOME/.claude/enhanced-hooks/assignment-history.jsonl"
ASSIGNMENT_RECORD="{\"timestamp\":\"$(date -Iseconds)\",\"file_type\":\"$FILE_TYPE\",\"operation\":\"$CLASSIFIED_OPERATION\",\"assigned_agent\":$OPTIMAL_AGENT,\"confidence\":$(echo "$ASSIGNMENT_RESULT" | jq '.confidence')}"
echo "$ASSIGNMENT_RECORD" >> "$ASSIGNMENT_LOG"

# Update agent workload (mock implementation)
update_agent_workload() {
    local agent_type="$1"
    local operation_duration="$2"
    
    local workload_file="$HOME/.claude/enhanced-hooks/agent-workload-$agent_type.json"
    local current_time=$(date +%s)
    
    if [[ -f "$workload_file" ]]; then
        # Update existing workload
        local updated_workload=$(cat "$workload_file" | jq --arg duration "$operation_duration" --arg time "$current_time" '
            .current_workload += ($duration | tonumber) |
            .last_updated = ($time | tonumber) |
            .operations_count += 1
        ')
        echo "$updated_workload" > "$workload_file"
    else
        # Create new workload record
        cat > "$workload_file" << EOF
{
    "agent_type": "$agent_type",
    "current_workload": $operation_duration,
    "max_workload": 100,
    "operations_count": 1,
    "last_updated": $current_time
}
EOF
    fi
}

# Estimate operation duration and update workload
ESTIMATED_DURATION=5 # 5 minute default
case "$CLASSIFIED_OPERATION" in
    testing) ESTIMATED_DURATION=10 ;;
    analysis) ESTIMATED_DURATION=8 ;;
    documentation) ESTIMATED_DURATION=15 ;;
    machine-learning) ESTIMATED_DURATION=20 ;;
esac

update_agent_workload "$AGENT_TYPE" "$ESTIMATED_DURATION"

echo "$(date -Iseconds): Assignment completed successfully" >> "$HOME/.claude/enhanced-hooks/agent-assignment.log"
exit 0