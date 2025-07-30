/**
 * Unified Interface Plugin (TypeScript)
 * Seamless CLI, TUI, and Web interface integration with type safety
 */

import boxen from 'boxen';
import chalk from 'chalk';
import { ChildProcess, fork, spawn } from 'child_process';
import Table from 'cli-table3';
import express, { Express, Request, Response } from 'express';
import { createWriteStream } from 'fs';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { createServer, Server } from 'http';
import { Box, render, Text, useInput } from 'ink';
import inquirer from 'inquirer';
import ora, { Ora } from 'ora';
import { join } from 'path';
import React, { useEffect, useState } from 'react';
import { WebSocket, WebSocketServer } from 'ws';
import {
  type JSONObject,
  PluginConfig,
  PluginContext,
  PluginManifest,
} from '../../types/plugin.js';
import { BasePlugin } from '../base-plugin.js';

// Interface mode types
type InterfaceMode = 'auto' | 'cli' | 'tui' | 'web' | 'daemon';

interface Theme {primary = > void
}

interface CLIInterface {displayTable = > void
showProgress = > Ora;
prompt = > Promise<any>;
success = > void;
error = > void;
warning = > void;
info = > void;
box = > void;
}

interface WebServerInfo {httpServer = null
private
httpServer = null;
private
webServer = null;
private
wsServer = null;
private
tuiInstance = null;
private
sessions = new Map();
private
wsClients = new Set();
private
schemaData = null;

private
readonly;
themes = {dark = new Map();
private
routes = new Map();
private
eventHandlers = new Map();

constructor(manifest = process.env.PORT ? parseInt(process.env.PORT) : null;
const interfaceConfig = {defaultMode = = false,refreshInterval = = false
    };

// Store config back to plugin settings
Object.assign(this.config.settings, interfaceConfig);

// Ensure web static directory exists
await mkdir(interfaceConfig.staticDir, {recursive = this.detectInterfaceMode();

// Register default components
this.registerDefaultComponents();

// Setup event handlers
this.setupEventHandlers();

this.context.apis.logger.info('Unified Interface Plugin initialized', {
      webPort => {
      this.context.apis.logger.info('Session started', {sessionId = == 'true') {
      await this.cleanup();
} else
{
  this.context.apis.logger.info('Unified server staying alive for external access');
}
}

  protected async onDestroy(): Promise<void>
{
  await this.cleanup();
}

// Interface mode detection
private
detectInterfaceMode();
: InterfaceMode
{
  const defaultMode = this.config.settings.defaultMode || 'auto';
  if (defaultMode !== 'auto') {
    return defaultMode;
  }

  // Check command line arguments
  const args = process.argv.slice(2);

  // Check for daemon mode
  if (args.includes('--daemon')) {
    this.config.settings.daemonMode = true;
    return 'daemon';
  }

  if (args.includes('--web') || process.env.CLAUDE_ZEN_WEB === 'true') {
    return 'web';
  }

  if (args.includes('--tui') || process.env.CLAUDE_ZEN_TUI === 'true') {
    return 'tui';
  }

  if (args.includes('--cli') || process.env.CLAUDE_ZEN_CLI === 'true') {
    return 'cli';
  }

  // Auto-detect based on environment
  if (!process.stdout.isTTY) {
    return 'cli'; // Non-interactive environment
  }

  if (process.env.TERM_PROGRAM === 'vscode' || process.env.CI) {
    return 'cli'; // VS Code terminal or CI environment
  }

  // Default to TUI for interactive terminals
  return 'tui';
}

// Component registration
private
registerDefaultComponents();
: void
{
  // CLI Components
  this.components.set('cli-header', this.createCliHeader.bind(this));
  this.components.set('cli-table', this.createCliTable.bind(this));
  this.components.set('cli-progress', this.createCliProgress.bind(this));
  this.components.set('cli-prompt', this.createCliPrompt.bind(this));

  // TUI Components
  this.components.set('tui-dashboard', this.createTuiDashboard.bind(this));
  this.components.set('tui-sidebar', this.createTuiSidebar.bind(this));
  this.components.set('tui-status', this.createTuiStatus.bind(this));

  // Web Components
  this.components.set('web-dashboard', this.createWebDashboard.bind(this));
  this.components.set('web-api', this.createWebApi.bind(this));
}

// Event handler setup
private
setupEventHandlers();
: void
{
  // Handle process signals
  process.on('SIGINT', () => {
    this.shutdown();
  });

  process.on('SIGTERM', () => {
    this.shutdown();
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    this.context.apis.logger.error('Uncaught Exception', error);
    this.shutdown();
  });
}

// CLI Interface Methods
async;
startCliMode();
: Promise<CLIInterface>
{
  console.warn(this.createCliHeader('Claude Zen CLI Mode'));

  return {displayTable = > this.displayCliTable(data, headers),showProgress = > this.showCliProgress(message),prompt = > this.showCliPrompt(questions),success = > this.showCliMessage(message, 'success'),error = > this.showCliMessage(message, 'error'),warning = > this.showCliMessage(message, 'warning'),info = > this.showCliMessage(message, 'info'),box = > this.showCliBox(content, options)
    };
}

private
createCliHeader((title = ''));
: string
{
  const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];

  return boxen(
      chalk.hex(theme.primary).bold(title) + 
      (subtitle ? '\n' + chalk.hex(theme.secondary)(subtitle) : ''),
      {padding = this.themes[this.config.settings.theme as 'dark' | 'light'];

  const table = new Table({head = > chalk.hex(theme.primary).bold(h)),
      style => {
      table.push(row.map(cell => 
        typeof cell === 'string' ?cell = == 'dark' ? 'cyan' : 'blue'
    }).start();
}

private
async;
showCliPrompt((questions = 'info'));
: void
{
  const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];

  console.warn(boxen(content, {padding = () => {
      const [activeTab, setActiveTab] = useState('dashboard');
      const [data, setData] = useState<JSONObject>({});
      const [status, setStatus] = useState('Ready');

      // Handle keyboard input
      useInput((input, key) => {
        if (key.ctrl && input === 'c') {
          this.shutdown();
        }

        // Tab switching
        const tabs = ['dashboard', 'hives', 'plugins', 'logs'];
        const tabIndex = parseInt(input) - 1;

        if (tabIndex >= 0 && tabIndex < tabs.length) {
          setActiveTab(tabs[tabIndex]);
        }

        // Navigation
        if (key.leftArrow || key.rightArrow) {
          const currentIndex = tabs.indexOf(activeTab);
          const nextIndex = currentIndex > 0 ? currentIndex -1 = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          }

          setActiveTab(tabs[nextIndex]);
        }

        // Refresh
        if (input === 'r') {
          setStatus('Refreshing...');
          this.refreshData().then(newData => {
            setData(newData);
            setStatus('Ready');
          });
        }
      });

  // Auto-refresh data
  useEffect(() => {
    if (this.config.settings.autoRefresh) {
      const interval = setInterval(() => {
        this.refreshData().then(setData);
      }, this.config.settings.refreshInterval);

      return () => clearInterval(interval);
    }
  }, []);

  return this.createTuiDashboard({ activeTab, data, status, setActiveTab });
}

this.tuiInstance = render(React.createElement(TuiApp));
return this.tuiInstance;
}

  private createTuiDashboard(
{
  activeTab, data, status;
}
: TuiAppProps): React.ReactElement
{
  return React.createElement(Box, { flexDirection => {

          return React.createElement(Box, { key = {Dashboard = express();

  // Middleware
  app.use(express.json());
  app.use(express.static(this.config.settings.staticDir));

  // Generate web assets
  await this.generateWebAssets();

  // API Routes
  this.setupWebRoutes(app);

  // Create HTTP server
  this.httpServer = createServer(app);

  // Setup WebSocket
  await this.setupWebSocketServer();

  // Start the unified server
  await new Promise<void>((resolve, reject) => {
    this.httpServer!.listen(this.config.settings.webPort, '0.0.0.0', () => {
      this.context.apis.logger.info('Unified server ready', {
          port => {
        if (error.code === 'EADDRINUSE') {
          this.context.apis.logger.warn(`Port ${this.config.settings.webPort} in use - checking for existing server`);
          resolve(); // Don't reject, assume external server is running
          return;
        }
        reject(error);
    });
  });

  this.webServer = app;

  return {httpServer = this.createWebDashboard();
  await writeFile(join(this.config.settings.staticDir, 'index.html'), htmlContent);

  // Generate CSS
  const cssContent = this.createWebStyles();
  await writeFile(join(this.config.settings.staticDir, 'styles.css'), cssContent);

  // Generate JavaScript
  const jsContent = this.createWebScript();
  await writeFile(join(this.config.settings.staticDir, 'app.js'), jsContent);
}

private
createWebDashboard();
: string
{
  const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Zen - Web Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body data-theme="${this.config.settings.theme}">
    <div id="app">
        <nav class="navbar">
            <div class="nav-brand">
                <h1>🚀 Claude Zen</h1>
                <span class="version">v2.0.0</span>
            </div>
            <div class="nav-controls">
                <button id="theme-toggle" class="btn btn-icon">🎨</button>
                <button id="refresh-btn" class="btn btn-icon">🔄</button>
                <div class="status-indicator" id="status">
                    <span class="status-dot"></span>
                    <span class="status-text">Connected</span>
                </div>
            </div>
        </nav>

        <div class="main-container">
            <aside class="sidebar">
                <div class="sidebar-menu">
                    <button class="menu-item active" data-tab="dashboard">
                        📊 Dashboard
                    </button>
                    <button class="menu-item" data-tab="queens">
                        👑 Queens
                    </button>
                    <button class="menu-item" data-tab="hives">
                        🐝 Hives
                    </button>
                    <button class="menu-item" data-tab="plugins">
                        🔌 Plugins
                    </button>
                    <button class="menu-item" data-tab="settings">
                        ⚙️ Settings
                    </button>
                </div>
            </aside>

            <main class="content">
                <div id="dashboard" class="tab-content active">
                    <h2>📊 System Overview</h2>
                    <div class="stats-grid" id="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" id="hive-count">0</div>
                            <div class="stat-label">Hives</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="plugin-count">0</div>
                            <div class="stat-label">Plugins</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="session-count">0</div>
                            <div class="stat-label">Sessions</div>
                        </div>
                    </div>
                </div>

                <div id="queens" class="tab-content">
                    <h2>👑 Queen Council Status</h2>
                    <div id="queen-list" class="item-list">
                        <div class="loading">Loading queens...</div>
                    </div>
                </div>

                <div id="hives" class="tab-content">
                    <h2>🐝 Hive Management</h2>
                    <div id="hive-list" class="item-list">
                        <div class="loading">Loading hives...</div>
                    </div>
                </div>

                <div id="plugins" class="tab-content">
                    <h2>🔌 Plugin Status</h2>
                    <div id="plugin-list" class="item-list">
                        <div class="loading">Loading plugins...</div>
                    </div>
                </div>

                <div id="settings" class="tab-content">
                    <h2>⚙️ Settings</h2>
                    <div class="settings-form">
                        <div class="form-group">
                            <label for="theme-select">Theme</label>
                            <select id="theme-select">
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="refresh-interval">Auto-refresh Interval (ms)</label>
                            <input type="number" id="refresh-interval" value="${this.config.settings.refreshInterval}">
                        </div>
                        <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
                    </div>
                </div>
            </main>
        </div>

        <div class="command-panel">
            <div class="command-input">
                <input type="text" id="command" placeholder="Enter command...">
                <button class="btn btn-primary" onclick="executeCommand()">Execute</button>
            </div>
            <div id="command-output" class="command-output"></div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>`;
}

private
createWebStyles();
: string
{
  const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];

  return `
/* CSS styles implementation - truncated for brevity */
/* This would contain the full CSS from the original file */
[data-theme="dark"] {
    --bg-primary = null;
        this.currentTab = 'dashboard';
        this.data = {};
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.connectWebSocket();
        this.loadData();
    }
    
    connectWebSocket() {
        const protocol = window.location.protocol === 'https = window.location.host;
        this.ws = new WebSocket(\`\${protocol}//\${host}/ws\`);
        
        this.ws.onopen = () => {
            console.warn('WebSocket connected');
            this.updateStatus('Connected', 'success');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
        };
        
        this.ws.onclose = () => {
            console.warn('WebSocket disconnected');
            this.updateStatus('Disconnected', 'error');
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }
    
    async loadData() {
        try {
            const [plugins, stats] = await Promise.all([
                fetch('/api/plugins').then(r => r.json()),
                fetch('/api/stats').then(r => r.json())
            ]);
            
            this.data = { plugins, stats };
            this.updateUI();
        } catch (error) {
            console.error('Failed to loaddata = (this.data.plugins || []).length;
        document.getElementById('session-count').textContent = 
            this.data.stats?.sessions || 0;
    }
    
    updateStatus(text, type) {
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        statusText.textContent = text;
        statusDot.className = \`status-dot status-\${type}\`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ClaudeZenDashboard();
});

function executeCommand() {
    // Command execution implementation
}

function saveSettings() {
    // Settings save implementation
}
`;
}

private
setupWebRoutes(app => {
      res.json({
        status => {
      try {
        const plugins = await this.getPluginsData();
        res.json(plugins);
      } catch (error => {
      try {
        const stats = {
          sessions => {
      try {
        const { command } = req.body;

        res.json({ success => {
      try {
        const settings = req.body;
        Object.assign(this.config.settings, settings);
        res.json({success = new WebSocketServer({ 
      server => {
      this.context.apis.logger.info('WebSocket client connected');
      this.wsClients.add(websocket);

      websocket.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(websocket, message);
        } catch (error) {
          this.context.apis.logger.error('Invalid WebSocket message', error);
        }
      });

      websocket.on('close', () => {
        this.context.apis.logger.info('WebSocket client disconnected');
        this.wsClients.delete(websocket);
      });

      websocket.on('error', (error) => {
        this.context.apis.logger.error('WebSocket error', error);
        this.wsClients.delete(websocket);
      });

      // Send initial data
      this.sendWebSocketMessage(websocket, {type = message.theme;
        this.context.apis.logger.info(`Theme changedto = await this.getDaemonPid();
      return {status = fork(process.argv[1], process.argv.slice(2), {detached = = child.pid) {
      process.exit(0);
    }
  }

  private async setupDaemonLogging(): Promise<void> {
    // Redirect stdout and stderr to log file
    const logStream = createWriteStream(this.config.settings.logFile, {flags = logStream.write.bind(logStream) as any;
    process.stderr.write = logStream.write.bind(logStream) as any;
  }

  private async writePidFile(): Promise<void> {
    await writeFile(this.config.settings.pidFile, process.pid.toString());
  }

  private async isDaemonRunning(): Promise<boolean> {
    try {
      await access(this.config.settings.pidFile);
      const pid = await this.getDaemonPid();

      if (pid) {
        // Check if process is actually running
        try {
          process.kill(pid, 0); // Signal 0 just checks if process exists
          return true;
        } catch (error) {
          // Process not running, remove stale PID file
          await this.removePidFile();
          return false;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async getDaemonPid(): Promise<number | null> {
    try {
      const pidContent = await readFile(this.config.settings.pidFile, 'utf8');
      return parseInt(pidContent.trim());
    } catch (error) {
      return null;
    }
  }

  private async removePidFile(): Promise<void> {
    try {
      await writeFile(this.config.settings.pidFile, ''); // Clear the file instead of deleting
    } catch (error) {
      // Ignore errors when removing PID file
    }
  }

  // Public API methods
  async start(mode?: InterfaceMode): Promise<any> {
    const targetMode = mode || this.currentMode!;

    switch (targetMode) {
      case 'daemon':
        return await this.startDaemonMode();
      case 'cli':
        return await this.startCliMode();
      case 'tui':
        return await this.startTuiMode();
      case 'web':
        return await this.startWebMode();default = == this.currentMode) {
      return;
    }

    // Cleanup current mode
    await this.cleanup();

    // Switch to new mode
    this.currentMode = newMode;
    return await this.start(newMode);
  }

  broadcast(message => {
        try {
          this.sendWebSocketMessage(client, message);
        } catch (error) {
          this.context.apis.logger.error('Failed to send WebSocket message', error);
          this.wsClients.delete(client);
        }
      });
    }
  }

  async getStats(): Promise<JSONObject> {
    return {currentMode = await this.isDaemonRunning();
    const pid = await this.getDaemonPid();

    if (isRunning) {
      return {status = == 'true') {
      this.context.apis.logger.info('Unified server staying alive in daemon mode');
    } else {
      // Only cleanup if explicitly requested
      if (process.env.CLAUDE_ZEN_SHUTDOWN === 'true') {
        if (this.httpServer) {
          this.httpServer.close();
          this.httpServer = null;
        }

        if (this.wsClients) {
          this.wsClients.forEach(client => {
            try {
              client.close();
            } catch (error) {
              // Ignore errors when closing clients
            }
          });
          this.wsClients.clear();
        }

        this.webServer = null;
        this.wsServer = null;
      } else {
        this.context.apis.logger.info('Unified server staying alive for external access');
      }
    }

    // Cleanup TUI
    if (this.tuiInstance) {
      this.tuiInstance.unmount();
      this.tuiInstance = null;
    }

    // Clear sessions but keep unified server running
    this.sessions.clear();
  }

  private async shutdown(): Promise<void> {
    await this.cleanup();
    this.context.apis.logger.info('Claude Zen interface shutting down');
    process.exit(0);
  }

  // Placeholder component methods
  private createCliTable(data: any[], headers: string[]): void {
    // Implementation would be similar to displayCliTable
  }

  private createCliProgress(message: string): Ora {
    return this.showCliProgress(message);
  }

  private createCliPrompt(questions: any[]): Promise<any> {
    return this.showCliPrompt(questions);
  }

  private createTuiSidebar(): React.ReactElement {
    return React.createElement('div', {}, 'TUI Sidebar');
  }

  private createTuiStatus(): React.ReactElement {
    return React.createElement('div', {}, 'TUI Status');
  }

  private createWebApi(): JSONObject {
    return { api: 'web-api' };
  }
}

export default UnifiedInterfacePlugin;
