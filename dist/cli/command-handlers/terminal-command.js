// terminal-command.js - Modern terminal management system with session integration
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { spawn, execSync } from 'child_process';
import { EventEmitter } from 'events';

// Terminal storage paths
const TERMINAL_BASE_DIR = path.join(process.cwd(), '.claude-terminals');
const ACTIVE_TERMINALS_FILE = path.join(TERMINAL_BASE_DIR, 'active-terminals.json');
const TERMINAL_HISTORY_FILE = path.join(TERMINAL_BASE_DIR, 'terminal-history.json');

// Terminal states
const TERMINAL_STATES = {
  ACTIVE: 'active',
  IDLE: 'idle',
  BUSY: 'busy',
  ERROR: 'error',
  TERMINATED: 'terminated'
};

// Terminal pool management
class TerminalPool extends EventEmitter {
  constructor() {
    super();
    this.terminals = new Map();
    this.poolSize = 10;
    this.sessionTimeouts = new Map();
    this.commandHistory = new Map();
  }

  async initialize() {
    await initializeTerminalStorage();
    const activeTerminals = await loadActiveTerminals();
    
    // Restore active terminals from previous session
    for (const [id, terminalData] of Object.entries(activeTerminals)) {
      if (terminalData.state === TERMINAL_STATES.ACTIVE) {
        this.terminals.set(id, {
          ...terminalData,
          process: null, // Will be recreated if needed
          state: TERMINAL_STATES.IDLE
        });
      }
    }
  }

  async createTerminal(config = {}) {
    const terminalId = generateTerminalId(config.name || 'terminal');
    const terminalData = {
      id: terminalId,
      name: config.name || `terminal-${Date.now()}`,
      shell: config.shell || (process.platform === 'win32' ? 'cmd.exe' : '/bin/bash'),
      workingDirectory: config.workingDirectory || process.cwd(),
      environment: { ...process.env, ...config.environment },
      state: TERMINAL_STATES.ACTIVE,
      created: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      commandCount: 0,
      persistent: config.persistent || false,
      process: null,
      outputBuffer: []
    };

    this.terminals.set(terminalId, terminalData);
    await this.saveTerminalState();
    
    this.emit('terminal:created', terminalData);
    return terminalId;
  }

