#!/usr/bin/env bash

# Claude Code Continuous Fixer - 24/7 Aggressive Mode
# Runs every 5 minutes, max 1 process, 60 minute timeout, handles 5000+ errors

set -euo pipefail

# Configuration for aggressive fixing
LOCK_FILE="/tmp/claude-fixer.lock"
LOG_FILE="/tmp/claude-fixer-continuous.log"
MAX_RUNTIME=3600  # 60 minutes in seconds
MAX_FIXES_PER_RUN=10  # Increased for aggressive mode
CHECK_INTERVAL=300    # 5 minutes
PID_FILE="/tmp/claude-fixer.pid"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')][CONTINUOUS-FIXER]${NC} $1" | tee -a "$LOG_FILE"; }
info() { echo -e "${BLUE}[$(date '+%H:%M:%S')][INFO]${NC} $1" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')][WARNING]${NC} $1" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')][ERROR]${NC} $1" | tee -a "$LOG_FILE"; }

# Process management functions
acquire_lock() {
    # Check if another process is running
    if [ -f "$LOCK_FILE" ]; then
        local lock_pid
        lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        
        # Check if PID is still running
        if [ -n "$lock_pid" ] && kill -0 "$lock_pid" 2>/dev/null; then
            local runtime
            runtime=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo 0) ))
            
            if [ $runtime -gt $MAX_RUNTIME ]; then
                warn "Process $lock_pid exceeded max runtime (${runtime}s), killing it"
                kill -TERM "$lock_pid" 2>/dev/null || true
                sleep 5
                kill -KILL "$lock_pid" 2>/dev/null || true
                rm -f "$LOCK_FILE" "$PID_FILE"
            else
                info "Another fixer process is running (PID: $lock_pid, runtime: ${runtime}s)"
                return 1
            fi
        else
            warn "Stale lock file found, removing it"
            rm -f "$LOCK_FILE" "$PID_FILE"
        fi
    fi
    
    # Acquire lock
    echo $$ > "$LOCK_FILE"
    echo $$ > "$PID_FILE"
    log "🔒 Lock acquired (PID: $$)"
    return 0
}

release_lock() {
    rm -f "$LOCK_FILE" "$PID_FILE"
    log "🔓 Lock released"
}

# Cleanup on exit
cleanup() {
    local exit_code=$?
    log "🧹 Cleaning up (exit code: $exit_code)..."
    release_lock
    exit $exit_code
}
trap cleanup EXIT INT TERM

# Timeout handler
setup_timeout() {
    # Set up timeout using background sleep + kill
    (
        sleep $MAX_RUNTIME
        if [ -f "$PID_FILE" ]; then
            local main_pid
            main_pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
            if [ -n "$main_pid" ] && kill -0 "$main_pid" 2>/dev/null; then
                warn "Max runtime exceeded, terminating process $main_pid"
                kill -TERM "$main_pid" 2>/dev/null || true
            fi
        fi
    ) &
    local timeout_pid=$!
    echo $timeout_pid > "/tmp/claude-fixer-timeout.pid"
}

# Kill timeout handler
kill_timeout() {
    local timeout_pid_file="/tmp/claude-fixer-timeout.pid"
    if [ -f "$timeout_pid_file" ]; then
        local timeout_pid
        timeout_pid=$(cat "$timeout_pid_file" 2>/dev/null || echo "")
        if [ -n "$timeout_pid" ]; then
            kill "$timeout_pid" 2>/dev/null || true
        fi
        rm -f "$timeout_pid_file"
    fi
}

