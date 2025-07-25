/**
 * @fileoverview Hive Mind Initialization Module
 * Handles system setup, database initialization, and configuration
 * @module HiveMindInitialization
 */

import { existsSync, mkdirSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import Database from 'better-sqlite3';
import { isInteractive, warnNonInteractive } from '../../utils/interactive-detector.js';

/**
 * Initialize hive mind system with database and configuration
 * @param {Object} flags - Command flags and options
 * @returns {Promise<void>}
 */
export async function initHiveMind(flags) {
  const spinner = ora('Initializing Hive Mind system...').start();
  
  try {
    // Create session directory
    const sessionDir = path.resolve(flags.sessionDir || './.claude/hive-mind');
    await ensureDirectoryExists(sessionDir);
    
    // Initialize SQLite database
    const dbPath = path.join(sessionDir, 'hive-mind.db');
    await initializeDatabase(dbPath, flags.force);
    
    // Create configuration file
    const configPath = path.join(sessionDir, 'config.json');
    await createConfiguration(configPath, flags);
    
    // Create required subdirectories
    await createSubdirectories(sessionDir);
    
    // Validate initialization
    await validateInitialization(sessionDir);
    
    spinner.succeed('Hive Mind system initialized successfully');
    
    console.log(`
${chalk.green('✓ Hive Mind Initialization Complete')}

${chalk.bold('Created:')}
  📁 Session directory: ${chalk.cyan(sessionDir)}
  🗄️  Database: ${chalk.cyan(path.join(sessionDir, 'hive-mind.db'))}
  ⚙️  Configuration: ${chalk.cyan(configPath)}

${chalk.bold('Next steps:')}
  ${chalk.yellow('claude-zen hive-mind spawn')}     - Start your first swarm
  ${chalk.yellow('claude-zen hive-mind wizard')}    - Use interactive wizard
  ${chalk.yellow('claude-zen hive-mind status')}    - Check system status
`);

    if (!isInteractive()) {
      warnNonInteractive('Hive Mind initialization completed in non-interactive mode');
    }
    
  } catch (error) {
    spinner.fail(`Failed to initialize Hive Mind: ${error.message}`);
    throw error;
  }
}

/**
 * Ensure directory exists, create if necessary
 * @param {string} dirPath - Directory path to ensure
 * @returns {Promise<void>}
 */
async function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Initialize SQLite database with required tables
 * @param {string} dbPath - Database file path
 * @param {boolean} force - Force recreation if exists
 * @returns {Promise<void>}
 */
async function initializeDatabase(dbPath, force = false) {
  if (existsSync(dbPath) && !force) {
    // Database exists, verify schema
    const db = new Database(dbPath);
    await verifyDatabaseSchema(db);
    db.close();
    return;
  }

  const db = new Database(dbPath);
  
  try {
    // Create tables with proper indexes
    await createDatabaseTables(db);
    await createDatabaseIndexes(db);
    
    // Insert initial data
    await insertInitialData(db);
    
  } finally {
    db.close();
  }
}

/**
 * Create all required database tables
 * @param {Database} db - SQLite database instance
 * @returns {Promise<void>}
 */
async function createDatabaseTables(db) {
  const tables = [
    // Sessions table
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      objective TEXT,
      status TEXT DEFAULT 'active',
      queen_type TEXT DEFAULT 'strategic',
      worker_count INTEGER DEFAULT 4,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      metadata TEXT
    )`,
    
    // Agents table
    `CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      role TEXT,
      status TEXT DEFAULT 'idle',
      performance_score REAL DEFAULT 0.0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      last_active INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    )`,
    
    // Memory table
    `CREATE TABLE IF NOT EXISTS collective_memory (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      importance REAL DEFAULT 0.5,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      accessed_at INTEGER DEFAULT (strftime('%s', 'now')),
      access_count INTEGER DEFAULT 0
    )`,
    
    // Decisions table
    `CREATE TABLE IF NOT EXISTS consensus_decisions (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      decision_type TEXT NOT NULL,
      question TEXT NOT NULL,
      result TEXT NOT NULL,
      confidence REAL DEFAULT 0.0,
      participating_agents TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    )`,
    
    // Metrics table
    `CREATE TABLE IF NOT EXISTS performance_metrics (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      agent_id TEXT,
      metric_type TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      value REAL NOT NULL,
      timestamp INTEGER DEFAULT (strftime('%s', 'now'))
    )`
  ];

  for (const tableSQL of tables) {
    db.exec(tableSQL);
  }
}

/**
 * Create database indexes for performance
 * @param {Database} db - SQLite database instance
 * @returns {Promise<void>}
 */
async function createDatabaseIndexes(db) {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status)',
    'CREATE INDEX IF NOT EXISTS idx_agents_session ON agents (session_id)',
    'CREATE INDEX IF NOT EXISTS idx_memory_session ON collective_memory (session_id)',
    'CREATE INDEX IF NOT EXISTS idx_memory_key ON collective_memory (key)',
    'CREATE INDEX IF NOT EXISTS idx_decisions_session ON consensus_decisions (session_id)',
    'CREATE INDEX IF NOT EXISTS idx_metrics_session ON performance_metrics (session_id)',
    'CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON performance_metrics (timestamp)'
  ];

  for (const indexSQL of indexes) {
    db.exec(indexSQL);
  }
}

/**
 * Insert initial configuration data
 * @param {Database} db - SQLite database instance
 * @returns {Promise<void>}
 */
async function insertInitialData(db) {
  // Insert default configuration values into memory
  const defaultConfig = [
    { key: 'system.version', value: '2.0.0', type: 'config' },
    { key: 'system.initialized_at', value: Date.now().toString(), type: 'config' },
    { key: 'default.queen_type', value: 'strategic', type: 'config' },
    { key: 'default.worker_count', value: '4', type: 'config' },
    { key: 'limits.max_workers', value: '32', type: 'config' },
    { key: 'limits.memory_limit_mb', value: '512', type: 'config' }
  ];

  const stmt = db.prepare(`
    INSERT INTO collective_memory (id, key, value, type, importance)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const config of defaultConfig) {
    const id = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    stmt.run(id, config.key, config.value, config.type, 1.0);
  }
}

