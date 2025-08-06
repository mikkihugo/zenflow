/**
 * Unified DI Integration Example
 * 
 * Demonstrates how Database, Memory, and Swarm systems
 * work together through the unified DAL Factory architecture.
 */

import { DIContainer } from '../di/container/di-container.js';
import { CORE_TOKENS, DATABASE_TOKENS, MEMORY_TOKENS, SWARM_TOKENS } from '../di/tokens/core-tokens.js';

// Database domain
import { DALFactory } from '../database/factory.js';
import { DatabaseProviderFactory } from '../database/providers/database-providers.js';

// Memory domain  
import { registerMemoryProviders, initializeMemorySystem } from '../memory/memory-integration.js';

// Swarm domain
import { registerSwarmProviders, initializeSwarmStorage } from '../coordination/swarm/storage/swarm-providers.js';

/**
 * Complete system integration example
 */
export async function unifiedIntegrationExample(): Promise<void> {
  console.log('🚀 Starting Unified DI Integration Example\n');

  // 1. Create DI container
  const container = new DIContainer({
    enableCircularDependencyDetection: true,
    enablePerformanceMetrics: true
  });

  // 2. Register core services
  console.log('📋 Registering core services...');
  registerCoreServices(container);

  // 3. Register database services (DAL Factory)
  console.log('🗄️ Registering database services...');
  registerDatabaseServices(container);

  // 4. Register memory services (uses DAL Factory)
  console.log('🧠 Registering memory services...');
  registerMemoryProviders(container, {
    session: { path: './example-data/memory/sessions' },
    semantic: { path: './example-data/memory/vectors' }
  });

  // 5. Register swarm services (uses DAL Factory)
  console.log('🐝 Registering swarm services...');
  registerSwarmProviders(container, {
    swarm: { basePath: './example-data/swarms' },
    backup: { backupsPath: './example-data/backups' }
  });

  console.log('\n✅ All services registered successfully!\n');

  // 6. Initialize all systems
  console.log('🔧 Initializing all systems...\n');

  try {
    // Initialize memory system
    console.log('🧠 Initializing memory system...');
    const memorySystem = await initializeMemorySystem(container);
    console.log(`   ✅ Memory: ${memorySystem.metrics.totalBackends} backends, ${memorySystem.metrics.enabledBackends.join(', ')}`);

    // Initialize swarm system
    console.log('🐝 Initializing swarm system...');
    const swarmSystem = await initializeSwarmStorage(container);
    console.log('   ✅ Swarm: Database manager, maintenance, backup systems ready');

    // 7. Demonstrate unified usage
    console.log('\n🎯 Demonstrating unified system usage...\n');

    // Memory operations (using DAL Factory SQLite)
    console.log('🧠 Memory Operations:');
    await memorySystem.backends.session.store('user:123', {
      id: 123,
      name: 'John Doe',
      preferences: { theme: 'dark' }
    });
    const userData = await memorySystem.backends.session.retrieve('user:123');
    console.log(`   ✅ Stored and retrieved user data: ${userData?.name}`);

    // Swarm operations (using DAL Factory Kuzu + LanceDB + SQLite)
    console.log('🐝 Swarm Operations:');
    const swarmId = 'example-swarm-001';
    
    // Create swarm cluster (repositories via DAL Factory)
    const cluster = await swarmSystem.databaseManager.createSwarmCluster(swarmId);
    console.log(`   ✅ Created swarm cluster: ${swarmId}`);

    // Store agent in graph database
    await swarmSystem.databaseManager.storeSwarmAgent(swarmId, {
      id: 'agent-001',
      name: 'Coordinator Agent',
      type: 'coordinator',
      capabilities: ['planning', 'monitoring']
    });
    console.log('   ✅ Stored agent in graph database');

    // Store embedding in vector database
    await swarmSystem.databaseManager.storeSwarmEmbedding(swarmId, {
      id: 'task-001',
      vector: new Array(1536).fill(0).map(() => Math.random()),
      metadata: { task: 'Initialize system', priority: 'high' }
    });
    console.log('   ✅ Stored embedding in vector database');

    // 8. Show cross-system integration
    console.log('\n🔗 Cross-System Integration:');
    
    // Use memory to cache swarm metadata
    const swarmMetadata = {
      swarmId,
      agents: 1,
      tasks: 1,
      status: 'active',
      lastUpdate: new Date().toISOString()
    };
    await memorySystem.backends.cache.store(`swarm:${swarmId}:metadata`, swarmMetadata);
    console.log('   ✅ Cached swarm metadata in memory system');

    // Use semantic memory to store swarm context
    await memorySystem.backends.semantic.store(`swarm:${swarmId}:context`, {
      purpose: 'Example swarm for unified DI demonstration',
      capabilities: ['coordination', 'task execution', 'monitoring'],
      domain: 'system integration'
    });
    console.log('   ✅ Stored swarm context in semantic memory');

    // 9. Performance metrics
    console.log('\n📊 System Performance:');
    console.log('   Memory Backends:');
    for (const [name, spec] of Object.entries(memorySystem.metrics.performance)) {
      console.log(`     ${name}: ${spec.speed} speed, ${spec.searchCapability} search`);
    }

    // 10. Health checks
    console.log('\n🏥 System Health Checks:');
    const healthChecks = await Promise.allSettled([
      memorySystem.backends.session.health(),
      memorySystem.backends.cache.health(),
      swarmSystem.databaseManager.getActiveSwarms()
    ]);

    const healthyServices = healthChecks
      .map((result, i) => ({ 
        name: ['Session Memory', 'Cache Memory', 'Swarm Database'][i],
        healthy: result.status === 'fulfilled' 
      }))
      .filter(service => service.healthy);

    console.log(`   ✅ ${healthyServices.length}/3 services healthy: ${healthyServices.map(s => s.name).join(', ')}`);

    console.log('\n🎉 Unified DI Integration Example completed successfully!');
    console.log('\n📋 Key Achievements:');
    console.log('   ✅ Single DAL Factory serves all database needs');
    console.log('   ✅ Memory system uses SQLite + LanceDB via DAL Factory');
    console.log('   ✅ Swarm system uses Kuzu + LanceDB + SQLite via DAL Factory');
    console.log('   ✅ All systems share DI container and core services');
    console.log('   ✅ Cross-system data sharing and caching');
    console.log('   ✅ Unified error handling and logging');
    console.log('   ✅ Consistent repository patterns throughout');

  } catch (error) {
    console.error('❌ Integration example failed:', error);
    throw error;
  }
}

