/**
 * Unified Interface Plugin
 * Seamless CLI, TUI, and Web interface integration
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput } from 'ink';
import express from 'express';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import boxen from 'boxen';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import ora from 'ora';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { spawn, fork } from 'child_process';

export class UnifiedInterfacePlugin {
  constructor(config = {}) {
    this.config = {
      defaultMode: 'auto',
      webPort: 3000,
      webSocketPort: 3001,
      theme: 'dark',
      autoRefresh: true,
      refreshInterval: 5000,
      sessionTimeout: 3600000,
      staticDir: path.join(process.cwd(), '.hive-mind', 'web'),
      daemonMode: false,
      pidFile: path.join(process.cwd(), '.hive-mind', 'claude-zen.pid'),
      logFile: path.join(process.cwd(), '.hive-mind', 'claude-zen.log'),
      ...config
    };
    
    this.currentMode = null;
    this.webServer = null;
    this.wsServer = null;
    this.tuiInstance = null;
    this.sessions = new Map();
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
    if (this.webServer) {
      console.log(`🌐 Web server already running on port ${this.config.webPort}`);
      return {
        server: this.webServer,
        wsServer: this.wsServer,
        url: `http://localhost:${this.config.webPort}`
      };
    }

    console.log(`🌐 Starting Claude Zen Web Server on port ${this.config.webPort}...`);
    
    // Create Express app
    const app = express();
    
    // Middleware
    app.use(express.json());
    app.use(express.static(this.config.staticDir));
    
    // Generate web assets
    await this.generateWebAssets();
    
    // API Routes
    this.setupWebRoutes(app);
    
    // Start web server
    this.webServer = app.listen(this.config.webPort, () => {
      console.log(`✅ Web server ready at http://localhost:${this.config.webPort}`);
    });
    
    // Start WebSocket server
    await this.startWebSocketServer();
    
    return {
      server: this.webServer,
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
        const wsPort = ${this.config.webSocketPort};
        this.ws = new WebSocket(\`ws://localhost:\${wsPort}\`);
        
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
            const [hives, plugins, stats] = await Promise.all([
                fetch('/api/hives').then(r => r.json()),
                fetch('/api/plugins').then(r => r.json()),
                fetch('/api/stats').then(r => r.json())
            ]);
            
            this.data = { hives, plugins, stats };
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
    // API Routes
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
        // Get plugins data
        const plugins = []; // await this.getPluginsData();
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
          memory: process.memoryUsage()
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
  }

  async startWebSocketServer() {
    this.wsServer = new WebSocketServer({ port: this.config.webSocketPort });
    
    this.wsServer.on('connection', (ws) => {
      console.log('WebSocket client connected');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
      });
      
      // Send initial data
      ws.send(JSON.stringify({
        type: 'data_update',
        data: {
          connected: true,
          timestamp: new Date().toISOString()
        }
      }));
    });
    
    console.log(`✅ WebSocket server listening on port ${this.config.webSocketPort}`);
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
    if (this.wsServer) {
      this.wsServer.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(message));
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
    
    // Cleanup web server
    if (this.webServer) {
      this.webServer.close();
      this.webServer = null;
    }
    
    // Cleanup WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
      this.wsServer = null;
    }
    
    // Cleanup TUI
    if (this.tuiInstance) {
      this.tuiInstance.unmount();
      this.tuiInstance = null;
    }
    
    // Clear sessions
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