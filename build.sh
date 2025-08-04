#!/bin/bash
# Build script that works across different shells
set -e

echo "🧹 Cleaning dist directory..."
rm -rf dist

echo "📝 Updating version..."
npx tsx scripts/update-bin-version.js

echo "🔨 Building TypeScript..."
# Use exec to ensure no shell-specific syntax issues  
exec node ./node_modules/typescript/lib/tsc.js --noEmitOnError false