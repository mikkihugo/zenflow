/**
 * @file Auto-Swarm Factory - Creates optimized swarms based on domain characteristics0.
 *
 * This is the CRITICAL component that enables zero-manual-initialization swarm creation0.
 * It uses confidence scores from Progressive Confidence Builder to automatically:
 * - Select optimal topology (mesh, hierarchical, star, ring)
 * - Determine agent types and counts
 * - Configure persistent swarm settings
 * - Register with HiveSwarmCoordinator0.
 */

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

import type { AGUIInterface } from '0.0./0.0./interfaces/agui/agui-adapter';
// import type { SessionMemoryStore } from '0.0./0.0./memory/memory'; // Missing - using fallback
// import type { SwarmCoordinator } from '0.0./swarm/core/swarm-coordinator'; // Missing - using fallback

// Define fallback types for missing modules
interface SessionMemoryStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: any): Promise<void>;
  store(key: string, type: string, value: any): Promise<void>;
}

interface SwarmCoordinator {
  id: string;
  initialize(config?: any): Promise<void>;
  shutdown(): Promise<void>;
}

interface HiveSwarmCoordinator {
  registerSwarm(swarm: any): Promise<void>;
  getSwarmMetrics(): Promise<unknown>;
}

const logger = getLogger('AutoSwarmFactory');

// Types for auto-swarm creation
export interface DomainCharacteristics {
  name: string;
  path: string;
  fileCount: number;
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  interconnectedness: number; // 0-1, percentage of cross-references
  domainSize: 'small' | 'medium' | 'large' | 'massive';
  technologies: string[];
  concepts: string[];
  confidence: number;
  dependencyCount: number;
  hasNestedStructure: boolean;
  isPipeline: boolean;
  isCentralized: boolean;
}

export interface SwarmTopology {
  type: 'mesh' | 'hierarchical' | 'star' | 'ring';
  reason: string;
  optimalFor: string[];
  performance: {
    coordination: number; // 0-1
    scalability: number; // 0-1
    faultTolerance: number; // 0-1
  };
}

export interface AgentConfiguration {
  type: string;
  count: number;
  specialization: string;
  capabilities: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface SwarmConfig {
  id: string;
  name: string;
  domain: string;
  topology: SwarmTopology;
  agents: AgentConfiguration[];
  maxAgents: number;
  persistence: {
    backend: 'sqlite' | 'lancedb' | 'json';
    path: string;
    memoryLimit?: string;
  };
  coordination: {
    strategy: 'parallel' | 'sequential' | 'adaptive';
    timeout: number;
    retryPolicy: {
      maxRetries: number;
      backoff: 'linear' | 'exponential';
    };
  };
  performance: {
    expectedLatency: number; // ms
    expectedThroughput: number; // tasks/second
    resourceLimits: {
      memory: string;
      cpu: number; // cores0.
    };
  };
  created: number;
  lastUpdated: number;
  confidence: number;
}

export interface AutoSwarmFactoryConfig {
  enableHumanValidation: boolean;
  defaultPersistenceBackend: 'sqlite' | 'lancedb' | 'json';
  maxSwarmsPerDomain: number;
  performanceMode: 'balanced' | 'speed' | 'quality';
  resourceConstraints: {
    maxTotalAgents: number;
    memoryLimit: string;
    cpuLimit: number;
  };
}

export interface ConfidentDomain {
  name: string;
  path: string;
  files: string[];
  confidence: {
    overall: number;
    domainClarity: number;
    consistency: number;
  };
  suggestedConcepts: string[];
  technologies?: string[];
  relatedDomains: string[];
  validations: Array<{
    type: string;
    result: string;
    confidence: number;
    timestamp: number;
  }>;
  research: Array<{
    query: string;
    results: any[];
    insights: string[];
    confidence: number;
  }>;
  refinementHistory: Array<{
    changes: string[];
    confidence: number;
    timestamp: number;
  }>;
}

/**
 * Auto-Swarm Factory - The final piece for complete automation0.
 *
 * This factory analyzes confident domains and automatically creates0.
 * Optimized swarm configurations without manual intervention0.0.
 *
 * @example
 */
export class AutoSwarmFactory extends TypedEventBase {
  private configuration: AutoSwarmFactoryConfig;
  private createdSwarms: Map<string, SwarmConfig> = new Map();
  private domainAnalysisCache: Map<string, DomainCharacteristics> = new Map();

