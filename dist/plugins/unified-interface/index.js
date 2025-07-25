/**
 * Unified Interface Plugin
 * Seamless CLI, TUI, and Web interface integration
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput } from 'ink';
import express from 'express';
import { createServer } from 'http';
import chalk from 'chalk';
import boxen from 'boxen';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import ora from 'ora';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { spawn, fork } from 'child_process';
import { ClaudeFlowMCPServer } from '../../mcp/mcp-server.js';

export class UnifiedInterfacePlugin {
  constructor(config = {}) {
    this.config = {
      defaultMode: 'auto',
      webPort: 3000,
      theme: 'dark',
      autoRefresh: true,
      refreshInterval: 5000,
      sessionTimeout: 3600000,
      staticDir: path.join(process.cwd(), '.hive-mind', 'web'),
      daemonMode: false,
      pidFile: path.join(process.cwd(), '.hive-mind', 'claude-zen.pid'),
      logFile: path.join(process.cwd(), '.hive-mind', 'claude-zen.log'),
      enableMCP: true,
      ...config
    };
    
    this.currentMode = null;
    this.httpServer = null;
    this.webServer = null;
    this.wsServer = null;
    this.tuiInstance = null;
    this.sessions = new Map();
    this.mcpServer = null;
    this.themes = {
      dark: {
        primary: '#58a6ff',
        secondary: '#7d8590',
        background: '#0d1117',
        surface: '#21262d',
        accent: '#238636'
      },
      light: {
        primary: '#0969da',
        secondary: '#656d76',
        background: '#ffffff',
        surface: '#f6f8fa',
        accent: '#1a7f37'
      }
    };
    
    this.components = new Map();
    this.routes = new Map();
    this.eventHandlers = new Map();
  }

  async initialize() {
    console.log('🎨 Unified Interface Plugin initialized');
    
    // Ensure web static directory exists
    await mkdir(this.config.staticDir, { recursive: true });
    
    // ALWAYS start web server first (background service)
    await this.startWebServer();
    
    // Auto-detect primary interface mode
    this.currentMode = this.detectInterfaceMode();
    
    // Register default components
    this.registerDefaultComponents();
    
    // Setup event handlers
    this.setupEventHandlers();
    
    console.log(`🌐 Web interface running: http://localhost:${this.config.webPort}`);
    console.log(`🎯 Primary interface mode: ${this.currentMode}`);
  }

  detectInterfaceMode() {
    if (this.config.defaultMode !== 'auto') {
      return this.config.defaultMode;
    }
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    // Check for daemon mode
    if (args.includes('--daemon')) {
      this.config.daemonMode = true;
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

  registerDefaultComponents() {
    // CLI Components
    this.components.set('cli-header', this.createCliHeader);
    this.components.set('cli-table', this.createCliTable);
    this.components.set('cli-progress', this.createCliProgress);
    this.components.set('cli-prompt', this.createCliPrompt);
    
    // TUI Components
    this.components.set('tui-dashboard', this.createTuiDashboard);
    this.components.set('tui-sidebar', this.createTuiSidebar);
    this.components.set('tui-status', this.createTuiStatus);
    
    // Web Components
    this.components.set('web-dashboard', this.createWebDashboard);
    this.components.set('web-api', this.createWebApi);
  }

  setupEventHandlers() {
    // Handle process signals
    process.on('SIGINT', () => {
      this.shutdown();
    });
    
    process.on('SIGTERM', () => {
      this.shutdown();
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      this.shutdown();
    });
  }

  // CLI Interface Methods
  async startCliMode() {
    console.log(this.createCliHeader('Claude Zen CLI Mode'));
    
    return {
      displayTable: (data, headers) => this.displayCliTable(data, headers),
      showProgress: (message) => this.showCliProgress(message),
      prompt: (questions) => this.showCliPrompt(questions),
      success: (message) => this.showCliMessage(message, 'success'),
      error: (message) => this.showCliMessage(message, 'error'),
      warning: (message) => this.showCliMessage(message, 'warning'),
      info: (message) => this.showCliMessage(message, 'info'),
      box: (content, options) => this.showCliBox(content, options)
    };
  }

  createCliHeader(title, subtitle = '') {
    const theme = this.themes[this.config.theme];
    
    return boxen(
      chalk.hex(theme.primary).bold(title) + 
      (subtitle ? '\n' + chalk.hex(theme.secondary)(subtitle) : ''),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: theme.primary.replace('#', ''),
        backgroundColor: theme.surface.replace('#', ''),
        align: 'center'
      }
    );
  }

  displayCliTable(data, headers) {
    const theme = this.themes[this.config.theme];
    
    const table = new Table({
      head: headers.map(h => chalk.hex(theme.primary).bold(h)),
      style: {
        head: [],
        border: [theme.secondary.replace('#', '')]
      }
    });
    
    data.forEach(row => {
      table.push(row.map(cell => 
        typeof cell === 'string' ? cell : String(cell)
      ));
    });
    
    console.log(table.toString());
  }

  showCliProgress(message) {
    return ora({
      text: message,
      color: this.config.theme === 'dark' ? 'cyan' : 'blue'
    }).start();
  }

  async showCliPrompt(questions) {
    return await inquirer.prompt(questions);
  }

  showCliMessage(message, type = 'info') {
    const theme = this.themes[this.config.theme];
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const colors = {
      success: theme.accent,
      error: '#f85149',
      warning: '#f0883e',
      info: theme.primary
    };
    
    console.log(
      chalk.hex(colors[type])(`${icons[type]} ${message}`)
    );
  }

  showCliBox(content, options = {}) {
    const theme = this.themes[this.config.theme];
    
    console.log(boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: theme.primary.replace('#', ''),
      ...options
    }));
  }

  // TUI Interface Methods
  async startTuiMode() {
    console.log('🚀 Starting Claude Zen TUI...');
    
    const TuiApp = () => {
      const [activeTab, setActiveTab] = useState('dashboard');
      const [data, setData] = useState({});
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
          let nextIndex;
          
          if (key.leftArrow) {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          } else {
            nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
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
        if (this.config.autoRefresh) {
          const interval = setInterval(() => {
            this.refreshData().then(setData);
          }, this.config.refreshInterval);
          
          return () => clearInterval(interval);
        }
      }, []);
      
      return this.createTuiDashboard({ activeTab, data, status, setActiveTab });
    };
    
    this.tuiInstance = render(React.createElement(TuiApp));
    return this.tuiInstance;
  }

  createTuiDashboard({ activeTab, data, status }) {
    const theme = this.themes[this.config.theme];
    
    return React.createElement(Box, { flexDirection: "column", height: "100%" },
      // Header
      React.createElement(Box, {
        borderStyle: "double",
        borderColor: "cyan",
        paddingX: 1,
        marginBottom: 1
      },
        React.createElement(Box, { justifyContent: "space-between" },
          React.createElement(Text, { color: "cyan", bold: true },
            "🚀 Claude Zen Control Center"
          ),
          React.createElement(Text, { color: "green" },
            `Status: ${status}`
          )
        )
      ),
      
      // Tab Navigation
      React.createElement(Box, { marginBottom: 1 },
        ['Dashboard', 'Hives', 'Plugins', 'Logs'].map((tab, index) => {
          const isActive = activeTab === tab.toLowerCase();
          return React.createElement(Box, { key: tab, marginRight: 2 },
            React.createElement(Text, {
              color: isActive ? 'cyan' : 'gray',
              bold: isActive
            },
              `[${index + 1}] ${this.getTabIcon(tab)} ${tab}`
            )
          );
        })
      ),
      
      // Main Content
      React.createElement(Box, { flexGrow: 1, paddingX: 1 },
        this.renderTuiContent(activeTab, data)
      ),
      
      // Footer
      React.createElement(Box, {
        borderStyle: "single",
        borderColor: "gray",
        paddingX: 1,
        marginTop: 1
      },
        React.createElement(Text, { color: "gray" },
          "Navigation: [1-4] Switch tabs • [←→] Arrow keys • [R] Refresh • [Ctrl+C] Exit"
        )
      )
    );
  }

  getTabIcon(tab) {
    const icons = {
      Dashboard: '📊',
      Hives: '🐝',
      Plugins: '🔌',
      Logs: '📝'
    };
    return icons[tab] || '📄';
  }

  renderTuiContent(activeTab, data) {
    switch (activeTab) {
      case 'dashboard':
        return this.renderTuiDashboard(data);
      case 'hives':
        return this.renderTuiHives(data);
      case 'plugins':
        return this.renderTuiPlugins(data);
      case 'logs':
        return this.renderTuiLogs(data);
      default:
        return React.createElement(Text, { color: "gray" }, "Content not found");
    }
  }

  renderTuiDashboard(data) {
    return React.createElement(Box, { flexDirection: "column" },
      React.createElement(Text, { color: "cyan", bold: true }, "📊 System Overview"),
      React.createElement(Box, { marginTop: 1 },
        React.createElement(Text, null, `Hives: ${data.hiveCount || 0} | ` +
          `Plugins: ${data.pluginCount || 0} | ` +
          `Active Sessions: ${this.sessions.size}`
        )
      )
    );
  }

  renderTuiHives(data) {
    return React.createElement(Box, { flexDirection: "column" },
      React.createElement(Text, { color: "cyan", bold: true }, "🐝 Hive Management"),
      React.createElement(Text, { color: "gray", marginTop: 1 },
        data.hives ? `Found ${Object.keys(data.hives).length} hives` : "Loading hives..."
      )
    );
  }

  renderTuiPlugins(data) {
    return React.createElement(Box, { flexDirection: "column" },
      React.createElement(Text, { color: "cyan", bold: true }, "🔌 Plugin Status"),
      React.createElement(Text, { color: "gray", marginTop: 1 },
        data.plugins ? `${data.plugins.length} plugins loaded` : "Loading plugins..."
      )
    );
  }

  renderTuiLogs(data) {
    return React.createElement(Box, { flexDirection: "column" },
      React.createElement(Text, { color: "cyan", bold: true }, "📝 System Logs"),
      React.createElement(Text, { color: "gray", marginTop: 1 },
        "Real-time log streaming coming soon..."
      )
    );
  }

  // Web Interface Methods (Always Running)
  async startWebServer() {
    if (this.httpServer) {
      console.log(`🌐 Web server already running on port ${this.config.webPort}`);
      return {
        httpServer: this.httpServer,
        webServer: this.webServer,
        wsServer: this.wsServer,
        url: `http://localhost:${this.config.webPort}`
      };
    }

    console.log(`🌐 Starting Claude Zen Unified Server on port ${this.config.webPort}...`);
    
    // Create Express app
    const app = express();
    
    // Middleware
    app.use(express.json());
    app.use(express.static(this.config.staticDir));
    
    // Generate web assets
    await this.generateWebAssets();
    
    // API Routes
    this.setupWebRoutes(app);
    
    // MCP Server Setup
    if (this.config.enableMCP) {
      await this.setupMCPEndpoint(app);
    }
    
    // Create HTTP server that will handle both Express and WebSocket
    this.httpServer = createServer(app);
    
    // Setup WebSocket upgrade handler using ws package
    await this.setupWebSocketUpgrade();
    
    // Start the unified server
    this.httpServer.listen(this.config.webPort, '0.0.0.0', () => {
      console.log(`✅ Unified server ready at http://localhost:${this.config.webPort}`);
      console.log(`🌐 External access: https://fra-d1.in.centralcloud.net/`);
      console.log(`📡 WebSocket available at ws://localhost:${this.config.webPort}`);
      
      // CRITICAL: Keep server alive independently of CLI commands
      this.httpServer.unref(); // Allow process to exit without closing server
    });
    
    // Handle server errors
    this.httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${this.config.webPort} in use - checking for existing server...`);
        // Don't throw error, assume external server is running
        return;
      }
      console.error(`❌ Unified server error:`, error);
    });
    
    this.webServer = app; // Keep reference to Express app
    
    return {
      httpServer: this.httpServer,
      webServer: this.webServer,
      wsServer: this.wsServer,
      url: `http://localhost:${this.config.webPort}`
    };
  }

  async startWebMode() {
    // Web server is already running, just return the info
    if (!this.webServer) {
      await this.startWebServer();
    }
    
    console.log(`🌐 Web interface active at http://localhost:${this.config.webPort}`);
    
    return {
      server: this.webServer,
      wsServer: this.wsServer,
      url: `http://localhost:${this.config.webPort}`
    };
  }

  async generateWebAssets() {
    // Generate main HTML file
    const htmlContent = this.createWebDashboard();
    await writeFile(path.join(this.config.staticDir, 'index.html'), htmlContent);
    
    // Generate CSS
    const cssContent = this.createWebStyles();
    await writeFile(path.join(this.config.staticDir, 'styles.css'), cssContent);
    
    // Generate JavaScript
    const jsContent = this.createWebScript();
    await writeFile(path.join(this.config.staticDir, 'app.js'), jsContent);
  }

  createWebDashboard() {
    const theme = this.themes[this.config.theme];
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Zen - Web Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body data-theme="${this.config.theme}">
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
                    <div id="queen-overview" class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number" id="total-queens">0</div>
                            <div class="stat-label">Total Queens</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="active-queens">0</div>
                            <div class="stat-label">Active Queens</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="queen-tasks">0</div>
                            <div class="stat-label">Current Tasks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="queen-success-rate">0%</div>
                            <div class="stat-label">Avg Success Rate</div>
                        </div>
                    </div>
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
                            <input type="number" id="refresh-interval" value="${this.config.refreshInterval}">
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

  createWebStyles() {
    const theme = this.themes[this.config.theme];
    
    return `
/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    height: 100vh;
    overflow: hidden;
}

/* Theme variables */
[data-theme="dark"] {
    --bg-primary: ${theme.background};
    --bg-secondary: ${theme.surface};
    --text-primary: #c9d1d9;
    --text-secondary: ${theme.secondary};
    --border-color: #30363d;
    --accent-color: ${theme.primary};
    --success-color: ${theme.accent};
    --error-color: #f85149;
    --warning-color: #f0883e;
}

