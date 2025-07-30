/**
 * Unified Interface Plugin (TypeScript)
 * Seamless CLI, TUI, and Web interface integration with type safety
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput } from 'ink';
import express, { Express, Request, Response } from 'express';
import { createServer, Server } from 'http';
import chalk from 'chalk';
import boxen from 'boxen';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import ora, { Ora } from 'ora';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { spawn, fork, ChildProcess } from 'child_process';
import { WebSocketServer, WebSocket } from 'ws';

import { BasePlugin } from '../base-plugin.js';
import {
  PluginManifest,
  PluginConfig,
  PluginContext,
  JSONObject
} from '../../types/plugin.js';

// Interface mode types
type InterfaceMode = 'auto' | 'cli' | 'tui' | 'web' | 'daemon';

interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  accent: string;
}

interface UnifiedInterfaceConfig {
  defaultMode: InterfaceMode;
  webPort: number;
  theme: 'dark' | 'light';
  autoRefresh: boolean;
  refreshInterval: number;
  sessionTimeout: number;
  staticDir: string;
  daemonMode: boolean;
  pidFile: string;
  logFile: string;
  enableMCP: boolean;
}

interface Session {
  id: string;
  startTime: Date;
  lastActivity: Date;
  data: JSONObject;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

interface TuiAppProps {
  activeTab: string;
  data: JSONObject;
  status: string;
  setActiveTab: (tab: string) => void;
}

interface CLIInterface {
  displayTable: (data: any[][], headers: string[]) => void;
  showProgress: (message: string) => Ora;
  prompt: (questions: any[]) => Promise<any>;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  box: (content: string, options?: any) => void;
}

interface WebServerInfo {
  httpServer: Server;
  webServer: Express;
  wsServer?: WebSocketServer;
  url: string;
}

interface DaemonStatus {
  status: 'running' | 'stopped' | 'error' | 'not_running' | 'already_running' | 'started';
  pid?: number;
  url?: string;
  logFile?: string;
  pidFile?: string;
  error?: string;
}

export class UnifiedInterfacePlugin extends BasePlugin {
  private currentMode: InterfaceMode | null = null;
  private httpServer: Server | null = null;
  private webServer: Express | null = null;
  private wsServer: WebSocketServer | null = null;
  private tuiInstance: any = null;
  private sessions: Map<string, Session> = new Map();
  private wsClients: Set<WebSocket> = new Set();
  private schemaData: JSONObject | null = null;

  private readonly themes: Record<'dark' | 'light', Theme> = {
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

  private components: Map<string, Function> = new Map();
  private routes: Map<string, Function> = new Map();
  private eventHandlers: Map<string, Function> = new Map();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  protected async onInitialize(): Promise<void> {
    this.context.apis.logger.info('Unified Interface Plugin initializing');

    // Setup configuration with environment variable precedence
    const webPortFromEnv = process.env.PORT ? parseInt(process.env.PORT) : null;
    const interfaceConfig: UnifiedInterfaceConfig = {
      defaultMode: 'auto',
      webPort: webPortFromEnv || this.config.settings.webPort || 3000,
      theme: this.config.settings.theme || 'dark',
      autoRefresh: this.config.settings.autoRefresh !== false,
      refreshInterval: this.config.settings.refreshInterval || 5000,
      sessionTimeout: this.config.settings.sessionTimeout || 3600000,
      staticDir: this.config.settings.staticDir || join(process.cwd(), '.hive-mind', 'web'),
      daemonMode: this.config.settings.daemonMode || false,
      pidFile: this.config.settings.pidFile || join(process.cwd(), '.hive-mind', 'claude-zen.pid'),
      logFile: this.config.settings.logFile || join(process.cwd(), '.hive-mind', 'claude-zen.log'),
      enableMCP: this.config.settings.enableMCP !== false
    };

    // Store config back to plugin settings
    Object.assign(this.config.settings, interfaceConfig);

    // Ensure web static directory exists
    await mkdir(interfaceConfig.staticDir, { recursive: true });

    // ALWAYS start web server first (background service)
    await this.startWebServer();

    // Auto-detect primary interface mode
    this.currentMode = this.detectInterfaceMode();

    // Register default components
    this.registerDefaultComponents();

    // Setup event handlers
    this.setupEventHandlers();

    this.context.apis.logger.info('Unified Interface Plugin initialized', {
      webPort: interfaceConfig.webPort,
      primaryMode: this.currentMode
    });
  }

  protected async onStart(): Promise<void> {
    // Register APIs
    await this.registerAPI('unified-interface', {
      name: 'unified-interface',
      version: this.manifest.version,
      description: 'Unified CLI, TUI, and Web interface with daemon support',
      methods: [
        {
          name: 'switchMode',
          description: 'Switch between interface modes',
          parameters: [
            { name: 'mode', type: 'string', required: true, description: 'Interface mode: cli, tui, web, daemon' }
          ],
          returns: { type: 'object', description: 'Mode switch result' },
          async: true,
          permissions: ['interface:control'],
          public: true,
          authenticated: false,
          timeout: 10000,
          caching: false,
          cacheTTL: 0,
          examples: []
        },
        {
          name: 'getStats',
          description: 'Get interface statistics and status',
          parameters: [],
          returns: { type: 'object', description: 'Interface statistics' },
          async: true,
          permissions: [],
          public: true,
          authenticated: false,
          timeout: 5000,
          caching: true,
          cacheTTL: 30,
          examples: []
        },
        {
          name: 'getDaemonStatus',
          description: 'Get daemon process status',
          parameters: [],
          returns: { type: 'object', description: 'Daemon status information' },
          async: true,
          permissions: ['daemon:status'],
          public: true,
          authenticated: false,
          timeout: 5000,
          caching: false,
          cacheTTL: 0,
          examples: []
        }
      ]
    });

    // Register hooks
    await this.registerHook('session-start', async (context) => {
      this.context.apis.logger.info('Session started', { sessionId: context.metadata.sessionId });
      return {
        success: true,
        continue: true,
        stop: false,
        skip: false,
        executionTime: 0,
        resourcesUsed: await this.getResourceUsage()
      };
    });
  }

  protected async onStop(): Promise<void> {
    // Don't cleanup unified server by default - let it run persistently
    if (process.env.CLAUDE_ZEN_SHUTDOWN === 'true') {
      await this.cleanup();
    } else {
      this.context.apis.logger.info('Unified server staying alive for external access');
    }
  }

  protected async onDestroy(): Promise<void> {
    await this.cleanup();
  }

  // Interface mode detection
  private detectInterfaceMode(): InterfaceMode {
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
  private registerDefaultComponents(): void {
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
  private setupEventHandlers(): void {
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
  async startCliMode(): Promise<CLIInterface> {
    console.log(this.createCliHeader('Claude Zen CLI Mode'));

    return {
      displayTable: (data: any[][], headers: string[]) => this.displayCliTable(data, headers),
      showProgress: (message: string) => this.showCliProgress(message),
      prompt: (questions: any[]) => this.showCliPrompt(questions),
      success: (message: string) => this.showCliMessage(message, 'success'),
      error: (message: string) => this.showCliMessage(message, 'error'),
      warning: (message: string) => this.showCliMessage(message, 'warning'),
      info: (message: string) => this.showCliMessage(message, 'info'),
      box: (content: string, options?: any) => this.showCliBox(content, options)
    };
  }

  private createCliHeader(title: string, subtitle: string = ''): string {
    const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];

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

  private displayCliTable(data: any[][], headers: string[]): void {
    const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];

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

  private showCliProgress(message: string): Ora {
    return ora({
      text: message,
      color: this.config.settings.theme === 'dark' ? 'cyan' : 'blue'
    }).start();
  }

  private async showCliPrompt(questions: any[]): Promise<any> {
    return await inquirer.prompt(questions);
  }

  private showCliMessage(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];
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

  private showCliBox(content: string, options: any = {}): void {
    const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];

    console.log(boxen(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: theme.primary.replace('#', ''),
      ...options
    }));
  }

  // TUI Interface Methods
  async startTuiMode(): Promise<any> {
    console.log('🚀 Starting Claude Zen TUI...');

    const TuiApp = () => {
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
          let nextIndex: number;

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
        if (this.config.settings.autoRefresh) {
          const interval = setInterval(() => {
            this.refreshData().then(setData);
          }, this.config.settings.refreshInterval);

          return () => clearInterval(interval);
        }
      }, []);

      return this.createTuiDashboard({ activeTab, data, status, setActiveTab });
    };

    this.tuiInstance = render(React.createElement(TuiApp));
    return this.tuiInstance;
  }

  private createTuiDashboard({ activeTab, data, status }: TuiAppProps): React.ReactElement {
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

  private getTabIcon(tab: string): string {
    const icons: Record<string, string> = {
      Dashboard: '📊',
      Hives: '🐝',
      Plugins: '🔌',
      Logs: '📝'
    };
    return icons[tab] || '📄';
  }

  private renderTuiContent(activeTab: string, data: JSONObject): React.ReactElement {
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

  private renderTuiDashboard(data: JSONObject): React.ReactElement {
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

  private renderTuiHives(data: JSONObject): React.ReactElement {
    return React.createElement(Box, { flexDirection: "column" },
      React.createElement(Text, { color: "cyan", bold: true }, "🐝 Hive Management"),
      React.createElement(Text, { color: "gray", marginTop: 1 },
        data.hives ? `Found ${Object.keys(data.hives).length} hives` : "Loading hives..."
      )
    );
  }

  private renderTuiPlugins(data: JSONObject): React.ReactElement {
    return React.createElement(Box, { flexDirection: "column" },
      React.createElement(Text, { color: "cyan", bold: true }, "🔌 Plugin Status"),
      React.createElement(Text, { color: "gray", marginTop: 1 },
        data.plugins ? `${data.plugins.length} plugins loaded` : "Loading plugins..."
      )
    );
  }

  private renderTuiLogs(data: JSONObject): React.ReactElement {
    return React.createElement(Box, { flexDirection: "column" },
      React.createElement(Text, { color: "cyan", bold: true }, "📝 System Logs"),
      React.createElement(Text, { color: "gray", marginTop: 1 },
        "Real-time log streaming coming soon..."
      )
    );
  }

  // Web Interface Methods
  async startWebServer(): Promise<WebServerInfo> {
    if (this.httpServer) {
      this.context.apis.logger.info(`Web server already running on port ${this.config.settings.webPort}`);
      return {
        httpServer: this.httpServer,
        webServer: this.webServer!,
        wsServer: this.wsServer!,
        url: `http://localhost:${this.config.settings.webPort}`
      };
    }

    this.context.apis.logger.info(`Starting Claude Zen Unified Server on port ${this.config.settings.webPort}`);

    // Create Express app
    const app = express();

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
          port: this.config.settings.webPort,
          url: `http://localhost:${this.config.settings.webPort}`
        });
        resolve();
      });

      this.httpServer!.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          this.context.apis.logger.warn(`Port ${this.config.settings.webPort} in use - checking for existing server`);
          resolve(); // Don't reject, assume external server is running
          return;
        }
        reject(error);
      });
    });

    this.webServer = app;

    return {
      httpServer: this.httpServer,
      webServer: this.webServer,
      wsServer: this.wsServer!,
      url: `http://localhost:${this.config.settings.webPort}`
    };
  }

  async startWebMode(): Promise<WebServerInfo> {
    // Web server is already running, just return the info
    if (!this.webServer) {
      await this.startWebServer();
    }

    this.context.apis.logger.info(`Web interface active at http://localhost:${this.config.settings.webPort}`);

    return {
      server: this.webServer!,
      wsServer: this.wsServer!,
      url: `http://localhost:${this.config.settings.webPort}`
    } as any;
  }

  private async generateWebAssets(): Promise<void> {
    // Generate main HTML file
    const htmlContent = this.createWebDashboard();
    await writeFile(join(this.config.settings.staticDir, 'index.html'), htmlContent);

    // Generate CSS
    const cssContent = this.createWebStyles();
    await writeFile(join(this.config.settings.staticDir, 'styles.css'), cssContent);

    // Generate JavaScript
    const jsContent = this.createWebScript();
    await writeFile(join(this.config.settings.staticDir, 'app.js'), jsContent);
  }

  private createWebDashboard(): string {
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

  private createWebStyles(): string {
    const theme = this.themes[this.config.settings.theme as 'dark' | 'light'];

    return `
/* CSS styles implementation - truncated for brevity */
/* This would contain the full CSS from the original file */
[data-theme="dark"] {
    --bg-primary: ${theme.background};
    --bg-secondary: ${theme.surface};
    --text-primary: #c9d1d9;
    --text-secondary: ${theme.secondary};
    --border-color: #30363d;
    --accent-color: ${theme.primary};
    --success-color: ${theme.accent};
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    height: 100vh;
    overflow: hidden;
}

