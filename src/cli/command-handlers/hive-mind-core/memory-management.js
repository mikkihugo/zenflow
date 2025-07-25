/**
 * @fileoverview Hive Mind Memory Management Module
 * Handles collective memory storage, retrieval, and maintenance operations
 * @module HiveMindMemoryManagement
 */

import { existsSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import Database from 'better-sqlite3';
import { isInteractive, warnNonInteractive } from '../../utils/interactive-detector.js';

/**
 * Interactive memory management wizard
 * @returns {Promise<void>}
 */
export async function manageMemoryWizard() {
  if (!isInteractive()) {
    warnNonInteractive('Memory wizard requires interactive mode');
    return;
  }

  console.log(chalk.yellow('\n🧠 Collective Memory Manager'));
  console.log(chalk.gray('Manage shared knowledge and experiences across swarms\n'));

  try {
    const action = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📋 List all memories', value: 'list' },
          { name: '🔍 Search memories', value: 'search' },
          { name: '💾 Store new memory', value: 'store' },
          { name: '📊 View memory statistics', value: 'stats' },
          { name: '🗑️  Clean old memories', value: 'clean' },
          { name: '📦 Export memory backup', value: 'export' },
          { name: '⚙️  Configure memory settings', value: 'configure' }
        ]
      }
    ]);

    const handlers = {
      list: listMemories,
      search: searchMemories,
      store: storeMemoryWizard,
      stats: showMemoryStats,
      clean: cleanMemories,
      export: exportMemoryBackup,
      configure: configureWizard
    };

    await handlers[action.action]();
    
  } catch (error) {
    if (error.isTtyError) {
      console.error(chalk.red('Interactive wizard not available in this environment'));
    } else {
      console.error(chalk.red('Memory wizard failed:'), error.message);
    }
  }
}

/**
 * List all memories with filtering and pagination
 * @param {Object} filters - Filter options
 * @returns {Promise<void>}
 */
export async function listMemories(filters = {}) {
  const sessionDir = filters.sessionDir || './.claude/hive-mind';
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  
  if (!existsSync(dbPath)) {
    console.log(chalk.yellow('⚠️  Memory database not found. Run: claude-zen hive-mind init'));
    return;
  }

  const db = new Database(dbPath);
  
  try {
    let query = `
      SELECT id, key, type, importance, created_at, accessed_at, access_count
      FROM collective_memory
    `;
    
    const params = [];
    const conditions = [];
    
    if (filters.type) {
      conditions.push('type = ?');
      params.push(filters.type);
    }
    
    if (filters.minImportance) {
      conditions.push('importance >= ?');
      params.push(filters.minImportance);
    }
    
    if (filters.session_id) {
      conditions.push('session_id = ?');
      params.push(filters.session_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY importance DESC, created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const memories = db.prepare(query).all(...params);
    
    if (memories.length === 0) {
      console.log(chalk.blue('📭 No memories found matching criteria'));
      return;
    }

    console.log(chalk.yellow(`\n💾 Collective Memory (${memories.length} entries)\n`));
    
    for (const memory of memories) {
      displayMemoryEntry(memory);
    }
    
    if (memories.length >= (filters.limit || 20)) {
      console.log(chalk.gray('\n... (use --limit to see more entries)'));
    }
    
  } finally {
    db.close();
  }
}

/**
 * Search memories by key pattern or content
 * @returns {Promise<void>}
 */
export async function searchMemories() {
  if (!isInteractive()) {
    console.log(chalk.yellow('Search requires interactive mode'));
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Search query (key pattern or content):',
      validate: (input) => input.trim().length > 0 || 'Search query is required'
    },
    {
      type: 'list',
      name: 'searchType',
      message: 'Search in:',
      choices: [
        { name: '🔑 Keys only', value: 'keys' },
        { name: '📄 Content only', value: 'content' },
        { name: '🔍 Both keys and content', value: 'both' }
      ],
      default: 'both'
    },
    {
      type: 'number',
      name: 'limit',
      message: 'Maximum results:',
      default: 20,
      validate: (input) => input > 0 || 'Must be greater than 0'
    }
  ]);

  const sessionDir = './.claude/hive-mind';
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  const db = new Database(dbPath);
  
  try {
    let query = `
      SELECT id, key, value, type, importance, created_at, accessed_at, access_count
      FROM collective_memory
      WHERE 
    `;
    
    const searchPattern = `%${answers.query}%`;
    
    if (answers.searchType === 'keys') {
      query += 'key LIKE ?';
    } else if (answers.searchType === 'content') {
      query += 'value LIKE ?';
    } else {
      query += '(key LIKE ? OR value LIKE ?)';
    }
    
    query += ' ORDER BY importance DESC, created_at DESC LIMIT ?';
    
    const params = answers.searchType === 'both' 
      ? [searchPattern, searchPattern, answers.limit]
      : [searchPattern, answers.limit];
    
    const results = db.prepare(query).all(...params);
    
    if (results.length === 0) {
      console.log(chalk.blue(`📭 No memories found matching "${answers.query}"`));
      return;
    }

    console.log(chalk.yellow(`\n🔍 Search Results (${results.length} found)\n`));
    
    for (const result of results) {
      displayMemoryEntry(result, true);
      
      // Highlight search terms in content preview
      if (answers.searchType !== 'keys') {
        const preview = result.value.substring(0, 200);
        const highlighted = preview.replace(
          new RegExp(answers.query, 'gi'),
          chalk.bgYellow.black('$&')
        );
        console.log(chalk.gray(`   Preview: ${highlighted}${result.value.length > 200 ? '...' : ''}`));
      }
      
      console.log();
    }
    
    // Update access count for found memories
    const updateStmt = db.prepare(`
      UPDATE collective_memory 
      SET accessed_at = ?, access_count = access_count + 1 
      WHERE id IN (${results.map(() => '?').join(',')})
    `);
    updateStmt.run(Math.floor(Date.now() / 1000), ...results.map(r => r.id));
    
  } finally {
    db.close();
  }
}

