#!/bin/bash

# Parallel Intelligent Linter - Run 3 concurrent workers from one script
# This avoids lock conflicts by managing workers internally
# Features: Smart retry logic, error progress tracking, blacklist system

# Source attempt tracking functions
source scripts/track-attempts.sh

echo "🚀 Starting 3 parallel intelligent linter workers with smart retry logic..."

# Create a simple round-robin file assignment
declare -A worker_files
worker_count=3

# Function to get files with errors (randomized, excluding blocklist)
get_error_files() {
    local blocklist_file="scripts/failed-files.log"
    
    # Use proper type-check instead of raw tsc to get accurate error files
    echo "📊 Running type-check to find files with errors..." >&2
    local error_files=$(cd apps/claude-code-zen-server && pnpm run type-check 2>&1 | grep "error TS" | cut -d'(' -f1 | sort -u | sed 's|^src/|apps/claude-code-zen-server/src/|')
    
    if [ -f "$blocklist_file" ]; then
        # Extract blocked filenames (ignore comments and empty lines)
        local blocked_files=$(grep -v "^#" "$blocklist_file" | grep -v "^$" | cut -d':' -f1)
        
        # Filter out blocked files
        for file in $error_files; do
            local is_blocked=false
            for blocked in $blocked_files; do
                if [ "$file" = "$blocked" ]; then
                    echo "🚫 Skipping blocked file: $file" >&2
                    is_blocked=true
                    break
                fi
            done
            if [ "$is_blocked" = false ]; then
                echo "$file"
            fi
        done | shuf
    else
        echo "$error_files" | shuf
    fi
}

# Function to assign file to worker based on hash
assign_file_to_worker() {
    local file="$1"
    local hash=$(echo "$file" | md5sum | cut -d' ' -f1)
    local worker_id=$(( 0x${hash:0:8} % worker_count ))
    echo $worker_id
}

# Worker function
run_worker() {
    local worker_id=$1
    echo "🔧 Worker #$worker_id starting..."
    
    while true; do
        # Get list of error files
        mapfile -t error_files < <(get_error_files)
        
        if [ ${#error_files[@]} -eq 0 ]; then
            echo "✅ Worker #$worker_id: No more files with errors found, waiting..."
            sleep 10
            continue
        fi
        
        # Find a file for this worker (try assigned first, then any available)
        assigned_file=""
        
        # First try: files specifically assigned to this worker
        for file in "${error_files[@]}"; do
            if [ -f "$file" ]; then
                file_worker=$(assign_file_to_worker "$file")
                if [ "$file_worker" -eq "$worker_id" ]; then
                    assigned_file="$file"
                    break
                fi
            fi
        done
        
        # Second try: if no assigned file found, take any available file
        if [ -z "$assigned_file" ]; then
            for file in "${error_files[@]}"; do
                if [ -f "$file" ]; then
                    assigned_file="$file"
                    break
                fi
            done
        fi
        
        if [ -n "$assigned_file" ]; then
            echo "🎯 Worker #$worker_id processing: $assigned_file"
            # Check if file should be skipped (blacklisted after 2+ failed attempts)
            if should_blacklist_file "$assigned_file" "0"; then
                echo "🚫 Worker #$worker_id: File $assigned_file is blacklisted, skipping"
                continue
            fi
            
            echo "📈 Pre-fix error count for $assigned_file:"
            local pre_errors=$(cd apps/claude-code-zen-server && pnpm run type-check 2>&1 | grep "$(basename $assigned_file)" | grep "error TS" | wc -l)
            echo "   Errors: $pre_errors (attempt #$(get_attempt_count "$assigned_file"))"
            
            timeout 600 node scripts/intelligent-linter.mjs "$assigned_file" --timeout 300 --best-effort
            local lint_result=$?
            
            # Check post-fix error count
            local post_errors=$(cd apps/claude-code-zen-server && pnpm run type-check 2>&1 | grep "$(basename $assigned_file)" | grep "error TS" | wc -l)
            echo "📈 Post-fix error count: $post_errors (was $pre_errors)"
            
            if [ $lint_result -eq 0 ]; then
                if [ $post_errors -lt $pre_errors ]; then
                    echo "✅ Worker #$worker_id SUCCESS: $assigned_file (reduced $pre_errors → $post_errors errors)"
                    record_attempt "$assigned_file" "$pre_errors" "$post_errors" "SUCCESS"
                    reset_attempts_if_improved "$assigned_file" "$pre_errors" "$post_errors"
                elif [ $post_errors -eq 0 ]; then
                    echo "🎉 Worker #$worker_id PERFECT: $assigned_file (all errors fixed!)"
                    record_attempt "$assigned_file" "$pre_errors" "$post_errors" "PERFECT"
                    reset_attempts_if_improved "$assigned_file" "$pre_errors" "$post_errors"
                else
                    echo "⚠️ Worker #$worker_id NO_IMPROVEMENT: $assigned_file (still $post_errors errors)"
                    record_attempt "$assigned_file" "$pre_errors" "$post_errors" "NO_IMPROVEMENT"
                    
                    # Check if should blacklist after 2+ failed attempts
                    if should_blacklist_file "$assigned_file" "$post_errors"; then
                        add_to_blacklist "$assigned_file" "$post_errors" "no_improvement_after_2_attempts"
                    fi
                fi
            else
                echo "⚠️ Worker #$worker_id timeout/error: $assigned_file"
                record_attempt "$assigned_file" "$pre_errors" "$pre_errors" "TIMEOUT_ERROR"
                
                # Check if should blacklist after 2+ failed attempts
                if should_blacklist_file "$assigned_file" "$pre_errors"; then
                    add_to_blacklist "$assigned_file" "$pre_errors" "timeout_error_after_2_attempts"
                fi
            fi
            if [ $? -eq 0 ]; then
                echo "✅ Worker #$worker_id completed: $assigned_file"
            else
                echo "⚠️ Worker #$worker_id timeout/error: $assigned_file"
            fi
        else
            echo "🔄 Worker #$worker_id: No assigned files, waiting..."
            sleep 5
        fi
        
        sleep 1
    done
}

# Start workers in background
for i in {0..2}; do
    run_worker $i &
    worker_pids[$i]=$!
done

echo "🚀 Started workers: ${worker_pids[*]}"
echo "📊 Progress tracking:"

# Monitor workers
while true; do
    sleep 30
    echo "📈 $(date): Workers still running: ${worker_pids[*]}"
    
    # Check if all workers are still alive
    all_alive=true
    for pid in "${worker_pids[@]}"; do
        if ! kill -0 "$pid" 2>/dev/null; then
            all_alive=false
            break
        fi
    done
    
    if ! $all_alive; then
        echo "⚠️ Some workers died, restarting..."
        # Kill remaining workers
        for pid in "${worker_pids[@]}"; do
            kill "$pid" 2>/dev/null
        done
        # Restart all workers
        for i in {0..2}; do
            run_worker $i &
            worker_pids[$i]=$!
        done
    fi
done