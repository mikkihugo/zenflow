#!/bin/bash

# Comprehensive Linting Script for claude-code-zen
# Lints all packages and main app systematically

set -e

echo "🚀 Starting comprehensive codebase linting..."
echo "📊 Target: All packages + main app"
echo ""

# Function to run ESLint on a directory
lint_directory() {
    local dir=$1
    local name=$2
    
    echo "🔍 Linting $name..."
    if [ -d "$dir" ]; then
        cd "$dir"
        
        # Check if package has its own lint script
        if [ -f "package.json" ] && grep -q '"lint"' package.json; then
            echo "  📦 Running package-specific lint for $name"
            pnpm lint || echo "  ⚠️  Lint errors found in $name"
        else
            echo "  🔧 Running ESLint directly on $name"
            npx eslint . --fix || echo "  ⚠️  ESLint errors found in $name"
        fi
        
        # Run TypeScript check if tsconfig exists
        if [ -f "tsconfig.json" ]; then
            echo "  🔷 Running TypeScript check for $name"
            npx tsc --noEmit --skipLibCheck || echo "  ⚠️  TypeScript errors found in $name"
        fi
        
        cd - > /dev/null
        echo "  ✅ $name linting complete"
        echo ""
    else
        echo "  ⚠️  Directory $dir not found, skipping $name"
        echo ""
    fi
}

# Start from project root
cd /home/mhugo/code/claude-code-zen

echo "📦 PHASE 1: Core Packages"
echo "========================="

# AI Linter package (current focus)
lint_directory "packages/ai-linter" "AI Linter"

# Foundation package
lint_directory "packages/foundation" "Foundation"

# Intelligence package  
lint_directory "packages/intelligence" "Intelligence"

# LLM Providers package
lint_directory "packages/llm-providers" "LLM Providers"

# Infrastructure package
lint_directory "packages/infrastructure" "Infrastructure"

# Operations package
lint_directory "packages/operations" "Operations"

# Enterprise package
lint_directory "packages/enterprise" "Enterprise"

# Development package
lint_directory "packages/development" "Development"

echo "🏗️ PHASE 2: Implementation Packages"
echo "===================================="

# Key implementation packages
lint_directory "packages/implementation-packages/memory" "Memory Implementation"
lint_directory "packages/implementation-packages/brain" "Brain Implementation"  
lint_directory "packages/implementation-packages/database" "Database Implementation"
lint_directory "packages/implementation-packages/event-system" "Event System Implementation"
lint_directory "packages/implementation-packages/workflows" "Workflows Implementation"
lint_directory "packages/implementation-packages/safe-framework" "SAFE Framework Implementation"

echo "🖥️ PHASE 3: Main Applications"
echo "============================="

# Main server application
lint_directory "apps/claude-code-zen-server" "Claude Code Zen Server"

# Web dashboard
lint_directory "apps/web-dashboard" "Web Dashboard"

echo "🧹 PHASE 4: Project-wide Linting"
echo "================================="

echo "🔍 Running project-wide ESLint..."
npx eslint . --ext .ts,.tsx,.js,.jsx --ignore-path .gitignore --fix || echo "⚠️  Project-wide lint errors found"

echo "🔷 Running project-wide TypeScript check..."  
npx tsc --noEmit --skipLibCheck || echo "⚠️  Project-wide TypeScript errors found"

echo ""
echo "✅ Comprehensive linting complete!"
echo ""
echo "📊 Summary:"
echo "  - All packages linted"
echo "  - Main applications linted"
echo "  - Project-wide checks completed"
echo ""
echo "🔧 Next steps:"
echo "  - Review any reported errors above"
echo "  - Run 'pnpm build' to verify all packages build"
echo "  - Run 'pnpm test' to ensure tests still pass"