/**
 * Interactive memory storage wizard
 * @returns {Promise<void>}
 */
export async function storeMemoryWizard() {
  if (!isInteractive()) {
    console.log(chalk.yellow('Store wizard requires interactive mode'));
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'key',
      message: 'Memory key (unique identifier):',
      validate: (input) => input.trim().length > 0 || 'Key is required'
    },
    {
      type: 'editor',
      name: 'value',
      message: 'Memory content (opens in editor):'
    },
    {
      type: 'list',
      name: 'type',
      message: 'Memory type:',
      choices: [
        { name: '📋 General knowledge', value: 'general' },
        { name: '⚙️  Configuration setting', value: 'config' },
        { name: '📊 Performance metric', value: 'metric' },
        { name: '🎯 Decision record', value: 'decision' },
        { name: '🔍 Research finding', value: 'research' },
        { name: '⚠️  Important note', value: 'note' }
      ],
      default: 'general'
    },
    {
      type: 'number',
      name: 'importance',
      message: 'Importance level (0.0 - 1.0):',
      default: 0.5,
      validate: (input) => (input >= 0 && input <= 1) || 'Must be between 0.0 and 1.0'
    },
    {
      type: 'input',
      name: 'sessionId',
      message: 'Associate with session ID (optional):',
      default: ''
    }
  ]);

  await storeMemory(
    answers.key,
    answers.value,
    answers.type,
    answers.importance,
    answers.sessionId || null
  );
  
  console.log(chalk.green(`✓ Memory stored successfully: ${answers.key}`));
}

/**
 * Store a memory entry in the collective memory
 * @param {string} key - Memory key
 * @param {string} value - Memory content
 * @param {string} type - Memory type
 * @param {number} importance - Importance level (0-1)
 * @param {string|null} sessionId - Associated session ID
 * @returns {Promise<string>} Memory ID
 */
