/**
 * SPARC Memory Systems Template.
 *
 * Pre-built template for multi-backend memory systems with caching,
 * consistency, and distributed storage capabilities.
 */
/**
 * @file Coordination system: memory-systems-template.
 */

import { nanoid } from 'nanoid';
import type {
  ArchitectureDesign,
  DetailedSpecification,
  ProjectSpecification,
  PseudocodeStructure,
  SPARCTemplate,
  TemplateMetadata,
} from '../types/sparc-types.ts';

export const MEMORY_SYSTEMS_TEMPLATE: SPARCTemplate = {
  id: 'memory-systems-template',
  name: 'Multi-Backend Memory System',
  domain: 'memory-systems',
  description:
    'Comprehensive template for memory systems with multiple storage backends and advanced caching',
  version: '1.0.0',
  metadata: {
    author: 'SPARC Memory Systems Template Generator',
    createdAt: new Date(),
    tags: ['memory', 'caching', 'storage', 'distributed'],
    complexity: 'high',
    estimatedDevelopmentTime: '6-10 weeks',
    targetPerformance: 'Sub-10ms access time, 99.9% availability',
  } as TemplateMetadata,

  specification: {
    id: nanoid(),
    domain: 'memory-systems',
    functionalRequirements: [
      {
        id: nanoid(),
        title: 'Multi-Backend Storage',
        description:
          'Support multiple storage backends with automatic failover and data consistency',
        type: 'core',
        priority: 'HIGH',
        dependencies: ['Backend Registry', 'Consistency Manager'],
        testCriteria: [
          'Support for SQLite, LanceDB, and JSON backends',
          'Automatic backend selection based on data type',
          'Seamless failover between backends',
        ],
      },
      {
        id: nanoid(),
        title: 'Intelligent Caching System',
        description:
          'Multi-layer caching with smart eviction policies and cache coherence',
        type: 'performance',
        priority: 'HIGH',
        dependencies: ['Cache Manager', 'Eviction Policy Engine'],
        testCriteria: [
          'L1, L2, and L3 cache layers',
          'LRU, LFU, and adaptive eviction policies',
          'Cache warming and preloading',
        ],
      },
      {
        id: nanoid(),
        title: 'Distributed Consistency',
        description:
          'Maintain data consistency across distributed storage nodes',
        type: 'distributed',
        priority: 'HIGH',
        dependencies: ['Consensus Algorithm', 'Conflict Resolution'],
        testCriteria: [
          'Configurable consistency levels',
          'Vector clocks for conflict detection',
          'Automatic conflict resolution',
        ],
      },
      {
        id: nanoid(),
        title: 'Memory Pool Management',
        description:
          'Efficient memory allocation and deallocation with pool reuse',
        type: 'resource',
        priority: 'MEDIUM',
        dependencies: ['Memory Allocator', 'Garbage Collector'],
        testCriteria: [
          'Object pooling for frequent allocations',
          'Memory usage monitoring and alerts',
          'Automatic memory reclamation',
        ],
      },
      {
        id: nanoid(),
        title: 'Backup and Recovery',
        description: 'Automated backup strategies with point-in-time recovery',
        type: 'operational',
        priority: 'MEDIUM',
        dependencies: ['Backup Scheduler', 'Recovery Manager'],
        testCriteria: [
          'Incremental and full backup strategies',
          'Cross-region backup replication',
          'Automated recovery testing',
        ],
      },
    ],
    nonFunctionalRequirements: [
      {
        id: nanoid(),
        title: 'Access Performance',
        description: 'Ultra-fast data access with minimal latency',
        metrics: { response_time: '<10ms', cache_hit_rate: '>90%' },
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        title: 'Throughput Capacity',
        description: 'High-throughput data operations',
        metrics: {
          operations_per_second: '>100000',
          concurrent_users: '>1000',
        },
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        title: 'Availability Guarantee',
        description: 'High availability with minimal downtime',
        metrics: { uptime: '>99.9%', recovery_time: '<30s' },
        priority: 'HIGH',
      },
    ],
    constraints: [
      {
        id: nanoid(),
        type: 'performance',
        description:
          'Memory usage must not exceed 80% of available system memory',
        impact: 'high',
      },
      {
        id: nanoid(),
        type: 'technical',
        description:
          'Support for multiple storage engines (SQLite, LanceDB, JSON)',
        impact: 'medium',
      },
      {
        id: nanoid(),
        type: 'technical',
        description: 'All data must be encrypted at rest and in transit',
        impact: 'high',
      },
    ],
    assumptions: [
      {
        id: nanoid(),
        description: 'Sufficient storage capacity for data and backups',
        confidence: 'high',
        riskIfIncorrect: 'HIGH',
      },
      {
        id: nanoid(),
        description: 'Network connectivity for distributed operations',
        confidence: 'high',
        riskIfIncorrect: 'MEDIUM',
      },
      {
        id: nanoid(),
        description: 'Compatible storage backend drivers available',
        confidence: 'medium',
        riskIfIncorrect: 'MEDIUM',
      },
      {
        id: nanoid(),
        description: 'Proper security credentials and access controls',
        confidence: 'medium',
        riskIfIncorrect: 'HIGH',
      },
    ],
    dependencies: [
      {
        id: nanoid(),
        name: 'SQLite',
        type: 'database',
        version: '3.40+',
        critical: true,
      },
      {
        id: nanoid(),
        name: 'LanceDB',
        type: 'service',
        version: '0.3+',
        critical: false,
      },
      {
        id: nanoid(),
        name: 'Redis',
        type: 'service',
        version: '7.0+',
        critical: false,
      },
    ],
    acceptanceCriteria: [
      {
        id: nanoid(),
        requirement: 'All cache operations complete within 10ms',
        testMethod: 'automated',
        criteria: [
          'P95 response time < 10ms',
          'Performance benchmarking results available',
          'Load testing completed',
        ],
      },
      {
        id: nanoid(),
        requirement: 'Data consistency maintained across all backends',
        testMethod: 'automated',
        criteria: [
          '100% consistency validation passes',
          'Cross-backend verification tests',
          'ACID transaction compliance',
        ],
      },
      {
        id: nanoid(),
        requirement: 'System availability exceeds 99.9%',
        testMethod: 'automated',
        criteria: [
          'Monthly uptime > 99.9%',
          'Failover mechanisms tested',
          'Health monitoring active',
        ],
      },
    ],
    riskAssessment: {
      risks: [
        {
          id: nanoid(),
          description: 'Data inconsistency during network partitions',
          probability: 'medium',
          impact: 'high',
          category: 'technical',
        },
        {
          id: nanoid(),
          description: 'Memory leaks in long-running processes',
          probability: 'low',
          impact: 'medium',
          category: 'technical',
        },
        {
          id: nanoid(),
          description: 'Backend storage capacity exhaustion',
          probability: 'medium',
          impact: 'high',
          category: 'operational',
        },
      ],
      mitigationStrategies: [
        {
          riskId: 'data-inconsistency',
          strategy:
            'Implement conflict-free replicated data types (CRDTs) and vector clocks',
          priority: 'HIGH',
          effort: 'high',
        },
        {
          riskId: 'memory-leaks',
          strategy:
            'Comprehensive memory monitoring and automatic cleanup routines',
          priority: 'MEDIUM',
          effort: 'medium',
        },
        {
          riskId: 'capacity-exhaustion',
          strategy:
            'Proactive monitoring with automated scaling and data archival',
          priority: 'HIGH',
          effort: 'medium',
        },
      ],
      overallRisk: 'MEDIUM',
    },
    successMetrics: [
      {
        id: nanoid(),
        name: 'Cache Hit Rate',
        description: 'Percentage of cache hits vs total requests',
        target: '>90%',
        measurement: 'Percentage of cache hits vs total requests',
      },
      {
        id: nanoid(),
        name: 'Data Consistency',
        description: 'Data consistency across distributed storage',
        target: '100% for critical data',
        measurement: 'Consistency validation checks',
      },
      {
        id: nanoid(),
        name: 'Backup Success Rate',
        description: 'Successful backup operations rate',
        target: '>99.5%',
        measurement: 'Successful backup operations',
      },
    ],
  },

  pseudocode: {
    id: nanoid(),
    algorithms: [],
    coreAlgorithms: [
      {
        name: 'MultiBackendRead',
        purpose: 'Read data from multiple backends with intelligent fallback',
        inputs: [
          { name: 'key', type: 'string', description: 'Data key to retrieve' },
          {
            name: 'consistency_level',
            type: 'string',
            description: 'Required consistency level',
          },
          {
            name: 'timeout',
            type: 'number',
            description: 'Operation timeout in ms',
          },
        ],
        outputs: [
          { name: 'value', type: 'any', description: 'Retrieved data value' },
          {
            name: 'metadata',
            type: 'object',
            description: 'Operation metadata',
          },
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Select primary backend based on key',
            pseudocode: 'primary_backend ← SELECT_PRIMARY_BACKEND(key)',
            complexity: 'O(1)',
          },
          {
            stepNumber: 2,
            description: 'Attempt read from primary backend',
            pseudocode: 'value ← primary_backend.READ(key, timeout)',
            complexity: 'O(1)',
          },
          {
            stepNumber: 3,
            description: 'If successful, update cache and return',
            pseudocode: 'IF value.IS_VALID() THEN UPDATE_CACHE(key, value)',
            complexity: 'O(1)',
          },
          {
            stepNumber: 4,
            description: 'On failure, try secondary backends in order',
            pseudocode: 'FOR EACH backend IN secondary_backends DO',
            complexity: 'O(b)',
            dependencies: ['Secondary Backend Registry'],
          },
          {
            stepNumber: 5,
            description: 'Repair primary backend asynchronously if needed',
            pseudocode: 'ASYNC_REPAIR(primary_backend, key, value)',
            complexity: 'O(1)',
          },
          {
            stepNumber: 6,
            description: 'Return value from successful backend or throw error',
            pseudocode: 'RETURN value, metadata OR THROW NOT_FOUND_ERROR(key)',
            complexity: 'O(1)',
          },
        ],
        complexity: {
          timeComplexity: 'O(b)',
          spaceComplexity: 'O(1)',
          scalability: 'Linear in backends',
          worstCase: 'O(b)',
        },
        optimizations: [],
      },
      {
        name: 'IntelligentCaching',
        purpose: 'Multi-layer caching with adaptive eviction policies',
        inputs: [
          { name: 'key', type: 'string', description: 'Cache key' },
          { name: 'value', type: 'any', description: 'Value to cache' },
          {
            name: 'access_pattern',
            type: 'string',
            description: 'Access frequency pattern',
          },
          {
            name: 'priority',
            type: 'number',
            description: 'Cache priority level',
          },
        ],
        outputs: [
          {
            name: 'cache_result',
            type: 'object',
            description: 'Cache operation result',
          },
          {
            name: 'eviction_info',
            type: 'object',
            description: 'Information about evicted items',
          },
        ],
        steps: [
          {
            stepNumber: 1,
            description:
              'Determine appropriate cache layer based on size and access pattern',
            pseudocode:
              'cache_layer ← DETERMINE_CACHE_LAYER(key, value.size, access_pattern)',
            complexity: 'O(1)',
          },
          {
            stepNumber: 2,
            description: 'Check available space in target cache layer',
            pseudocode: 'IF cache_layer.HAS_SPACE(value.size) THEN',
            complexity: 'O(1)',
          },
          {
            stepNumber: 3,
            description: 'If space available, store directly',
            pseudocode: 'cache_layer.PUT(key, value, priority)',
            complexity: 'O(1)',
          },
          {
            stepNumber: 4,
            description:
              'If space unavailable, evict items using appropriate policy (LRU/LFU)',
            pseudocode: 'evicted_items ← cache_layer.EVICT_POLICY(value.size)',
            complexity: 'O(log n)',
          },
          {
            stepNumber: 5,
            description: 'Demote evicted items to lower cache layers',
            pseudocode:
              'FOR EACH item IN evicted_items DO lower_layer.PUT(item)',
            complexity: 'O(k)',
            dependencies: ['Lower Cache Layers'],
          },
          {
            stepNumber: 6,
            description: 'Update access statistics for adaptive policies',
            pseudocode:
              'UPDATE_ACCESS_STATISTICS(key, access_pattern, CURRENT_TIME())',
            complexity: 'O(1)',
          },
        ],
        complexity: {
          timeComplexity: 'O(log n)',
          spaceComplexity: 'O(1)',
          scalability: 'Good for large datasets',
          worstCase: 'O(n)',
        },
        optimizations: [],
      },
      {
        name: 'ConsistencyManager',
        purpose: 'Manage data consistency across distributed storage nodes',
        inputs: [
          {
            name: 'operation',
            type: 'object',
            description: 'Operation to execute',
          },
          { name: 'data', type: 'any', description: 'Data for operation' },
          {
            name: 'consistency_level',
            type: 'string',
            description: 'Required consistency level',
          },
          { name: 'nodes', type: 'array', description: 'Available nodes' },
        ],
        outputs: [
          {
            name: 'operation_result',
            type: 'object',
            description: 'Operation execution result',
          },
          {
            name: 'consistency_proof',
            type: 'object',
            description: 'Proof of consistency',
          },
        ],
        steps: [
          {
            stepNumber: 1,
            description: 'Generate vector clock for operation',
            pseudocode:
              'vector_clock ← GENERATE_VECTOR_CLOCK(operation, nodes)',
            complexity: 'O(n)',
          },
          {
            stepNumber: 2,
            description:
              'Determine required consensus based on consistency level',
            pseudocode: 'quorum_size ← CEILING(nodes.length / 2) + 1',
            complexity: 'O(1)',
          },
          {
            stepNumber: 3,
            description: 'Execute operation on required nodes',
            pseudocode:
              'FOR EACH node IN nodes DO node.EXECUTE_OPERATION(operation)',
            complexity: 'O(n)',
          },
          {
            stepNumber: 4,
            description: 'Verify quorum achievement',
            pseudocode: 'IF committed_nodes.length >= quorum_size THEN',
            complexity: 'O(1)',
          },
          {
            stepNumber: 5,
            description: 'Commit or rollback based on success',
            pseudocode:
              'FOR EACH node IN committed_nodes DO node.COMMIT(operation.id)',
            complexity: 'O(n)',
          },
          {
            stepNumber: 6,
            description: 'Return result with consistency proof',
            pseudocode: 'RETURN SUCCESS, vector_clock',
            complexity: 'O(1)',
          },
        ],
        complexity: {
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          scalability: 'Depends on node count',
          worstCase: 'O(n²)',
        },
        optimizations: [],
      },
    ],
    dataStructures: [
      {
        name: 'MultiLayerCache',
        type: 'class',
        properties: [
          {
            name: 'l1Cache',
            type: 'Map<string, CacheEntry>',
            visibility: 'private',
            description: 'Level 1 in-memory cache',
          },
          {
            name: 'l2Cache',
            type: 'Map<string, CacheEntry>',
            visibility: 'private',
            description: 'Level 2 Redis cache',
          },
          {
            name: 'l3Cache',
            type: 'Map<string, CacheEntry>',
            visibility: 'private',
            description: 'Level 3 persistent cache',
          },
        ],
        methods: [
          {
            name: 'get',
            parameters: [
              {
                name: 'key',
                type: 'string',
                description: 'Cache key to retrieve',
              },
            ],
            returnType: 'CacheEntry | null',
            visibility: 'public',
            description: 'Retrieve entry from cache',
          },
          {
            name: 'put',
            parameters: [
              { name: 'key', type: 'string', description: 'Cache key' },
              {
                name: 'value',
                type: 'CacheEntry',
                description: 'Value to cache',
              },
            ],
            returnType: 'void',
            visibility: 'public',
            description: 'Store entry in cache',
          },
          {
            name: 'evict',
            parameters: [
              { name: 'key', type: 'string', description: 'Key to evict' },
            ],
            returnType: 'boolean',
            visibility: 'public',
            description: 'Remove entry from cache',
          },
          {
            name: 'promote',
            parameters: [
              {
                name: 'key',
                type: 'string',
                description: 'Key to promote to higher cache layer',
              },
            ],
            returnType: 'void',
            visibility: 'public',
            description: 'Promote entry to higher cache layer',
          },
        ],
        relationships: [
          {
            type: 'uses',
            target: 'CacheEntry',
            description: 'Stores cache entries with metadata',
          },
          {
            type: 'contains',
            target: 'EvictionPolicy',
            description: 'Implements cache eviction strategies',
          },
        ],
      },
      {
        name: 'BackendRegistry',
        type: 'class',
        properties: [
          {
            name: 'backends',
            type: 'Map<string, BackendInfo>',
            visibility: 'private',
            description: 'Registry of backend instances',
          },
          {
            name: 'healthStatus',
            type: 'Map<string, boolean>',
            visibility: 'private',
            description: 'Health status cache',
          },
        ],
        methods: [
          {
            name: 'register',
            parameters: [
              { name: 'id', type: 'string', description: 'Backend identifier' },
              {
                name: 'backend',
                type: 'BackendInfo',
                description: 'Backend configuration',
              },
            ],
            returnType: 'void',
            visibility: 'public',
            description: 'Register a new backend',
          },
          {
            name: 'lookup',
            parameters: [
              {
                name: 'id',
                type: 'string',
                description: 'Backend ID to lookup',
              },
            ],
            returnType: 'BackendInfo | null',
            visibility: 'public',
            description: 'Find backend by ID',
          },
          {
            name: 'updateHealth',
            parameters: [
              { name: 'id', type: 'string', description: 'Backend ID' },
              {
                name: 'healthy',
                type: 'boolean',
                description: 'Health status',
              },
            ],
            returnType: 'void',
            visibility: 'public',
            description: 'Update backend health status',
          },
          {
            name: 'getHealthyBackends',
            parameters: [],
            returnType: 'BackendInfo[]',
            visibility: 'public',
            description: 'Get all healthy backends',
          },
        ],
        relationships: [
          {
            type: 'uses',
            target: 'BackendInfo',
            description: 'Manages backend configuration objects',
          },
          {
            type: 'contains',
            target: 'HealthMonitor',
            description: 'Tracks backend health status',
          },
        ],
      },
      {
        name: 'VectorClockMap',
        type: 'class',
        properties: [
          {
            name: 'clocks',
            type: 'Map<string, VectorClock>',
            visibility: 'private',
            description: 'Vector clock storage',
          },
          {
            name: 'nodeId',
            type: 'string',
            visibility: 'private',
            description: 'Current node identifier',
          },
        ],
        methods: [
          {
            name: 'get',
            parameters: [
              { name: 'key', type: 'string', description: 'Clock key' },
            ],
            returnType: 'VectorClock | null',
            visibility: 'public',
            description: 'Get vector clock by key',
          },
          {
            name: 'update',
            parameters: [
              { name: 'key', type: 'string', description: 'Clock key' },
              {
                name: 'clock',
                type: 'VectorClock',
                description: 'Updated vector clock',
              },
            ],
            returnType: 'void',
            visibility: 'public',
            description: 'Update vector clock',
          },
          {
            name: 'compare',
            parameters: [
              {
                name: 'clock1',
                type: 'VectorClock',
                description: 'First clock to compare',
              },
              {
                name: 'clock2',
                type: 'VectorClock',
                description: 'Second clock to compare',
              },
            ],
            returnType: 'number',
            visibility: 'public',
            description: 'Compare two vector clocks',
          },
          {
            name: 'merge',
            parameters: [
              {
                name: 'clock1',
                type: 'VectorClock',
                description: 'First clock to merge',
              },
              {
                name: 'clock2',
                type: 'VectorClock',
                description: 'Second clock to merge',
              },
            ],
            returnType: 'VectorClock',
            visibility: 'public',
            description: 'Merge two vector clocks',
          },
        ],
        relationships: [
          {
            type: 'uses',
            target: 'VectorClock',
            description:
              'Manages vector clock objects for distributed consensus',
          },
          {
            type: 'contains',
            target: 'ClockComparator',
            description: 'Implements clock comparison logic',
          },
        ],
      },
    ],
    complexityAnalysis: {
      timeComplexity: 'O(n * b)' as const,
      spaceComplexity: 'O(n)' as const,
      scalability: 'System scales with cache size and number of backends',
      worstCase: 'O(n * b)' as const,
      averageCase: 'O(1)' as const,
      bestCase: 'O(1)' as const,
      bottlenecks: [
        'Network latency for distributed operations',
        'Disk I/O for persistent backends',
        'Memory bandwidth for large cached objects',
      ],
    },
    optimizations: [
      {
        id: nanoid(),
        type: 'caching',
        description:
          'Implement predictive cache preloading based on access patterns',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '300% improvement in cache hit rate',
      },
      {
        id: nanoid(),
        type: 'performance',
        description: 'Add data compression for large cached objects',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '50% reduction in memory usage',
      },
      {
        id: nanoid(),
        type: 'performance',
        description: 'Batch multiple operations for better backend utilization',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '200% increase in throughput',
      },
    ],
    controlFlows: [],
    dependencies: [],
  },

  architecture: {
    id: nanoid(),
    systemArchitecture: {
      components: [],
      interfaces: [],
      dataFlow: [],
      deploymentUnits: [],
      qualityAttributes: [],
      architecturalPatterns: [],
      technologyStack: [],
    },
    componentDiagrams: [],
    deploymentPlan: [],
    validationResults: {
      overall: true,
      score: 0.95,
      results: [],
      recommendations: [],
    },
    components: [
      {
        id: nanoid(),
        name: 'MemoryCoordinator',
        type: 'service',
        description:
          'Central coordinator for memory operations across all backends',
        responsibilities: [
          'Route operations to appropriate backends',
          'Manage cache coherence',
          'Handle failover and recovery',
          'Monitor system health',
        ],
        interfaces: ['IMemoryCoordinator'],
        dependencies: ['BackendRegistry', 'CacheManager', 'ConsistencyManager'],
        qualityAttributes: {
          coordination: 'high',
          performance: 'high',
          scalability: 'horizontal',
        },
        performance: {
          expectedLatency: '<5ms',
          optimizations: ['100000 operations/second', '256MB memory usage'],
        },
      },
      {
        id: nanoid(),
        name: 'MultiLayerCacheManager',
        type: 'service',
        description:
          'Manages hierarchical caching across L1, L2, and L3 layers',
        responsibilities: [
          'Cache layer management',
          'Eviction policy enforcement',
          'Cache warming and preloading',
          'Performance monitoring',
        ],
        interfaces: ['ICacheManager'],
        dependencies: ['L1Cache', 'L2Cache', 'L3Cache', 'EvictionPolicyEngine'],
        qualityAttributes: {
          performance: 'high',
          efficiency: 'high',
          scalability: 'vertical',
        },
        performance: {
          expectedLatency: '<1ms',
          optimizations: [
            '1000000 cache operations/second',
            '2GB memory usage',
          ],
        },
      },
      {
        id: nanoid(),
        name: 'BackendManager',
        type: 'service',
        description: 'Manages multiple storage backends with health monitoring',
        responsibilities: [
          'Backend registration and discovery',
          'Health monitoring and failover',
          'Load balancing across backends',
          'Connection pooling',
        ],
        interfaces: ['IBackendManager'],
        dependencies: ['SQLiteBackend', 'LanceDBBackend', 'JSONBackend'],
        qualityAttributes: {
          reliability: 'high',
          performance: 'high',
          scalability: 'horizontal',
        },
        performance: {
          expectedLatency: '<50ms',
          optimizations: [
            '50000 backend operations/second',
            '512MB memory usage',
          ],
        },
      },
      {
        id: nanoid(),
        name: 'ConsistencyEngine',
        type: 'service',
        description:
          'Ensures data consistency across distributed storage nodes',
        responsibilities: [
          'Vector clock management',
          'Conflict detection and resolution',
          'Consensus coordination',
          'Consistency level enforcement',
        ],
        interfaces: ['IConsistencyEngine'],
        dependencies: ['VectorClockManager', 'ConflictResolver'],
        qualityAttributes: {
          consistency: 'high',
          performance: 'high',
          reliability: 'high',
        },
        performance: {
          expectedLatency: '<20ms',
          optimizations: [
            '10000 consensus operations/second',
            '128MB memory usage',
          ],
        },
      },
      {
        id: nanoid(),
        name: 'BackupManager',
        type: 'service',
        description: 'Automated backup and recovery management',
        responsibilities: [
          'Backup scheduling and execution',
          'Point-in-time recovery',
          'Cross-region replication',
          'Backup verification',
        ],
        interfaces: ['IBackupManager'],
        dependencies: ['BackupStorage', 'CompressionEngine'],
        qualityAttributes: {
          reliability: 'high',
          availability: 'high',
          durability: 'high',
        },
        performance: {
          expectedLatency: '<5 minutes',
          optimizations: ['1000 backup operations/hour', '256MB memory usage'],
        },
      },
    ],
    relationships: [
      {
        id: nanoid(),
        type: 'uses',
        source: 'memory-coordinator',
        target: 'multi-layer-cache-manager',
        description: 'Coordinator uses cache manager for fast data access',
        strength: 'strong',
        protocol: 'synchronous',
      },
      {
        id: nanoid(),
        type: 'uses',
        source: 'memory-coordinator',
        target: 'backend-manager',
        description: 'Coordinator uses backend manager for persistent storage',
        strength: 'strong',
        protocol: 'synchronous',
      },
      {
        id: nanoid(),
        type: 'coordinates',
        source: 'memory-coordinator',
        target: 'consistency-engine',
        description:
          'Coordinator ensures consistency through consistency engine',
        strength: 'medium',
        protocol: 'asynchronous',
      },
    ],
    patterns: [
      {
        name: 'Multi-Backend Pattern',
        description:
          'Use multiple storage backends for redundancy and performance',
        benefits: [
          'High availability',
          'Performance optimization',
          'Data type specialization',
          'Risk distribution',
        ],
        tradeoffs: [
          'Increased complexity',
          'Consistency challenges',
          'Resource overhead',
        ],
        applicability: [
          'High availability systems',
          'Performance optimization',
          'Risk distribution',
        ],
      },
      {
        name: 'Cache-Aside Pattern',
        description:
          'Application manages cache explicitly with backend fallback',
        benefits: [
          'Fine-grained control',
          'Cache miss handling',
          'Data consistency',
          'Performance optimization',
        ],
        tradeoffs: [
          'Code complexity',
          'Cache management overhead',
          'Potential inconsistency',
        ],
        applicability: [
          'Fine-grained cache control',
          'Explicit consistency management',
          'Application-managed caching',
        ],
      },
      {
        name: 'Vector Clock Pattern',
        description: 'Track causal relationships in distributed system',
        benefits: [
          'Conflict detection',
          'Partial ordering',
          'Distributed coordination',
          'Causality tracking',
        ],
        tradeoffs: [
          'Storage overhead',
          'Complexity scaling',
          'Clock synchronization',
        ],
        applicability: [
          'Distributed systems',
          'Conflict detection requirements',
          'Causal consistency maintenance',
        ],
      },
    ],
    dataFlow: [
      {
        from: 'memory-coordinator',
        to: 'multi-layer-cache-manager',
        data: 'ReadRequest',
        protocol: 'JSON',
      },
      {
        from: 'memory-coordinator',
        to: 'backend-manager',
        data: 'WriteRequest',
        protocol: 'Binary',
      },
    ],
    qualityAttributes: [
      {
        name: 'High Performance',
        target: 'P95 access latency < 10ms, Throughput > 100k ops/sec',
        measurement: 'Automated performance testing',
        criteria: [
          'P95 access latency < 10ms',
          'Throughput > 100,000 operations/second',
          'Cache hit rate > 90% for hot data',
        ],
        priority: 'HIGH',
      },
      {
        name: 'High Availability',
        target: 'System uptime > 99.9%',
        measurement: 'Uptime monitoring and failover testing',
        criteria: [
          '99.9% uptime guarantee',
          'Automatic failover in < 30 seconds',
          'Zero data loss for critical operations',
        ],
        priority: 'HIGH',
      },
    ],
    securityRequirements: [
      {
        id: nanoid(),
        type: 'encryption',
        description: 'Encrypt all data at rest and in transit',
        implementation: 'AES-256 encryption with key rotation',
        priority: 'HIGH',
      },
    ],
    scalabilityRequirements: [
      {
        id: nanoid(),
        type: 'horizontal',
        description: 'Scale by adding more nodes to the cluster',
        target: 'Linear scaling up to 100 nodes',
        implementation: 'Consistent hashing and data sharding',
        priority: 'HIGH',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  async applyTo(projectSpec: ProjectSpecification) {
    return {
      specification: this.customizeSpecification(projectSpec),
      pseudocode: this.customizePseudocode(projectSpec),
      architecture: this.customizeArchitecture(projectSpec),
    };
  },

  customizeSpecification(
    projectSpec: ProjectSpecification,
  ): DetailedSpecification {
    const customized = { ...this.specification };
    // Enhanced: Add project name and description to specification
    customized.name = projectSpec.name;
    customized.description = `${projectSpec.name} - Memory systems with vector storage and retrieval`;
    return customized;
  },

  customizePseudocode(projectSpec: ProjectSpecification): PseudocodeStructure {
    return { ...this.pseudocode };
  },

  customizeArchitecture(projectSpec: ProjectSpecification): ArchitectureDesign {
    return { ...this.architecture };
  },

  validateCompatibility(projectSpec: ProjectSpecification) {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const compatible = true;

    if (projectSpec.domain !== 'memory-systems') {
      warnings.push('Project domain does not match template domain');
    }

    return { compatible, warnings, recommendations };
  },
};