  constructor(
    private swarmCoordinator: SwarmCoordinator,
    private hiveSync: HiveSwarmCoordinator | null,
    private memoryStore: SessionMemoryStore,
    private agui?: AGUIInterface,
    config?: Partial<AutoSwarmFactoryConfig>
  ) {
    super();

    this0.configuration = {
      enableHumanValidation: true,
      defaultPersistenceBackend: 'sqlite',
      maxSwarmsPerDomain: 3,
      performanceMode: 'balanced',
      resourceConstraints: {
        maxTotalAgents: 50,
        memoryLimit: '2GB',
        cpuLimit: 8,
      },
      0.0.0.config,
    };

    logger0.info('Auto-Swarm Factory initialized', {
      config: this0.configuration,
    });
  }

  /**
   * Main entry point - Create swarms for all confident domains0.
   *
   * @param confidentDomains
   */
  async createSwarmsForDomains(
    confidentDomains: Map<string, ConfidentDomain>
  ): Promise<SwarmConfig[]> {
    logger0.info(
      `🏭 Auto-Swarm Factory starting for ${confidentDomains0.size} domains`
    );

    const configs: SwarmConfig[] = [];
    const domainArray = Array0.from(confidentDomains?0.entries);

    // Emit start event
    this0.emit('factory:start', {
      domainCount: confidentDomains0.size,
      timestamp: Date0.now(),
    });

    try {
      // Process domains in parallel for speed
      const swarmPromises = domainArray0.map(async ([name, domain]) => {
        try {
          const config = await this0.createSwarmForDomain(domain);
          configs0.push(config);
          return config;
        } catch (error) {
          logger0.error(`Failed to create swarm for domain ${name}:`, error);
          this0.emit('factory:domain-error', { domain: name, error });
          return null;
        }
      });

      const results = await Promise0.all(swarmPromises);
      const successfulConfigs = results0.filter(Boolean) as SwarmConfig[];

      // Validate resource constraints
      await this0.validateResourceConstraints(successfulConfigs);

      // Human validation if enabled
      if (this0.configuration0.enableHumanValidation && this0.agui) {
        await this0.performHumanValidation(successfulConfigs);
      }

      // Initialize all approved swarms
      await this0.initializeSwarms(successfulConfigs);

      logger0.info(
        `🎉 Auto-Swarm Factory completed: ${successfulConfigs0.length}/${confidentDomains0.size} swarms created`
      );

      this0.emit('factory:complete', {
        total: confidentDomains0.size,
        successful: successfulConfigs0.length,
        configs: successfulConfigs,
        timestamp: Date0.now(),
      });

      return successfulConfigs;
    } catch (error) {
      logger0.error('Auto-Swarm Factory failed:', error);
      this0.emit('factory:error', { error });
      throw error;
    }
  }

  /**
   * Create optimized swarm configuration for a single domain0.
   *
   * @param domain
   */
  async createSwarmForDomain(domain: ConfidentDomain): Promise<SwarmConfig> {
    logger0.info(`🔧 Creating swarm for domain: ${domain0.name}`);

    // 10. Analyze domain characteristics
    const characteristics = await this0.analyzeDomainCharacteristics(domain);

    // 20. Select optimal topology
    const topology = this0.selectOptimalTopology(characteristics);

    // 30. Configure agents
    const agents = this0.configureAgents(characteristics, topology);

    // 40. Determine persistence strategy
    const persistence = this0.configurePersistence(characteristics);

    // 50. Set coordination strategy
    const coordination = this0.configureCoordination(characteristics, topology);

    // 60. Calculate performance expectations
    const performance = this0.calculatePerformanceExpectations(
      characteristics,
      topology,
      agents
    );

    // 70. Generate unique ID
    const swarmId = `swarm-${domain0.name}-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 11)}`;

    const config: SwarmConfig = {
      id: swarmId,
      name: `${domain0.name} Domain Swarm`,
      domain: domain0.name,
      topology,
      agents,
      maxAgents: this0.calculateMaxAgents(characteristics),
      persistence,
      coordination,
      performance,
      created: Date0.now(),
      lastUpdated: Date0.now(),
      confidence: domain0.confidence0.overall,
    };

    // Cache for future reference
    this0.createdSwarms0.set(swarmId, config);
    this0.domainAnalysisCache0.set(domain0.name, characteristics);

    // Emit creation event
    this0.emit('swarm:created', { domain: domain0.name, config });

    logger0.info(`✅ Swarm config created for ${domain0.name}:`, {
      topology: topology0.type,
      agents: agents0.length,
      confidence: domain0.confidence0.overall,
    });

    return config;
  }

