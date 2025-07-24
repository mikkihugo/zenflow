/**
 * @fileoverview Hive Mind Swarm Management Module
 * Handles swarm spawning, status monitoring, and lifecycle management
 * @module HiveMindSwarmManagement
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Database from 'better-sqlite3';
import {
  isInteractive,
  warnNonInteractive,
  checkNonInteractiveAuth,
} from '../../utils/interactive-detector.js';
import {
  safeInteractive,
  nonInteractiveProgress,
  nonInteractiveSelect,
} from '../../utils/safe-interactive.js';

// Import core components
import { MCPToolWrapper } from '../hive-mind-handlers/hive-mind/mcp-wrapper.js';
import { HiveMindCore } from '../hive-mind-handlers/hive-mind/core.js';
import { QueenCoordinator } from '../hive-mind-handlers/hive-mind/queen.js';
import { SwarmCommunication } from '../hive-mind-handlers/hive-mind/communication.js';

/**
 * Interactive swarm spawning wizard
 * @returns {Promise<void>}
 */
export async function spawnSwarmWizard() {
  if (!isInteractive()) {
    warnNonInteractive('Swarm wizard requires interactive mode');
    return;
  }

  console.log(chalk.yellow('\n🧠 Hive Mind Swarm Wizard'));
  console.log(chalk.gray('Configure and launch a coordinated swarm for your objective\n'));

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'objective',
        message: 'What is your primary objective?',
        validate: (input) => input.trim().length > 0 || 'Objective is required'
      },
      {
        type: 'list',
        name: 'queenType',
        message: 'Select queen coordinator type:',
        choices: [
          { name: '⚡ Strategic - Long-term planning and coordination', value: 'strategic' },
          { name: '🎯 Tactical - Task-focused execution', value: 'tactical' },
          { name: '🔄 Adaptive - Dynamic strategy adjustment', value: 'adaptive' }
        ],
        default: 'strategic'
      },
      {
        type: 'number',
        name: 'workers',
        message: 'Number of worker agents (1-32):',
        default: 4,
        validate: (input) => (input >= 1 && input <= 32) || 'Must be between 1 and 32'
      },
      {
        type: 'confirm',
        name: 'claudeIntegration',
        message: 'Enable Claude Code integration?',
        default: true
      },
      {
        type: 'confirm',
        name: 'autoSpawn',
        message: 'Auto-spawn Claude Code instances?',
        default: false,
        when: (answers) => answers.claudeIntegration
      },
      {
        type: 'list',
        name: 'verbosity',
        message: 'Output verbosity level:',
        choices: [
          { name: '🔇 Quiet - Minimal output', value: 'quiet' },
          { name: '📝 Normal - Standard output', value: 'normal' },
          { name: '🔍 Verbose - Detailed output', value: 'verbose' },
          { name: '🐛 Debug - Full debugging', value: 'debug' }
        ],
        default: 'normal'
      }
    ]);

    const flags = {
      queenType: answers.queenType,
      workers: answers.workers,
      claude: answers.claudeIntegration,
      autoSpawn: answers.autoSpawn,
      verbose: answers.verbosity === 'verbose' || answers.verbosity === 'debug',
      debug: answers.verbosity === 'debug',
      sessionDir: './.claude/hive-mind'
    };

    await spawnSwarm([answers.objective], flags);
    
  } catch (error) {
    if (error.isTtyError) {
      console.error(chalk.red('Interactive wizard not available in this environment'));
    } else {
      console.error(chalk.red('Wizard failed:'), error.message);
    }
  }
}

/**
 * Spawn a hive mind swarm
 * @param {string[]} args - Command arguments (objective)
 * @param {Object} flags - Command flags
 * @returns {Promise<void>}
 */
