#!/usr/bin/env bash

# Claude Code Automated Fixer
# Runs on cron, finds issues with AI analysis, and automatically fixes them

set -euo pipefail

# Colors and logging
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[CLAUDE-FIXER]${NC} $1" | tee -a /tmp/claude-fixer.log; }
info() { echo -e "${BLUE}[INFO]${NC} $1" | tee -a /tmp/claude-fixer.log; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a /tmp/claude-fixer.log; }
error() { echo -e "${RED}[ERROR]${NC} $1" | tee -a /tmp/claude-fixer.log; }

# Configuration
MAX_FIXES_PER_RUN=5
BRANCH_PREFIX="claude-auto-fix"
ANALYSIS_DIR="auto-fix-analysis"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# Cleanup function
cleanup() {
    log "🧹 Cleaning up temporary files..."
    rm -f /tmp/claude-analysis-*.txt /tmp/claude-fix-*.ts
    log "👋 Claude Auto-Fixer session ended"
}
trap cleanup EXIT

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v claude >/dev/null 2>&1; then
        missing_deps+=("claude (Claude Code CLI)")
    fi
    
    if ! command -v git >/dev/null 2>&1; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        error "Missing dependencies: ${missing_deps[*]}"
        error "Please install required tools before running auto-fixer"
        exit 1
    fi
}

