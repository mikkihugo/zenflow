#!/bin/bash
# Build script using esbuild for maximum speed
set -e

echo "🧹 Cleaning dist directory..."
rm -rf dist

echo "📝 Updating version..."
npx tsx scripts/update-bin-version.js

echo "🚀 Building with esbuild (super fast!)..."
NODE_ENV=production node esbuild.config.js

echo "✅ Build complete!"