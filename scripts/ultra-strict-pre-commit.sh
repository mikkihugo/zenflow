#!/bin/bash

# Ultra-Strict Pre-commit Hook for AI-Assisted Development
# Zero tolerance for technical debt

set -e

echo "🔒 Running ULTRA-STRICT pre-commit validation..."

# 1. Import validation (existing)
echo "📋 Step 1: Validating imports..."
node scripts/validate-imports.js

# 2. Type safety validation
echo "📋 Step 2: Type safety check..."
npx tsc --noEmit --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes

# 3. ESLint with ZERO warnings allowed
echo "📋 Step 3: ESLint with zero tolerance..."
staged_files=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [ -n "$staged_files" ]; then
    echo "Checking files: $staged_files"
    npx eslint $staged_files --max-warnings=0  # ZERO warnings allowed
else
    echo "No TypeScript/JavaScript files staged for commit"
fi

# 4. Security audit
echo "📋 Step 4: Security audit..."
npm audit --audit-level=moderate

# 5. Dependency validation
echo "📋 Step 5: Dependency validation..."
if git diff --cached --name-only | grep -q "package.json"; then
    node scripts/validate-dependencies.js
fi

# 6. AI Code Quality Check (custom)
echo "📋 Step 6: AI code quality validation..."
node scripts/validate-ai-code-patterns.js

# 7. Performance baseline check
echo "📋 Step 7: Performance impact analysis..."
node scripts/check-performance-impact.js

# 8. Documentation coverage
echo "📋 Step 8: Documentation coverage..."
npx typedoc --validation.notExported --validation.invalidLink --validation.notDocumented

# 9. Test coverage requirement
echo "📋 Step 9: Test coverage validation..."
npx vitest run --coverage --coverage.thresholds.lines=90 --coverage.thresholds.functions=90

echo "✅ All ULTRA-STRICT checks passed! Code is AI-ready!"
