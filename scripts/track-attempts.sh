#!/bin/bash

# Attempt tracking functions for intelligent linter
ATTEMPT_LOG="scripts/attempt-tracker.log"
FAILED_LOG="scripts/failed-files.log"

# Function to record an attempt
record_attempt() {
    local file="$1"
    local pre_errors="$2" 
    local post_errors="$3"
    local result="$4"
    local timestamp=$(date -Iseconds)
    
    echo "$file:$(get_attempt_count "$file"):$pre_errors:$post_errors:$timestamp:$result" >> "$ATTEMPT_LOG"
}

# Function to get current attempt count for a file
get_attempt_count() {
    local file="$1"
    if [ -f "$ATTEMPT_LOG" ]; then
        local last_attempt=$(grep "^$file:" "$ATTEMPT_LOG" | tail -1 | cut -d':' -f2)
        if [ -n "$last_attempt" ]; then
            echo $((last_attempt + 1))
        else
            echo 1
        fi
    else
        echo 1
    fi
}

# Function to check if file should be blacklisted
should_blacklist_file() {
    local file="$1"
    local current_errors="$2"
    
    if [ ! -f "$ATTEMPT_LOG" ]; then
        return 1  # No attempts yet, don't blacklist
    fi
    
    # Get last 2 attempts for this file
    local attempts=$(grep "^$file:" "$ATTEMPT_LOG" | tail -2)
    local attempt_count=$(echo "$attempts" | wc -l)
    
    if [ $attempt_count -lt 2 ]; then
        return 1  # Less than 2 attempts, don't blacklist
    fi
    
    # Check if both attempts showed no improvement
    local no_improvement=0
    while IFS=':' read -r filename attempt_num pre_errors post_errors timestamp result; do
        if [ "$pre_errors" -le "$post_errors" ] && [ "$result" != "SUCCESS" ]; then
            no_improvement=$((no_improvement + 1))
        fi
    done <<< "$attempts"
    
    if [ $no_improvement -ge 2 ]; then
        echo "🚫 File $file should be blacklisted: 2+ attempts with no improvement" >&2
        return 0  # Should blacklist
    fi
    
    return 1  # Don't blacklist
}

# Function to add file to blacklist
add_to_blacklist() {
    local file="$1"
    local error_count="$2"
    local reason="$3"
    
    echo "$file:$error_count:$reason" >> "$FAILED_LOG"
    echo "🚫 Added to blacklist: $file ($error_count errors, reason: $reason)" >&2
}

# Function to check if file made progress
file_made_progress() {
    local file="$1" 
    local pre_errors="$2"
    local post_errors="$3"
    
    if [ "$post_errors" -lt "$pre_errors" ]; then
        return 0  # Made progress
    else
        return 1  # No progress
    fi
}

# Function to reset attempt count if file made progress
reset_attempts_if_improved() {
    local file="$1"
    local pre_errors="$2" 
    local post_errors="$3"
    
    if file_made_progress "$file" "$pre_errors" "$post_errors"; then
        echo "✨ File $file made progress ($pre_errors → $post_errors), resetting attempt count" >&2
        # Remove previous attempts for this file since it's improving
        if [ -f "$ATTEMPT_LOG" ]; then
            grep -v "^$file:" "$ATTEMPT_LOG" > "${ATTEMPT_LOG}.tmp" && mv "${ATTEMPT_LOG}.tmp" "$ATTEMPT_LOG"
        fi
    fi
}