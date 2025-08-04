#!/usr/bin/env bash
# Logging Utilities for Claude Code Hooks
# Provides consistent logging functions across all hooks

# Set up logging directory
LOG_DIR="$HOME/.claude"
mkdir -p "$LOG_DIR"

# Configure log files
HOOKS_LOG="$LOG_DIR/hooks.log"
ERROR_LOG="$LOG_DIR/hooks-errors.log"
DEBUG_LOG="$LOG_DIR/hooks-debug.log"

# Log levels
LOG_LEVEL_ERROR=0
LOG_LEVEL_WARN=1
LOG_LEVEL_INFO=2
LOG_LEVEL_DEBUG=3

# Default log level (can be overridden by CLAUDE_LOG_LEVEL env var)
CURRENT_LOG_LEVEL=${CLAUDE_LOG_LEVEL:-$LOG_LEVEL_INFO}

# Check if we should log at this level
should_log() {
    local level=$1
    [[ $level -le $CURRENT_LOG_LEVEL ]]
}

# Get timestamp in ISO format
get_timestamp() {
    date -Iseconds
}

# Generic log function
write_log() {
    local level=$1
    local level_name=$2
    local message=$3
    local hook_name=${4:-"unknown"}
    
    if should_log "$level"; then
        local timestamp=$(get_timestamp)
        local log_entry="$timestamp [$level_name] [$hook_name] $message"
        
        echo "$log_entry" >> "$HOOKS_LOG"
        
        # Also write to console if running interactively
        if [[ -t 1 ]]; then
            echo "$log_entry"
        fi
    fi
}

# Individual log level functions
log_error() {
    local message="$1"
    local hook_name="${2:-$HOOK_NAME}"
    
    write_log $LOG_LEVEL_ERROR "ERROR" "$message" "$hook_name"
    echo "$(get_timestamp) [$hook_name] ERROR: $message" >> "$ERROR_LOG"
    
    # Also write to stderr
    echo "ERROR: $message" >&2
}

log_warn() {
    local message="$1"
    local hook_name="${2:-$HOOK_NAME}"
    
    write_log $LOG_LEVEL_WARN "WARN" "$message" "$hook_name"
}

log_info() {
    local message="$1"
    local hook_name="${2:-$HOOK_NAME}"
    
    write_log $LOG_LEVEL_INFO "INFO" "$message" "$hook_name"
}

log_debug() {
    local message="$1"
    local hook_name="${2:-$HOOK_NAME}"
    
    if should_log $LOG_LEVEL_DEBUG; then
        write_log $LOG_LEVEL_DEBUG "DEBUG" "$message" "$hook_name"
        echo "$(get_timestamp) [$hook_name] DEBUG: $message" >> "$DEBUG_LOG"
    fi
}

# Structured logging for JSON data
log_json() {
    local level=$1
    local json_data=$2
    local hook_name="${3:-$HOOK_NAME}"
    
    case $level in
        "error")
            log_error "JSON: $json_data" "$hook_name"
            ;;
        "warn")
            log_warn "JSON: $json_data" "$hook_name"
            ;;
        "info")
            log_info "JSON: $json_data" "$hook_name"
            ;;
        "debug")
            log_debug "JSON: $json_data" "$hook_name"
            ;;
        *)
            log_info "JSON: $json_data" "$hook_name"
            ;;
    esac
}

# Log command execution
log_command() {
    local command="$1"
    local exit_code="$2"
    local hook_name="${3:-$HOOK_NAME}"
    
    if [[ $exit_code -eq 0 ]]; then
        log_debug "Command succeeded: $command" "$hook_name"
    else
        log_error "Command failed (exit $exit_code): $command" "$hook_name"
    fi
}

# Log file operations
log_file_operation() {
    local operation="$1"
    local file_path="$2"
    local success="$3"
    local hook_name="${4:-$HOOK_NAME}"
    
    if [[ "$success" == "true" ]]; then
        log_info "File $operation successful: $file_path" "$hook_name"
    else
        log_error "File $operation failed: $file_path" "$hook_name"
    fi
}