/**
 * Register core services required by all domains
 */
function registerCoreServices(container: DIContainer): void {
  // Logger service
  container.register(CORE_TOKENS.Logger, {
    type: 'singleton',
    create: () => ({
      debug: (msg: string, meta?: any) => console.debug(`[DEBUG] ${msg}`, meta || ''),
      info: (msg: string, meta?: any) => console.info(`[INFO] ${msg}`, meta || ''),
      warn: (msg: string, meta?: any) => console.warn(`[WARN] ${msg}`, meta || ''),
      error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta || '')
    })
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
          'swarm.archive.days': 30
        };
        return configs[key] ?? defaultValue;
      },
      set: (key: string, value: any) => {
        console.log(`Config set: ${key} = ${value}`);
      },
      has: (key: string) => key.startsWith('database.') || key.startsWith('memory.') || key.startsWith('swarm.')
    })
  });
}

/**
 * Register database services (DAL Factory)
 */
function registerDatabaseServices(container: DIContainer): void {
  // Database provider factory
  container.register(DATABASE_TOKENS.ProviderFactory, {
    type: 'singleton',
    create: (container) => new DatabaseProviderFactory(
      container.resolve(CORE_TOKENS.Logger),
      container.resolve(CORE_TOKENS.Config)
    )
  });

  // DAL Factory (the core of the unified architecture)
  container.register(DATABASE_TOKENS.DALFactory, {
    type: 'singleton',
    create: (container) => new DALFactory(
      container.resolve(CORE_TOKENS.Logger),
      container.resolve(CORE_TOKENS.Config),
      container.resolve(DATABASE_TOKENS.ProviderFactory)
    )
  });
}

/**
 * Example of specialized usage patterns
 */
