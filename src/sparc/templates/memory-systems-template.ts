/**
 * SPARC Memory Systems Template
 *
 * Pre-built template for multi-backend memory systems with caching,
 * consistency, and distributed storage capabilities.
 */

import { nanoid } from 'nanoid';
import type {
  ArchitectureDesign,
  DetailedSpecification,
  ProjectSpecification,
  PseudocodeStructure,
  SPARCTemplate,
} from '../types/sparc-types';

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
  },

  specification: {
    id: nanoid(),
    name: 'Multi-Backend Memory System',
    domain: 'memory-systems',
    description:
      'High-performance memory system supporting multiple storage backends with intelligent caching and consistency guarantees',
    functionalRequirements: [
      {
        id: nanoid(),
        title: 'Multi-Backend Storage',
        description:
          'Support multiple storage backends with automatic failover and data consistency',
        type: 'core',
        priority: 'HIGH',
        category: 'storage',
        source: 'system',
        validation: 'Data accessible across all configured backends',
        dependencies: ['Backend Registry', 'Consistency Manager'],
        acceptanceCriteria: [
          'Support for SQLite, LanceDB, and JSON backends',
          'Automatic backend selection based on data type',
          'Seamless failover between backends',
        ],
      },
      {
        id: nanoid(),
        title: 'Intelligent Caching System',
        description: 'Multi-layer caching with smart eviction policies and cache coherence',
        type: 'performance',
        priority: 'HIGH',
        category: 'caching',
        source: 'performance',
        validation: 'Cache hit rate >90% for hot data',
        dependencies: ['Cache Manager', 'Eviction Policy Engine'],
        acceptanceCriteria: [
          'L1, L2, and L3 cache layers',
          'LRU, LFU, and adaptive eviction policies',
          'Cache warming and preloading',
        ],
      },
      {
        id: nanoid(),
        title: 'Distributed Consistency',
        description: 'Maintain data consistency across distributed storage nodes',
        type: 'distributed',
        priority: 'HIGH',
        category: 'consistency',
        source: 'reliability',
        validation: 'Strong consistency for critical data, eventual consistency for others',
        dependencies: ['Consensus Algorithm', 'Conflict Resolution'],
        acceptanceCriteria: [
          'Configurable consistency levels',
          'Vector clocks for conflict detection',
          'Automatic conflict resolution',
        ],
      },
      {
        id: nanoid(),
        title: 'Memory Pool Management',
        description: 'Efficient memory allocation and deallocation with pool reuse',
        type: 'resource',
        priority: 'MEDIUM',
        category: 'optimization',
        source: 'performance',
        validation: 'Memory fragmentation <5%, allocation time <1ms',
        dependencies: ['Memory Allocator', 'Garbage Collector'],
        acceptanceCriteria: [
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
        category: 'reliability',
        source: 'operational',
        validation: 'RPO <1 hour, RTO <15 minutes',
        dependencies: ['Backup Scheduler', 'Recovery Manager'],
        acceptanceCriteria: [
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
        type: 'performance',
        priority: 'HIGH',
        category: 'latency',
        metric: 'response_time',
        target: '<10ms for cache hits, <100ms for backend queries',
        measurement: 'P95 access latency',
        rationale: 'Real-time applications require immediate data access',
      },
      {
        id: nanoid(),
        title: 'Throughput Capacity',
        description: 'High-throughput data operations',
        type: 'performance',
        priority: 'HIGH',
        category: 'throughput',
        metric: 'operations_per_second',
        target: '100,000 operations/second',
        measurement: 'Peak sustained throughput',
        rationale: 'Support for high-volume applications',
      },
      {
        id: nanoid(),
        title: 'Availability Guarantee',
        description: 'High availability with minimal downtime',
        type: 'reliability',
        priority: 'HIGH',
        category: 'availability',
        metric: 'uptime',
        target: '99.9% availability',
        measurement: 'Monthly uptime percentage',
        rationale: 'Critical system component requiring high availability',
      },
    ],
    systemConstraints: [
      {
        id: nanoid(),
        type: 'performance',
        description: 'Memory usage must not exceed 80% of available system memory',
        rationale: 'Prevent system instability and maintain performance',
        impact: 'HIGH',
      },
      {
        id: nanoid(),
        type: 'compatibility',
        description: 'Support for multiple storage engines (SQLite, LanceDB, JSON)',
        rationale: 'Flexibility for different data types and use cases',
        impact: 'MEDIUM',
      },
      {
        id: nanoid(),
        type: 'security',
        description: 'All data must be encrypted at rest and in transit',
        rationale: 'Data protection and compliance requirements',
        impact: 'HIGH',
      },
    ],
    projectAssumptions: [
      'Sufficient storage capacity for data and backups',
      'Network connectivity for distributed operations',
      'Compatible storage backend drivers available',
      'Proper security credentials and access controls',
    ],
    externalDependencies: [
      {
        id: nanoid(),
        name: 'SQLite',
        type: 'database',
        description: 'Embedded SQL database for structured data',
        version: '3.40+',
        criticality: 'HIGH',
      },
      {
        id: nanoid(),
        name: 'LanceDB',
        type: 'vector-database',
        description: 'Vector database for embeddings and similarity search',
        version: '0.3+',
        criticality: 'MEDIUM',
      },
      {
        id: nanoid(),
        name: 'Redis',
        type: 'cache',
        description: 'In-memory cache for high-speed data access',
        version: '7.0+',
        criticality: 'MEDIUM',
      },
    ],
    riskAnalysis: {
      identifiedRisks: [
        {
          id: nanoid(),
          description: 'Data inconsistency during network partitions',
          probability: 'MEDIUM',
          impact: 'HIGH',
          category: 'distributed',
        },
        {
          id: nanoid(),
          description: 'Memory leaks in long-running processes',
          probability: 'LOW',
          impact: 'MEDIUM',
          category: 'resource',
        },
        {
          id: nanoid(),
          description: 'Backend storage capacity exhaustion',
          probability: 'MEDIUM',
          impact: 'HIGH',
          category: 'capacity',
        },
      ],
      mitigationStrategies: [
        {
          riskId: 'data-inconsistency',
          strategy: 'Implement conflict-free replicated data types (CRDTs) and vector clocks',
          effectiveness: 'HIGH',
        },
        {
          riskId: 'memory-leaks',
          strategy: 'Comprehensive memory monitoring and automatic cleanup routines',
          effectiveness: 'MEDIUM',
        },
        {
          riskId: 'capacity-exhaustion',
          strategy: 'Proactive monitoring with automated scaling and data archival',
          effectiveness: 'HIGH',
        },
      ],
    },
    successMetrics: [
      {
        id: nanoid(),
        metric: 'cache_hit_ratio',
        target: '>90%',
        measurement: 'Percentage of cache hits vs total requests',
        frequency: 'Real-time',
      },
      {
        id: nanoid(),
        metric: 'data_consistency',
        target: '100% for critical data',
        measurement: 'Consistency validation checks',
        frequency: 'Continuous',
      },
      {
        id: nanoid(),
        metric: 'backup_success_rate',
        target: '>99.5%',
        measurement: 'Successful backup operations',
        frequency: 'Daily',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  pseudocode: {
    id: nanoid(),
    specificationId: 'memory-systems-spec',
    coreAlgorithms: [
      {
        id: nanoid(),
        name: 'MultiBackendRead',
        description: 'Read data from multiple backends with intelligent fallback',
        pseudocode: `
ALGORITHM MultiBackendRead
INPUT: key, consistency_level, timeout
OUTPUT: value, metadata

BEGIN
  primary_backend ← SELECT_PRIMARY_BACKEND(key)
  
  // Try primary backend first
  TRY
    value ← primary_backend.READ(key, timeout)
    IF value.IS_VALID() THEN
      UPDATE_CACHE(key, value)
      RETURN value, metadata
    END IF
  CATCH backend_error
    LOG_WARNING("Primary backend failed", backend_error)
  END TRY
  
  // Fallback to secondary backends
  secondary_backends ← GET_SECONDARY_BACKENDS(key)
  FOR EACH backend IN secondary_backends DO
    TRY
      value ← backend.READ(key, timeout)
      IF value.IS_VALID() THEN
        // Repair primary backend asynchronously
        ASYNC_REPAIR(primary_backend, key, value)
        UPDATE_CACHE(key, value)
        RETURN value, metadata
      END IF
    CATCH backend_error
      LOG_WARNING("Secondary backend failed", backend_error)
      CONTINUE
    END TRY
  END FOR
  
  // No backends available
  THROW NOT_FOUND_ERROR(key)
END
        `.trim(),
        complexity: {
          time: 'O(b)' as const,
          space: 'O(1)' as const,
          explanation: 'Linear in number of backends, constant space for operation',
        },
        inputParameters: ['key', 'consistency_level', 'timeout'],
        outputFormat: 'ValueWithMetadata',
        preconditions: ['At least one backend available', 'Key is valid'],
        postconditions: ['Value retrieved or error thrown'],
        invariants: ['Backend availability maintained', 'Cache consistency preserved'],
      },
      {
        id: nanoid(),
        name: 'IntelligentCaching',
        description: 'Multi-layer caching with adaptive eviction policies',
        pseudocode: `
ALGORITHM IntelligentCaching
INPUT: key, value, access_pattern, priority
OUTPUT: cache_result, eviction_info

BEGIN
  cache_layer ← DETERMINE_CACHE_LAYER(key, value.size, access_pattern)
  
  CASE cache_layer OF
    'L1': // In-memory, ultra-fast
      IF L1_CACHE.HAS_SPACE(value.size) THEN
        L1_CACHE.PUT(key, value, priority)
      ELSE
        evicted_items ← L1_CACHE.EVICT_LRU(value.size)
        L1_CACHE.PUT(key, value, priority)
        // Demote evicted items to L2
        FOR EACH item IN evicted_items DO
          L2_CACHE.PUT(item.key, item.value, item.priority - 1)
        END FOR
      END IF
      
    'L2': // Redis, network cache
      IF L2_CACHE.HAS_SPACE(value.size) THEN
        L2_CACHE.PUT(key, value, priority)
      ELSE
        evicted_items ← L2_CACHE.EVICT_LFU(value.size)
        L2_CACHE.PUT(key, value, priority)
        // Archive evicted items to L3
        FOR EACH item IN evicted_items DO
          L3_CACHE.PUT(item.key, item.value, item.priority - 1)
        END FOR
      END IF
      
    'L3': // Persistent cache
      L3_CACHE.PUT(key, value, priority)
      
  END CASE
  
  // Update access statistics for adaptive policies
  UPDATE_ACCESS_STATISTICS(key, access_pattern, CURRENT_TIME())
  
  RETURN cache_result, eviction_info
END
        `.trim(),
        complexity: {
          time: 'O(log n)' as const,
          space: 'O(1)' as const,
          explanation: 'Logarithmic time for cache operations, constant space per operation',
        },
        inputParameters: ['key', 'value', 'access_pattern', 'priority'],
        outputFormat: 'CacheResult',
        preconditions: ['Cache layers initialized', 'Value is cacheable'],
        postconditions: ['Value cached in appropriate layer'],
        invariants: ['Cache hierarchy maintained', 'Eviction policies respected'],
      },
      {
        id: nanoid(),
        name: 'ConsistencyManager',
        description: 'Manage data consistency across distributed storage nodes',
        pseudocode: `
ALGORITHM ConsistencyManager
INPUT: operation, data, consistency_level, nodes[]
OUTPUT: operation_result, consistency_proof

BEGIN
  vector_clock ← GENERATE_VECTOR_CLOCK(operation, nodes)
  
  CASE consistency_level OF
    'STRONG':
      // Require consensus from majority of nodes
      quorum_size ← CEILING(nodes.length / 2) + 1
      committed_nodes ← []
      
      FOR EACH node IN nodes DO
        TRY
          node_result ← node.EXECUTE_OPERATION(operation, data, vector_clock)
          IF node_result.SUCCESS THEN
            committed_nodes.ADD(node)
            IF committed_nodes.length >= quorum_size THEN
              // Commit to all nodes
              FOR EACH committed_node IN committed_nodes DO
                committed_node.COMMIT(operation.id)
              END FOR
              RETURN SUCCESS, vector_clock
            END IF
          END IF
        CATCH node_error
          LOG_ERROR("Node operation failed", node, node_error)
        END TRY
      END FOR
      
      // Rollback if quorum not achieved
      FOR EACH node IN committed_nodes DO
        node.ROLLBACK(operation.id)
      END FOR
      THROW CONSISTENCY_ERROR("Quorum not achieved")
      
    'EVENTUAL':
      // Best-effort replication
      successful_nodes ← []
      FOR EACH node IN nodes DO
        ASYNC_EXECUTE(node.EXECUTE_OPERATION(operation, data, vector_clock))
        successful_nodes.ADD(node)
      END FOR
      
      // Monitor convergence asynchronously
      ASYNC_MONITOR_CONVERGENCE(operation.id, nodes, vector_clock)
      RETURN SUCCESS, vector_clock
      
    'WEAK':
      // Single node write with async replication
      primary_node ← SELECT_PRIMARY_NODE(data.key)
      result ← primary_node.EXECUTE_OPERATION(operation, data, vector_clock)
      
      // Async replication to other nodes
      FOR EACH node IN nodes WHERE node != primary_node DO
        ASYNC_REPLICATE(node, operation, data, vector_clock)
      END FOR
      
      RETURN result, vector_clock
  END CASE
END
        `.trim(),
        complexity: {
          time: 'O(n)' as const,
          space: 'O(n)' as const,
          explanation: 'Linear in number of nodes for consensus operations',
        },
        inputParameters: ['operation', 'data', 'consistency_level', 'nodes'],
        outputFormat: 'ConsistencyResult',
        preconditions: ['Nodes available', 'Operation is valid'],
        postconditions: ['Consistency level maintained'],
        invariants: ['Vector clock monotonicity', 'Node consensus preserved'],
      },
    ],
    dataStructures: [
      {
        id: nanoid(),
        name: 'MultiLayerCache',
        type: 'Cache',
        description: 'Hierarchical cache with L1, L2, and L3 layers',
        keyType: 'string',
        valueType: 'CacheEntry',
        expectedSize: 1000000,
        accessPatterns: ['get', 'put', 'evict', 'promote'],
        performance: {
          get: 'O(1)' as const,
          put: 'O(log n)' as const,
          evict: 'O(1)' as const,
        },
      },
      {
        id: nanoid(),
        name: 'BackendRegistry',
        type: 'HashMap',
        description: 'Registry of available storage backends with health status',
        keyType: 'string',
        valueType: 'BackendInfo',
        expectedSize: 100,
        accessPatterns: ['lookup', 'register', 'update_health', 'failover'],
        performance: {
          lookup: 'O(1)' as const,
          register: 'O(1)' as const,
          update_health: 'O(1)' as const,
        },
      },
      {
        id: nanoid(),
        name: 'VectorClockMap',
        type: 'HashMap',
        description: 'Vector clocks for tracking causal relationships',
        keyType: 'string',
        valueType: 'VectorClock',
        expectedSize: 10000,
        accessPatterns: ['get', 'update', 'compare', 'merge'],
        performance: {
          get: 'O(1)' as const,
          update: 'O(n)' as const,
          compare: 'O(n)' as const,
        },
      },
    ],
    processFlows: [
      {
        id: nanoid(),
        name: 'DataAccessPipeline',
        description: 'Complete data access and caching pipeline',
        steps: [
          {
            id: nanoid(),
            name: 'CacheCheck',
            description: 'Check all cache layers for requested data',
            algorithm: 'IntelligentCaching',
            inputs: ['key', 'access_pattern'],
            outputs: ['cached_value', 'cache_level'],
            duration: 1,
          },
          {
            id: nanoid(),
            name: 'BackendQuery',
            description: 'Query storage backends if cache miss',
            algorithm: 'MultiBackendRead',
            inputs: ['key', 'consistency_level'],
            outputs: ['value', 'metadata'],
            duration: 50,
          },
          {
            id: nanoid(),
            name: 'CacheUpdate',
            description: 'Update cache with retrieved value',
            algorithm: 'IntelligentCaching',
            inputs: ['key', 'value', 'access_pattern'],
            outputs: ['cache_result'],
            duration: 5,
          },
        ],
        parallelizable: false,
        criticalPath: ['CacheCheck', 'BackendQuery', 'CacheUpdate'],
      },
    ],
    complexityAnalysis: {
      worstCase: 'O(n * b)' as const,
      averageCase: 'O(1)' as const,
      bestCase: 'O(1)' as const,
      spaceComplexity: 'O(n)' as const,
      scalabilityAnalysis: 'System scales with cache size and number of backends',
      bottlenecks: [
        'Network latency for distributed operations',
        'Disk I/O for persistent backends',
        'Memory bandwidth for large cached objects',
      ],
    },
    optimizationOpportunities: [
      {
        id: nanoid(),
        type: 'caching',
        description: 'Implement predictive cache preloading based on access patterns',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '300% improvement in cache hit rate',
      },
      {
        id: nanoid(),
        type: 'compression',
        description: 'Add data compression for large cached objects',
        impact: 'medium',
        effort: 'low',
        estimatedImprovement: '50% reduction in memory usage',
      },
      {
        id: nanoid(),
        type: 'batching',
        description: 'Batch multiple operations for better backend utilization',
        impact: 'high',
        effort: 'medium',
        estimatedImprovement: '200% increase in throughput',
      },
    ],
    estimatedPerformance: [
      {
        metric: 'access_latency',
        target: '<1ms for L1 cache, <10ms for L2 cache, <100ms for backend',
        measurement: 'milliseconds',
      },
      {
        metric: 'throughput',
        target: '100,000 operations/second',
        measurement: 'ops/sec',
      },
      {
        metric: 'cache_efficiency',
        target: '>90% hit rate for hot data',
        measurement: 'percentage',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  architecture: {
    id: nanoid(),
    pseudocodeId: 'memory-systems-pseudocode',
    components: [
      {
        id: nanoid(),
        name: 'MemoryCoordinator',
        type: 'service',
        description: 'Central coordinator for memory operations across all backends',
        responsibilities: [
          'Route operations to appropriate backends',
          'Manage cache coherence',
          'Handle failover and recovery',
          'Monitor system health',
        ],
        interfaces: ['IMemoryCoordinator'],
        dependencies: ['BackendRegistry', 'CacheManager', 'ConsistencyManager'],
        technologies: ['TypeScript', 'Node.js', 'EventEmitter'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '100000 operations/second',
          expectedLatency: '<5ms',
          memoryUsage: '256MB',
        },
      },
      {
        id: nanoid(),
        name: 'MultiLayerCacheManager',
        type: 'service',
        description: 'Manages hierarchical caching across L1, L2, and L3 layers',
        responsibilities: [
          'Cache layer management',
          'Eviction policy enforcement',
          'Cache warming and preloading',
          'Performance monitoring',
        ],
        interfaces: ['ICacheManager'],
        dependencies: ['L1Cache', 'L2Cache', 'L3Cache', 'EvictionPolicyEngine'],
        technologies: ['TypeScript', 'Redis', 'In-Memory Cache'],
        scalability: 'vertical',
        performance: {
          expectedThroughput: '1000000 cache operations/second',
          expectedLatency: '<1ms',
          memoryUsage: '2GB',
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
        technologies: ['TypeScript', 'SQLite', 'LanceDB'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '50000 backend operations/second',
          expectedLatency: '<50ms',
          memoryUsage: '512MB',
        },
      },
      {
        id: nanoid(),
        name: 'ConsistencyEngine',
        type: 'service',
        description: 'Ensures data consistency across distributed storage nodes',
        responsibilities: [
          'Vector clock management',
          'Conflict detection and resolution',
          'Consensus coordination',
          'Consistency level enforcement',
        ],
        interfaces: ['IConsistencyEngine'],
        dependencies: ['VectorClockManager', 'ConflictResolver'],
        technologies: ['TypeScript', 'CRDT', 'Raft'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '10000 consensus operations/second',
          expectedLatency: '<20ms',
          memoryUsage: '128MB',
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
        technologies: ['TypeScript', 'S3', 'Compression'],
        scalability: 'horizontal',
        performance: {
          expectedThroughput: '1000 backup operations/hour',
          expectedLatency: '<5 minutes',
          memoryUsage: '256MB',
        },
      },
    ],
    relationships: [
      {
        id: nanoid(),
        sourceId: 'memory-coordinator',
        targetId: 'multi-layer-cache-manager',
        type: 'uses',
        description: 'Coordinator uses cache manager for fast data access',
        strength: 'strong',
        protocol: 'synchronous',
      },
      {
        id: nanoid(),
        sourceId: 'memory-coordinator',
        targetId: 'backend-manager',
        type: 'uses',
        description: 'Coordinator uses backend manager for persistent storage',
        strength: 'strong',
        protocol: 'synchronous',
      },
      {
        id: nanoid(),
        sourceId: 'memory-coordinator',
        targetId: 'consistency-engine',
        type: 'coordinates',
        description: 'Coordinator ensures consistency through consistency engine',
        strength: 'medium',
        protocol: 'asynchronous',
      },
    ],
    patterns: [
      {
        id: nanoid(),
        name: 'Multi-Backend Pattern',
        type: 'reliability',
        description: 'Use multiple storage backends for redundancy and performance',
        benefits: [
          'High availability',
          'Performance optimization',
          'Data type specialization',
          'Risk distribution',
        ],
        tradeoffs: ['Increased complexity', 'Consistency challenges', 'Resource overhead'],
        applicableComponents: ['memory-coordinator', 'backend-manager'],
      },
      {
        id: nanoid(),
        name: 'Cache-Aside Pattern',
        type: 'performance',
        description: 'Application manages cache explicitly with backend fallback',
        benefits: [
          'Fine-grained control',
          'Cache miss handling',
          'Data consistency',
          'Performance optimization',
        ],
        tradeoffs: ['Code complexity', 'Cache management overhead', 'Potential inconsistency'],
        applicableComponents: ['multi-layer-cache-manager'],
      },
      {
        id: nanoid(),
        name: 'Vector Clock Pattern',
        type: 'consistency',
        description: 'Track causal relationships in distributed system',
        benefits: [
          'Conflict detection',
          'Partial ordering',
          'Distributed coordination',
          'Causality tracking',
        ],
        tradeoffs: ['Storage overhead', 'Complexity scaling', 'Clock synchronization'],
        applicableComponents: ['consistency-engine'],
      },
    ],
    interfaces: [
      {
        id: nanoid(),
        name: 'IMemoryCoordinator',
        componentId: 'memory-coordinator',
        type: 'REST',
        methods: [
          { name: 'get', parameters: ['key', 'options'], returns: 'Promise<Value>' },
          { name: 'set', parameters: ['key', 'value', 'options'], returns: 'Promise<void>' },
          { name: 'delete', parameters: ['key'], returns: 'Promise<boolean>' },
          { name: 'exists', parameters: ['key'], returns: 'Promise<boolean>' },
          { name: 'getMetrics', parameters: [], returns: 'MemoryMetrics' },
        ],
        protocol: 'HTTP/REST',
        authentication: 'API Key',
        rateLimit: '100000/hour',
        documentation: 'Memory system coordination and management API',
      },
      {
        id: nanoid(),
        name: 'ICacheManager',
        componentId: 'multi-layer-cache-manager',
        type: 'Internal',
        methods: [
          { name: 'getFromCache', parameters: ['key', 'layer'], returns: 'Promise<CacheEntry>' },
          { name: 'putInCache', parameters: ['key', 'value', 'layer'], returns: 'Promise<void>' },
          { name: 'evict', parameters: ['key', 'layer'], returns: 'Promise<void>' },
          { name: 'getCacheStats', parameters: ['layer'], returns: 'CacheStatistics' },
        ],
        protocol: 'Internal',
        authentication: 'Internal',
        rateLimit: 'unlimited',
        documentation: 'Internal cache management interface',
      },
    ],
    dataFlows: [
      {
        id: nanoid(),
        name: 'ReadFlow',
        sourceComponentId: 'memory-coordinator',
        targetComponentId: 'multi-layer-cache-manager',
        dataType: 'ReadRequest',
        format: 'JSON',
        volume: 'High',
        frequency: 'High',
        security: 'Medium',
        transformation: 'Request validation and key normalization',
      },
      {
        id: nanoid(),
        name: 'WriteFlow',
        sourceComponentId: 'memory-coordinator',
        targetComponentId: 'backend-manager',
        dataType: 'WriteRequest',
        format: 'Binary',
        volume: 'Medium',
        frequency: 'Medium',
        security: 'High',
        transformation: 'Data serialization and encryption',
      },
    ],
    qualityAttributes: [
      {
        id: nanoid(),
        name: 'High Performance',
        type: 'performance',
        description: 'Ultra-fast data access and high throughput',
        criteria: [
          'P95 access latency < 10ms',
          'Throughput > 100,000 operations/second',
          'Cache hit rate > 90% for hot data',
        ],
        measurement: 'Automated performance testing',
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        name: 'High Availability',
        type: 'reliability',
        description: 'System remains available despite failures',
        criteria: [
          '99.9% uptime guarantee',
          'Automatic failover in < 30 seconds',
          'Zero data loss for critical operations',
        ],
        measurement: 'Uptime monitoring and failover testing',
        priority: 'HIGH',
      },
    ],
    deploymentStrategy: {
      id: nanoid(),
      name: 'Distributed Memory Cluster',
      type: 'distributed',
      description: 'Deploy as distributed cluster with redundancy',
      environments: [
        {
          name: 'development',
          configuration: {
            replicas: 1,
            resources: { cpu: '1', memory: '2Gi' },
            storage: 'local',
            backends: ['sqlite', 'json'],
          },
        },
        {
          name: 'production',
          configuration: {
            replicas: 3,
            resources: { cpu: '4', memory: '8Gi' },
            storage: 'distributed',
            backends: ['sqlite', 'lancedb', 'json', 'redis'],
          },
        },
      ],
      infrastructure: ['Kubernetes', 'Docker', 'Redis Cluster', 'Distributed Storage'],
      cicd: {
        buildPipeline: ['Test', 'Build', 'Performance Test', 'Deploy'],
        testStrategy: ['Unit Tests', 'Integration Tests', 'Performance Tests'],
        deploymentStrategy: 'Rolling Deployment',
      },
    },
    integrationPoints: [
      {
        id: nanoid(),
        name: 'Storage Backend Integration',
        type: 'database',
        description: 'Integration with multiple storage backends',
        protocol: 'Native drivers',
        security: 'Connection encryption',
        errorHandling: 'Automatic failover and retry',
        monitoring: 'Health checks and performance metrics',
      },
    ],
    performanceRequirements: [
      {
        id: nanoid(),
        metric: 'access_latency',
        target: '<10ms P95',
        measurement: 'milliseconds',
        priority: 'HIGH',
      },
      {
        id: nanoid(),
        metric: 'throughput',
        target: '100,000 ops/second',
        measurement: 'operations/second',
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

  customizeSpecification(projectSpec: ProjectSpecification): DetailedSpecification {
    const customized = { ...this.specification };
    customized.name = projectSpec.name;
    customized.description = `${projectSpec.name} - ${this.specification.description}`;
    return customized;
  },

  customizePseudocode(_projectSpec: ProjectSpecification): PseudocodeStructure {
    return { ...this.pseudocode };
  },

  customizeArchitecture(_projectSpec: ProjectSpecification): ArchitectureDesign {
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