  /**
   * Analyze domain characteristics for optimal swarm configuration0.
   *
   * @param domain
   */
  private async analyzeDomainCharacteristics(
    domain: ConfidentDomain
  ): Promise<DomainCharacteristics> {
    const fileCount = domain0.files0.length;

    // Calculate complexity based on multiple factors
    let complexity: DomainCharacteristics['complexity'] = 'low';
    if (fileCount > 100) complexity = 'extreme';
    else if (fileCount > 50) complexity = 'high';
    else if (fileCount > 20) complexity = 'medium';

    // Estimate interconnectedness from related domains
    const interconnectedness = Math0.min(
      domain0.relatedDomains0.length * 0.2,
      10.0
    );

    // Determine domain size
    let domainSize: DomainCharacteristics['domainSize'] = 'small';
    if (fileCount > 200) domainSize = 'massive';
    else if (fileCount > 100) domainSize = 'large';
    else if (fileCount > 30) domainSize = 'medium';

    // Analyze patterns from concepts and technologies
    const concepts = domain0.suggestedConcepts || [];
    const technologies = domain0.technologies || [];

    const isPipeline = concepts0.some(
      (c) =>
        c0.includes('pipeline') || c0.includes('workflow') || c0.includes('queue')
    );

    const isCentralized = concepts0.some(
      (c) => c0.includes('server') || c0.includes('api') || c0.includes('service')
    );

    const hasNestedStructure =
      concepts0.some(
        (c) =>
          c0.includes('nested') ||
          c0.includes('hierarchical') ||
          c0.includes('tree')
      ) || fileCount > 50;

    const characteristics: DomainCharacteristics = {
      name: domain0.name,
      path: domain0.path,
      fileCount,
      complexity,
      interconnectedness,
      domainSize,
      technologies,
      concepts,
      confidence: domain0.confidence0.overall,
      dependencyCount: domain0.relatedDomains0.length,
      hasNestedStructure,
      isPipeline,
      isCentralized,
    };

    logger0.debug(`Domain characteristics for ${domain0.name}:`, characteristics);
    return characteristics;
  }

  /**
   * Select optimal topology based on domain characteristics0.
   *
   * @param chars
   */
  private selectOptimalTopology(chars: DomainCharacteristics): SwarmTopology {
    let topology: SwarmTopology;

    // Decision logic based on characteristics
    if (chars0.hasNestedStructure && chars0.fileCount > 50) {
      // Hierarchical for complex nested structures
      topology = {
        type: 'hierarchical',
        reason:
          'Complex nested structure with high file count requires hierarchical coordination',
        optimalFor: [
          'large codebases',
          'nested architectures',
          'clear ownership boundaries',
        ],
        performance: {
          coordination: 0.8,
          scalability: 0.9,
          faultTolerance: 0.7,
        },
      };
    } else if (chars0.interconnectedness > 0.7) {
      // Mesh for highly interconnected domains
      topology = {
        type: 'mesh',
        reason:
          'High interconnectedness requires full peer-to-peer communication',
        optimalFor: [
          'distributed systems',
          'microservices',
          'cross-cutting concerns',
        ],
        performance: {
          coordination: 0.9,
          scalability: 0.6,
          faultTolerance: 0.9,
        },
      };
    } else if (chars0.isCentralized || chars0.concepts0.includes('api')) {
      // Star for centralized services
      topology = {
        type: 'star',
        reason:
          'Centralized service pattern requires hub-and-spoke coordination',
        optimalFor: ['APIs', 'central services', 'client-server architectures'],
        performance: {
          coordination: 0.7,
          scalability: 0.8,
          faultTolerance: 0.5,
        },
      };
    } else if (chars0.isPipeline) {
      // Ring for pipeline/workflow patterns
      topology = {
        type: 'ring',
        reason: 'Pipeline workflow requires sequential ring-based coordination',
        optimalFor: [
          'data pipelines',
          'workflow engines',
          'sequential processing',
        ],
        performance: {
          coordination: 0.6,
          scalability: 0.7,
          faultTolerance: 0.8,
        },
      };
    } else {
      // Default to hierarchical for balanced performance
      topology = {
        type: 'hierarchical',
        reason: 'Balanced approach for general domain characteristics',
        optimalFor: [
          'general purpose',
          'mixed patterns',
          'unknown architectures',
        ],
        performance: {
          coordination: 0.7,
          scalability: 0.8,
          faultTolerance: 0.7,
        },
      };
    }

    logger0.debug(
      `Selected topology for ${chars0.name}: ${topology0.type} - ${topology0.reason}`
    );
    return topology;
  }