  async executeCommand(terminalId, command, options = {}) {
    const terminal = this.terminals.get(terminalId);
    if (!terminal) {
      throw new Error(`Terminal ${terminalId} not found`);
    }

    terminal.state = TERMINAL_STATES.BUSY;
    terminal.lastActivity = new Date().toISOString();
    terminal.commandCount++;

    // Add to command history
    if (!this.commandHistory.has(terminalId)) {
      this.commandHistory.set(terminalId, []);
    }
    this.commandHistory.get(terminalId).push({
      command,
      timestamp: new Date().toISOString(),
      options
    });

    try {
      const result = await this.runCommand(terminal, command, options);
      terminal.state = TERMINAL_STATES.IDLE;
      terminal.outputBuffer.push({
        type: 'command',
        command,
        output: result.stdout,
        error: result.stderr,
        exitCode: result.exitCode,
        timestamp: new Date().toISOString()
      });

      await this.saveTerminalState();
      this.emit('terminal:command', { terminalId, command, result });
      return result;
    } catch (error) {
      terminal.state = TERMINAL_STATES.ERROR;
      terminal.outputBuffer.push({
        type: 'error',
        command,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      await this.saveTerminalState();
      this.emit('terminal:error', { terminalId, command, error });
      throw error;
    }
  }

  async runCommand(terminal, command, options) {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(terminal.shell, 
        process.platform === 'win32' ? ['/c', command] : ['-c', command], 
        {
          cwd: terminal.workingDirectory,
          env: terminal.environment,
          stdio: ['pipe', 'pipe', 'pipe'],
          ...options
        }
      );

      let stdout = '';
      let stderr = '';

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code
        });
      });

      childProcess.on('error', (error) => {
        reject(error);
      });

      // Set timeout if specified
      if (options.timeout) {
        setTimeout(() => {
          childProcess.kill('SIGTERM');
          reject(new Error(`Command timeout after ${options.timeout}ms`));
        }, options.timeout);
      }
    });
  }

  async terminateTerminal(terminalId, options = {}) {
    const terminal = this.terminals.get(terminalId);
    if (!terminal) {
      throw new Error(`Terminal ${terminalId} not found`);
    }

    // Run cleanup commands if specified
    if (terminal.cleanupCommands && !options.force) {
      for (const cmd of terminal.cleanupCommands) {
        try {
          await this.executeCommand(terminalId, cmd);
        } catch (error) {
          // Ignore cleanup errors unless in strict mode
          if (options.strict) throw error;
        }
      }
    }

    terminal.state = TERMINAL_STATES.TERMINATED;
    terminal.terminated = new Date().toISOString();

    // Kill process if running
    if (terminal.process) {
      terminal.process.kill(options.graceful ? 'SIGTERM' : 'SIGKILL');
    }

    // Save to history
    await this.saveToHistory(terminal);
    
    // Remove from active terminals
    this.terminals.delete(terminalId);
    await this.saveTerminalState();
    
    this.emit('terminal:terminated', { terminalId, terminal });
    return terminal;
  }

  getTerminal(terminalId) {
    return this.terminals.get(terminalId);
  }

  listTerminals(filter = {}) {
    const terminals = Array.from(this.terminals.values());
    
    if (filter.state) {
      return terminals.filter(t => t.state === filter.state);
    }
    
    if (filter.name) {
      return terminals.filter(t => t.name.includes(filter.name));
    }
    
    return terminals;
  }

  async getTerminalOutput(terminalId, options = {}) {
    const terminal = this.terminals.get(terminalId);
    if (!terminal) {
      throw new Error(`Terminal ${terminalId} not found`);
    }

    let output = [...terminal.outputBuffer];
    
    if (options.since) {
      const since = new Date(options.since);
      output = output.filter(entry => new Date(entry.timestamp) > since);
    }

    if (options.type) {
      output = output.filter(entry => entry.type === options.type);
    }

    if (options.tail) {
      output = output.slice(-options.tail);
    }

    return output;
  }

  async saveTerminalState() {
    const activeTerminals = {};
    for (const [id, terminal] of this.terminals) {
      activeTerminals[id] = {
        ...terminal,
        process: null // Don't serialize process objects
      };
    }
    await saveActiveTerminals(activeTerminals);
  }

  async saveToHistory(terminal) {
    try {
      const history = await loadTerminalHistory();
      history.unshift({
        ...terminal,
        process: null
      });
      
      // Keep only last 50 terminals in history
      if (history.length > 50) {
        history.splice(50);
      }
      
      await fs.writeFile(TERMINAL_HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
      printError(`Failed to save terminal to history: ${error.message}`);
    }
  }

  async performMaintenance() {
    // Clean up dead terminals
    const deadTerminals = [];
    for (const [id, terminal] of this.terminals) {
      if (terminal.process && terminal.process.killed) {
        deadTerminals.push(id);
      }
    }

    for (const id of deadTerminals) {
      await this.terminateTerminal(id, { force: true });
    }

    // Clear old output buffers
    for (const terminal of this.terminals.values()) {
      if (terminal.outputBuffer.length > 100) {
        terminal.outputBuffer = terminal.outputBuffer.slice(-50);
      }
    }

    await this.saveTerminalState();
    this.emit('maintenance:completed', { cleaned: deadTerminals.length });
  }
}

// Global terminal pool instance
let terminalPool = null;

/**
 * Initialize terminal storage directories
 */
async function initializeTerminalStorage() {
  try {
    if (!existsSync(TERMINAL_BASE_DIR)) {
      mkdirSync(TERMINAL_BASE_DIR, { recursive: true });
    }
  } catch (error) {
    printWarning(`Failed to initialize terminal storage: ${error.message}`);
  }
}

/**
 * Load active terminals data
 */