/**
 * Verify database schema is current
 * @param {Database} db - SQLite database instance
 * @returns {Promise<void>}
 */
async function verifyDatabaseSchema(db) {
  const requiredTables = ['sessions', 'agents', 'collective_memory', 'consensus_decisions', 'performance_metrics'];
  
  for (const table of requiredTables) {
    const result = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name=?
    `).get(table);
    
    if (!result) {
      throw new Error(`Missing required table: ${table}`);
    }
  }
}

/**
 * Create configuration file
 * @param {string} configPath - Configuration file path
 * @param {Object} flags - Command flags
 * @returns {Promise<void>}
 */
async function createConfiguration(configPath, flags) {
  const config = {
    version: '2.0.0',
    initialized: new Date().toISOString(),
    defaults: {
      queenType: flags.queenType || 'strategic',
      workers: flags.workers || 4,
      timeout: flags.timeout || 30000,
      memoryLimit: flags.memoryLimit || 512
    },
    directories: {
      sessions: './sessions',
      memory: './memory',
      logs: './logs',
      exports: './exports'
    },
    features: {
      claudeIntegration: true,
      autoSpawn: false,
      persistentMemory: true,
      metricsCollection: true
    }
  };

  await writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Create required subdirectories
 * @param {string} sessionDir - Base session directory
 * @returns {Promise<void>}
 */
async function createSubdirectories(sessionDir) {
  const subdirs = ['sessions', 'memory', 'logs', 'exports', 'temp'];
  
  for (const subdir of subdirs) {
    const dirPath = path.join(sessionDir, subdir);
    await ensureDirectoryExists(dirPath);
  }
}

/**
 * Validate successful initialization
 * @param {string} sessionDir - Session directory path
 * @returns {Promise<void>}
 */
async function validateInitialization(sessionDir) {
  const requiredFiles = [
    path.join(sessionDir, 'hive-mind.db'),
    path.join(sessionDir, 'config.json')
  ];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      throw new Error(`Required file not created: ${file}`);
    }
  }

  // Test database connection
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  const db = new Database(dbPath);
  
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM collective_memory WHERE type = ?').get('config');
    if (result.count === 0) {
      throw new Error('Database initialization incomplete - no config records found');
    }
  } finally {
    db.close();
  }
}