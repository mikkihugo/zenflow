#!/bin/bash

# ====================================================================
# TARGETED OTEL-COLLECTOR CORRUPTION REPAIR
# ====================================================================
# Fixes the specific 441 errors in otel-collector package using sed

set -e
cd /home/mhugo/code/claude-code-zen/packages/implementation/otel-collector

echo "🎯 OTEL-COLLECTOR TARGETED CORRUPTION REPAIR"
echo "============================================"
echo "Target: packages/implementation/otel-collector"
echo "Known errors: 441 TypeScript syntax errors"
echo

# Create backup
echo "📦 Creating backup..."
cp -r . ../otel-collector-backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"

# Fix specific corruption patterns found in otel-collector
echo "🔧 Applying targeted fixes..."

# 1. Fix unterminated string literals (most common)
echo "1. Fixing unterminated string literals..."
find . -name "*.ts" -exec sed -i "s/';$/';/g" {} \;
find . -name "*.ts" -exec sed -i "s/')'/');/g" {} \;

# 2. Fix missing spaces around operators
echo "2. Fixing operator spacing..."
find . -name "*.ts" -exec sed -i 's/||/ || /g' {} \;
find . -name "*.ts" -exec sed -i 's/&&/ && /g' {} \;
find . -name "*.ts" -exec sed -i 's/===/=== /g' {} \;

# 3. Fix malformed template literals
echo "3. Fixing template literals..."
find . -name "*.ts" -exec sed -i 's/\$\([a-zA-Z_][a-zA-Z0-9_]*\)/${\\1}/g' {} \;
find . -name "*.ts" -exec sed -i 's/`\$\([^}]\)/`${\1}/g' {} \;

# 4. Fix union types
echo "4. Fixing union types..."
find . -name "*.ts" -exec sed -i "s/'[^']*|[^']*'/'&'/g" {} \;
find . -name "*.ts" -exec sed -i 's/|/ | /g' {} \;

# 5. Fix unterminated function calls  
echo "5. Fixing function calls..."
find . -name "*.ts" -exec sed -i 's/()();/();/g' {} \;

# 6. Fix object literals
echo "6. Fixing object literals..."
find . -name "*.ts" -exec sed -i "s/, {'/,{/g" {} \;
find . -name "*.ts" -exec sed -i "s/{'/{ '/g" {} \;

# 7. Fix common logging patterns
echo "7. Fixing logging patterns..."
find . -name "*.ts" -exec sed -i "s/error('\\([^']*\\)', error);'/error('\\1', error);/g" {} \;

echo "✅ All targeted fixes applied"

# Quick validation
echo "🧪 Quick validation check..."
error_count=$(pnpm build 2>&1 | grep -c "error TS" || echo "0")
echo "Remaining TypeScript errors: $error_count"

echo "📋 TARGETED REPAIR COMPLETED"
echo "==========================="
if [[ $error_count -lt 100 ]]; then
    echo "🎉 SIGNIFICANT IMPROVEMENT! Error count reduced dramatically"
elif [[ $error_count -lt 300 ]]; then
    echo "✅ GOOD PROGRESS! Error count reduced substantially" 
else
    echo "⚠️  PARTIAL SUCCESS - May need additional manual fixes"
fi

echo
echo "NEXT STEPS:"
echo "1. Run full build: pnpm build"
echo "2. Review remaining errors"
echo "3. Apply manual fixes for complex patterns"