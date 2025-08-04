/**
 * Database-Driven System Integration
 *
 * Central integration point for pure database-driven architecture
 * Replaces file-based operations with database entities throughout the system
 */

import { DatabaseDrivenSystem } from '../core/database-driven-system';
import { createLogger } from '../core/logger';
import { UnifiedMemorySystem } from '../core/unified-memory-system';
import { UnifiedWorkflowEngine } from '../core/unified-workflow-engine';
import { initializeWithDatabaseServices } from '../interfaces/mcp/advanced-tools-registry';
import type { DatabaseCoordinator } from './core/database-coordinator';
import { DatabaseFactory } from './index';
import { DocumentService } from './services/document-service';

const logger = createLogger('SystemIntegration');

export interface DatabaseDrivenSystemConfig {
  database: {
    engines: Array<{
      id: string;
      type: 'vector' | 'graph' | 'document' | 'relational' | 'timeseries';
      config: any;
    }>;
    coordination?: {
      healthCheckInterval?: number;
      defaultTimeout?: number;
      loadBalancing?: string;
    };
  };
  workflow: {
    maxConcurrentWorkflows?: number;
    stepTimeout?: number;
    enablePersistence?: boolean;
  };
  memory: {
    maxSize?: number;
    persistToDisk?: boolean;
    storageBackend?: string;
  };
}

/**
 * Integrated Database-Driven System Factory
 * Creates and configures the complete system architecture
 */
export class DatabaseDrivenSystemFactory {
  private static instance: DatabaseDrivenSystemFactory | null = null;
  private initialized = false;

  // Core components
  private databaseSystem: any = null;
  private coordinator: DatabaseCoordinator | null = null;
  private documentService: DocumentService | null = null;
  private workflowEngine: UnifiedWorkflowEngine | null = null;
  private memorySystem: UnifiedMemorySystem | null = null;
  private databaseDrivenSystem: DatabaseDrivenSystem | null = null;
  private mcpToolsManager: any = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseDrivenSystemFactory {
    if (!DatabaseDrivenSystemFactory.instance) {
      DatabaseDrivenSystemFactory.instance = new DatabaseDrivenSystemFactory();
    }
    return DatabaseDrivenSystemFactory.instance;
  }

  /**
   * Initialize complete database-driven system
   */
  async initialize(config: DatabaseDrivenSystemConfig): Promise<{
    databaseSystem: any;
    coordinator: DatabaseCoordinator;
    documentService: DocumentService;
    workflowEngine: UnifiedWorkflowEngine;
    memorySystem: UnifiedMemorySystem;
    databaseDrivenSystem: DatabaseDrivenSystem;
    mcpToolsManager: any;
  }> {
    if (this.initialized) {
      return this.getSystemComponents();
    }

    logger.info('🚀 Initializing Database-Driven System Architecture');

    try {
      // 1. Initialize database system with coordination
      this.databaseSystem = await DatabaseFactory.createAdvancedDatabaseSystem({
        engines: config.database.engines,
        coordination: config.database.coordination,
        optimization: { enabled: true, aggressiveness: 'medium' },
      });

      this.coordinator = this.databaseSystem.coordinator;
      logger.info('✅ Database coordinator initialized');

      // 2. Initialize document service
      this.documentService = new DocumentService(this.coordinator);
      await this.documentService.initialize();
      logger.info('✅ Document service initialized');

      // 3. Initialize memory system
      this.memorySystem = new UnifiedMemorySystem({
        maxSize: config.memory.maxSize || 1000,
        persistToDisk: config.memory.persistToDisk !== false,
        storageBackend: config.memory.storageBackend || 'database',
      });
      await this.memorySystem.initialize();
      logger.info('✅ Memory system initialized');

      // 4. Initialize workflow engine with database operations
      this.workflowEngine = new UnifiedWorkflowEngine(this.memorySystem, this.documentService, {
        maxConcurrentWorkflows: config.workflow.maxConcurrentWorkflows || 10,
        stepTimeout: config.workflow.stepTimeout || 300000,
        enablePersistence: config.workflow.enablePersistence !== false,
        workspaceRoot: './',
        templatesPath: './templates',
        outputPath: './output',
        defaultTimeout: 300000,
        enableMetrics: true,
        storageBackend: { type: 'database', config: {} },
      });
      await this.workflowEngine.initialize();
      logger.info('✅ Workflow engine initialized');

      // 5. Initialize database-driven system (replaces DocumentDrivenSystem)
      this.databaseDrivenSystem = new DatabaseDrivenSystem(
        this.documentService,
        this.workflowEngine
      );
      await this.databaseDrivenSystem.initialize();
      logger.info('✅ Database-driven system initialized');

      // 6. Initialize MCP tools with database services
      this.mcpToolsManager = initializeWithDatabaseServices(
        this.documentService,
        this.workflowEngine
      );
      logger.info('✅ MCP tools manager initialized with database services');

      this.initialized = true;
      logger.info('🎉 Database-Driven System Architecture fully initialized');

      return this.getSystemComponents();
    } catch (error) {
      logger.error('❌ Failed to initialize database-driven system:', error);
      throw error;
    }
  }

  /**
   * Get system components
   */
  getSystemComponents(): {
    databaseSystem: any;
    coordinator: DatabaseCoordinator;
    documentService: DocumentService;
    workflowEngine: UnifiedWorkflowEngine;
    memorySystem: UnifiedMemorySystem;
    databaseDrivenSystem: DatabaseDrivenSystem;
    mcpToolsManager: any;
  } {
    if (
      !this.initialized ||
      !this.coordinator ||
      !this.documentService ||
      !this.workflowEngine ||
      !this.memorySystem ||
      !this.databaseDrivenSystem
    ) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    return {
      databaseSystem: this.databaseSystem,
      coordinator: this.coordinator,
      documentService: this.documentService,
      workflowEngine: this.workflowEngine,
      memorySystem: this.memorySystem,
      databaseDrivenSystem: this.databaseDrivenSystem,
      mcpToolsManager: this.mcpToolsManager,
    };
  }

