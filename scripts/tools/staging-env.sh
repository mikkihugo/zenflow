#!/bin/bash
# Vision-to-Code Staging Environment Setup Script

echo "🚀 Setting up Vision-to-Code staging environment..."

# Create logs directory
mkdir -p logs
chmod 755 logs

# Create database directory
mkdir -p data
chmod 755 data

# Set environment variables for staging
export NODE_ENV="staging"
export DATABASE_URL="sqlite:./data/vision-to-code.db"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export LOG_LEVEL="info"

# Service URLs
export BUSINESS_SERVICE_URL="http://localhost:4106"
export CORE_SERVICE_URL="http://localhost:4105"
export SWARM_SERVICE_URL="http://localhost:4108"
export DEVELOPMENT_SERVICE_URL="http://localhost:4103"

# API Keys (optional - will use mock if not provided)
# export GEMINI_API_KEY="your-gemini-key-here"
# export ANTHROPIC_API_KEY="your-anthropic-key-here"
# export OPENAI_API_KEY="your-openai-key-here"

echo "✅ Environment variables set"
echo "📁 Created directories: logs/, data/"
echo "🌐 Service URLs configured:"
echo "  - Business Service: $BUSINESS_SERVICE_URL"
echo "  - Core Service: $CORE_SERVICE_URL"
echo "  - Swarm Service: $SWARM_SERVICE_URL"
echo "  - Development Service: $DEVELOPMENT_SERVICE_URL"
echo ""
echo "🔧 Next steps:"
echo "  1. Source this file: source ./staging-env.sh"
echo "  2. Start services: pm2 start vision-to-code-pm2.config.js"
echo "  3. Check status: pm2 status"
echo "  4. View logs: pm2 logs"