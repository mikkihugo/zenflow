#!/usr/bin/env node

import { spawn } from 'child_process';
import { createServer } from 'http';
import { readFileSync, watch } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

// LogTape syslog bridge - optional feature
let syslogBridge = null;
try {
  // Try to import syslog bridge if available
  const syslogModule = await import('../src/utils/logtape-syslog-bridge');
  syslogBridge = syslogModule.syslogBridge;
  console.log('✅ LogTape syslog bridge loaded successfully');
} catch (error) {
  console.log('ℹ️ LogTape syslog bridge not available (optional feature)');
  // Provide a simple null implementation
  syslogBridge = {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {}
  };
}

const PORT = process.env.PORT || 3000;
const ERROR_PORT = 3001; // Fallback error server

let mainServer = null;
let errorServer = null;
let lastError = null;
let fileWatcher = null;
let isCheckingTypes = false;
let debounceTimer = null;

// ANSI color codes for terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function createErrorPage(error) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Zen - Compile Error</title>
    <style>
        body {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background: #1a1a1a;
            color: #fff;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: #ff4757;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .error-content {
            background: #2d3436;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ff4757;
        }
        .error-text {
            white-space: pre-wrap;
            overflow-x: auto;
            font-size: 14px;
        }
        .status {
            background: #74b9ff;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            margin-bottom: 20px;
            text-align: center;
        }
        .auto-refresh {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #00b894;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
        }
    </style>
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => window.location.reload(), 30000);
    </script>
</head>
<body>
    <div class="auto-refresh">Auto-refreshing in 30s...</div>
    <div class="container">
        <div class="header">
            <h1>🚨 Claude Code Zen - TypeScript Compile Error</h1>
            <p>Fix the error below and the server will auto-restart</p>
        </div>
        
        <div class="status">
            <strong>Status:</strong> Waiting for fix... Watching files for changes
        </div>
        
        <div class="error-content">
            <h3>Error Details:</h3>
            <div class="error-text">${error}</div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #636e72; border-radius: 4px; color: #ddd;">
            <strong>💡 Tips:</strong>
            <ul>
                <li>This page auto-refreshes every 30 seconds</li>
                <li>The server will restart automatically when you fix the error</li>
                <li>Check your TypeScript files for syntax errors</li>
                <li>Look for missing imports or type errors</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}

function startErrorServer() {
  if (errorServer) return;
  
  errorServer = createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    });
    
    if (lastError) {
      res.end(createErrorPage(lastError));
    } else {
      res.end(createErrorPage('Server starting...'));
    }
  });
  
  errorServer.listen(PORT, () => {
    console.log(`${colors.yellow}🚨 Error server running at http://localhost:${PORT}${colors.reset}`);
    console.log(`${colors.cyan}   Fix the TypeScript errors and the main server will restart${colors.reset}`);
  });
}

function stopErrorServer() {
  if (errorServer) {
    errorServer.close();
    errorServer = null;
  }
}

function runTypeCheck() {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}🔍 Running TypeScript type check...${colors.reset}`);
    
    const tsc = spawn('npx', ['tsc', '--noEmit', '--project', './tsconfig.json'], {
      stdio: 'pipe',
      cwd: path.join(process.cwd(), 'apps/claude-code-zen-server')
    });
    
    let stdout = '';
    let stderr = '';
    
    tsc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    tsc.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✅ TypeScript check passed${colors.reset}`);
        if (syslogBridge) {
          syslogBridge.info('typescript', 'TypeScript compilation successful', {
            exitCode: code,
            component: 'tsc'
          });
        }
        resolve();
      } else {
        const error = stderr || stdout || 'Unknown TypeScript error';
        console.log(`${colors.red}❌ TypeScript check failed:${colors.reset}`);
        console.log(error);
        if (syslogBridge) {
          syslogBridge.error('typescript', 'TypeScript compilation failed', {
            exitCode: code,
            errorOutput: error.substring(0, 500), // Truncate for syslog
            component: 'tsc'
          });
        }
        reject(error);
      }
    });
  });
}

function startMainServer() {
  return new Promise((resolve, reject) => {
    console.log(`${colors.green}🚀 Starting main server...${colors.reset}`);
    
    mainServer = spawn('npx', ['tsx', './src/main.ts'], {
      stdio: ['inherit', 'inherit', 'pipe'],
      cwd: path.join(process.cwd(), 'apps/claude-code-zen-server'),
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    let startupError = '';
    
    mainServer.stderr.on('data', (data) => {
      const errorText = data.toString();
      console.error(errorText);
      startupError += errorText;
    });
    
    mainServer.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`${colors.red}💥 Main server exited with code ${code}${colors.reset}`);
        lastError = startupError || `Server exited with code ${code}`;
        reject(new Error(lastError));
      }
    });
    
    // Give the server a moment to start
    setTimeout(() => {
      if (mainServer && !mainServer.killed) {
        console.log(`${colors.green}✅ Main server started successfully${colors.reset}`);
        if (syslogBridge) {
          syslogBridge.info('main-server', 'Claude Code Zen server started successfully', {
            port: PORT,
            pid: mainServer.pid,
            component: 'tsx'
          });
        }
        resolve();
      }
    }, 2000);
  });
}