/* Additional CSS styles would be included here */
`;
  }

  private createWebScript(): string {
    return `
// Web Dashboard JavaScript implementation - truncated for brevity
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
    
    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
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
            console.error('Failed to load data:', error);
        }
    }
    
    updateUI() {
        document.getElementById('plugin-count').textContent = 
            (this.data.plugins || []).length;
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

  private setupWebRoutes(app: Express): void {
    // Health endpoint
    app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        service: 'claude-zen-unified',
        port: this.config.settings.webPort,
        timestamp: new Date().toISOString(),
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          sessions: this.sessions.size,
          webServer: !!this.webServer,
          wsServer: !!this.wsServer
        }
      });
    });

    // API routes
    app.get('/api/plugins', async (req: Request, res: Response) => {
      try {
        const plugins = await this.getPluginsData();
        res.json(plugins);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/stats', async (req: Request, res: Response) => {
      try {
        const stats = {
          sessions: this.sessions.size,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        };
        res.json(stats);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/execute', async (req: Request, res: Response) => {
      try {
        const { command } = req.body;
        const result = await this.executeCommand(command);
        res.json({ success: true, output: result });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/settings', async (req: Request, res: Response) => {
      try {
        const settings = req.body;
        Object.assign(this.config.settings, settings);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  private async setupWebSocketServer(): Promise<void> {
    this.wsServer = new WebSocketServer({ 
      server: this.httpServer!,
      path: '/ws'
    });

    this.wsServer.on('connection', (websocket: WebSocket, request) => {
      this.context.apis.logger.info('WebSocket client connected');
      this.wsClients.add(websocket);

      websocket.on('message', (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
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
      this.sendWebSocketMessage(websocket, {
        type: 'data_update',
        data: {
          connected: true,
          timestamp: new Date().toISOString()
        }
      });
    });

    this.context.apis.logger.info(`WebSocket server configured on port ${this.config.settings.webPort}`);
  }

  private handleWebSocketMessage(ws: WebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case 'theme_change':
        this.config.settings.theme = message.theme;
        this.context.apis.logger.info(`Theme changed to: ${message.theme}`);
        break;
      case 'ping':
        this.sendWebSocketMessage(ws, { type: 'pong' });
        break;
    }
  }

  private sendWebSocketMessage(ws: WebSocket, message: WebSocketMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      this.context.apis.logger.error('Failed to send WebSocket message', error);
    }
  }

  // Daemon mode methods
  async startDaemonMode(): Promise<DaemonStatus> {
    this.context.apis.logger.info('Starting Claude Zen in daemon mode');

    // Check if daemon is already running
    if (await this.isDaemonRunning()) {
      const pid = await this.getDaemonPid();
      return { 
        status: 'already_running', 
        pid, 
        url: `http://localhost:${this.config.settings.webPort}` 
      };
    }

    // Setup daemon process
    if (this.config.settings.daemonMode) {
      await this.daemonize();
    }

    // Setup logging for daemon mode
    await this.setupDaemonLogging();

    // Start web server (always in daemon mode)
    await this.startWebServer();

    // Write PID file
    await this.writePidFile();

    return {
      status: 'started',
      pid: process.pid,
      url: `http://localhost:${this.config.settings.webPort}`,
      logFile: this.config.settings.logFile
    };
  }

  private async daemonize(): Promise<void> {
    // Fork the process to create a daemon
    const child = fork(process.argv[1], process.argv.slice(2), {
      detached: true,
      stdio: 'ignore'
    });

    // Parent process exits, child becomes daemon
    child.unref();
    this.context.apis.logger.info(`Daemon forked with PID: ${child.pid}`);

    // Exit parent process
    if (process.pid !== child.pid) {
      process.exit(0);
    }
  }

  private async setupDaemonLogging(): Promise<void> {
    // Redirect stdout and stderr to log file
    const logStream = createWriteStream(this.config.settings.logFile, { flags: 'a' });

    process.stdout.write = logStream.write.bind(logStream) as any;
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
        return await this.startWebMode();
      default:
        throw new Error(`Unknown interface mode: ${targetMode}`);
    }
  }

  async switchMode(newMode: InterfaceMode): Promise<any> {
    if (newMode === this.currentMode) {
      return;
    }

    // Cleanup current mode
    await this.cleanup();

    // Switch to new mode
    this.currentMode = newMode;
    return await this.start(newMode);
  }

  broadcast(message: WebSocketMessage): void {
    if (this.wsClients) {
      this.wsClients.forEach(client => {
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
    return {
      currentMode: this.currentMode,
      activeSessions: this.sessions.size,
      webServerRunning: !!this.webServer,
      wsServerRunning: !!this.wsServer,
      tuiActive: !!this.tuiInstance,
      uptime: process.uptime(),
      theme: this.config.settings.theme
    };
  }

  async getDaemonStatus(): Promise<DaemonStatus> {
    const isRunning = await this.isDaemonRunning();
    const pid = await this.getDaemonPid();

    if (isRunning) {
      return {
        status: 'running',
        pid: pid!,
        url: `http://localhost:${this.config.settings.webPort}`,
        logFile: this.config.settings.logFile,
        pidFile: this.config.settings.pidFile
      };
    } else {
      return {
        status: 'stopped',
        pid: undefined,
        url: undefined,
        logFile: this.config.settings.logFile,
        pidFile: this.config.settings.pidFile
      };
    }
  }

  // Utility methods
  private async refreshData(): Promise<JSONObject> {
    return {
      hiveCount: 0,
      pluginCount: 0,
      timestamp: new Date().toISOString()
    };
  }

  private async executeCommand(command: string): Promise<string> {
    // This would integrate with your existing command system
    return `Executed: ${command}`;
  }

  private async getPluginsData(): Promise<any[]> {
    // Mock plugin data - in real implementation would fetch from plugin manager
    return [
      {
        name: 'unified-interface',
        status: 'active',
        description: 'Unified CLI, TUI, and Web interface integration',
        version: '2.0.0',
        health: 'healthy'
      },
      {
        name: 'ai-provider',
        status: 'active',
        description: 'Multi-model AI provider integration',
        version: '1.0.0',
        health: 'healthy'
      }
    ];
  }

  private async cleanup(): Promise<void> {
    this.context.apis.logger.info('Cleaning up Unified Interface');

    // Don't cleanup unified server by default - let it run persistently
    if (this.config.settings.daemonMode || process.env.CLAUDE_ZEN_DAEMON === 'true') {
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