# Find files that need fixing
find_files_to_fix() {
    log "🔍 Scanning for TypeScript files to analyze..."
    
    # Find recently modified files first (most likely to have issues)
    local recent_files
    mapfile -t recent_files < <(find src -name "*.ts" -mtime -7 -type f 2>/dev/null | head -10 || true)
    
    # If no recent files, get random sample
    if [ ${#recent_files[@]} -eq 0 ]; then
        mapfile -t recent_files < <(find src -name "*.ts" -type f 2>/dev/null | shuf | head -10 || true)
    fi
    
    if [ ${#recent_files[@]} -eq 0 ]; then
        warn "No TypeScript files found to analyze"
        return 1
    fi
    
    printf '%s\n' "${recent_files[@]}"
}

# Analyze file with Claude Code and determine if it needs fixing
needs_fixing() {
    local file="$1"
    local analysis_file="/tmp/claude-analysis-${TIMESTAMP}.txt"
    
    log "🧠 AI analyzing: $(basename "$file")"
    
    # Quick analysis to check if file needs fixing
    claude code > "$analysis_file" 2>/dev/null <<EOF || return 1
Analyze this TypeScript file and determine if it has FIXABLE issues:

\`\`\`typescript
$(cat "$file" 2>/dev/null || echo "// File read error")
\`\`\`

CRITICAL: Only respond with "FIX_NEEDED" or "NO_FIX_NEEDED"

FIX_NEEDED if file has:
- Type safety issues (any types, missing types)
- Simple security issues (missing validation)
- Basic performance problems (inefficient loops)
- Code smells (unused variables, duplicate code)
- Import/export organization issues

NO_FIX_NEEDED if file is clean or issues are too complex for automated fixing.

Response format: Just "FIX_NEEDED" or "NO_FIX_NEEDED" - nothing else.
EOF
    
    local result
    result=$(cat "$analysis_file" 2>/dev/null | tr -d '\n' | tr '[:lower:]' '[:upper:]' || echo "NO_FIX_NEEDED")
    
    if [[ "$result" =~ "FIX_NEEDED" ]]; then
        info "✅ $(basename "$file") needs fixing"
        return 0
    else
        info "✨ $(basename "$file") looks clean"
        return 1
    fi
}

# Fix file using Claude Code
fix_file() {
    local file="$1"
    local backup_file="${file}.backup-${TIMESTAMP}"
    local fixed_file="/tmp/claude-fix-${TIMESTAMP}.ts"
    
    log "🔧 Fixing: $(basename "$file")"
    
    # Backup original
    cp "$file" "$backup_file"
    
    # Get Claude Code to fix the file
    claude code > "$fixed_file" 2>/dev/null <<EOF || return 1
Fix the issues in this TypeScript file. Return ONLY the corrected TypeScript code, no explanations:

\`\`\`typescript
$(cat "$file")
\`\`\`

Fix these types of issues:
- Add proper TypeScript types (replace 'any' with specific types)
- Add missing error handling where obvious
- Fix simple performance issues
- Remove unused imports/variables
- Add proper null checks where needed
- Organize imports properly

Requirements:
1. Return ONLY the fixed TypeScript code
2. Preserve all original functionality
3. Keep the same general structure
4. Don't add complex new features, just fix existing issues
5. Make sure the code compiles

Return the complete fixed file content starting with any imports:
EOF

    # Validate the fix is reasonable (basic sanity check)
    if [ ! -f "$fixed_file" ] || [ ! -s "$fixed_file" ]; then
        warn "Fix generation failed for $(basename "$file")"
        rm -f "$backup_file" "$fixed_file"
        return 1
    fi
    
    # Check if fix is significantly different (probably means it's wrong)
    local original_lines
    local fixed_lines
    original_lines=$(wc -l < "$file")
    fixed_lines=$(wc -l < "$fixed_file")
    
    # If file size changed by more than 50%, it's probably wrong
    if [ $((fixed_lines * 2)) -lt "$original_lines" ] || [ $((original_lines * 2)) -lt "$fixed_lines" ]; then
        warn "Fix seems too different for $(basename "$file") (${original_lines} -> ${fixed_lines} lines)"
        rm -f "$backup_file" "$fixed_file"
        return 1
    fi
    
    # Apply the fix
    cp "$fixed_file" "$file"
    
    # Quick syntax check with TypeScript (if available)
    if command -v npx >/dev/null 2>&1; then
        if ! npx tsc --noEmit --skipLibCheck "$file" >/dev/null 2>&1; then
            warn "Fixed file has TypeScript errors, reverting $(basename "$file")"
            cp "$backup_file" "$file"
            rm -f "$backup_file" "$fixed_file"
            return 1
        fi
    fi
    
    # Cleanup
    rm -f "$backup_file" "$fixed_file"
    
    log "✨ Successfully fixed: $(basename "$file")"
    return 0
}

# Create git branch for fixes
create_fix_branch() {
    local branch_name="${BRANCH_PREFIX}-${TIMESTAMP}"
    
    # Check if we're in a git repo
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        warn "Not in a git repository, fixes will be applied directly"
        return 1
    fi
    
    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        warn "Branch $branch_name already exists, using existing branch"
        git checkout "$branch_name" 2>/dev/null || return 1
        return 0
    fi
    
    # Create new branch from current branch
    git checkout -b "$branch_name" >/dev/null 2>&1 || return 1
    log "📋 Created fix branch: $branch_name"
    
    echo "$branch_name"
}

# Commit fixes
commit_fixes() {
    local branch_name="$1"
    local fixed_files=("${@:2}")
    
    if [ ${#fixed_files[@]} -eq 0 ]; then
        warn "No files to commit"
        return 1
    fi
    
    # Stage fixed files
    for file in "${fixed_files[@]}"; do
        git add "$file" 2>/dev/null || warn "Could not stage $file"
    done
    
    # Check if there are actually changes to commit
    if ! git diff --cached --quiet; then
        # Create commit message
        local commit_msg
        commit_msg="🤖 Claude Auto-fix: Improved ${#fixed_files[@]} files

Automated fixes applied:
$(printf '- %s\n' "${fixed_files[@]}")"
        
        # Commit changes
        if git commit -m "$commit_msg" >/dev/null 2>&1; then
            log "💾 Committed fixes to branch: $branch_name"
            log "📝 Fixed files: $(printf '%s ' "${fixed_files[@]}")"
            
            # Push branch if remote exists
            if git remote get-url origin >/dev/null 2>&1; then
                if git push -u origin "$branch_name" >/dev/null 2>&1; then
                    log "🚀 Pushed fixes to remote branch: $branch_name"
                    log "🔗 Create PR: git checkout main && gh pr create --base main --head $branch_name"
                else
                    warn "Could not push to remote, branch exists locally only"
                fi
            fi
            
            return 0
        else
            error "Failed to commit changes"
            return 1
        fi
    else
        warn "No actual changes to commit"
        return 1
    fi
}

# Main execution
main() {
    log "🚀 Claude Code Auto-Fixer starting..."
    log "📅 Timestamp: $TIMESTAMP"
    log "🎯 Max fixes per run: $MAX_FIXES_PER_RUN"
    
    # Check dependencies
    check_dependencies
    
    # Create analysis directory
    mkdir -p "$ANALYSIS_DIR"
    
    # Find files to analyze
    local files_to_check
    mapfile -t files_to_check < <(find_files_to_fix) || {
        error "No files found to analyze"
        exit 1
    }
    
    log "📁 Found ${#files_to_check[@]} files to analyze"
    
    # Create git branch for fixes
    local branch_name
    branch_name=$(create_fix_branch) || branch_name=""
    
    # Track fixes
    local fixed_files=()
    local fixes_applied=0
    
    # Analyze and fix files
    for file in "${files_to_check[@]}"; do
        # Stop if we've reached max fixes
        if [ $fixes_applied -ge $MAX_FIXES_PER_RUN ]; then
            log "🛑 Reached maximum fixes per run ($MAX_FIXES_PER_RUN)"
            break
        fi
        
        # Check if file exists
        if [ ! -f "$file" ]; then
            continue
        fi
        
        # Analyze file
        if needs_fixing "$file"; then
            # Try to fix it
            if fix_file "$file"; then
                fixed_files+=("$file")
                ((fixes_applied++))
                log "✅ Fixed ($fixes_applied/$MAX_FIXES_PER_RUN): $(basename "$file")"
            else
                warn "❌ Could not fix: $(basename "$file")"
            fi
        fi
        
        # Small delay to avoid overwhelming Claude API
        sleep 2
    done
    
    # Summary
    log "📊 Analysis complete!"
    log "🔍 Files analyzed: ${#files_to_check[@]}"
    log "✨ Files fixed: $fixes_applied"
    
    # Commit fixes if any
    if [ $fixes_applied -gt 0 ] && [ -n "$branch_name" ]; then
        if commit_fixes "$branch_name" "${fixed_files[@]}"; then
            log "🎉 Successfully applied and committed $fixes_applied fixes!"
        else
            warn "Fixes applied but could not commit"
        fi
    elif [ $fixes_applied -gt 0 ]; then
        log "🎉 Successfully applied $fixes_applied fixes (no git commit)"
    else
        log "✨ No fixes needed - codebase looks good!"
    fi
    
    # Generate report
    cat > "${ANALYSIS_DIR}/auto-fix-report-${TIMESTAMP}.md" <<EOF
# 🤖 Claude Code Auto-Fix Report

**Date**: $(date)
**Session**: $TIMESTAMP
**Branch**: ${branch_name:-"none (direct commits)"}

## Summary
- **Files Analyzed**: ${#files_to_check[@]}
- **Files Fixed**: $fixes_applied
- **Max Fixes**: $MAX_FIXES_PER_RUN

## Fixed Files
$(if [ ${#fixed_files[@]} -gt 0 ]; then printf '- %s\n' "${fixed_files[@]}"; else echo "None"; fi)

## Status
$([ $fixes_applied -gt 0 ] && echo "✅ Fixes applied successfully" || echo "✨ No fixes needed")

---
*Generated by Claude Code Auto-Fixer*
EOF
    
    log "📄 Report saved: ${ANALYSIS_DIR}/auto-fix-report-${TIMESTAMP}.md"
}

# Run based on command
case "${1:-auto}" in
    "auto")
        main
        ;;
    "dry-run")
        log "🧪 Dry run mode - analysis only, no fixes applied"
        MAX_FIXES_PER_RUN=0
        main
        ;;
    "single")
        if [ $# -lt 2 ]; then
            error "Usage: $0 single <file.ts>"
            exit 1
        fi
        log "🎯 Single file mode: $2"
        if needs_fixing "$2" && fix_file "$2"; then
            log "✅ Fixed: $2"
        else
            log "✨ No fix needed or failed: $2"
        fi
        ;;
    *)
        echo "Usage: $0 [auto|dry-run|single <file.ts>]"
        echo ""
        echo "Commands:"
        echo "  auto      - Automatic fixing (default)"
        echo "  dry-run   - Analysis only, no fixes"
        echo "  single    - Fix specific file"
        exit 1
        ;;
esac