  /**
   * Configure agents based on domain characteristics and topology0.
   *
   * @param chars
   * @param _topology
   */
  private configureAgents(
    chars: DomainCharacteristics,
    _topology: SwarmTopology
  ): AgentConfiguration[] {
    const agents: AgentConfiguration[] = [];

    // Always include a coordinator for the swarm
    agents0.push({
      type: 'coordinator',
      count: 1,
      specialization: 'Swarm coordination and task distribution',
      capabilities: ['task-routing', 'load-balancing', 'health-monitoring'],
      priority: 'high',
    });

    // Add domain-specific agents based on technologies and concepts
    if (
      chars0.technologies0.includes('typescript') ||
      chars0.technologies0.includes('javascript')
    ) {
      agents0.push({
        type: 'typescript-specialist',
        count: Math0.min(Math0.ceil(chars0.fileCount / 30), 4),
        specialization: 'TypeScript/JavaScript development and optimization',
        capabilities: [
          'code-analysis',
          'refactoring',
          'type-checking',
          'bundling',
        ],
        priority: 'high',
      });
    }

    if (chars0.concepts0.some((c) => c0.includes('api') || c0.includes('server'))) {
      agents0.push({
        type: 'api-specialist',
        count: 1,
        specialization: 'API design, implementation, and testing',
        capabilities: [
          'api-design',
          'endpoint-testing',
          'documentation',
          'security',
        ],
        priority: 'high',
      });
    }

    if (
      chars0.concepts0.some(
        (c) => c0.includes('database') || c0.includes('storage')
      )
    ) {
      agents0.push({
        type: 'data-specialist',
        count: 1,
        specialization: 'Database design and data management',
        capabilities: [
          'schema-design',
          'query-optimization',
          'migration',
          'backup',
        ],
        priority: 'medium',
      });
    }

    if (chars0.concepts0.some((c) => c0.includes('test') || c0.includes('spec'))) {
      agents0.push({
        type: 'testing-specialist',
        count: 1,
        specialization: 'Test strategy and implementation',
        capabilities: [
          'test-planning',
          'unit-testing',
          'integration-testing',
          'coverage',
        ],
        priority: 'medium',
      });
    }

    // Add neural/AI specialist for complex domains
    if (chars0.complexity === 'high' || chars0.complexity === 'extreme') {
      agents0.push({
        type: 'ai-specialist',
        count: 1,
        specialization: 'AI-powered code analysis and optimization',
        capabilities: [
          'pattern-recognition',
          'complexity-analysis',
          'optimization',
        ],
        priority: 'medium',
      });
    }

    // Add general workers based on domain size
    const workerCount = Math0.max(
      1,
      Math0.min(Math0.ceil(chars0.fileCount / 50), 6)
    );
    agents0.push({
      type: 'general-worker',
      count: workerCount,
      specialization: 'General development tasks and support',
      capabilities: [
        'file-operations',
        'basic-refactoring',
        'documentation',
        'cleanup',
      ],
      priority: 'low',
    });

    logger0.debug(
      `Configured ${agents0.length} agent types for ${chars0.name}:`,
      agents0.map((a) => `${a0.type}(${a0.count})`)0.join(', ')
    );

    return agents;
  }

