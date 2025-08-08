#!/usr/bin/env bash

# Smart Gemini Fixer - 60min max, 1 at a time, skip human-needed errors
#
# A script to automatically run the 'gemini' AI code fixer on a TypeScript
# project. It includes a locking mechanism to ensure only one instance runs
# and automatic git commits/pushes for any changes made.

# --- Configuration ---
# All user-configurable variables are defined here for easy management.

# Project and Tool Paths
# Path to the Node.js binary directory (if needed by your environment).
NODE_BIN_DIR="/home/mhugo/.local/share/mise/installs/node/22.17.1/bin"
# Full path to the project directory where git commands will be run.
PROJECT_DIR="/home/mhugo/code/claude-code-zen"
# Name or full path of the gemini executable.
GEMINI_EXEC="gemini"

# Locking and Runtime Configuration
# Lock file to prevent multiple instances from running.
LOCK_FILE="/tmp/smart-gemini-fixer.lock"
# Temporary file to store gemini output for the session.
GEMINI_OUTPUT_LOG="/tmp/gemini-output-$$.log"
# Maximum time in seconds the script is allowed to run.
MAX_SESSION_RUNTIME=3600 # 60 minutes

# --- Script Core ---
# Exit immediately if a command exits with a non-zero status.
set -euo pipefail
# Set PATH for cron environment.
export PATH="${NODE_BIN_DIR}:${PATH}"
# Set the Google Cloud Project ID for the gemini-cli.
export GOOGLE_CLOUD_PROJECT="singularity-460212"

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
    if [[ "$(uname)" == "Darwin" ]]; then # macOS
        start_time=$(stat -f %m "$LOCK_FILE")
    else # Linux
        start_time=$(stat -c %Y "$LOCK_FILE")
    fi
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
    # Clean up the session's temporary output log.
    rm -f "$GEMINI_OUTPUT_LOG"
    log "Cleanup complete. Exiting."
}

# NEW: A dedicated function to check status without modifying the lock file.
check_status() {
    if [ ! -f "$LOCK_FILE" ]; then
        log "Smart fixer is not running (no lock file)."
        return
    fi

    local pid
    pid=$(cat "$LOCK_FILE" 2>/dev/null)

    if [ -z "$pid" ]; then
        log "Smart fixer is not running (lock file is empty)."
        return
    fi

    if ! kill -0 "$pid" 2>/dev/null; then
        log "Smart fixer is not running (process with PID $pid is not running, lock is stale)."
        return
    fi

    local start_time
    if [[ "$(uname)" == "Darwin" ]]; then # macOS
        start_time=$(stat -f %m "$LOCK_FILE")
    else # Linux
        start_time=$(stat -c %Y "$LOCK_FILE")
    fi
    local runtime=$(( $(date +%s) - start_time ))
    log "Smart fixer is RUNNING (PID: $pid, Runtime: ${runtime}s)."
}


# The main worker process that runs the fixer.
run_smart_fixer() {
    cd "$PROJECT_DIR" || { log "FATAL: Failed to change to project directory '${PROJECT_DIR}'"; exit 1; }

    log "Starting one-time ${MAX_SESSION_RUNTIME}s smart fixing session in $(pwd)"

    local prompt="You are an expert TypeScript developer fixing compilation errors in a large codebase (5000+ errors).

IMPORTANT CONTEXT:
- This codebase has been heavily refactored with many renamed and moved files.
- Many imports may be broken due to file relocations.
- If you can't find files, search widely across the entire src/ directory.
- Files may have been consolidated or split during reorganization.

COMPREHENSIVE FIXING MISSION:
Fix ALL solvable TypeScript compilation errors and quality issues in a single session.

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

Focus on making as much progress as possible in this single session."

    # Run Gemini with a 60-minute timeout, yolo flag.
    # Use `tee` to show live output in the terminal AND capture it to a file.
    local exit_code
    log "Executing Gemini command with a ${MAX_SESSION_RUNTIME}s timeout... Output will be shown live."
    
    # Use `pipefail` to ensure we get the exit code from `timeout`, not `tee`.
    set -o pipefail
    timeout "$MAX_SESSION_RUNTIME"s "$GEMINI_EXEC" -y -p "$prompt" 2>&1 | tee "$GEMINI_OUTPUT_LOG"
    exit_code=${PIPESTATUS[0]}
    set +o pipefail
    
    log "Gemini command finished with exit code: $exit_code"

    # Read the captured output from the log file for analysis.
    local gemini_output
    gemini_output=$(<"$GEMINI_OUTPUT_LOG")

    if [ "$exit_code" -eq 124 ]; then
        log "WARNING: Gemini run timed out after ${MAX_SESSION_RUNTIME}s. Checking for partial changes."
    elif [ "$exit_code" -ne 0 ]; then
        log "WARNING: Gemini run failed with exit code $exit_code."
    else
        log "Gemini run completed successfully."
    fi

    if [ -z "$gemini_output" ]; then
        log "Gemini command produced no output."
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

Generated by the Gemini comprehensive fixer script."

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
        log "No changes detected in this session."
    fi
    
    log "Smart fixer session complete."
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
            check_status
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
