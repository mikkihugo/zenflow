#!/bin/bash

# Claude Code Zen MCP Server Launcher
# Ensures the MCP server runs from the correct directory with tsx

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory and run the MCP server with tsx
cd "$PROJECT_DIR" && npx tsx src/interfaces/mcp-stdio/swarm-server.ts