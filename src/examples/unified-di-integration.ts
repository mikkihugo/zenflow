/**
 * Unified DI Integration Example
 *
 * Demonstrates how Database, Memory, and Swarm systems
 * work together through the unified DAL Factory architecture.
 */

// Swarm domain
import {
  initializeSwarmStorage,
  registerSwarmProviders,
} from '../coordination/swarm/storage/swarm-providers.js';
// Database domain
import { DALFactory } from '../database/factory.js';
import { DatabaseProviderFactory } from '../database/providers/database-providers.js';
import { DIContainer } from '../di/container/di-container.js';
import { CORE_TOKENS, DATABASE_TOKENS } from '../di/tokens/core-tokens.js';
// Memory domain
import { initializeMemorySystem, registerMemoryProviders } from '../memory/memory-integration.js';

/**
 * Complete system integration example
 */
export async function unifiedIntegrationExample(): Promise<void> {
  // 1. Create DI container
  const container = new DIContainer({
    enableCircularDependencyDetection: true,
    enablePerformanceMetrics: true,
  });
  registerCoreServices(container);
  registerDatabaseServices(container);
  registerMemoryProviders(container, {
    session: { path: './example-data/memory/sessions' },
    semantic: { path: './example-data/memory/vectors' },
  });
  registerSwarmProviders(container, {
    swarm: { basePath: './example-data/swarms' },
    // TODO: TypeScript error TS2353 - backupsPath property name may be incorrect (AI unsure of safe fix - human review needed)
    backup: { backupsPath: './example-data/backups' },
  });

  try {
    const memorySystem = await initializeMemorySystem(container);
    const swarmSystem = await initializeSwarmStorage(container);
    await memorySystem.backends['session']?.store('user:123', {
      id: 123,
      name: 'John Doe',
      preferences: { theme: 'dark' },
    });
    const userData = await memorySystem.backends['session']?.retrieve('user:123');
    const swarmId = 'example-swarm-001';

    // Create swarm cluster (repositories via DAL Factory)
    const cluster = await swarmSystem.databaseManager.createSwarmCluster(swarmId);

    // Store agent in graph database
    await swarmSystem.databaseManager.storeSwarmAgent(swarmId, {
      id: 'agent-001',
      name: 'Coordinator Agent',
      type: 'coordinator',
      capabilities: ['planning', 'monitoring'],
    });

    // Store embedding in vector database
    await swarmSystem.databaseManager.storeSwarmEmbedding(swarmId, {
      id: 'task-001',
      vector: new Array(1536).fill(0).map(() => Math.random()),
      metadata: { task: 'Initialize system', priority: 'high' },
    });

    // Use memory to cache swarm metadata
    const swarmMetadata = {
      swarmId,
      agents: 1,
      tasks: 1,
      status: 'active',
      lastUpdate: new Date().toISOString(),
    };
    await memorySystem.backends['cache']?.store(`swarm:${swarmId}:metadata`, swarmMetadata);

    // Use semantic memory to store swarm context
    await memorySystem.backends['semantic']?.store(`swarm:${swarmId}:context`, {
      purpose: 'Example swarm for unified DI demonstration',
      capabilities: ['coordination', 'task execution', 'monitoring'],
      domain: 'system integration',
    });
    for (const [name, spec] of Object.entries(memorySystem.metrics.performance)) {
    }
    const healthChecks = await Promise.allSettled([
      memorySystem.backends['session']?.health(),
      memorySystem.backends['cache']?.health(),
      swarmSystem.databaseManager.getActiveSwarms(),
    ]);

    const healthyServices = healthChecks
      .map((result, i) => ({
        name: ['Session Memory', 'Cache Memory', 'Swarm Database'][i],
        healthy: result?.status === 'fulfilled',
      }))
      .filter((service) => service.healthy);
  } catch (error) {
    console.error('❌ Integration example failed:', error);
    throw error;
  }
}

/**
 * Register core services required by all domains
 *
 * @param container
 */
