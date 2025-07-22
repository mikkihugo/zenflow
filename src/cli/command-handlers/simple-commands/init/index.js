// init/index.js - Basic init command implementation

import { promises as fs } from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { printSuccess, printError } from '../../../utils.js';

/**
 * Initialize a new Claude Flow project
 */
export async function initCommand(input, flags) {
  // Handle different argument formats
  const projectPath = Array.isArray(args) ? (args[0] || '.') : (args || '.');
  try {
    const {
      template = 'basic',
      force = false,
      minimal = false,
    } = options;

    printSuccess(`Initializing Claude Flow project in: ${projectPath}`);

    // Create project directory if it doesn't exist
    const absolutePath = path.resolve(projectPath);
    
    try {
      await fs.mkdir(absolutePath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    // Create basic directory structure
    const directories = [
      '.claude',
      '.claude/commands',
      '.hive-mind',
      'memory',
      'memory/sessions',
    ];

    for (const dir of directories) {
      const dirPath = path.join(absolutePath, dir);
      await fs.mkdir(dirPath, { recursive: true });
    }

    // Create basic CLAUDE.md file
    const claudeMdContent = `# Claude Flow Project

This project is configured for Claude Code integration.

## Getting Started

Run \`claude-zen --help\` to see available commands.

## Commands

- \`claude-zen init\` - Initialize project
- \`claude-zen status\` - Show project status
- \`claude-zen help\` - Show help

## Configuration

This project uses Claude Flow v2.0.0 for enhanced development workflows.
`;

    await fs.writeFile(path.join(absolutePath, 'CLAUDE.md'), claudeMdContent, 'utf8');

    // Initialize hive-mind database if directory was created
    const hiveMindDir = path.join(absolutePath, '.hive-mind');
    const dbPath = path.join(hiveMindDir, 'hive.db');
    
    try {
      // Create the database with proper schema
      const db = new Database(dbPath);
      
      // Create hive-mind database tables with corrected schema
      db.exec(`
        CREATE TABLE IF NOT EXISTS swarms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          objective TEXT,
          topology TEXT DEFAULT 'mesh',
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS agents (
          id TEXT PRIMARY KEY,
          swarm_id TEXT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          role TEXT,
          capabilities TEXT,
          status TEXT DEFAULT 'active',
          performance_score REAL DEFAULT 0.5,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (swarm_id) REFERENCES swarms (id)
        );
        
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          swarm_id TEXT,
          agent_id TEXT,
          description TEXT,
          status TEXT DEFAULT 'pending',
          priority INTEGER DEFAULT 5,
          result TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY (swarm_id) REFERENCES swarms(id),
          FOREIGN KEY (agent_id) REFERENCES agents(id)
        );
        
        CREATE TABLE IF NOT EXISTS collective_memory (
          id TEXT PRIMARY KEY,
          swarm_id TEXT,
          key TEXT NOT NULL,
          value TEXT,
          type TEXT DEFAULT 'knowledge',
          confidence REAL DEFAULT 1.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          FOREIGN KEY (swarm_id) REFERENCES swarms(id)
        );
      `);
      
      db.close();
      printSuccess('Hive-mind database initialized successfully!');
    } catch (dbError) {
      printError(`Warning: Could not initialize hive-mind database: ${dbError.message}`);
    }

    printSuccess('Project initialized successfully!');
    
    return {
      success: true,
      path: absolutePath,
      message: 'Project initialized successfully'
    };

  } catch (error) {
    printError(`Failed to initialize project: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}