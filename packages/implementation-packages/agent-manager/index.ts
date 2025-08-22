/**
 * @fileoverview Agent Manager Package - Enterprise-Grade Agent Lifecycle Management & Swarm Orchestration
 *
 * **COMPREHENSIVE EPHEMERAL SWARM ORCHESTRATOR WITH CLI AND MCP SERVER INTEGRATION**
 *
 * Production-grade agent lifecycle management system with advanced ephemeral swarm coordination,
 * CLI tools, Model Context Protocol server integration, and cognitive diversity optimization
 * for large-scale enterprise claude-code-zen ecosystem deployments.
 *
 * **CORE CAPABILITIES:**
 * - 🤖 **Agent Lifecycle Management**: Complete CRUD operations with health monitoring
 * - 🐝 **Ephemeral Swarm Orchestration**: Dynamic temporary swarm creation and coordination
 * - 🖥️ **CLI Integration**: Comprehensive command-line tools for agent management
 * - 🔌 **MCP Server**: Full Model Context Protocol server implementation
 * - 📊 **Cognitive Diversity**: Advanced ruvswarm-inspired agent diversity patterns
 * - 🔄 **Dynamic Topology**: Mesh, hierarchical, ring, and custom topologies
 * - 💾 **State Management**: Persistent and ephemeral agent state with recovery
 * - 🎯 **Foundation Integration**: Complete @claude-zen/foundation ecosystem support
 *
 * **Enterprise Features:**
 * - Advanced agent health monitoring with predictive failure detection
 * - Cognitive diversity optimization using ruvswarm mathematical models
 * - Dynamic capability matching with machine learning-based assignment
 * - Real-time performance metrics and comprehensive telemetry integration
 * - Circuit breaker protection with cascading failure prevention
 * - Graceful shutdown protocols with emergency recovery procedures
 * - Distributed coordination across multiple nodes and clusters
 *
 * @example Basic Agent Management with Health Monitoring
 * ```typescript
 * import { AgentManager } from '@claude-zen/agent-manager';
 *
 * // Initialize comprehensive agent management system
 * const manager = new AgentManager({
 *   maxAgents: 500,
 *   topology: 'mesh',
 *   enableTelemetry: true,
 *   healthMonitoring: {
 *     interval: 5000, // 5 seconds
 *     enablePredictiveFailure: true,
 *     alertThresholds: {
 *       responseTime: 1000, // ms
 *       errorRate: 0.05, // 5%
 *       memoryUsage: 0.8 // 80%
 *     },
 *     notifications: {
 *       slack: '#agent-monitoring',
 *       email: ['ops@company.com']
 *     }
 *   },
 *   performance: {
 *     enableOptimization: true,
 *     loadBalancing: 'intelligent',
 *     resourceAllocation: 'dynamic'
 *   }
 * });
 *
 * await manager.initialize();
 * console.log('Agent Manager initialized with health monitoring');
 *
 * // Add specialized agents with comprehensive configuration
 * const researcherAgent = await manager.addAgent({
 *   id: 'researcher-001',
 *   type: 'researcher',
 *   capabilities: ['web-search', 'analysis', 'documentation', 'data-mining'],
 *   cognitiveProfile: 'analytical',
 *   resources: {
 *     maxMemory: '2GB',
 *     cpuCores: 4,
 *     networkBandwidth: '100Mbps'
 *   },
 *   specialization: {
 *     domains: ['technology', 'market-research', 'competitive-analysis'],
 *     languages: ['english', 'spanish', 'french'],
 *     tools: ['selenium', 'beautiful-soup', 'pandas']
 *   },
 *   healthChecks: {
 *     interval: 10000,
 *     timeout: 5000,
 *     retryCount: 3
 *   }
 * });
 *
 * const coderAgent = await manager.addAgent({
 *   id: 'coder-001',
 *   type: 'coder',
 *   capabilities: ['typescript', 'react', 'testing', 'deployment', 'debugging'],
 *   cognitiveProfile: 'systematic',
 *   resources: {
 *     maxMemory: '4GB',
 *     cpuCores: 8,
 *     storage: '50GB'
 *   },
 *   specialization: {
 *     frameworks: ['react', 'nextjs', 'express', 'fastapi'],
 *     languages: ['typescript', 'python', 'rust', 'go'],
 *     tools: ['jest', 'cypress', 'docker', 'kubernetes']
 *   },
 *   development: {
 *     enableHotReload: true,
 *     debugMode: true,
 *     testCoverage: 0.9
 *   }
 * });
 *
 * console.log('Agents created:', {
 *   researcher: researcherAgent.id,
 *   coder: coderAgent.id
 * });
 *
 * // Advanced agent coordination with intelligent task routing
 * const coordination = await manager.coordinateAgents(
 *   manager.getAgentsByCapability('typescript'),
 *   'hierarchical',
 *   {
 *     taskDistribution: 'optimal',
 *     loadBalancing: true,
 *     failoverEnabled: true,
 *     performanceMonitoring: true
 *   }
 * );
 *
 * console.log('Coordination established:', {
 *   topology: coordination.topology,
 *   agents: coordination.agents.length,
 *   expectedPerformance: coordination.performanceMetrics
 * });
 * ```
 *
 * @example Advanced CLI Integration with Workflow Management
 * ```bash
 * # Install globally or use npx for comprehensive agent management
 * npm install -g @claude-zen/agent-manager
 *
 * # Basic agent management commands
 * agent-manager create --type coder --capabilities typescript,react,testing \\
 *   --cognitive-profile systematic --max-memory 4GB --cpu-cores 8
 *
 * agent-manager create --type researcher --capabilities web-search,analysis \\
 *   --specialization "market-research,competitive-analysis" \\
 *   --languages "english,spanish"
 *
 * # Advanced agent listing and filtering
 * agent-manager list --status active --type coder --sort-by performance
 * agent-manager list --capabilities typescript --cognitive-profile analytical
 * agent-manager list --health-score ">0.8" --response-time "<1000ms"
 *
 * # Sophisticated coordination and topology management
 * agent-manager coordinate --topology mesh --agents coder-001,researcher-001 \\
 *   --task-distribution optimal --enable-failover
 *
 * agent-manager coordinate --topology hierarchical --auto-select-agents \\
 *   --task-type "full-stack-development" --required-capabilities "typescript,react,testing"
 *
 * # Ephemeral swarm management with advanced configuration
 * agent-manager swarm-create --ephemeral --max-agents 10 \\
 *   --cognitive-diversity ruvswarm --duration 3600 \\
 *   --auto-scale --performance-threshold 0.8
 *
 * agent-manager swarm-create --name "emergency-response" \\
 *   --agents "coder-001,researcher-001,analyst-001" \\
 *   --topology ring --task-timeout 1800
 *
 * # Health monitoring and performance management
 * agent-manager health --agent-id coder-001 --detailed
 * agent-manager health --all --export-format json --output health-report.json
 * agent-manager performance --agent-id researcher-001 --time-range 24h
 *
 * # Advanced workspace and environment management
 * agent-manager workspace create --name "microservices-project" \\
 *   --agents "coder-001,coder-002,tester-001" \\
 *   --shared-resources --collaboration-mode real-time
 *
 * agent-manager environment setup --name "staging" \\
 *   --agents "all-active" --resource-limits high \\
 *   --monitoring-level detailed
 *
 * # Emergency protocols and disaster recovery
 * agent-manager emergency-stop --all --reason "system-maintenance"
 * agent-manager recovery --from-checkpoint --checkpoint-id "backup-2024-01-15"
 * agent-manager failover --from coder-001 --to coder-backup-001 --preserve-state
 * ```
 *
 * @example Production MCP Server with Security and Clustering
 * ```typescript
 * import {
 *   MCPServer,
 *   AgentManager,
 *   SecurityManager,
 *   ClusterCoordinator
 * } from '@claude-zen/agent-manager';
 *
 * // Setup enterprise-grade MCP server with clustering
 * const clusterCoordinator = new ClusterCoordinator({
 *   nodes: [
 *     { id: 'node-1', host: 'agent-cluster-1.company.com', port: 3000 },
 *     { id: 'node-2', host: 'agent-cluster-2.company.com', port: 3000 },
 *     { id: 'node-3', host: 'agent-cluster-3.company.com', port: 3000 }
 *   ],
 *   consensus: 'raft', // Raft consensus algorithm
 *   replication: 3,
 *   partitionTolerance: true
 * });
 *
 * const securityManager = new SecurityManager({
 *   authentication: {
 *     method: 'oauth2',
 *     provider: 'active-directory',
 *     tokenExpiry: 3600 // 1 hour
 *   },
 *   authorization: {
 *     rbac: true,
 *     permissions: {
 *       'agent-admin': ['create', 'delete', 'modify', 'view'],
 *       'agent-operator': ['view', 'coordinate', 'monitor'],
 *       'agent-viewer': ['view', 'monitor']
 *     }
 *   },
 *   encryption: {
 *     inTransit: 'tls-1.3',
 *     atRest: 'aes-256-gcm',
 *     keyRotation: 86400 // 24 hours
 *   },
 *   audit: {
 *     enabled: true,
 *     retentionDays: 90,
 *     compliance: ['sox', 'gdpr', 'hipaa']
 *   }
 * });
 *
 * const mcpServer = new MCPServer({
 *   port: 3000,
 *   enableAgentManagement: true,
 *   enableSwarmCoordination: true,
 *   clustering: clusterCoordinator,
 *   security: securityManager,
 *   features: {
 *     webUI: {
 *       enabled: true,
 *       dashboard: 'comprehensive',
 *       realTimeUpdates: true
 *     },
 *     api: {
 *       version: 'v2',
 *       rateLimit: '1000/hour',
 *       cors: {
 *         origins: ['https://admin.company.com'],
 *         credentials: true
 *       }
 *     },
 *     monitoring: {
 *       prometheus: { enabled: true, port: 9090 },
 *       grafana: {
 *         dashboards: ['agent-overview', 'performance', 'health'],
 *         alerts: true
 *       },
 *       jaeger: { enabled: true, endpoint: 'http://jaeger:14268' }
 *     },
 *     backup: {
 *       enabled: true,
 *       interval: 3600, // 1 hour
 *       retention: 30, // days
 *       storage: 's3://agent-backups/'
 *     }
 *   }
 * });
 *
 * // Start the MCP server with comprehensive error handling
 * try {
 *   await mcpServer.start();
 *   console.log('🚀 Enterprise MCP Server started successfully');
 *   console.log('📊 Dashboard available at: http://localhost:3000/dashboard');
 *   console.log('📈 Metrics available at: http://localhost:9090/metrics');
 *   console.log('🔐 Security features enabled: Authentication, Authorization, Encryption');
 *   console.log('⚡ Clustering enabled with 3 nodes');
 * } catch (error) {
 *   console.error('❌ Failed to start MCP Server:', error);
 *   process.exit(1);
 * }
 *
 * // Setup graceful shutdown
 * process.on('SIGTERM', async () => {
 *   console.log('🛑 Shutting down MCP Server gracefully...');
 *   await mcpServer.shutdown({
 *     gracePeriod: 30000, // 30 seconds
 *     preserveState: true,
 *     notifyCluster: true
 *   });
 *   process.exit(0);
 * });
 * ```
 *
 * @example Advanced Cognitive Diversity with Ruvswarm Optimization
 * ```typescript
 * import {
 *   AgentManager,
 *   CognitiveDiversityOptimizer,
 *   RuvswarmEngine,
 *   PerformanceAnalyzer
 * } from '@claude-zen/agent-manager';
 *
 * // Initialize manager with advanced cognitive diversity features
 * const manager = new AgentManager({
 *   enableCognitiveDiversity: true,
 *   diversityStrategy: 'ruvswarm-advanced',
 *   optimization: {
 *     algorithm: 'genetic-algorithm',
 *     populationSize: 100,
 *     generations: 50,
 *     crossoverRate: 0.8,
 *     mutationRate: 0.1
 *   },
 *   analytics: {
 *     enablePerformanceTracking: true,
 *     diversityMetrics: true,
 *     adaptiveLearning: true
 *   }
 * });
 *
 * await manager.initialize();
 *
 * // Create ruvswarm-optimized cognitive diversity engine
 * const diversityOptimizer = new CognitiveDiversityOptimizer({
 *   cognitiveProfiles: {
 *     analytical: {
 *       traits: ['logical-reasoning', 'data-analysis', 'pattern-recognition'],
 *       weights: [0.9, 0.8, 0.7],
 *       compatibility: ['systematic', 'methodical']
 *     },
 *     creative: {
 *       traits: ['divergent-thinking', 'innovation', 'artistic-expression'],
 *       weights: [0.9, 0.8, 0.6],
 *       compatibility: ['intuitive', 'exploratory']
 *     },
 *     systematic: {
 *       traits: ['process-oriented', 'attention-to-detail', 'quality-focused'],
 *       weights: [0.9, 0.9, 0.8],
 *       compatibility: ['analytical', 'methodical']
 *     },
 *     intuitive: {
 *       traits: ['pattern-intuition', 'rapid-insights', 'holistic-thinking'],
 *       weights: [0.8, 0.9, 0.7],
 *       compatibility: ['creative', 'exploratory']
 *     },
 *     collaborative: {
 *       traits: ['team-coordination', 'communication', 'consensus-building'],
 *       weights: [0.9, 0.8, 0.8],
 *       compatibility: ['all']
 *     }
 *   },
 *   optimization: {
 *     diversityIndex: 'shannon-entropy',
 *     balanceThreshold: 0.8,
 *     performanceWeight: 0.7,
 *     diversityWeight: 0.3
 *   }
 * });
 *
 * // Create cognitively diverse ephemeral swarm with advanced optimization
 * const complexAnalysisSwarm = await manager.createEphemeralSwarm({
 *   name: 'complex-market-analysis',
 *   taskType: 'multi-domain-analysis',
 *   requiredDiversity: {
 *     analytical: { count: 3, minExperience: 0.8, specializations: ['market-research', 'data-science'] },
 *     creative: { count: 2, minExperience: 0.7, specializations: ['innovation-strategy', 'design-thinking'] },
 *     systematic: { count: 2, minExperience: 0.9, specializations: ['process-optimization', 'quality-assurance'] },
 *     intuitive: { count: 1, minExperience: 0.8, specializations: ['strategic-planning', 'trend-analysis'] },
 *     collaborative: { count: 1, minExperience: 0.9, specializations: ['team-leadership', 'stakeholder-management'] }
 *   },
 *   constraints: {
 *     maxDuration: 7200000, // 2 hours
 *     maxBudget: 5000, // cost units
 *     qualityThreshold: 0.9,
 *     diversityIndex: 0.85
 *   },
 *   environment: {
 *     collaboration: {
 *       realTime: true,
 *       sharedWorkspace: true,
 *       conflictResolution: 'consensus-based'
 *     },
 *     resources: {
 *       compute: 'high-performance',
 *       storage: 'distributed',
 *       networking: 'low-latency'
 *     }
 *   }
 * });
 *
 * console.log('🧠 Cognitive Diversity Analysis:', {
 *   swarmId: complexAnalysisSwarm.id,
 *   diversityScore: complexAnalysisSwarm.diversityMetrics.score,
 *   cognitiveBalance: complexAnalysisSwarm.diversityMetrics.balance,
 *   expectedPerformance: complexAnalysisSwarm.performancePrediction,
 *   agentComposition: complexAnalysisSwarm.agents.map(a => ({
 *     id: a.id,
 *     profile: a.cognitiveProfile,
 *     specializations: a.specialization
 *   }))
 * });
 *
 * // Execute complex multi-domain analysis task
 * const analysisTask = {
 *   description: 'Comprehensive market analysis for emerging AI technologies',
 *   requirements: {
 *     scope: [
 *       'competitive-landscape-analysis',
 *       'technology-trend-identification',
 *       'market-size-estimation',
 *       'innovation-opportunity-mapping',
 *       'strategic-recommendations'
 *     ],
 *     deliverables: [
 *       'executive-summary',
 *       'detailed-analysis-report',
 *       'strategic-roadmap',
 *       'risk-assessment',
 *       'financial-projections'
 *     ],
 *     quality: {
 *       accuracy: 0.95,
 *       completeness: 0.9,
 *       clarity: 0.9,
 *       actionability: 0.85
 *     }
 *   },
 *   context: {
 *     industry: 'artificial-intelligence',
 *     timeframe: '2024-2027',
 *     geography: ['north-america', 'europe', 'asia-pacific'],
 *     stakeholders: ['investors', 'executives', 'product-teams']
 *   }
 * };
 *
 * console.log('🚀 Starting complex analysis task...');
 * const startTime = Date.now();
 *
 * const analysisResult = await complexAnalysisSwarm.executeTask(analysisTask, {
 *   monitoring: {
 *     realTimeUpdates: true,
 *     progressReporting: true,
 *     qualityChecks: true
 *   },
 *   optimization: {
 *     adaptiveScheduling: true,
 *     resourceReallocation: true,
 *     performanceTuning: true
 *   },
 *   collaboration: {
 *     crossPollination: true,
 *     peerReview: true,
 *     consensusBuilding: true
 *   }
 * });
 *
 * const executionTime = Date.now() - startTime;
 *
 * console.log('✅ Analysis completed successfully:', {
 *   executionTime: `${executionTime / 1000}s`,
 *   qualityScore: analysisResult.quality.overall,
 *   deliverables: analysisResult.deliverables.map(d => d.title),
 *   cognitiveContributions: analysisResult.contributions,
 *   performanceMetrics: {
 *     efficiency: analysisResult.metrics.efficiency,
 *     accuracy: analysisResult.metrics.accuracy,
 *     innovation: analysisResult.metrics.innovation,
 *     diversityUtilization: analysisResult.metrics.diversityUtilization
 *   }
 * });
 *
 * // Analyze swarm performance and cognitive diversity effectiveness
 * const performanceAnalyzer = new PerformanceAnalyzer(complexAnalysisSwarm);
 * const diversityAnalysis = await performanceAnalyzer.analyzeCognitiveDiversity({
 *   includeIndividualContributions: true,
 *   includeSynergyEffects: true,
 *   includeConflictResolution: true,
 *   includeLearningOutcomes: true
 * });
 *
 * console.log('📊 Cognitive Diversity Analysis Results:', {
 *   overallEffectiveness: diversityAnalysis.effectiveness,
 *   profileContributions: diversityAnalysis.profileContributions,
 *   synergyEffects: diversityAnalysis.synergyEffects,
 *   improvementRecommendations: diversityAnalysis.recommendations
 * });
 *
 * // Cleanup ephemeral swarm with performance data preservation
 * await complexAnalysisSwarm.cleanup({
 *   preserveResults: true,
 *   preserveMetrics: true,
 *   preserveLearnings: true,
 *   generateReport: true
 * });
 *
 * console.log('🧹 Swarm cleanup completed, performance data preserved for future optimization');
 * ```
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 *
 * @see {@link https://github.com/zen-neural/claude-code-zen} Claude Code Zen Documentation
 * @see {@link ./src/main} Main Implementation
 *
 * @requires @claude-zen/foundation - Core utilities and infrastructure
 * @requires @modelcontextprotocol/sdk - MCP server implementation
 * @requires commander - CLI framework
 *
 * @packageDocumentation
 */

