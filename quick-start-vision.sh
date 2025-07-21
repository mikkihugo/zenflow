#!/bin/bash
# Quick Start Script for Vision-to-Code Services
# Bypasses PM2 complex configuration and starts services directly

echo "🚀 Quick Start: Vision-to-Code Services"
echo "======================================="

# Kill any existing services
echo "🛑 Stopping existing services..."
pkill -f "vision-test-server.cjs" 2>/dev/null || true

# Start services in background with explicit ports
echo "🚀 Starting Vision-to-Code services..."

# Business Service (Port 4106)
echo "Starting Business Service on port 4106..."
PORT=4106 SERVICE_NAME="business-service" nohup node services/vision-test-server.cjs > logs/quick-business.log 2>&1 &
BUSINESS_PID=$!
echo "Business Service PID: $BUSINESS_PID"

# Core Service (Port 4105)  
echo "Starting Core Service on port 4105..."
PORT=4105 SERVICE_NAME="core-service" nohup node services/vision-test-server.cjs > logs/quick-core.log 2>&1 &
CORE_PID=$!
echo "Core Service PID: $CORE_PID"

# Swarm Service (Port 4108)
echo "Starting Swarm Service on port 4108..."
PORT=4108 SERVICE_NAME="swarm-service" nohup node services/vision-test-server.cjs > logs/quick-swarm.log 2>&1 &
SWARM_PID=$!
echo "Swarm Service PID: $SWARM_PID"

# Development Service (Port 4103)
echo "Starting Development Service on port 4103..."
PORT=4103 SERVICE_NAME="development-service" nohup node services/vision-test-server.cjs > logs/quick-development.log 2>&1 &
DEVELOPMENT_PID=$!
echo "Development Service PID: $DEVELOPMENT_PID"

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 5

# Test services
echo ""
echo "🔍 Testing services..."

test_service() {
    local name="$1"
    local port="$2"
    echo -n "$name (port $port): "
    if curl -s -f "http://localhost:$port/health" > /dev/null; then
        echo "✅ Healthy"
    else
        echo "❌ Unhealthy"
    fi
}

test_service "Business Service" 4106
test_service "Core Service" 4105  
test_service "Swarm Service" 4108
test_service "Development Service" 4103

echo ""
echo "📋 Service URLs:"
echo "  Business Service:    http://localhost:4106"
echo "  Core Service:        http://localhost:4105"
echo "  Swarm Service:       http://localhost:4108"
echo "  Development Service: http://localhost:4103"

echo ""
echo "📝 Process IDs:"
echo "  Business: $BUSINESS_PID"
echo "  Core: $CORE_PID"
echo "  Swarm: $SWARM_PID"
echo "  Development: $DEVELOPMENT_PID"

echo ""
echo "📜 Log Files:"
echo "  Business: logs/quick-business.log"
echo "  Core: logs/quick-core.log"
echo "  Swarm: logs/quick-swarm.log"
echo "  Development: logs/quick-development.log"

echo ""
echo "🛑 To stop all services, run: pkill -f vision-test-server.cjs"
echo ""
echo "✅ Vision-to-Code services started successfully!"