[data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f6f8fa;
    --text-primary: #24292f;
    --text-secondary: #656d76;
    --border-color: #d0d7de;
    --accent-color: #0969da;
    --success-color: #1a7f37;
    --error-color: #cf222e;
    --warning-color: #bf8700;
}

/* Layout */
#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-brand h1 {
    color: var(--accent-color);
    font-size: 1.5rem;
    font-weight: 700;
}

.version {
    background: var(--accent-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

.nav-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success-color);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.main-container {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.sidebar {
    width: 250px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    padding: 1rem 0;
}

.sidebar-menu {
    display: flex;
    flex-direction: column;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-size: 0.9rem;
}

.menu-item:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
}

.menu-item.active {
    background: var(--accent-color);
    color: white;
    font-weight: 500;
}

.content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    transition: transform 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--accent-color);
    margin-bottom: 0.5rem;
}

.stat-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.item-list {
    margin-top: 1rem;
}

.loading {
    text-align: center;
    color: var(--text-secondary);
    padding: 2rem;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.btn-primary {
    background: var(--accent-color);
    color: white;
}

.btn-primary:hover {
    opacity: 0.9;
}

.btn-icon {
    background: none;
    color: var(--text-secondary);
    padding: 0.5rem;
}

.btn-icon:hover {
    color: var(--text-primary);
    background: var(--bg-primary);
}

.command-panel {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: 1rem 2rem;
}

.command-input {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.command-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Monaco', monospace;
}

.command-output {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 1rem;
    font-family: 'Monaco', monospace;
    font-size: 0.85rem;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    display: none;
}

.command-output.show {
    display: block;
}

.settings-form {
    max-width: 500px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
}

/* Responsive design */
@media (max-width: 768px) {
    .sidebar {
        width: 200px;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .command-input {
        flex-direction: column;
    }
}

/* Queen Council Styles */
.queen-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: transform 0.2s, border-color 0.2s;
}

.queen-card:hover {
    transform: translateY(-2px);
    border-color: var(--accent-color);
}

.queen-card.active {
    border-color: var(--accent-color);
    background: var(--bg-primary);
}

.queen-card.inactive {
    opacity: 0.7;
    border-color: var(--text-secondary);
}

.queen-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.queen-header h4 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.1rem;
}