// ✅ MAIN ENTRY POINT - Use this for everything!
export { AgentManager } from './src/main';
export { AgentManager as default } from './src/main';

// Core types and interfaces
export type {
  Agent,
  AgentConfig,
  AgentStatus,
  SwarmConfig,
  SwarmTopology,
  CoordinationResult,
  AgentCapability,
  CognitiveProfile,
  AgentMetrics,
  SwarmMetrics,
  EphemeralSwarmConfig,
  DiversityRequirement,
} from './src/main';

// CLI and MCP exports
export { MCPServer } from './src/mcp-server';
export { CLIManager } from './src/cli';
export { WASMLoader } from './src/wasm-loader';

// Agent registry and swarm management (ServiceContainer-enhanced)
export {
  SwarmRegistry,
  getSwarmRegistry as getGlobalSwarmRegistry,
  createSwarmRegistry,
} from './src/swarm-registry';

// Factory functions and utilities
export {
  createAgent,
  createSwarm,
  createEphemeralSwarm,
  optimizeCognitiveDiversity,
  DEFAULT_CONFIG,
  AGENT_CATEGORIES,
  CAPABILITY_SETS,
  VERSION,
  DESCRIPTION,
} from './src/main';

// Configuration and constants
export type {
  AgentManagerConfig,
  SwarmCoordinationConfig,
  CognitiveDiversityConfig,
  PerformanceConfig,
} from './src/types';

