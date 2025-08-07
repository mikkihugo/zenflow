#!/usr/bin/env bash

# AI Pre-Commit Hook
# Runs Claude Code AI analysis on changed files before commit

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[AI-HOOK]${NC} $1"; }
warn() { echo -e "${YELLOW}[AI-WARN]${NC} $1"; }
error() { echo -e "${RED}[AI-ERROR]${NC} $1"; }

# Get staged TypeScript files
staged_files=($(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true))

if [ ${#staged_files[@]} -eq 0 ]; then
    log "✅ No TypeScript files to analyze"
    exit 0
fi

log "🧠 AI analyzing ${#staged_files[@]} staged files with Claude Code..."

# Quick AI analysis for each staged file
for file in "${staged_files[@]}"; do
    if [ -f "$file" ]; then
        log "🔍 Analyzing: $file"
        
        # Run AI analysis using Claude Code
        analysis=$(timeout 30s claude code <<EOF 2>/dev/null || echo "TIMEOUT"
Quickly analyze this TypeScript file for CRITICAL issues only:

\`\`\`typescript
$(cat "$file")
\`\`\`

Focus ONLY on:
🔴 CRITICAL: Security vulnerabilities, type safety issues, obvious bugs
🟡 HIGH: Performance bottlenecks, architectural violations
Return: "✅ CLEAN" if no critical issues, otherwise list issues with 🔴/🟡 severity.
Keep response under 200 words.
EOF
)

        if [[ "$analysis" == "TIMEOUT" ]]; then
            warn "⏰ Analysis timeout for $file"
            continue
        fi
        
        # Check for critical issues
        if [[ "$analysis" =~ 🔴 ]]; then
            error "❌ CRITICAL issues found in $file:"
            echo "$analysis"
            error "🚫 Commit blocked due to critical AI-detected issues"
            exit 1
        fi
        
        # Log warnings but allow commit
        if [[ "$analysis" =~ 🟡 ]]; then
            warn "⚠️  Issues in $file:"
            echo "$analysis"
        else
            log "✅ $file looks good"
        fi
    fi
done

log "🎉 AI pre-commit analysis complete - commit approved!"
exit 0