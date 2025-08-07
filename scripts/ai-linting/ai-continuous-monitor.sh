#!/usr/bin/env bash

# Claude Code AI Continuous Monitoring
# Watches for file changes and runs AI analysis automatically

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[AI-MONITOR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WATCH]${NC} $1"; }

WATCH_DIRS=("src/" "tests/")
ANALYSIS_COOLDOWN=5  # seconds between analyses
LAST_ANALYSIS=0

analyze_file() {
    local file="$1"
    local current_time=$(date +%s)
    
    # Cooldown to prevent spam
    if [ $((current_time - LAST_ANALYSIS)) -lt $ANALYSIS_COOLDOWN ]; then
        return
    fi
    
    LAST_ANALYSIS=$current_time
    
    log "🧠 AI analyzing: $(basename "$file")"
    
    # Quick intelligent analysis
    claude code <<EOF &
Provide a quick health check for this TypeScript file:

\`\`\`typescript
$(cat "$file" 2>/dev/null || echo "// File read error")
\`\`\`

Quick assessment:
- 🏥 **Health Score**: /10 (overall code quality)
- 🔍 **Top Issue**: Most important thing to fix
- 💡 **Quick Win**: Easiest improvement to make
- 🎯 **Focus Area**: What needs most attention

Keep response under 100 words. Format for terminal display.
EOF
    
    info "📊 AI analysis started for $(basename "$file")"
}

setup_file_watching() {
    if ! command -v inotifywait >/dev/null 2>&1; then
        warn "inotifywait not found. Install with: sudo apt-get install inotify-tools"
        warn "Falling back to polling mode..."
        
        # Polling fallback
        while true; do
            for dir in "${WATCH_DIRS[@]}"; do
                find "$dir" -name "*.ts" -newer /tmp/ai-monitor-last-check 2>/dev/null | while read -r file; do
                    analyze_file "$file"
                done
            done
            touch /tmp/ai-monitor-last-check
            sleep 10
        done
    else
        log "👀 Starting AI file monitoring with inotify..."
        
        # Watch for file changes
        inotifywait -m -r -e modify,create,move \
            --include='.*\.ts$' \
            "${WATCH_DIRS[@]}" 2>/dev/null | while read -r path action file; do
            
            if [[ "$action" =~ (MODIFY|CREATE|MOVED_TO) ]]; then
                full_path="${path}${file}"
                if [[ -f "$full_path" && "$file" =~ \.ts$ ]]; then
                    analyze_file "$full_path"
                fi
            fi
        done
    fi
}

# AI-powered development insights
show_insights() {
    log "🧠 Generating development insights..."
    
    claude code <<EOF
Based on our TypeScript codebase structure, provide development insights:

Current project appears to be: Claude-Zen (AI-powered development tools)

Provide:
1. 🎯 **Today's Focus**: What should developers prioritize today?  
2. 📈 **Quality Trends**: Areas of improvement needed
3. 🚀 **Optimization Opportunities**: Performance/architecture wins
4. 🧪 **Testing Gaps**: What needs more test coverage
5. 🔮 **Architecture Evolution**: Suggested next steps

Make it actionable and specific to this codebase. Keep under 300 words.
EOF
}

# Main execution
main() {
    log "🚀 Claude Code AI Continuous Monitor starting..."
    
    # Check if Claude Code is available
    if ! command -v claude >/dev/null 2>&1; then
        error "Claude Code CLI not found. Please install Claude Code first."
        exit 1
    fi
    
    case "${1:-watch}" in
        "watch")
            log "👁️  Watching directories: ${WATCH_DIRS[*]}"
            log "🔄 Analysis cooldown: ${ANALYSIS_COOLDOWN}s"
            log "💡 Press Ctrl+C to stop monitoring"
            
            # Show initial insights
            show_insights
            echo ""
            
            # Start file watching
            setup_file_watching
            ;;
        "insights")
            show_insights
            ;;
        "test")
            log "🧪 Testing AI analysis on random file..."
            test_file=$(find src -name "*.ts" | head -1)
            if [ -n "$test_file" ]; then
                analyze_file "$test_file"
            else
                warn "No TypeScript files found to test"
            fi
            ;;
        *)
            echo "Usage: $0 [watch|insights|test]"
            echo ""
            echo "Commands:"
            echo "  watch    - Start continuous AI monitoring (default)"
            echo "  insights - Show AI development insights"  
            echo "  test     - Test AI analysis on a file"
            exit 1
            ;;
    esac
}

# Handle Ctrl+C gracefully
trap 'log "👋 AI monitoring stopped"; exit 0' INT

main "$@"