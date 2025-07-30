/**
 * Test for Hive Mind database schema - specifically for issue #403;
 * Issue #403, SQLITE_CONSTRAINT: NOT NULL constraint failed: agents.role;
 *;
 * This test verifies that the database schema is created correctly;
 * and that agents can be inserted with or without a role value.;
 *;
 * @fileoverview Comprehensive database schema validation tests with Google standards;
 * @author Claude Code Flow Team;
 * @version 2.0.0
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect } from '@jest/globals';
import Database from 'better-sqlite3';

/**
 * Database column information structure
 */
// // interface ColumnInfo {
//   // cid: number
//   // name: string
//   // type: string
//   // notnull: number
//   dflt_value: string | null;
//   // pk: number
// // }
/**
 * SQLite master table entry
 */
// // interface SqliteMasterEntry {
//   // type: string
//   // name: string
//   // tbl_name: string
//   // rootpage: number
//   // sql: string
// // }
/**
 * Database test context
 */
// // interface TestContext {
//   // testDir: string
//   // dbPath: string
//   db: Database.Database | null;
// // }
describe('Hive Mind Database Schema - Issue #403', () => {
  let _testContext,
  beforeEach(async (): Promise<void> => {
    // Create temporary test directory with unique name
    const _timestamp = Date.now();
    const _testDir = path.join(os.tmpdir(), `claude-zen-hive-test-${timestamp}`);
// // await fs.mkdir(testDir, { recursive});
    process.chdir(testDir);

    // Initialize test context
    testContext = {
      testDir,
      dbPath: path.join(testDir, '.hive-mind', 'hive.db'),
      db};
});
afterEach(async (): Promise<void> => {
  // Close database connection if open
  if (testContext.db?.open) {
    testContext.db.close();
    testContext.db = null;
  //   }
  // Clean up test directory
  process.chdir(os.tmpdir());
// // await fs.rm(testContext.testDir, { recursive, force});
});
describe('Database Initialization via Init Command', () => {
  /**
   * Verifies that the init command creates database with correct schema
   */
  it('should create database with correct schema through init command', async (): Promise<void> => {
    // Execute init command to create database
    execSync('node /home/mhugo/code/claude-zen/src/cli/cli-main.js init', {
        cwd);
  // Verify database file creation
// const _dbExists = awaitfs;
access(testContext.dbPath)
then(() => true)
catch(() => false)
  expect(dbExists).toBe(true)
  // Open database and validate schema
  testContext.db = new Database(testContext.dbPath)
  // Verify agents table exists with correct structure
  const _tableInfo = testContext.db;
prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='agents'")
get() as SqliteMasterEntry | undefined
  expect(tableInfo).toBeDefined() {}
  expect(tableInfo?.sql).toContain('CREATE TABLE')
  expect(tableInfo?.sql).toContain('agents')
  // Critical validation: ensure role column allows NULL values
  const _columns = testContext.db.prepare('PRAGMA table_info(agents)').all() as ColumnInfo[];
  const _roleColumn = columns.find((col) => col.name === 'role');
  expect(roleColumn).toBeDefined();
  expect(roleColumn?.notnull).toBe(0); // 0 means NULL allowed, 1 means NOT NULL
});
/**
 * Tests agent insertion without role value (should succeed)
 */
it('should allow inserting agents without role value', async (): Promise<void> => {
  // Initialize database through init command
  execSync('node /home/mhugo/code/claude-zen/src/cli/cli-main.js init', {
        cwd);
testContext.db = new Database(testContext.dbPath);
// Create required swarm for foreign key constraint
const _swarmId = `test-swarm-${Date.now()}`;
testContext.db;
prepare(`
INSERT
INTO
swarms(id, name, objective, topology, status)
VALUES(?, ?, ?, ?, ?)
`)`
run(swarmId, 'Test Swarm', 'Test Objective', 'mesh', 'active')
// Attempt to insert agent without role - this should succeed
const _agentId = `;`
test - agent - $;
// {
  Date.now();
// }
`;`
const _insertAgent = () => {
  testContext.db;
  ?.prepare(`
  INSERT
  INTO;
  agents(id, swarm_id, name, type, status);
  VALUES(?, ?, ?, ?, ?);
  `);`
run(agentId, swarmId, 'Test Agent', 'worker', 'active');
      };

      // Verify insertion succeeds
      expect(insertAgent).not.toThrow();

      // Validate agent record
      const _agent = testContext.db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as;
        | { id, role: string | null }
        | undefined;

      expect(agent).toBeDefined();
      expect(agent?.id).toBe(agentId);
      expect(agent?.role).toBeNull(); // Role should be NULL when not provided
    });

    /**
     * Tests agent insertion with role value (should succeed)
     */
    it('should allow inserting agents with role value', async (): Promise<void> => {
      // Initialize database
      execSync('node /home/mhugo/code/claude-zen/src/cli/cli-main.js init', {
        cwd);

      testContext.db = new Database(testContext.dbPath);

      // Create required swarm
      const _swarmId = `;`
  test - swarm - \$;
  Date.now();
  `;`
      testContext.db;
prepare(`;`
  INSERT;
  INTO;
  swarms(id, name, objective, topology, status);
  VALUES(?, ?, ?, ?, ?);
  `);`
run(swarmId, 'Test Swarm', 'Test Objective', 'mesh', 'active');

      // Insert agent with role
      const _agentId = `;`
  test - agent - \$;
  Date.now();
  `;`
      testContext.db;
prepare(`;`
  INSERT;
  INTO;
  agents(id, swarm_id, name, type, role, status);
  VALUES(?, ?, ?, ?, ?, ?);
  `);`
run(agentId, swarmId, 'Test Agent', 'coordinator', 'leader', 'active');

      // Verify agent insertion with role
      const _agent = testContext.db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as;
        | { id, role}
        | undefined;

      expect(agent).toBeDefined();
      expect(agent?.id).toBe(agentId);
      expect(agent?.role).toBe('leader');
    });
  });

  describe('Direct Database Schema Tests', () => {
    /**
     * Validates direct database schema creation
     */
    it('should create agents table with nullable role column', async (): Promise<void> => {
      // Create database directory structure
// await fs.mkdir(path.join(testContext.testDir, '.hive-mind'), { recursive});
      testContext.db = new Database(testContext.dbPath);

      // Create schema matching init command behavior
      testContext.db.exec(`;`
  CREATE;
  TABLE;
  IF;
  NOT;
  EXISTS;
  swarms (;
  id;
  TEXT;
  PRIMARY;
  KEY,
  name;
  TEXT;
  NOT;
  NULL,
  objective;
  TEXT,
  topology;
  TEXT;
  DEFAULT;
  'mesh',
  status;
  TEXT;
  DEFAULT;
  'active',
  created_at;
  DATETIME;
  DEFAULT;
  CURRENT_TIMESTAMP;
  //   )
CREATE
TABLE
IF
NOT
EXISTS
  agents (
  id;
  TEXT;
  PRIMARY;
  KEY,
  swarm_id;
  TEXT,
  name;
  TEXT;
  NOT;
  NULL,
  //   type TEXT NOT
  NULL,
  role;
  TEXT,
  capabilities;
  TEXT,
  status;
  TEXT;
  DEFAULT;
  'active',
  performance_score;
  REAL;
  DEFAULT;
  0.5,
  created_at;
  DATETIME;
  DEFAULT;
  CURRENT_TIMESTAMP,
  FOREIGN;
  KEY(swarm_id);
  REFERENCES;
  swarms(id);
  //   )
`)`
  // Validate schema structure
  const _columns = testContext.db.prepare('PRAGMA table_info(agents)').all() as ColumnInfo[];
  const _roleColumn = columns.find((col) => col.name === 'role');
  expect(roleColumn).toBeDefined();
  expect(roleColumn?.type).toBe('TEXT');
  expect(roleColumn?.notnull).toBe(0); // Must allow NULL
  expect(roleColumn?.dflt_value).toBeNull(); // No default value
};
// )
/**
 * Tests schema migration from NOT NULL to nullable role column
 */
it('should handle schema migration from NOT NULL to nullable', async (): Promise<void> =>
// {
  // Create database directory
// await fs.mkdir(path.join(testContext.testDir, '.hive-mind'), { recursive});
  // Create database with problematic schema (role NOT NULL)
  testContext.db = new Database(testContext.dbPath);
  testContext.db.exec(`;`
CREATE;
TABLE;
IF;
NOT;
EXISTS;
swarms (;
id;
TEXT;
PRIMARY;
KEY,
name;
TEXT;
NOT;
NULL,
objective;
TEXT,
topology;
TEXT;
DEFAULT;
'mesh',
status;
TEXT;
DEFAULT;
'active',
created_at;
DATETIME;
DEFAULT;
CURRENT_TIMESTAMP;
// )
CREATE;
TABLE;
IF;
NOT;
EXISTS;
agents (;
id;
TEXT;
PRIMARY;
KEY,
swarm_id;
TEXT,
name;
TEXT;
NOT;
NULL,
// type TEXT NOT
NULL,
role;
TEXT;
NOT;
NULL, --Problematic;
constraint;
status;
TEXT;
DEFAULT;
'idle',
capabilities;
TEXT,
created_at;
DATETIME;
DEFAULT;
CURRENT_TIMESTAMP,
FOREIGN;
KEY(swarm_id);
REFERENCES;
swarms(id);
// )
`);`
  // Close database to simulate migration scenario
  testContext.db.close();
  testContext.db = null;
  // Run init command with force flag for migration
  execSync('node /home/mhugo/code/claude-zen/src/cli/cli-main.js init --force', {
        cwd: testContext.testDir,
  stdio: 'pipe',
..process.env
})
// Reopen and verify migration success
testContext.db = new Database(testContext.dbPath)
// Test that we can now insert without role
const _swarmId = `;`
test - swarm - $;
// {
  Date.now();
// }
`;`
testContext.db;
prepare(`
INSERT
INTO
swarms(id, name, objective, topology, status)
VALUES(?, ?, ?, ?, ?)
`)`
run(swarmId, 'Test Swarm', 'Test Objective', 'mesh', 'active')
const _agentId = `;`
test - agent - $;
// {
  Date.now();
// }
`;`
const _insertAgent = () => {
        testContext.db;
          ?.prepare(`;`
INSERT;
INTO;
agents(id, swarm_id, name, type, status);
VALUES(?, ?, ?, ?, ?);
`);`
run(agentId, swarmId, 'Test Agent', 'worker', 'active');
      };

      // Migration should have fixed the constraint
      expect(insertAgent).not.toThrow();
    });
  });

  describe('Schema Consistency Tests', () => {
    /**
     * Validates schema consistency across different creation paths
     */
    it('should have consistent schema across all database creation paths', async (): Promise<void> => {
      // Test schema from init command
      execSync('node /home/mhugo/code/claude-zen/src/cli/cli-main.js init', {
        cwd);

      testContext.db = new Database(testContext.dbPath);

      // Get schema information
      const _initSchema = testContext.db;
prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='agents'");
get() as SqliteMasterEntry | undefined;

      const _initColumns = testContext.db.prepare('PRAGMA table_info(agents)').all() as ColumnInfo[];

      testContext.db.close();
      testContext.db = null;

      // Clean up for isolation
// // await fs.rm(path.join(testContext.testDir, '.hive-mind'), { recursive, force});
      // Validate critical schema requirements
      const _roleColumn = initColumns.find((col) => col.name === 'role');
      expect(roleColumn?.notnull).toBe(0); // Must allow NULL

      // Verify required columns exist
      const _requiredColumns = ['id', 'swarm_id', 'name', 'type', 'status'];
      requiredColumns.forEach((colName) => {
        const _column = initColumns.find((col) => col.name === colName);
        expect(column).toBeDefined();
      });

      // Validate schema SQL structure
      expect(initSchema?.sql).toBeDefined();
      expect(initSchema?.sql).toContain('CREATE TABLE');
      expect(initSchema?.sql).toContain('agents');
    });
  });
});

}}}}