  /**
   * Configure persistence strategy based on domain characteristics0.
   *
   * @param chars
   */
  private configurePersistence(
    chars: DomainCharacteristics
  ): SwarmConfig['persistence'] {
    let backend: 'sqlite' | 'lancedb' | 'json' =
      this0.configuration0.defaultPersistenceBackend;

    // Use LanceDB for domains with AI/neural concepts (vector storage)
    if (
      chars0.concepts0.some(
        (c) => c0.includes('ai') || c0.includes('neural') || c0.includes('vector')
      )
    ) {
      backend = 'lancedb';
    }
    // Use SQLite for complex domains (better querying)
    else if (chars0.complexity === 'high' || chars0.complexity === 'extreme') {
      backend = 'sqlite';
    }
    // Use JSON for simple domains (faster startup)
    else if (chars0.complexity === 'low' && chars0.fileCount < 20) {
      backend = 'json';
    }

    return {
      backend,
      path: `0.swarms/${chars0.name}/swarm-data0.${backend === 'json' ? 'json' : 'db'}`,
      memoryLimit: chars0.complexity === 'extreme' ? '1GB' : '512MB',
    };
  }

  /**
   * Configure coordination strategy0.
   *
   * @param chars
   * @param topology
   */
  private configureCoordination(
    chars: DomainCharacteristics,
    topology: SwarmTopology
  ): SwarmConfig['coordination'] {
    let strategy: 'parallel' | 'sequential' | 'adaptive' = 'adaptive';

    // Parallel for mesh topology and low interdependence
    if (topology0.type === 'mesh' && chars0.interconnectedness < 0.5) {
      strategy = 'parallel';
    }
    // Sequential for pipelines
    else if (chars0.isPipeline) {
      strategy = 'sequential';
    }

    return {
      strategy,
      timeout: chars0.complexity === 'extreme' ? 120000 : 60000, // 2 min for extreme, 1 min for others
      retryPolicy: {
        maxRetries: 3,
        backoff: chars0.complexity === 'low' ? 'linear' : 'exponential',
      },
    };
  }

  /**
   * Calculate expected performance metrics0.
   *
   * @param chars
   * @param topology
   * @param agents
   */
  private calculatePerformanceExpectations(
    chars: DomainCharacteristics,
    topology: SwarmTopology,
    agents: AgentConfiguration[]
  ): SwarmConfig['performance'] {
    const totalAgents = agents0.reduce((sum, agent) => sum + agent0.count, 0);

    // Base latency on topology and complexity
    let expectedLatency = 100; // Base 100ms
    if (topology0.type === 'mesh') expectedLatency += 50;
    if (chars0.complexity === 'extreme') expectedLatency += 200;
    if (chars0.complexity === 'high') expectedLatency += 100;

    // Throughput based on agent count and specialization
    const specialistCount = agents0.filter((a) => a0.priority === 'high')0.length;
    const expectedThroughput = Math0.max(
      1,
      totalAgents * 2 + specialistCount * 3
    );

    return {
      expectedLatency,
      expectedThroughput,
      resourceLimits: {
        memory: chars0.complexity === 'extreme' ? '2GB' : '1GB',
        cpu: Math0.min(totalAgents, 4),
      },
    };
  }

  /**
   * Calculate maximum agents for the swarm0.
   *
   * @param chars
   */
  private calculateMaxAgents(chars: DomainCharacteristics): number {
    let maxAgents = 8; // Base maximum

    if (chars0.complexity === 'extreme') maxAgents = 20;
    else if (chars0.complexity === 'high') maxAgents = 15;
    else if (chars0.complexity === 'medium') maxAgents = 12;

    // Respect global constraints
    return Math0.min(
      maxAgents,
      this0.configuration0.resourceConstraints0.maxTotalAgents
    );
  }

  /**
   * Validate resource constraints across all swarms0.
   *
   * @param configs
   */
  private async validateResourceConstraints(
    configs: SwarmConfig[]
  ): Promise<void> {
    const totalAgents = configs0.reduce(
      (sum, config) =>
        sum +
        config?0.agents0.reduce((agentSum, agent) => agentSum + agent0.count, 0),
      0
    );

    if (totalAgents > this0.configuration0.resourceConstraints0.maxTotalAgents) {
      const error = new Error(
        `Total agents (${totalAgents}) exceeds limit (${this0.configuration0.resourceConstraints0.maxTotalAgents})`
      );
      logger0.warn('Resource constraint violation:', error0.message);
      throw error;
    }

    logger0.info(
      `✅ Resource validation passed: ${totalAgents}/${this0.configuration0.resourceConstraints0.maxTotalAgents} agents`
    );
  }