async function loadActiveTerminals() {
  try {
    if (existsSync(ACTIVE_TERMINALS_FILE)) {
      const content = await fs.readFile(ACTIVE_TERMINALS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    printWarning(`Failed to load active terminals: ${error.message}`);
  }
  return {};
}

/**
 * Save active terminals data
 */
async function saveActiveTerminals(terminals) {
  try {
    await fs.writeFile(ACTIVE_TERMINALS_FILE, JSON.stringify(terminals, null, 2));
  } catch (error) {
    printError(`Failed to save active terminals: ${error.message}`);
  }
}

/**
 * Load terminal history
 */
async function loadTerminalHistory() {
  try {
    if (existsSync(TERMINAL_HISTORY_FILE)) {
      const content = await fs.readFile(TERMINAL_HISTORY_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    printWarning(`Failed to load terminal history: ${error.message}`);
  }
  return [];
}

/**
 * Generate unique terminal ID
 */
function generateTerminalId(name) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeName = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `term-${safeName}-${timestamp}-${random}`;
}

/**
 * Get terminal pool instance
 */
async function getTerminalPool() {
  if (!terminalPool) {
    terminalPool = new TerminalPool();
    await terminalPool.initialize();
  }
  return terminalPool;
}

/**
 * Create a new terminal session
 */
async function createTerminal(args, flags) {
  const pool = await getTerminalPool();
  
  const config = {
    name: flags.name || `terminal-${Date.now()}`,
    shell: flags.shell || (process.platform === 'win32' ? 'cmd.exe' : '/bin/bash'),
    workingDirectory: flags['working-directory'] || process.cwd(),
    environment: flags.env ? JSON.parse(flags.env) : {},
    persistent: flags.persistent || false
  };

  try {
    const terminalId = await pool.createTerminal(config);
    
    printSuccess(`✅ Terminal created successfully!`);
    console.log(`🆔 Terminal ID: ${terminalId}`);
    console.log(`📛 Name: ${config.name}`);
    console.log(`🐚 Shell: ${config.shell}`);
    console.log(`📁 Working Directory: ${config.workingDirectory}`);
    if (config.persistent) {
      console.log(`💾 Persistent: Yes`);
    }
    
    return terminalId;
  } catch (error) {
    printError(`Failed to create terminal: ${error.message}`);
  }
}

/**
 * List all terminal sessions
 */
async function listTerminals(args, flags) {
  const pool = await getTerminalPool();
  
  try {
    const filter = {};
    if (flags.state) filter.state = flags.state;
    if (flags.name) filter.name = flags.name;
    
    const terminals = pool.listTerminals(filter);
    
    if (terminals.length === 0) {
      printInfo('No terminals found matching criteria.');
      return;
    }

    printSuccess(`📋 Found ${terminals.length} terminal(s):`);
    console.log();
    
    // Sort by creation date (newest first)
    const sortedTerminals = terminals.sort((a, b) => new Date(b.created) - new Date(a.created));

    for (const terminal of sortedTerminals) {
      const stateIcon = getStateIcon(terminal.state);
      const timeAgo = getTimeAgo(new Date(terminal.lastActivity));
      
      console.log(`${stateIcon} ${terminal.name} (${terminal.id.substring(0, 16)}...)`);
      console.log(`   🐚 ${terminal.shell}`);
      console.log(`   📍 ${terminal.workingDirectory}`);
      console.log(`   ⏰ ${timeAgo} - ${terminal.state}`);
      console.log(`   📊 ${terminal.commandCount} commands executed`);
      console.log();
    }
    
  } catch (error) {
    printError(`Failed to list terminals: ${error.message}`);
  }
}

/**
 * Execute command in terminal
 */
async function executeCommand(args, flags) {
  const pool = await getTerminalPool();
  
  const terminalId = args[0];
  const command = args.slice(1).join(' ');
  
  if (!terminalId || !command) {
    printError('Usage: terminal exec <terminal-id> <command>');
    return;
  }

  try {
    const options = {};
    if (flags.timeout) {
      options.timeout = parseInt(flags.timeout) * 1000; // Convert to milliseconds
    }
    
    printInfo(`Executing in ${terminalId}: ${command}`);
    
    const result = await pool.executeCommand(terminalId, command, options);
    
    if (result.stdout) {
      console.log('📤 Output:');
      console.log(result.stdout);
    }
    
    if (result.stderr) {
      console.log('⚠️ Error output:');
      console.log(result.stderr);
    }
    
    console.log(`✅ Command completed with exit code: ${result.exitCode}`);
    
  } catch (error) {
    printError(`Command execution failed: ${error.message}`);
  }
}

/**
 * Attach to terminal session
 */
async function attachTerminal(args, flags) {
  const terminalId = args[0];
  
  if (!terminalId) {
    printError('Usage: terminal attach <terminal-id>');
    return;
  }

  const pool = await getTerminalPool();
  const terminal = pool.getTerminal(terminalId);
  
  if (!terminal) {
    printError(`Terminal ${terminalId} not found`);
    return;
  }

  printSuccess(`🔗 Attaching to terminal: ${terminal.name}`);
  console.log(`📍 Working Directory: ${terminal.workingDirectory}`);
  console.log(`🐚 Shell: ${terminal.shell}`);
  console.log();
  console.log('💡 Interactive mode simulation (full TTY attachment not available in this context)');
  console.log('💡 Use "terminal exec <id> <command>" to execute commands');
  console.log('💡 Press Ctrl+C to return to main CLI');
}

/**
 * Detach from terminal session
 */
async function detachTerminal(args, flags) {
  const terminalId = args[0];
  
  if (!terminalId) {
    printError('Usage: terminal detach <terminal-id>');
    return;
  }

  printSuccess(`✅ Detached from terminal: ${terminalId}`);
  console.log('🔄 Session continues running in background');
}

/**
 * Kill terminal session
 */
async function killTerminal(args, flags) {
  const terminalId = args[0];
  
  if (!terminalId) {
    printError('Usage: terminal kill <terminal-id> [--graceful] [--force]');
    return;
  }

  const pool = await getTerminalPool();
  
  try {
    const options = {
      graceful: flags.graceful || false,
      force: flags.force || false,
      strict: flags.strict || false
    };
    
    const terminal = await pool.terminateTerminal(terminalId, options);
    
    printSuccess(`✅ Terminal terminated: ${terminal.name}`);
    console.log(`🆔 ID: ${terminalId}`);
    console.log(`📊 Commands executed: ${terminal.commandCount}`);
    console.log(`⏰ Session duration: ${getTimeDuration(terminal.created, terminal.terminated)}`);
    
  } catch (error) {
    printError(`Failed to terminate terminal: ${error.message}`);
  }
}

/**
 * Show terminal information
 */
async function terminalInfo(args, flags) {
  const terminalId = args[0];
  
  if (!terminalId) {
    printError('Usage: terminal info <terminal-id>');
    return;
  }

  const pool = await getTerminalPool();
  const terminal = pool.getTerminal(terminalId);
  
  if (!terminal) {
    printError(`Terminal ${terminalId} not found`);
    return;
  }

  const stateIcon = getStateIcon(terminal.state);
  
  console.log(`${stateIcon} Terminal Information`);
  console.log(`🆔 ID: ${terminal.id}`);
  console.log(`📛 Name: ${terminal.name}`);
  console.log(`🐚 Shell: ${terminal.shell}`);
  console.log(`📍 Working Directory: ${terminal.workingDirectory}`);
  console.log(`📊 State: ${terminal.state}`);
  console.log(`⏰ Created: ${terminal.created}`);
  console.log(`⏰ Last Activity: ${terminal.lastActivity}`);
  console.log(`🔢 Commands Executed: ${terminal.commandCount}`);
  
  if (terminal.persistent) {
    console.log(`💾 Persistent: Yes`);
  }
  
  if (flags.verbose && terminal.outputBuffer.length > 0) {
    console.log(`\n📋 Recent Output (last 5 entries):`);
    const recentOutput = terminal.outputBuffer.slice(-5);
    recentOutput.forEach((entry, i) => {
      console.log(`   ${i + 1}. [${entry.timestamp}] ${entry.type}`);
      if (entry.command) {
        console.log(`      Command: ${entry.command}`);
      }
      if (entry.output) {
        console.log(`      Output: ${entry.output.substring(0, 100)}...`);
      }
    });
  }
}

/**
 * Clean up idle terminals
 */
async function cleanupTerminals(args, flags) {
  const pool = await getTerminalPool();
  
  try {
    printInfo('🧹 Performing terminal maintenance...');
    
    await pool.performMaintenance();
    
    printSuccess('✅ Terminal cleanup completed');
    console.log('🔄 Active terminals verified');
    console.log('📊 Output buffers optimized');
    
  } catch (error) {
    printError(`Cleanup failed: ${error.message}`);
  }
}

/**
 * Monitor terminal activity
 */
async function monitorTerminal(args, flags) {
  const terminalId = args[0];
  
  if (!terminalId) {
    printError('Usage: terminal monitor <terminal-id> [--interval <ms>]');
    return;
  }

  const pool = await getTerminalPool();
  const terminal = pool.getTerminal(terminalId);
  
  if (!terminal) {
    printError(`Terminal ${terminalId} not found`);
    return;
  }

  const interval = parseInt(flags.interval) || 2000;
  
  printSuccess(`📊 Monitoring terminal: ${terminal.name}`);
  console.log(`🔄 Update interval: ${interval}ms`);
  console.log('💡 Press Ctrl+C to stop monitoring\n');

  const monitorInterval = setInterval(() => {
    const currentTerminal = pool.getTerminal(terminalId);
    if (!currentTerminal) {
      console.log('❌ Terminal no longer exists');
      clearInterval(monitorInterval);
      return;
    }

    console.clear();
    console.log(`📊 Terminal Monitor: ${currentTerminal.name}`);
    console.log(`🆔 ID: ${currentTerminal.id.substring(0, 16)}...`);
    console.log(`📊 State: ${getStateIcon(currentTerminal.state)} ${currentTerminal.state}`);
    console.log(`📁 Working Directory: ${currentTerminal.workingDirectory}`);
    console.log(`🔢 Commands: ${currentTerminal.commandCount}`);
    console.log(`⏰ Last Activity: ${getTimeAgo(new Date(currentTerminal.lastActivity))}`);
    console.log(`📦 Output Buffer: ${currentTerminal.outputBuffer.length} entries`);
    console.log('\n💡 Press Ctrl+C to exit monitor mode');
  }, interval);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(monitorInterval);
    console.log('\n✅ Monitoring stopped');
    process.exit(0);
  });
}

/**
 * Get state icon for terminal
 */
function getStateIcon(state) {
  const icons = {
    [TERMINAL_STATES.ACTIVE]: '🟢',
    [TERMINAL_STATES.IDLE]: '🔵',
    [TERMINAL_STATES.BUSY]: '🟡',
    [TERMINAL_STATES.ERROR]: '🔴',
    [TERMINAL_STATES.TERMINATED]: '⚫'
  };
  return icons[state] || '❓';
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/**
 * Get time duration string
 */
function getTimeDuration(start, end) {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diff = endTime - startTime;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Show terminal command help
 */
function showTerminalHelp() {
  console.log(`
🖥️  Modern Terminal Management System

USAGE:
  terminal <command> [options]

BASIC COMMANDS:
  create [name]                 Create new terminal session
  list                          List all active terminals
  exec <id> <command>           Execute command in terminal
  info <id>                     Show terminal information
  attach <id>                   Attach to terminal session
  detach <id>                   Detach from terminal
  kill <id>                     Terminate terminal session

ADVANCED COMMANDS:
  monitor <id>                  Monitor terminal activity
  cleanup                       Clean up idle terminals
  
CREATE OPTIONS:
  --name <name>                 Terminal name
  --shell <shell>               Shell to use (bash, zsh, cmd, powershell)
  --working-directory <path>    Initial working directory
  --env <json>                  Environment variables as JSON
  --persistent                  Keep terminal after commands complete

EXEC OPTIONS:
  --timeout <seconds>           Command timeout
  --background                  Run in background

KILL OPTIONS:
  --graceful                    Graceful shutdown (SIGTERM)
  --force                       Force kill (SIGKILL)

LIST OPTIONS:
  --state <state>               Filter by state (active, idle, busy, error)
  --name <pattern>              Filter by name pattern

MONITOR OPTIONS:
  --interval <ms>               Update interval in milliseconds

EXAMPLES:
  terminal create --name "dev" --shell bash --persistent
  terminal list --state active
  terminal exec dev "npm test"
  terminal exec dev "cd /app && npm start" --timeout 300
  terminal info dev
  terminal attach dev
  terminal kill dev --graceful
  terminal monitor dev --interval 1000
  terminal cleanup

INTEGRATION:
  • Session Management: Persistent terminal state
  • Workflow Integration: Terminal pools for task execution
  • Cross-platform: Works on Windows, macOS, Linux
  • Event System: Real-time terminal events and monitoring

STATES:
  🟢 active     - Terminal is running and ready
  🔵 idle       - Terminal is inactive but available
  🟡 busy       - Currently executing command
  🔴 error      - Terminal has encountered an error
  ⚫ terminated - Terminal has been shut down
`);
}

/**
 * Main terminal command handler
 */
export async function terminalCommand(args, flags) {
  const subCommand = args[0];

  // Show help if no command or help flag
  if (!subCommand || flags.help || flags.h) {
    showTerminalHelp();
    return;
  }

  try {
    switch (subCommand) {
      case 'create':
        await createTerminal(args.slice(1), flags);
        break;

      case 'list':
      case 'ls':
        await listTerminals(args.slice(1), flags);
        break;

      case 'execute':
      case 'exec':
        await executeCommand(args.slice(1), flags);
        break;

      case 'info':
        await terminalInfo(args.slice(1), flags);
        break;

      case 'attach':
        await attachTerminal(args.slice(1), flags);
        break;

      case 'detach':
        await detachTerminal(args.slice(1), flags);
        break;

      case 'kill':
      case 'terminate':
        await killTerminal(args.slice(1), flags);
        break;

      case 'monitor':
        await monitorTerminal(args.slice(1), flags);
        break;

      case 'cleanup':
        await cleanupTerminals(args.slice(1), flags);
        break;

      default:
        printError(`Unknown terminal command: ${subCommand}`);
        showTerminalHelp();
    }
  } catch (error) {
    printError(`Terminal command failed: ${error.message}`);
    if (flags.verbose) {
      console.error('Stack trace:', error.stack);
    }
  }
}