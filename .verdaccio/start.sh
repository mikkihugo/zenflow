#!/bin/bash
#
# Claude Code Zen - Local NPM Registry Startup Script
#

echo "🚀 Starting Claude Code Zen Local NPM Registry..."
echo "📦 Registry URL: http://localhost:4873"
echo "🎨 Web UI: http://localhost:4873/-/web/detail/@claude-zen"
echo "🔧 Config: $(pwd)/config.yaml"
echo ""

# Start Verdaccio with custom config
verdaccio --config ./config.yaml --listen 4873