export async function storeMemory(key, value, type = 'general', importance = 0.5, sessionId = null) {
  const sessionDir = './.claude/hive-mind';
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  const db = new Database(dbPath);
  
  try {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = db.prepare(`
      INSERT INTO collective_memory (id, session_id, key, value, type, importance)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(memoryId, sessionId, key, value, type, importance);
    
    return memoryId;
    
  } finally {
    db.close();
  }
}

/**
 * Display memory statistics and analytics
 * @returns {Promise<void>}
 */
export async function showMemoryStats() {
  const sessionDir = './.claude/hive-mind';
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  const db = new Database(dbPath);
  
  try {
    // Overall statistics
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM collective_memory').get().count;
    const typeStats = db.prepare(`
      SELECT type, COUNT(*) as count, AVG(importance) as avg_importance
      FROM collective_memory 
      GROUP BY type 
      ORDER BY count DESC
    `).all();
    
    // Access statistics
    const accessStats = db.prepare(`
      SELECT 
        SUM(access_count) as total_accesses,
        AVG(access_count) as avg_accesses,
        MAX(access_count) as max_accesses
      FROM collective_memory
    `).get();
    
    // Recent activity
    const recentMemories = db.prepare(`
      SELECT COUNT(*) as count 
      FROM collective_memory 
      WHERE created_at > ?
    `).get(Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)).count;
    
    // Top accessed memories
    const topAccessed = db.prepare(`
      SELECT key, type, access_count, importance
      FROM collective_memory 
      WHERE access_count > 0
      ORDER BY access_count DESC 
      LIMIT 5
    `).all();

    console.log(chalk.yellow('\n📊 Collective Memory Statistics\n'));
    
    console.log(chalk.bold('Overview:'));
    console.log(`  Total memories: ${chalk.cyan(totalCount)}`);
    console.log(`  Added this week: ${chalk.green(recentMemories)}`);
    console.log(`  Total accesses: ${chalk.blue(accessStats.total_accesses || 0)}`);
    console.log(`  Average accesses per memory: ${chalk.gray(Math.round(accessStats.avg_accesses || 0))}`);
    
    console.log(chalk.bold('\nBy Type:'));
    for (const stat of typeStats) {
      const importance = (stat.avg_importance * 100).toFixed(1);
      console.log(`  ${stat.type}: ${chalk.cyan(stat.count)} (avg importance: ${importance}%)`);
    }
    
    if (topAccessed.length > 0) {
      console.log(chalk.bold('\nMost Accessed:'));
      for (const memory of topAccessed) {
        console.log(`  ${memory.key} (${memory.type}): ${chalk.yellow(memory.access_count)} accesses`);
      }
    }
    
    // Memory usage estimation
    const avgSize = totalCount > 0 ? Math.round(await estimateMemorySize(db) / totalCount) : 0;
    const totalSize = Math.round(await estimateMemorySize(db) / 1024);
    
    console.log(chalk.bold('\nStorage:'));
    console.log(`  Estimated size: ${chalk.cyan(totalSize)} KB`);
    console.log(`  Average per memory: ${chalk.gray(avgSize)} bytes`);
    
  } finally {
    db.close();
  }
}

/**
 * Clean old or low-importance memories
 * @returns {Promise<void>}
 */
export async function cleanMemories() {
  if (!isInteractive()) {
    console.log(chalk.yellow('Clean operation requires interactive mode'));
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'strategy',
      message: 'Cleaning strategy:',
      choices: [
        { name: '📅 Remove memories older than X days', value: 'age' },
        { name: '⭐ Remove low importance memories (< threshold)', value: 'importance' },
        { name: '🚫 Remove unused memories (never accessed)', value: 'unused' },
        { name: '🎯 Custom cleanup criteria', value: 'custom' }
      ]
    }
  ]);

  const cleanupCriteria = {};
  
  if (answers.strategy === 'age') {
    const ageAnswer = await inquirer.prompt([
      {
        type: 'number',
        name: 'days',
        message: 'Remove memories older than how many days?',
        default: 30,
        validate: (input) => input > 0 || 'Must be greater than 0'
      }
    ]);
    cleanupCriteria.maxAge = ageAnswer.days;
    
  } else if (answers.strategy === 'importance') {
    const importanceAnswer = await inquirer.prompt([
      {
        type: 'number',
        name: 'threshold',
        message: 'Remove memories with importance less than:',
        default: 0.2,
        validate: (input) => (input >= 0 && input <= 1) || 'Must be between 0.0 and 1.0'
      }
    ]);
    cleanupCriteria.minImportance = importanceAnswer.threshold;
    
  } else if (answers.strategy === 'unused') {
    cleanupCriteria.maxAccess = 0;
  }

  const sessionDir = './.claude/hive-mind';
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  const db = new Database(dbPath);
  
  try {
    const toDelete = await identifyMemoriesToDelete(db, cleanupCriteria);
    
    if (toDelete.length === 0) {
      console.log(chalk.blue('📭 No memories match cleanup criteria'));
      return;
    }

    console.log(chalk.yellow(`\n🗑️  Found ${toDelete.length} memories to delete:`));
    for (const memory of toDelete.slice(0, 10)) {
      console.log(`  ${memory.key} (${memory.type}, importance: ${memory.importance})`);
    }
    
    if (toDelete.length > 10) {
      console.log(chalk.gray(`  ... and ${toDelete.length - 10} more`));
    }

    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: `Delete ${toDelete.length} memories permanently?`,
        default: false
      }
    ]);

    if (confirm.proceed) {
      const spinner = ora(`Deleting ${toDelete.length} memories...`).start();
      
      const deleteStmt = db.prepare('DELETE FROM collective_memory WHERE id = ?');
      const transaction = db.transaction((memories) => {
        for (const memory of memories) {
          deleteStmt.run(memory.id);
        }
      });
      
      transaction(toDelete);
      
      spinner.succeed(`Deleted ${toDelete.length} memories successfully`);
    } else {
      console.log(chalk.gray('Cleanup cancelled'));
    }
    
  } finally {
    db.close();
  }
}

/**
 * Export memory backup
 * @returns {Promise<void>}
 */
export async function exportMemoryBackup() {
  const sessionDir = './.claude/hive-mind';
  const dbPath = path.join(sessionDir, 'hive-mind.db');
  const db = new Database(dbPath);
  
  try {
    const memories = db.prepare(`
      SELECT id, session_id, key, value, type, importance, created_at, accessed_at, access_count
      FROM collective_memory
      ORDER BY created_at DESC
    `).all();

    const backup = {
      exported_at: new Date().toISOString(),
      version: '2.0.0',
      memory_count: memories.length,
      memories: memories
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `memory-backup-${timestamp}.json`;
    const exportPath = path.join(sessionDir, 'exports', filename);
    
    // Ensure exports directory exists
    const { mkdirSync } = await import('fs');
    const exportsDir = path.join(sessionDir, 'exports');
    if (!existsSync(exportsDir)) {
      mkdirSync(exportsDir, { recursive: true });
    }

    await writeFile(exportPath, JSON.stringify(backup, null, 2));
    
    console.log(chalk.green(`✓ Memory backup exported successfully`));
    console.log(chalk.cyan(`  File: ${exportPath}`));
    console.log(chalk.gray(`  Size: ${Math.round(JSON.stringify(backup).length / 1024)} KB`));
    console.log(chalk.gray(`  Memories: ${memories.length}`));
    
  } finally {
    db.close();
  }
}

/**
 * Configuration wizard for memory settings
 * @returns {Promise<void>}
 */
export async function configureWizard() {
  if (!isInteractive()) {
    console.log(chalk.yellow('Configuration requires interactive mode'));
    return;
  }

  console.log(chalk.yellow('\n⚙️  Memory Configuration'));
  
  const answers = await inquirer.prompt([
    {
      type: 'number',
      name: 'retentionDays',
      message: 'Default memory retention (days):',
      default: 90,
      validate: (input) => input > 0 || 'Must be greater than 0'
    },
    {
      type: 'number',
      name: 'autoCleanThreshold',
      message: 'Auto-clean when memory count exceeds:',
      default: 10000,
      validate: (input) => input > 0 || 'Must be greater than 0'
    },
    {
      type: 'number',
      name: 'minImportanceThreshold',
      message: 'Minimum importance for auto-clean:',
      default: 0.1,
      validate: (input) => (input >= 0 && input <= 1) || 'Must be between 0.0 and 1.0'
    },
    {
      type: 'confirm',
      name: 'enableAutoClean',
      message: 'Enable automatic cleanup?',
      default: false
    }
  ]);

  // Store configuration in memory
  await storeMemory('config.memory.retention_days', answers.retentionDays.toString(), 'config', 1.0);
  await storeMemory('config.memory.auto_clean_threshold', answers.autoCleanThreshold.toString(), 'config', 1.0);
  await storeMemory('config.memory.min_importance_threshold', answers.minImportanceThreshold.toString(), 'config', 1.0);
  await storeMemory('config.memory.auto_clean_enabled', answers.enableAutoClean.toString(), 'config', 1.0);
  
  console.log(chalk.green('✓ Memory configuration updated successfully'));
}

// Helper functions

/**
 * Display a single memory entry
 * @param {Object} memory - Memory record
 * @param {boolean} detailed - Show detailed information
 */
function displayMemoryEntry(memory, detailed = false) {
  const createdDate = new Date(memory.created_at * 1000).toLocaleDateString();
  const accessedDate = memory.accessed_at 
    ? new Date(memory.accessed_at * 1000).toLocaleDateString()
    : 'Never';
  
  const importance = (memory.importance * 100).toFixed(0);
  const importanceColor = memory.importance > 0.7 ? chalk.red : 
                          memory.importance > 0.4 ? chalk.yellow : chalk.gray;
  
  console.log(`${chalk.bold(memory.key)} ${chalk.gray(`(${memory.type})`)}`);
  console.log(`  Importance: ${importanceColor(importance + '%')} | Created: ${chalk.gray(createdDate)} | Accessed: ${chalk.gray(accessedDate)} (${memory.access_count}x)`);
  
  if (detailed) {
    const preview = memory.value.length > 100 
      ? memory.value.substring(0, 100) + '...'
      : memory.value;
    console.log(`  ${chalk.dim(preview)}`);
  }
}

/**
 * Estimate total memory size in bytes
 * @param {Database} db - Database instance
 * @returns {Promise<number>} Estimated size in bytes
 */
async function estimateMemorySize(db) {
  const result = db.prepare(`
    SELECT SUM(LENGTH(key) + LENGTH(value) + LENGTH(type) + 50) as total_size
    FROM collective_memory
  `).get();
  
  return result.total_size || 0;
}

/**
 * Identify memories to delete based on criteria
 * @param {Database} db - Database instance
 * @param {Object} criteria - Cleanup criteria
 * @returns {Promise<Array>} Memories to delete
 */
async function identifyMemoriesToDelete(db, criteria) {
  let query = 'SELECT id, key, type, importance, created_at FROM collective_memory WHERE ';
  const conditions = [];
  const params = [];
  
  if (criteria.maxAge) {
    const cutoffTime = Math.floor((Date.now() - criteria.maxAge * 24 * 60 * 60 * 1000) / 1000);
    conditions.push('created_at < ?');
    params.push(cutoffTime);
  }
  
  if (criteria.minImportance !== undefined) {
    conditions.push('importance < ?');
    params.push(criteria.minImportance);
  }
  
  if (criteria.maxAccess !== undefined) {
    conditions.push('access_count <= ?');
    params.push(criteria.maxAccess);
  }
  
  // Never delete config memories
  conditions.push("type != 'config'");
  
  if (conditions.length === 1 && conditions[0] === "type != 'config'") {
    return []; // No other criteria specified
  }
  
  query += conditions.join(' AND ');
  query += ' ORDER BY importance ASC, access_count ASC';
  
  return db.prepare(query).all(...params);
}