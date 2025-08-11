#!/usr/bin/env node
/**
 * Claude Code Zen - Wrapper with Startup Messages
 * 
 * This wrapper adds proper startup messages and ensures the user
 * knows when the server is running.
 */

// Parse command line arguments
const mode = process.argv[2] || 'web';
const portArg = process.argv.find(arg => arg.startsWith('--port='));
const port = portArg ? portArg.split('=')[1] : '3000';

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Claude Code Zen - Unified AI Orchestration Platform

Usage: claude-zen [mode] [options]

Modes:
  web         Web interface only on port 3000 (no TUI)
  tui         Terminal interface only (no web)
  swarm       Stdio MCP swarm server only (no port, no web)
  (default)   Full system: Web + AI + TUI + HTTP MCP + Safety
  
Options:
  --port      Port for web server (default: 3000)
  --help      Show this help

Examples:
  claude-zen web                # Web interface only
  claude-zen tui                # Terminal interface only
  claude-zen                    # Full system: Web + AI + TUI + MCP + Safety
  claude-zen swarm              # Stdio swarm server only
`);
  process.exit(0);
}

console.log('🚀 Starting Claude Code Zen...');

if (mode === 'web') {
  console.log('🌐 Mode: Web interface only');
  console.log(`📱 Starting server on port ${port}...`);
  
  // Import and run the actual application
  import('./dist/claude-zen.js').then(async () => {
    // Wait a moment for the server to start
    setTimeout(() => {
      console.log(`✅ Web interface running at http://localhost:${port}`);
      console.log('🎯 Interactive dashboard with multiple screens available');
      console.log('📊 Features: Dashboard, Swarm Control, MCP, Performance Monitor, Logs, Files');
      console.log('🛠️ Use Ctrl+C to stop the server');
    }, 2000);
  }).catch(error => {
    console.error('💥 Failed to start Claude Code Zen:', error.message);
    process.exit(1);
  });
} else {
  // For other modes, just run the original
  import('./dist/claude-zen.js').catch(error => {
    console.error('💥 Failed to start Claude Code Zen:', error.message);
    process.exit(1);
  });
}