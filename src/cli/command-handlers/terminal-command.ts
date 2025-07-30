// terminal-command.js - Modern terminal management system with session integration

import { spawn } from 'node:child_process';
import { existsSync, promises as fs, mkdirSync } from 'node:fs';
import path from 'node:path';
import { printError, printInfo, printSuccess, printWarning } from '../utils.js';

// Terminal storage paths
const TERMINAL_BASE_DIR = path.join(process.cwd(), '.claude-terminals');
const ACTIVE_TERMINALS_FILE = path.join(TERMINAL_BASE_DIR, 'active-terminals.json');
const _TERMINAL_HISTORY_FILE = path.join(TERMINAL_BASE_DIR, 'terminal-history.json');

// Terminal states
const TERMINAL_STATES = {ACTIVE = new Map();
this.poolSize = 10;
this.sessionTimeouts = new Map();
this.commandHistory = new Map();
}

  async initialize()
{
    await initializeTerminalStorage();
    const activeTerminals = await loadActiveTerminals();
    
    // Restore active terminals from previous session
    for (const [id, terminalData] of Object.entries(activeTerminals)) {
      if(terminalData.state === TERMINAL_STATES.ACTIVE) {
        this.terminals.set(id, {
          ...terminalData,
          process = {}): any {
    const terminalId = generateTerminalId(config.name || 'terminal');
    const terminalData = {id = === 'win32' ? 'cmd.exe' : '/bin/bash'),
      workingDirectory = {}): any {
    const terminal = this.terminals.get(terminalId);
    if(!terminal) {
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
      command,timestamp = await this.runCommand(terminal, command, options);
      terminal.state = TERMINAL_STATES.IDLE;
      terminal.outputBuffer.push({type = TERMINAL_STATES.ERROR;
      terminal.outputBuffer.push({
        type => {
      const childProcess = spawn(terminal.shell, 
        process.platform === 'win32' ? ['/c', command] : ['-c', command], 
        {cwd = '';
      let _stderr = '';

      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      childProcess.stderr.on('data', (data) => {
        _stderr += data.toString();
      });

      childProcess.on('close', (_code) => {
        resolve({
          stdout => {
        reject(_error);
      });

      // Set timeout if specified
      if(options.timeout) {
        setTimeout(() => {
          childProcess.kill('SIGTERM');
          reject(new Error(`Command timeout after ${options.timeout}ms`));
        }, options.timeout);
      }
    });
  }

  async terminateTerminal(terminalId, options = {}): any {
    const terminal = this.terminals.get(terminalId);
    if(!terminal) {
      throw new Error(`Terminal ${terminalId} not found`);
    }

    // Run cleanup commands if specified
    if(terminal.cleanupCommands && !options.force) {
      for(const cmd of terminal.cleanupCommands) {
        try {
          await this.executeCommand(terminalId, cmd);
        } catch(error) {
          // Ignore cleanup errors unless in strict mode
          if (options.strict) throw error;
        }
      }
    }

    terminal.state = TERMINAL_STATES.TERMINATED;
    terminal.terminated = new Date().toISOString();

    // Kill process if running
    if(terminal.process) {
      terminal.process.kill(options.graceful ? 'SIGTERM' : 'SIGKILL');
    }

    // Save to history
    await this.saveToHistory(terminal);
    
    // Remove from active terminals
    this.terminals.delete(terminalId);
    await this.saveTerminalState();
    
    this.emit('terminal = {}): any {
    const terminals = Array.from(this.terminals.values());
    
    if(filter.state) {
      return terminals.filter(t => t.state === filter.state);
    }
    
    if(filter.name) {
      return terminals.filter(t => t.name.includes(filter.name));
    }
    
    return terminals;
  }

  async getTerminalOutput(terminalId, options = {}): any {
    const terminal = this.terminals.get(terminalId);
    if(!terminal) {
      throw new Error(`Terminal ${terminalId} not found`);
    }

    let output = [...terminal.outputBuffer];
    
    if(options.since) {
      const since = new Date(options.since);
      output = output.filter(entry => new Date(entry.timestamp) > since);
    }

    if(options.type) {
      output = output.filter(entry => entry.type === options.type);
    }

    if(options.tail) {
      output = output.slice(-options.tail);
    }

    return output;
  }

  async saveTerminalState() {
    const activeTerminals = {};
    for(const [id, terminal] of this.terminals) {
      activeTerminals[id] = {
        ...terminal,process = await loadTerminalHistory();
      history.unshift({
        ...terminal,process = [];
    for(const [id, terminal] of this.terminals) {
      if(terminal.process?.killed) {
        deadTerminals.push(id);
      }
    }

    for(const id of deadTerminals) {
      await this.terminateTerminal(id, {force = terminal.outputBuffer.slice(-50);
      }
    }

    await this.saveTerminalState();
    this.emit('maintenance = null;

/**
 * Initialize terminal storage directories
 */
async function initializeTerminalStorage() {
  try {
    if (!existsSync(TERMINAL_BASE_DIR)) {
      mkdirSync(TERMINAL_BASE_DIR, {recursive = await fs.readFile(ACTIVE_TERMINALS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch(_error) {
    printWarning(`Failed to load activeterminals = await fs.readFile(TERMINAL_HISTORY_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch(error) {
    printWarning(`Failed to load terminalhistory = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeName = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `term-${safeName}-${timestamp}-${random}`;
}

/**
 * Get terminal pool instance
 */
async function getTerminalPool() {
  if(!terminalPool) {
    terminalPool = new TerminalPool();
    await terminalPool.initialize();
  }
  return terminalPool;
}

/**
 * Create a new terminal session
 */
async function createTerminal(args = await getTerminalPool();
  
  const config = {name = === 'win32' ? 'cmd.exe' : '/bin/bash'),workingDirectory = await pool.createTerminal(config);
    
    printSuccess(`✅ Terminal created successfully!`);
    console.warn(`🆔 TerminalID = await getTerminalPool();
  
  try {
    const filter = {};
    if (flags.state) filter.state = flags.state;
    if (flags.name) filter.name = flags.name;
    
    const terminals = pool.listTerminals(filter);
    
    if(terminals.length === 0) {
      printInfo('No terminals found matching criteria.');
      return;
    }

    printSuccess(`📋 Found ${terminals.length} terminal(s):`);
    console.warn();
    
    // Sort by creation date (newest first)
    const sortedTerminals = terminals.sort((a, b) => new Date(b.created) - new Date(a.created));

    for(const terminal of sortedTerminals) {
      const stateIcon = getStateIcon(terminal.state);
      const timeAgo = getTimeAgo(new Date(terminal.lastActivity));
      
      console.warn(`${stateIcon} ${terminal.name} (${terminal.id.substring(0, 16)}...)`);
      console.warn(`   🐚 ${terminal.shell}`);
      console.warn(`   📍 ${terminal.workingDirectory}`);
      console.warn(`   ⏰ ${timeAgo} - ${terminal.state}`);
      console.warn(`   📊 ${terminal.commandCount} commands executed`);
      console.warn();
    }
    
  } catch(error) {
    printError(`_Failed _to _listterminals = await getTerminalPool();
  
  const terminalId = args[0];
  const command = args.slice(1).join(' ');
  
  if(!terminalId || !command) {
    printError('Usage = {};
    if(flags.timeout) {
      options.timeout = parseInt(flags.timeout) * 1000; // Convert to milliseconds
    }
    
    printInfo(`Executing in ${terminalId}: ${command}`);
    
    const result = await pool.executeCommand(terminalId, command, options);
    
    if(result.stdout) {
      console.warn('📤Output = args[0];
  
  if(!terminalId) {
    printError('Usage = await getTerminalPool();
  const terminal = pool.getTerminal(terminalId);
  
  if(!terminal) {
    printError(`Terminal ${terminalId} not found`);
    return;
  }

  printSuccess(`🔗 Attaching toterminal = args[0];
  
  if(!terminalId) {
    printError('Usage = args[0];
  
  if(!terminalId) {
    printError('Usage = await getTerminalPool();
  
  try {
    const options = {graceful = await pool.terminateTerminal(terminalId, options);
    
    printSuccess(`✅ Terminalterminated = args[0];
  
  if(!terminalId) {
    printError('Usage = await getTerminalPool();
  const terminal = pool.getTerminal(terminalId);
  
  if(!terminal) {
    printError(`Terminal ${terminalId} not found`);
    return;
  }

  const stateIcon = getStateIcon(terminal.state);
  
  console.warn(`${stateIcon} Terminal Information`);
  console.warn(`🆔ID = terminal.outputBuffer.slice(-5);
    recentOutput.forEach((entry, i) => {
      console.warn(`   ${i + 1}. [${entry.timestamp}] $entry.type`);
      if(entry.command) {
        console.warn(`Command = await getTerminalPool();
  
  try {
    printInfo('🧹 Performing terminal maintenance...');
    
    await pool.performMaintenance();
    
    printSuccess('✅ Terminal cleanup completed');
    console.warn('🔄 Active terminals verified');
    console.warn('📊 Output buffers optimized');
    
  } catch(_error) {
    printError(`Cleanupfailed = args[0];
  
  if(!terminalId) {
    printError('Usage = await getTerminalPool();
  const terminal = pool.getTerminal(terminalId);
  
  if(!terminal) {
    printError(`Terminal ${terminalId} not found`);
    return;
  }

  const interval = parseInt(flags.interval) || 2000;
  
  printSuccess(`📊 Monitoringterminal = setInterval(() => {
    const currentTerminal = pool.getTerminal(terminalId);
    if(!currentTerminal) {
      console.warn('❌ Terminal no longer exists');
      clearInterval(monitorInterval);
      return;
    }
    console.warn(`📊 Terminal Monitor => {
    clearInterval(monitorInterval);
    console.warn('\n✅ Monitoring stopped');
    process.exit(0);
  });
}

/**
 * Get state icon for terminal
 */
function getStateIcon(state = {
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
function getTimeAgo(date = new Date();
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
function getTimeDuration(start = new Date(start);
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
  console.warn(`
🖥️  Modern Terminal Management SystemUSAGE = args[0];

  // Show help if no command or help flag
  if(!subCommand || flags.help || flags.h) {
    showTerminalHelp();
    return;
  }

  try {
    switch(subCommand) {
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
  } catch(error) {
    printError(`Terminal command failed: ${error.message}`);
    if(flags.verbose) {
      console.error('Stack trace:', error.stack);
    }
  }
}
