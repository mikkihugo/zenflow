#!/usr/bin/env bash

# Setup Claude Code Auto-Fixer Cron Job
# Installs automated Claude Code fixing on a schedule

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[CRON-SETUP]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FIXER_SCRIPT="$SCRIPT_DIR/claude-auto-fixer.sh"

show_usage() {
    cat << EOF
🤖 Claude Code Auto-Fixer Cron Setup

Usage: $0 [SCHEDULE] [OPTIONS]

SCHEDULES:
  aggressive - Run every 5 minutes (24/7 fixing for 5000+ errors)
  hourly     - Run every hour (recommended for active development)
  daily      - Run daily at 2 AM (recommended for maintenance)
  weekly     - Run weekly on Sunday at 2 AM (recommended for stable projects)
  custom     - Specify custom cron schedule

OPTIONS:
  --dry-run     - Set up dry-run mode (analysis only, no fixes)
  --remove      - Remove existing cron job
  --list        - Show current cron jobs
  --test        - Test run the fixer once

EXAMPLES:
  $0 daily                    # Daily fixes at 2 AM
  $0 hourly --dry-run        # Hourly analysis (no fixes)
  $0 custom "*/30 * * * *"   # Every 30 minutes
  $0 --remove                # Remove cron job
  $0 --test                  # Test the system

EOF
}

# Check if claude command exists
check_claude() {
    if ! command -v claude >/dev/null 2>&1; then
        error "Claude Code CLI not found!"
        error "Install with: curl -sSL https://claude.ai/install | bash"
        return 1
    fi
    
    log "✅ Claude Code CLI detected"
}

# Check if in git repository
check_git() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        warn "Not in a git repository"
        warn "Auto-fixer will apply changes directly without git commits"
        return 1
    fi
    
    log "✅ Git repository detected"
    return 0
}

# Test the auto-fixer script
test_fixer() {
    log "🧪 Testing Claude Auto-Fixer..."
    
    if [ ! -x "$FIXER_SCRIPT" ]; then
        error "Auto-fixer script not executable: $FIXER_SCRIPT"
        return 1
    fi
    
    log "Running dry-run test..."
    cd "$PROJECT_ROOT"
    
    if "$FIXER_SCRIPT" dry-run; then
        log "✅ Auto-fixer test successful!"
        return 0
    else
        error "❌ Auto-fixer test failed!"
        return 1
    fi
}

# Generate cron command
generate_cron_command() {
    local schedule="$1"
    local mode="${2:-auto}"
    
    local cron_schedule
    case "$schedule" in
        "aggressive")
            cron_schedule="*/5 * * * *"
            ;;
        "hourly")
            cron_schedule="0 * * * *"
            ;;
        "daily")
            cron_schedule="0 2 * * *"
            ;;
        "weekly")
            cron_schedule="0 2 * * 0"
            ;;
        "custom")
            if [ $# -lt 3 ]; then
                error "Custom schedule requires cron expression"
                error "Example: $0 custom '*/30 * * * *'"
                return 1
            fi
            cron_schedule="$3"
            ;;
        *)
            error "Invalid schedule: $schedule"
            return 1
            ;;
    esac
    
    # Choose script based on schedule
    local script_to_use="$FIXER_SCRIPT"
    if [ "$schedule" = "aggressive" ]; then
        script_to_use="$SCRIPT_DIR/claude-continuous-fixer.sh"
    fi
    
    # Generate full cron command
    cat << EOF
# Claude Code Auto-Fixer - Added $(date)
$cron_schedule cd "$PROJECT_ROOT" && "$script_to_use" $mode >> /tmp/claude-fixer.log 2>&1
EOF
}

