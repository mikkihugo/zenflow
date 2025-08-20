#!/bin/bash

# Claude Code Zen MCP Server - Direct TypeScript execution
# Uses tsx for reliable execution of SwarmCommander MCP tools

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"

# Run MCP server using tsx (reliable TypeScript execution)
echo "Starting Claude Code Zen MCP Server with SwarmCommander..." >&2
npx tsx src/interfaces/mcp-stdio/swarm-server.ts