# Log performance metrics
log_performance() {
    local operation="$1"
    local duration="$2"
    local hook_name="${3:-$HOOK_NAME}"
    
    log_info "Performance: $operation took ${duration}ms" "$hook_name"
    
    # Also log to performance file for analysis
    local perf_entry="{\"timestamp\":\"$(get_timestamp)\",\"hook\":\"$hook_name\",\"operation\":\"$operation\",\"duration\":$duration}"
    echo "$perf_entry" >> "$LOG_DIR/performance.jsonl"
}

# Log hook start/end
log_hook_start() {
    local hook_name="${1:-$HOOK_NAME}"
    local input_data="$2"
    
    log_info "Hook started" "$hook_name"
    log_debug "Input data: $input_data" "$hook_name"
}

log_hook_end() {
    local hook_name="${1:-$HOOK_NAME}"
    local exit_code="${2:-0}"
    local duration="$3"
    
    if [[ $exit_code -eq 0 ]]; then
        log_info "Hook completed successfully" "$hook_name"
    else
        log_error "Hook failed with exit code $exit_code" "$hook_name"
    fi
    
    if [[ -n "$duration" ]]; then
        log_performance "hook_execution" "$duration" "$hook_name"
    fi
}

# Create log archive (for cleanup)
archive_logs() {
    local archive_days=${1:-30}
    local archive_dir="$LOG_DIR/archive"
    
    mkdir -p "$archive_dir"
    
    # Archive old logs
    find "$LOG_DIR" -name "*.log" -type f -mtime +"$archive_days" -exec mv {} "$archive_dir/" \; 2>/dev/null || true
    find "$LOG_DIR" -name "*.jsonl" -type f -mtime +"$archive_days" -exec mv {} "$archive_dir/" \; 2>/dev/null || true
    
    log_info "Archived logs older than $archive_days days" "logging"
}

# Get log statistics
get_log_stats() {
    local hook_name="$1"
    
    if [[ -f "$HOOKS_LOG" ]]; then
        echo "=== Log Statistics ==="
        
        if [[ -n "$hook_name" ]]; then
            echo "Hook: $hook_name"
            echo "Total entries: $(grep -c "\\[$hook_name\\]" "$HOOKS_LOG" 2>/dev/null || echo "0")"
            echo "Errors: $(grep -c "\\[$hook_name\\].*ERROR" "$HOOKS_LOG" 2>/dev/null || echo "0")"
            echo "Warnings: $(grep -c "\\[$hook_name\\].*WARN" "$HOOKS_LOG" 2>/dev/null || echo "0")"
        else
            echo "Total entries: $(wc -l < "$HOOKS_LOG" 2>/dev/null || echo "0")"
            echo "Errors: $(grep -c "ERROR" "$HOOKS_LOG" 2>/dev/null || echo "0")"
            echo "Warnings: $(grep -c "WARN" "$HOOKS_LOG" 2>/dev/null || echo "0")"
            echo "Info: $(grep -c "INFO" "$HOOKS_LOG" 2>/dev/null || echo "0")"
            echo "Debug: $(grep -c "DEBUG" "$HOOKS_LOG" 2>/dev/null || echo "0")"
        fi
        
        echo "======================="
    else
        echo "No log file found at $HOOKS_LOG"
    fi
}

# Set hook name from calling script
if [[ -n "$BASH_SOURCE" ]]; then
    HOOK_NAME=$(basename "${BASH_SOURCE[1]}" .sh)
fi

# Export functions for use in hook scripts
export -f log_error
export -f log_warn
export -f log_info
export -f log_debug
export -f log_json
export -f log_command
export -f log_file_operation
export -f log_performance
export -f log_hook_start
export -f log_hook_end
export -f archive_logs
export -f get_log_stats

# Export variables
export LOG_DIR
export HOOKS_LOG
export ERROR_LOG
export DEBUG_LOG
export HOOK_NAME