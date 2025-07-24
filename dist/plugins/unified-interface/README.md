# Unified Interface Plugin

A comprehensive interface system for Claude Zen that seamlessly integrates CLI, TUI (Terminal User Interface), and Web modes with real-time synchronization and theme support.

## Features

### 🎯 **Multi-Mode Interface**
- **CLI Mode**: Rich command-line interface with colored output, progress bars, and interactive prompts
- **TUI Mode**: Full-screen terminal interface built with React/Ink
- **Web Mode**: Modern web dashboard with real-time WebSocket updates
- **Daemon Mode**: Background service with persistent web interface
- **Auto-Detection**: Intelligently detects the best interface mode for the environment

### 🔄 **Seamless Mode Switching**
- **Runtime Switching**: Change interface modes without restarting
- **Session Persistence**: Maintain state across mode switches
- **Real-time Sync**: WebSocket-based synchronization between interfaces
- **Context Preservation**: Keep user context when switching modes

### 🎨 **Advanced Theming**
- **Dark/Light Themes**: Professional dark and light theme support
- **Dynamic Switching**: Change themes in real-time across all modes
- **Consistent Styling**: Unified design language across CLI, TUI, and Web
- **Responsive Design**: Mobile-friendly web interface

### ⚡ **Real-time Features**
- **Live Updates**: Real-time data synchronization via WebSockets
- **Auto-refresh**: Configurable automatic data refresh
- **Status Monitoring**: Live system status indicators
- **Command Execution**: Execute Claude Zen commands from any interface

## Installation

```bash
npm install @claude-zen/unified-interface-plugin
```

## Quick Start

### Automatic Mode Detection
```javascript
import UnifiedInterfacePlugin from '@claude-zen/unified-interface-plugin';

const interface = new UnifiedInterfacePlugin();
await interface.initialize();
await interface.start(); // Auto-detects best mode
```

### Explicit Mode Selection
```bash
# CLI mode
claude-zen --cli

# TUI mode  
claude-zen --tui

# Web mode
claude-zen --web

# Daemon mode (background service with web interface)
claude-zen --daemon
```

### Programmatic Usage
```javascript
// Start specific mode
const interface = new UnifiedInterfacePlugin();
await interface.initialize();

// CLI mode
const cli = await interface.start('cli');
cli.success('Welcome to Claude Zen!');

// TUI mode
const tui = await interface.start('tui');

// Web mode
const web = await interface.start('web');
console.log(`Web interface: ${web.url}`);
```

## Configuration

```javascript
const config = {
  // Mode settings
  defaultMode: 'auto',           // 'auto', 'cli', 'tui', 'web'
  
  // Web server settings
  webPort: 3000,                 // Web interface port
  webSocketPort: 3001,           // WebSocket server port
  
  // Appearance
  theme: 'dark',                 // 'dark' or 'light'
  
  // Behavior
  autoRefresh: true,             // Enable auto-refresh
  refreshInterval: 5000,         // Refresh interval in ms
  sessionTimeout: 3600000,       // Session timeout in ms
  
  // Paths
  staticDir: '.hive-mind/web'    // Web assets directory
};

const interface = new UnifiedInterfacePlugin(config);
```

## Interface Modes

### 🖥️ CLI Mode
Perfect for scripting, CI/CD, and command-line workflows.

**Features:**
- Colored output with chalk
- Progress indicators with ora
- Interactive prompts with inquirer
- Formatted tables with cli-table3
- Boxed messages with boxen

**Usage:**
```javascript
const cli = await interface.start('cli');

// Display formatted output
cli.success('✅ Operation completed');
cli.error('❌ Something went wrong');
cli.warning('⚠️ Check your configuration');
cli.info('ℹ️ Additional information');

// Show progress
const spinner = cli.showProgress('Processing...');
// ... do work
spinner.succeed('Done!');

// Display table
cli.displayTable([
  ['Name', 'Status', 'Count'],
  ['Plugin A', 'Active', '5'],
  ['Plugin B', 'Inactive', '0']
]);

// Interactive prompts
const answers = await cli.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Enter your name:'
  },
  {
    type: 'confirm',
    name: 'confirm',
    message: 'Continue?'
  }
]);
```

