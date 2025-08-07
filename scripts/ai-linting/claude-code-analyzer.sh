#!/usr/bin/env bash

# Claude Code AI Linting System
# Automated intelligent code analysis using Claude Code CLI

set -euo pipefail

# Configuration
ANALYSIS_DIR="analysis-reports"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
REPORT_FILE="${ANALYSIS_DIR}/ai-lint-report-${TIMESTAMP}.md"
CLAUDE_TIMEOUT=300
MAX_FILES_PER_BATCH=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[AI-LINT]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Create analysis directory
mkdir -p "${ANALYSIS_DIR}"

# AI Linting Functions

analyze_typescript_patterns() {
    local file="$1"
    log "🧠 AI analyzing TypeScript patterns in: $(basename "$file")"
    
    claude code <<EOF
Analyze this TypeScript file for advanced patterns and improvements:

\`\`\`typescript
$(cat "$file")
\`\`\`

Please provide:
1. **Architecture Analysis**: Design pattern usage, SOLID principles adherence
2. **Performance Issues**: Potential bottlenecks, memory leaks, inefficient algorithms  
3. **Type Safety**: Advanced TypeScript usage, generic improvements
4. **Maintainability**: Code complexity, readability improvements
5. **Security**: Potential vulnerabilities, input validation issues
6. **Modern Features**: ES2023+ features that could be used
7. **Testing**: Testability improvements, missing test scenarios

Format as structured markdown with severity levels (🔴 Critical, 🟡 Medium, 🟢 Low).
EOF
}

analyze_architecture_coherence() {
    local files=("$@")
    log "🏗️ AI analyzing architectural coherence across ${#files[@]} files"
    
    # Combine multiple files for architectural analysis
    local combined_content=""
    for file in "${files[@]}"; do
        combined_content+="=== $(basename "$file") ===\n"
        combined_content+="$(cat "$file")\n\n"
    done
    
    claude code <<EOF
Analyze this set of related files for architectural coherence:

${combined_content}

Please provide:
1. **Architectural Consistency**: Are patterns used consistently?
2. **Dependency Analysis**: Are dependencies well-structured? Any circular dependencies?
3. **Interface Design**: Are interfaces clean and well-defined?
4. **Separation of Concerns**: Is functionality properly separated?
5. **Code Duplication**: Any unnecessary duplication across files?
6. **Integration Patterns**: How well do these components integrate?
7. **Future Scalability**: Potential scaling issues or improvements

Provide specific actionable recommendations with file references.
EOF
}

detect_code_smells() {
    local file="$1"
    log "👃 AI detecting code smells in: $(basename "$file")"
    
    claude code <<EOF
Detect advanced code smells and anti-patterns in this file:

\`\`\`typescript
$(cat "$file")
\`\`\`

Focus on:
1. **Cognitive Complexity**: Functions/methods that are too complex
2. **Long Parameter Lists**: Functions with too many parameters  
3. **Data Clumps**: Groups of data that should be objects
4. **Feature Envy**: Methods using other classes' data too much
5. **God Objects**: Classes doing too much
6. **Dead Code**: Unused code that can be removed
7. **Magic Numbers/Strings**: Hardcoded values that should be constants
8. **Inconsistent Naming**: Naming that doesn't follow conventions

Provide refactoring suggestions with before/after code examples where helpful.
EOF
}

suggest_performance_optimizations() {
    local file="$1"  
    log "⚡ AI suggesting performance optimizations in: $(basename "$file")"
    
    claude code <<EOF
Analyze this code for performance optimization opportunities:

\`\`\`typescript
$(cat "$file")
\`\`\`

Focus on:
1. **Algorithm Complexity**: Can any algorithms be optimized?
2. **Memory Usage**: Any memory leaks or excessive allocations?
3. **I/O Operations**: Can async operations be optimized?
4. **Caching Opportunities**: What can be cached for better performance?
5. **Batch Operations**: Can operations be batched for efficiency?
6. **Lazy Loading**: What can be loaded on-demand?
7. **Parallelization**: What can run in parallel?
8. **Database Queries**: Any N+1 queries or inefficient database access?

Provide specific code optimizations with performance impact estimates.
EOF
}

generate_test_suggestions() {
    local file="$1"
    log "🧪 AI generating test suggestions for: $(basename "$file")"
    
    claude code <<EOF
Analyze this code and suggest comprehensive test scenarios:

\`\`\`typescript
$(cat "$file")
\`\`\`

Generate:
1. **Missing Unit Tests**: What functions/methods need tests?
2. **Edge Cases**: What edge cases should be tested?
3. **Error Scenarios**: What error conditions should be tested?
4. **Integration Tests**: What integration scenarios are needed?
5. **Performance Tests**: What should be performance tested?
6. **Security Tests**: What security aspects need testing?
7. **Mock Strategies**: What should be mocked and how?
8. **Test Data**: What test data scenarios are needed?

Provide actual test code examples using Vitest where appropriate.
EOF
}

# Main analysis workflow
main() {
    log "🚀 Starting Claude Code AI Linting Analysis"
    
    # Initialize report
    cat > "$REPORT_FILE" <<EOF
# Claude Code AI Linting Report
**Generated**: $(date)
**Codebase**: $(pwd)

## Summary
EOF

    # Find TypeScript files to analyze
    mapfile -t ts_files < <(find src -name "*.ts" -not -path "*/node_modules/*" -not -path "*/__tests__/*" | head -50)
    
    log "Found ${#ts_files[@]} TypeScript files to analyze"
    
    # Batch analysis
    local batch=0
    local batch_files=()
    
    for file in "${ts_files[@]}"; do
        batch_files+=("$file")
        
        if [ ${#batch_files[@]} -eq $MAX_FILES_PER_BATCH ]; then
            ((batch++))
            log "📦 Processing batch $batch (${#batch_files[@]} files)"
            
            # Architecture analysis for batch
            echo -e "\n## Batch $batch - Architecture Analysis" >> "$REPORT_FILE"
            analyze_architecture_coherence "${batch_files[@]}" >> "$REPORT_FILE" 2>/dev/null || warn "Batch analysis failed for batch $batch"
            
            # Individual file analysis
            for file in "${batch_files[@]}"; do
                echo -e "\n### $(basename "$file")" >> "$REPORT_FILE"
                
                # Pattern analysis
                echo -e "\n#### TypeScript Patterns" >> "$REPORT_FILE"
                analyze_typescript_patterns "$file" >> "$REPORT_FILE" 2>/dev/null || warn "Pattern analysis failed for $file"
                
                # Code smells
                echo -e "\n#### Code Smells" >> "$REPORT_FILE"  
                detect_code_smells "$file" >> "$REPORT_FILE" 2>/dev/null || warn "Code smell detection failed for $file"
                
                # Performance
                echo -e "\n#### Performance Optimizations" >> "$REPORT_FILE"
                suggest_performance_optimizations "$file" >> "$REPORT_FILE" 2>/dev/null || warn "Performance analysis failed for $file"
                
                # Test suggestions
                echo -e "\n#### Test Suggestions" >> "$REPORT_FILE"
                generate_test_suggestions "$file" >> "$REPORT_FILE" 2>/dev/null || warn "Test analysis failed for $file"
                
                log "✅ Completed analysis for $(basename "$file")"
            done
            
            # Reset batch
            batch_files=()
            
            # Rate limiting
            sleep 2
        fi
    done
    
    # Process remaining files
    if [ ${#batch_files[@]} -gt 0 ]; then
        ((batch++))
        log "📦 Processing final batch $batch (${#batch_files[@]} files)"
        
        echo -e "\n## Final Batch - Architecture Analysis" >> "$REPORT_FILE"
        analyze_architecture_coherence "${batch_files[@]}" >> "$REPORT_FILE" 2>/dev/null || warn "Final batch analysis failed"
    fi
    
    # Generate summary
    echo -e "\n## Analysis Complete" >> "$REPORT_FILE"
    echo -e "- **Files Analyzed**: ${#ts_files[@]}" >> "$REPORT_FILE"
    echo -e "- **Batches Processed**: $batch" >> "$REPORT_FILE"
    echo -e "- **Report Location**: $REPORT_FILE" >> "$REPORT_FILE"
    
    log "✨ AI Linting analysis complete!"
    log "📄 Report saved to: $REPORT_FILE"
    log "🔍 View with: less '$REPORT_FILE'"
}

# Script options
case "${1:-analyze}" in
    "analyze")
        main
        ;;
    "patterns")
        shift
        for file in "$@"; do
            analyze_typescript_patterns "$file"
        done
        ;;
    "smells")
        shift  
        for file in "$@"; do
            detect_code_smells "$file"
        done
        ;;
    "performance")
        shift
        for file in "$@"; do
            suggest_performance_optimizations "$file"
        done
        ;;
    "tests")
        shift
        for file in "$@"; do
            generate_test_suggestions "$file"
        done
        ;;
    *)
        echo "Usage: $0 [analyze|patterns|smells|performance|tests] [files...]"
        echo ""
        echo "Commands:"
        echo "  analyze     - Full AI analysis of codebase (default)"
        echo "  patterns    - Analyze specific files for patterns"
        echo "  smells      - Detect code smells in specific files"
        echo "  performance - Performance analysis of specific files"
        echo "  tests       - Generate test suggestions for specific files"
        exit 1
        ;;
esac