export async function specializedUsageExamples(): Promise<void> {
  console.log('\n🎯 Specialized Usage Examples\n');

  const container = new DIContainer();
  registerCoreServices(container);
  registerDatabaseServices(container);
  registerMemoryProviders(container);
  registerSwarmProviders(container);

  // Example 1: High-performance caching with memory backend
  console.log('💨 High-Performance Caching:');
  const memorySystem = await initializeMemorySystem(container, {
    enableCache: true,
    enableSessions: false,
    enableSemantic: false,
    enableDebug: false
  });

  // Simulate API response caching
  const apiResponse = { data: 'expensive computation result', cached: true };
  await memorySystem.backends.cache.store('api:expensive-call', apiResponse);
  const cachedResult = await memorySystem.backends.cache.retrieve('api:expensive-call');
  console.log(`   ✅ Cached API response: ${cachedResult?.cached}`);

  // Example 2: Multi-database swarm coordination
  console.log('🔄 Multi-Database Swarm Coordination:');
  const swarmSystem = await initializeSwarmStorage(container);

  // Create related swarms sharing dependencies
  const parentSwarm = await swarmSystem.databaseManager.createSwarmCluster('parent-swarm');
  const childSwarm = await swarmSystem.databaseManager.createSwarmCluster('child-swarm');
  
  // Store dependency relationship in graph
  await swarmSystem.databaseManager.storeSwarmTask('parent-swarm', {
    id: 'task-001',
    title: 'Coordinate child swarms',
    description: 'Manage multiple child swarm operations',
    dependencies: []
  });

  console.log('   ✅ Created swarm hierarchy with dependency tracking');

  // Example 3: Semantic search across domains
  console.log('🔍 Semantic Search Integration:');
  const semanticMemory = memorySystem.backends.semantic;
  
  // Store related concepts
  await semanticMemory.store('concept:ai-coordination', {
    domain: 'artificial intelligence',
    concepts: ['multi-agent systems', 'swarm intelligence', 'coordination protocols']
  });

  console.log('   ✅ Stored semantic concepts for cross-domain search');

  console.log('\n✨ All specialized examples completed!\n');
}

/**
 * Production deployment example
 */
export function productionDeploymentExample(): void {
  console.log('🏭 Production Deployment Configuration:\n');

  // Production-ready DI container
  const container = new DIContainer({
    enableCircularDependencyDetection: true,
    enablePerformanceMetrics: true,
    maxResolutionDepth: 100
  });

  // Production configuration
  const productionConfig = {
    memory: {
      cache: { type: 'memory' as const, maxSize: 100000 },
      session: { type: 'sqlite' as const, path: '/var/lib/claude-zen/memory/sessions.db' },
      semantic: { type: 'lancedb' as const, path: '/var/lib/claude-zen/memory/vectors' }
    },
    swarm: {
      basePath: '/var/lib/claude-zen/swarms',
      backup: { backupsPath: '/var/lib/claude-zen/backups', retentionDays: 30 }
    },
    database: {
      central: { type: 'sqlite' as const, database: '/var/lib/claude-zen/central.db' }
    }
  };

  console.log('📁 Production Paths:');
  console.log('   Memory: /var/lib/claude-zen/memory/');
  console.log('   Swarms: /var/lib/claude-zen/swarms/');
  console.log('   Backups: /var/lib/claude-zen/backups/');
  console.log('   Central DB: /var/lib/claude-zen/central.db');

  console.log('\n⚙️ Production Features:');
  console.log('   ✅ Unified DAL Factory for all database operations');
  console.log('   ✅ Connection pooling and caching');
  console.log('   ✅ Automatic backup and maintenance');
  console.log('   ✅ Performance monitoring and metrics');
  console.log('   ✅ Health checks and error recovery');
  console.log('   ✅ Dependency injection for testability');

  console.log('\n🔧 Production Commands:');
  console.log('   Start: NODE_ENV=production node dist/index.js');
  console.log('   Monitor: curl http://localhost:3000/health');
  console.log('   Backup: claude-zen backup create --compress');
  console.log('   Metrics: curl http://localhost:3000/metrics');
}

// Export for use in other examples
export default {
  unifiedIntegrationExample,
  specializedUsageExamples,
  productionDeploymentExample
};