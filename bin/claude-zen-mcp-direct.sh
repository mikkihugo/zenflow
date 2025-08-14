#!/bin/bash

# Claude Code Zen MCP Server - Direct JavaScript execution
# Bypasses TypeScript compilation issues by running built JavaScript directly

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"

# Run MCP server using node directly with built files
if [ -f "dist/interfaces/mcp-stdio/swarm-server.js" ]; then
    echo "Running built MCP server..." >&2
    node dist/interfaces/mcp-stdio/swarm-server.js
else
    echo "No built files found, attempting tsx..." >&2
    npx tsx src/interfaces/mcp-stdio/swarm-server.ts
fi