export async function spawnSwarm(args, flags) {
  const objective = args[0];
  
  if (!objective && isInteractive()) {
    return spawnSwarmWizard();
  }
  
  if (!objective) {
    throw new Error('Objective is required when running in non-interactive mode');
  }

  const spinner = ora('Initializing hive mind swarm...').start();
  
  try {
    // Verify system is initialized
    const sessionDir = flags.sessionDir || './.claude/hive-mind';
    await verifySystemInitialized(sessionDir);
    
    // Generate unique swarm ID
    const swarmId = generateSwarmId();
    const swarmName = `swarm-${Date.now()}`;
    
    // Initialize database connection
    const dbPath = path.join(sessionDir, 'hive-mind.db');
    const db = new Database(dbPath);
    
    try {
      // Create session record
      await createSwarmSession(db, swarmId, swarmName, objective, flags);
      
      // Initialize queen coordinator
      spinner.text = 'Initializing queen coordinator...';
      const queen = await initializeQueen(swarmId, flags.queenType, db);
      
      // Spawn worker agents
      spinner.text = `Spawning ${flags.workers} worker agents...`;
      const workers = await spawnWorkerAgents(db, swarmId, flags.workers, objective);
      
      // Setup communication layer
      spinner.text = 'Establishing communication protocols...';
      const communication = await setupSwarmCommunication(swarmId, queen, workers);
      
      // Launch Claude Code instances if requested
      if (flags.claude) {
        spinner.text = 'Launching Claude Code instances...';
        await spawnClaudeCodeInstances(swarmId, swarmName, objective, workers, flags);
      }
      
      // Start coordination loop
      spinner.text = 'Starting coordination protocols...';
      await startCoordinationLoop(queen, workers, communication, objective, flags);
      
      spinner.succeed(`Swarm ${swarmId} launched successfully`);
      
      displaySwarmInfo(swarmId, swarmName, objective, queen, workers, flags);
      
      if (flags.verbose) {
        await displayDetailedStatus(db, swarmId);
      }
      
    } finally {
      db.close();
    }
    
  } catch (error) {
    spinner.fail(`Failed to spawn swarm: ${error.message}`);
    throw error;
  }
}

/**
 * Show current swarm status
 * @param {Object} flags - Command flags
 * @returns {Promise<void>}
 */
export async function showStatus(flags) {
  const sessionDir = flags.sessionDir || './.claude/hive-mind';
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  
  if (!existsSync(dbPath)) {
    console.log(chalk.yellow('⚠️  Hive Mind not initialized. Run: claude-zen hive-mind init'));
    return;
  }

  const db = new Database(dbPath);
  
  try {
    const sessions = await getActiveSessions(db);
    
    if (sessions.length === 0) {
      console.log(chalk.blue('📊 No active swarms found'));
      console.log(chalk.gray('Run "claude-zen hive-mind spawn" to start a new swarm'));
      return;
    }

    console.log(chalk.yellow(`\n🐝 Active Swarms (${sessions.length})\n`));
    
    for (const session of sessions) {
      await displaySessionStatus(db, session, flags.verbose);
    }
    
  } finally {
    db.close();
  }
}

/**
 * Stop a running swarm session
 * @param {string[]} args - Session ID to stop
 * @param {Object} flags - Command flags
 * @returns {Promise<void>}
 */
export async function stopSession(args, flags) {
  const sessionId = args[0];
  
  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  const sessionDir = flags.sessionDir || './.claude/hive-mind';
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  const db = new Database(dbPath);
  
  try {
    const session = await getSessionById(db, sessionId);
    
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    if (session.status === 'stopped') {
      console.log(chalk.yellow(`Session ${sessionId} is already stopped`));
      return;
    }

    const spinner = ora(`Stopping swarm session ${sessionId}...`).start();
    
    // Update session status
    await updateSessionStatus(db, sessionId, 'stopping');
    
    // Stop all agents
    await stopSessionAgents(db, sessionId);
    
    // Cleanup resources
    await cleanupSessionResources(sessionId, flags);
    
    // Mark as stopped
    await updateSessionStatus(db, sessionId, 'stopped');
    
    spinner.succeed(`Swarm session ${sessionId} stopped successfully`);
    
  } finally {
    db.close();
  }
}

// Helper functions

/**
 * Verify system is properly initialized
 * @param {string} sessionDir - Session directory path
 * @returns {Promise<void>}
 */
async function verifySystemInitialized(sessionDir) {
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  const configPath = path.join(sessionDir, 'config.json');
  
  if (!existsSync(dbPath) || !existsSync(configPath)) {
    throw new Error('Hive Mind not initialized. Run: claude-zen hive-mind init');
  }
}

