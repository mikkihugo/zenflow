#!/bin/bash

# claude-code-zen Development Server
# Optimized development workflow with Svelte integration

echo "🚀 Starting claude-code-zen development environment..."
echo ""

# Check if ports are available
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use ($service)"
        return 1
    fi
    return 0
}

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Cleaning up..."
    # Kill background jobs
    kill $(jobs -p) 2>/dev/null
    wait
    echo "✅ Cleanup complete"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Check ports
echo "🔍 Checking ports..."
check_port 3000 "Express Server" || exit 1
check_port 3002 "Svelte Dev Server" || exit 1

# Start Svelte dev server in background
echo "🎨 Starting Svelte dev server on port 3002..."
npm run dev:svelte &
SVELTE_PID=$!

# Wait a moment for Svelte to start
sleep 3

# Start Express server with nodemon
echo "⚡ Starting Express server on port 3000 with optimized nodemon..."
echo "   • 60-second restart throttle"
echo "   • Ignores Svelte build files"
echo "   • Auto-proxies to Svelte dashboard"
echo ""

npm run dev:watch &
EXPRESS_PID=$!

echo "✅ Development servers started:"
echo "   🌐 Main Dashboard: http://localhost:3000/"
echo "   🎨 Svelte Dev: http://localhost:3002/"
echo "   📊 Dashboard: http://localhost:3000/dashboard"
echo "   💚 Health Check: http://localhost:3000/api/health"
echo ""
echo "🔥 Both servers running! Press Ctrl+C to stop."
echo ""

# Keep script alive and wait for background processes
wait