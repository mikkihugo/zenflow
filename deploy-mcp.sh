#!/bin/bash

# Deploy Claude Zen MCP Server to Cloudflare Workers

echo "🚀 Deploying Claude Zen MCP Server to Cloudflare..."

# Check if API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN not set"
    echo "Please set your Cloudflare API token:"
    echo "export CLOUDFLARE_API_TOKEN=your_token_here"
    exit 1
fi

# Deploy to Cloudflare Workers
echo "📦 Deploying worker..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌍 Your MCP server is now available at:"
    echo "   https://claude-zen-mcp.your-subdomain.workers.dev/mcp"
    echo "   https://fra-d1.in.centralcloud.net/mcp"
    echo ""
    echo "🔗 Add this to your Claude.ai configuration:"
    echo "   URL: https://fra-d1.in.centralcloud.net/mcp"
    echo "   Authentication: None required"
else
    echo "❌ Deployment failed"
    exit 1
fi