### 📺 TUI Mode
Full-screen terminal interface for interactive monitoring and management.

**Features:**
- Multi-tab navigation
- Real-time data updates
- Keyboard shortcuts
- Status bars and panels
- Responsive terminal layout

**Navigation:**
- **[1-4]**: Switch between tabs
- **[←→]**: Arrow key navigation
- **[R]**: Refresh data
- **[Ctrl+C]**: Exit

**Tabs:**
- **Dashboard**: System overview and statistics
- **Hives**: Hive management and status
- **Plugins**: Plugin status and management
- **Logs**: Real-time log streaming

### 🔧 Daemon Mode
Background service mode for persistent web interface access.

**Features:**
- Persistent background process
- Automatic process management
- PID file tracking
- Log file management
- Graceful start/stop/restart
- Health monitoring

**Usage:**
```bash
# Start daemon
claude-zen --daemon

# Check daemon status
claude-zen daemon status

# Stop daemon
claude-zen daemon stop

# Restart daemon  
claude-zen daemon restart

# View daemon logs
claude-zen daemon logs

# View live logs
tail -f .hive-mind/claude-zen.log
```

**Process Management:**
```javascript
const interface = new UnifiedInterfacePlugin();

// Start daemon
const result = await interface.startDaemonMode();
console.log(`Daemon started with PID: ${result.pid}`);
console.log(`Web interface: ${result.url}`);

// Check daemon status
const status = await interface.getDaemonStatus();
console.log(`Daemon status: ${status.status}`);

// Stop daemon
await interface.stopDaemon();

// Restart daemon
await interface.restartDaemon();
```

### 🌐 Web Mode
Modern web dashboard accessible from any browser.

**Features:**
- Responsive design (mobile-friendly)
- Real-time WebSocket updates
- Dark/light theme switching
- Interactive command execution
- RESTful API integration

**Endpoints:**
- `GET /`: Main dashboard
- `GET /api/hives`: Hive data
- `GET /api/plugins`: Plugin information
- `GET /api/stats`: System statistics
- `POST /api/execute`: Command execution
- `POST /api/settings`: Settings management

**WebSocket Events:**
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001');

// Handle messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'data_update':
      updateUI(message.data);
      break;
    case 'notification':
      showNotification(message.content);
      break;
    case 'command_result':
      displayResult(message.result);
      break;
  }
};
```

## API Reference

### Core Methods

#### `initialize()`
Initialize the plugin and detect interface mode.

```javascript
await interface.initialize();
```

#### `start(mode?)`
Start the interface in specified mode.

```javascript
// Auto-detect mode
await interface.start();

// Specific mode
await interface.start('web');
```

#### `switchMode(newMode)`
Switch to a different interface mode.

```javascript
// Switch from CLI to Web
await interface.switchMode('web');
```

#### `broadcast(message)`
Send message to all connected WebSocket clients.

```javascript
interface.broadcast({
  type: 'notification',
  content: 'System updated',
  level: 'info'
});
```

### CLI Interface API

```javascript
const cli = await interface.start('cli');

// Output methods
cli.success(message);     // Green success message
cli.error(message);       // Red error message  
cli.warning(message);     // Yellow warning message
cli.info(message);        // Blue info message
cli.box(content, options); // Boxed content

// Interactive methods
cli.displayTable(data, headers);
const spinner = cli.showProgress(message);
const answers = await cli.prompt(questions);
```

### TUI Interface API

The TUI automatically renders with:
- Header with title and status
- Tab navigation
- Main content area
- Footer with shortcuts

### Web Interface API

```javascript
const web = await interface.start('web');

// Access server instances
console.log(web.url);        // Web interface URL
web.server;                  // Express server instance
web.wsServer;                // WebSocket server instance
```

## Theming

### Built-in Themes

**Dark Theme:**
```javascript
{
  primary: '#58a6ff',      // Bright blue
  secondary: '#7d8590',    // Gray
  background: '#0d1117',   // Dark background
  surface: '#21262d',      // Dark surface
  accent: '#238636'        // Green accent
}
```

**Light Theme:**
```javascript
{
  primary: '#0969da',      // Blue
  secondary: '#656d76',    // Gray
  background: '#ffffff',   // White background
  surface: '#f6f8fa',      // Light surface
  accent: '#1a7f37'        // Green accent
}
```

### Theme Switching

```javascript
// Programmatic theme change
interface.config.theme = 'light';

