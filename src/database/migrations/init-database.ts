/**
 * Database Initialization System
 * 
 * Initializes the claude-code-zen database with all required schemas for
 * Vision/ADR/PRD/Epic/Feature/Task entities and AGUI workflow integration.
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { DATABASE_SCHEMAS } from '../entities/document-entities.js';

export interface DatabaseConfig {
  databasePath: string;
  enableWAL?: boolean;
  enableForeignKeys?: boolean;
  busyTimeout?: number;
  verbose?: boolean;
}

export class DatabaseInitializer {
  private db: Database.Database;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    
    // Ensure database directory exists
    const dbDir = config.databasePath.substring(0, config.databasePath.lastIndexOf('/'));
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(config.databasePath, {
      verbose: config.verbose ? console.log : undefined
    });

    this.setupDatabase();
  }

  /**
   * Setup database with optimal configuration
   */
  private setupDatabase(): void {
    // Enable WAL mode for better concurrency
    if (this.config.enableWAL !== false) {
      this.db.pragma('journal_mode = WAL');
    }

    // Enable foreign keys
    if (this.config.enableForeignKeys !== false) {
      this.db.pragma('foreign_keys = ON');
    }

    // Set busy timeout
    this.db.pragma(`busy_timeout = ${this.config.busyTimeout || 30000}`);

    // Optimize performance
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = -64000'); // 64MB cache
    this.db.pragma('temp_store = MEMORY');
    this.db.pragma('mmap_size = 134217728'); // 128MB mmap
  }

  /**
   * Initialize database with all required schemas
   */
  async initializeSchemas(): Promise<void> {
    const transaction = this.db.transaction(() => {
      // Create all tables in correct dependency order
      console.log('🔧 Creating projects table...');
      this.db.exec(DATABASE_SCHEMAS.projects);

      console.log('🔧 Creating documents table...');
      this.db.exec(DATABASE_SCHEMAS.documents);

      console.log('🔧 Creating document_relationships table...');
      this.db.exec(DATABASE_SCHEMAS.document_relationships);

      console.log('🔧 Creating document_workflow_states table...');
      this.db.exec(DATABASE_SCHEMAS.document_workflow_states);

      console.log('🔧 Creating document_search_index table...');
      this.db.exec(DATABASE_SCHEMAS.document_search_index);

      console.log('🔧 Creating sparc_integration_state table...');
      this.db.exec(DATABASE_SCHEMAS.sparc_integration_state);

      // Create additional indexes for performance
      this.createAdditionalIndexes();

      // Create triggers for automatic updates
      this.createTriggers();
    });

    transaction();
    console.log('✅ Database schemas initialized successfully');
  }

  /**
   * Create additional performance indexes
   */
  private createAdditionalIndexes(): void {
    const additionalIndexes = [
      // Document full-text search indexes
      'CREATE INDEX IF NOT EXISTS idx_documents_title_fts ON documents(title)',
      'CREATE INDEX IF NOT EXISTS idx_documents_content_search ON documents(searchable_content)',
      'CREATE INDEX IF NOT EXISTS idx_documents_keywords ON documents(keywords)',
      
      // ADR-specific indexes
      'CREATE INDEX IF NOT EXISTS idx_documents_adr_number ON documents(json_extract(adr_data, "$.decision_number")) WHERE type = "adr"',
      'CREATE INDEX IF NOT EXISTS idx_documents_adr_status ON documents(json_extract(adr_data, "$.decision_status")) WHERE type = "adr"',
      
      // Vision document indexes
      'CREATE INDEX IF NOT EXISTS idx_documents_vision_timeline ON documents(json_extract(vision_data, "$.timeline.target_completion")) WHERE type = "vision"',
      
      // Feature and task indexes
      'CREATE INDEX IF NOT EXISTS idx_documents_implementation_status ON documents(json_extract(feature_data, "$.implementation_status")) WHERE type = "feature"',
      'CREATE INDEX IF NOT EXISTS idx_documents_sparc_phase ON documents(json_extract(feature_data, "$.sparc_implementation.current_sparc_phase")) WHERE type = "feature"',
      
      // Search optimization indexes
      'CREATE INDEX IF NOT EXISTS idx_search_combined ON document_search_index(document_type, status, priority)',
      'CREATE INDEX IF NOT EXISTS idx_search_sparc_combined ON document_search_index(uses_sparc_methodology, sparc_phase, sparc_progress)',
      
      // Performance indexes for relationships
      'CREATE INDEX IF NOT EXISTS idx_relationships_combined ON document_relationships(relationship_type, source_document_id, target_document_id)',
    ];

    for (const indexSql of additionalIndexes) {
      this.db.exec(indexSql);
    }
  }

  /**
   * Create database triggers for automatic updates
   */
  private createTriggers(): void {
    // Trigger to update document updated_at timestamp
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_document_timestamp 
      AFTER UPDATE ON documents
      BEGIN
        UPDATE documents 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
      END;
    `);

    // Trigger to update workflow state timestamp
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_workflow_timestamp 
      AFTER UPDATE ON document_workflow_states
      BEGIN
        UPDATE document_workflow_states 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
      END;
    `);

    // Trigger to automatically update search index when document changes
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_search_index_on_document_change
      AFTER UPDATE ON documents
      BEGIN
        UPDATE document_search_index 
        SET 
          updated_date = CURRENT_TIMESTAMP,
          keywords = NEW.keywords,
          tags = NEW.tags,
          status = NEW.status,
          priority = NEW.priority,
          author = NEW.author
        WHERE document_id = NEW.id;
      END;
    `);

    // Trigger to update project timestamps
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_project_timestamp 
      AFTER UPDATE ON projects
      BEGIN
        UPDATE projects 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
      END;
    `);
  }

  /**
   * Seed database with initial data required for operation
   */
  async seedInitialData(): Promise<void> {
    const transaction = this.db.transaction(() => {
      // Create the Architecture Decisions project
      const architectureProjectId = 'arch-project-' + Date.now();
      
      this.db.prepare(`
        INSERT OR IGNORE INTO projects (
          id, name, description, domain, complexity, author,
          created_at, updated_at, phase, overall_progress_percentage,
          vision_document_ids, adr_document_ids, prd_document_ids,
          epic_document_ids, feature_document_ids, task_document_ids,
          tags, stakeholders
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        architectureProjectId,
        'Architecture Decisions',
        'Architecture Decision Records (ADRs) for Claude-Zen system',
        'architecture',
        'enterprise',
        'claude-zen-system',
        new Date().toISOString(),
        new Date().toISOString(),
        'implementation',
        85,
        JSON.stringify([]), // vision_document_ids
        JSON.stringify([]), // adr_document_ids
        JSON.stringify([]), // prd_document_ids
        JSON.stringify([]), // epic_document_ids
        JSON.stringify([]), // feature_document_ids
        JSON.stringify([]), // task_document_ids
        JSON.stringify(['architecture', 'adr', 'decisions']),
        JSON.stringify(['architecture-team', 'developers', 'stakeholders'])
      );

      // Create initial ADR template document
      const templateAdrId = 'adr-template-' + Date.now();
      
      this.db.prepare(`
        INSERT OR IGNORE INTO documents (
          id, type, title, content, status, priority, author,
          project_id, tags, keywords, searchable_content,
          version, checksum, workflow_stage, completion_percentage,
          adr_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        templateAdrId,
        'adr',
        'ADR-000: Architecture Decision Record Template',
        `# ADR-000: Architecture Decision Record Template

## Status
**TEMPLATE**

## Context
This is the template for Architecture Decision Records in the Claude-Zen system.

## Decision
Use this template structure for all ADRs to ensure consistency and completeness.

## Consequences
- Standardized ADR format across the system
- Better decision tracking and documentation
- Improved architectural governance

---
**Decision Date**: ${new Date().toISOString().split('T')[0]}
**Author**: claude-zen-system
**Stakeholders**: architecture-team, developers`,
        'approved',
        'high',
        'claude-zen-system',
        architectureProjectId,
        JSON.stringify(['template', 'adr', 'architecture']),
        JSON.stringify(['architecture', 'decision', 'template', 'adr', 'governance']),
        'ADR-000 Architecture Decision Record Template template adr architecture',
        '1.0.0',
        'template-checksum-000',
        'complete',
        100,
        JSON.stringify({
          decision_number: 0,
          decision_status: 'accepted',
          context: 'This is the template for Architecture Decision Records in the Claude-Zen system.',
          decision: 'Use this template structure for all ADRs to ensure consistency and completeness.',
          consequences: [
            'Standardized ADR format across the system',
            'Better decision tracking and documentation',
            'Improved architectural governance'
          ],
          alternatives_considered: []
        }),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // Create corresponding search index entry
      this.db.prepare(`
        INSERT OR IGNORE INTO document_search_index (
          document_id, document_type, project_id, keywords, tags,
          status, priority, author, created_date, updated_date,
          search_rank, access_count, uses_sparc_methodology,
          parent_documents, child_documents, related_documents
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        templateAdrId,
        'adr',
        architectureProjectId,
        JSON.stringify(['architecture', 'decision', 'template', 'adr', 'governance']),
        JSON.stringify(['template', 'adr', 'architecture']),
        'approved',
        'high',
        'claude-zen-system',
        new Date().toISOString(),
        new Date().toISOString(),
        10.0, // High search rank for template
        0,
        false,
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([])
      );

      console.log('✅ Seeded initial data: Architecture project and ADR template');
    });

    transaction();
  }

  /**
   * Verify database integrity and schemas
   */
  async verifyDatabase(): Promise<{ valid: boolean; tables: string[]; errors: string[] }> {
    const errors: string[] = [];
    const tables: string[] = [];

    try {
      // Check if all expected tables exist
      const expectedTables = [
        'projects',
        'documents', 
        'document_relationships',
        'document_workflow_states',
        'document_search_index',
        'sparc_integration_state'
      ];

      const result = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `).all() as { name: string }[];

      const actualTables = result.map(row => row.name);
      tables.push(...actualTables);

      for (const expectedTable of expectedTables) {
        if (!actualTables.includes(expectedTable)) {
          errors.push(`Missing table: ${expectedTable}`);
        }
      }

      // Test basic operations
      try {
        this.db.prepare('SELECT 1 FROM projects LIMIT 1').get();
      } catch (err) {
        errors.push(`Projects table not accessible: ${err}`);
      }

      try {
        this.db.prepare('SELECT 1 FROM documents LIMIT 1').get();
      } catch (err) {
        errors.push(`Documents table not accessible: ${err}`);
      }

      // Check foreign key constraints
      const pragmaResult = this.db.pragma('foreign_key_check');
      if (pragmaResult.length > 0) {
        errors.push('Foreign key constraint violations detected');
      }

    } catch (err) {
      errors.push(`Database verification error: ${err}`);
    }

    return {
      valid: errors.length === 0,
      tables,
      errors
    };
  }

  /**
   * Get database statistics
   */
  getStatistics(): {
    totalTables: number;
    totalProjects: number;
    totalDocuments: number;
    documentsByType: Record<string, number>;
    databaseSize: number;
  } {
    const tableCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'
    `).get() as { count: number };

    const projectCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM projects
    `).get() as { count: number };

    const documentCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM documents
    `).get() as { count: number };

    const documentsByType = this.db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM documents 
      GROUP BY type
    `).all() as { type: string; count: number }[];

    const documentTypeMap: Record<string, number> = {};
    for (const item of documentsByType) {
      documentTypeMap[item.type] = item.count;
    }

    // Get database file size
    const dbStat = this.db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get() as { size: number };

    return {
      totalTables: tableCount.count,
      totalProjects: projectCount.count,
      totalDocuments: documentCount.count,
      documentsByType: documentTypeMap,
      databaseSize: dbStat.size
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

/**
 * Default database initialization function
 */
export async function initializeDatabase(databasePath?: string): Promise<DatabaseInitializer> {
  const defaultPath = databasePath || join(process.cwd(), 'data', 'claude-zen.db');
  
  console.log(`🔧 Initializing claude-code-zen database at: ${defaultPath}`);
  
  const initializer = new DatabaseInitializer({
    databasePath: defaultPath,
    enableWAL: true,
    enableForeignKeys: true,
    busyTimeout: 30000,
    verbose: false
  });

  await initializer.initializeSchemas();
  await initializer.seedInitialData();

  const verification = await initializer.verifyDatabase();
  if (!verification.valid) {
    console.error('❌ Database verification failed:', verification.errors);
    throw new Error('Database initialization failed verification');
  }

  const stats = initializer.getStatistics();
  console.log('📊 Database Statistics:', {
    tables: stats.totalTables,
    projects: stats.totalProjects,
    documents: stats.totalDocuments,
    types: stats.documentsByType,
    size: `${(stats.databaseSize / 1024 / 1024).toFixed(2)} MB`
  });

  console.log('✅ Database initialization complete!');
  
  return initializer;
}

export default DatabaseInitializer;