/**
 * @fileoverview Database Domain Types - Single Source of Truth
 *
 * All database-related types, interfaces, and type definitions.
 * Following Google TypeScript style guide and domain architecture standard.
 */

// Re-export core entity types
export type {
  ADREntity,
  BaseDocumentEntity,
  BaseEntity,
  CodeSnippetEntity,
  CompetitorAnalysisEntity,
  EpicEntity,
  ExecutionPlanEntity,
  FeatureEntity,
  ProductRequirementDocumentEntity,
  ProductVisionEntity,
  ProjectTemplateEntity,
  QueryResultEntity,
  RiskAssessmentEntity,
  StakeholderEntity,
  SWOTAnalysisEntity,
  TaskEntity,
  TestCaseEntity,
  UserStoryEntity,
  WorkflowRunEntity,
  WorkflowStepEntity,
} from './entities/product-entities.ts';

// Re-export database configuration types
export interface DatabaseConfig {
  readonly type: 'sqlite' | 'postgresql' | 'mysql';
  readonly host?: string;
  readonly port?: number;
  readonly database: string;
  readonly username?: string;
  readonly password?: string;
  readonly schema?: string;
  readonly ssl?: boolean;
  readonly maxConnections?: number;
  readonly connectionTimeout?: number;
}

// Database connection interface
export interface DatabaseConnection {
  readonly isConnected: boolean;
  readonly config: DatabaseConfig;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number }>;
  transaction<T>(
    callback: (conn: DatabaseConnection) => Promise<T>
  ): Promise<T>;
}

// Database manager interfaces
export interface DatabaseManager {
  readonly connection: DatabaseConnection;
  initialize(): Promise<void>;
  health(): Promise<DatabaseHealthStatus>;
  migrate(version?: string): Promise<void>;
  backup(path: string): Promise<void>;
  restore(path: string): Promise<void>;
}

// Document manager types
export interface DocumentManagerConfig {
  readonly connection: DatabaseConnection;
  readonly enableVersioning?: boolean;
  readonly enableSearch?: boolean;
  readonly maxDocumentSize?: number;
  readonly compressionEnabled?: boolean;
}

export interface DocumentSearchOptions {
  readonly query?: string;
  readonly type?: string;
  readonly status?: string;
  readonly tags?: readonly string[];
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: 'created_at' | 'updated_at' | 'title' | 'type';
  readonly sortOrder?: 'asc' | 'desc';
}

export interface DocumentSearchResult<T = BaseDocumentEntity> {
  readonly items: readonly T[];
  readonly total: number;
  readonly offset: number;
  readonly limit: number;
  readonly hasMore: boolean;
}

// Database operation types
export interface DatabaseOperationResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly rowsAffected?: number;
  readonly executionTime?: number;
}

export interface BulkOperationResult<T = unknown> {
  readonly success: boolean;
  readonly results: readonly DatabaseOperationResult<T>[];
  readonly totalProcessed: number;
  readonly successCount: number;
  readonly errorCount: number;
  readonly executionTime?: number;
}

// Database health and monitoring
export interface DatabaseHealthStatus {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly connection: boolean;
  readonly latency: number;
  readonly activeConnections: number;
  readonly maxConnections: number;
  readonly lastHealthCheck: string;
  readonly errors?: readonly string[];
}

export interface DatabaseMetrics {
  readonly connections: {
    active: number;
    idle: number;
    total: number;
    maxAllowed: number;
  };
  readonly performance: {
    averageQueryTime: number;
    slowQueries: number;
    queriesPerSecond: number;
  };
  readonly storage: {
    totalSize: number;
    availableSpace: number;
    tableCount: number;
    indexCount: number;
  };
}

// Migration types
export interface DatabaseMigration {
  readonly version: string;
  readonly description: string;
  readonly timestamp: string;
  readonly checksum: string;
  up(): Promise<void>;
  down(): Promise<void>;
}

export interface MigrationStatus {
  readonly currentVersion: string;
  readonly availableMigrations: readonly string[];
  readonly appliedMigrations: readonly string[];
  readonly pendingMigrations: readonly string[];
}

// Query builder types
export type QueryOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'LIKE'
  | 'IN'
  | 'NOT IN';

export interface QueryCondition {
  readonly field: string;
  readonly operator: QueryOperator;
  readonly value: unknown;
}

export interface QueryOptions {
  readonly select?: readonly string[];
  readonly where?: readonly QueryCondition[];
  readonly orderBy?: readonly { field: string; direction: 'ASC' | 'DESC' }[];
  readonly limit?: number;
  readonly offset?: number;
  readonly joins?: readonly {
    table: string;
    on: string;
    type?: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  }[];
}

// Transaction types
export interface TransactionContext {
  readonly id: string;
  readonly startTime: string;
  readonly isolation:
    | 'READ_UNCOMMITTED'
    | 'READ_COMMITTED'
    | 'REPEATABLE_READ'
    | 'SERIALIZABLE';
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// Error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class MigrationError extends DatabaseError {
  constructor(
    message: string,
    public readonly migrationVersion?: string
  ) {
    super(message, 'MIGRATION_ERROR');
    this.name = 'MigrationError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(
    message: string,
    public readonly connectionConfig?: Partial<DatabaseConfig>
  ) {
    super(message, 'CONNECTION_ERROR');
    this.name = 'ConnectionError';
  }
}

export class QueryError extends DatabaseError {
  constructor(
    message: string,
    public readonly query?: string,
    public readonly parameters?: unknown[]
  ) {
    super(message, 'QUERY_ERROR');
    this.name = 'QueryError';
  }
}

// Utility types
export type EntityType =
  | 'vision'
  | 'prd'
  | 'epic'
  | 'feature'
  | 'task'
  | 'adr'
  | 'user-story'
  | 'test-case'
  | 'code-snippet'
  | 'workflow-run'
  | 'workflow-step'
  | 'swot-analysis'
  | 'stakeholder'
  | 'risk-assessment'
  | 'project-template'
  | 'competitor-analysis';

export type EntityStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'archived'
  | 'deprecated';

export type EntityPriority = 'low' | 'medium' | 'high' | 'critical';

// Event types for database operations
export interface DatabaseEvent {
  readonly type:
    | 'created'
    | 'updated'
    | 'deleted'
    | 'migrated'
    | 'connected'
    | 'disconnected';
  readonly entityType?: EntityType;
  readonly entityId?: string;
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}

// Backup and restore types
export interface BackupOptions {
  readonly path: string;
  readonly includeData?: boolean;
  readonly includeSchema?: boolean;
  readonly compression?: 'none' | 'gzip' | 'lz4';
  readonly encryption?: boolean;
  readonly metadata?: Record<string, unknown>;
}

export interface RestoreOptions {
  readonly path: string;
  readonly skipExisting?: boolean;
  readonly validateChecksum?: boolean;
  readonly dryRun?: boolean;
}

export interface BackupMetadata {
  readonly version: string;
  readonly timestamp: string;
  readonly size: number;
  readonly checksum: string;
  readonly compression: string;
  readonly encrypted: boolean;
  readonly entityCounts: Record<EntityType, number>;
}