// Via web interface
fetch('/api/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ theme: 'light' })
});
```

## Environment Detection

The plugin automatically detects the best interface mode:

| Environment | Detected Mode | Reason |
|-------------|---------------|---------|
| Non-TTY | CLI | No terminal interaction |
| VS Code Terminal | CLI | Optimized for editor integration |
| CI/CD | CLI | Script-friendly output |
| SSH Terminal | TUI | Full terminal capabilities |
| Local Terminal | TUI | Interactive experience |
| Explicit `--web` | Web | User preference |

## Real-time Features

### WebSocket Communication

```javascript
// Server-side broadcasting
interface.broadcast({
  type: 'data_update',
  data: { hives: updatedHives }
});

// Client-side handling
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'data_update') {
    updateDashboard(data);
  }
};
```

### Auto-refresh

```javascript
// Enable auto-refresh
const interface = new UnifiedInterfacePlugin({
  autoRefresh: true,
  refreshInterval: 5000  // 5 seconds
});

// Manual refresh
await interface.refreshData();
```

## Integration Examples

### With Claude Zen Core

```javascript
// Plugin registration
claudeZen.registerPlugin('unified-interface', UnifiedInterfacePlugin, {
  defaultMode: 'tui',
  theme: 'dark'
});

// Start interface with core data
const interface = claudeZen.getPlugin('unified-interface');
await interface.start();
```

### With Hive Mind

```javascript
// Display hive data in interface
const hives = await hiveManager.getAllHives();
interface.broadcast({
  type: 'data_update',
  data: { hives }
});
```

### With Command System

```javascript
// Execute commands via web interface
app.post('/api/execute', async (req, res) => {
  try {
    const result = await commandExecutor.run(req.body.command);
    res.json({ success: true, output: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Advanced Features

### Session Management

```javascript
// Create session
const sessionId = interface.createSession(userId);

// Get session data
const session = interface.getSession(sessionId);

// Cleanup expired sessions
interface.cleanupSessions();
```

### Custom Components

```javascript
// Register custom TUI component
interface.components.set('custom-panel', ({ data }) => {
  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Text, { color: 'cyan' }, 'Custom Panel'),
    React.createElement(Text, null, `Data: ${JSON.stringify(data)}`)
  );
});
```

### Custom Routes

```javascript
// Add custom web route
interface.routes.set('/api/custom', (req, res) => {
  res.json({ message: 'Custom endpoint' });
});
```

## Performance Considerations

- **Memory Usage**: TUI mode uses more memory due to React rendering
- **Network**: Web mode requires additional ports for HTTP and WebSocket
- **CPU**: Auto-refresh can impact performance with frequent updates
- **Scalability**: WebSocket connections scale to hundreds of concurrent users

## Troubleshooting

### Common Issues

**TUI not rendering:**
```bash
# Check terminal compatibility
echo $TERM
export TERM=xterm-256color
```

**Web interface not accessible:**
```bash
# Check port availability
netstat -an | grep :3000
```

**WebSocket connection failed:**
```bash
# Verify WebSocket port
netstat -an | grep :3001
```

## Development

### Adding Custom Modes

```javascript
class CustomInterfacePlugin extends UnifiedInterfacePlugin {
  async startCustomMode() {
    // Implement custom interface mode
    console.log('Starting custom mode...');
    return { mode: 'custom' };
  }
}
```

### Extending Themes

```javascript
const customThemes = {
  ...interface.themes,
  neon: {
    primary: '#00ff00',
    secondary: '#ffff00',
    background: '#000000',
    surface: '#111111',
    accent: '#ff00ff'
  }
};

interface.themes = customThemes;
```

---

Part of the Claude Zen plugin ecosystem. For more information, visit the [Claude Zen Documentation](https://github.com/your-org/claude-zen).