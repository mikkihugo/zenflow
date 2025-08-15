/**
 * Queen Coordinator System for THE COLLECTIVE.
 * Manages strategic coordination between Cube Matrons and multiple Swarms.
 * Handles resource allocation, priority management, and multi-swarm orchestration.
 */
/**
 * @file Queen coordination system - Strategic multi-swarm coordination.
 */

import { type ChildProcess, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { SharedFACTCapable } from '../shared-fact-system.js';
import type { IEventBus } from '../../core/event-bus.js';
import type { ILogger } from '../../core/logger.js';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.js';
import type {
  QueenCommanderConfig,
  AgentMetrics,
  AgentError,
  QueenTemplate,
  QueenCluster,
  QueenPool,
  QueenHealth,
  QueenType,
  QueenCapabilities,
  QueenConfig,
  QueenEnvironment,
  QueenState,
  QueenId,
  QueenMetrics,
  TaskCompletionData,
  SwarmDegradationData,
  QueenStatus,
  AgentStatus,
  AgentType,
  AgentId
} from '../types/queen-types.js';
import type { AgentPool } from '../../types/agent-types.js';
import type { AgentEnvironment, AgentState } from '../types/queen-types.js';
import type { AgentConfig as CompleteAgentConfig } from '../types.js';
import type { AgentHealth } from '../intelligence/agent-health-monitor.js';
import { generateId } from '../swarm/core/utils.js';
import type { SPARCPhase } from '../swarm/sparc/types/sparc-types.js';
// Strategic Task Coordination (Business Focus Only)

// QueenCoordinatorConfig imported from types
interface LocalQueenCoordinatorConfig {
  maxQueens: number;
  defaultTimeout: number;
  heartbeatInterval: number;
  healthCheckInterval: number;
  autoRestart: boolean;
  resourceLimits: {
    memory: number;
    cpu: number;
    disk: number;
  };
  queenDefaults: {
    autonomyLevel: number;
    learningEnabled: boolean;
    adaptationEnabled: boolean;
    borgProtocol: boolean;
  };
  environmentDefaults: {
    runtime: 'deno' | 'node' | 'claude' | 'browser';
    workingDirectory: string;
    tempDirectory: string;
    logDirectory: string;
  };
}

interface LocalQueenTemplate {
  name: string;
  type: QueenType;
  capabilities: QueenCapabilities;
  config: Partial<QueenConfig>;
  environment: Partial<QueenEnvironment>;
  startupScript?: string;
  dependencies?: string[];
}

interface LocalQueenCluster {
  id: string;
  name: string;
  queens: QueenId[];
  coordinator: QueenId;
  strategy: 'round-robin' | 'load-based' | 'capability-based';
  maxSize: number;
  autoScale: boolean;
}

interface LocalQueenPool {
  id: string;
  name: string;
  type: QueenType;
  minSize: number;
  maxSize: number;
  currentSize: number;
  availableQueens: QueenId[];
  busyQueens: QueenId[];
  template: QueenTemplate;
  autoScale: boolean;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
}

export interface ScalingPolicy {
  name: string;
  enabled: boolean;
  rules: ScalingRule[];
  cooldownPeriod: number;
  maxScaleOperations: number;
}

export interface ScalingRule {
  metric: string;
  threshold: number;
  comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  action: 'scale-up' | 'scale-down';
  amount: number;
  conditions?: string[];
}

interface LocalQueenHealth {
  queenId: string;
  overall: number; // 0-1 health score
  components: {
    responsiveness: number;
    performance: number;
    reliability: number;
    resourceUsage: number;
  };
  issues: HealthIssue[];
  lastCheck: Date;
  trend: 'improving' | 'stable' | 'degrading';
}

export interface HealthIssue {
  type: 'performance' | 'reliability' | 'resource' | 'communication';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  recommendedAction?: string;
}

export interface SPARCTask {
  id: string;
  projectId: string;
  sparcPhase: SPARCPhase;
  tasks: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  coordination: 'swarm-execution';
  matronId: string;
  assigned: Date;
}

export interface QueenSPARCAssignment {
  queenId: string;
  task: SPARCTask;
  source: string;
  methodology: 'SPARC';
  swarmAssignments?: Array<{
    swarmId: string;
    tasks: string[];
    agents: string[];
  }>;
}

// TIER 2: Coordination Learning Interfaces
export interface CrossSwarmPattern {
  patternId: string;
  patternType:
    | 'resource-allocation'
    | 'task-distribution'
    | 'agent-collaboration'
    | 'bottleneck-resolution';
  sourceSwarms: string[];
  effectiveness: number; // 0-1 effectiveness score
  contexts: string[]; // Context where this pattern works well
  resourceOptimization: {
    cpuReduction: number;
    memoryReduction: number;
    timeReduction: number;
  };
  successMetrics: {
    taskCompletionRate: number;
    qualityScore: number;
    resourceUtilization: number;
  };
  discoveryTimestamp: Date;
  usageCount: number;
  lastUsed: Date;
}

export interface SwarmPerformanceProfile {
  swarmId: string;
  commanderType: string;
  averagePerformance: number;
  taskTypes: string[];
  preferredAgentTypes: string[];
  optimalResourceAllocation: {
    cpu: number;
    memory: number;
    agents: number;
  };
  collaborationPatterns: string[];
  bottlenecks: string[];
  strengthAreas: string[];
  lastProfileUpdate: Date;
}

export interface ResourceOptimizationStrategy {
  strategyId: string;
  name: string;
  targetScenario: string;
  swarmConfiguration: {
    optimalSwarmSizes: Record<string, number>;
    agentTypeDistribution: Record<string, number>;
    taskPriorityWeights: Record<string, number>;
  };
  expectedGains: {
    throughputIncrease: number;
    resourceSavings: number;
    qualityImprovement: number;
  };
  validationResults: Array<{
    timestamp: Date;
    actualGains: Record<string, number>;
    success: boolean;
  }>;
}

export interface CoordinationLearningConfig {
  enabled: boolean;
  patternDiscoveryThreshold: number;
  resourceOptimizationInterval: number; // minutes
  crossSwarmLearningEnabled: boolean;
  adaptiveResourceAllocation: boolean;
  learningHistorySize: number;
}

/**
 * Comprehensive queen management system.
 *
 * @example
 */
export class QueenCommander extends EventEmitter {
  private logger: ILogger;
  private eventBus: IEventBus;
  private memory: MemoryCoordinator;
  private config: QueenCommanderConfig;

  // Queen tracking
  private queens = new Map<string, QueenState>();
  private processes = new Map<string, ChildProcess>();
  private templates = new Map<string, QueenTemplate>();
  private clusters = new Map<string, QueenCluster>();
  private pools = new Map<string, QueenPool>();
  
  // Agent tracking (for compatibility with agent management methods)
  private agents = new Map<string, AgentState>();

  // Health monitoring
  private healthChecks = new Map<string, QueenHealth>();
  private healthInterval?: NodeJS.Timeout;
  private heartbeatInterval?: NodeJS.Timeout;

  // Scaling and policies
  private scalingPolicies = new Map<string, ScalingPolicy>();
  // private scalingOperations = new Map<string, { timestamp: Date; type: string }>();

  // Resource tracking
  private resourceUsage = new Map<
    string,
    { cpu: number; memory: number; disk: number }
  >();
  private performanceHistory = new Map<
    string,
    Array<{ timestamp: Date; metrics: AgentMetrics }>
  >();

  // SPARC task tracking
  private sparcTasks = new Map<string, SPARCTask>();
  private queenSPARCAssignments = new Map<string, QueenSPARCAssignment[]>(); // queenId -> assignments

  // TIER 2: Coordination Learning - Cross-swarm pattern aggregation and resource optimization
  private coordinationLearningConfig: CoordinationLearningConfig = {
    enabled: true,
    patternDiscoveryThreshold: 0.8,
    resourceOptimizationInterval: 30, // 30 minutes
    crossSwarmLearningEnabled: true,
    adaptiveResourceAllocation: true,
    learningHistorySize: 100,
  };

  // Learning data structures
  private crossSwarmPatterns = new Map<string, CrossSwarmPattern>();
  private swarmPerformanceProfiles = new Map<string, SwarmPerformanceProfile>();
  private resourceOptimizationStrategies = new Map<
    string,
    ResourceOptimizationStrategy
  >();
  private coordinationLearningHistory: Array<{
    timestamp: Date;
    eventType: string;
    data: unknown;
    impact: number;
  }> = [];

  // Learning intervals
  private coordinationLearningInterval?: NodeJS.Timeout;

  // TODO: Add @inject decorators for better DI integration
  // Example:
  // constructor(
  //   @inject(AGENT_TOKENS.Config) config: Partial<AgentManagerConfig>,
  //   @inject(CORE_TOKENS.Logger) logger: ILogger,
  //   @inject(CORE_TOKENS.EventBus) eventBus: IEventBus,
  //   @inject(MEMORY_TOKENS.Coordinator) memory: MemoryCoordinator
  // ) {
  constructor(
    config: Partial<QueenCommanderConfig>,
    logger: ILogger,
    eventBus: IEventBus,
    memory: MemoryCoordinator
  ) {
    super();
    this.logger = logger;
    this.eventBus = eventBus;
    this.memory = memory;

    this.config = {
      id: 'queen-commander-1',
      name: 'Primary Queen Commander',
      maxAgents: 50,
      maxConcurrentQueens: 50,
      defaultTimeout: 30000,
      heartbeatInterval: 10000,
      healthCheckInterval: 30000,
      autoRestart: true,
      resourceLimits: {
        memory: 512 * 1024 * 1024, // 512MB
        cpu: 1.0,
        disk: 1024 * 1024 * 1024, // 1GB
      },
      queenDefaults: {
        autonomyLevel: 0.7,
        learningEnabled: true,
        adaptationEnabled: true,
        borgProtocol: true,
      },
      environmentDefaults: {
        runtime: 'deno' as const,
        workingDirectory: './agents',
        tempDirectory: './tmp',
        logDirectory: './logs',
      },
      clusterConfig: {
        maxNodes: 10,
        replicationFactor: 2,
        balancingStrategy: 'least_loaded' as const,
      },
      ...config,
    };

    this.setupEventHandlers();
    this.initializeDefaultTemplates();

    // Initialize TIER 2 coordination learning
    if (this.coordinationLearningConfig.enabled) {
      this.initializeCoordinationLearning();
    }
  }

  private setupEventHandlers(): void {
    this.eventBus.on('agent:status:changed', (data: unknown) => {
      const statusData = data as {
        agentId: string;
        timestamp: Date;
        metrics?: AgentMetrics;
      };
      this.handleHeartbeat(statusData);
    });

    this.eventBus.on('system:error', (data: unknown) => {
      const errorData = data as { agentId: string; error: AgentError };
      this.handleAgentError(errorData);
    });

    this.eventBus.on('task:assigned', (data: unknown) => {
      const taskData = data as { agentId: string };
      this.updateAgentWorkload(taskData?.agentId, 1);
    });

    this.eventBus.on('task:completed', (data: unknown) => {
      const completedData = data as { agentId: string; metrics?: AgentMetrics };
      this.updateAgentWorkload(completedData?.agentId, -1);
      if (completedData?.metrics) {
        this.updateAgentMetrics(completedData?.agentId, completedData?.metrics);
      }
    });

    this.eventBus.on('system:health:changed', (data: unknown) => {
      const resourceData = data as {
        agentId: string;
        usage: { cpu: number; memory: number; disk: number };
      };
      this.updateResourceUsage(resourceData?.agentId, resourceData?.usage);
    });

    // SPARC task assignment handler from Cube Matrons
    this.eventBus.on('queen:task:assigned', (data: unknown) => {
      const assignmentData = data as QueenSPARCAssignment;
      this.handleSPARCTaskAssignment(assignmentData);
    });

    // TIER 2: Coordination learning event handlers
    this.eventBus.on('swarm:*:task:completed', (data: unknown) => {
      if (this.coordinationLearningConfig.enabled && this.isTaskCompletionData(data)) {
        this.analyzeSwarmTaskCompletion(data);
      }
    });

    this.eventBus.on('learning:coordination:cycle', (data: unknown) => {
      if (this.coordinationLearningConfig.enabled) {
        this.performCoordinationLearningCycle(data);
      }
    });

    this.eventBus.on('swarm:performance:degraded', (data: unknown) => {
      if (this.coordinationLearningConfig.adaptiveResourceAllocation && this.isSwarmDegradationData(data)) {
        this.handleSwarmPerformanceDegradation(data);
      }
    });

    this.eventBus.on('queen:coordination:learning:request', (data: unknown) => {
      this.handleLearningCoordinationRequest(data);
    });
  }

  private initializeDefaultTemplates(): void {
    // Research agent template
    this.templates.set('researcher', {
      id: 'researcher-template',
      name: 'Research Agent',
      type: 'researcher' as const,
      capabilities: {
        codeGeneration: false,
        // codeReview: false, // Property does not exist on QueenCapabilities
        // testing: false, // Property does not exist on QueenCapabilities
        documentation: true,
        research: true,
        analysis: true,
        webSearch: true,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: false,
        languages: [],
        frameworks: [],
        domains: ['research', 'analysis', 'information-gathering'],
        tools: ['web-search', 'document-analysis', 'data-extraction'],
        maxConcurrentTasks: 5,
        maxMemoryUsage: 256 * 1024 * 1024,
        maxExecutionTime: 600000,
        reliability: 0.9,
        speed: 0.8,
        quality: 0.9,
      },
      config: {
        // autonomyLevel: 0.8,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 20,
        maxConcurrentTasks: 5,
        timeoutThreshold: 600000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['web-access', 'file-read'],
        trustedAgents: [],
        expertise: { research: 0.9, analysis: 0.8, documentation: 0.7 },
        preferences: { verbose: true, detailed: true },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/researcher',
        tempDirectory: './tmp/researcher',
        logDirectory: './logs/researcher',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['web-search', 'document-reader', 'data-extractor'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-researcher.ts',
    });

    // Developer agent template
    this.templates.set('coder', {
      id: 'coder-template',
      name: 'Developer Agent',
      type: 'coder' as const,
      capabilities: {
        codeGeneration: true,
        // codeReview: true, // Property does not exist on QueenCapabilities
        // testing: true, // Property does not exist on QueenCapabilities
        documentation: true,
        research: false,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: true,
        languages: ['typescript', 'javascript', 'python', 'rust'],
        frameworks: ['deno', 'node', 'react', 'svelte'],
        domains: ['web-development', 'backend', 'api-design'],
        tools: ['git', 'editor', 'debugger', 'linter', 'formatter'],
        maxConcurrentTasks: 3,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxExecutionTime: 1200000,
        reliability: 0.95,
        speed: 0.7,
        quality: 0.95,
      },
      config: {
        // autonomyLevel: 0.6,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 10,
        maxConcurrentTasks: 3,
        timeoutThreshold: 1200000,
        reportingInterval: 60000,
        heartbeatInterval: 15000,
        permissions: [
          'file-read',
          'file-write',
          'terminal-access',
          'git-access',
        ],
        trustedAgents: [],
        expertise: { coding: 0.95, testing: 0.8, debugging: 0.9 },
        preferences: { codeStyle: 'functional', testFramework: 'deno-test' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/developer',
        tempDirectory: './tmp/developer',
        logDirectory: './logs/developer',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['git', 'deno', 'editor', 'debugger'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-developer.ts',
    });

    // Add more templates...
    this.initializeSpecializedTemplates();
  }

  private initializeSpecializedTemplates(): void {
    // Analyzer template
    this.templates.set('analyst', {
      id: 'analyst-template',
      name: 'Analyzer Agent',
      type: 'analyst' as const,
      capabilities: {
        codeGeneration: false,
        // codeReview: true, // Property does not exist on QueenCapabilities
        // testing: false, // Property does not exist on QueenCapabilities
        documentation: true,
        research: false,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: false,
        languages: ['python', 'r', 'sql'],
        frameworks: ['pandas', 'numpy', 'matplotlib'],
        domains: ['data-analysis', 'statistics', 'visualization'],
        tools: ['data-processor', 'chart-generator', 'statistical-analyzer'],
        maxConcurrentTasks: 4,
        maxMemoryUsage: 1024 * 1024 * 1024,
        maxExecutionTime: 900000,
        reliability: 0.9,
        speed: 0.75,
        quality: 0.9,
      },
      config: {
        // autonomyLevel: 0.7,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 15,
        maxConcurrentTasks: 4,
        timeoutThreshold: 900000,
        reportingInterval: 45000,
        heartbeatInterval: 12000,
        permissions: ['file-read', 'data-access'],
        trustedAgents: [],
        expertise: { analysis: 0.95, visualization: 0.8, statistics: 0.85 },
        preferences: { outputFormat: 'detailed', includeCharts: true },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/analyzer',
        tempDirectory: './tmp/analyzer',
        logDirectory: './logs/analyzer',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['data-processor', 'chart-gen', 'stats-calc'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-analyzer.ts',
    });

    // Requirements Engineer Agent Template
    this.templates.set('requirements-engineer', {
      id: 'requirements-engineer-template',
      name: 'Requirements Engineer Agent',
      type: 'requirements-engineer',
      capabilities: {
        codeGeneration: false,
        // codeReview: false, // Property does not exist on QueenCapabilities
        // testing: false, // Property does not exist on QueenCapabilities
        documentation: true,
        research: true,
        analysis: true,
        webSearch: true,
        apiIntegration: false,
        fileSystem: true,
        terminalAccess: false,
        languages: [],
        frameworks: [],
        domains: ['requirements-engineering', 'user-stories', 'ears-notation'],
        tools: ['document-writer', 'nlp-processor', 'web-search'],
        maxConcurrentTasks: 2,
        maxMemoryUsage: 256 * 1024 * 1024,
        maxExecutionTime: 300000,
        reliability: 0.95,
        speed: 0.8,
        quality: 0.95,
      },
      config: {
        // autonomyLevel: 0.8,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 10,
        maxConcurrentTasks: 2,
        timeoutThreshold: 300000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read', 'file-write'],
        trustedAgents: [],
        expertise: { requirements: 0.95, documentation: 0.9, analysis: 0.8 },
        preferences: { format: 'markdown', style: 'formal' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/requirements-engineer',
        tempDirectory: './tmp/requirements-engineer',
        logDirectory: './logs/requirements-engineer',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['document-writer', 'nlp-processor'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-requirements-engineer.ts',
    });

    // Design Architect Agent Template
    this.templates.set('design-architect', {
      id: 'design-architect-template',
      name: 'Design Architect Agent',
      type: 'design-architect',
      capabilities: {
        codeGeneration: false,
        // codeReview: true, // Property does not exist on QueenCapabilities
        // testing: false, // Property does not exist on QueenCapabilities
        documentation: true,
        research: true,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: false,
        languages: ['typescript', 'javascript', 'python'],
        frameworks: [],
        domains: ['software-architecture', 'system-design', 'data-modeling'],
        tools: ['diagram-generator', 'code-analyzer', 'api-designer'],
        maxConcurrentTasks: 1,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxExecutionTime: 600000,
        reliability: 0.9,
        speed: 0.7,
        quality: 0.95,
      },
      config: {
        // autonomyLevel: 0.7,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 5,
        maxConcurrentTasks: 1,
        timeoutThreshold: 600000,
        reportingInterval: 60000,
        heartbeatInterval: 15000,
        permissions: ['file-read', 'file-write'],
        trustedAgents: [],
        expertise: { architecture: 0.95, design: 0.9, modeling: 0.85 },
        preferences: { diagramFormat: 'mermaid', detailLevel: 'high' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/design-architect',
        tempDirectory: './tmp/design-architect',
        logDirectory: './logs/design-architect',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['diagram-gen', 'code-analyzer'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-design-architect.ts',
    });

    // Task Planner Agent Template
    this.templates.set('task-planner', {
      id: 'task-planner-template',
      name: 'Task Planner Agent',
      type: 'task-planner',
      capabilities: {
        codeGeneration: false,
        // codeReview: false, // Property does not exist on QueenCapabilities
        // testing: false, // Property does not exist on QueenCapabilities
        documentation: true,
        research: false,
        analysis: true,
        webSearch: false,
        apiIntegration: false,
        fileSystem: true,
        terminalAccess: false,
        languages: [],
        frameworks: [],
        domains: ['project-management', 'task-breakdown', 'agile-planning'],
        tools: ['task-scheduler', 'dependency-analyzer'],
        maxConcurrentTasks: 3,
        maxMemoryUsage: 256 * 1024 * 1024,
        maxExecutionTime: 300000,
        reliability: 0.95,
        speed: 0.85,
        quality: 0.9,
      },
      config: {
        // autonomyLevel: 0.8,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 20,
        maxConcurrentTasks: 3,
        timeoutThreshold: 300000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read', 'file-write'],
        trustedAgents: [],
        expertise: {
          planning: 0.95,
          'task-management': 0.9,
          optimization: 0.8,
        },
        preferences: { outputFormat: 'markdown-checkbox', granularity: 'fine' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/task-planner',
        tempDirectory: './tmp/task-planner',
        logDirectory: './logs/task-planner',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['task-scheduler', 'dependency-analyzer'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-task-planner.ts',
    });

    // Developer Agent Template (already exists, but ensure it's aligned)
    this.templates.set('developer', {
      id: 'developer-template',
      name: 'Developer Agent',
      type: 'developer',
      capabilities: {
        codeGeneration: true,
        // codeReview: true, // Property does not exist on QueenCapabilities
        // testing: true, // Property does not exist on QueenCapabilities
        documentation: true,
        research: false,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: true,
        languages: ['typescript', 'javascript', 'python', 'rust'],
        frameworks: ['deno', 'node', 'react', 'svelte'],
        domains: ['web-development', 'backend', 'api-design'],
        tools: ['git', 'editor', 'debugger', 'linter', 'formatter'],
        maxConcurrentTasks: 3,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxExecutionTime: 1200000,
        reliability: 0.95,
        speed: 0.7,
        quality: 0.95,
      },
      config: {
        // autonomyLevel: 0.6,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 10,
        maxConcurrentTasks: 3,
        timeoutThreshold: 1200000,
        reportingInterval: 60000,
        heartbeatInterval: 15000,
        permissions: [
          'file-read',
          'file-write',
          'terminal-access',
          'git-access',
        ],
        trustedAgents: [],
        expertise: { coding: 0.95, testing: 0.8, debugging: 0.9 },
        preferences: { codeStyle: 'functional', testFramework: 'deno-test' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/developer',
        tempDirectory: './tmp/developer',
        logDirectory: './logs/developer',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['git', 'deno', 'editor', 'debugger'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-developer.ts',
    });

    // System Architect Agent Template
    this.templates.set('system-architect', {
      id: 'system-architect-template',
      name: 'System Architect Agent',
      type: 'system-architect',
      capabilities: {
        codeGeneration: false,
        // codeReview: true, // Property does not exist on QueenCapabilities
        // testing: false, // Property does not exist on QueenCapabilities
        documentation: true,
        research: true,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: false,
        languages: ['typescript', 'javascript', 'python'],
        frameworks: ['microservices', 'distributed-systems'],
        domains: [
          'system-architecture',
          'scalability',
          'performance',
          'distributed-systems',
        ],
        tools: [
          'architecture-analyzer',
          'system-modeler',
          'performance-analyzer',
        ],
        maxConcurrentTasks: 1,
        maxMemoryUsage: 512 * 1024 * 1024,
        maxExecutionTime: 900000,
        reliability: 0.95,
        speed: 0.7,
        quality: 0.95,
      },
      config: {
        // autonomyLevel: 0.8,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 5,
        maxConcurrentTasks: 1,
        timeoutThreshold: 900000,
        reportingInterval: 60000,
        heartbeatInterval: 15000,
        permissions: ['file-read', 'file-write'],
        trustedAgents: [],
        expertise: {
          'system-architecture': 0.95,
          scalability: 0.9,
          performance: 0.85,
        },
        preferences: { scope: 'system-wide', focusArea: 'architecture' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/system-architect',
        tempDirectory: './tmp/system-architect',
        logDirectory: './logs/system-architect',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['architecture-analyzer', 'system-modeler'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-system-architect.ts',
    });

    // Tester Agent Template
    this.templates.set('tester', {
      id: 'tester-template',
      name: 'Testing Agent',
      type: 'tester',
      capabilities: {
        codeGeneration: false,
        // codeReview: true, // Property does not exist on QueenCapabilities
        // testing: true, // Property does not exist on QueenCapabilities
        documentation: true,
        research: false,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: true,
        languages: ['typescript', 'javascript', 'python'],
        frameworks: ['deno-test', 'jest', 'vitest', 'cypress'],
        domains: ['testing', 'quality-assurance', 'test-automation'],
        tools: ['test-runner', 'coverage-analyzer', 'test-generator'],
        maxConcurrentTasks: 3,
        maxMemoryUsage: 256 * 1024 * 1024,
        maxExecutionTime: 600000,
        reliability: 0.9,
        speed: 0.8,
        quality: 0.9,
      },
      config: {
        // autonomyLevel: 0.7,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 15,
        maxConcurrentTasks: 3,
        timeoutThreshold: 600000,
        reportingInterval: 45000,
        heartbeatInterval: 12000,
        permissions: ['file-read', 'file-write', 'terminal-access'],
        trustedAgents: [],
        expertise: { testing: 0.9, 'quality-assurance': 0.85, automation: 0.8 },
        preferences: { testFramework: 'deno-test', coverage: 'comprehensive' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/tester',
        tempDirectory: './tmp/tester',
        logDirectory: './logs/tester',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['test-runner', 'coverage-tool', 'test-gen'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-tester.ts',
    });

    // Code Reviewer Agent Template
    this.templates.set('reviewer', {
      id: 'reviewer-template',
      name: 'Code Review Agent',
      type: 'reviewer',
      capabilities: {
        codeGeneration: false,
        // codeReview: true, // Property does not exist on QueenCapabilities
        // testing: false, // Property does not exist on QueenCapabilities
        documentation: true,
        research: false,
        analysis: true,
        webSearch: false,
        apiIntegration: false,
        fileSystem: true,
        terminalAccess: false,
        languages: ['typescript', 'javascript', 'python', 'rust'],
        frameworks: ['static-analysis', 'code-quality'],
        domains: ['code-review', 'quality-assurance', 'best-practices'],
        tools: ['static-analyzer', 'code-quality-checker', 'security-scanner'],
        maxConcurrentTasks: 2,
        maxMemoryUsage: 256 * 1024 * 1024,
        maxExecutionTime: 450000,
        reliability: 0.95,
        speed: 0.8,
        quality: 0.95,
      },
      config: {
        // autonomyLevel: 0.8,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 12,
        maxConcurrentTasks: 2,
        timeoutThreshold: 450000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read'],
        trustedAgents: [],
        expertise: {
          'code-review': 0.95,
          'quality-assurance': 0.9,
          security: 0.8,
        },
        preferences: { style: 'thorough', focus: 'quality-and-security' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/reviewer',
        tempDirectory: './tmp/reviewer',
        logDirectory: './logs/reviewer',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['static-analyzer', 'quality-checker'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-reviewer.ts',
    });

    // Steering Author Agent Template
    this.templates.set('steering-author', {
      id: 'steering-author-template',
      name: 'Steering Author Agent',
      type: 'steering-author',
      capabilities: {
        codeGeneration: false,
        // codeReview: true, // Property does not exist on QueenCapabilities
        // testing: false, // Property does not exist on QueenCapabilities
        documentation: true,
        research: true,
        analysis: true,
        webSearch: false,
        apiIntegration: false,
        fileSystem: true,
        terminalAccess: false,
        languages: [],
        frameworks: [],
        domains: ['documentation', 'knowledge-management', 'governance'],
        tools: ['document-writer', 'content-analyzer'],
        maxConcurrentTasks: 1,
        maxMemoryUsage: 256 * 1024 * 1024,
        maxExecutionTime: 300000,
        reliability: 0.95,
        speed: 0.7,
        quality: 0.98,
      },
      config: {
        // autonomyLevel: 0.7,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 5,
        maxConcurrentTasks: 1,
        timeoutThreshold: 300000,
        reportingInterval: 30000,
        heartbeatInterval: 10000,
        permissions: ['file-read', 'file-write'],
        trustedAgents: [],
        expertise: {
          documentation: 0.98,
          governance: 0.9,
          'content-creation': 0.85,
        },
        preferences: { style: 'concise', tone: 'formal' },
      },
      environment: {
        // runtime: 'deno',
        version: '1.40.0',
        workingDirectory: './agents/steering-author',
        tempDirectory: './tmp/steering-author',
        logDirectory: './logs/steering-author',
        apiEndpoints: {},
        credentials: {},
        availableTools: ['document-writer', 'content-analyzer'],
        toolConfigs: {},
      },
      startupScript: './scripts/start-steering-author.ts',
    });
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing agent manager', {
      maxAgents: this.config.maxAgents,
      templates: this.templates.size,
    });

    // Start health monitoring
    this.startHealthMonitoring();

    // Start heartbeat monitoring
    this.startHeartbeatMonitoring();

    // Initialize default scaling policies
    this.initializeScalingPolicies();

    this.emit('agent-manager:initialized');
  }

  // ==================== TIER 2: COORDINATION LEARNING METHODS ====================

  /**
   * Initialize TIER 2 coordination learning system
   */
  private initializeCoordinationLearning(): void {
    this.logger.info('Initializing TIER 2 coordination learning system');

    // Load persistent coordination learning data
    this.loadCoordinationLearningData();

    // Start coordination learning cycle
    this.coordinationLearningInterval = setInterval(
      () => {
        this.performResourceOptimizationCycle();
      },
      this.coordinationLearningConfig.resourceOptimizationInterval * 60 * 1000
    );

    this.logger.info(
      'TIER 2 coordination learning initialized - cross-swarm pattern discovery active'
    );
  }

  /**
   * Analyze completed swarm tasks for cross-swarm patterns
   */
  private async analyzeSwarmTaskCompletion(taskData: TaskCompletionData): Promise<void> {
    const swarmId = taskData.swarmId;
    const performance = taskData.metrics?.qualityScore || 0.8;
    const resourceUsage = taskData.metrics?.resourceUsage || {};
    const duration = taskData.duration || 0;

    // Update swarm performance profile
    await this.updateSwarmPerformanceProfile(swarmId, taskData);

    // Detect cross-swarm collaboration patterns
    if (taskData.collaboratedWith && taskData.collaboratedWith.length > 0) {
      await this.detectCrossSwarmCollaborationPattern(taskData);
    }

    // Analyze resource optimization opportunities
    if (this.coordinationLearningConfig.adaptiveResourceAllocation) {
      await this.analyzeResourceOptimizationOpportunity(taskData);
    }

    // Record learning event
    this.recordCoordinationLearningEvent(
      'swarm_task_completion',
      taskData,
      performance
    );

    this.logger.debug(
      `Analyzed swarm task completion for coordination learning: ${swarmId}`,
      {
        performance,
        resourceUsage,
        duration,
      }
    );
  }

  /**
   * Update swarm performance profile for better coordination decisions
   */
  private async updateSwarmPerformanceProfile(
    swarmId: string,
    taskData: TaskCompletionData
  ): Promise<void> {
    let profile = this.swarmPerformanceProfiles.get(swarmId);

    if (!profile) {
      profile = {
        swarmId,
        commanderType: taskData.commanderType || 'general',
        averagePerformance: taskData.metrics?.qualityScore || 0.8,
        taskTypes: [taskData.taskType || 'general'],
        preferredAgentTypes: taskData.agentTypes || [],
        optimalResourceAllocation: {
          cpu: (typeof taskData.metrics?.resourceUsage?.cpu === 'number' ? taskData.metrics.resourceUsage.cpu : 0.5),
          memory: (typeof taskData.metrics?.resourceUsage?.memory === 'number' ? taskData.metrics.resourceUsage.memory : 0.5),
          agents: taskData.agentCount || 1,
        },
        collaborationPatterns: [],
        bottlenecks: [],
        strengthAreas: [],
        lastProfileUpdate: new Date(),
      };
    } else {
      // Update with weighted average for better learning
      const weight = 0.8;
      profile.averagePerformance =
        profile.averagePerformance * weight +
        (taskData.metrics?.qualityScore || 0.8) * (1 - weight);

      // Add new task type if not already present
      if (taskData.taskType && !profile.taskTypes.includes(taskData.taskType)) {
        profile.taskTypes.push(taskData.taskType);
      }

      // Update resource allocation based on successful patterns
      if (taskData.metrics?.qualityScore > 0.9) {
        const cpuUsage = (typeof taskData.metrics?.resourceUsage?.cpu === 'number' ? taskData.metrics.resourceUsage.cpu : 0.5);
        const memoryUsage = (typeof taskData.metrics?.resourceUsage?.memory === 'number' ? taskData.metrics.resourceUsage.memory : 0.5);
        profile.optimalResourceAllocation.cpu =
          (profile.optimalResourceAllocation.cpu || 0.5) * weight +
          cpuUsage * (1 - weight);
        profile.optimalResourceAllocation.memory =
          (profile.optimalResourceAllocation.memory || 0.5) * weight +
          memoryUsage * (1 - weight);
      }

      // Identify bottlenecks from poor performance
      if (taskData.metrics?.qualityScore < 0.7) {
        const bottleneck = this.identifyBottleneckFromTaskData(taskData);
        if (bottleneck && !profile.bottlenecks.includes(bottleneck)) {
          profile.bottlenecks.push(bottleneck);
        }
      }

      // Identify strength areas from high performance
      if (taskData.metrics?.qualityScore > 0.9) {
        const strength = taskData.taskType || 'task_execution';
        if (!profile.strengthAreas.includes(strength)) {
          profile.strengthAreas.push(strength);
        }
      }

      profile.lastProfileUpdate = new Date();
    }

    this.swarmPerformanceProfiles.set(swarmId, profile);

    // Save to persistent memory for cross-session learning
    await this.saveCoordinationLearningData();
  }

  /**
   * Detect cross-swarm collaboration patterns
   */
  private async detectCrossSwarmCollaborationPattern(
    taskData: TaskCompletionData
  ): Promise<void> {
    const mainSwarmId = taskData.swarmId;
    const collaboratedSwarms = taskData.collaboratedWith || [];
    const performance = taskData.metrics?.qualityScore || 0.8;

    if (
      performance > this.coordinationLearningConfig.patternDiscoveryThreshold
    ) {
      // This was a successful collaboration - learn from it
      const patternId = `collab_${mainSwarmId}_${collaboratedSwarms.join('_')}_${Date.now()}`;

      const pattern: CrossSwarmPattern = {
        patternId,
        patternType: 'agent-collaboration',
        sourceSwarms: [mainSwarmId, ...collaboratedSwarms],
        effectiveness: performance,
        contexts: [
          taskData.taskType || 'general',
          taskData.domain || 'development',
        ],
        resourceOptimization: {
          cpuReduction: taskData.metrics?.resourceSavings?.cpu || 0,
          memoryReduction: taskData.metrics?.resourceSavings?.memory || 0,
          timeReduction: taskData.metrics?.timeReduction || 0,
        },
        successMetrics: {
          taskCompletionRate: 1.0, // Since this task completed successfully
          qualityScore: performance,
          resourceUtilization: taskData.metrics?.resourceUtilization || 0.8,
        },
        discoveryTimestamp: new Date(),
        usageCount: 1,
        lastUsed: new Date(),
      };

      this.crossSwarmPatterns.set(patternId, pattern);

      this.logger.info(
        `Discovered cross-swarm collaboration pattern: ${patternId}`,
        {
          effectiveness: performance,
          swarms: pattern.sourceSwarms.length,
        }
      );

      // Save learning data
      await this.saveCoordinationLearningData();
    }
  }

  /**
   * Analyze resource optimization opportunities
   */
  private async analyzeResourceOptimizationOpportunity(
    taskData: TaskCompletionData
  ): Promise<void> {
    const swarmId = taskData.swarmId;
    const resourceUsage = taskData.metrics?.resourceUsage || {};
    const performance = Number(taskData.metrics?.qualityScore) || 0.8;
    const duration = Number(taskData.duration) || 0;

    // Check if this task used resources efficiently
    const cpuEfficiency = performance / (Number(resourceUsage.cpu) || 0.5);
    const memoryEfficiency = performance / (Number(resourceUsage.memory) || 0.5);
    const timeEfficiency = performance / (duration / 1000 / 60); // performance per minute

    // If efficiency is high, this could be a good optimization strategy
    if (cpuEfficiency > 1.5 && memoryEfficiency > 1.5 && timeEfficiency > 0.1) {
      const strategyId = `opt_${taskData.taskType}_${swarmId}_${Date.now()}`;

      const strategy: ResourceOptimizationStrategy = {
        strategyId,
        name: `Optimized ${taskData.taskType} execution`,
        targetScenario: taskData.taskType || 'general',
        swarmConfiguration: {
          optimalSwarmSizes: {
            [taskData.commanderType]: taskData.agentCount || 1,
          },
          agentTypeDistribution: this.calculateAgentTypeDistribution(
            taskData.agentTypes || []
          ),
          taskPriorityWeights: { [taskData.priority || 'medium']: 1.0 },
        },
        expectedGains: {
          throughputIncrease: timeEfficiency * 0.1,
          resourceSavings: (cpuEfficiency + memoryEfficiency) * 0.05,
          qualityImprovement: (performance - 0.8) * 0.1,
        },
        validationResults: [
          {
            timestamp: new Date(),
            actualGains: {
              throughput: timeEfficiency,
              resources: cpuEfficiency,
              quality: performance,
            },
            success: true,
          },
        ],
      };

      this.resourceOptimizationStrategies.set(strategyId, strategy);

      this.logger.info(
        `Discovered resource optimization strategy: ${strategyId}`,
        {
          cpuEfficiency: cpuEfficiency.toFixed(2),
          memoryEfficiency: memoryEfficiency.toFixed(2),
          timeEfficiency: timeEfficiency.toFixed(2),
        }
      );
    }
  }

  /**
   * Perform periodic coordination learning cycle
   */
  private async performCoordinationLearningCycle(data: unknown): Promise<void> {
    this.logger.info('Performing TIER 2 coordination learning cycle');

    // Analyze cross-swarm patterns for effectiveness
    await this.analyzePatternEffectiveness();

    // Update resource optimization strategies
    await this.updateResourceOptimizationStrategies();

    // Generate recommendations for swarm coordination
    const recommendations = await this.generateCoordinationRecommendations();

    // Apply adaptive resource allocation if enabled
    if (this.coordinationLearningConfig.adaptiveResourceAllocation) {
      await this.applyAdaptiveResourceAllocation(recommendations);
    }

    // Clean up old learning data
    this.cleanupLearningHistory();

    this.logger.info(
      `Coordination learning cycle completed - ${recommendations.length} recommendations generated`
    );
  }

  /**
   * Perform resource optimization cycle
   */
  private async performResourceOptimizationCycle(): Promise<void> {
    this.logger.info('Performing resource optimization cycle');

    // Analyze current resource utilization across all swarms
    const resourceAnalysis = this.analyzeGlobalResourceUtilization();

    // Find optimization opportunities
    const optimizations =
      await this.findResourceOptimizationOpportunities(resourceAnalysis);

    // Apply validated optimizations
    for (const optimization of optimizations) {
      if (this.validateResourceOptimization(optimization)) {
        await this.applyResourceOptimization(optimization);
      }
    }

    this.logger.info(
      `Resource optimization cycle completed - ${optimizations.length} optimizations considered`
    );
  }

  /**
   * Handle swarm performance degradation with adaptive coordination
   */
  private async handleSwarmPerformanceDegradation(
    data: SwarmDegradationData
  ): Promise<void> {
    const swarmId = data.swarmId;
    const degradationReason = data.reason;

    this.logger.warn(
      `Swarm performance degradation detected: ${swarmId} - ${degradationReason}`
    );

    // Find applicable cross-swarm patterns that might help
    const applicablePatterns = Array.from(
      this.crossSwarmPatterns.values()
    ).filter(
      (pattern) =>
        pattern.patternType === 'bottleneck-resolution' &&
        pattern.effectiveness > 0.8
    );

    // Apply the most effective pattern
    if (applicablePatterns.length > 0) {
      const bestPattern = applicablePatterns.sort(
        (a, b) => b.effectiveness - a.effectiveness
      )[0];
      await this.applyCrossSwarmPattern(swarmId, bestPattern);

      this.logger.info(
        `Applied cross-swarm pattern to resolve performance degradation: ${bestPattern.patternId}`
      );
    }

    // Request Learning Orchestrator to consider learning mode change
    this.eventBus.emitSystemEvent({
      id: `learning-request-${swarmId}-${Date.now()}`,
      type: 'learning:request',
      source: 'queen-coordinator',
      timestamp: new Date(),
      payload: {
        swarmId,
        reason: `performance_degradation: ${degradationReason}`,
        requestedMode: 'aggressive',
        duration: 60,
        priority: 'high',
      },
    });
  }

  /**
   * Handle learning coordination requests
   */
  private async handleLearningCoordinationRequest(
    data: unknown
  ): Promise<void> {
    const requestData = data as any;
    const requestType = requestData.requestType;
    const swarmIds = requestData.swarmIds || [];

    this.logger.info(
      `Handling learning coordination request: ${requestType} for ${swarmIds.length} swarms`
    );

    switch (requestType) {
      case 'pattern_sharing':
        await this.sharePatternsBetweenSwarms(swarmIds);
        break;
      case 'resource_rebalancing':
        await this.coordinateResourceRebalancing(swarmIds);
        break;
      case 'collaborative_learning':
        await this.orchestrateCollaborativeLearning(swarmIds);
        break;
      default:
        this.logger.warn(
          `Unknown learning coordination request type: ${requestType}`
        );
    }
  }

  /**
   * Generate coordination recommendations based on learned patterns
   */
  private async generateCoordinationRecommendations(): Promise<
    Array<{
      type: string;
      swarmId: string;
      recommendation: string;
      expectedImprovement: number;
      confidence: number;
    }>
  > {
    const recommendations: Array<{
      type: string;
      swarmId: string;
      recommendation: string;
      expectedImprovement: number;
      confidence: number;
    }> = [];

    // Analyze each swarm performance profile for improvement opportunities
    for (const [swarmId, profile] of Array.from(this.swarmPerformanceProfiles.entries())) {
      if (profile.averagePerformance < 0.8) {
        // Find patterns that could help this swarm
        const helpfulPatterns = Array.from(
          this.crossSwarmPatterns.values()
        ).filter(
          (pattern) =>
            pattern.effectiveness > profile.averagePerformance &&
            pattern.contexts.some((context) =>
              profile.taskTypes.includes(context)
            )
        );

        if (helpfulPatterns.length > 0) {
          const bestPattern = helpfulPatterns.sort(
            (a, b) => b.effectiveness - a.effectiveness
          )[0];

          recommendations.push({
            type: 'pattern_application',
            swarmId,
            recommendation: `Apply cross-swarm pattern ${bestPattern.patternId} to improve performance`,
            expectedImprovement:
              bestPattern.effectiveness - profile.averagePerformance,
            confidence: bestPattern.usageCount > 3 ? 0.9 : 0.7,
          });
        }

        // Check for resource optimization opportunities
        const applicableStrategies = Array.from(
          this.resourceOptimizationStrategies.values()
        ).filter(
          (strategy) =>
            strategy.targetScenario === 'general' ||
            profile.taskTypes.includes(strategy.targetScenario)
        );

        if (applicableStrategies.length > 0) {
          const bestStrategy = applicableStrategies.sort(
            (a, b) =>
              b.expectedGains.throughputIncrease -
              a.expectedGains.throughputIncrease
          )[0];

          recommendations.push({
            type: 'resource_optimization',
            swarmId,
            recommendation: `Apply resource optimization strategy ${bestStrategy.strategyId}`,
            expectedImprovement: bestStrategy.expectedGains.throughputIncrease,
            confidence: bestStrategy.validationResults.length > 2 ? 0.8 : 0.6,
          });
        }
      }
    }

    return recommendations;
  }

  // === TYPE GUARDS ===

  private isTaskCompletionData(data: unknown): data is TaskCompletionData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'swarmId' in data &&
      typeof (data as any).swarmId === 'string'
    );
  }

  private isSwarmDegradationData(data: unknown): data is SwarmDegradationData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'swarmId' in data &&
      'reason' in data &&
      typeof (data as any).swarmId === 'string' &&
      typeof (data as any).reason === 'string'
    );
  }

  // === TIER 2 UTILITY METHODS ===

  private identifyBottleneckFromTaskData(taskData: TaskCompletionData): string | null {
    if (Number(taskData.metrics?.resourceUsage?.cpu) > 0.9) return 'cpu_bottleneck';
    if (Number(taskData.metrics?.resourceUsage?.memory) > 0.9)
      return 'memory_bottleneck';
    const estimatedDuration = Number((taskData as any).estimatedDuration) || 0;
    if (Number(taskData.duration) > estimatedDuration * 2)
      return 'time_bottleneck';
    if ((taskData as any).agentErrors?.length > 0)
      return 'agent_coordination_bottleneck';
    return null;
  }

  private calculateAgentTypeDistribution(
    agentTypes: string[]
  ): Record<string, number> {
    const distribution: Record<string, number> = {};
    const total = agentTypes.length;

    for (const agentType of agentTypes) {
      distribution[agentType] = (distribution[agentType] || 0) + 1 / total;
    }

    return distribution;
  }

  private analyzeGlobalResourceUtilization(): {
    totalCpu: number;
    totalMemory: number;
    swarmUtilizations: Record<
      string,
      { cpu: number; memory: number; efficiency: number }
    >;
  } {
    let totalCpu = 0;
    let totalMemory = 0;
    const swarmUtilizations: Record<
      string,
      { cpu: number; memory: number; efficiency: number }
    > = {};

    for (const [swarmId, profile] of Array.from(this.swarmPerformanceProfiles.entries())) {
      const cpu = profile.optimalResourceAllocation.cpu;
      const memory = profile.optimalResourceAllocation.memory;
      const efficiency = profile.averagePerformance;

      totalCpu += cpu;
      totalMemory += memory;
      swarmUtilizations[swarmId] = { cpu, memory, efficiency };
    }

    return { totalCpu, totalMemory, swarmUtilizations };
  }

  private async findResourceOptimizationOpportunities(
    resourceAnalysis: unknown
  ): Promise<any[]> {
    const opportunities: unknown[] = [];

    // Find overutilized swarms that could benefit from load balancing
    const resourceAnalysisTyped = resourceAnalysis as any;
    Object.entries(resourceAnalysisTyped.swarmUtilizations || {}).forEach(
      ([swarmId, utilization]: [string, any]) => {
        if (utilization.cpu > 0.8 || utilization.memory > 0.8) {
          if (utilization.efficiency < 0.7) {
            opportunities.push({
              type: 'load_balancing',
              swarmId,
              suggestion: 'Redistribute load to underutilized swarms',
              expectedGain: 0.2,
            });
          }
        }
      }
    );

    return opportunities;
  }

  private validateResourceOptimization(optimization: unknown): boolean {
    // Simple validation - in production this would be more sophisticated
    const opt = optimization as any;
    return opt.expectedGain > 0.1 && opt.swarmId;
  }

  private async applyResourceOptimization(
    optimization: unknown
  ): Promise<void> {
    const opt = optimization as any;
    this.logger.info(
      `Applying resource optimization: ${opt.type} for swarm ${opt.swarmId}`
    );

    // Emit optimization event for swarm system to handle
    this.eventBus.emitSystemEvent({
      id: `opt-${Date.now()}`,
      type: 'resource:optimization',
      source: 'queen-coordinator',
      timestamp: new Date(),
      payload: {
        swarmId: opt.swarmId,
        optimizationType: opt.type,
        parameters: optimization,
        coordinatedBy: 'queen-coordinator',
      },
    });
  }

  private async analyzePatternEffectiveness(): Promise<void> {
    // Update effectiveness scores based on recent usage
    for (const [patternId, pattern] of Array.from(this.crossSwarmPatterns.entries())) {
      if (pattern.usageCount > 5) {
        // Pattern has been used enough to have reliable effectiveness data
        // In a real system, we would gather actual performance data
        pattern.effectiveness = Math.min(0.95, pattern.effectiveness + 0.01);
      }
    }
  }

  private async updateResourceOptimizationStrategies(): Promise<void> {
    // Update strategies based on recent validation results
    for (const [
      strategyId,
      strategy,
    ] of Array.from(this.resourceOptimizationStrategies.entries())) {
      const recentResults = strategy.validationResults.slice(-5);
      if (recentResults.length > 0) {
        const avgSuccess =
          recentResults.reduce((sum, r) => sum + (r.success ? 1 : 0), 0) /
          recentResults.length;
        if (avgSuccess > 0.8) {
          // Strategy is working well, increase confidence
          strategy.expectedGains.throughputIncrease *= 1.1;
        }
      }
    }
  }

  private async applyAdaptiveResourceAllocation(
    recommendations: unknown[]
  ): Promise<void> {
    for (const rec of recommendations.filter((r: any) => r.confidence > 0.7)) {
      this.eventBus.emitSystemEvent({
        id: `alloc-${Date.now()}`,
        type: 'adaptive:resource:allocation',
        source: 'queen-coordinator',
        timestamp: new Date(),
        payload: {
          swarmId: (rec as any).swarmId,
          recommendation: rec,
          coordinatedBy: 'queen-coordinator',
        },
      });
    }
  }

  private async applyCrossSwarmPattern(
    swarmId: string,
    pattern: CrossSwarmPattern
  ): Promise<void> {
    pattern.usageCount++;
    pattern.lastUsed = new Date();

    this.eventBus.emitSystemEvent({
      id: `pattern-${Date.now()}`,
      type: 'cross:swarm:pattern:applied',
      source: 'queen-coordinator',
      timestamp: new Date(),
      payload: {
        swarmId,
        patternId: pattern.patternId,
        patternType: pattern.patternType,
        expectedEffectiveness: pattern.effectiveness,
      },
    });
  }

  private async sharePatternsBetweenSwarms(swarmIds: string[]): Promise<void> {
    const applicablePatterns = Array.from(
      this.crossSwarmPatterns.values()
    ).filter((pattern) => pattern.effectiveness > 0.8);

    for (const swarmId of swarmIds) {
      this.eventBus.emitSystemEvent({
        id: `patterns-shared-${swarmId}-${Date.now()}`,
        type: `swarm:${swarmId}:patterns:shared`,
        source: 'queen-coordinator',
        timestamp: new Date(),
        payload: {
          patterns: applicablePatterns,
          sharedBy: 'queen-coordinator',
        },
      });
    }
  }

  private async coordinateResourceRebalancing(
    swarmIds: string[]
  ): Promise<void> {
    const totalResources = this.analyzeGlobalResourceUtilization();
    const averageUtilization = totalResources.totalCpu / swarmIds.length;

    for (const swarmId of swarmIds) {
      const utilization = totalResources.swarmUtilizations[swarmId];
      if (utilization && utilization.cpu > averageUtilization * 1.2) {
        // This swarm is over-utilizing, suggest rebalancing
        this.eventBus.emitSystemEvent({
          id: `resource-rebalance-${swarmId}-${Date.now()}`,
          type: `swarm:${swarmId}:resource:rebalance`,
          source: 'queen-coordinator',
          timestamp: new Date(),
          payload: {
            currentUtilization: utilization,
            targetUtilization: averageUtilization,
            coordinatedBy: 'queen-coordinator',
          },
        });
      }
    }
  }

  private async orchestrateCollaborativeLearning(
    swarmIds: string[]
  ): Promise<void> {
    // Create collaborative learning session between swarms
    this.eventBus.emitSystemEvent({
      id: `collaborative-learning-${Date.now()}`,
      type: 'queen:collaborative:learning:session',
      source: 'queen-coordinator',
      timestamp: new Date(),
      payload: {
        participatingSwarms: swarmIds,
        sessionType: 'cross_swarm_pattern_sharing',
        patterns: Array.from(this.crossSwarmPatterns.values()),
        profiles: Array.from(this.swarmPerformanceProfiles.values()).filter(
          (profile) => swarmIds.includes(profile.swarmId)
        ),
      },
    });
  }

  private cleanupLearningHistory(): void {
    // Keep only recent learning history
    if (
      this.coordinationLearningHistory.length >
      this.coordinationLearningConfig.learningHistorySize
    ) {
      this.coordinationLearningHistory = this.coordinationLearningHistory.slice(
        -this.coordinationLearningConfig.learningHistorySize
      );
    }

    // Remove old patterns that haven't been used recently
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    for (const [patternId, pattern] of Array.from(this.crossSwarmPatterns.entries())) {
      if (pattern.lastUsed < oneMonthAgo && pattern.usageCount < 3) {
        this.crossSwarmPatterns.delete(patternId);
      }
    }
  }

  private recordCoordinationLearningEvent(
    eventType: string,
    data: unknown,
    impact: number
  ): void {
    this.coordinationLearningHistory.push({
      timestamp: new Date(),
      eventType,
      data,
      impact,
    });
  }

  private async loadCoordinationLearningData(): Promise<void> {
    try {
      const decision = await this.memory.coordinate({
        type: 'read',
        sessionId: 'queen-coordinator-learning',
        target: 'coordination:learning:data',
      });

      const learningData = decision.metadata?.data as any;

      if (learningData) {
        // Restore learning data from memory
        if (learningData.crossSwarmPatterns) {
          for (const [patternId, pattern] of Object.entries(
            learningData.crossSwarmPatterns
          )) {
            this.crossSwarmPatterns.set(
              patternId,
              pattern as CrossSwarmPattern
            );
          }
        }

        if (learningData.swarmPerformanceProfiles) {
          for (const [swarmId, profile] of Object.entries(
            learningData.swarmPerformanceProfiles
          )) {
            this.swarmPerformanceProfiles.set(
              swarmId,
              profile as SwarmPerformanceProfile
            );
          }
        }

        if (learningData.resourceOptimizationStrategies) {
          for (const [strategyId, strategy] of Object.entries(
            learningData.resourceOptimizationStrategies
          )) {
            this.resourceOptimizationStrategies.set(
              strategyId,
              strategy as ResourceOptimizationStrategy
            );
          }
        }

        this.logger.info(
          'Loaded TIER 2 coordination learning data from persistent memory'
        );
      }
    } catch (error) {
      this.logger.warn(`Failed to load coordination learning data: ${error}`);
    }
  }

  private async saveCoordinationLearningData(): Promise<void> {
    try {
      const learningData = {
        crossSwarmPatterns: Object.fromEntries(this.crossSwarmPatterns),
        swarmPerformanceProfiles: Object.fromEntries(
          this.swarmPerformanceProfiles
        ),
        resourceOptimizationStrategies: Object.fromEntries(
          this.resourceOptimizationStrategies
        ),
        lastSaved: new Date(),
      };

      await this.memory.coordinate({
        type: 'write',
        sessionId: 'queen-coordinator-learning',
        target: 'coordination:learning:data',
        metadata: {
          data: learningData,
          type: 'coordination-learning',
          tags: ['tier2', 'learning', 'coordination', 'persistent'],
          partition: 'learning',
        },
      });

      this.logger.debug(
        'Saved TIER 2 coordination learning data to persistent memory'
      );
    } catch (error) {
      this.logger.error(`Failed to save coordination learning data: ${error}`);
    }
  }

  /**
   * Get TIER 2 coordination learning status
   */
  public getCoordinationLearningStatus(): {
    enabled: boolean;
    crossSwarmPatterns: number;
    swarmProfiles: number;
    optimizationStrategies: number;
    recentLearningEvents: number;
    averagePatternEffectiveness: number;
  } {
    const patterns = Array.from(this.crossSwarmPatterns.values());
    const averageEffectiveness =
      patterns.length > 0
        ? patterns.reduce((sum, p) => sum + p.effectiveness, 0) /
          patterns.length
        : 0;

    return {
      enabled: this.coordinationLearningConfig.enabled,
      crossSwarmPatterns: this.crossSwarmPatterns.size,
      swarmProfiles: this.swarmPerformanceProfiles.size,
      optimizationStrategies: this.resourceOptimizationStrategies.size,
      recentLearningEvents: this.coordinationLearningHistory.filter(
        (event) => event.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      averagePatternEffectiveness: averageEffectiveness,
    };
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down queen coordinator');

    // Stop monitoring
    if (this.healthInterval) clearInterval(this.healthInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    // Stop coordination learning
    if (this.coordinationLearningInterval)
      clearInterval(this.coordinationLearningInterval);

    // Save final coordination learning data
    if (this.coordinationLearningConfig.enabled) {
      await this.saveCoordinationLearningData();
    }

    // Gracefully shutdown all agents
    const shutdownPromises = Array.from(this.agents.keys()).map((agentId) =>
      this.stopAgent(agentId, 'shutdown')
    );

    await Promise.all(shutdownPromises);

    this.emit('queen-coordinator:shutdown');

    this.logger.info(
      'Queen coordinator shutdown complete - TIER 2 coordination learning preserved'
    );
  }

  // === AGENT LIFECYCLE ===

  async createAgent(
    templateName: string,
    overrides: {
      name?: string;
      config?: Partial<CompleteAgentConfig>;
      environment?: Partial<AgentEnvironment>;
    } = {}
  ): Promise<string> {
    if (this.agents.size >= this.config.maxAgents) {
      throw new Error('Maximum agent limit reached');
    }

    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const agentId = generateId('agent');
    const swarmId = 'default'; // Could be parameterized

    const agent: AgentState = {
      id: { id: agentId, swarmId, type: template.type as AgentType, instance: 1 },
      name: overrides.name || `${template.name}-${agentId.slice(-8)}`,
      type: template.type as AgentType,
      status: 'initializing',
      capabilities: { ...template.capabilities },
      metrics: this.createDefaultMetrics(),
      workload: 0,
      health: 1.0,
      config: {
        name: overrides.name || `${template.name}-${agentId.slice(-8)}`,
        type: template.type as AgentType,
        swarmId,
        autonomyLevel:
          template.config.autonomyLevel ??
          this.config.queenDefaults.autonomyLevel,
        learningEnabled:
          template.config.learningEnabled ??
          this.config.queenDefaults.learningEnabled,
        adaptationEnabled:
          template.config.adaptationEnabled ??
          this.config.queenDefaults.adaptationEnabled,
        maxTasksPerHour: template.config.maxTasksPerHour ?? 10,
        maxConcurrentTasks: template.config.maxConcurrentTasks ?? 3,
        timeoutThreshold: template.config.timeoutThreshold ?? 300000,
        reportingInterval: template.config.reportingInterval ?? 30000,
        heartbeatInterval: template.config.heartbeatInterval ?? 10000,
        permissions: template.config.permissions ?? [],
        trustedAgents: template.config.trustedAgents ?? [],
        expertise: template.config.expertise ?? {},
        preferences: template.config.preferences ?? {},
        // Required properties for CompleteAgentConfig compatibility
        specializations: [],
        preferredTaskTypes: [template.type],
        timeout: 30000,
        retryAttempts: 3,
        ...overrides.config,
      },
      environment: {
        platform: template.environment.platform ?? process.platform,
        runtime:
          template.environment.runtime ??
          this.config.environmentDefaults.runtime,
        version: template.environment.version ?? '1.40.0',
        workingDirectory:
          template.environment.workingDirectory ??
          this.config.environmentDefaults.workingDirectory,
        tempDirectory:
          template.environment.tempDirectory ??
          this.config.environmentDefaults.tempDirectory,
        logDirectory:
          template.environment.logDirectory ??
          this.config.environmentDefaults.logDirectory,
        apiEndpoints: template.environment.apiEndpoints ?? {},
        credentials: template.environment.credentials ?? {},
        availableTools: template.environment.availableTools ?? [],
        toolConfigs: template.environment.toolConfigs ?? {},
        resources: template.environment.resources ?? {
          availableMemory: 1024,
          availableCpu: 4,
          availableDisk: 1000
        },
        ...overrides.environment,
      },
      lastHeartbeat: new Date(),
      errors: [],
    };

    this.agents.set(agentId, agent);
    this.healthChecks.set(agentId, this.createDefaultHealth(agentId));

    this.logger.info('Created agent', {
      agentId,
      name: agent.name,
      type: agent.type,
      template: templateName,
    });

    this.emit('agent:created', { agent });

    // Store in memory for persistence
    await this.memory.coordinate({
      type: 'write',
      sessionId: `agent-session-${agentId}`,
      target: `agent:${agentId}`,
      metadata: {
        data: agent,
        type: 'agent-state',
        tags: [agent.type, 'active'],
        partition: 'state',
      },
    });

    return agentId;
  }

  async startAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.status !== 'initializing' && agent.status !== 'offline') {
      throw new Error(
        `Agent ${agentId} cannot be started from status ${agent.status}`
      );
    }

    try {
      agent.status = 'initializing';
      this.updateAgentStatus(agentId, 'initializing');

      // Spawn agent process
      const process = await this.spawnAgentProcess(agent);
      this.processes.set(agentId, process);

      // Wait for agent to signal ready
      await this.waitForAgentReady(agentId, this.config.defaultTimeout);

      agent.status = 'idle';
      this.updateAgentStatus(agentId, 'idle');

      this.logger.info('Started agent', { agentId, name: agent.name });
      this.emit('agent:started', { agent });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      agent.status = 'error';
      this.addAgentError(agentId, {
        code: 'STARTUP_FAILED',
        timestamp: new Date(),
        type: 'startup_failed',
        message: errorMessage,
        context: { agentId },
        severity: 'critical',
        resolved: false,
      });

      this.logger.error('Failed to start agent', { agentId, error });
      throw error;
    }
  }

  async stopAgent(
    agentId: string,
    reason: string = 'user_request'
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.status === 'offline' || agent.status === 'terminated') {
      return; // Already stopped
    }

    try {
      agent.status = 'terminated';
      this.updateAgentStatus(agentId, 'terminated');

      // Send graceful shutdown signal
      const process = this.processes.get(agentId);
      if (process && !process.killed) {
        process.kill('SIGTERM');

        // Force kill after timeout
        setTimeout(() => {
          if (process && !process.killed) {
            process.kill('SIGKILL');
          }
        }, this.config.defaultTimeout);
      }

      // Wait for process to exit
      await this.waitForProcessExit(agentId, this.config.defaultTimeout);

      agent.status = 'terminated';
      this.updateAgentStatus(agentId, 'terminated');

      // Cleanup
      this.processes.delete(agentId);

      this.logger.info('Stopped agent', { agentId, reason });
      this.emit('agent:stopped', { agent, reason });
    } catch (error) {
      this.logger.error('Failed to stop agent gracefully', { agentId, error });
      // Force cleanup
      this.processes.delete(agentId);
      agent.status = 'terminated';
    }
  }

  async restartAgent(
    agentId: string,
    reason: string = 'restart_requested'
  ): Promise<void> {
    this.logger.info('Restarting agent', { agentId, reason });

    await this.stopAgent(agentId, `restart:${reason}`);
    await this.startAgent(agentId);

    this.emit('agent:restarted', { agentId, reason });
  }

  async removeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Stop agent if running
    if (agent.status !== 'terminated' && agent.status !== 'offline') {
      await this.stopAgent(agentId, 'removal');
    }

    // Remove from all data structures
    this.agents.delete(agentId);
    this.healthChecks.delete(agentId);
    this.resourceUsage.delete(agentId);
    this.performanceHistory.delete(agentId);

    // Remove from pools and clusters
    this.removeAgentFromPoolsAndClusters(agentId);

    // Remove from memory
    await this.memory.coordinate({
      type: 'delete',
      sessionId: `agent-session-${agentId}`,
      target: `agent:${agentId}`,
    });

    this.logger.info('Removed agent', { agentId });
    this.emit('agent:removed', { agentId });
  }

  // === AGENT POOLS ===

  async createAgentPool(
    name: string,
    templateName: string,
    config: {
      minSize: number;
      maxSize: number;
      autoScale?: boolean;
      scaleUpThreshold?: number;
      scaleDownThreshold?: number;
    }
  ): Promise<string> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    const poolId = generateId('pool');
    const pool: QueenPool = {
      id: poolId,
      name,
      type: template.type,
      capacity: config?.maxSize || 10,
      available: 0,
      queens: [],
      minSize: config?.minSize || 1,
      maxSize: config?.maxSize || 10,
      currentSize: 0,
      template,
      availableAgents: [],
      busyAgents: [],
    };

    this.pools.set(poolId, pool);

    // Create minimum agents
    for (let i = 0 as number; i < config?.minSize; i++) {
      const agentId = await this.createAgent(templateName, {
        name: `${name}-${i + 1}`,
      });
      await this.startAgent(agentId);
      pool.availableAgents.push({ 
        id: agentId, 
        swarmId: 'default', 
        type: template.type as AgentType, 
        instance: i + 1 
      });
      pool.currentSize++;
    }

    this.logger.info('Created agent pool', {
      poolId,
      name,
      minSize: config?.minSize,
    });
    this.emit('pool:created', { pool });

    return poolId;
  }

  async scalePool(poolId: string, targetSize: number): Promise<void> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Pool ${poolId} not found`);
    }

    if (targetSize < pool.minSize || targetSize > pool.maxSize) {
      throw new Error(
        `Target size ${targetSize} outside pool limits [${pool.minSize}, ${pool.maxSize}]`
      );
    }

    const currentSize = pool.currentSize;
    const delta = targetSize - currentSize;

    if (delta > 0) {
      // Scale up
      for (let i = 0 as number; i < delta; i++) {
        const agentId = await this.createAgent(pool.template.name, {
          name: `${pool.name}-${currentSize + i + 1}`,
        });
        await this.startAgent(agentId);
        pool.availableAgents.push({ 
          id: agentId, 
          swarmId: 'default', 
          type: pool.template.type as AgentType, 
          instance: currentSize + i + 1 
        });
      }
    } else if (delta < 0) {
      // Scale down
      const agentsToRemove = pool.availableAgents.slice(0, Math.abs(delta));
      for (const agentId of agentsToRemove) {
        await this.removeAgent(agentId.id);
        pool.availableAgents = pool.availableAgents.filter(
          (a: any) => a.id !== (agentId as any).id
        );
      }
    }

    pool.currentSize = targetSize;

    this.logger.info('Scaled pool', {
      poolId,
      fromSize: currentSize,
      toSize: targetSize,
    });
    this.emit('pool:scaled', {
      pool,
      fromSize: currentSize,
      toSize: targetSize,
    });
  }

  // === HEALTH MONITORING ===

  private startHealthMonitoring(): void {
    this.healthInterval = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);

    this.logger.info('Started health monitoring', {
      interval: this.config.healthCheckInterval,
    });
  }

  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeats();
    }, this.config.heartbeatInterval);

    this.logger.info('Started heartbeat monitoring', {
      interval: this.config.heartbeatInterval,
    });
  }

  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array.from(this.agents.keys()).map((agentId) =>
      this.checkAgentHealth(agentId)
    );

    await Promise.allSettled(healthPromises);
  }

  private async checkAgentHealth(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const health = this.healthChecks.get(agentId);
    if (!health) return;
    const now = new Date();

    try {
      // Check responsiveness
      const responsiveness = await this.checkResponsiveness(agentId);
      health.components.responsiveness = this.scoreToStatus(responsiveness);

      // Check performance
      const performance = this.calculatePerformanceScore(agentId);
      health.components.performance = this.scoreToStatus(performance);

      // Check reliability
      const reliability = this.calculateReliabilityScore(agentId);
      health.components.reliability = this.scoreToStatus(reliability);

      // Check resource usage
      const resourceScore = this.calculateResourceScore(agentId);
      health.components.resourceUsage = this.scoreToStatus(resourceScore);

      // Calculate overall health
      const overall =
        (responsiveness + performance + reliability + resourceScore) / 4;
      health.overall = {
        status: this.scoreToStatus(overall),
        score: overall
      };
      health.lastCheck = now;

      // Update agent health
      agent.health = overall;

      // Check for issues
      this.detectHealthIssues(agentId, health);

      // Auto-restart if critically unhealthy
      if (overall < 0.3 && this.config.autoRestart) {
        this.logger.warn('Agent critically unhealthy, restarting', {
          agentId,
          health: overall,
        });
        await this.restartAgent(agentId, 'health_critical');
      }
    } catch (error) {
      this.logger.error('Health check failed', { agentId, error });
      health.overall = {
        status: 'unhealthy',
        score: 0
      };
      health.lastCheck = now;
    }
  }

  private async checkResponsiveness(agentId: string): Promise<number> {
    // Send ping and measure response time

    try {
      // This would send an actual ping to the agent
      // For now, simulate based on last heartbeat
      const agent = this.agents.get(agentId);
      if (!agent) return 0;
      const timeSinceHeartbeat = Date.now() - agent.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > this.config.heartbeatInterval * 3) {
        return 0; // Unresponsive
      }
      if (timeSinceHeartbeat > this.config.heartbeatInterval * 2) {
        return 0.5; // Slow
      }
      return 1.0; // Responsive
    } catch (_error) {
      return 0; // Failed to respond
    }
  }

  private calculatePerformanceScore(agentId: string): number {
    const history = this.performanceHistory.get(agentId) || [];
    if (history.length === 0) return 1.0;

    // Calculate average task completion time vs expected
    const recent = history.slice(-10); // Last 10 entries
    const avgTime =
      recent.reduce(
        (sum, entry) => sum + entry.metrics.averageExecutionTime,
        0
      ) / recent.length;

    // Normalize based on expected performance (simplified)
    const expectedTime = 60000; // 1 minute baseline
    return Math.max(0, Math.min(1, expectedTime / avgTime));
  }

  private calculateReliabilityScore(agentId: string): number {
    const agent = this.agents.get(agentId);
    if (!agent) return 0;
    const totalTasks = agent.metrics.tasksCompleted + agent.metrics.tasksFailed;

    if (totalTasks === 0) return 1.0;

    return agent.metrics.tasksCompleted / totalTasks;
  }

  private calculateResourceScore(agentId: string): number {
    const usage = this.resourceUsage.get(agentId);
    if (!usage) return 1.0;

    const limits = this.config.resourceLimits;
    const memoryScore = 1 - usage.memory / limits.memory;
    const cpuScore = 1 - usage.cpu / limits.cpu;
    const diskScore = 1 - usage.disk / limits.disk;

    return Math.max(0, (memoryScore + cpuScore + diskScore) / 3);
  }

  private detectHealthIssues(_agentId: string, health: QueenHealth): void {
    const issues: HealthIssue[] = [];

    if (health.components.responsiveness === 'unhealthy') {
      issues.push({
        type: 'communication',
        severity: 'critical',
        message: 'Agent is not responding to heartbeats',
        timestamp: new Date(),
        resolved: false,
        recommendedAction: 'Restart agent or check network connectivity',
      });
    }

    if (health.components.performance === 'unhealthy' || health.components.performance === 'degraded') {
      issues.push({
        type: 'performance',
        severity: health.components.performance === 'unhealthy' ? 'high' : 'medium',
        message: 'Agent performance is below expected levels',
        timestamp: new Date(),
        resolved: false,
        recommendedAction: 'Check resource allocation or agent configuration',
      });
    }

    if (health.components.resourceUsage === 'unhealthy') {
      issues.push({
        type: 'resource',
        severity: 'critical',
        message: 'Agent resource usage is critically high',
        timestamp: new Date(),
        resolved: false,
        recommendedAction: 'Increase resource limits or reduce workload',
      });
    }

    health.issues = issues.map(issue => issue.message);
  }

  private checkHeartbeats(): void {
    const now = Date.now();
    const timeout = this.config.heartbeatInterval * 3;

    for (const [agentId, agent] of Array.from(this.agents.entries())) {
      const timeSinceHeartbeat = now - agent.lastHeartbeat.getTime();

      if (
        timeSinceHeartbeat > timeout &&
        agent.status !== 'offline' &&
        agent.status !== 'terminated'
      ) {
        this.logger.warn('Agent heartbeat timeout', {
          agentId,
          timeSinceHeartbeat,
        });

        agent.status = 'error';
        this.addAgentError(agentId, {
          code: 'HEARTBEAT_TIMEOUT',
          timestamp: new Date(),
          type: 'heartbeat_timeout',
          message: 'Agent failed to send heartbeat within timeout period',
          context: { timeout, timeSinceHeartbeat },
          severity: 'high',
          resolved: false,
        });

        this.emit('agent:heartbeat-timeout', { agentId, timeSinceHeartbeat });

        // Auto-restart if enabled
        if (this.config.autoRestart) {
          this.restartAgent(agentId, 'heartbeat_timeout').catch((error) => {
            this.logger.error('Failed to auto-restart agent', {
              agentId,
              error,
            });
          });
        }
      }
    }
  }

  // === SPARC TASK HANDLING ===

  /**
   * Handle SPARC task assignment from Cube Matron
   * Queen's role: Coordinate swarm execution of SPARC-structured tasks
   */
  private async handleSPARCTaskAssignment(
    assignment: QueenSPARCAssignment
  ): Promise<void> {
    this.logger.info(
      `👑 Queen received SPARC task assignment: ${assignment.task.sparcPhase}`,
      {
        queenId: assignment.queenId,
        projectId: assignment.task.projectId,
        phase: assignment.task.sparcPhase,
        taskCount: assignment.task.tasks.length,
        matronId: assignment.task.matronId,
      }
    );

    // Store the SPARC task
    this.sparcTasks.set(assignment.task.id, assignment.task);

    // Add to queen's assignments
    const queenAssignments =
      this.queenSPARCAssignments.get(assignment.queenId) || [];
    queenAssignments.push(assignment);
    this.queenSPARCAssignments.set(assignment.queenId, queenAssignments);

    try {
      // Convert SPARC tasks to swarm assignments
      const swarmAssignments = await this.createSwarmAssignments(
        assignment.task
      );

      // Update assignment with swarm details
      assignment.swarmAssignments = swarmAssignments;

      // Execute SPARC task through swarm coordination
      await this.executeSparcTaskThroughSwarms(
        assignment.task,
        swarmAssignments
      );

      this.logger.info(
        `✅ Queen successfully orchestrated SPARC ${assignment.task.sparcPhase} phase`,
        {
          queenId: assignment.queenId,
          projectId: assignment.task.projectId,
          swarmsAssigned: swarmAssignments.length,
        }
      );

      // Notify THE COLLECTIVE of successful coordination
      this.eventBus.emitSystemEvent({
        id: `sparc-task-coordinated-${assignment.task.id}-${Date.now()}`,
        type: 'queen:sparc:task-coordinated',
        source: 'queen-coordinator',
        timestamp: new Date(),
        payload: {
          queenId: assignment.queenId,
          taskId: assignment.task.id,
          projectId: assignment.task.projectId,
          phase: assignment.task.sparcPhase,
          swarmAssignments,
          status: 'coordinated',
        },
      });
    } catch (error) {
      this.logger.error(`❌ Queen failed to coordinate SPARC task`, {
        queenId: assignment.queenId,
        taskId: assignment.task.id,
        error: error instanceof Error ? error.message : String(error),
      });

      // Notify THE COLLECTIVE of coordination failure
      this.eventBus.emitSystemEvent({
        id: `sparc-task-failed-${assignment.task.id}-${Date.now()}`,
        type: 'queen:sparc:task-failed',
        source: 'queen-coordinator',
        timestamp: new Date(),
        payload: {
          queenId: assignment.queenId,
          taskId: assignment.task.id,
          projectId: assignment.task.projectId,
          phase: assignment.task.sparcPhase,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Create swarm assignments from SPARC task
   * Convert strategic coordination tasks into specific swarm execution tasks
   */
  private async createSwarmAssignments(sparcTask: SPARCTask): Promise<
    Array<{
      swarmId: string;
      tasks: string[];
      agents: string[];
    }>
  > {
    const swarmAssignments: Array<{
      swarmId: string;
      tasks: string[];
      agents: string[];
    }> = [];

    // Determine optimal swarm configuration for SPARC phase
    const swarmConfigs = this.getOptimalSwarmConfigForPhase(
      sparcTask.sparcPhase,
      sparcTask.priority
    );

    for (const config of swarmConfigs) {
      // Find available agents for this swarm type
      const availableAgents = this.findAvailableAgents(
        config.requiredCapabilities,
        config.agentCount
      );

      if (availableAgents.length >= config.minAgents) {
        const swarmId = generateId('sparc-swarm');

        swarmAssignments.push({
          swarmId,
          tasks: this.adaptTasksForSwarm(sparcTask.tasks, config.swarmType),
          agents: availableAgents.slice(0, config.agentCount),
        });

        this.logger.info(
          `📊 Created swarm assignment for SPARC ${sparcTask.sparcPhase}`,
          {
            swarmId,
            swarmType: config.swarmType,
            agentCount: availableAgents.length,
            taskCount: sparcTask.tasks.length,
          }
        );
      } else {
        this.logger.warn(`⚠️ Insufficient agents for SPARC swarm`, {
          required: config.minAgents,
          available: availableAgents.length,
          swarmType: config.swarmType,
        });
      }
    }

    return swarmAssignments;
  }

  /**
   * Execute SPARC task through coordinated swarms
   */
  private async executeSparcTaskThroughSwarms(
    sparcTask: SPARCTask,
    swarmAssignments: Array<{
      swarmId: string;
      tasks: string[];
      agents: string[];
    }>
  ): Promise<void> {
    this.logger.info(
      `🐝 Executing SPARC ${sparcTask.sparcPhase} through ${swarmAssignments.length} swarms`
    );

    // Execute all swarm assignments in parallel for maximum efficiency
    const executionPromises = swarmAssignments.map(async (assignment) => {
      try {
        // Create swarm for this assignment
        await this.createAndExecuteSPARCSwarm(sparcTask, assignment);

        this.logger.info(
          `✅ Swarm ${assignment.swarmId} completed SPARC tasks`,
          {
            swarmId: assignment.swarmId,
            taskCount: assignment.tasks.length,
            agentCount: assignment.agents.length,
          }
        );
      } catch (error) {
        this.logger.error(
          `❌ Swarm ${assignment.swarmId} failed SPARC execution`,
          {
            swarmId: assignment.swarmId,
            error: error instanceof Error ? error.message : String(error),
          }
        );
        throw error;
      }
    });

    // Wait for all swarms to complete
    await Promise.all(executionPromises);

    this.logger.info(
      `🎯 All swarms completed SPARC ${sparcTask.sparcPhase} execution`,
      {
        projectId: sparcTask.projectId,
        phase: sparcTask.sparcPhase,
        swarmCount: swarmAssignments.length,
      }
    );
  }

  /**
   * Get optimal swarm configuration for SPARC phase
   */
  private getOptimalSwarmConfigForPhase(
    phase: SPARCPhase,
    priority: string
  ): Array<{
    swarmType: string;
    requiredCapabilities: string[];
    agentCount: number;
    minAgents: number;
  }> {
    const configs: Array<{
      swarmType: string;
      requiredCapabilities: string[];
      agentCount: number;
      minAgents: number;
    }> = [];

    switch (phase) {
      case 'specification':
        configs.push({
          swarmType: 'requirements-analysis',
          requiredCapabilities: ['research', 'analysis', 'documentation'],
          agentCount: priority === 'critical' ? 3 : 2,
          minAgents: 1,
        });
        break;

      case 'pseudocode':
        configs.push({
          swarmType: 'algorithm-design',
          requiredCapabilities: ['codeGeneration', 'analysis'],
          agentCount: priority === 'critical' ? 2 : 1,
          minAgents: 1,
        });
        break;

      case 'architecture':
        configs.push({
          swarmType: 'system-architecture',
          requiredCapabilities: ['codeReview', 'analysis', 'documentation'],
          agentCount: priority === 'critical' ? 4 : 2,
          minAgents: 2,
        });
        break;

      case 'refinement':
        configs.push({
          swarmType: 'optimization',
          requiredCapabilities: ['codeReview', 'analysis'],
          agentCount: priority === 'critical' ? 3 : 2,
          minAgents: 1,
        });
        break;

      case 'completion':
        configs.push({
          swarmType: 'implementation',
          requiredCapabilities: ['codeGeneration', 'testing'],
          agentCount: priority === 'critical' ? 5 : 3,
          minAgents: 2,
        });
        configs.push({
          swarmType: 'testing',
          requiredCapabilities: ['testing', 'codeReview'],
          agentCount: priority === 'critical' ? 3 : 2,
          minAgents: 1,
        });
        configs.push({
          swarmType: 'documentation',
          requiredCapabilities: ['documentation'],
          agentCount: 1,
          minAgents: 1,
        });
        break;
    }

    return configs;
  }

  /**
   * Find available agents with required capabilities
   */
  private findAvailableAgents(
    requiredCapabilities: string[],
    maxCount: number
  ): string[] {
    const availableAgents = Array.from(this.agents.values())
      .filter(
        (agent) =>
          agent.status === 'idle' &&
          this.hasRequiredCapabilities(agent, requiredCapabilities)
      )
      .slice(0, maxCount)
      .map((agent) => agent.id.id);

    return availableAgents;
  }

  /**
   * Check if agent has required capabilities
   */
  private hasRequiredCapabilities(
    agent: AgentState,
    requiredCapabilities: string[]
  ): boolean {
    return requiredCapabilities.some(
      (capability) =>
        agent.capabilities &&
        Object.keys(agent.capabilities).includes(capability)
    );
  }

  /**
   * Adapt SPARC tasks for specific swarm type
   */
  private adaptTasksForSwarm(
    sparcTasks: string[],
    swarmType: string
  ): string[] {
    return sparcTasks.map((task) => `${swarmType}: ${task}`);
  }

  /**
   * Create and execute SPARC swarm
   */
  private async createAndExecuteSPARCSwarm(
    sparcTask: SPARCTask,
    assignment: {
      swarmId: string;
      tasks: string[];
      agents: string[];
    }
  ): Promise<void> {
    this.logger.info(`🚀 Creating SPARC swarm for execution`, {
      swarmId: assignment.swarmId,
      phase: sparcTask.sparcPhase,
      taskCount: assignment.tasks.length,
      agentCount: assignment.agents.length,
    });

    // Emit swarm creation event to be handled by swarm orchestration system
    this.eventBus.emitSystemEvent({
      id: `create-sparc-swarm-${assignment.swarmId}-${Date.now()}`,
      type: 'queen:create-sparc-swarm',
      source: 'queen-coordinator',
      timestamp: new Date(),
      payload: {
        swarmId: assignment.swarmId,
        sparcTask,
        assignment,
        methodology: 'SPARC',
        coordinatedBy: 'queen',
      },
    });

    // For now, simulate swarm execution
    // In a real implementation, this would interface with the actual swarm system
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.logger.info(`🎉 SPARC swarm execution completed`, {
      swarmId: assignment.swarmId,
      phase: sparcTask.sparcPhase,
    });
  }

  /**
   * Get SPARC task status for a queen
   */
  public getQueenSPARCTasks(queenId: string): QueenSPARCAssignment[] {
    return this.queenSPARCAssignments.get(queenId) || [];
  }

  /**
   * Get all active SPARC tasks
   */
  public getAllActiveSPARCTasks(): SPARCTask[] {
    return Array.from(this.sparcTasks.values());
  }

  // === UTILITY METHODS ===

  private async spawnAgentProcess(agent: AgentState): Promise<ChildProcess> {
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      AGENT_ID: agent.id.id,
      AGENT_TYPE: agent.type,
      AGENT_NAME: agent.name,
      WORKING_DIR: agent.environment.workingDirectory,
      LOG_DIR: agent.environment.logDirectory,
    };

    const args = [
      'run',
      '--allow-all',
      agent.environment.availableTools[0] || './agents/generic-agent.ts',
      '--config',
      JSON.stringify(agent.config),
    ];

    const childProcess = spawn(agent.environment.runtime, args, {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: agent.environment.workingDirectory,
    });

    // Handle process events
    childProcess?.on('exit', (code: number | null) => {
      this.handleProcessExit(agent.id.id, code);
    });

    childProcess?.on('error', (error: Error) => {
      this.handleProcessError(agent.id.id, error);
    });

    return childProcess;
  }

  private async waitForAgentReady(
    agentId: string,
    timeout: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Agent ${agentId} startup timeout`));
      }, timeout);

      const handler = (data: unknown) => {
        const readyData = data as { agentId: string };
        if (readyData?.agentId === agentId) {
          clearTimeout(timer);
          this.eventBus.off('agent:status:changed', handler);
          resolve();
        }
      };

      this.eventBus.on('agent:status:changed', handler);
    });
  }

  private async waitForProcessExit(
    agentId: string,
    timeout: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const process = this.processes.get(agentId);
      if (!process || process.killed) {
        resolve();
        return;
      }

      const timer = setTimeout(() => {
        resolve(); // Timeout, continue anyway
      }, timeout);

      process.on('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  private handleProcessExit(agentId: string, code: number | null): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    this.logger.info('Agent process exited', { agentId, exitCode: code });

    if (code !== 0 && code !== null) {
      this.addAgentError(agentId, {
        code: 'PROCESS_EXIT',
        timestamp: new Date(),
        type: 'process_exit',
        message: `Agent process exited with code ${code}`,
        context: { exitCode: code },
        severity: 'high',
        resolved: false,
      });
    }

    agent.status = 'offline';
    this.emit('agent:process-exit', { agentId, exitCode: code });
  }

  private handleProcessError(agentId: string, error: Error): void {
    this.logger.error('Agent process error', { agentId, error });

    this.addAgentError(agentId, {
      code: 'PROCESS_ERROR',
      timestamp: new Date(),
      type: 'process_error',
      message: error instanceof Error ? error.message : String(error),
      context: { error: error.toString() },
      severity: 'critical',
      resolved: false,
    });

    this.emit('agent:process-error', { agentId, error });
  }

  private handleHeartbeat(data: {
    agentId: string;
    timestamp: Date;
    metrics?: AgentMetrics;
  }): void {
    const agent = this.agents.get(data?.agentId);
    if (!agent) return;

    agent.lastHeartbeat = data?.timestamp;

    if (data?.metrics) {
      this.updateAgentMetrics(data?.agentId, data?.metrics);
    }

    // Update health if agent was previously unresponsive
    if (agent.status === 'error') {
      agent.status = 'idle';
      this.updateAgentStatus(data?.agentId, 'idle');
    }
  }

  private handleAgentError(data: { agentId: string; error: AgentError }): void {
    this.addAgentError(data?.agentId, data?.error);

    const agent = this.agents.get(data?.agentId);
    if (agent && data?.error?.severity === 'critical') {
      agent.status = 'error';
      this.updateAgentStatus(data?.agentId, 'error');
    }
  }

  private updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const oldStatus = agent.status;
    agent.status = status;

    this.emit('agent:status-changed', { agentId, from: oldStatus, to: status });
  }

  private updateAgentWorkload(agentId: string, delta: number): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.workload = Math.max(0, agent.workload + delta);
  }

  private updateAgentMetrics(agentId: string, metrics: AgentMetrics): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.metrics = { ...agent.metrics, ...metrics };

    // Store performance history
    const history = this.performanceHistory.get(agentId) || [];
    history.push({ timestamp: new Date(), metrics: { ...metrics } });

    // Keep only last 100 entries
    if (history.length > 100) {
      history.shift();
    }

    this.performanceHistory.set(agentId, history);
  }

  private updateResourceUsage(
    agentId: string,
    usage: { cpu: number; memory: number; disk: number }
  ): void {
    this.resourceUsage.set(agentId, usage);
  }

  private scoreToStatus(score: number): 'healthy' | 'degraded' | 'unhealthy' {
    if (score >= 0.8) return 'healthy';
    if (score >= 0.5) return 'degraded';
    return 'unhealthy';
  }

  private addAgentError(agentId: string, error: AgentError): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.errors.push(error);

    // Keep only last 50 errors
    if (agent.errors.length > 50) {
      agent.errors.shift();
    }
  }

  private createDefaultMetrics(): AgentMetrics {
    return {
      tasksCompleted: 0,
      tasksFailed: 0,
      tasksInProgress: 0,
      averageExecutionTime: 0,
      successRate: 1.0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkUsage: 0,
      codeQuality: 0.8,
      testCoverage: 0,
      bugRate: 0,
      userSatisfaction: 0.8,
      totalUptime: 0,
      lastActivity: new Date(),
      responseTime: 0,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: 0,
      },
    };
  }

  private createDefaultHealth(agentId: string): QueenHealth {
    return {
      queenId: agentId,
      status: 'healthy',
      lastCheck: new Date(),
      metrics: {
        cpuUsage: 0,
        memoryUsage: 0,
        responseTime: 0,
        errorRate: 0,
      },
      issues: [],
      components: {
        responsiveness: 'healthy',
        performance: 'healthy',
        reliability: 'healthy',
        resourceUsage: 'healthy',
      },
      overall: {
        status: 'healthy',
        score: 1.0,
      },
    };
  }

  private removeAgentFromPoolsAndClusters(agentId: string): void {
    // Remove from pools
    for (const pool of Array.from(this.pools.values())) {
      pool.availableAgents = pool.availableAgents.filter(
        (a: AgentId) => a.id !== agentId
      );
      pool.busyAgents = pool.busyAgents.filter(
        (a: AgentId) => a.id !== agentId
      );
      pool.currentSize = pool.availableAgents.length + pool.busyAgents.length;
    }

    // Remove from clusters
    for (const cluster of Array.from(this.clusters.values())) {
      cluster.agents = cluster.agents.filter((a: any) => a.id !== agentId);
    }
  }

  private initializeScalingPolicies(): void {
    // Default auto-scaling policy
    const defaultPolicy: ScalingPolicy = {
      name: 'default-autoscale',
      enabled: true,
      cooldownPeriod: 300000, // 5 minutes
      maxScaleOperations: 10,
      rules: [
        {
          metric: 'pool-utilization',
          threshold: 0.8,
          comparison: 'gt',
          action: 'scale-up',
          amount: 1,
        },
        {
          metric: 'pool-utilization',
          threshold: 0.3,
          comparison: 'lt',
          action: 'scale-down',
          amount: 1,
        },
      ],
    };

    this.scalingPolicies.set('default', defaultPolicy);
  }

  // === PUBLIC API ===

  getAgent(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AgentState[] {
    return Array.from(this.agents.values());
  }

  getAgentsByType(type: AgentType): AgentState[] {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.type === type
    );
  }

  getAgentsByStatus(status: AgentStatus): AgentState[] {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.status === status
    );
  }

  getAgentHealth(agentId: string): QueenHealth | undefined {
    return this.healthChecks.get(agentId);
  }

  getPool(poolId: string): QueenPool | undefined {
    return this.pools.get(poolId);
  }

  getAllPools(): QueenPool[] {
    return Array.from(this.pools.values());
  }

  getAgentTemplates(): QueenTemplate[] {
    return Array.from(this.templates.values());
  }

  getSystemStats(): {
    totalAgents: number;
    activeAgents: number;
    healthyAgents: number;
    pools: number;
    clusters: number;
    averageHealth: number;
    resourceUtilization: { cpu: number; memory: number; disk: number };
  } {
    const agents = Array.from(this.agents.values());
    const healthChecks = Array.from(this.healthChecks.values());

    const healthyAgents = healthChecks.filter((h) => {
      const overallScore = typeof h.overall === 'object' ? h.overall.score : h.overall;
      return typeof overallScore === 'number' && overallScore > 0.7;
    }).length;
    const averageHealth =
      healthChecks.reduce((sum, h) => {
        const overallScore = typeof h.overall === 'object' ? h.overall.score : h.overall;
        return sum + (typeof overallScore === 'number' ? overallScore : 0);
      }, 0) /
        healthChecks.length || 1;

    const resourceUsages = Array.from(this.resourceUsage.values());
    const avgCpu =
      resourceUsages.reduce((sum, r) => sum + r.cpu, 0) /
        resourceUsages.length || 0;
    const avgMemory =
      resourceUsages.reduce((sum, r) => sum + r.memory, 0) /
        resourceUsages.length || 0;
    const avgDisk =
      resourceUsages.reduce((sum, r) => sum + r.disk, 0) /
        resourceUsages.length || 0;

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(
        (a) => a.status === 'idle' || a.status === 'busy'
      ).length,
      healthyAgents,
      pools: this.pools.size,
      clusters: this.clusters.size,
      averageHealth,
      resourceUtilization: {
        cpu: avgCpu,
        memory: avgMemory,
        disk: avgDisk,
      },
    };
  }
}
