#!/bin/bash
# Auto FACT Daemon Runner
# Fully automated FACT orchestration with zero manual intervention

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FACT_BIN="${SCRIPT_DIR}/target/release/fact-tools"
PID_FILE="${SCRIPT_DIR}/auto-fact.pid"
LOG_FILE="${SCRIPT_DIR}/auto-fact.log"
CONFIG_FILE="${SCRIPT_DIR}/auto-fact.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Check if FACT binary exists
check_binary() {
    if [[ ! -f "$FACT_BIN" ]]; then
        error "FACT binary not found at $FACT_BIN"
        error "Please build first: cargo build --features full --release"
        exit 1
    fi
}

# Auto-detect project directories
detect_directories() {
    local dirs=()
    
    # Common code directories
    for dir in "$HOME/code" "$HOME/projects" "$HOME/workspace" "$HOME/dev" "." "../"; do
        if [[ -d "$dir" ]]; then
            dirs+=("$dir")
        fi
    done
    
    # Check for Git repositories in current directory and parent
    if git rev-parse --git-dir >/dev/null 2>&1; then
        dirs+=("$(git rev-parse --show-toplevel)")
    fi
    
    # Remove duplicates and join with commas
    printf "%s" "$(printf '%s\n' "${dirs[@]}" | sort -u | paste -sd ',')"
}

# Auto-detect GitHub token
detect_github_token() {
    if [[ -n "${GITHUB_TOKEN:-}" ]]; then
        return 0
    fi
    
    # Check common locations for GitHub token
    for file in "$HOME/.github/token" "$HOME/.config/gh/hosts.yml" "$HOME/.gitconfig"; do
        if [[ -f "$file" ]]; then
            info "Found potential GitHub config at $file"
            warn "Please set GITHUB_TOKEN environment variable for full automation"
            break
        fi
    done
}

# Create default configuration
create_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log "Creating default configuration at $CONFIG_FILE"
        
        local dirs
        dirs=$(detect_directories)
        
        cat > "$CONFIG_FILE" << EOF
{
  "auto_discovery": true,
  "auto_github": true,
  "update_interval_hours": 12,
  "max_concurrent": 6,
  "github_token": null,
  "scan_directories": ["$(echo "$dirs" | sed 's/,/", "/g')"],
  "monitor_patterns": [
    "mix.exs", "mix.lock", "gleam.toml", 
    "package.json", "Cargo.toml", 
    "flake.nix", "shell.nix", "requirements.txt"
  ]
}
EOF
        info "Configuration created with auto-detected directories: $dirs"
    else
        info "Using existing configuration at $CONFIG_FILE"
    fi
}

# Start the auto orchestrator
start_orchestrator() {
    if is_running; then
        warn "Auto FACT orchestrator is already running (PID: $(cat "$PID_FILE"))"
        return 0
    fi
    
    log "🤖 Starting fully automatic FACT orchestration"
    
    # Detect directories and GitHub token
    local dirs
    dirs=$(detect_directories)
    detect_github_token
    
    # Set environment variables for automation
    export RUST_LOG="${RUST_LOG:-info}"
    export GITHUB_TOKEN="${GITHUB_TOKEN:-}"
    
    # Start the orchestrator in the background
    nohup "$FACT_BIN" auto --start \
        --interval 12 \
        --concurrent 6 \
        --directories "$dirs" \
        --github true \
        >> "$LOG_FILE" 2>&1 &
    
    local pid=$!
    echo "$pid" > "$PID_FILE"
    
    # Give it a moment to start
    sleep 2
    
    if is_running; then
        log "✅ Auto FACT orchestrator started successfully (PID: $pid)"
        log "📁 Scanning directories: $dirs"
        log "🐙 GitHub integration: ${GITHUB_TOKEN:+enabled}${GITHUB_TOKEN:-disabled (no token)}"
        log "📊 Update interval: 12 hours"
        log "🚀 Max concurrent: 6 operations"
        log "📝 Logs: $LOG_FILE"
        
        # Show initial status
        sleep 5
        show_status
        
        log "🔄 Auto FACT is now running in the background"
        log "💡 Use './auto-fact.sh status' to check progress"
        log "🛑 Use './auto-fact.sh stop' to stop"
    else
        error "Failed to start orchestrator"
        cat "$LOG_FILE" | tail -20
        exit 1
    fi
}

# Stop the orchestrator
stop_orchestrator() {
    if ! is_running; then
        warn "Auto FACT orchestrator is not running"
        return 0
    fi
    
    local pid
    pid=$(cat "$PID_FILE")
    log "🛑 Stopping Auto FACT orchestrator (PID: $pid)"
    
    # Try graceful shutdown first
    if kill -TERM "$pid" 2>/dev/null; then
        # Wait for graceful shutdown
        for i in {1..10}; do
            if ! kill -0 "$pid" 2>/dev/null; then
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if kill -0 "$pid" 2>/dev/null; then
            warn "Graceful shutdown failed, force killing..."
            kill -KILL "$pid" 2>/dev/null || true
        fi
    fi
    
    rm -f "$PID_FILE"
    log "✅ Auto FACT orchestrator stopped"
}

