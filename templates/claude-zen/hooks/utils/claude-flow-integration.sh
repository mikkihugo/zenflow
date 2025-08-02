#!/usr/bin/env bash
# Claude Flow MCP Integration Utilities
# Helper functions for integrating with Claude Flow MCP tools

# Check if Claude Flow is available
claude_flow_available() {
    command -v npx >/dev/null 2>&1 && npx claude-flow --version >/dev/null 2>&1
}

# Initialize swarm with specified topology
init_swarm() {
    local topology=${1:-"mesh"}
    local max_agents=${2:-4}
    local strategy=${3:-"adaptive"}
    
    if claude_flow_available; then
        npx claude-flow mcp swarm-init \
            --topology="$topology" \
            --max-agents="$max_agents" \
            --strategy="$strategy" 2>/dev/null
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# Store data in memory
store_memory() {
    local key="$1"
    local value="$2"
    
    if [[ -z "$key" ]] || [[ -z "$value" ]]; then
        echo "Usage: store_memory <key> <value>" >&2
        return 1
    fi
    
    if claude_flow_available; then
        npx claude-flow mcp memory-usage \
            --action="store" \
            --key="$key" \
            --value="$value" 2>/dev/null
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# Load data from memory
load_memory() {
    local key="$1"
    
    if [[ -z "$key" ]]; then
        echo "Usage: load_memory <key>" >&2
        return 1
    fi
    
    if claude_flow_available; then
        npx claude-flow mcp memory-usage \
            --action="load" \
            --key="$key" 2>/dev/null
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# Trigger neural training
neural_train() {
    local operation="$1"
    local data="$2"
    
    if [[ -z "$operation" ]]; then
        echo "Usage: neural_train <operation> [data]" >&2
        return 1
    fi
    
    if claude_flow_available; then
        if [[ -n "$data" ]]; then
            npx claude-flow mcp neural-train \
                --operation="$operation" \
                --data="$data" 2>/dev/null
        else
            npx claude-flow mcp neural-train \
                --operation="$operation" 2>/dev/null
        fi
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# Spawn an agent
spawn_agent() {
    local agent_type="$1"
    local specialization="$2"
    
    if [[ -z "$agent_type" ]]; then
        echo "Usage: spawn_agent <type> [specialization]" >&2
        return 1
    fi
    
    if claude_flow_available; then
        if [[ -n "$specialization" ]]; then
            npx claude-flow mcp agent-spawn \
                --type="$agent_type" \
                --specialization="$specialization" 2>/dev/null
        else
            npx claude-flow mcp agent-spawn \
                --type="$agent_type" 2>/dev/null
        fi
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# Update agent status
update_agent() {
    local agent_type="$1"
    local status="$2"
    local success="${3:-true}"
    
    if [[ -z "$agent_type" ]] || [[ -z "$status" ]]; then
        echo "Usage: update_agent <type> <status> [success]" >&2
        return 1
    fi
    
    if claude_flow_available; then
        npx claude-flow mcp agent-update \
            --type="$agent_type" \
            --status="$status" \
            --success="$success" 2>/dev/null
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# Get swarm status
get_swarm_status() {
    if claude_flow_available; then
        npx claude-flow mcp swarm-status 2>/dev/null
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# List active agents
list_agents() {
    if claude_flow_available; then
        npx claude-flow mcp agent-list 2>/dev/null
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# Run performance benchmark
run_benchmark() {
    local test_type="$1"
    
    if claude_flow_available; then
        if [[ -n "$test_type" ]]; then
            npx claude-flow mcp benchmark-run --test="$test_type" 2>/dev/null
        else
            npx claude-flow mcp benchmark-run 2>/dev/null
        fi
        return $?
    else
        echo "Claude Flow not available" >&2
        return 1
    fi
}

# Safe execution wrapper
safe_claude_flow() {
    local command="$1"
    shift
    
    if claude_flow_available; then
        # Run with timeout to prevent hanging
        timeout 30s npx claude-flow mcp "$command" "$@" 2>/dev/null || true
    fi
}

# Batch memory operations
batch_store_memory() {
    local -A data=()
    
    # Read key-value pairs from arguments
    while [[ $# -gt 1 ]]; do
        data["$1"]="$2"
        shift 2
    done
    
    if claude_flow_available; then
        for key in "${!data[@]}"; do
            store_memory "$key" "${data[$key]}" &
        done
        wait  # Wait for all background processes
    fi
}

# Export functions for use in other scripts
export -f claude_flow_available
export -f init_swarm
export -f store_memory
export -f load_memory
export -f neural_train
export -f spawn_agent
export -f update_agent
export -f get_swarm_status
export -f list_agents
export -f run_benchmark
export -f safe_claude_flow
export -f batch_store_memory