function registerCoreServices(container: DIContainer): void {
  // Logger service
  container.register(CORE_TOKENS.Logger, {
    type: 'singleton',
    create: () => ({
      debug: (msg: string, meta?: any) => {},
      info: (msg: string, meta?: any) => {},
      warn: (msg: string, meta?: any) => console.warn(`[WARN] ${msg}`, meta || ''),
      error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || ''),
    }),
  });

  // Configuration service
  container.register(CORE_TOKENS.Config, {
    type: 'singleton',
    create: () => ({
      get: <T>(key: string, defaultValue?: T): T => {
        // Simple config implementation
        const configs: Record<string, any> = {
          'database.sqlite.path': './example-data/database.db',
          'database.kuzu.path': './example-data/graph.kuzu',
          'database.lancedb.path': './example-data/vectors.lance',
          'memory.ttl.default': 3600000,
          'swarm.archive.days': 30,
        };
        return configs?.[key] ?? defaultValue;
      },
      set: (key: string, value: any) => {},
      has: (key: string) =>
        key.startsWith('database.') || key.startsWith('memory.') || key.startsWith('swarm.'),
    }),
  });
}

/**
 * Register database services (DAL Factory)
 *
 * @param container
 */
function registerDatabaseServices(container: DIContainer): void {
  // Database provider factory
  container.register(DATABASE_TOKENS?.ProviderFactory, {
    type: 'singleton',
    create: (container) =>
      new DatabaseProviderFactory(
        container.resolve(CORE_TOKENS.Logger),
        container.resolve(CORE_TOKENS.Config)
      ),
  });

  // DAL Factory (the core of the unified architecture)
  container.register(DATABASE_TOKENS?.DALFactory, {
    type: 'singleton',
    create: (container) =>
      new DALFactory(
        container.resolve(CORE_TOKENS.Logger),
        container.resolve(CORE_TOKENS.Config),
        container.resolve(DATABASE_TOKENS?.ProviderFactory) as DatabaseProviderFactory
      ),
  });
}

/**
 * Example of specialized usage patterns
 */
export async function specializedUsageExamples(): Promise<void> {
  const container = new DIContainer();
  registerCoreServices(container);
  registerDatabaseServices(container);
  registerMemoryProviders(container);
  registerSwarmProviders(container);
  const memorySystem = await initializeMemorySystem(container, {
    enableCache: true,
    enableSessions: false,
    enableSemantic: false,
    enableDebug: false,
  });

  // Simulate API response caching
  const apiResponse = { data: 'expensive computation result', cached: true };
  await memorySystem.backends['cache']?.store('api:expensive-call', apiResponse);
  const _cachedResult = await memorySystem.backends['cache']?.retrieve('api:expensive-call');
  const swarmSystem = await initializeSwarmStorage(container);

  // Create related swarms sharing dependencies
  const parentSwarm = await swarmSystem.databaseManager.createSwarmCluster('parent-swarm');
  const childSwarm = await swarmSystem.databaseManager.createSwarmCluster('child-swarm');

  // Store dependency relationship in graph
  await swarmSystem.databaseManager.storeSwarmTask('parent-swarm', {
    id: 'task-001',
    title: 'Coordinate child swarms',
    description: 'Manage multiple child swarm operations',
    dependencies: [],
  });
  const semanticMemory = memorySystem.backends['semantic'];

  // Store related concepts
  await semanticMemory.store('concept:ai-coordination', {
    domain: 'artificial intelligence',
    concepts: ['multi-agent systems', 'swarm intelligence', 'coordination protocols'],
  });
}

/**
 * Production deployment example
 */
export function productionDeploymentExample(): void {
  // Production-ready DI container
  const container = new DIContainer({
    enableCircularDependencyDetection: true,
    enablePerformanceMetrics: true,
    maxResolutionDepth: 100,
  });

  // Production configuration
  const productionConfig = {
    memory: {
      cache: { type: 'memory' as const, maxSize: 100000 },
      session: { type: 'sqlite' as const, path: '/var/lib/claude-zen/memory/sessions.db' },
      semantic: { type: 'lancedb' as const, path: '/var/lib/claude-zen/memory/vectors' },
    },
    swarm: {
      basePath: '/var/lib/claude-zen/swarms',
      backup: { backupsPath: '/var/lib/claude-zen/backups', retentionDays: 30 },
    },
    database: {
      central: { type: 'sqlite' as const, database: '/var/lib/claude-zen/central.db' },
    },
  };
}

// Export for use in other examples
export default {
  unifiedIntegrationExample,
  specializedUsageExamples,
  productionDeploymentExample,
};
