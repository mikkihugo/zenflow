#!/usr/bin/env node
/**
 * Simple Terminal Web Interface
 * 
 * Launches web server and displays web content in terminal using blessed
 */

import { spawn } from 'node:child_process';
import * as blessed from 'blessed';

async function main() {
  console.log('🧠 Starting hybrid web+terminal interface...');
  
  // Start web server in background
  console.log('📡 Starting web server...');
  const webServer = spawn('npx', ['tsx', 'minimal-server.ts'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Create terminal UI
  console.log('🖥️  Launching terminal interface...');
  
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Claude Code Zen - Terminal Interface',
    fullUnicode: true,
  });

  // Header
  const header = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    border: { type: 'line' },
    style: {
      border: { fg: 'cyan' },
      bg: 'black',
      fg: 'white',
    },
    label: ' Claude Code Zen - Web Interface in Terminal ',
    content: 'URL: http://localhost:3000'
  });

  // Main content area  
  const content = blessed.box({
    parent: screen,
    top: 3,
    left: 0,
    width: '100%',
    height: '100%-5',
    border: { type: 'line' },
    style: {
      border: { fg: 'blue' },
    },
    label: ' Dashboard Content ',
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    content: `
{center}{bold}{cyan-fg}🚀 Claude Code Zen Dashboard{/}{/center}

{bold}System Status:{/}
• Web Server: Running on http://localhost:3000  
• Mode: Terminal Interface (Web-Powered)
• Features: Interactive Dashboard with Multiple Screens

{bold}Available Screens:{/}
• 📊 Dashboard - System overview and metrics
• 🐝 Swarm Control - Agent management and coordination  
• 🔗 MCP Servers - Integration management
• ⚡ Performance - Real-time system metrics
• 📝 Logs - System logs and events
• 📁 Files - Project file navigation
• ⌨️ Commands - Quick command execution
• ⚙️ Settings - Configuration options

{bold}Navigation:{/}
• Press 'w' to open in web browser
• Press 'r' to refresh content
• Press 'q' to quit
• Use arrow keys to scroll

{center}{green-fg}The same rich interface, now in your terminal!{/center}
    `
  });

  // Footer
  const footer = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    width: '100%',
    height: 2,
    border: { type: 'line' },
    style: {
      border: { fg: 'green' },
      bg: 'black',
      fg: 'yellow',
    },
    content: 'Press q to quit | w for web browser | r to refresh | ↑↓ to scroll'
  });

  // Key handlers
  screen.key(['q', 'C-c'], () => {
    webServer.kill();
    process.exit(0);
  });

  screen.key(['w'], async () => {
    const { exec } = await import('node:child_process');
    exec('open http://localhost:3000 || xdg-open http://localhost:3000');
  });

  screen.key(['r'], async () => {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://localhost:3000/api/status');
      const status = await response.json();
      
      content.setContent(`
{center}{bold}{cyan-fg}🚀 Claude Code Zen Dashboard (Refreshed){/}{/center}

{bold}Live System Status:{/}
• Status: ${status.data?.status || 'running'}
• Version: ${status.data?.version || '1.0.0-alpha.43'}
• Features: ${status.data?.features?.join(', ') || 'web-interface, mcp-ready'}
• Last Updated: ${new Date().toLocaleTimeString()}

{bold}Available Screens:{/}
• 📊 Dashboard - System overview and metrics
• 🐝 Swarm Control - Agent management and coordination  
• 🔗 MCP Servers - Integration management
• ⚡ Performance - Real-time system metrics
• 📝 Logs - System logs and events
• 📁 Files - Project file navigation
• ⌨️ Commands - Quick command execution
• ⚙️ Settings - Configuration options

{bold}Navigation:{/}
• Press 'w' to open in web browser
• Press 'r' to refresh content
• Press 'q' to quit
• Use arrow keys to scroll

{center}{green-fg}Web interface running at http://localhost:3000{/center}
      `);
      screen.render();
    } catch (error) {
      content.setContent(`{center}{red-fg}Error refreshing: ${error.message}{/center}`);
      screen.render();
    }
  });

  screen.render();
  
  // Cleanup on exit
  process.on('exit', () => {
    if (!webServer.killed) {
      webServer.kill();
    }
  });
}

main().catch(console.error);