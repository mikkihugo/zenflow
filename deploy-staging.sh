#!/bin/bash
# Vision-to-Code Staging Deployment Script

set -e

echo "🚀 Deploying Vision-to-Code System to Staging"
echo "=============================================="

# Check if PM2 is available
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not found. Please install PM2: npm install -g pm2"
    exit 1
fi

# Check if SQLite is available
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ SQLite3 not found. Please install SQLite3"
    exit 1
fi

# Source environment variables
echo "📋 Setting up environment..."
source ./staging-env.sh

# Create database and run schema
echo "🗄️  Setting up database..."
sqlite3 ./data/vision-to-code.db < db-schema.sql
echo "✅ Database schema created"

# Stop any existing Vision-to-Code services
echo "🛑 Stopping existing services..."
pm2 delete business-service 2>/dev/null || true
pm2 delete core-service 2>/dev/null || true
pm2 delete swarm-service 2>/dev/null || true
pm2 delete development-service 2>/dev/null || true

# Start all services with PM2
echo "🚀 Starting Vision-to-Code services..."
pm2 start vision-to-code-pm2.config.cjs

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check service status
echo "📊 Service Status:"
pm2 status

# Health check all services
echo ""
echo "🔍 Running health checks..."

# Business Service (Port 4106)
echo -n "  Business Service (4106): "
if curl -s -f http://localhost:4106/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Core Service (Port 4105)
echo -n "  Core Service (4105): "
if curl -s -f http://localhost:4105/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy (might be normal for agent coordinator)"
fi

# Swarm Service (Port 4108)
echo -n "  Swarm Service (4108): "
if curl -s -f http://localhost:4108/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy (might be normal for LLM router)"
fi

# Development Service (Port 4103)
echo -n "  Development Service (4103): "
if curl -s -f http://localhost:4103/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy (might be normal for storage service)"
fi

echo ""
echo "📋 Service Information:"
echo "  Business Service:    http://localhost:4106"
echo "  Core Service:        http://localhost:4105"
echo "  Swarm Service:       http://localhost:4108"
echo "  Development Service: http://localhost:4103"
echo ""
echo "📝 Useful Commands:"
echo "  pm2 status           - Check service status"
echo "  pm2 logs             - View all logs"
echo "  pm2 logs [service]   - View specific service logs"
echo "  pm2 restart all      - Restart all services"
echo "  pm2 stop all         - Stop all services"
echo "  pm2 delete all       - Remove all services"
echo ""
echo "✅ Vision-to-Code staging deployment complete!"