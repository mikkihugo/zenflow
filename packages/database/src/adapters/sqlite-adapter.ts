/**
 * Real SQLite Database Adapter
 *
 * Real SQLite adapter using better-sqlite3 for structured document storage
 */

import 'reflect-metadata';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getLogger } from '@claude-zen/foundation';
import { injectable } from '@claude-zen/foundation';

const logger = getLogger('sqlite-adapter');

export interface SQLiteConfig {
  type: 'sqlite';
  database: string;
  options?: {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
  };
}

import type { DatabaseAdapter } from '../interfaces.js';

export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database | null = null;
  private config: SQLiteConfig;
  private connected = false;

  constructor(config: SQLiteConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      // Ensure directory exists
      const dbDir = dirname(this.config.database);
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }

      // Create real SQLite database connection
      this.db = new Database(this.config.database, {
        readonly: this.config.options?.readonly || false,
        fileMustExist: this.config.options?.fileMustExist || false,
        timeout: this.config.options?.timeout || 5000,
      });

      // Initialize database with required tables
      this.initializeTables();

      this.connected = true;

      logger.info(
        `✅ Connected to real SQLite database: ${this.config.database}`
      );
    } catch (error) {
      logger.error(`❌ Failed to connect to SQLite database: ${error}`);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.connected = false;
    }
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.connected) await this.connect();
    if (!this.db) throw new Error('Database not connected');

    logger.debug(`Executing SQL query: ${sql}`, { params });

    try {
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(...params);

      return {
        rows: rows || [],
        rowCount: rows ? rows.length : 0,
        fields: [],
        executionTime: 1,
      };
    } catch (error) {
      logger.error(`Query failed: ${error}`);
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<any> {
    if (!this.connected) await this.connect();
    if (!this.db) throw new Error('Database not connected');

    logger.debug(`Executing SQL command: ${sql}`, { params });

    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);

      return {
        affectedRows: result.changes || 0,
        insertId: result.lastInsertRowid || null,
        executionTime: 1,
      };
    } catch (error) {
      logger.error(`Execute failed: ${error}`);
      throw error;
    }
  }

  async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    if (!this.connected) await this.connect();
    if (!this.db) throw new Error('Database not connected');

    const transaction = this.db.transaction((callback: any) => {
      return callback();
    });

    const tx = {
      query: this.query.bind(this),
      execute: this.execute.bind(this),
    };

    try {
      return await transaction(() => fn(tx));
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  async health(): Promise<boolean> {
    if (!this.connected || !this.db) return false;

    try {
      this.db.prepare('SELECT 1').get();
      return true;
    } catch {
      return false;
    }
  }

  async getSchema(): Promise<any> {
    if (!this.connected || !this.db) return { tables: [], views: [] };

    try {
      const tables = this.db
        .prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `)
        .all();

      return {
        tables: tables.map((t: any) => t.name),
        views: [],
      };
    } catch (error) {
      logger.error('Failed to get schema:', error);
      return { tables: [], views: [] };
    }
  }

  async getConnectionStats(): Promise<any> {
    return {
      total: 1,
      active: this.connected ? 1 : 0,
      idle: this.connected ? 0 : 1,
      utilization: this.connected ? 100 : 0,
    };
  }

  private initializeTables(): void {
    if (!this.db) return;

    // Create documents table
    this.db.exec(`
      CREATE TABLE F NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        priority TEXT DEFAULT 'medium',
        author TEXT,
        project_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        searchable_content TEXT,
        keywords TEXT,
        completion_percentage NTEGER DEFAULT 0,
        name TEXT,
        description TEXT,
        domain TEXT,
        complexity TEXT,
        tags TEXT,
        stakeholders TEXT,
        vision_document_ids TEXT,
        adr_document_ids TEXT,
        prd_document_ids TEXT,
        epic_document_ids TEXT,
        feature_document_ids TEXT,
        task_document_ids TEXT,
        overall_progress_percentage NTEGER DEFAULT 0,
        phase TEXT,
        sparc_integration TEXT
      )
    `);

    // Create document_relationships table
    this.db.exec(`
      CREATE TABLE F NOT EXISTS document_relationships (
        id TEXT PRIMARY KEY,
        source_document_id TEXT NOT NULL,
        target_document_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        strength REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (source_document_id) REFERENCES documents(id),
        FOREIGN KEY (target_document_id) REFERENCES documents(id)
      )
    `);

    // Create projects table
    this.db.exec(`
      CREATE TABLE F NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        domain TEXT NOT NULL,
        complexity TEXT DEFAULT 'moderate',
        author TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create document_workflow_states table
    this.db.exec(`
      CREATE TABLE F NOT EXISTS document_workflow_states (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        workflow_name TEXT NOT NULL,
        current_stage TEXT NOT NULL,
        stages_completed TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id)
      )
    `);

    // Run migrations to add missing columns to existing tables
    this.runMigrations();

    logger.info('✅ SQLite tables initialized');
  }

  /**
   * Run database migrations to add missing columns
   */
  private runMigrations(): void {
    if (!this.db) return;

    try {
      // Check if searchable_content column exists
      const tableInfo = this.db.prepare('PRAGMA table_info(documents)').all();
      const hasSearchableContent = tableInfo.some(
        (col: any) => col.name === 'searchable_content'
      );

      if (!hasSearchableContent) {
        logger.info(
          'Adding missing searchable_content column to documents table'
        );
        this.db
          .prepare('ALTER TABLE documents ADD COLUMN searchable_content TEXT')
          .run();
      }

      // Check for other missing columns
      const columnChecks = [
        { name: 'keywords', type: 'TEXT' },
        { name: 'completion_percentage', type: 'NTEGER DEFAULT 0' },
        { name: 'name', type: 'TEXT' },
        { name: 'description', type: 'TEXT' },
        { name: 'domain', type: 'TEXT' },
        { name: 'complexity', type: 'TEXT' },
        { name: 'tags', type: 'TEXT' },
        { name: 'stakeholders', type: 'TEXT' },
        { name: 'vision_document_ids', type: 'TEXT' },
        { name: 'adr_document_ids', type: 'TEXT' },
        { name: 'prd_document_ids', type: 'TEXT' },
        { name: 'epic_document_ids', type: 'TEXT' },
        { name: 'feature_document_ids', type: 'TEXT' },
        { name: 'task_document_ids', type: 'TEXT' },
        { name: 'overall_progress_percentage', type: 'NTEGER DEFAULT 0' },
        { name: 'phase', type: 'TEXT' },
        { name: 'sparc_integration', type: 'TEXT' },
      ];

      for (const column of columnChecks) {
        const hasColumn = tableInfo.some(
          (col: any) => col.name === column.name
        );
        if (!hasColumn) {
          logger.info(
            `Adding missing ${column.name} column to documents table`
          );
          this.db
            .prepare(
              `ALTER TABLE documents ADD COLUMN ${column.name} ${column.type}`
            )
            .run();
        }
      }
    } catch (error) {
      logger.warn(`Migration warning (non-critical): ${error}`);
    }
  }
}