# Enhanced file finder for 5000+ errors
find_files_with_errors() {
    log "🔍 Scanning for files with errors (aggressive mode)..."
    
    local files_with_issues=()
    
    # Strategy 1: Recently modified files (likely to have new issues)
    mapfile -t recent_files < <(find src -name "*.ts" -mtime -1 -type f 2>/dev/null | head -5 || true)
    
    # Strategy 2: Large files (often have more issues)
    mapfile -t large_files < <(find src -name "*.ts" -size +1k -type f 2>/dev/null | head -5 || true)
    
    # Strategy 3: Random sample for comprehensive coverage
    mapfile -t random_files < <(find src -name "*.ts" -type f 2>/dev/null | shuf | head -10 || true)
    
    # Combine and deduplicate
    local all_files=("${recent_files[@]}" "${large_files[@]}" "${random_files[@]}")
    local unique_files=($(printf '%s\n' "${all_files[@]}" | sort -u | head -20))
    
    if [ ${#unique_files[@]} -eq 0 ]; then
        warn "No TypeScript files found"
        return 1
    fi
    
    log "📁 Found ${#unique_files[@]} files to analyze"
    printf '%s\n' "${unique_files[@]}"
}

# Quick error detection (faster than full analysis)
has_obvious_errors() {
    local file="$1"
    
    # Quick heuristics for obvious errors
    if grep -q "any\|TODO\|FIXME\|console\.log\|debugger" "$file" 2>/dev/null; then
        return 0  # Has obvious issues
    fi
    
    # Check for missing types (function without types)
    if grep -q "function.*(" "$file" && ! grep -q ": .*=>" "$file" 2>/dev/null; then
        return 0  # Likely missing types
    fi
    
    return 1  # No obvious errors
}

# Optimized fixing with better error detection
fix_file_aggressively() {
    local file="$1"
    local backup_file="${file}.backup-$(date +%s)"
    local fixed_file="/tmp/claude-fix-aggressive-$$.ts"
    
    log "🔧 Aggressively fixing: $(basename "$file")"
    
    # Quick pre-check
    if ! has_obvious_errors "$file"; then
        info "✨ $(basename "$file") appears clean, skipping"
        return 1
    fi
    
    # Backup original
    cp "$file" "$backup_file"
    
    # Get file stats for validation
    local original_lines
    original_lines=$(wc -l < "$file")
    
    # Use Claude Code for aggressive fixing
    timeout 180s claude code > "$fixed_file" 2>/dev/null <<EOF || {
        warn "Claude Code analysis timed out for $(basename "$file")"
        rm -f "$backup_file" "$fixed_file"
        return 1
    }
URGENT: Fix ALL issues in this TypeScript file. This is part of fixing 5000+ errors.

\`\`\`typescript
$(cat "$file")
\`\`\`

AGGRESSIVE FIXES NEEDED:
1. Replace ALL 'any' types with proper types
2. Add ALL missing type annotations  
3. Fix ALL async/await issues
4. Remove ALL unused imports/variables
5. Add proper error handling
6. Fix ALL security issues
7. Remove console.log/debugger statements
8. Add proper null checks
9. Optimize ALL performance issues
10. Fix ALL code smells

CRITICAL: Return ONLY the corrected TypeScript code with NO explanations.
Make the code compile and fix every issue you can find.
The code must be production-ready.

Fixed code:
EOF
    
    # Validate fix
    if [ ! -f "$fixed_file" ] || [ ! -s "$fixed_file" ]; then
        warn "Fix generation failed for $(basename "$file")"
        rm -f "$backup_file" "$fixed_file"
        return 1
    fi
    
    local fixed_lines
    fixed_lines=$(wc -l < "$fixed_file")
    
    # Size validation (allow more variation for aggressive fixing)
    if [ $((fixed_lines * 3)) -lt "$original_lines" ] || [ $((original_lines * 3)) -lt "$fixed_lines" ]; then
        warn "Fix too different for $(basename "$file") (${original_lines} -> ${fixed_lines} lines)"
        rm -f "$backup_file" "$fixed_file"
        return 1
    fi
    
    # Apply fix
    cp "$fixed_file" "$file"
    
    # TypeScript validation (quick check)
    if command -v npx >/dev/null 2>&1; then
        if ! timeout 30s npx tsc --noEmit --skipLibCheck "$file" >/dev/null 2>&1; then
            warn "Fixed file has TypeScript errors, reverting $(basename "$file")"
            cp "$backup_file" "$file"
            rm -f "$backup_file" "$fixed_file"
            return 1
        fi
    fi
    
    # Success
    rm -f "$backup_file" "$fixed_file"
    log "✅ Aggressively fixed: $(basename "$file")"
    return 0
}

# Direct commit to main (no branching)
prepare_direct_commit() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        warn "Not in git repo, applying fixes directly to files"
        return 1
    fi
    
    # Make sure we're on main branch
    local current_branch
    current_branch=$(git branch --show-current 2>/dev/null || echo "main")
    
    if [ "$current_branch" != "main" ]; then
        log "🔄 Switching to main branch from $current_branch"
        git checkout main >/dev/null 2>&1 || {
            warn "Could not switch to main, staying on $current_branch"
        }
    fi
    
    log "⚡ Ready for direct commits to main"
    echo "main"
    return 0
}

# Enhanced commit with better messages
commit_aggressive_fixes() {
    local branch_name="$1"
    shift
    local fixed_files=("$@")
    
    if [ ${#fixed_files[@]} -eq 0 ]; then
        warn "No files to commit"
        return 1
    fi
    
    # Stage all fixed files
    for file in "${fixed_files[@]}"; do
        git add "$file" 2>/dev/null || warn "Could not stage $file"
    done
    
    if git diff --cached --quiet; then
        warn "No actual changes to commit"
        return 1
    fi
    
    # Direct commit message for aggressive fixing on main
    local commit_msg="🤖 Auto-fix: ${#fixed_files[@]} files improved

Continuous fixes applied directly to main:
$(printf '• %s\n' "${fixed_files[@]}" | sed 's/.*\///g')

5000+ error reduction - $(date '+%H:%M:%S')"
    
    if git commit -m "$commit_msg" >/dev/null 2>&1; then
        log "💾 Direct commit: ${#fixed_files[@]} fixes to main"
        
        # Auto-push to main if remote exists  
        if git remote get-url origin >/dev/null 2>&1; then
            if git push origin main >/dev/null 2>&1; then
                log "🚀 Pushed fixes to remote main"
            fi
        fi
        return 0
    else
        error "Direct commit failed"
        return 1
    fi
}

# Main aggressive fixing loop
main_continuous_fixer() {
    local start_time=$(date +%s)
    log "🚀 Starting AGGRESSIVE continuous fixer (PID: $$)"
    log "📊 Target: 5000+ errors | Max runtime: ${MAX_RUNTIME}s | Max fixes: $MAX_FIXES_PER_RUN"
    
    # Setup timeout protection
    setup_timeout
    
    # Find files to fix
    local files_to_fix
    mapfile -t files_to_fix < <(find_files_with_errors) || {
        error "No files found to analyze"
        return 1
    }
    
    # Prepare for direct commits to main
    local branch_name
    branch_name=$(prepare_direct_commit) || branch_name=""
    
    # Track progress
    local fixed_files=()
    local fixes_applied=0
    local errors_encountered=0
    
    # Aggressive fixing loop
    for file in "${files_to_fix[@]}"; do
        # Check runtime limit
        local current_runtime=$(( $(date +%s) - start_time ))
        if [ $current_runtime -gt $((MAX_RUNTIME - 300)) ]; then  # Stop 5 min before limit
            warn "Approaching max runtime (${current_runtime}s), stopping gracefully"
            break
        fi
        
        # Check fix limit
        if [ $fixes_applied -ge $MAX_FIXES_PER_RUN ]; then
            log "🎯 Reached max fixes per run ($MAX_FIXES_PER_RUN)"
            break
        fi
        
        # Skip if file doesn't exist
        if [ ! -f "$file" ]; then
            continue
        fi
        
        # Try to fix aggressively
        if fix_file_aggressively "$file"; then
            fixed_files+=("$file")
            ((fixes_applied++))
            log "⚡ Fixed ($fixes_applied/$MAX_FIXES_PER_RUN): $(basename "$file")"
        else
            ((errors_encountered++))
            if [ $errors_encountered -gt 5 ]; then
                warn "Too many errors ($errors_encountered), taking short break"
                sleep 10
                errors_encountered=0
            fi
        fi
        
        # Brief pause to avoid overwhelming Claude API
        sleep 1
    done
    
    # Cleanup timeout handler
    kill_timeout
    
    # Final runtime
    local total_runtime=$(( $(date +%s) - start_time ))
    
    # Summary
    log "📊 Continuous fix session complete!"
    log "⏱️  Runtime: ${total_runtime}s / ${MAX_RUNTIME}s"
    log "🔍 Files analyzed: ${#files_to_fix[@]}"
    log "✅ Files fixed: $fixes_applied"
    log "❌ Errors encountered: $errors_encountered"
    
    # Commit fixes directly to main if we have them
    if [ $fixes_applied -gt 0 ] && [ -n "$branch_name" ]; then
        if commit_aggressive_fixes "$branch_name" "${fixed_files[@]}"; then
            log "🎉 Direct commit: $fixes_applied fixes pushed to main!"
        fi
    elif [ $fixes_applied -gt 0 ]; then
        log "🎉 Applied $fixes_applied fixes (no git available)"
    else
        log "✨ No fixes needed this round"
    fi
    
    # Progress tracking
    local progress_file="/tmp/claude-continuous-progress.txt"
    echo "$(date '+%Y-%m-%d %H:%M:%S'): Fixed $fixes_applied files (Runtime: ${total_runtime}s)" >> "$progress_file"
    
    return 0
}

# Main execution
main() {
    log "🚀 Claude Continuous Fixer starting..."
    
    # Check if Claude Code is available
    if ! command -v claude >/dev/null 2>&1; then
        error "Claude Code CLI not found!"
        exit 1
    fi
    
    # Try to acquire lock
    if ! acquire_lock; then
        exit 0  # Another process running, exit quietly
    fi
    
    # Run the main fixer
    main_continuous_fixer
}

# Handle different modes
case "${1:-continuous}" in
    "continuous")
        main
        ;;
    "status")
        if [ -f "$LOCK_FILE" ]; then
            local pid
            pid=$(cat "$LOCK_FILE")
            if kill -0 "$pid" 2>/dev/null; then
                echo "🟢 Continuous fixer running (PID: $pid)"
                echo "📊 Progress:"
                tail -5 "/tmp/claude-continuous-progress.txt" 2>/dev/null || echo "No progress data yet"
            else
                echo "🔴 Continuous fixer not running (stale lock file)"
            fi
        else
            echo "⚫ Continuous fixer not running"
        fi
        ;;
    "stop")
        if [ -f "$LOCK_FILE" ]; then
            local pid
            pid=$(cat "$LOCK_FILE")
            if kill -0 "$pid" 2>/dev/null; then
                echo "🛑 Stopping continuous fixer (PID: $pid)..."
                kill -TERM "$pid"
                sleep 5
                if kill -0 "$pid" 2>/dev/null; then
                    echo "💥 Force killing..."
                    kill -KILL "$pid"
                fi
                rm -f "$LOCK_FILE" "$PID_FILE"
                echo "✅ Stopped"
            else
                echo "⚫ Process not running"
                rm -f "$LOCK_FILE" "$PID_FILE"
            fi
        else
            echo "⚫ Continuous fixer not running"
        fi
        ;;
    "logs")
        echo "📄 Continuous fixer logs:"
        tail -50 "$LOG_FILE" 2>/dev/null || echo "No logs yet"
        ;;
    "progress")
        echo "📊 Continuous fixer progress:"
        tail -20 "/tmp/claude-continuous-progress.txt" 2>/dev/null || echo "No progress data yet"
        ;;
    *)
        echo "Usage: $0 [continuous|status|stop|logs|progress]"
        echo ""
        echo "Commands:"
        echo "  continuous - Run continuous fixer (default)"
        echo "  status     - Check if fixer is running"
        echo "  stop       - Stop continuous fixer"
        echo "  logs       - Show recent logs"
        echo "  progress   - Show progress history"
        exit 1
        ;;
esac