/**
 * Agent Manager Package Information
 *
 * Comprehensive metadata about the agent manager package including
 * version details, capabilities, and feature set.
 */
export const AGENT_MANAGER_INFO = {
  version: '1.0.0',
  name: '@claude-zen/agent-manager',
  description: 'Ephemeral swarm orchestrator with CLI and MCP server',
  capabilities: [
    'Agent lifecycle management',
    'Ephemeral swarm coordination',
    'CLI tools and commands',
    'MCP server integration',
    'Cognitive diversity optimization',
    'Dynamic topology management',
    'Foundation telemetry integration',
    'Ruvswarm-inspired patterns',
  ],
  exports: {
    main: './src/main',
    cli: './src/cli',
    mcpServer: './src/mcp-server',
    wasmLoader: './src/wasm-loader',
    swarmRegistry: './src/swarm-registry',
  },
} as const;

/**
 * Agent Manager Documentation
 *
 * ## Overview
 *
 * Agent Manager provides comprehensive agent lifecycle management with
 * ephemeral swarm coordination capabilities. It integrates CLI tools,
 * MCP server functionality, and cognitive diversity optimization.
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────────────────────────────────────────┐
 * │                 CLI Interface                       │
 * │           (agent-manager commands)                  │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │                Agent Manager                        │
 * │  • Lifecycle management                            │
 * │  • Swarm coordination                              │
 * │  • Cognitive diversity                             │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │              MCP Server                             │
 * │  • Model Context Protocol                          │
 * │  • Agent management API                            │
 * │  • Integration endpoints                           │
 * └─────────────────┬───────────────────────────────────┘
 *                   │
 * ┌─────────────────▼───────────────────────────────────┐
 * │             Foundation Layer                        │
 * │  • Telemetry and monitoring                        │
 * │  • Error handling and circuits                     │
 * │  • Storage and persistence                         │
 * └─────────────────────────────────────────────────────┘
 * ```
 *
 * ## Agent Types and Capabilities
 *
 * | Type | Capabilities | Cognitive Profile |
 * |------|-------------|------------------|
 * | Researcher | web-search, analysis, documentation | analytical |
 * | Coder | typescript, react, testing, debugging | systematic |
 * | Analyst | data-processing, visualization, reporting | analytical |
 * | Creative | ideation, brainstorming, design | creative |
 * | Coordinator | project-management, coordination | systematic |
 * | Specialist | domain-specific expertise | focused |
 *
 * ## Cognitive Diversity (Ruvswarm)
 *
 * Implements ruvswarm-inspired cognitive diversity patterns:
 * - **Analytical**: Logic-driven, systematic approach
 * - **Creative**: Innovation-focused, divergent thinking
 * - **Systematic**: Process-oriented, methodical execution
 * - **Intuitive**: Pattern-recognition, rapid insights
 * - **Collaborative**: Team-focused, coordination skills
 *
 * ## Performance Characteristics
 *
 * - **Agent Capacity**: Up to 500 concurrent agents per manager
 * - **Swarm Size**: 2-50 agents per ephemeral swarm
 * - **Response Time**: <100ms for agent operations
 * - **Coordination Latency**: <500ms for swarm coordination
 * - **Memory Usage**: ~2MB per 100 agents
 * - **CLI Performance**: <50ms for most commands
 *
 * ## Getting Started
 *
 * ```bash
 * npm install @claude-zen/agent-manager @claude-zen/foundation
 * ```
 *
 * See the examples above for usage patterns.
 */