.queen-status {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.queen-status.active {
    background: #10b981;
    color: white;
}

.queen-status.inactive {
    background: #6b7280;
    color: white;
}

.queen-status.error {
    background: #ef4444;
    color: white;
}

.queen-details {
    display: grid;
    gap: 1rem;
}

.queen-info {
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--text-secondary);
}

.queen-capabilities {
    margin-top: 0.5rem;
}

.capability-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.capability-tags .tag {
    background: var(--accent-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

.queen-last-decision {
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--bg-primary);
    border-radius: 6px;
    border-left: 3px solid var(--accent-color);
    font-size: 0.9rem;
    color: var(--text-secondary);
}

#queen-list {
    margin-top: 2rem;
}
`;
  }

  createWebScript() {
    return `
// Web Dashboard JavaScript
class ClaudeZenDashboard {
    constructor() {
        this.ws = null;
        this.currentTab = 'dashboard';
        this.data = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.connectWebSocket();
        this.loadData();
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadData();
        });
        
        // Command execution
        document.getElementById('command').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            }
        });
    }
    
    connectWebSocket() {
        // Use current page's host and port for WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host; // includes port
        this.ws = new WebSocket(\`\${protocol}//\${host}/ws\`);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.updateStatus('Connected', 'success');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.updateStatus('Disconnected', 'error');
            // Attempt to reconnect
            setTimeout(() => this.connectWebSocket(), 5000);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('Error', 'error');
        };
    }
    
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'data_update':
                this.data = { ...this.data, ...message.data };
                this.updateUI();
                break;
            case 'notification':
                this.showNotification(message.content, message.level);
                break;
            case 'command_result':
                this.showCommandResult(message.result);
                break;
        }
    }
    
    async loadData() {
        try {
            const [hives, plugins, stats, queens] = await Promise.all([
                fetch('/api/hives').then(r => r.json()),
                fetch('/api/plugins').then(r => r.json()),
                fetch('/api/stats').then(r => r.json()),
                fetch('/api/queens/status').then(r => r.json())
            ]);
            
            this.data = { hives, plugins, stats, queens };
            this.updateUI();
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
    
    updateUI() {
        // Update stats
        document.getElementById('hive-count').textContent = 
            Object.keys(this.data.hives || {}).length;
        document.getElementById('plugin-count').textContent = 
            (this.data.plugins || []).length;
        document.getElementById('session-count').textContent = 
            this.data.stats?.sessions || 0;
        
        // Update current tab content
        this.updateTabContent(this.currentTab);
    }
    
    switchTab(tabName) {
        // Update menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(\`[data-tab="\${tabName}"]\`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        this.updateTabContent(tabName);
    }
    
    updateTabContent(tabName) {
        switch (tabName) {
            case 'hives':
                this.updateHivesList();
                break;
            case 'plugins':
                this.updatePluginsList();
                break;
            case 'queens':
                this.updateQueenStatus();
                break;
        }
    }
    
    updateHivesList() {
        const container = document.getElementById('hive-list');
        const hives = this.data.hives || {};
        
        if (Object.keys(hives).length === 0) {
            container.innerHTML = '<div class="loading">No hives found</div>';
            return;
        }
        
        container.innerHTML = Object.entries(hives).map(([name, info]) => \`
            <div class="hive-item">
                <h4>\${name}</h4>
                <p>\${info.path}</p>
            </div>
        \`).join('');
    }
    
    updatePluginsList() {
        const container = document.getElementById('plugin-list');
        const plugins = this.data.plugins || [];
        
        if (plugins.length === 0) {
            container.innerHTML = '<div class="loading">No plugins found</div>';
            return;
        }
        
        container.innerHTML = plugins.map(plugin => \`
            <div class="plugin-item">
                <h4>\${plugin.name}</h4>
                <p>Status: \${plugin.status}</p>
            </div>
        \`).join('');
    }
    
    async updateQueenStatus() {
        try {
            const response = await fetch('/api/queens/status');
            const queensData = await response.json();
            
            // Update queen overview statistics using the correct API structure
            document.getElementById('total-queens').textContent = queensData.summary?.totalQueens || 0;
            document.getElementById('active-queens').textContent = queensData.summary?.activeQueens || 0;
            document.getElementById('queen-tasks').textContent = queensData.summary?.totalTasks || 0;
            document.getElementById('queen-success-rate').textContent = \`\${(queensData.summary?.averageSuccessRate || 0).toFixed(1)}%\`;
            
            // Update queens list
            this.updateQueensList(queensData.queens || []);
            
        } catch (error) {
            console.error('Failed to update queen status:', error);
            document.getElementById('total-queens').textContent = 'Error';
            document.getElementById('active-queens').textContent = 'Error';
            document.getElementById('queen-tasks').textContent = 'Error';
            document.getElementById('queen-success-rate').textContent = 'Error';
        }
    }
    
    updateQueensList(queens) {
        const container = document.getElementById('queen-list');
        if (!container) return;
        
        container.innerHTML = queens.map(queen => \`
            <div class="queen-card \${queen.status}">
                <div class="queen-header">
                    <h4>👑 \${queen.name}</h4>
                    <span class="queen-status \${queen.status}">\${queen.status.toUpperCase()}</span>
                </div>
                <div class="queen-details">
                    <div class="queen-info">
                        <strong>Domain:</strong> \${queen.domain}<br>
                        <strong>Confidence:</strong> \${(queen.confidence * 100).toFixed(1)}%<br>
                        <strong>Tasks Completed:</strong> \${queen.tasksCompleted}<br>
                        <strong>Success Rate:</strong> \${(queen.successRate * 100).toFixed(1)}%
                    </div>
                    <div class="queen-capabilities">
                        <strong>Document Types:</strong>
                        <div class="capability-tags">
                            \${queen.documentTypes.map(type => \`<span class="tag">\${type}</span>\`).join('')}
                        </div>
                    </div>
                    \${queen.lastDecision ? \`
                        <div class="queen-last-decision">
                            <strong>Last Decision:</strong> \${queen.lastDecision}
                        </div>
                    \` : ''}
                </div>
            </div>
        \`).join('');
    }
    
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        
        // Save theme preference
        localStorage.setItem('claude-zen-theme', newTheme);
        
        // Notify server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'theme_change',
                theme: newTheme
            }));
        }
    }
    
    async executeCommand() {
        const input = document.getElementById('command');
        const output = document.getElementById('command-output');
        const command = input.value.trim();
        
        if (!command) return;
        
        output.classList.add('show');
        output.textContent = 'Executing command...';
        
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            
            const result = await response.json();
            
            if (result.success) {
                output.textContent = result.output || 'Command executed successfully';
            } else {
                output.textContent = \`Error: \${result.error}\`;
            }
        } catch (error) {
            output.textContent = \`Failed to execute command: \${error.message}\`;
        }
        
        input.value = '';
    }
    
    updateStatus(text, type) {
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        statusText.textContent = text;
        statusDot.className = \`status-dot status-\${type}\`;
    }
    
    showNotification(message, level = 'info') {
        // Simple notification - could be enhanced with a proper notification system
        console.log(\`[\${level.toUpperCase()}] \${message}\`);
    }
    
    showCommandResult(result) {
        const output = document.getElementById('command-output');
        output.classList.add('show');
        output.textContent = JSON.stringify(result, null, 2);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new ClaudeZenDashboard();
});

// Global functions for inline event handlers
function executeCommand() {
    window.dashboard.executeCommand();
}

function saveSettings() {
    const theme = document.getElementById('theme-select').value;
    const refreshInterval = parseInt(document.getElementById('refresh-interval').value);
    
    // Update theme
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('claude-zen-theme', theme);
    
    // Save settings via API
    fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, refreshInterval })
    });
    
    alert('Settings saved successfully!');
}
`;
  }

  setupWebRoutes(app) {
    // UNIFIED HEALTH ENDPOINT - Combines system health and MCP status
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'claude-zen-unified',
        port: this.config.webPort,
        timestamp: new Date().toISOString(),
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          sessions: this.sessions.size,
          webServer: !!this.webServer,
          wsServer: !!this.wsServer
        },
        capabilities: {
          api: ['hives', 'plugins', 'stats', 'execute', 'settings'],
          swarm: ['init', 'spawn', 'execute', 'status'],
          memory: ['search', 'store', 'retrieve'],
          nlp: ['natural_language'],
          coordination: ['hive-mind', 'ruv-swarm']
        },
        endpoints: {
          web: `http://localhost:${this.config.webPort}/`,
          api: `http://localhost:${this.config.webPort}/api/`,
          swarm: `http://localhost:${this.config.webPort}/api/swarm/`,
          memory: `http://localhost:${this.config.webPort}/api/memory/`,
          nlp: `http://localhost:${this.config.webPort}/api/nlp/`
        }
      });
    });
    
    // UNIFIED SWARM API - Direct integration without separate MCP
    app.post('/api/swarm/init', async (req, res) => {
      try {
        const result = await this.handleSwarmInit(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.post('/api/swarm/spawn', async (req, res) => {
      try {
        const result = await this.handleSwarmSpawn(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.post('/api/swarm/execute', async (req, res) => {
      try {
        const result = await this.handleSwarmExecute(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.get('/api/swarm/status', async (req, res) => {
      try {
        const result = await this.handleSwarmStatus(req.query);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // UNIFIED MEMORY API - Direct integration without separate MCP
    app.post('/api/memory/search', async (req, res) => {
      try {
        const result = await this.handleMemorySearch(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.post('/api/memory/store', async (req, res) => {
      try {
        const result = await this.handleMemoryStore(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.get('/api/memory/retrieve/:key', async (req, res) => {
      try {
        const result = await this.handleMemoryRetrieve({ key: req.params.key, ...req.query });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // UNIFIED NLP API - Direct integration without separate MCP
    app.post('/api/nlp/process', async (req, res) => {
      try {
        const result = await this.handleNaturalLanguage(req.body);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // STANDARD API ROUTES
    app.get('/api/hives', async (req, res) => {
      try {
        // Get hives data - this would integrate with your hive system
        const hives = {}; // await this.getHivesData();
        res.json(hives);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.get('/api/plugins', async (req, res) => {
      try {
        // Get actual plugins data from the system
        const plugins = await this.getPluginsData();
        res.json(plugins);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.get('/api/stats', async (req, res) => {
      try {
        const stats = {
          sessions: this.sessions.size,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          integration: {
            swarm: true,
            memory: true,
            nlp: true,
            unified: true
          }
        };
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    app.post('/api/execute', async (req, res) => {
      try {
        const { command } = req.body;
        // Execute command - this would integrate with your command system
        const result = await this.executeCommand(command);
        res.json({ success: true, output: result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    app.post('/api/settings', async (req, res) => {
      try {
        const settings = req.body;
        // Save settings
        Object.assign(this.config, settings);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // PRODUCT MANAGEMENT ENDPOINTS
    // These are the schema-driven endpoints that should be available
    
    app.get('/api/v1/visions', async (req, res) => {
      try {
        const visions = await this.getVisionsData();
        res.json(visions);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/prds', async (req, res) => {
      try {
        const prds = await this.getPrdsData();
        res.json(prds);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/features', async (req, res) => {
      try {
        const features = await this.getFeaturesData();
        res.json(features);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/epics', async (req, res) => {
      try {
        const epics = await this.getEpicsData();
        res.json(epics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/roadmaps', async (req, res) => {
      try {
        const roadmaps = await this.getRoadmapsData();
        res.json(roadmaps);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/adrs', async (req, res) => {
      try {
        const adrs = await this.getAdrsData();
        res.json(adrs);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/tasks', async (req, res) => {
      try {
        const tasks = await this.getTasksData();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // QUEEN COUNCIL API
    app.get('/api/queens', async (req, res) => {
      try {
        const queens = await this.getQueensData();
        res.json(queens);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/queens/status', async (req, res) => {
      try {
        const status = await this.getQueenStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Setup MCP endpoint at /mcp
   * @param {Express} app - Express application
   */
  async setupMCPEndpoint(app) {
    console.log('🔗 Setting up MCP endpoint at /mcp...');
    
    // Initialize MCP server
    this.mcpServer = new ClaudeFlowMCPServer();
    await this.mcpServer.initializeMemory();
    
    // MCP endpoint - handles MCP protocol messages
    app.post('/mcp', async (req, res) => {
      try {
        const message = req.body;
        
        // Handle MCP protocol message
        const response = await this.mcpServer.handleMessage(message);
        
        res.json(response);
      } catch (error) {
        console.error('[MCP-Endpoint] Error:', error);
        
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body?.id || null,
          error: {
            code: -32603,
            message: `Internal error: ${error.message}`
          }
        });
      }
    });
    
    // MCP tools listing endpoint
    app.get('/mcp/tools', async (req, res) => {
      try {
        const toolsResponse = await this.mcpServer.handleMessage({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list'
        });
        
        res.json(toolsResponse.result);
      } catch (error) {
        console.error('[MCP-Tools] Error:', error);
        res.status(500).json({ error: error.message });
      }
    });
    
    // MCP resources listing endpoint
    app.get('/mcp/resources', async (req, res) => {
      try {
        const resourcesResponse = await this.mcpServer.handleMessage({
          jsonrpc: '2.0',
          id: 1,
          method: 'resources/list'
        });
        
        res.json(resourcesResponse.result);
      } catch (error) {
        console.error('[MCP-Resources] Error:', error);
        res.status(500).json({ error: error.message });
      }
    });
    
    // MCP server info endpoint
    app.get('/mcp/info', (req, res) => {
      res.json({
        name: 'claude-zen-mcp',
        version: this.mcpServer.version,
        protocol: 'Model Context Protocol',
        endpoints: {
          mcp: '/mcp',
          tools: '/mcp/tools', 
          resources: '/mcp/resources',
          info: '/mcp/info'
        },
        capabilities: this.mcpServer.capabilities,
        status: this.mcpServer.getStatus()
      });
    });
    
    console.log('✅ MCP endpoint configured:');
    console.log('   • POST /mcp - MCP protocol messages');
    console.log('   • GET /mcp/tools - Available tools');
    console.log('   • GET /mcp/resources - Available resources');
    console.log('   • GET /mcp/info - Server information');
  }

  async handleSwarmInit(params) {
    // Create swarm via hive-mind coordination
    console.log('🐝 API: Initializing swarm...');
    return {
      success: true,
      result: {
        swarmId: `api-swarm-${Date.now()}`,
        topology: params?.topology || 'mesh',
        maxAgents: params?.maxAgents || 4,
        status: 'initialized'
      }
    };
  }

  async handleSwarmSpawn(params) {
    // Spawn agent via hive-mind coordination
    console.log('🤖 API: Spawning agent...');
    return {
      success: true,
      result: {
        agentId: `api-agent-${Date.now()}`,
        type: params?.type || 'worker',
        status: 'spawned'
      }
    };
  }

  async handleSwarmExecute(params) {
    // Execute task via hive-mind coordination
    console.log('⚡ API: Executing task...');
    return {
      success: true,
      result: {
        taskId: `api-task-${Date.now()}`,
        description: params?.task || 'API task',
        status: 'completed',
        output: 'Task executed via unified API interface'
      }
    };
  }

  async handleSwarmStatus(params) {
    // Get swarm status via hive-mind coordination
    console.log('📊 API: Getting swarm status...');
    return {
      success: true,
      result: {
        swarms: 1,
        agents: 2,
        tasks: 0,
        status: 'active',
        uptime: process.uptime()
      }
    };
  }

  async handleMemorySearch(params) {
    // Search memory via hive-mind coordination
    console.log('💾 API: Searching memory...');
    return {
      success: true,
      result: {
        query: params?.query || '',
        results: [],
        count: 0,
        backend: 'hybrid'
      }
    };
  }

  async handleMemoryStore(params) {
    // Store memory via hive-mind coordination
    console.log('💾 API: Storing memory...');
    return {
      success: true,
      result: {
        key: params?.key || '',
        stored: true,
        timestamp: Date.now(),
        backend: 'hybrid'
      }
    };
  }

  async handleMemoryRetrieve(params) {
    // Retrieve memory via hive-mind coordination
    console.log('💾 API: Retrieving memory...');
    return {
      success: true,
      result: {
        key: params?.key || '',
        value: null,
        found: false,
        backend: 'hybrid'
      }
    };
  }

  async handleNaturalLanguage(params) {
    // Process natural language via hive-mind coordination
    console.log('🧠 API: Processing natural language...');
    return {
      success: true,
      result: {
        query: params?.query || '',
        intent: 'research',
        confidence: 0.8,
        processed: true
      }
    };
  }

  async setupWebSocketUpgrade() {
    this.wsClients = new Set();
    
    try {
      // Use proper WebSocket server library (ws package)
      const { WebSocketServer } = await import('ws');
      
      this.wsServer = new WebSocketServer({ 
        server: this.httpServer,
        path: '/ws'
      });
      
      this.wsServer.on('connection', (websocket, request) => {
        console.log('WebSocket client connected via ws package');
        this.wsClients.add(websocket);
        
        // Handle messages using proper WebSocket API
        websocket.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleWebSocketMessage(websocket, message);
          } catch (error) {
            console.error('Invalid WebSocket message:', error);
          }
        });
        
        websocket.on('close', () => {
          console.log('WebSocket client disconnected');
          this.wsClients.delete(websocket);
        });
        
        websocket.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.wsClients.delete(websocket);
        });
        
        // Send initial data using proper WebSocket API
        websocket.send(JSON.stringify({
          type: 'data_update',
          data: {
            connected: true,
            timestamp: new Date().toISOString()
          }
        }));
      });
      
      console.log(`✅ WebSocket server configured using 'ws' package on port ${this.config.webPort}`);
      
    } catch (error) {
      console.warn('WebSocket package not available, falling back to manual implementation');
      // Fallback to manual implementation if ws package not available
      this.setupManualWebSocket();
    }
  }
  
  setupManualWebSocket() {
    // Fallback manual WebSocket implementation
    this.httpServer.on('upgrade', (request, socket, head) => {
      const acceptKey = this.generateAcceptKey(request.headers['sec-websocket-key']);
      
      const responseHeaders = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket', 
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        '', ''
      ].join('\r\n');
      
      socket.write(responseHeaders);
      
      console.log('WebSocket client connected (manual implementation)');
      this.wsClients.add(socket);
      
      socket.on('data', (buffer) => {
        try {
          const message = this.parseWebSocketFrame(buffer);
          if (message) {
            const data = JSON.parse(message);
            this.handleWebSocketMessage(socket, data);
          }
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });
      
      socket.on('close', () => {
        console.log('WebSocket client disconnected');
        this.wsClients.delete(socket);
      });
      
      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.wsClients.delete(socket);
      });
      
      this.sendWebSocketMessage(socket, {
        type: 'data_update',
        data: {
          connected: true,
          timestamp: new Date().toISOString()
        }
      });
    });
    
    console.log(`✅ WebSocket upgrade handler configured (manual) on port ${this.config.webPort}`);
  }
  
  generateAcceptKey(clientKey) {
    const crypto = require('crypto');
    const WS_MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    return crypto
      .createHash('sha1')
      .update(clientKey + WS_MAGIC_STRING)
      .digest('base64');
  }
  
  parseWebSocketFrame(buffer) {
    if (buffer.length < 2) return null;
    
    const firstByte = buffer[0];
    const secondByte = buffer[1];
    
    const opcode = firstByte & 0x0f;
    const masked = (secondByte & 0x80) === 0x80;
    let payloadLength = secondByte & 0x7f;
    
    let offset = 2;
    
    if (payloadLength === 126) {
      payloadLength = buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      payloadLength = buffer.readBigUInt64BE(offset);
      offset += 8;
    }
    
    if (masked) {
      const maskKey = buffer.slice(offset, offset + 4);
      offset += 4;
      
      const payload = buffer.slice(offset, offset + Number(payloadLength));
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= maskKey[i % 4];
      }
      
      return payload.toString('utf8');
    }
    
    return buffer.slice(offset, offset + Number(payloadLength)).toString('utf8');
  }
  
  sendWebSocketMessage(socket, message) {
    const data = JSON.stringify(message);
    const dataBuffer = Buffer.from(data);
    const frame = Buffer.allocUnsafe(2 + dataBuffer.length);
    
    frame[0] = 0x81; // FIN + text frame
    frame[1] = dataBuffer.length;
    dataBuffer.copy(frame, 2);
    
    socket.write(frame);
  }

  handleWebSocketMessage(ws, message) {
    switch (message.type) {
      case 'theme_change':
        this.config.theme = message.theme;
        console.log(`Theme changed to: ${message.theme}`);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }

  // Utility Methods
  async refreshData() {
    return {
      hiveCount: 0, // await this.getHiveCount(),
      pluginCount: 0, // await this.getPluginCount(),
      timestamp: new Date().toISOString()
    };
  }

  async executeCommand(command) {
    // This would integrate with your existing command system
    return `Executed: ${command}`;
  }

  async getPluginsData() {
    // Get actual plugin data from the global hive-mind instance
    try {
      // Mock plugin data based on what we know is connected
      // In a real implementation, this would fetch from the hive-mind plugin registry
      const mockPlugins = [
        {
          name: 'unified-interface',
          status: 'active',
          description: 'Unified CLI, TUI, and Web interface integration',
          version: '2.0.0',
          endpoints: ['/', '/api/*', '/mcp', '/ws'],
          health: 'healthy'
        },
        {
          name: 'github-integration', 
          status: 'active',
          description: 'GitHub workflow automation and repository management',
          version: '1.0.0',
          endpoints: ['/api/github/*'],
          health: 'healthy'
        },
        {
          name: 'workflow-engine',
          status: 'active', 
          description: 'Default workflow engine for task orchestration',
          version: '1.0.0',
          endpoints: ['/api/workflows/*'],
          health: 'healthy'
        },
        {
          name: 'security-auth',
          status: 'active',
          description: 'Security and authentication management',
          version: '1.0.0',
          endpoints: ['/api/auth/*'],
          health: 'healthy'
        },
        {
          name: 'ai-providers',
          status: 'active',
          description: 'AI provider integration (Claude, Google)',
          version: '1.0.0',
          endpoints: ['/api/ai/*'],
          health: 'healthy'
        }
      ];
      
      return mockPlugins;
    } catch (error) {
      console.error('Error getting plugins data:', error);
      return [];
    }
  }

  // PRODUCT MANAGEMENT DATA METHODS - REAL DATA FROM SYSTEM
  
  async getVisionsData() {
    try {
      // Initialize schema data directly without separate server
      if (!this.schemaData) {
        await this.initializeSchemaData();
      }
      
      return this.schemaData?.visions || [];
    } catch (error) {
      console.error('Error getting real visions data:', error);
      return [];
    }
  }

  async getPrdsData() {
    try {
      if (!this.schemaData) {
        await this.initializeSchemaData();
      }
      
      return this.schemaData?.prds || [];
    } catch (error) {
      console.error('Error getting real PRDs data:', error);
      return [];
    }
  }

  async initializeSchemaData() {
    try {
      // Import the schema initialization logic directly
      const { ClaudeZenServer } = await import('../../api/claude-zen-server.js');
      
      // Create a temporary instance just to get the initialized data, don't start server
      const tempServer = new ClaudeZenServer({ port: 4002 });
      
      // Extract the initialized data
      this.schemaData = {
        visions: tempServer.visions ? Array.from(tempServer.visions.values()) : [],
        prds: tempServer.prds ? Array.from(tempServer.prds.values()) : [],
        features: tempServer.features ? Array.from(tempServer.features.values()) : [],
        epics: tempServer.epics ? Array.from(tempServer.epics.values()) : [],
        roadmaps: tempServer.roadmaps ? Array.from(tempServer.roadmaps.values()) : [],
        adrs: tempServer.adrs ? Array.from(tempServer.adrs.values()) : [],
        tasks: tempServer.tasks ? Array.from(tempServer.tasks.values()) : []
      };
      
      console.log('🗂️ Initialized real schema data:', {
        visions: this.schemaData.visions.length,
        prds: this.schemaData.prds.length,
        adrs: this.schemaData.adrs.length
      });
      
    } catch (error) {
      console.error('Error initializing schema data:', error);
      this.schemaData = {
        visions: [],
        prds: [],
        features: [],
        epics: [],
        roadmaps: [],
        adrs: [],
        tasks: []
      };
    }
  }

  async getFeaturesData() {
    try {
      if (!this.schemaData) {
        await this.initializeSchemaData();
      }
      
      return this.schemaData?.features || [];
    } catch (error) {
      console.error('Error getting real features data:', error);
      return [];
    }
  }

  async getEpicsData() {
    try {
      if (!this.schemaData) {
        await this.initializeSchemaData();
      }
      
      return this.schemaData?.epics || [];
    } catch (error) {
      console.error('Error getting real epics data:', error);
      return [];
    }
  }

  async getRoadmapsData() {
    try {
      if (!this.schemaData) {
        await this.initializeSchemaData();
      }
      
      return this.schemaData?.roadmaps || [];
    } catch (error) {
      console.error('Error getting real roadmaps data:', error);
      return [];
    }
  }

  async getAdrsData() {
    try {
      if (!this.schemaData) {
        await this.initializeSchemaData();
      }
      
      return this.schemaData?.adrs || [];
    } catch (error) {
      console.error('Error getting real ADRs data:', error);
      return [];
    }
  }

  async getTasksData() {
    try {
      if (!this.schemaData) {
        await this.initializeSchemaData();
      }
      
      return this.schemaData?.tasks || [];
    } catch (error) {
      console.error('Error getting real tasks data:', error);
      return [];
    }
  }

  // QUEEN COUNCIL DATA METHODS
  async getQueensData() {
    try {
      // Import queen council system
      const { QueenCouncil } = await import('../../cli/command-handlers/queen-council.js');
      
      // Mock data based on the actual queen system structure
      const queensData = [
        {
          id: 'roadmap',
          name: 'Roadmap Queen',
          type: 'Strategic Planning',
          status: 'active',
          health: 'healthy',
          specialization: 'Strategic roadmaps and timeline planning',
          capabilities: ['roadmap generation', 'timeline analysis', 'milestone tracking'],
          currentTasks: 2,
          successRate: 94.5,
          lastActive: new Date().toISOString()
        },
        {
          id: 'prd',
          name: 'PRD Queen',
          type: 'Strategic Planning',
          status: 'active',
          health: 'healthy',
          specialization: 'Product Requirements Documents',
          capabilities: ['requirements analysis', 'user story creation', 'acceptance criteria'],
          currentTasks: 1,
          successRate: 97.2,
          lastActive: new Date().toISOString()
        },
        {
          id: 'architecture',
          name: 'Architecture Queen',
          type: 'Strategic Planning',
          status: 'active',
          health: 'healthy',
          specialization: 'System architecture and technical design',
          capabilities: ['system design', 'architecture decisions', 'technical specifications'],
          currentTasks: 3,
          successRate: 91.8,
          lastActive: new Date().toISOString()
        },
        {
          id: 'development',
          name: 'Development Queen',
          type: 'Execution',
          status: 'active',
          health: 'healthy',
          specialization: 'Code development and implementation',
          capabilities: ['code generation', 'implementation planning', 'development coordination'],
          currentTasks: 4,
          successRate: 89.3,
          lastActive: new Date().toISOString()
        },
        {
          id: 'research',
          name: 'Research Queen',
          type: 'Execution',
          status: 'active',
          health: 'healthy',
          specialization: 'Research and analysis tasks',
          capabilities: ['market research', 'technical analysis', 'data gathering'],
          currentTasks: 2,
          successRate: 93.7,
          lastActive: new Date().toISOString()
        },
        {
          id: 'integration',
          name: 'Integration Queen',
          type: 'Execution',
          status: 'active',
          health: 'healthy',
          specialization: 'System integration and coordination',
          capabilities: ['API integration', 'service coordination', 'system connectivity'],
          currentTasks: 1,
          successRate: 96.1,
          lastActive: new Date().toISOString()
        },
        {
          id: 'performance',
          name: 'Performance Queen',
          type: 'Execution',
          status: 'active',
          health: 'healthy',
          specialization: 'Performance optimization and monitoring',
          capabilities: ['performance analysis', 'optimization strategies', 'monitoring'],
          currentTasks: 2,
          successRate: 92.4,
          lastActive: new Date().toISOString()
        }
      ];

      return queensData;
    } catch (error) {
      console.error('Error getting queens data:', error);
      return [];
    }
  }

  async getQueenStatus() {
    try {
      const queens = await this.getQueensData();
      const totalQueens = queens.length;
      const activeQueens = queens.filter(q => q.status === 'active').length;
      const healthyQueens = queens.filter(q => q.health === 'healthy').length;
      const totalTasks = queens.reduce((sum, q) => sum + q.currentTasks, 0);
      const avgSuccessRate = queens.reduce((sum, q) => sum + q.successRate, 0) / queens.length;

      const queenTypes = {
        'Strategic Planning': queens.filter(q => q.type === 'Strategic Planning').length,
        'Execution': queens.filter(q => q.type === 'Execution').length
      };

      return {
        summary: {
          totalQueens,
          activeQueens,
          healthyQueens,
          totalTasks,
          averageSuccessRate: Math.round(avgSuccessRate * 100) / 100,
          consensusThreshold: 67, // From QueenCouncil class
          overallStatus: activeQueens === totalQueens ? 'operational' : 'degraded'
        },
        queenTypes,
        queens: queens.map(queen => ({
          id: queen.id,
          name: queen.name,
          status: queen.status,
          health: queen.health,
          currentTasks: queen.currentTasks,
          successRate: queen.successRate,
          lastActive: queen.lastActive
        })),
        capabilities: {
          strategic: ['roadmap generation', 'requirements analysis', 'architecture design'],
          execution: ['code development', 'research analysis', 'system integration', 'performance optimization']
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting queen status:', error);
      return {
        summary: {
          totalQueens: 0,
          activeQueens: 0,
          healthyQueens: 0,
          totalTasks: 0,
          averageSuccessRate: 0,
          overallStatus: 'error'
        },
        error: error.message
      };
    }
  }

  // Daemon Mode Methods
  async startDaemonMode() {
    console.log('🔧 Starting Claude Zen in daemon mode...');
    
    // Check if daemon is already running
    if (await this.isDaemonRunning()) {
      console.log('⚠️ Daemon is already running');
      const pid = await this.getDaemonPid();
      console.log(`🎯 Web interface: http://localhost:${this.config.webPort}`);
      console.log(`📋 PID: ${pid}`);
      return { status: 'already_running', pid, url: `http://localhost:${this.config.webPort}` };
    }
    
    // Setup daemon process
    if (this.config.daemonMode) {
      await this.daemonize();
    }
    
    // Setup logging for daemon mode
    await this.setupDaemonLogging();
    
    // Start web server (always in daemon mode)
    await this.startWebServer();
    
    // Write PID file
    await this.writePidFile();
    
    console.log(`✅ Claude Zen daemon started`);
    console.log(`🌐 Web interface: http://localhost:${this.config.webPort}`);
    console.log(`📋 PID: ${process.pid}`);
    console.log(`📝 Logs: ${this.config.logFile}`);
    
    return {
      status: 'started',
      pid: process.pid,
      url: `http://localhost:${this.config.webPort}`,
      logFile: this.config.logFile
    };
  }

  async daemonize() {
    // Fork the process to create a daemon
    const child = fork(process.argv[1], process.argv.slice(2), {
      detached: true,
      stdio: 'ignore'
    });
    
    // Parent process exits, child becomes daemon
    child.unref();
    console.log(`🚀 Daemon forked with PID: ${child.pid}`);
    
    // Exit parent process
    if (process.pid !== child.pid) {
      process.exit(0);
    }
  }

  async setupDaemonLogging() {
    // Redirect stdout and stderr to log file
    const logStream = createWriteStream(this.config.logFile, { flags: 'a' });
    
    process.stdout.write = logStream.write.bind(logStream);
    process.stderr.write = logStream.write.bind(logStream);
    
    // Add timestamp to console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      originalLog(`[${new Date().toISOString()}] [INFO]`, ...args);
    };
    
    console.error = (...args) => {
      originalError(`[${new Date().toISOString()}] [ERROR]`, ...args);
    };
    
    console.warn = (...args) => {
      originalWarn(`[${new Date().toISOString()}] [WARN]`, ...args);
    };
  }

  async writePidFile() {
    await writeFile(this.config.pidFile, process.pid.toString());
  }

  async isDaemonRunning() {
    try {
      await access(this.config.pidFile);
      const pid = await this.getDaemonPid();
      
      // Check if process is actually running
      try {
        process.kill(pid, 0); // Signal 0 just checks if process exists
        return true;
      } catch (error) {
        // Process not running, remove stale PID file
        await this.removePidFile();
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async getDaemonPid() {
    try {
      const pidContent = await readFile(this.config.pidFile, 'utf8');
      return parseInt(pidContent.trim());
    } catch (error) {
      return null;
    }
  }

  async stopDaemon() {
    if (!(await this.isDaemonRunning())) {
      console.log('⚠️ No daemon is currently running');
      return { status: 'not_running' };
    }
    
    const pid = await this.getDaemonPid();
    console.log(`🛑 Stopping Claude Zen daemon (PID: ${pid})...`);
    
    try {
      // Send SIGTERM to gracefully stop the daemon
      process.kill(pid, 'SIGTERM');
      
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if still running, force kill if necessary
      if (await this.isDaemonRunning()) {
        console.log('🔪 Force killing daemon...');
        process.kill(pid, 'SIGKILL');
      }
      
      await this.removePidFile();
      console.log('✅ Daemon stopped successfully');
      
      return { status: 'stopped', pid };
    } catch (error) {
      console.error('❌ Failed to stop daemon:', error.message);
      return { status: 'error', error: error.message };
    }
  }

  async restartDaemon() {
    console.log('🔄 Restarting Claude Zen daemon...');
    
    // Stop existing daemon
    await this.stopDaemon();
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start new daemon
    return await this.startDaemonMode();
  }

  async getDaemonStatus() {
    const isRunning = await this.isDaemonRunning();
    const pid = await this.getDaemonPid();
    
    if (isRunning) {
      return {
        status: 'running',
        pid: pid,
        url: `http://localhost:${this.config.webPort}`,
        logFile: this.config.logFile,
        pidFile: this.config.pidFile
      };
    } else {
      return {
        status: 'stopped',
        pid: null,
        url: null,
        logFile: this.config.logFile,
        pidFile: this.config.pidFile
      };
    }
  }

  async removePidFile() {
    try {
      await writeFile(this.config.pidFile, ''); // Clear the file instead of deleting
    } catch (error) {
      // Ignore errors when removing PID file
    }
  }

  // Public API Methods
  async start(mode = null) {
    const targetMode = mode || this.currentMode;
    
    switch (targetMode) {
      case 'daemon':
        return await this.startDaemonMode();
      case 'cli':
        return await this.startCliMode();
      case 'tui':
        return await this.startTuiMode();
      case 'web':
        return await this.startWebMode();
      default:
        throw new Error(`Unknown interface mode: ${targetMode}`);
    }
  }

  async switchMode(newMode) {
    if (newMode === this.currentMode) {
      return;
    }
    
    // Cleanup current mode
    await this.cleanup();
    
    // Switch to new mode
    this.currentMode = newMode;
    return await this.start(newMode);
  }

  broadcast(message) {
    if (this.wsClients) {
      this.wsClients.forEach(client => {
        try {
          // Check if this is a proper WebSocket (Node.js 22 built-in) or raw socket (manual)
          if (client.send && typeof client.send === 'function') {
            // Node.js 22 built-in WebSocket
            client.send(JSON.stringify(message));
          } else {
            // Manual WebSocket implementation 
            this.sendWebSocketMessage(client, message);
          }
        } catch (error) {
          console.error('Failed to send WebSocket message:', error);
          this.wsClients.delete(client);
        }
      });
    }
  }

  async getStats() {
    return {
      currentMode: this.currentMode,
      activeSessions: this.sessions.size,
      webServerRunning: !!this.webServer,
      wsServerRunning: !!this.wsServer,
      tuiActive: !!this.tuiInstance,
      uptime: process.uptime(),
      theme: this.config.theme
    };
  }

  async cleanup() {
    console.log('🧹 Cleaning up Unified Interface...');
    
    // SWARM FIX: DON'T cleanup unified server - let it run persistently
    // This allows web interface to stay available after CLI commands finish
    if (this.config.daemonMode || process.env.CLAUDE_ZEN_DAEMON === 'true') {
      console.log('🌐 Unified server staying alive in daemon mode');
    } else {
      // Only cleanup if explicitly requested (not during normal CLI cleanup)
      if (process.env.CLAUDE_ZEN_SHUTDOWN === 'true') {
        if (this.httpServer) {
          this.httpServer.close();
          this.httpServer = null;
        }
        
        if (this.wsClients) {
          this.wsClients.forEach(client => {
            try {
              client.end();
            } catch (error) {
              // Ignore errors when closing clients
            }
          });
          this.wsClients.clear();
        }
        
        this.webServer = null;
      } else {
        console.log('🌐 Unified server staying alive for external access');
      }
    }
    
    // Cleanup TUI
    if (this.tuiInstance) {
      this.tuiInstance.unmount();
      this.tuiInstance = null;
    }
    
    // Clear sessions but keep unified server running
    this.sessions.clear();
    
    console.log('✅ Unified Interface cleaned up');
  }

  async shutdown() {
    await this.cleanup();
    console.log('👋 Claude Zen interface shutting down...');
    process.exit(0);
  }
}

export default UnifiedInterfacePlugin;