function stopMainServer() {
  if (mainServer) {
    mainServer.kill('SIGTERM');
    mainServer = null;
  }
}

function broadcastMessage(message) {
  try {
    const { spawn } = require('child_process');
    spawn('/home/mhugo/code/claude-code-zen/broadcast-reload.sh', [message], {
      stdio: 'inherit',
      detached: true
    });
    
    // Also log to syslog for centralized logging
    if (syslogBridge) {
      syslogBridge.info('dev-runner', message, {
        type: 'broadcast',
        pid: process.pid
      });
    }
  } catch (error) {
    // Ignore broadcast errors - non-critical
  }
}

function startFileWatcher() {
  if (fileWatcher) return;
  
  console.log(`${colors.blue}👁️ Watching for TypeScript file changes...${colors.reset}`);
  
  // Watch TypeScript files for changes from the server directory
  const serverDir = path.join(process.cwd(), 'apps/claude-code-zen-server');
  const srcDir = path.join(serverDir, 'src');
  
  fileWatcher = watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.ts') && !isCheckingTypes) {
      console.log(`${colors.cyan}📁 File changed: ${filename}${colors.reset}`);
      
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Set new timer with 10 second debounce
      debounceTimer = setTimeout(async () => {
        if (isCheckingTypes) return; // Double-check
        
        console.log(`${colors.blue}🔍 Debounce complete, checking TypeScript after file changes...${colors.reset}`);
        broadcastMessage("🔄 Claude Code Zen: File changes detected, checking TypeScript...");
        
        isCheckingTypes = true;
        try {
          await runTypeCheck();
          
          // TypeScript passed! Switch to main server
          console.log(`${colors.green}✅ TypeScript errors fixed! Starting main server...${colors.reset}`);
          broadcastMessage("🎉 Claude Code Zen: TypeScript errors fixed! Starting main server...");
          
          stopErrorServer();
          lastError = null;
          await startMainServer();
          
          broadcastMessage("🚀 Claude Code Zen: Server ready at http://localhost:3000");
          
        } catch (error) {
          // Still has errors, update error server
          lastError = error.toString();
          console.log(`${colors.yellow}⚠️ TypeScript errors still present, updating error page...${colors.reset}`);
          broadcastMessage("⚠️ Claude Code Zen: TypeScript errors still present...");
        }
        isCheckingTypes = false;
        debounceTimer = null;
      }, 10000); // 10 second debounce for batch file operations
      
      console.log(`${colors.magenta}⏱️ TypeScript check scheduled in 10 seconds... (batching file changes)${colors.reset}`);
    }
  });
}

function stopFileWatcher() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
}

async function start() {
  console.log(`${colors.bold}${colors.cyan}🔥 Claude Code Zen Development Runner${colors.reset}`);
  console.log(`${colors.cyan}   TypeScript checking + Error visualization${colors.reset}`);
  console.log(`${colors.green}📖 Reload Instructions: See SYSTEMD_INSTRUCTIONS.md & CLAUDE.md${colors.reset}\n`);
  
  try {
    // First, check TypeScript
    await runTypeCheck();
    
    // TypeScript is good, stop error server and start main server
    stopErrorServer();
    lastError = null;
    
    // Broadcast success message
    broadcastMessage("✅ Claude Code Zen: TypeScript check passed, server starting...");
    
    await startMainServer();
    
    // Start file watcher for ongoing development
    startFileWatcher();
    
    // Broadcast server ready
    broadcastMessage("🚀 Claude Code Zen: Server ready at http://localhost:3000");
    
  } catch (error) {
    // TypeScript failed or server crashed
    lastError = error.toString();
    
    console.log(`${colors.red}🚨 Error detected - starting error server${colors.reset}`);
    
    // Broadcast error message
    broadcastMessage("❌ Claude Code Zen: TypeScript errors detected! Fix errors to continue...");
    
    stopMainServer();
    startErrorServer();
    
    // Start file watcher to automatically detect fixes
    startFileWatcher();
    
    console.log(`${colors.yellow}🔄 Error server running. File watcher active - will auto-restart when TypeScript errors are fixed.${colors.reset}`);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log(`${colors.yellow}🔄 Received SIGTERM, shutting down gracefully...${colors.reset}`);
  stopFileWatcher();
  stopMainServer();
  stopErrorServer();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`${colors.yellow}🔄 Received SIGINT, shutting down gracefully...${colors.reset}`);
  stopFileWatcher();
  stopMainServer();
  stopErrorServer();
  process.exit(0);
});

// Start the development server
start();