# Install cron job
install_cron() {
    local schedule="$1"
    local mode="${2:-auto}"
    local custom_schedule="$3"
    
    log "📋 Installing Claude Auto-Fixer cron job..."
    
    # Check if job already exists
    if crontab -l 2>/dev/null | grep -q "claude-auto-fixer"; then
        warn "Existing Claude Auto-Fixer cron job found"
        read -p "Replace existing job? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Installation cancelled"
            return 1
        fi
        
        # Remove existing job
        remove_cron
    fi
    
    # Generate new cron job
    local new_cron
    if [ "$schedule" = "custom" ]; then
        new_cron=$(generate_cron_command "$schedule" "$mode" "$custom_schedule")
    else
        new_cron=$(generate_cron_command "$schedule" "$mode")
    fi
    
    # Add to crontab
    (crontab -l 2>/dev/null || echo ""; echo "$new_cron") | crontab -
    
    log "✅ Cron job installed successfully!"
    log "📅 Schedule: $schedule"
    log "🎯 Mode: $mode"
    log "📄 Logs: /tmp/claude-fixer.log"
    
    # Show next run time
    if command -v cronie >/dev/null 2>&1 || command -v cron >/dev/null 2>&1; then
        info "💡 View cron logs: tail -f /tmp/claude-fixer.log"
        info "💡 Check cron status: systemctl status crond"
    fi
}

# Remove cron job
remove_cron() {
    log "🗑️  Removing Claude Auto-Fixer cron job..."
    
    if crontab -l 2>/dev/null | grep -q "claude-auto-fixer"; then
        # Remove lines containing claude-auto-fixer
        crontab -l 2>/dev/null | grep -v "claude-auto-fixer" | crontab -
        log "✅ Cron job removed successfully!"
    else
        warn "No Claude Auto-Fixer cron job found"
    fi
}

# List current cron jobs
list_cron() {
    log "📋 Current cron jobs:"
    
    local cron_output
    cron_output=$(crontab -l 2>/dev/null || echo "No cron jobs found")
    
    if [[ "$cron_output" == "No cron jobs found" ]]; then
        info "No cron jobs configured"
    else
        echo "$cron_output"
        
        # Highlight Claude jobs
        if echo "$cron_output" | grep -q "claude-auto-fixer"; then
            echo ""
            log "🤖 Claude Auto-Fixer jobs:"
            echo "$cron_output" | grep "claude-auto-fixer" | sed 's/^/  /'
        fi
    fi
}

# Main execution
main() {
    log "🤖 Claude Code Auto-Fixer Cron Setup"
    log "📁 Project: $PROJECT_ROOT"
    
    # Parse arguments
    local schedule=""
    local mode="auto"
    local custom_schedule=""
    local action=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            aggressive|hourly|daily|weekly|custom)
                schedule="$1"
                if [ "$1" = "custom" ] && [ $# -gt 1 ]; then
                    shift
                    custom_schedule="$1"
                fi
                ;;
            --dry-run)
                mode="dry-run"
                ;;
            --remove)
                action="remove"
                ;;
            --list)
                action="list"
                ;;
            --test)
                action="test"
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
        shift
    done
    
    # Check dependencies
    check_claude || exit 1
    check_git # Continue even if not in git repo
    
    # Execute action
    case "$action" in
        "remove")
            remove_cron
            ;;
        "list")
            list_cron
            ;;
        "test")
            test_fixer
            ;;
        *)
            if [ -z "$schedule" ]; then
                error "No schedule specified"
                show_usage
                exit 1
            fi
            
            # Test first
            if ! test_fixer; then
                error "Pre-installation test failed"
                exit 1
            fi
            
            # Install cron job
            install_cron "$schedule" "$mode" "$custom_schedule"
            ;;
    esac
}

# Show examples on first run
if [ $# -eq 0 ]; then
    show_usage
    echo ""
    log "🚀 Quick start examples:"
    echo "  $0 daily              # Recommended: Daily fixes at 2 AM"
    echo "  $0 hourly --dry-run   # Analysis only, every hour"
    echo "  $0 --test             # Test the system first"
    echo ""
    exit 0
fi

main "$@"