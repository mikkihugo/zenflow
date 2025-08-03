#!/bin/bash

# Script to fix .js imports in TypeScript files to use .ts extensions
# This is for Jest testing compatibility

echo "Fixing .js imports in TypeScript files..."

# Find all TypeScript files and fix relative .js imports
find src -name "*.ts" -type f -exec sed -i "s/from '\.\([^']*\)\.js'/from '.\1.ts'/g" {} \;
find src -name "*.ts" -type f -exec sed -i 's/from "\.\([^"]*\)\.js"/from ".\1.ts"/g' {} \;

echo "Fixed all relative .js imports to .ts in TypeScript files"

# Show some examples of what was changed
echo -e "\nSample changes made:"
find src -name "*.ts" -type f -exec grep -l "from '\.[^']*\.ts'" {} \; | head -3 | while read file; do
  echo "File: $file"
  grep "from '\.[^']*\.ts'" "$file" | head -2
  echo ""
done