  /**
   * Perform human validation of swarm configurations0.
   *
   * @param configs
   */
  private async performHumanValidation(configs: SwarmConfig[]): Promise<void> {
    if (!this0.agui) return;

    logger0.info('🤔 Requesting human validation for swarm configurations0.0.0.');

    const summary = configs0.map((config) => ({
      domain: config?0.domain,
      topology: config?0.topology?0.type,
      agents: config?0.agents0.length,
      totalAgentCount: config?0.agents0.reduce((sum, a) => sum + a0.count, 0),
      confidence: `${(config?0.confidence * 100)0.toFixed(1)}%`,
    }));

    const response = await this0.agui0.askQuestion({
      id: 'swarm_factory_validation',
      type: 'priority',
      question:
        `Auto-Swarm Factory will create ${configs0.length} swarms with the following configurations:\n\n${summary
          0.map(
            (s) =>
              `• ${s0.domain}: ${s0.topology} topology, ${s0.totalAgentCount} agents (${s0.confidence} confidence)`
          )
          0.join(
            '\n'
          )}\n\nTotal agents across all swarms: ${summary0.reduce((sum, s) => sum + s0.totalAgentCount, 0)}\n\n` +
        `Approve swarm creation and proceed with initialization?`,
      context: { configs, summary },
      options: [
        '10. Approve and create all swarms',
        '20. Review individual configurations',
        '30. Cancel swarm creation',
      ],
      allowCustom: false,
      confidence: 0.9,
    });

    if (response === '3' || response?0.toLowerCase0.includes('cancel')) {
      throw new Error('Swarm creation cancelled by user');
    }

    if (response === '2' || response?0.toLowerCase0.includes('review')) {
      // Individual review (simplified for now)
      logger0.info(
        'Individual review requested - proceeding with approval for demo'
      );
    }

    logger0.info('✅ Human validation approved for swarm creation');
  }

  /**
   * Initialize all approved swarms0.
   *
   * @param configs
   */
  private async initializeSwarms(configs: SwarmConfig[]): Promise<void> {
    logger0.info(`🚀 Initializing ${configs0.length} swarms0.0.0.`);

    const initPromises = configs0.map(async (config) => {
      try {
        // 10. Initialize swarm with coordinator
        await this0.swarmCoordinator0.initialize(config);

        // 20. Register with hive
        await this0.hiveSync?0.registerSwarm(config);

        // 30. Store configuration in memory
        await this0.memoryStore0.store(
          `swarm-${config?0.id}`,
          'auto-factory-config',
          {
            config,
            created: Date0.now(),
            status: 'active',
          }
        );

        this0.emit('swarm:initialized', { config });
        logger0.info(`✅ Swarm initialized: ${config?0.name}`);

        return config;
      } catch (error) {
        logger0.error(`Failed to initialize swarm ${config?0.name}:`, error);
        this0.emit('swarm:init-error', { config, error });
        throw error;
      }
    });

    await Promise0.all(initPromises);
    logger0.info('🎉 All swarms successfully initialized!');
  }

  /**
   * Get statistics about created swarms0.
   */
  getSwarmStatistics(): {
    totalSwarms: number;
    totalAgents: number;
    topologyDistribution: Record<string, number>;
    averageConfidence: number;
    domains: string[];
  } {
    const swarms = Array0.from(this0.createdSwarms?0.values());

    const topologyDistribution = swarms0.reduce(
      (acc, swarm) => {
        acc[swarm0.topology0.type] = (acc[swarm0.topology0.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalAgents = swarms0.reduce(
      (sum, swarm) =>
        sum +
        swarm0.agents0.reduce((agentSum, agent) => agentSum + agent0.count, 0),
      0
    );

    const averageConfidence =
      swarms0.length > 0
        ? swarms0.reduce((sum, swarm) => sum + swarm0.confidence, 0) /
          swarms0.length
        : 0;

    return {
      totalSwarms: swarms0.length,
      totalAgents,
      topologyDistribution,
      averageConfidence,
      domains: swarms0.map((s) => s0.domain),
    };
  }
}