  /**
   * Create a project workspace using database-driven system
   */
  async createProjectWorkspace(projectSpec: {
    name: string;
    domain: string;
    description: string;
    complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';
    author: string;
  }): Promise<string> {
    if (!this.databaseDrivenSystem) {
      throw new Error('System not initialized');
    }

    return await this.databaseDrivenSystem.createProjectWorkspace(projectSpec);
  }

  /**
   * Process document with database-driven workflow
   */
  async processDocument(workspaceId: string, documentData: any, options?: any): Promise<void> {
    if (!this.databaseDrivenSystem) {
      throw new Error('System not initialized');
    }

    await this.databaseDrivenSystem.processDocumentEntity(workspaceId, documentData, options);
  }

  /**
   * Get system health and status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    components: {
      database: any;
      documentService: boolean;
      workflowEngine: boolean;
      memorySystem: boolean;
      databaseDrivenSystem: boolean;
    };
    metrics: {
      uptime: number;
      totalDocuments: number;
      activeWorkflows: number;
      memoryUsage: number;
    };
  }> {
    if (!this.initialized) {
      return {
        status: 'critical',
        components: {
          database: { status: 'not_initialized' },
          documentService: false,
          workflowEngine: false,
          memorySystem: false,
          databaseDrivenSystem: false,
        },
        metrics: { uptime: 0, totalDocuments: 0, activeWorkflows: 0, memoryUsage: 0 },
      };
    }

    const databaseHealth = this.databaseSystem.getHealthReport();
    const workflowMetrics = await this.workflowEngine?.getWorkflowMetrics();
    const memoryStats = this.memorySystem?.getStats();

    const componentHealth = {
      database: databaseHealth,
      documentService: true,
      workflowEngine: true,
      memorySystem: true,
      databaseDrivenSystem: true,
    };

    const overallHealth =
      databaseHealth.overall === 'healthy'
        ? 'healthy'
        : databaseHealth.overall === 'warning'
          ? 'degraded'
          : 'critical';

    return {
      status: overallHealth,
      components: componentHealth,
      metrics: {
        uptime: process.uptime(),
        totalDocuments: 0, // Would query from document service
        activeWorkflows: workflowMetrics.running || 0,
        memoryUsage: memoryStats.memoryUsage || 0,
      },
    };
  }

  /**
   * Shutdown system gracefully
   */
  async shutdown(): Promise<void> {
    logger.info('🔄 Shutting down database-driven system...');

    try {
      if (this.workflowEngine) {
        // Cancel active workflows gracefully
        const activeWorkflows = await this.workflowEngine.getActiveWorkflows();
        for (const workflow of activeWorkflows) {
          await this.workflowEngine.pauseWorkflow(workflow.id);
        }
      }

      if (this.databaseSystem) {
        await this.databaseSystem.shutdown();
      }

      if (this.memorySystem) {
        await this.memorySystem.shutdown();
      }

      this.initialized = false;
      logger.info('✅ Database-driven system shutdown complete');
    } catch (error) {
      logger.error('❌ Error during system shutdown:', error);
      throw error;
    }
  }

  /**
   * Export workspace to files (optional compatibility feature)
   */
  async exportWorkspace(
    workspaceId: string,
    outputPath: string,
    format: 'markdown' | 'json' = 'markdown'
  ): Promise<string[]> {
    if (!this.databaseDrivenSystem) {
      throw new Error('System not initialized');
    }

    return await this.databaseDrivenSystem.exportWorkspaceToFiles(workspaceId, outputPath, format);
  }
}

/**
 * Default configuration for database-driven system
 */
export const DEFAULT_DATABASE_DRIVEN_CONFIG: DatabaseDrivenSystemConfig = {
  database: {
    engines: [
      {
        id: 'primary-db',
        type: 'relational',
        config: {
          dbPath: './data/claude-zen.db',
          type: 'sqlite',
        },
      },
      {
        id: 'vector-search',
        type: 'vector',
        config: {
          dbPath: './data/vectors.db',
          dimensions: 768,
        },
      },
    ],
    coordination: {
      healthCheckInterval: 30000,
      defaultTimeout: 30000,
      loadBalancing: 'performance_based',
    },
  },
  workflow: {
    maxConcurrentWorkflows: 10,
    stepTimeout: 300000,
    enablePersistence: true,
  },
  memory: {
    maxSize: 1000,
    persistToDisk: true,
    storageBackend: 'database',
  },
};

/**
 * Initialize complete database-driven system with default configuration
 */
export async function initializeDatabaseDrivenSystem(
  config: Partial<DatabaseDrivenSystemConfig> = {}
): Promise<DatabaseDrivenSystemFactory> {
  const factory = DatabaseDrivenSystemFactory.getInstance();
  const fullConfig = { ...DEFAULT_DATABASE_DRIVEN_CONFIG, ...config };

  await factory.initialize(fullConfig);
  return factory;
}

/**
 * Get initialized system instance
 */
export function getDatabaseDrivenSystem(): DatabaseDrivenSystemFactory {
  const factory = DatabaseDrivenSystemFactory.getInstance();
  return factory;
}

export default DatabaseDrivenSystemFactory;
