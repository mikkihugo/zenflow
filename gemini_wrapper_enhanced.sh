#!/bin/bash

# Enhanced Gemini CLI Wrapper
# Provides JSON-like output and better programmatic integration
# Based on reverse engineering the open-source Gemini CLI

set -euo pipefail

GEMINI_MODEL="${GEMINI_MODEL:-gemini-2.0-flash}"
TIMEOUT="${TIMEOUT:-30}"
OUTPUT_FORMAT="${OUTPUT_FORMAT:-structured}"

usage() {
    cat << EOF
🤖 Enhanced Gemini CLI Wrapper

Usage: $0 <command> [options] [input]

Commands:
  neural-analysis <neural_output> [context]    - Analyze neural network output
  swarm-optimize <swarm_data> [task_data]      - Optimize swarm coordination  
  code-analyze <code> [language]               - Analyze code performance
  debug-neural <issue> [error_logs]            - Debug neural network issues
  multi-model <prompt>                         - Compare multiple models
  structured <prompt>                          - Get structured response
  simple <prompt>                              - Simple prompt (like gemini -p)

Options:
  --model <model>      - Gemini model (default: gemini-2.0-flash)
  --format <format>    - Output format: structured, json, raw
  --timeout <seconds>  - Timeout (default: 30s)
  --verbose           - Verbose output

Environment Variables:
  GEMINI_MODEL        - Default model to use
  OUTPUT_FORMAT       - Default output format
  TIMEOUT            - Default timeout

Examples:
  $0 neural-analysis '[0.8,0.15,0.05]' '{"task":"classification"}'
  $0 swarm-optimize '{"agents":100,"topology":"mesh"}'
  $0 code-analyze 'def slow_func(): pass' python
  $0 debug-neural 'Loss became NaN at epoch 50'
  $0 multi-model 'Best neural network architecture for images?'
  $0 structured 'Analyze performance of this system'
  $0 simple 'Hello, how are you?'

EOF
    exit 1
}

# Parse command line arguments
parse_args() {
    COMMAND=""
    ARGS=()
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --model)
                GEMINI_MODEL="$2"
                shift 2
                ;;
            --format)
                OUTPUT_FORMAT="$2"
                shift 2
                ;;
            --timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --verbose)
                VERBOSE=1
                shift
                ;;
            --help|-h)
                usage
                ;;
            *)
                if [[ -z "$COMMAND" ]]; then
                    COMMAND="$1"
                else
                    ARGS+=("$1")
                fi
                shift
                ;;
        esac
    done
}

# Enhanced error handling
safe_gemini_call() {
    local prompt="$1"
    local model="${2:-$GEMINI_MODEL}"
    
    if [[ "${VERBOSE:-0}" == "1" ]]; then
        echo "🤖 Model: $model" >&2
        echo "📝 Prompt length: ${#prompt} chars" >&2
    fi
    
    local start_time=$(date +%s%3N)
    local response
    local exit_code
    
    # Use timeout and capture both stdout and stderr
    set +e
    response=$(timeout "$TIMEOUT" gemini -m "$model" -p "$prompt" 2>&1)
    exit_code=$?
    set -e
    
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    if [[ "${VERBOSE:-0}" == "1" ]]; then
        echo "⚡ Response time: ${duration}ms" >&2
    fi
    
    if [[ $exit_code -ne 0 ]]; then
        if [[ "$response" == *"quota"* ]] || [[ "$response" == *"limit"* ]]; then
            echo "ERROR: API quota exceeded. Try again later or use a different model." >&2
            return 1
        elif [[ "$response" == *"timeout"* ]] || [[ $exit_code -eq 124 ]]; then
            echo "ERROR: Request timed out after ${TIMEOUT} seconds." >&2
            return 1
        else
            echo "ERROR: Gemini API call failed: $response" >&2
            return 1
        fi
    fi
    
    echo "$response"
}

# Format response based on OUTPUT_FORMAT
format_response() {
    local response="$1"
    local format="${2:-$OUTPUT_FORMAT}"
    
    case "$format" in
        "json")
            # Try to extract JSON from response or create JSON wrapper
            if echo "$response" | jq . >/dev/null 2>&1; then
                echo "$response"
            else
                jq -n --arg response "$response" \
                   --arg timestamp "$(date -Iseconds)" \
                   --arg model "$GEMINI_MODEL" \
                   '{
                       "success": true,
                       "response": $response,
                       "model": $model,
                       "timestamp": $timestamp
                   }'
            fi
            ;;
        "structured")
            # Add metadata to response
            echo "=== GEMINI RESPONSE ==="
            echo "Model: $GEMINI_MODEL"
            echo "Timestamp: $(date -Iseconds)"
            echo "Length: ${#response} chars"
            echo "========================"
            echo "$response"
            echo "========================"
            ;;
        *)
            echo "$response"
            ;;
    esac
}

