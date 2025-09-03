#!/bin/bash

# Ensure Node 22 is active
if command -v mise >/dev/null 2>&1; then
    eval "$(mise activate bash)"
    mise use node@22 >/dev/null 2>&1
fi

# Pre-commit Hook - Foundation Enforcement
# 
# Runs validation checks before allowing commits

set -e

echo "🔧 Running pre-commit validation..."

# 1. Import validation
echo "📋 Step 1: Validating imports..."
node scripts/validate-imports.js

# 2. ESLint check on staged files
echo "📋 Step 2: Running ESLint on staged files..."
staged_files=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -n "$staged_files" ]; then
    echo "Checking files: $staged_files"
    npx eslint $staged_files --max-warnings=10
else
    echo "No TypeScript/JavaScript files staged for commit"
fi

# 3. Check package.json dependencies (if package.json is staged)
if git diff --cached --name-only | grep -q "package.json"; then
    echo "📋 Step 3: Validating package.json dependencies..."
    node scripts/validate-dependencies.js
fi

echo "✅ All pre-commit checks passed!"