# Check if orchestrator is running
is_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    return 1
}

# Show orchestrator status
show_status() {
    echo ""
    echo "🤖 Auto FACT Orchestrator Status"
    echo "=================================="
    
    if is_running; then
        local pid
        pid=$(cat "$PID_FILE")
        echo -e "Status: ${GREEN}RUNNING${NC} (PID: $pid)"
        
        # Show process info
        if command -v ps >/dev/null 2>&1; then
            echo "Process: $(ps -p "$pid" -o pid,ppid,time,cmd --no-headers 2>/dev/null || echo "Process info unavailable")"
        fi
        
        # Show recent activity from logs
        echo ""
        echo "Recent Activity:"
        if [[ -f "$LOG_FILE" ]]; then
            tail -5 "$LOG_FILE" | sed 's/^/  /'
        fi
        
        # Try to get status from the binary
        echo ""
        echo "Configuration:"
        "$FACT_BIN" auto --status 2>/dev/null | grep -E "Update interval|Max concurrent|GitHub|Scan directories" | sed 's/^/  /'
        
    else
        echo -e "Status: ${RED}NOT RUNNING${NC}"
        echo "💡 Start with: ./auto-fact.sh start"
    fi
    
    echo ""
    echo "Files:"
    echo "  Binary: $FACT_BIN"
    echo "  PID:    $PID_FILE"
    echo "  Logs:   $LOG_FILE"
    echo "  Config: $CONFIG_FILE"
    echo ""
}

# Show logs
show_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        echo "📝 Auto FACT Logs (last 50 lines):"
        echo "====================================="
        tail -50 "$LOG_FILE"
    else
        warn "Log file not found: $LOG_FILE"
    fi
}

# Follow logs in real-time
follow_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        echo "📝 Following Auto FACT Logs (Ctrl+C to exit):"
        echo "=============================================="
        tail -f "$LOG_FILE"
    else
        error "Log file not found: $LOG_FILE"
        exit 1
    fi
}

# Restart orchestrator
restart_orchestrator() {
    log "🔄 Restarting Auto FACT orchestrator"
    stop_orchestrator
    sleep 2
    start_orchestrator
}

# Install as system service (optional)
install_service() {
    info "🔧 Installing Auto FACT as system service"
    
    # Create systemd service file
    local service_file="/etc/systemd/system/auto-fact.service"
    local service_content="[Unit]
Description=Auto FACT Orchestrator
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=$SCRIPT_DIR
ExecStart=$SCRIPT_DIR/auto-fact.sh start
ExecStop=$SCRIPT_DIR/auto-fact.sh stop
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target"
    
    if [[ $EUID -eq 0 ]]; then
        echo "$service_content" > "$service_file"
        systemctl daemon-reload
        systemctl enable auto-fact.service
        log "✅ Service installed. Start with: systemctl start auto-fact"
    else
        warn "Root permissions needed for system service installation"
        echo "Run as root or use --user flag for user service"
        
        # User service alternative
        local user_service_dir="$HOME/.config/systemd/user"
        mkdir -p "$user_service_dir"
        echo "$service_content" > "$user_service_dir/auto-fact.service"
        systemctl --user daemon-reload
        systemctl --user enable auto-fact.service
        log "✅ User service installed. Start with: systemctl --user start auto-fact"
    fi
}

# Main command dispatcher
main() {
    case "${1:-help}" in
        start)
            check_binary
            create_config
            start_orchestrator
            ;;
        stop)
            stop_orchestrator
            ;;
        restart)
            check_binary
            restart_orchestrator
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        follow)
            follow_logs
            ;;
        install)
            install_service
            ;;
        help|--help|-h)
            echo "🤖 Auto FACT - Fully Automated FACT Orchestration"
            echo ""
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  start    - Start automatic FACT orchestration"
            echo "  stop     - Stop automatic FACT orchestration"
            echo "  restart  - Restart automatic FACT orchestration"
            echo "  status   - Show orchestration status"
            echo "  logs     - Show recent logs"
            echo "  follow   - Follow logs in real-time"
            echo "  install  - Install as system service"
            echo "  help     - Show this help message"
            echo ""
            echo "Features:"
            echo "  🔍 Auto-discovers projects in common directories"
            echo "  🐙 Auto-integrates with GitHub for code examples"
            echo "  🔄 Auto-updates knowledge base every 12 hours"
            echo "  📊 Auto-populates FACT database with dependencies"
            echo "  🤖 Fully automated - zero manual intervention"
            echo ""
            echo "Environment Variables:"
            echo "  GITHUB_TOKEN - GitHub API token for enhanced integration"
            echo "  RUST_LOG     - Logging level (debug, info, warn, error)"
            echo ""
            ;;
        *)
            error "Unknown command: $1"
            echo "Use '$0 help' for available commands"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"