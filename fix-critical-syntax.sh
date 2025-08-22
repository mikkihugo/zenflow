#!/bin/bash

echo "🔧 Fixing critical syntax corruption patterns across codebase..."

# Fix unterminated string literals (most common corruption)
echo "Fixing unterminated string literals..."
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/\('\[^']*\$\)/\1'/g" {} \;
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/\(\"\[^\"]*\$\)/\1\"/g" {} \;

# Fix malformed ternary operators  
echo "Fixing malformed ternary operators..."
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/? '\([^']*\) : \([^']*\)'/? '\1' : '\2'/g" {} \;
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/? \"\([^\"]*\) : \([^\"]*\)\"/? \"\1\" : \"\2\"/g" {} \;

# Fix missing closing brackets and parentheses
echo "Fixing missing closing brackets..."
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/typeof obj\['\([^']*\)\] === \([^']*\)' &&/typeof obj['\1'] === '\2' \&\&/g" {} \;

# Fix malformed import statements
echo "Fixing malformed import statements..."
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/import('\([^']*\)';/import('\1');/g" {} \;

# Fix incomplete object property access
echo "Fixing incomplete object property access..."
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/\.\([a-zA-Z]*\)'\([^']*\)'/.\1('\2')/g" {} \;

# Fix missing semicolons after statements
echo "Fixing missing semicolons..."
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/\(await [^;]*\)\$/\1;/g" {} \;

# Fix malformed function calls
echo "Fixing malformed function calls..."
find apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i "s/\(\w\+\)(\([^)]*\)$/\1(\2)/g" {} \;

echo "✅ Fixed critical syntax corruption patterns"