/**
 * Generate unique swarm identifier
 * @returns {string} Swarm ID
 */
function generateSwarmId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `swarm-${timestamp}-${random}`;
}

/**
 * Create swarm session in database
 * @param {Database} db - Database instance
 * @param {string} swarmId - Swarm identifier
 * @param {string} swarmName - Swarm name
 * @param {string} objective - Primary objective
 * @param {Object} flags - Configuration flags
 * @returns {Promise<void>}
 */
async function createSwarmSession(db, swarmId, swarmName, objective, flags) {
  const stmt = db.prepare(`
    INSERT INTO sessions (id, name, objective, queen_type, worker_count, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const metadata = JSON.stringify({
    claudeIntegration: flags.claude || false,
    autoSpawn: flags.autoSpawn || false,
    verbose: flags.verbose || false,
    timeout: flags.timeout || 30000,
    memoryLimit: flags.memoryLimit || 512
  });
  
  stmt.run(swarmId, swarmName, objective, flags.queenType || 'strategic', flags.workers || 4, metadata);
}

/**
 * Initialize queen coordinator
 * @param {string} swarmId - Swarm identifier
 * @param {string} queenType - Queen type
 * @param {Database} db - Database instance
 * @returns {Promise<Object>} Queen instance
 */
async function initializeQueen(swarmId, queenType, db) {
  const queen = new QueenCoordinator({
    swarmId,
    type: queenType,
    database: db
  });
  
  await queen.initialize();
  
  // Register queen in database
  const stmt = db.prepare(`
    INSERT INTO agents (id, session_id, name, type, role, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(queen.id, swarmId, `Queen-${queenType}`, 'queen', 'coordinator', 'active');
  
  return queen;
}

/**
 * Spawn worker agents
 * @param {Database} db - Database instance
 * @param {string} swarmId - Swarm identifier
 * @param {number} workerCount - Number of workers to spawn
 * @param {string} objective - Primary objective
 * @returns {Promise<Array>} Worker instances
 */
async function spawnWorkerAgents(db, swarmId, workerCount, objective) {
  const workers = [];
  const workerTypes = ['researcher', 'analyst', 'developer', 'tester', 'optimizer'];
  
  for (let i = 0; i < workerCount; i++) {
    const workerType = workerTypes[i % workerTypes.length];
    const workerId = `worker-${swarmId}-${i + 1}`;
    
    const worker = new HiveMindCore({
      id: workerId,
      swarmId,
      type: workerType,
      objective,
      database: db
    });
    
    await worker.initialize();
    workers.push(worker);
    
    // Register in database
    const stmt = db.prepare(`
      INSERT INTO agents (id, session_id, name, type, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(workerId, swarmId, `Worker-${i + 1}-${workerType}`, 'worker', workerType, 'active');
  }
  
  return workers;
}

/**
 * Setup swarm communication layer
 * @param {string} swarmId - Swarm identifier
 * @param {Object} queen - Queen coordinator
 * @param {Array} workers - Worker agents
 * @returns {Promise<Object>} Communication instance
 */
async function setupSwarmCommunication(swarmId, queen, workers) {
  const communication = new SwarmCommunication({
    swarmId,
    queen,
    workers
  });
  
  await communication.initialize();
  return communication;
}

/**
 * Start coordination loop
 * @param {Object} queen - Queen coordinator
 * @param {Array} workers - Worker agents
 * @param {Object} communication - Communication layer
 * @param {string} objective - Primary objective
 * @param {Object} flags - Configuration flags
 * @returns {Promise<void>}
 */
async function startCoordinationLoop(queen, workers, communication, objective, flags) {
  // Initialize coordination with strategic planning
  await queen.planObjective(objective, workers);
  
  // Begin work distribution
  await queen.distributeWork(workers, communication);
  
  // Start monitoring loop (non-blocking)
  setImmediate(() => {
    queen.startMonitoring(workers, communication);
  });
}

/**
 * Display swarm information
 * @param {string} swarmId - Swarm identifier
 * @param {string} swarmName - Swarm name
 * @param {string} objective - Primary objective
 * @param {Object} queen - Queen coordinator
 * @param {Array} workers - Worker agents
 * @param {Object} flags - Configuration flags
 */
function displaySwarmInfo(swarmId, swarmName, objective, queen, workers, flags) {
  console.log(`
${chalk.green('🐝 Swarm Launched Successfully')}

${chalk.bold('Swarm Details:')}
  ID: ${chalk.cyan(swarmId)}
  Name: ${chalk.cyan(swarmName)}
  Objective: ${chalk.yellow(objective)}

${chalk.bold('Configuration:')}
  👑 Queen: ${chalk.magenta(queen.type)} coordinator
  👥 Workers: ${chalk.blue(workers.length)} agents
  🔗 Claude Integration: ${flags.claude ? chalk.green('enabled') : chalk.gray('disabled')}
  ⚡ Auto-spawn: ${flags.autoSpawn ? chalk.green('enabled') : chalk.gray('disabled')}

${chalk.bold('Management Commands:')}
  ${chalk.yellow('claude-zen hive-mind status')}              - View current status
  ${chalk.yellow('claude-zen hive-mind stop ' + swarmId)}     - Stop this swarm
  ${chalk.yellow('claude-zen hive-mind metrics')}             - View performance metrics
`);
}

/**
 * Get active sessions from database
 * @param {Database} db - Database instance
 * @returns {Promise<Array>} Active sessions
 */
async function getActiveSessions(db) {
  return db.prepare(`
    SELECT id, name, objective, status, queen_type, worker_count, created_at
    FROM sessions 
    WHERE status IN ('active', 'running', 'paused')
    ORDER BY created_at DESC
  `).all();
}

/**
 * Display session status
 * @param {Database} db - Database instance
 * @param {Object} session - Session record
 * @param {boolean} verbose - Show detailed info
 * @returns {Promise<void>}
 */
async function displaySessionStatus(db, session, verbose = false) {
  const agents = db.prepare(`
    SELECT type, role, status, COUNT(*) as count
    FROM agents 
    WHERE session_id = ?
    GROUP BY type, role, status
  `).all(session.id);

  const uptime = Math.floor((Date.now() - session.created_at * 1000) / 1000);
  const uptimeStr = formatUptime(uptime);

  console.log(`📊 ${chalk.bold(session.name)} (${chalk.cyan(session.id.substr(0, 12))}...)`);
  console.log(`   Objective: ${chalk.yellow(session.objective)}`);
  console.log(`   Status: ${getStatusColor(session.status)(session.status.toUpperCase())}`);
  console.log(`   Queen: ${chalk.magenta(session.queen_type)}, Workers: ${chalk.blue(session.worker_count)}`);
  console.log(`   Uptime: ${chalk.gray(uptimeStr)}`);
  
  if (verbose && agents.length > 0) {
    console.log(`   Agents:`);
    for (const agent of agents) {
      console.log(`     ${agent.type}: ${agent.count} ${getStatusColor(agent.status)(agent.status)}`);
    }
  }
  
  console.log();
}

/**
 * Helper function to get status color
 * @param {string} status - Status string
 * @returns {Function} Chalk color function
 */
function getStatusColor(status) {
  const colors = {
    active: chalk.green,
    running: chalk.green,
    paused: chalk.yellow,
    stopped: chalk.red,
    error: chalk.red,
    idle: chalk.gray
  };
  return colors[status] || chalk.gray;
}

/**
 * Format uptime in human readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime
 */
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Additional helper functions for session management...

async function getSessionById(db, sessionId) {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
}

async function updateSessionStatus(db, sessionId, status) {
  const stmt = db.prepare('UPDATE sessions SET status = ?, updated_at = ? WHERE id = ?');
  stmt.run(status, Math.floor(Date.now() / 1000), sessionId);
}

async function stopSessionAgents(db, sessionId) {
  const stmt = db.prepare('UPDATE agents SET status = ? WHERE session_id = ?');
  stmt.run('stopped', sessionId);
}

async function cleanupSessionResources(sessionId, flags) {
  // Cleanup temporary files, processes, etc.
  // Implementation depends on specific resource management needs
}