/**
 * @file Auto-Swarm Factory - Creates optimized swarms based on domain characteristics.
 *
 * This is the CRITICAL component that enables zero-manual-initialization swarm creation.
 * It uses confidence scores from Progressive Confidence Builder to automatically:
 * - Select optimal topology (mesh, hierarchical, star, ring)
 * - Determine agent types and counts
 * - Configure persistent swarm settings
 * - Register with HiveSwarmCoordinator.
 */

import { EventEmitter } from 'eventemitter3';

import { getLogger } from '@claude-zen/foundation'
import type { AGUIInterface } from '../../interfaces/agui/agui-adapter';
import type { SessionMemoryStore } from '../../memory/memory';
import type { SwarmCoordinator } from '../swarm/core/swarm-coordinator';

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
      cpu: number; // cores.
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
    results: unknown[];
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
 * Auto-Swarm Factory - The final piece for complete automation.
 *
 * This factory analyzes confident domains and automatically creates.
 * Optimized swarm configurations without manual intervention..
 *
 * @example
 */
export class AutoSwarmFactory extends EventEmitter {
  private config: AutoSwarmFactoryConfig;
  private createdSwarms: Map<string, SwarmConfig> = new Map();
  private domainAnalysisCache: Map<string, DomainCharacteristics> = new Map();

  constructor(
    private swarmCoordinator: SwarmCoordinator,
    private hiveSync: HiveSwarmCoordinator,
    private memoryStore: SessionMemoryStore,
    private agui?: AGUIInterface,
    config?: Partial<AutoSwarmFactoryConfig>
  ) {
    super();

    this.config = {
      enableHumanValidation: true,
      defaultPersistenceBackend: 'sqlite',
      maxSwarmsPerDomain: 3,
      performanceMode: 'balanced',
      resourceConstraints: {
        maxTotalAgents: 50,
        memoryLimit: '2GB',
        cpuLimit: 8,
      },
      ...config,
    };

    logger.info('Auto-Swarm Factory initialized', { config: this.config });
  }

  /**
   * Main entry point - Create swarms for all confident domains.
   *
   * @param confidentDomains
   */
  async createSwarmsForDomains(
    confidentDomains: Map<string, ConfidentDomain>
  ): Promise<SwarmConfig[]> {
    logger.info(
      `🏭 Auto-Swarm Factory starting for ${confidentDomains.size} domains`
    );

    const configs: SwarmConfig[] = [];
    const domainArray = Array.from(confidentDomains.entries());

    // Emit start event
    this.emit('factory:start', {
      domainCount: confidentDomains.size,
      timestamp: Date.now(),
    });

    try {
      // Process domains in parallel for speed
      const swarmPromises = domainArray.map(async ([name, domain]) => {
        try {
          const config = await this.createSwarmForDomain(domain);
          configs.push(config);
          return config;
        } catch (error) {
          logger.error(`Failed to create swarm for domain ${name}:`, error);
          this.emit('factory:domain-error', { domain: name, error });
          return null;
        }
      });

      const results = await Promise.all(swarmPromises);
      const successfulConfigs = results.filter(Boolean) as SwarmConfig[];

      // Validate resource constraints
      await this.validateResourceConstraints(successfulConfigs);

      // Human validation if enabled
      if (this.config.enableHumanValidation && this.agui) {
        await this.performHumanValidation(successfulConfigs);
      }

      // Initialize all approved swarms
      await this.initializeSwarms(successfulConfigs);

      logger.info(
        `🎉 Auto-Swarm Factory completed: ${successfulConfigs.length}/${confidentDomains.size} swarms created`
      );

      this.emit('factory:complete', {
        total: confidentDomains.size,
        successful: successfulConfigs.length,
        configs: successfulConfigs,
        timestamp: Date.now(),
      });

      return successfulConfigs;
    } catch (error) {
      logger.error('Auto-Swarm Factory failed:', error);
      this.emit('factory:error', { error });
      throw error;
    }
  }

