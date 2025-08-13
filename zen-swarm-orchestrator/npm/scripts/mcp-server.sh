#!/bin/bash
# MCP Server wrapper for zen-swarm
# Ensures clean stdio communication for Claude Code

cd /workspaces/ruv-FANN/zen-swarm/npm
exec node bin/zen-swarm-enhanced.js mcp start --protocol=stdio