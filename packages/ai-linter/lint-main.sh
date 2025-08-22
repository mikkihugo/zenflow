#!/bin/bash

# Main Packages and App Linting Script
# Quick lint of essential packages and main app

set -e

echo "🚀 Linting main packages and app..."

# Go to project root
cd /home/mhugo/code/claude-code-zen

echo "📦 Linting core packages..."

# Core packages
for pkg in ai-linter foundation intelligence llm-providers infrastructure; do
    if [ -d "packages/$pkg" ]; then
        echo "  🔍 Linting packages/$pkg"
        cd "packages/$pkg"
        pnpm build 2>/dev/null || echo "    ⚠️  Build issues in $pkg"
        cd - > /dev/null
    fi
done

echo ""
echo "🖥️ Linting main server app..."
if [ -d "apps/claude-code-zen-server" ]; then
    cd "apps/claude-code-zen-server"
    echo "  🔍 TypeScript check..."
    npx tsc --noEmit --skipLibCheck || echo "    ⚠️  TypeScript issues found"
    cd - > /dev/null
fi

echo ""
echo "🌐 Linting web dashboard..."  
if [ -d "apps/web-dashboard" ]; then
    cd "apps/web-dashboard"
    echo "  🔍 TypeScript check..."
    npx tsc --noEmit --skipLibCheck || echo "    ⚠️  TypeScript issues found"
    cd - > /dev/null
fi

echo ""
echo "✅ Main linting complete!"
echo "🔧 To fix issues, run the comprehensive script: ./lint-comprehensive.sh"