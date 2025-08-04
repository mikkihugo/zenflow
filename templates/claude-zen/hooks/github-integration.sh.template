#!/usr/bin/env bash
# Claude Code Hook: GitHub Integration
# Advanced hook for GitHub issue coordination and project management
# Based on the GitHub coordinator from swarm-zen

# Parse JSON input from Claude Code
INPUT="$1"
HOOK_TYPE="$2"  # preTask, postEdit, postTask, etc.

# Configuration (can be overridden by environment variables)
GITHUB_OWNER="${GITHUB_OWNER:-}"
GITHUB_REPO="${GITHUB_REPO:-}"
SWARM_ID="${CLAUDE_SWARM_ID:-claude-$(date +%s)}"

# Create log directory
mkdir -p "$HOME/.claude"

# Exit early if GitHub integration is not configured
if [[ -z "$GITHUB_OWNER" ]] || [[ -z "$GITHUB_REPO" ]]; then
    echo "$(date -Iseconds): GitHub integration not configured (missing GITHUB_OWNER or GITHUB_REPO)" >> "$HOME/.claude/github-hook.log"
    exit 0
fi

# Check if gh CLI is available
if ! command -v gh >/dev/null 2>&1; then
    echo "$(date -Iseconds): GitHub CLI (gh) not available, skipping GitHub integration" >> "$HOME/.claude/github-hook.log"
    exit 0
fi

# Function to log GitHub operations
log_github_operation() {
    local operation="$1"
    local result="$2"
    local issue_number="$3"
    
    local log_entry="{\"timestamp\":\"$(date -Iseconds)\",\"operation\":\"$operation\",\"result\":\"$result\",\"issue\":\"$issue_number\",\"swarm\":\"$SWARM_ID\"}"
    echo "$log_entry" >> "$HOME/.claude/github-operations.jsonl"
}

