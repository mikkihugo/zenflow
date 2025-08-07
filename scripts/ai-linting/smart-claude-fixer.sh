#!/usr/bin/env bash

# Smart Claude Fixer - 60min max, 1 at a time, skip human-needed errors

set -euo pipefail

LOCK_FILE="/tmp/smart-claude-fixer.lock"
PID_FILE="/tmp/smart-claude-fixer.pid" 
MAX_RUNTIME=3600  # 60 minutes
CHECK_INTERVAL=60 # 1 minute

log() { echo "[$(date '+%H:%M:%S')] $1"; }

# Check if another process is running
check_if_running() {
    if [ -f "$LOCK_FILE" ]; then
        local old_pid
        old_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        
        if [ -n "$old_pid" ] && kill -0 "$old_pid" 2>/dev/null; then
            local runtime=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
            
            if [ $runtime -gt $MAX_RUNTIME ]; then
                log "Old process exceeded 60min, killing it"
                kill -TERM "$old_pid" 2>/dev/null || true
                sleep 3
                kill -KILL "$old_pid" 2>/dev/null || true
                rm -f "$LOCK_FILE" "$PID_FILE"
                return 1  # Can start new
            else
                log "Process still running (${runtime}s), waiting..."
                return 0  # Still running
            fi
        else
            log "Stale lock file, removing"
            rm -f "$LOCK_FILE" "$PID_FILE"
            return 1  # Can start new
        fi
    fi
    return 1  # Can start new
}

# Acquire lock
acquire_lock() {
    echo $$ > "$LOCK_FILE"
    echo $$ > "$PID_FILE"
    log "Lock acquired (PID: $$)"
}

# Release lock  
release_lock() {
    rm -f "$LOCK_FILE" "$PID_FILE"
    log "Lock released"
}

# Cleanup on exit
cleanup() {
    release_lock
    exit 0
}
trap cleanup EXIT INT TERM

# Main fixer process
run_smart_fixer() {
    # Change to project directory for git operations
    cd /home/mhugo/code/claude-code-zen || {
        log "Failed to change to project directory"
        return 1
    }
    
    local start_time=$(date +%s)
    log "Starting 60-minute smart fixing session in $(pwd)"
    
    while true; do
        local current_time=$(date +%s)
        local runtime=$((current_time - start_time))
        
        # Check 60 minute limit
        if [ $runtime -gt $MAX_RUNTIME ]; then
            log "60 minute limit reached, exiting gracefully"
            break
        fi
        
        log "Running claude -p (${runtime}s elapsed)..."
        
        # Enhanced prompt for comprehensive fixing with rename/move handling
        local prompt="You are an expert TypeScript developer fixing compilation errors in a large codebase (5000+ errors).

IMPORTANT CONTEXT:
- This codebase has been heavily refactored with many renamed and moved files
- Many imports may be broken due to file relocations
- If you can't find files, search widely across the entire src/ directory
- Files may have been consolidated or split during reorganization

COMPREHENSIVE FIXING MISSION:
Fix ALL solvable TypeScript compilation errors and quality issues.

PRIORITY FIXES (must do):
1. Fix ALL broken imports due to renamed/moved files - search src/ widely
2. Replace ALL 'any' types with proper TypeScript types
3. Add missing type annotations to functions, variables, parameters
4. Resolve ALL TypeScript compilation errors
5. Add proper async/await typing and error handling
6. Fix ALL undefined/null reference issues
7. Add proper generic types where needed
8. Resolve ALL interface/type mismatches

OPTIMIZATION FIXES (if obvious):
9. Remove unused variables and dead code
10. Fix simple performance issues (inefficient loops, etc.)
11. Add proper error boundaries and validation
12. Fix obvious security issues (input validation, etc.)

CRITICAL RULES FOR UNSURE ISSUES:
- If you encounter an error you cannot solve confidently, add comment: // xxx NEEDS_HUMAN: [description]
- Skip any existing issues already marked with 'xxx' comments - those are for humans
- Only fix errors you can solve with 100% confidence
- DO NOT remove any features or functionality
- DO NOT ask for human input or clarification
- Search widely for moved/renamed files before giving up

Your goal: Reduce the 5000+ error count by fixing all SOLVABLE issues and marking unsolvable ones with xxx comments."

        # Use local project Claude Code 1.0.70 with Node.js path
        export PATH="/home/mhugo/.local/share/mise/installs/node/22.17.1/bin:$PATH"
        if timeout 300s /home/mhugo/code/claude-code-zen/node_modules/.bin/claude -p --continue --dangerously-skip-permissions --permission-mode bypassPermissions "$prompt" 2>&1; then
            log "Claude run completed successfully"
        else
            log "Claude run failed or timed out, but checking for changes..."
        fi
        
        # ALWAYS commit and push after each run if changes exist
        if ! git diff --quiet || ! git diff --cached --quiet; then
            log "Changes detected, committing and pushing..."
            git add -A
            if git commit -m "Auto-fix: Build fixes $(date '+%Y-%m-%d %H:%M')" 2>/dev/null; then
                log "Changes committed successfully"
                if git push 2>/dev/null; then
                    log "Changes pushed to remote"
                else
                    log "Push failed, but changes committed locally"
                fi
            else
                log "Commit failed, but continuing..."
            fi
        else
            log "No changes detected"
        fi
        
        # Brief pause before next iteration
        sleep 30
    done
    
    log "Smart fixer session complete (60 min limit reached)"
}

# Main logic
main() {
    case "${1:-run}" in
        "run")
            # Check if can start new process
            if check_if_running; then
                log "Another process is still running, exiting"
                exit 0
            fi
            
            # Start new process
            acquire_lock
            run_smart_fixer
            ;;
        "status")
            if check_if_running; then
                local pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "none")
                local runtime=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
                log "Smart fixer running (PID: $pid, Runtime: ${runtime}s)"
            else
                log "Smart fixer not running"
            fi
            ;;
        "stop")
            if [ -f "$LOCK_FILE" ]; then
                local pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
                if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                    log "Stopping smart fixer (PID: $pid)"
                    kill -TERM "$pid"
                    rm -f "$LOCK_FILE" "$PID_FILE"
                    log "Stopped"
                else
                    log "Process not running"
                fi
            else
                log "Smart fixer not running"
            fi
            ;;
        *)
            echo "Usage: $0 [run|status|stop]"
            exit 1
            ;;
    esac
}

main "$@"