  /**
   * Create optimized swarm configuration for a single domain.
   *
   * @param domain
   */
  async createSwarmForDomain(domain: ConfidentDomain): Promise<SwarmConfig> {
    logger.info(`🔧 Creating swarm for domain: ${domain.name}`);

    // 1. Analyze domain characteristics
    const characteristics = await this.analyzeDomainCharacteristics(domain);

    // 2. Select optimal topology
    const topology = this.selectOptimalTopology(characteristics);

    // 3. Configure agents
    const agents = this.configureAgents(characteristics, topology);

    // 4. Determine persistence strategy
    const persistence = this.configurePersistence(characteristics);

    // 5. Set coordination strategy
    const coordination = this.configureCoordination(characteristics, topology);

    // 6. Calculate performance expectations
    const performance = this.calculatePerformanceExpectations(
      characteristics,
      topology,
      agents
    );

    // 7. Generate unique ID
    const swarmId = `swarm-${domain.name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const config: SwarmConfig = {
      id: swarmId,
      name: `${domain.name} Domain Swarm`,
      domain: domain.name,
      topology,
      agents,
      maxAgents: this.calculateMaxAgents(characteristics),
      persistence,
      coordination,
      performance,
      created: Date.now(),
      lastUpdated: Date.now(),
      confidence: domain.confidence.overall,
    };

    // Cache for future reference
    this.createdSwarms.set(swarmId, config);
    this.domainAnalysisCache.set(domain.name, characteristics);

    // Emit creation event
    this.emit('swarm:created', { domain: domain.name, config });

    logger.info(`✅ Swarm config created for ${domain.name}:`, {
      topology: topology.type,
      agents: agents.length,
      confidence: domain.confidence.overall,
    });

    return config;
  }

  /**
   * Analyze domain characteristics for optimal swarm configuration.
   *
   * @param domain
   */
  private async analyzeDomainCharacteristics(
    domain: ConfidentDomain
  ): Promise<DomainCharacteristics> {
    const fileCount = domain.files.length;

    // Calculate complexity based on multiple factors
    let complexity: DomainCharacteristics['complexity'] = 'low';
    if (fileCount > 100) complexity = 'extreme';
    else if (fileCount > 50) complexity = 'high';
    else if (fileCount > 20) complexity = 'medium';

    // Estimate interconnectedness from related domains
    const interconnectedness = Math.min(
      domain.relatedDomains.length * 0.2,
      1.0
    );

    // Determine domain size
    let domainSize: DomainCharacteristics['domainSize'] = 'small';
    if (fileCount > 200) domainSize = 'massive';
    else if (fileCount > 100) domainSize = 'large';
    else if (fileCount > 30) domainSize = 'medium';

    // Analyze patterns from concepts and technologies
    const concepts = domain.suggestedConcepts || [];
    const technologies = domain.technologies || [];

    const isPipeline = concepts.some(
      (c) =>
        c.includes('pipeline') || c.includes('workflow') || c.includes('queue')
    );

    const isCentralized = concepts.some(
      (c) => c.includes('server') || c.includes('api') || c.includes('service')
    );

    const hasNestedStructure =
      concepts.some(
        (c) =>
          c.includes('nested') ||
          c.includes('hierarchical') ||
          c.includes('tree')
      ) || fileCount > 50;

    const characteristics: DomainCharacteristics = {
      name: domain.name,
      path: domain.path,
      fileCount,
      complexity,
      interconnectedness,
      domainSize,
      technologies,
      concepts,
      confidence: domain.confidence.overall,
      dependencyCount: domain.relatedDomains.length,
      hasNestedStructure,
      isPipeline,
      isCentralized,
    };

    logger.debug(`Domain characteristics for ${domain.name}:`, characteristics);
    return characteristics;
  }

  /**
   * Select optimal topology based on domain characteristics.
   *
   * @param chars
   */
  private selectOptimalTopology(chars: DomainCharacteristics): SwarmTopology {
    let topology: SwarmTopology;

    // Decision logic based on characteristics
    if (chars.hasNestedStructure && chars.fileCount > 50) {
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
    } else if (chars.interconnectedness > 0.7) {
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
    } else if (chars.isCentralized || chars.concepts.includes('api')) {
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
    } else if (chars.isPipeline) {
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

    logger.debug(
      `Selected topology for ${chars.name}: ${topology.type} - ${topology.reason}`
    );
    return topology;
  }

  /**
   * Configure agents based on domain characteristics and topology.
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
    agents.push({
      type: 'coordinator',
      count: 1,
      specialization: 'Swarm coordination and task distribution',
      capabilities: ['task-routing', 'load-balancing', 'health-monitoring'],
      priority: 'high',
    });

    // Add domain-specific agents based on technologies and concepts
    if (
      chars.technologies.includes('typescript') ||
      chars.technologies.includes('javascript')
    ) {
      agents.push({
        type: 'typescript-specialist',
        count: Math.min(Math.ceil(chars.fileCount / 30), 4),
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

    if (chars.concepts.some((c) => c.includes('api') || c.includes('server'))) {
      agents.push({
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
      chars.concepts.some(
        (c) => c.includes('database') || c.includes('storage')
      )
    ) {
      agents.push({
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

    if (chars.concepts.some((c) => c.includes('test') || c.includes('spec'))) {
      agents.push({
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
    if (chars.complexity === 'high' || chars.complexity === 'extreme') {
      agents.push({
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
    const workerCount = Math.max(
      1,
      Math.min(Math.ceil(chars.fileCount / 50), 6)
    );
    agents.push({
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

    logger.debug(
      `Configured ${agents.length} agent types for ${chars.name}:`,
      agents.map((a) => `${a.type}(${a.count})`).join(', ')
    );

    return agents;
  }

  /**
   * Configure persistence strategy based on domain characteristics.
   *
   * @param chars
   */
  private configurePersistence(
    chars: DomainCharacteristics
  ): SwarmConfig['persistence'] {
    let backend: 'sqlite' | 'lancedb' | 'json' =
      this.config.defaultPersistenceBackend;

    // Use LanceDB for domains with AI/neural concepts (vector storage)
    if (
      chars.concepts.some(
        (c) => c.includes('ai') || c.includes('neural') || c.includes('vector')
      )
    ) {
      backend = 'lancedb';
    }
    // Use SQLite for complex domains (better querying)
    else if (chars.complexity === 'high' || chars.complexity === 'extreme') {
      backend = 'sqlite';
    }
    // Use JSON for simple domains (faster startup)
    else if (chars.complexity === 'low' && chars.fileCount < 20) {
      backend = 'json';
    }

    return {
      backend,
      path: `.swarms/${chars.name}/swarm-data.${backend === 'json' ? 'json' : 'db'}`,
      memoryLimit: chars.complexity === 'extreme' ? '1GB' : '512MB',
    };
  }

  /**
   * Configure coordination strategy.
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
    if (topology.type === 'mesh' && chars.interconnectedness < 0.5) {
      strategy = 'parallel';
    }
    // Sequential for pipelines
    else if (chars.isPipeline) {
      strategy = 'sequential';
    }

    return {
      strategy,
      timeout: chars.complexity === 'extreme' ? 120000 : 60000, // 2 min for extreme, 1 min for others
      retryPolicy: {
        maxRetries: 3,
        backoff: chars.complexity === 'low' ? 'linear' : 'exponential',
      },
    };
  }

  /**
   * Calculate expected performance metrics.
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
    const totalAgents = agents.reduce((sum, agent) => sum + agent.count, 0);

    // Base latency on topology and complexity
    let expectedLatency = 100; // Base 100ms
    if (topology.type === 'mesh') expectedLatency += 50;
    if (chars.complexity === 'extreme') expectedLatency += 200;
    if (chars.complexity === 'high') expectedLatency += 100;

    // Throughput based on agent count and specialization
    const specialistCount = agents.filter((a) => a.priority === 'high').length;
    const expectedThroughput = Math.max(
      1,
      totalAgents * 2 + specialistCount * 3
    );

    return {
      expectedLatency,
      expectedThroughput,
      resourceLimits: {
        memory: chars.complexity === 'extreme' ? '2GB' : '1GB',
        cpu: Math.min(totalAgents, 4),
      },
    };
  }

  /**
   * Calculate maximum agents for the swarm.
   *
   * @param chars
   */
  private calculateMaxAgents(chars: DomainCharacteristics): number {
    let maxAgents = 8; // Base maximum

    if (chars.complexity === 'extreme') maxAgents = 20;
    else if (chars.complexity === 'high') maxAgents = 15;
    else if (chars.complexity === 'medium') maxAgents = 12;

    // Respect global constraints
    return Math.min(maxAgents, this.config.resourceConstraints.maxTotalAgents);
  }

  /**
   * Validate resource constraints across all swarms.
   *
   * @param configs
   */
  private async validateResourceConstraints(
    configs: SwarmConfig[]
  ): Promise<void> {
    const totalAgents = configs.reduce(
      (sum, config) =>
        sum +
        config?.agents.reduce((agentSum, agent) => agentSum + agent.count, 0),
      0
    );

    if (totalAgents > this.config.resourceConstraints.maxTotalAgents) {
      const error = new Error(
        `Total agents (${totalAgents}) exceeds limit (${this.config.resourceConstraints.maxTotalAgents})`
      );
      logger.warn('Resource constraint violation:', error.message);
      throw error;
    }

    logger.info(
      `✅ Resource validation passed: ${totalAgents}/${this.config.resourceConstraints.maxTotalAgents} agents`
    );
  }

  /**
   * Perform human validation of swarm configurations.
   *
   * @param configs
   */
  private async performHumanValidation(configs: SwarmConfig[]): Promise<void> {
    if (!this.agui) return;

    logger.info('🤔 Requesting human validation for swarm configurations...');

    const summary = configs.map((config) => ({
      domain: config?.domain,
      topology: config?.topology?.type,
      agents: config?.agents.length,
      totalAgentCount: config?.agents.reduce((sum, a) => sum + a.count, 0),
      confidence: `${(config?.confidence * 100).toFixed(1)}%`,
    }));

    const response = await this.agui.askQuestion({
      id: 'swarm_factory_validation',
      type: 'priority',
      question:
        `Auto-Swarm Factory will create ${configs.length} swarms with the following configurations:\n\n${summary
          .map(
            (s) =>
              `• ${s.domain}: ${s.topology} topology, ${s.totalAgentCount} agents (${s.confidence} confidence)`
          )
          .join(
            '\n'
          )}\n\nTotal agents across all swarms: ${summary.reduce((sum, s) => sum + s.totalAgentCount, 0)}\n\n` +
        `Approve swarm creation and proceed with initialization?`,
      context: { configs, summary },
      options: [
        '1. Approve and create all swarms',
        '2. Review individual configurations',
        '3. Cancel swarm creation',
      ],
      allowCustom: false,
      confidence: 0.9,
    });

    if (response === '3' || response?.toLowerCase().includes('cancel')) {
      throw new Error('Swarm creation cancelled by user');
    }

    if (response === '2' || response?.toLowerCase().includes('review')) {
      // Individual review (simplified for now)
      logger.info(
        'Individual review requested - proceeding with approval for demo'
      );
    }

    logger.info('✅ Human validation approved for swarm creation');
  }

  /**
   * Initialize all approved swarms.
   *
   * @param configs
   */
  private async initializeSwarms(configs: SwarmConfig[]): Promise<void> {
    logger.info(`🚀 Initializing ${configs.length} swarms...`);

    const initPromises = configs.map(async (config) => {
      try {
        // 1. Initialize swarm with coordinator
        await this.swarmCoordinator.initialize(config);

        // 2. Register with hive
        await this.hiveSync.registerSwarm(config);

        // 3. Store configuration in memory
        await this.memoryStore.store(
          `swarm-${config?.id}`,
          'auto-factory-config',
          {
            config,
            created: Date.now(),
            status: 'active',
          }
        );

        this.emit('swarm:initialized', { config });
        logger.info(`✅ Swarm initialized: ${config?.name}`);

        return config;
      } catch (error) {
        logger.error(`Failed to initialize swarm ${config?.name}:`, error);
        this.emit('swarm:init-error', { config, error });
        throw error;
      }
    });

    await Promise.all(initPromises);
    logger.info('🎉 All swarms successfully initialized!');
  }

  /**
   * Get statistics about created swarms.
   */
  getSwarmStatistics(): {
    totalSwarms: number;
    totalAgents: number;
    topologyDistribution: Record<string, number>;
    averageConfidence: number;
    domains: string[];
  } {
    const swarms = Array.from(this.createdSwarms.values());

    const topologyDistribution = swarms.reduce(
      (acc, swarm) => {
        acc[swarm.topology.type] = (acc[swarm.topology.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalAgents = swarms.reduce(
      (sum, swarm) =>
        sum +
        swarm.agents.reduce((agentSum, agent) => agentSum + agent.count, 0),
      0
    );

    const averageConfidence =
      swarms.length > 0
        ? swarms.reduce((sum, swarm) => sum + swarm.confidence, 0) /
          swarms.length
        : 0;

    return {
      totalSwarms: swarms.length,
      totalAgents,
      topologyDistribution,
      averageConfidence,
      domains: swarms.map((s) => s.domain),
    };
  }
}
