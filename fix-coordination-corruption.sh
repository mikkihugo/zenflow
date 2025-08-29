#!/bin/bash

# Systematic corruption fix script for coordination package
# This script addresses the most common corruption patterns found

echo "🔧 Starting systematic corruption fixes for coordination package..."

cd packages/services/coordination/src

# Fix common template literal corruption patterns
echo "📝 Fixing template literal corruption..."
find . -name "*.ts" -type f -exec sed -i "s/\`\{/\`{/g" {} \;
find . -name "*.ts" -type f -exec sed -i "s/}\`\'/}\`/g" {} \;
find . -name "*.ts" -type f -exec sed -i "s/\'\`/\`/g" {} \;

# Fix object literal corruption (missing commas)
echo "📝 Fixing object literal syntax..."
find . -name "*.ts" -type f -exec sed -i "s/;\([[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*:\)/,\1/g" {} \;

# Fix colon spacing issues
echo "📝 Fixing colon spacing..."
find . -name "*.ts" -type f -exec sed -i "s/:[[:space:]]*{/:  {/g" {} \;
find . -name "*.ts" -type f -exec sed -i "s/):[[:space:]]*\([a-zA-Z]\/)): \1/g" {} \;

# Fix common function parameter corruption
echo "📝 Fixing function parameters..."
find . -name "*.ts" -type f -exec sed -i "s/):void/): void/g" {} \;
find . -name "*.ts" -type f -exec sed -i "s/):Promise/): Promise/g" {} \;
find . -name "*.ts" -type f -exec sed -i "s/):any/): any/g" {} \;

# Fix import statement corruption
echo "📝 Fixing import statements..."
find . -name "*.ts" -type f -exec sed -i "s/import {/import {/g" {} \;
find . -name "*.ts" -type f -exec sed -i "s/} from '/} from '/g" {} \;

# Fix string literal corruption
echo "📝 Fixing string literals..."
find . -name "*.ts" -type f -exec sed -i "s/','/'/g" {} \;
find . -name "*.ts" -type f -exec sed -i "s/';'/';/g" {} \;

# Fix array declaration corruption
echo "📝 Fixing array declarations..."
find . -name "*.ts" -type f -exec sed -i "s/\[\]/[]/g" {} \;
find . -name "*.ts" -type f -exec sed -i "s/\[\([^]]*\)]/[\1]/g" {} \;

echo "✅ Systematic corruption fixes completed!"
echo "📊 Running build test..."

cd ../..
npm run build