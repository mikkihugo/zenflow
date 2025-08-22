#!/bin/bash

# Targeted TypeScript syntax fixes based on error analysis
echo "🎯 Starting targeted TypeScript syntax fixes..."

# Fix the most common patterns causing compilation errors
find apps/claude-code-zen-server/src packages -name "*.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" -exec sed -i -E "
# Fix union types with wrong parentheses
s/'([^']+)'\);$/''\1'';/g
s/: '([^']+)'\);/: ''\1'';/g

# Fix string literals with wrong parentheses  
s/= '([^']+)'\);$/= ''\1'';/g
s/= \"([^\"]+)\"\);$/= \"\1\";/g

# Fix type annotations with wrong colons/parentheses
s/: '([^']+)'\): /: ''\1'': /g
s/: ([^:]+)\): /: \1: /g

# Fix object properties with wrong syntax
s/: '([^']+)'\) \{/: ''\1'' {/g
s/\} '([^']+)'\)/} ''\1''/g

# Fix method calls with wrong parentheses
s/\.([a-zA-Z_][a-zA-Z0-9_]*)\(\([^)]*\)\)\);$/.\1(\2);/g

# Fix array/object closing with wrong punctuation
s/\]\);$/];/g
s/\}\);$/};/g

# Fix interface properties with wrong punctuation
s/: '([^']+)'\); \/\//: ''\1''; \/\//g
s/: ([^;]+)\); \/\//: \1; \/\//g
" {} +

echo "✅ Targeted syntax fixes applied!"
echo "📊 Checking compilation status..."

# Check error count
ERROR_COUNT=$(pnpm run type-check 2>&1 | grep "error TS" | wc -l)
echo "Current error count: $ERROR_COUNT"

# Show top error files
echo "Top error files:"
pnpm run type-check 2>&1 | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -5