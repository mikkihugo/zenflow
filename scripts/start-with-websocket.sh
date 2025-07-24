#!/bin/bash
# Start claude-zen with Node.js 22 WebSocket support
# This script enables the experimental WebSocket flag for native WebSocket client support

echo "🚀 Starting claude-zen with Node.js 22 WebSocket support..."

# Check Node.js version
NODE_VERSION=$(node --version)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)

if [ "$MAJOR_VERSION" -lt 22 ]; then
    echo "⚠️  Warning: Node.js 22+ recommended for native WebSocket support"
    echo "📦 Current version: $NODE_VERSION"
    echo "💡 Consider upgrading: https://nodejs.org/"
fi

# Set Node.js options for WebSocket support
export NODE_OPTIONS="--experimental-websocket $NODE_OPTIONS"

# Change to project directory
cd "$(dirname "$(dirname "$(realpath "$0")")")"

# Use mise to ensure Node.js 22
if command -v mise >/dev/null 2>&1; then
    echo "✅ Using mise for Node.js 22..."
    exec mise exec -- node --experimental-websocket "$@"
else
    echo "✅ Using system Node.js with WebSocket support..."
    exec node --experimental-websocket "$@"
fi