# Function to find matching GitHub issue
find_matching_issue() {
    local task_description="$1"
    
    # Search for open issues that might match the task
    local issues
    issues=$(gh issue list --repo="$GITHUB_OWNER/$GITHUB_REPO" --state=open --json number,title,body --limit 50 2>/dev/null || echo "[]")
    
    if [[ "$issues" == "[]" ]]; then
        return 1
    fi
    
    # Simple keyword matching
    local keywords
    keywords=$(echo "$task_description" | tr '[:upper:]' '[:lower:]' | tr -s ' ' '\n' | head -10)
    
    local best_match=""
    local best_score=0
    
    while IFS= read -r issue; do
        local issue_number
        local issue_title
        local issue_body
        
        issue_number=$(echo "$issue" | jq -r '.number')
        issue_title=$(echo "$issue" | jq -r '.title // ""' | tr '[:upper:]' '[:lower:]')
        issue_body=$(echo "$issue" | jq -r '.body // ""' | tr '[:upper:]' '[:lower:]')
        
        local issue_text="$issue_title $issue_body"
        local score=0
        
        while IFS= read -r keyword; do
            if [[ "$issue_text" == *"$keyword"* ]] && [[ ${#keyword} -gt 2 ]]; then
                ((score++))
            fi
        done <<< "$keywords"
        
        if [[ $score -gt $best_score ]] && [[ $score -gt 0 ]]; then
            best_score=$score
            best_match=$issue_number
        fi
    done <<< "$(echo "$issues" | jq -c '.[]')"
    
    if [[ -n "$best_match" ]]; then
        echo "$best_match"
        return 0
    fi
    
    return 1
}

# Function to claim an issue
claim_issue() {
    local issue_number="$1"
    
    # Add swarm label to the issue
    local label="swarm-$SWARM_ID"
    
    if gh issue edit "$issue_number" --repo="$GITHUB_OWNER/$GITHUB_REPO" --add-label "$label" 2>/dev/null; then
        # Add a comment claiming the issue
        local claim_message="🤖 **Swarm Coordination**

This issue has been claimed by swarm \`$SWARM_ID\` for automated processing.

**Swarm ID**: \`$SWARM_ID\`  
**Started**: $(date -Iseconds)  
**Status**: Working

---
*This is an automated message from Claude Code Flow*"
        
        gh issue comment "$issue_number" --repo="$GITHUB_OWNER/$GITHUB_REPO" --body "$claim_message" 2>/dev/null
        
        # Store the claimed issue
        echo "$issue_number" > "$HOME/.claude/claimed-issue.txt"
        
        log_github_operation "claim_issue" "success" "$issue_number"
        echo "$(date -Iseconds): Successfully claimed GitHub issue #$issue_number" >> "$HOME/.claude/github-hook.log"
        return 0
    else
        log_github_operation "claim_issue" "failed" "$issue_number"
        echo "$(date -Iseconds): Failed to claim GitHub issue #$issue_number" >> "$HOME/.claude/github-hook.log"
        return 1
    fi
}

# Function to update issue progress
update_issue_progress() {
    local issue_number="$1"
    local message="$2"
    
    local progress_message="🔄 **Progress Update**

$message

**Updated**: $(date -Iseconds)  
**Swarm**: \`$SWARM_ID\`

---
*Automated update from Claude Code Flow*"
    
    if gh issue comment "$issue_number" --repo="$GITHUB_OWNER/$GITHUB_REPO" --body "$progress_message" 2>/dev/null; then
        log_github_operation "update_progress" "success" "$issue_number"
        echo "$(date -Iseconds): Updated progress for GitHub issue #$issue_number" >> "$HOME/.claude/github-hook.log"
        return 0
    else
        log_github_operation "update_progress" "failed" "$issue_number"
        return 1
    fi
}

# Function to complete an issue
complete_issue() {
    local issue_number="$1"
    local summary="$2"
    local auto_close="${3:-false}"
    
    local completion_message="✅ **Task Completed**

$summary

**Completed**: $(date -Iseconds)  
**Swarm**: \`$SWARM_ID\`  
**Status**: Completed

---
*Task completed by Claude Code Flow*"
    
    gh issue comment "$issue_number" --repo="$GITHUB_OWNER/$GITHUB_REPO" --body "$completion_message" 2>/dev/null
    
    # Remove swarm label
    local label="swarm-$SWARM_ID"
    gh issue edit "$issue_number" --repo="$GITHUB_OWNER/$GITHUB_REPO" --remove-label "$label" 2>/dev/null || true
    
    # Optionally close the issue
    if [[ "$auto_close" == "true" ]]; then
        gh issue close "$issue_number" --repo="$GITHUB_OWNER/$GITHUB_REPO" --comment "Automatically closed by Claude Code Flow after task completion." 2>/dev/null
        log_github_operation "close_issue" "success" "$issue_number"
    fi
    
    # Clean up claimed issue file
    rm -f "$HOME/.claude/claimed-issue.txt"
    
    log_github_operation "complete_issue" "success" "$issue_number"
    echo "$(date -Iseconds): Completed GitHub issue #$issue_number" >> "$HOME/.claude/github-hook.log"
}

# Function to release an issue
release_issue() {
    local issue_number="$1"
    
    local release_message="🔓 **Issue Released**

This issue has been released by swarm \`$SWARM_ID\` and is available for other work.

**Released**: $(date -Iseconds)  
**Reason**: Task incomplete or reassigned

---
*Automated release from Claude Code Flow*"
    
    gh issue comment "$issue_number" --repo="$GITHUB_OWNER/$GITHUB_REPO" --body "$release_message" 2>/dev/null
    
    # Remove swarm label
    local label="swarm-$SWARM_ID"
    gh issue edit "$issue_number" --repo="$GITHUB_OWNER/$GITHUB_REPO" --remove-label "$label" 2>/dev/null || true
    
    # Clean up claimed issue file
    rm -f "$HOME/.claude/claimed-issue.txt"
    
    log_github_operation "release_issue" "success" "$issue_number"
    echo "$(date -Iseconds): Released GitHub issue #$issue_number" >> "$HOME/.claude/github-hook.log"
}

# Main hook logic based on hook type
case "$HOOK_TYPE" in
    "preTask")
        # Extract task description
        TASK_DESC=$(echo "$INPUT" | jq -r '.tool_input.description // .tool_input.prompt // ""')
        
        if [[ -n "$TASK_DESC" ]]; then
            echo "$(date -Iseconds): Pre-task GitHub integration for: $TASK_DESC" >> "$HOME/.claude/github-hook.log"
            
            # Try to find and claim a matching issue
            MATCHING_ISSUE=$(find_matching_issue "$TASK_DESC")
            
            if [[ -n "$MATCHING_ISSUE" ]]; then
                if claim_issue "$MATCHING_ISSUE"; then
                    echo "Claimed GitHub issue #$MATCHING_ISSUE for task: $TASK_DESC"
                fi
            else
                echo "$(date -Iseconds): No matching GitHub issue found for task" >> "$HOME/.claude/github-hook.log"
            fi
        fi
        ;;
        
    "postEdit")
        # Check if we have a claimed issue
        if [[ -f "$HOME/.claude/claimed-issue.txt" ]]; then
            CLAIMED_ISSUE=$(cat "$HOME/.claude/claimed-issue.txt")
            FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')
            
            if [[ -n "$CLAIMED_ISSUE" ]] && [[ -n "$FILE_PATH" ]]; then
                PROGRESS_MSG="Updated file: \`$(basename "$FILE_PATH")\`

**File**: $FILE_PATH  
**Operation**: File modification"
                
                update_issue_progress "$CLAIMED_ISSUE" "$PROGRESS_MSG"
            fi
        fi
        ;;
        
    "postTask")
        # Check if we have a claimed issue
        if [[ -f "$HOME/.claude/claimed-issue.txt" ]]; then
            CLAIMED_ISSUE=$(cat "$HOME/.claude/claimed-issue.txt")
            
            if [[ -n "$CLAIMED_ISSUE" ]]; then
                # Determine if task was completed successfully
                TASK_SUCCESS=$(echo "$INPUT" | jq -r '.task_success // true')
                TASK_RESULT=$(echo "$INPUT" | jq -r '.task_result // "Task completed"')
                
                if [[ "$TASK_SUCCESS" == "true" ]]; then
                    complete_issue "$CLAIMED_ISSUE" "$TASK_RESULT" "false"
                else
                    release_issue "$CLAIMED_ISSUE"
                fi
            fi
        fi
        ;;
        
    *)
        echo "$(date -Iseconds): Unknown hook type: $HOOK_TYPE" >> "$HOME/.claude/github-hook.log"
        ;;
esac

exit 0