# Neural network output analysis
neural_analysis() {
    local neural_output="$1"
    local context="${2:-{}}"
    
    local prompt="Analyze this neural network output and provide structured insights:

Neural Output: $neural_output
Context: $context

Please provide:
1. CONFIDENCE LEVEL: [High/Medium/Low] - based on output values
2. INTERPRETATION: Brief explanation of what this output means
3. CONCERNS: Any potential issues or red flags
4. RECOMMENDATIONS: Specific actionable suggestions
5. PERFORMANCE ASSESSMENT: Overall quality rating

Format your response clearly with these sections."
    
    safe_gemini_call "$prompt"
}

# Swarm coordination optimization
swarm_optimize() {
    local swarm_data="$1"
    local task_data="${2:-{}}"
    
    local prompt="Optimize this swarm coordination scenario:

Current Swarm: $swarm_data
Task Requirements: $task_data

Please analyze and provide:
1. RECOMMENDED TOPOLOGY: Best swarm structure for this scenario
2. AGENT ALLOCATION: How many agents of each type needed
3. OPTIMIZATION STRATEGIES: Specific improvements to implement
4. EXPECTED BENEFITS: What improvements to expect
5. IMPLEMENTATION STEPS: How to apply these optimizations
6. MONITORING METRICS: Key performance indicators to track

Provide concrete, actionable recommendations."
    
    safe_gemini_call "$prompt"
}

# Code performance analysis
code_analyze() {
    local code="$1"
    local language="${2:-unknown}"
    
    local prompt="Analyze this $language code for performance issues:

\`\`\`$language
$code
\`\`\`

Please provide:
1. PERFORMANCE ISSUES: Specific problems found
2. SEVERITY LEVELS: High/Medium/Low for each issue
3. OPTIMIZATION OPPORTUNITIES: Concrete improvements
4. CODE EXAMPLES: Show improved versions where possible
5. PRIORITY RANKING: Which fixes to implement first
6. EXPECTED IMPACT: Performance gains from each fix

Focus on actionable, specific recommendations."
    
    safe_gemini_call "$prompt"
}

# Neural network debugging
debug_neural() {
    local issue="$1"
    local error_logs="${2:-}"
    
    local prompt="Debug this neural network training issue:

Issue: $issue
Error Logs: $error_logs

Please provide:
1. ROOT CAUSE: Most likely cause of this issue
2. EXPLANATION: Why this problem occurred
3. IMMEDIATE FIXES: Quick solutions to try right now
4. STEP-BY-STEP DEBUG: Systematic debugging approach
5. PREVENTION: How to avoid this in the future
6. RELATED ISSUES: Other problems that might be connected

Provide specific, actionable debugging steps."
    
    safe_gemini_call "$prompt"
}

# Multi-model comparison
multi_model() {
    local prompt="$1"
    local models=("gemini-2.0-flash" "gemini-2.5-pro")
    
    echo "=== MULTI-MODEL COMPARISON ==="
    
    for model in "${models[@]}"; do
        echo "--- Model: $model ---"
        if response=$(safe_gemini_call "$prompt" "$model" 2>/dev/null); then
            echo "$response" | head -n 10
            echo "..."
        else
            echo "❌ Failed to get response from $model"
        fi
        echo ""
    done
}

# Structured response with metadata
structured_response() {
    local prompt="$1"
    
    local enhanced_prompt="$prompt

Please structure your response clearly with:
- Main points clearly separated
- Actionable recommendations
- Specific examples where relevant
- Clear conclusion or next steps"
    
    safe_gemini_call "$enhanced_prompt"
}

# Simple prompt (equivalent to gemini -p)
simple_prompt() {
    local prompt="$1"
    safe_gemini_call "$prompt"
}

# Main execution
main() {
    if [[ $# -eq 0 ]]; then
        usage
    fi
    
    parse_args "$@"
    
    if [[ -z "$COMMAND" ]]; then
        echo "Error: No command specified"
        usage
    fi
    
    local response
    
    case "$COMMAND" in
        "neural-analysis")
            response=$(neural_analysis "${ARGS[@]}")
            ;;
        "swarm-optimize")
            response=$(swarm_optimize "${ARGS[@]}")
            ;;
        "code-analyze")
            response=$(code_analyze "${ARGS[@]}")
            ;;
        "debug-neural")
            response=$(debug_neural "${ARGS[@]}")
            ;;
        "multi-model")
            multi_model "${ARGS[0]:-Please provide a prompt}"
            return 0
            ;;
        "structured")
            response=$(structured_response "${ARGS[0]:-Please provide a prompt}")
            ;;
        "simple")
            response=$(simple_prompt "${ARGS[0]:-Please provide a prompt}")
            ;;
        *)
            echo "Error: Unknown command '$COMMAND'"
            usage
            ;;
    esac
    
    format_response "$response"
}

# Export functions for sourcing
export -f neural_analysis swarm_optimize code_analyze debug_neural

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi