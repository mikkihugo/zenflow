#!/usr/bin/env bash

# Smart Claude Fixer - 60min max, 1 at a time, skip human-needed errors
#
# A script to automatically run the 'claude' AI code fixer on a TypeScript
# project. It includes a locking mechanism to ensure only one instance runs,
# a timeout for the main process, and automatic git commits/pushes for
# any changes made. This version includes intelligent backoff for API rate limits.

# --- Configuration ---
# All user-configurable variables are defined here for easy management.

# Project and Tool Paths
# Path to the Node.js binary directory.
NODE_BIN_DIR="/home/mhugo/.local/share/mise/installs/node/22.17.1/bin"
# Full path to the project directory where git commands will be run.
PROJECT_DIR="/home/mhugo/code/claude-code-zen"
# Full path to the claude executable.
CLAUDE_EXEC="${PROJECT_DIR}/node_modules/.bin/claude"

# Locking and Runtime Configuration
# Lock file to prevent multiple instances from running.
LOCK_FILE="/tmp/smart-claude-fixer.lock"
# Context file for the session, tied to the script's PID.
CONTEXT_FILE="/tmp/claude-context-$$.json"
# Maximum time in seconds the script is allowed to run.
MAX_SESSION_RUNTIME=3600 # 60 minutes
# Maximum time in seconds for a single 'claude' command to run.
CLAUDE_TIMEOUT=300 # 5 minutes
# Default pause duration in seconds between 'claude' runs.
LOOP_SLEEP_DURATION=30

# --- Script Core ---
# Exit immediately if a command exits with a non-zero status.
set -euo pipefail
# Set PATH for cron environment.
export PATH="${NODE_BIN_DIR}:${PATH}"

# --- Functions ---

# Prints a log message with a timestamp.
# Usage: log "Your message here"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Handles stale locks by checking the running process.
# If the process is gone or has run for too long, it kills it and removes the lock.
handle_stale_lock() {
    if [ ! -f "$LOCK_FILE" ]; then
        return 0 # No lock file, so we can proceed.
    fi

    local pid
    pid=$(cat "$LOCK_FILE" 2>/dev/null)

    if [ -z "$pid" ]; then
        log "Stale lock file found (empty PID). Removing."
        rm -f "$LOCK_FILE"
        return 0
    fi

    # Check if the process with that PID is still running.
    if ! kill -0 "$pid" 2>/dev/null; then
        log "Stale lock file found (process with PID $pid is not running). Removing."
        rm -f "$LOCK_FILE"
        return 0
    fi

    # Check if the running process has exceeded its max runtime.
    local start_time
    start_time=$(stat -c %Y "$LOCK_FILE")
    local runtime=$(( $(date +%s) - start_time ))

    if [ "$runtime" -gt "$MAX_SESSION_RUNTIME" ]; then
        log "Process with PID $pid has exceeded max runtime (${runtime}s > ${MAX_SESSION_RUNTIME}s). Killing it."
        # Attempt to terminate gracefully, then kill forcefully.
        kill -TERM "$pid" 2>/dev/null || true
        sleep 3
        kill -KILL "$pid" 2>/dev/null || true
        rm -f "$LOCK_FILE"
        log "Killed stale process $pid."
        return 0
    fi

    # If we reach here, a valid process is still running within its time limit.
    log "Another instance is running (PID: $pid, Runtime: ${runtime}s). Exiting."
    return 1
}

# Acquires a lock for the script.
acquire_lock() {
    if ! handle_stale_lock; then
        exit 0 # Exit cleanly if another valid process is running.
    fi
    echo $$ > "$LOCK_FILE"
    log "Lock acquired (PID: $$)"
}

# Releases the lock file.
release_lock() {
    rm -f "$LOCK_FILE"
    log "Lock released."
}

# Cleanup function to be called on script exit.
cleanup() {
    log "Running cleanup..."
    release_lock
    # Clean up the session's context file.
    rm -f "$CONTEXT_FILE"
    log "Cleanup complete. Exiting."
}

# The main worker process that runs the fixer loop.
run_smart_fixer() {
    cd "$PROJECT_DIR" || { log "FATAL: Failed to change to project directory '${PROJECT_DIR}'"; exit 1; }

    local session_start_time
    session_start_time=$(date +%s)
    log "Starting ${MAX_SESSION_RUNTIME}s smart fixing session in $(pwd)"

    while true; do
        local current_time
        current_time=$(date +%s)
        local session_runtime=$((current_time - session_start_time))

        if [ "$session_runtime" -ge "$MAX_SESSION_RUNTIME" ]; then
            log "Session time limit reached. Exiting gracefully."
            break
        fi

        log "Running claude fixer (${session_runtime}s elapsed)..."

        local prompt="You are an expert TypeScript developer fixing compilation errors in a large codebase (5000+ errors).

IMPORTANT CONTEXT:
- This codebase has been heavily refactored with many renamed and moved files.
- Many imports may be broken due to file relocations.
- If you can't find files, search widely across the entire src/ directory.
- Files may have been consolidated or split during reorganization.

COMPREHENSIVE FIXING MISSION:
Fix ALL solvable TypeScript compilation errors and quality issues.

PRIORITY FIXES (must do):
1. Fix ALL broken imports due to renamed/moved files - search src/ widely.
2. Replace ALL 'any' types with proper TypeScript types.
3. Add missing type annotations to functions, variables, parameters.
4. Resolve ALL TypeScript compilation errors.
5. Add proper async/await typing and error handling.
6. Fix ALL undefined/null reference issues.
7. Add proper generic types where needed.
8. Resolve ALL interface/type mismatches.

OPTIMIZATION FIXES (if obvious):
9. Remove unused variables and dead code.
10. Fix simple performance issues (inefficient loops, etc.).
11. Add proper error boundaries and validation.
12. Fix obvious security issues (input validation, etc.).

CRITICAL RULES FOR UNSURE ISSUES:
- If you encounter an error you cannot solve confidently, add comment: // xxx NEEDS_HUMAN: [description]
- Skip any existing issues already marked with 'xxx' comments - those are for humans.
- Only fix errors you can solve with 100% confidence.
- DO NOT remove any features or functionality.
- DO NOT ask for human input or clarification.
- Search widely for moved/renamed files before giving up.
- Adhere to existing code style and conventions found in the file. Do not introduce new formatting or patterns.

Your goal: Reduce the 5000+ error count by fixing all SOLVABLE issues and marking unsolvable ones with xxx comments.

VERIFICATION STEPS:
After making fixes, if possible:
1. Run 'npm run build:check' to quickly verify TypeScript compilation (no emit).
2. Run 'npm run test:quick' for fast test validation.
3. If errors reduced, run full 'npm run build' to ensure everything compiles.
4. Only commit changes if build succeeds or error count improves.
5. If build fails worse than before, revert changes.

Focus on INCREMENTAL PROGRESS - even fixing 10 errors per run helps!"

        # Run Claude with a timeout and capture all output. The `|| true` prevents `set -e` from exiting on failure.
        local claude_output
        local exit_code
        claude_output=$(timeout "$CLAUDE_TIMEOUT"s "$CLAUDE_EXEC" -c "$CONTEXT_FILE" -p --dangerously-skip-permissions "$prompt" 2>&1 || true)
        exit_code=$?

        # Intelligent rate-limit handling.
        if [[ "$claude_output" == *"Claude AI usage limit reached"* ]]; then
            local retry_after_timestamp
            retry_after_timestamp=$(echo "$claude_output" | grep -o 'Claude AI usage limit reached|[0-9]*' | cut -d'|' -f2)
            
            if [[ -n "$retry_after_timestamp" ]]; then
                local current_timestamp
                current_timestamp=$(date +%s)
                local sleep_for=$(( retry_after_timestamp - current_timestamp + 5 )) # Add 5s buffer

                if [ "$sleep_for" -gt 0 ]; then
                    log "API rate limit hit. Sleeping for ${sleep_for} seconds until after $(date -d "@$retry_after_timestamp")"
                    sleep "$sleep_for"
                    continue # Skip the rest of the loop and try again.
                fi
            fi
        fi

        # Standard handling for other errors or success.
        if [ "$exit_code" -eq 0 ]; then
            log "Claude run completed successfully."
        elif [ "$exit_code" -eq 124 ]; then
            log "WARNING: Claude run timed out after ${CLAUDE_TIMEOUT}s. Checking for partial changes."
        else
            log "WARNING: Claude run failed with exit code $exit_code. Checking for partial changes."
        fi

        if [ -n "$claude_output" ]; then
            log "--- Claude Output (first 20 lines) ---"
            echo "$claude_output" | head -20 | sed 's/^/  /'
            log "--------------------------------------"
        fi

        # Check for any changes (staged or unstaged).
        if [ -n "$(git status --porcelain)" ]; then
            log "Changes detected, processing..."
            local changed_files
            changed_files=$(git status --porcelain | awk '{print $2}')
            local file_count
            file_count=$(echo "$changed_files" | wc -l)

            log "Changed files ($file_count):"
            echo "$changed_files" | sed 's/^/  - /'

            git add -A

            local commit_msg
            commit_msg="Auto-fix: Improve ${file_count} file(s) at $(date '+%Y-%m-%d %H:%M')

Files changed in this automatic commit:
$(echo "$changed_files" | sed 's/^/- /')

Generated by the Claude comprehensive fixer script."

            if git commit -m "$commit_msg"; then
                log "Changes committed successfully."
                if git push; then
                    log "Changes pushed to remote successfully."
                else
                    log "ERROR: Git push failed. Changes are committed locally but not pushed."
                fi
            else
                log "ERROR: Git commit failed. Staging will be reset."
                git reset
            fi
        else
            log "No changes detected in this iteration."
        fi

        log "Sleeping for ${LOOP_SLEEP_DURATION}s before next iteration..."
        sleep "$LOOP_SLEEP_DURATION"
    done
}

# --- Main Entrypoint ---

# Register the cleanup function to run on exit, interrupt, or termination.
trap cleanup EXIT INT TERM

main() {
    case "${1:-run}" in
        run)
            acquire_lock
            run_smart_fixer
            ;;
        status)
            if handle_stale_lock; then
                log "Smart fixer is not running."
            fi
            ;;
        stop)
            log "Attempting to stop the smart fixer..."
            if [ -f "$LOCK_FILE" ]; then
                local pid
                pid=$(cat "$LOCK_FILE")
                if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                    log "Sending TERM signal to process $pid."
                    kill -TERM "$pid"
                    # The trap in the running script will handle cleanup.
                    log "Stop signal sent."
                else
                    log "No running process found. Cleaning up stale lock file."
                    rm -f "$LOCK_FILE"
                fi
            else
                log "Smart fixer is not running (no lock file)."
            fi
            ;;
        *)
            echo "Usage: $0 [run|status|stop]"
            exit 1
            ;;
    esac
}

# Execute the main function with all script arguments.
main "$@"
