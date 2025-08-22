#!/bin/bash

# Final comprehensive TypeScript syntax fixes
echo "🔧 Applying final comprehensive TypeScript syntax fixes..."

cd /home/mhugo/code/claude-code-zen

# Fix all TypeScript files in the server src directory
find apps/claude-code-zen-server/src -name "*.ts" -exec sed -i \
  -e "s/'\\([^']*\\)'\\);$/'\\1';/g" \
  -e "s/= '\\([^']*\\)'\\);$/= '\\1';/g" \
  -e "s/: '\\([^']*\\)'\\); \\/\\//: '\\1'; \\/\\//g" \
  -e "s/\\];\\);$/];/g" \
  -e "s/\\};\\);$/};/g" \
  -e "s/: \\([^;)]*\\)\\); \\/\\//: \\1; \\/\\//g" \
  {} +

echo "✅ Basic syntax fixes applied!"

# Additional specific patterns that cause the most errors
find apps/claude-code-zen-server/src -name "*.ts" -exec sed -i \
  -e "s/\\([a-zA-Z_][a-zA-Z0-9_]*\\)(\\([^)]*\\)\\));$/\\1(\\2);/g" \
  -e "s/reliability: 'high'\\); \\/\\//reliability: 'high'; \\/\\//g" \
  -e "s/reliability: 'variable'\\); \\/\\//reliability: 'variable'; \\/\\//g" \
  -e "s/| 'custom'\\);$/| 'custom';/g" \
  {} +

echo "✅ Advanced pattern fixes applied!"

# Run a final type check to see results
echo "📊 Running final TypeScript compilation check..."
cd /home/mhugo/code/claude-code-zen
ERROR_COUNT=$(pnpm run type-check 2>&1 | grep -c "error TS")
echo "Final error count: $ERROR_COUNT"

if [ "$ERROR_COUNT" -lt 100 ]; then
    echo "🎉 SUCCESS: Error count reduced to manageable level ($ERROR_COUNT errors)"
else
    echo "⚠️  Still working on it: $ERROR_COUNT errors remaining"
fi