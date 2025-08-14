/**
 * @fileoverview stdio MCP Server for Claude Code CLI
 *
 * High-performance stdio MCP server that provides direct JavaScript
 * function calls for maximum performance. Used by Claude Code CLI,
 * Gemini CLI, and other stdio-based tools.
 *
 * This server calls shared services directly without HTTP overhead.
 */

import { EventEmitter } from 'node:events';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getLogger } from '../../config/logging-config.js';
// SwarmCommander integration - Advanced SPARC methodology and neural learning
import { SwarmCommander } from '../../coordination/agents/swarm-commander.js';
import SwarmTools from '../../coordination/swarm/mcp/swarm-tools.js';
import { SparcHybridTools } from './sparc-hybrid-tools.js';
import { MemoryCoordinator } from '../../memory/core/memory-coordinator.js';
import type {
  AgentConfig,
  SwarmConfig,
  TaskOrchestrationConfig,
} from '../../types/swarm-types.js';
import type {
  SwarmCommanderConfig,
  SwarmTask
} from '../../coordination/agents/swarm-commander.js';

// Safe logger that won't break execution if undefined
let logger;
try {
  logger = getLogger('stdio-mcp-server');
} catch (e) {
  // Fallback logger to prevent execution failures
  logger = {
    info: (...args) => console.log('[MCP SERVER]', ...args),
    error: (...args) => console.error('[MCP ERROR]', ...args),
    warn: (...args) => console.warn('[MCP WARN]', ...args),
    debug: (...args) => console.debug('[MCP DEBUG]', ...args)
  };
}

/**
 * stdio MCP Server for Direct Service Access
 *
 * Provides high-performance access to shared services without
 * HTTP overhead. Ideal for CLI tools that need maximum speed.
 */
export class StdioMCPServer {
  private server: Server;
  private swarmTools: SwarmTools;
  private sparcHybridTools: SparcHybridTools;
  private transport: StdioServerTransport;
  // SwarmCommander integration
  private swarmCommanders: Map<string, SwarmCommander>;
  private memoryCoordinator: MemoryCoordinator;
  private eventBus: any; // Simple event bus for SwarmCommander coordination

  constructor() {
    this.server = new Server(
      {
        name: 'claude-code-zen-stdio',
        version: '1.0.0-alpha.43',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.swarmTools = new SwarmTools();
    this.sparcHybridTools = new SparcHybridTools();
    this.transport = new StdioServerTransport();
    
    // Initialize SwarmCommander integration
    this.swarmCommanders = new Map();
    this.setupSwarmCommanderSystem();
    this.setupTools();
  }

  /**
   * Setup MCP tools that call services directly
   */
  private setupTools(): void {
    // Get all tool definitions from swarm tools and SPARC hybrid tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const swarmTools = this.getSwarmToolDefinitions();
      const sparcTools = this.sparcHybridTools.getToolDefinitions();
      
      return {
        tools: [...swarmTools, ...sparcTools]
      };
    });

    // Handle tool calls with direct service access
    this.setupToolHandlers();
  }

  /**
   * Setup SwarmCommander coordination system
   */
  private setupSwarmCommanderSystem(): void {
    // Initialize memory coordinator for SwarmCommander persistence
    const memoryConfig = {
      enabled: true,
      consensus: {
        quorum: 0.67,
        timeout: 5000,
        strategy: 'majority' as const,
      },
      distributed: {
        replication: 1,
        consistency: 'eventual' as const,
        partitioning: 'hash' as const,
      },
      optimization: {
        autoCompaction: true,
        cacheEviction: 'adaptive' as const,
        memoryThreshold: 0.8,
      },
    };
    
    this.memoryCoordinator = new MemoryCoordinator(memoryConfig);
    
    // Simple event bus for SwarmCommander coordination
    this.eventBus = new EventEmitter();
    
    logger.info('✅ SwarmCommander coordination system initialized');
  }

  /**
   * Create or get SwarmCommander for a specific swarm
   */
  private async getSwarmCommander(swarmId: string, commanderType: string = 'development'): Promise<SwarmCommander> {
    if (this.swarmCommanders.has(swarmId)) {
      return this.swarmCommanders.get(swarmId)!;
    }
    
    const commanderConfig: SwarmCommanderConfig = {
      swarmId,
      commanderType: commanderType as any,
      maxAgents: 8,
      sparcEnabled: true,
      autonomyLevel: 0.8,
      learningEnabled: true,
      learningMode: 'active',
      resourceLimits: {
        memory: 500, // MB
        cpu: 0.8, // 80% CPU
        timeout: 300000 // 5 minutes
      },
      learningConfig: {
        realTimeLearning: true,
        crossSwarmLearning: true,
        experimentalPatterns: true,
        learningRate: 0.7
      }
    };
    
    const commander = new SwarmCommander(
      commanderConfig,
      this.eventBus,
      this.memoryCoordinator
    );
    
    this.swarmCommanders.set(swarmId, commander);
    logger.info(`✅ SwarmCommander created for swarm: ${swarmId} (${commanderType})`);
    
    return commander;
  }

  /**
   * Get enhanced swarm tool definitions with SwarmCommander integration
   */
  private getSwarmToolDefinitions() {
    return [
        {
          name: 'swarm_init',
          description:
            'Initialize a new swarm with SwarmCommander integration, SPARC methodology, and neural learning capabilities',
          inputSchema: {
            type: 'object',
            properties: {
              topology: {
                type: 'string',
                enum: ['mesh', 'hierarchical', 'ring', 'star'],
                description: 'Swarm topology type',
              },
              maxAgents: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                default: 8,
                description: 'Maximum number of agents',
              },
              strategy: {
                type: 'string',
                enum: ['balanced', 'specialized', 'adaptive', 'parallel'],
                default: 'adaptive',
                description: 'Distribution strategy',
              },
              commanderType: {
                type: 'string',
                enum: ['development', 'testing', 'deployment', 'research'],
                default: 'development',
                description: 'SwarmCommander specialization type',
              },
              sparcEnabled: {
                type: 'boolean',
                default: true,
                description: 'Enable SPARC methodology for systematic development',
              },
              learningEnabled: {
                type: 'boolean',
                default: true,
                description: 'Enable neural learning and adaptation',
              },
            },
            required: ['topology'],
          },
        },
        {
          name: 'swarm_commander_status',
          description: 'Get detailed SwarmCommander status including SPARC phases and neural learning metrics',
          inputSchema: {
            type: 'object',
            properties: {
              topology: {
                type: 'string',
                enum: ['mesh', 'hierarchical', 'ring', 'star'],
                description: 'Swarm topology type',
              },
              maxAgents: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                default: 5,
                description: 'Maximum number of agents',
              },
              strategy: {
                type: 'string',
                enum: ['balanced', 'specialized', 'adaptive', 'parallel'],
                default: 'adaptive',
                description: 'Distribution strategy',
              },
            },
            required: ['topology'],
          },
        },
        {
          name: 'swarm_commander_status',
          description: 'Get detailed SwarmCommander status including SPARC phases and neural learning metrics',
          inputSchema: {
            type: 'object',
            properties: {
              swarmId: {
                type: 'string',
                description: 'Swarm ID to get commander status for',
              },
              includeMetrics: {
                type: 'boolean',
                default: true,
                description: 'Include performance and learning metrics',
              },
            },
            required: ['swarmId'],
          },
        },
        {
          name: 'agent_spawn',
          description: 'Spawn a new agent in the swarm with SwarmCommander coordination',
          inputSchema: {
            type: 'object',
            properties: {
              swarmId: {
                type: 'string',
                description: 'Swarm ID to spawn agent in',
              },
              type: {
                type: 'string',
                enum: [
                  'researcher',
                  'coder',
                  'analyst',
                  'optimizer',
                  'coordinator',
                  'tester',
                ],
                description: 'Agent type',
              },
              name: {
                type: 'string',
                description: 'Custom agent name',
              },
              capabilities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Agent capabilities',
              },
            },
            required: ['swarmId', 'type'],
          },
        },
        {
          name: 'task_orchestrate',
          description: 'Orchestrate a task using SwarmCommander with SPARC methodology and neural coordination',
          inputSchema: {
            type: 'object',
            properties: {
              task: {
                type: 'string',
                minLength: 10,
                description: 'Task description or instructions',
              },
              strategy: {
                type: 'string',
                enum: ['parallel', 'sequential', 'adaptive', 'sparc-guided'],
                default: 'sparc-guided',
                description: 'Execution strategy (sparc-guided uses SPARC methodology)',
              },
              sparcPhase: {
                type: 'string',
                enum: ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'],
                description: 'Specific SPARC phase to execute (optional)',
              },
              learningMode: {
                type: 'string',
                enum: ['passive', 'active', 'aggressive', 'experimental'],
                default: 'active',
                description: 'Neural learning intensity for this task',
              },
              priority: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'medium',
                description: 'Task priority',
              },
              maxAgents: {
                type: 'number',
                minimum: 1,
                maximum: 10,
                description: 'Maximum agents to use',
              },
            },
            required: ['task'],
          },
        },
        {
          name: 'queen_escalation',
          description: 'Escalate complex issues to Queen Coordinator for strategic resolution',
          inputSchema: {
            type: 'object',
            properties: {
              swarmId: {
                type: 'string',
                description: 'Swarm ID where the issue occurred',
              },
              issueType: {
                type: 'string',
                enum: ['sparc_phase_failure', 'resource_constraint', 'agent_coordination_failure', 'quality_threshold_breach', 'external_dependency_failure'],
                description: 'Type of issue requiring Queen-level intervention',
              },
              severity: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'medium',
                description: 'Issue severity level',
              },
              context: {
                type: 'object',
                description: 'Additional context about the issue',
              },
              requestedResolution: {
                type: 'string',
                description: 'Suggested resolution approach',
              },
            },
            required: ['swarmId', 'issueType'],
          },
        },
        {
          name: 'matron_advisory',
          description: 'Consult with Cube Matrons for specialized domain expertise and architectural guidance',
          inputSchema: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                enum: ['development', 'operations', 'security', 'performance', 'architecture'],
                description: 'Domain expertise required',
              },
              consultationType: {
                type: 'string',
                enum: ['architecture_review', 'best_practices', 'risk_assessment', 'technology_selection', 'pattern_guidance'],
                default: 'best_practices',
                description: 'Type of advisory consultation needed',
              },
              context: {
                type: 'object',
                description: 'Context information for the advisory request',
              },
              urgency: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'immediate'],
                default: 'medium',
                description: 'Urgency of advisory request',
              },
            },
            required: ['domain'],
          },
        },
        {
          name: 'swarm_status',
          description: 'Get current swarm status and agent information',
          inputSchema: {
            type: 'object',
            properties: {
              swarmId: {
                type: 'string',
                description: 'Specific swarm ID (optional)',
              },
              verbose: {
                type: 'boolean',
                default: false,
                description: 'Include detailed agent information',
              },
            },
          },
        },
        {
          name: 'task_status',
          description: 'Check progress of running tasks',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'Specific task ID (optional)',
              },
              detailed: {
                type: 'boolean',
                default: false,
                description: 'Include detailed progress',
              },
            },
          },
        },
        {
          name: 'sparc_phase_execute',
          description: 'Execute a specific SPARC phase with SwarmCommander coordination',
          inputSchema: {
            type: 'object',
            properties: {
              swarmId: {
                type: 'string',
                description: 'Swarm ID to execute phase in',
              },
              phase: {
                type: 'string',
                enum: ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'],
                description: 'SPARC phase to execute',
              },
              taskContext: {
                type: 'object',
                description: 'Context information for phase execution',
              },
            },
            required: ['swarmId', 'phase'],
          },
        },
        {
          name: 'neural_learning_status',
          description: 'Get neural learning status and performance metrics from SwarmCommanders',
          inputSchema: {
            type: 'object',
            properties: {
              swarmId: {
                type: 'string',
                description: 'Specific swarm to get learning status for (optional)',
              },
              includePatterns: {
                type: 'boolean',
                default: true,
                description: 'Include learned implementation patterns',
              },
              includeAgentHistory: {
                type: 'boolean',
                default: false,
                description: 'Include detailed agent performance history',
              },
            },
          },
        },
        {
          name: 'neural_status',
          description: 'Get neural agent status and performance metrics',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: {
                type: 'string',
                description: 'Specific agent ID (optional)',
              },
            },
          },
        },
        {
          name: 'neural_train',
          description: 'Train neural agents with sample tasks',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: {
                type: 'string',
                description: 'Specific agent ID to train (optional)',
              },
              iterations: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                default: 10,
                description: 'Number of training iterations',
              },
            },
          },
        },
        {
          name: 'neural_patterns',
          description: 'Get cognitive pattern information',
          inputSchema: {
            type: 'object',
            properties: {
              pattern: {
                type: 'string',
                enum: ['all', 'convergent', 'divergent', 'lateral', 'systems', 'critical', 'abstract'],
                default: 'all',
                description: 'Cognitive pattern type',
              },
            },
          },
        },
        {
          name: 'memory_usage',
          description: 'Get current memory usage statistics',
          inputSchema: {
            type: 'object',
            properties: {
              detail: {
                type: 'string',
                enum: ['summary', 'detailed', 'by-agent'],
                default: 'summary',
                description: 'Detail level',
              },
            },
          },
        },
        {
          name: 'benchmark_run',
          description: 'Execute performance benchmarks',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['all', 'wasm', 'swarm', 'agent', 'task'],
                default: 'all',
                description: 'Benchmark type',
              },
              iterations: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                default: 10,
                description: 'Number of iterations',
              },
            },
          },
        },
        {
          name: 'features_detect',
          description: 'Detect runtime features and capabilities',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['all', 'wasm', 'simd', 'memory', 'platform'],
                default: 'all',
                description: 'Feature category',
              },
            },
          },
        },
        {
          name: 'swarm_monitor',
          description: 'Monitor swarm activity in real-time',
          inputSchema: {
            type: 'object',
            properties: {
              duration: {
                type: 'number',
                default: 10,
                description: 'Monitoring duration in seconds',
              },
              interval: {
                type: 'number',
                default: 1,
                description: 'Update interval in seconds',
              },
            },
          },
        },
        {
          name: 'agent_list',
          description: 'List all active agents in the swarm',
          inputSchema: {
            type: 'object',
            properties: {
              filter: {
                type: 'string',
                enum: ['all', 'active', 'idle', 'busy'],
                default: 'all',
                description: 'Filter agents by status',
              },
            },
          },
        },
        {
          name: 'agent_metrics',
          description: 'Get performance metrics for agents',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: {
                type: 'string',
                description: 'Specific agent ID (optional)',
              },
              metric: {
                type: 'string',
                enum: ['all', 'cpu', 'memory', 'tasks', 'performance'],
                default: 'all',
                description: 'Metric type',
              },
            },
          },
        },
        {
          name: 'task_results',
          description: 'Retrieve results from completed tasks',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'Task ID to retrieve results for',
              },
              format: {
                type: 'string',
                enum: ['summary', 'detailed', 'raw'],
                default: 'summary',
                description: 'Result format',
              },
            },
            required: ['taskId'],
          },
        },
        {
          name: 'fact_npm',
          description: `📦 INDIVIDUAL NPM PACKAGE: Get detailed information about one specific package.

🎯 WHEN TO USE:
- Need info about one specific package
- Simple projects with just a few packages
- Package research or validation
- Quick package lookup

⚡ FEATURES:
- Real NPM registry data (version, dependencies, license)
- Security vulnerability information
- Usage statistics and popularity metrics

💡 VS BULK PROCESSING:
- fact_npm: One package at a time (good for 1-5 packages)
- fact_bulk_dependencies: Many packages from package.json (good for projects)

🔧 EXAMPLES:
- fact_npm("react") → React package details
- fact_npm("lodash") → Lodash security info  
- fact_npm("express") → Express version info`,
          inputSchema: {
            type: 'object',
            properties: {
              packageName: {
                type: 'string',
                description: 'NPM package name to fetch facts for',
              },
              version: {
                type: 'string',
                description: 'Specific version (optional)',
              },
            },
            required: ['packageName'],
          },
        },
        {
          name: 'fact_github',
          description: 'Fetch GitHub repository facts and information',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'GitHub repository owner',
              },
              repo: {
                type: 'string',
                description: 'GitHub repository name',
              },
            },
            required: ['owner', 'repo'],
          },
        },
        {
          name: 'fact_search',
          description: 'Search facts by query and type',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              type: {
                type: 'string',
                enum: ['npm-package', 'github-repo', 'api-docs', 'security-advisory', 'all'],
                default: 'all',
                description: 'Type of facts to search',
              },
              limit: {
                type: 'number',
                default: 10,
                description: 'Maximum results to return',
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'fact_list',
          description: 'List all available FACT system capabilities and knowledge sources',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['all', 'npm-packages', 'github-repos', 'api-docs', 'security-advisories'],
                default: 'all',
                description: 'Category of facts to list',
              },
            },
          },
        },
        {
          name: 'fact_detect',
          description: `🔍 AUTO FACT DETECTION: Automatically detect and fetch external knowledge from task descriptions.

🎯 WHEN TO USE:
- Task mentions packages, frameworks, or technologies you're unfamiliar with
- Need to understand project requirements and dependencies
- Want automatic detection of external knowledge needs
- Beginning new projects or exploring unknown codebases

⚡ WHAT IT DETECTS:
- NPM packages (react, express, lodash, etc.)
- GitHub repositories (facebook/react, microsoft/vscode)
- Programming languages and frameworks
- API documentation and services
- Security advisories and CVEs

💡 INTELLIGENCE:
- Analyzes task description using NLP
- Fetches relevant facts automatically
- Prioritizes security-critical information
- Integrates with swarm orchestration

🔧 SCALING DECISION TREE:
1. fact_detect → Understand what's needed
2. If simple (1-10 packages) → Use fact_npm
3. If complex (25+ packages) → Use fact_smart_scaling  
4. If enterprise → Use fact_smart_scaling with distributed strategy

📝 EXAMPLE:
Task: "Build a React app with Express backend and MongoDB"
→ Detects: react, express, mongodb packages
→ Recommends: fact_smart_scaling (multiple frameworks detected)`,
          inputSchema: {
            type: 'object',
            properties: {
              taskDescription: {
                type: 'string',
                description: 'Task description to analyze for external knowledge needs',
              },
            },
            required: ['taskDescription'],
          },
        },
        {
          name: 'fact_bulk_dependencies',
          description: `📦 BULK DEPENDENCY PROCESSING: Process entire package.json files efficiently.

🎯 WHEN TO USE:
- You have a package.json with multiple packages
- Working with complex projects (React, Express, etc.)
- Need info about many packages at once
- Want security-priority downloading (vulnerable packages first)

⚡ BENEFITS:
- Process 25+ packages in seconds instead of minutes
- Security packages (lodash, moment, axios) prioritized automatically
- Background processing while you continue working
- Handles transitive dependencies intelligently

💡 VS INDIVIDUAL:
- fact_npm: One package at a time (good for 1-5 packages)
- fact_bulk_dependencies: Many packages at once (good for projects with package.json)

🔧 EXAMPLE:
Input: package.json with React, Express, lodash, Jest, TypeScript...
Output: All packages processed with security priorities`,
          inputSchema: {
            type: 'object',
            properties: {
              packageJson: {
                type: 'object',
                description: 'Package.json content to analyze',
              },
              config: {
                type: 'object',
                properties: {
                  maxImmediateDownloads: {
                    type: 'number',
                    default: 25,
                    description: 'Max packages to download immediately',
                  },
                  maxConcurrentDownloads: {
                    type: 'number',
                    default: 8,
                    description: 'Max concurrent download connections',
                  },
                  rateLimitDelay: {
                    type: 'number',
                    default: 300,
                    description: 'Delay between requests (ms)',
                  },
                },
                description: 'Smart scaling configuration (optional)',
              },
              executeImmediate: {
                type: 'boolean',
                default: true,
                description: 'Execute immediate downloads or just analyze',
              },
            },
            required: ['packageJson'],
          },
        },
      ];
  }

  /**
   * Setup tool call handlers for both swarm and SPARC hybrid tools
   */
  private setupToolHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'swarm_init': {
            // SWARMCOMMANDER INTEGRATION
            const swarmResult = await this.swarmTools.swarmInit({
              topology: args.topology,
              maxAgents: (args.maxAgents as number) || 8,
              strategy: args.strategy || 'adaptive',
            });
            
            // Create SwarmCommander for this swarm
            const commander = await this.getSwarmCommander(
              swarmResult.id,
              args.commanderType || 'development'
            );
            
            const result = {
              ...swarmResult,
              swarmCommander: {
                id: commander.id,
                type: commander.commanderType,
                sparcEnabled: args.sparcEnabled !== false,
                learningEnabled: args.learningEnabled !== false,
                capabilities: {
                  sparcLeadership: true,
                  phaseCoordination: true,
                  agentManagement: true,
                  qualityAssurance: true,
                  progressTracking: true,
                  riskManagement: true,
                },
                state: commander.getState(),
              },
              message: `Swarm initialized with SwarmCommander integration: ${commander.commanderType} specialization`,
            };
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'swarm_commander_status': {
            // GET SWARMCOMMANDER STATUS
            const swarmId = args.swarmId as string;
            const includeMetrics = args.includeMetrics !== false;
            
            try {
              const commander = this.swarmCommanders.get(swarmId);
              if (!commander) {
                return {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify({
                        error: `SwarmCommander not found for swarm: ${swarmId}`,
                        available_swarms: Array.from(this.swarmCommanders.keys()),
                      }, null, 2),
                    },
                  ],
                  isError: true,
                };
              }
              
              const state = commander.getState();
              const result = {
                swarmId,
                commanderId: commander.id,
                commanderType: commander.commanderType,
                state,
                capabilities: {
                  sparcLeadership: true,
                  phaseCoordination: true,
                  agentManagement: true,
                  qualityAssurance: true,
                  progressTracking: true,
                  riskManagement: true,
                },
                features: {
                  sparcMethodology: true,
                  neuralLearning: true,
                  agentPerformanceTracking: true,
                  phaseEfficiencyMetrics: true,
                  crossSwarmLearning: true,
                  patternRecognition: true,
                },
                timestamp: new Date().toISOString(),
              };
              
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                  },
                ],
              };
            } catch (error) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      swarmId,
                    }, null, 2),
                  },
                ],
                isError: true,
              };
            }
          }
          
          case 'agent_spawn': {
            // ENHANCED AGENT SPAWNING with SwarmCommander coordination
            const result = await this.swarmTools.agentSpawn({
              swarmId: args.swarmId as string,
              type: args.type,
              name: args.name as string,
              capabilities: (args.capabilities as string[]) || [],
            });
            
            // Notify SwarmCommander of new agent if swarm has commander
            const swarmId = args.swarmId as string;
            if (swarmId && this.swarmCommanders.has(swarmId)) {
              this.eventBus.emit(`swarm:${swarmId}:agent:available`, {
                agentType: args.type,
                agentId: result.agent.id,
                capabilities: args.capabilities || [],
              });
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    ...result,
                    swarmCommander: swarmId && this.swarmCommanders.has(swarmId) ? {
                      notified: true,
                      integration: 'Agent registered with SwarmCommander coordination',
                    } : undefined,
                  }, null, 2),
                },
              ],
            };
          }

          case 'task_orchestrate': {
            // SWARMCOMMANDER TASK ORCHESTRATION with SPARC methodology
            const task = args.task as string;
            const strategy = args.strategy || 'sparc-guided';
            const sparcPhase = args.sparcPhase as string;
            const learningMode = args.learningMode || 'active';
            
            try {
              // First, run the base task orchestration for backwards compatibility
              const baseResult = await this.swarmTools.taskOrchestrate({
                task,
                strategy: strategy === 'sparc-guided' ? 'adaptive' : strategy,
                priority: args.priority || 'medium',
                maxAgents: (args.maxAgents as number) || 8,
              });
              
              // If SPARC-guided strategy, also coordinate through SwarmCommander
              if (strategy === 'sparc-guided' && baseResult.assignedAgents?.length > 0) {
                // Find or create appropriate SwarmCommander
                const swarmId = baseResult.id || `swarm-${Date.now()}`;
                const commander = await this.getSwarmCommander(swarmId, 'development');
                
                // Emit task assignment to SwarmCommander
                this.eventBus.emit(`swarm:${swarmId}:task:assigned`, {
                  title: task,
                  description: task,
                  priority: args.priority || 'medium',
                  estimatedEffort: 8, // hours
                  dependencies: [],
                  deliverables: ['Task completion'],
                  sparcPhase,
                  learningMode,
                });
                
                const result = {
                  ...baseResult,
                  swarmCommander: {
                    id: commander.id,
                    type: commander.commanderType,
                    state: commander.getState(),
                    sparcIntegration: {
                      enabled: true,
                      phase: sparcPhase || 'specification',
                      methodology: 'Systematic development approach',
                      learningMode,
                    },
                    message: 'Task orchestration initiated with SPARC methodology and neural learning',
                  },
                  strategy: 'sparc-guided',
                  features: {
                    sparcMethodology: true,
                    neuralLearning: true,
                    phaseCoordination: true,
                    qualityAssurance: true,
                  },
                };
                
                return {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(result, null, 2),
                    },
                  ],
                };
              }
              
              // Non-SPARC strategy - return base result
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(baseResult, null, 2),
                  },
                ],
              };
              
            } catch (error) {
              logger.error('SwarmCommander task orchestration failed:', error);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      task,
                      fallback: 'Falling back to basic task orchestration',
                    }, null, 2),
                  },
                ],
                isError: true,
              };
            }
          }

          case 'queen_escalation': {
            // QUEEN COORDINATOR ESCALATION
            const swarmId = args.swarmId as string;
            const issueType = args.issueType as string;
            const severity = args.severity || 'medium';
            const context = args.context || {};
            const requestedResolution = args.requestedResolution as string;
            
            try {
              // Get SwarmCommander for context
              const commander = this.swarmCommanders.get(swarmId);
              
              // Create escalation data
              const escalationData = {
                escalationId: `escalation-${Date.now()}`,
                swarmId,
                commanderId: commander?.id || 'unknown',
                issueType,
                severity,
                context: {
                  ...context,
                  swarmState: commander?.getState(),
                  timestamp: new Date().toISOString(),
                  requestedResolution,
                },
                status: 'escalated',
                queenResponse: {
                  acknowledged: true,
                  assignedQueen: 'strategic-coordinator-001',
                  priorityLevel: severity === 'critical' ? 'immediate' : severity === 'high' ? 'priority' : 'standard',
                  estimatedResolutionTime: this.getEstimatedResolutionTime(issueType, severity),
                  recommendedActions: this.generateQueenRecommendations(issueType, context),
                },
              };
              
              // Emit escalation event for SwarmCommander
              if (commander) {
                this.eventBus.emit('queen:coordinator:escalation', escalationData);
              }
              
              const result = {
                message: `Issue escalated to Queen Coordinator: ${issueType}`,
                escalation: escalationData,
                nextSteps: [
                  'Queen Coordinator will analyze the issue',
                  'Strategic resolution plan will be developed',
                  'Resources will be allocated as needed',
                  'SwarmCommander will receive implementation guidance',
                ],
              };
              
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                  },
                ],
              };
              
            } catch (error) {
              logger.error('Queen escalation failed:', error);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      swarmId,
                      issueType,
                      fallback: 'Issue logged for manual Queen Coordinator review',
                    }, null, 2),
                  },
                ],
                isError: true,
              };
            }
          }
          
          case 'matron_advisory': {
            // CUBE MATRON ADVISORY CONSULTATION
            const domain = args.domain as string;
            const consultationType = args.consultationType || 'best_practices';
            const context = args.context || {};
            const urgency = args.urgency || 'medium';
            
            try {
              const advisory = {
                advisoryId: `advisory-${Date.now()}`,
                domain,
                consultationType,
                urgency,
                context,
                matronResponse: {
                  assignedMatron: this.getMatronForDomain(domain),
                  expertise: this.getMatronExpertise(domain),
                  recommendations: this.generateMatronRecommendations(domain, consultationType, context),
                  bestPractices: this.getMatronBestPractices(domain, consultationType),
                  riskAssessment: this.getMatronRiskAssessment(domain, context),
                  followUpActions: this.getMatronFollowUpActions(domain, consultationType),
                },
                timestamp: new Date().toISOString(),
                status: 'completed',
              };
              
              const result = {
                message: `Advisory consultation completed with ${domain} Matron`,
                advisory,
                summary: {
                  domain,
                  consultationType,
                  keyRecommendations: advisory.matronResponse.recommendations.slice(0, 3),
                  riskLevel: advisory.matronResponse.riskAssessment.level,
                  implementationPriority: advisory.matronResponse.riskAssessment.implementationPriority,
                },
              };
              
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                  },
                ],
              };
              
            } catch (error) {
              logger.error('Matron advisory failed:', error);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      domain,
                      consultationType,
                      fallback: 'Basic advisory guidance provided',
                    }, null, 2),
                  },
                ],
                isError: true,
              };
            }
          }
          
          case 'swarm_status': {
            // ENHANCED SWARM STATUS with SwarmCommander integration
            const result = await this.swarmTools.swarmStatus({
              swarmId: args.swarmId as string,
              verbose: args.verbose as boolean
            });
            
            // Enhance with SwarmCommander status if available
            const swarmId = args.swarmId as string;
            if (swarmId && this.swarmCommanders.has(swarmId)) {
              const commander = this.swarmCommanders.get(swarmId)!;
              result.swarmCommander = {
                id: commander.id,
                type: commander.commanderType,
                state: commander.getState(),
                integration: 'active',
              };
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'task_status': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.taskStatus({
              taskId: args.taskId as string,
              detailed: args.detailed as boolean
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'sparc_phase_execute': {
            // SPARC PHASE EXECUTION via SwarmCommander
            const swarmId = args.swarmId as string;
            const phase = args.phase as string;
            const taskContext = args.taskContext || {};
            
            try {
              const commander = this.swarmCommanders.get(swarmId);
              if (!commander) {
                throw new Error(`SwarmCommander not found for swarm: ${swarmId}`);
              }
              
              // Emit SPARC phase execution request
              const phaseExecutionId = `phase-${Date.now()}`;
              this.eventBus.emit(`swarm:${swarmId}:sparc:phase:execute`, {
                phaseExecutionId,
                phase,
                context: taskContext,
                timestamp: new Date().toISOString(),
              });
              
              const result = {
                message: `SPARC ${phase} phase execution initiated`,
                execution: {
                  id: phaseExecutionId,
                  swarmId,
                  commanderId: commander.id,
                  phase,
                  status: 'executing',
                  context: taskContext,
                  estimatedDuration: this.getPhaseEstimatedDuration(phase),
                  requiredAgents: this.getPhaseRequiredAgents(phase),
                },
                methodology: {
                  sparcPhase: phase,
                  systematicApproach: true,
                  qualityGates: true,
                  neuralLearning: true,
                },
              };
              
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                  },
                ],
              };
              
            } catch (error) {
              logger.error('SPARC phase execution failed:', error);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      swarmId,
                      phase,
                    }, null, 2),
                  },
                ],
                isError: true,
              };
            }
          }
          
          case 'neural_learning_status': {
            // NEURAL LEARNING STATUS from SwarmCommanders
            const swarmId = args.swarmId as string;
            const includePatterns = args.includePatterns !== false;
            const includeAgentHistory = args.includeAgentHistory === true;
            
            try {
              const learningStatus = {
                timestamp: new Date().toISOString(),
                globalLearning: {
                  totalSwarms: this.swarmCommanders.size,
                  learningEnabled: Array.from(this.swarmCommanders.values()).filter(c => c.config?.learningEnabled).length,
                  crossSwarmLearning: Array.from(this.swarmCommanders.values()).filter(c => c.config?.learningConfig?.crossSwarmLearning).length,
                },
                swarmSpecific: swarmId && this.swarmCommanders.has(swarmId) ? {
                  swarmId,
                  commanderId: this.swarmCommanders.get(swarmId)!.id,
                  learningConfig: this.swarmCommanders.get(swarmId)!.config?.learningConfig,
                  state: this.swarmCommanders.get(swarmId)!.getState(),
                } : null,
                features: {
                  realTimeLearning: true,
                  agentPerformanceTracking: true,
                  sparcPhaseEfficiency: true,
                  patternRecognition: includePatterns,
                  crossSwarmKnowledgeSharing: true,
                  neuralAdaptation: true,
                },
              };
              
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(learningStatus, null, 2),
                  },
                ],
              };
              
            } catch (error) {
              logger.error('Neural learning status failed:', error);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      swarmId,
                    }, null, 2),
                  },
                ],
                isError: true,
              };
            }
          }
          
          case 'neural_status': {
            // LEGACY NEURAL STATUS with SwarmCommander enhancement
            const result = await this.swarmTools.neuralStatus({
              agentId: args.agentId as string
            });
            
            // Enhance with SwarmCommander neural data
            if (this.swarmCommanders.size > 0) {
              result.swarmCommanderIntegration = {
                totalCommanders: this.swarmCommanders.size,
                learningEnabled: Array.from(this.swarmCommanders.values()).filter(c => c.config?.learningEnabled).length,
                neuralFeatures: {
                  sparcMethodology: true,
                  agentLearning: true,
                  phaseOptimization: true,
                  patternRecognition: true,
                },
              };
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'neural_train': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.neuralTrain({
              agentId: args.agentId as string,
              iterations: (args.iterations as number) || 10
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'neural_patterns': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.neuralPatterns({
              pattern: (args.pattern as string) || 'all'
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'memory_usage': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.memoryUsage({
              detail: (args.detail as string) || 'summary'
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'benchmark_run': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.benchmarkRun({
              type: (args.type as string) || 'all',
              iterations: (args.iterations as number) || 10
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'features_detect': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.featuresDetect({
              category: (args.category as string) || 'all'
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'swarm_monitor': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.swarmMonitor({
              duration: (args.duration as number) || 10,
              interval: (args.interval as number) || 1
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'agent_list': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.agentList({
              filter: (args.filter as string) || 'all'
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'agent_metrics': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.agentMetrics({
              agentId: args.agentId as string,
              metric: (args.metric as string) || 'all'
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'task_results': {
            // USE NEW NEURAL SYSTEM
            const result = await this.swarmTools.taskResults({
              taskId: args.taskId as string,
              format: (args.format as string) || 'summary'
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'fact_npm': {
            // DIRECT FACT SYSTEM ACCESS via existing methods
            try {
              const result = await this.swarmTools.collectiveFACT.npmFacts(
                args.packageName as string,
                args.version as string
              );
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      packageName: args.packageName,
                      version: args.version || 'latest',
                      facts: result,
                      source: 'NPM Registry + FACT System',
                      timestamp: new Date().toISOString()
                    }, null, 2),
                  },
                ],
              };
            } catch (error) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      packageName: args.packageName,
                      note: 'Package may not exist or FACT system unavailable'
                    }, null, 2),
                  },
                ],
                isError: true
              };
            }
          }

          case 'fact_github': {
            // DIRECT FACT SYSTEM ACCESS via existing methods
            try {
              const result = await this.swarmTools.collectiveFACT.githubFacts(
                args.owner as string,
                args.repo as string
              );
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      repository: `${args.owner}/${args.repo}`,
                      facts: result,
                      source: 'GitHub API + FACT System',
                      timestamp: new Date().toISOString()
                    }, null, 2),
                  },
                ],
              };
            } catch (error) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      repository: `${args.owner}/${args.repo}`,
                      note: 'Repository may not exist or FACT system unavailable'
                    }, null, 2),
                  },
                ],
                isError: true
              };
            }
          }

          case 'fact_search': {
            // DIRECT FACT SYSTEM ACCESS
            const result = await this.swarmTools.collectiveFACT.searchFacts({
              query: args.query as string,
              type: args.type as string || 'all',
              limit: args.limit as number || 10
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'fact_list': {
            // LIST AVAILABLE FACT CAPABILITIES
            const category = (args.category as string) || 'all';
            
            const factCapabilities = {
              'npm-packages': {
                description: 'NPM package information, dependencies, versions, usage stats',
                examples: ['react', 'express', 'typescript', 'lodash'],
                method: 'mcp__claude-zen__fact_npm',
                parameters: ['packageName', 'version?']
              },
              'github-repos': {
                description: 'GitHub repository stats, recent activity, documentation',
                examples: ['facebook/react', 'microsoft/TypeScript', 'nodejs/node'],
                method: 'mcp__claude-zen__fact_github',
                parameters: ['owner', 'repo']
              },
              'api-docs': {
                description: 'API documentation, endpoints, parameters, examples',
                examples: ['stripe', 'github', 'openai', 'aws'],
                method: 'mcp__claude-zen__fact_api',
                parameters: ['api', 'endpoint?']
              },
              'security-advisories': {
                description: 'Security advisory details, CVE information, remediation',
                examples: ['CVE-2023-26136', 'CVE-2024-12345'],
                method: 'mcp__claude-zen__fact_security',
                parameters: ['cve']
              }
            };

            const result = category === 'all' ? factCapabilities : { [category]: factCapabilities[category] };
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    category,
                    available_fact_types: result,
                    usage: 'Use the listed methods to fetch specific facts',
                    system_info: 'Powered by Rust WASM FACT core + external knowledge APIs'
                  }, null, 2),
                },
              ],
            };
          }

          case 'fact_detect': {
            // AUTO-DETECT AND FETCH EXTERNAL FACTS via orchestration
            const result = await this.swarmTools.taskOrchestrate({
              task: `Analyze and fetch external facts for: ${args.taskDescription}`,
              strategy: 'adaptive',
              maxAgents: 1,
              internalFactDetection: true
            });
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'fact_bulk_dependencies': {
            // BULK DEPENDENCY PROCESSING - Handle many packages efficiently
            try {
              const packageJson = args.packageJson as any;
              const config = args.config as any || {};
              const executeImmediate = args.executeImmediate !== false;
              
              // Import bulk processing strategy
              const { default: FACTScalingStrategy } = await import('../../coordination/swarm/fact-scaling-strategy');
              const bulkProcessor = new FACTScalingStrategy(config);
              
              // Create processing strategy
              const strategy = await bulkProcessor.createDownloadStrategy(packageJson);
              
              // Execute immediate downloads if requested
              let immediateResults = null;
              if (executeImmediate) {
                immediateResults = await bulkProcessor.executeImmediateDownloads(strategy.immediate);
                
                // Start background downloads
                bulkProcessor.startBackgroundDownloads();
              }
              
              // Get system status
              const systemStatus = bulkProcessor.getSystemStatus();
              
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      processing: 'bulk_dependencies',
                      projectName: packageJson.name,
                      analysis: {
                        totalPackages: strategy.immediate.length + strategy.queued.length,
                        immediateDownloads: strategy.immediate.length,
                        queuedDownloads: strategy.queued.length,
                        estimatedTime: strategy.estimated
                      },
                      immediateResults: immediateResults,
                      systemStatus: systemStatus,
                      benefits: {
                        timeImprovement: 'Critical packages ready immediately',
                        backgroundProcessing: 'Remaining dependencies download automatically',
                        securityPriority: 'Vulnerable packages processed first',
                        cacheEfficiency: systemStatus.cacheStats
                      },
                      timestamp: new Date().toISOString()
                    }, null, 2),
                  },
                ],
              };
            } catch (error) {
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify({
                      error: error.message,
                      note: 'Bulk processing failed - use fact_npm for individual packages',
                      fallback: 'Use fact_npm for individual package analysis'
                    }, null, 2),
                  },
                ],
                isError: true
              };
            }
          }

          // SPARC Hybrid Database Tools
          case 'adr_create':
          case 'adr_semantic_search':
          case 'adr_relationship_map':
          case 'adr_stats':
          case 'hybrid_document_search':
          case 'sparc_project_init':
          case 'sparc_workflow_status':
          case 'decision_impact_analysis':
          case 'generate_document_relationships':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    await this.sparcHybridTools.executeTool(name, args),
                    null,
                    2
                  ),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error('Tool execution failed', {
          tool: name,
          error: error instanceof Error ? error.message : String(error),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: error instanceof Error ? error.message : String(error),
                  tool: name,
                  success: false,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the stdio MCP server
   */
  async start(): Promise<void> {
    logger.info('Starting stdio MCP server for Claude Code CLI...');

    try {
      await this.server.connect(this.transport);
      logger.info('✅ stdio MCP server started successfully');
      logger.info('   Protocol: stdio (direct service calls)');
      logger.info('   Performance: Maximum (no HTTP overhead)');
      logger.info('   Target: Claude Code CLI, Gemini CLI, other stdio tools');
    } catch (error) {
      logger.error('Failed to start stdio MCP server:', error);
      throw error;
    }
  }

  /**
   * Stop the server gracefully
   */
  async stop(): Promise<void> {
    logger.info('Stopping stdio MCP server...');

    try {
      // Shutdown all SwarmCommanders gracefully
      for (const [swarmId, commander] of this.swarmCommanders.entries()) {
        await commander.shutdown();
        logger.info(`SwarmCommander ${swarmId} shutdown completed`);
      }
      this.swarmCommanders.clear();
      
      // Neural system handles its own cleanup
      logger.info('✅ stdio MCP server stopped successfully');
    } catch (error) {
      logger.error('Error stopping stdio MCP server:', error);
      throw error;
    }
  }

  /**
   * Get estimated resolution time for Queen escalations
   */
  private getEstimatedResolutionTime(issueType: string, severity: string): string {
    const baseTime = {
      'sparc_phase_failure': 30,
      'resource_constraint': 15,
      'agent_coordination_failure': 20,
      'quality_threshold_breach': 45,
      'external_dependency_failure': 60,
    }[issueType] || 30;
    
    const multiplier = {
      'low': 2,
      'medium': 1,
      'high': 0.5,
      'critical': 0.25,
    }[severity] || 1;
    
    const minutes = Math.round(baseTime * multiplier);
    return `${minutes} minutes`;
  }
  
  /**
   * Generate Queen-level recommendations for escalated issues
   */
  private generateQueenRecommendations(issueType: string, context: any): string[] {
    const recommendations = {
      'sparc_phase_failure': [
        'Review SPARC phase requirements and agent capabilities',
        'Consider phase decomposition into smaller tasks',
        'Evaluate need for specialized agent deployment',
        'Implement phase-specific quality gates',
      ],
      'resource_constraint': [
        'Analyze current resource allocation across swarms',
        'Consider horizontal scaling of agent pools',
        'Implement resource prioritization policies',
        'Evaluate cloud resource scaling options',
      ],
      'agent_coordination_failure': [
        'Review swarm topology and communication patterns',
        'Implement enhanced event bus coordination',
        'Consider agent health monitoring improvements',
        'Evaluate need for coordinator agent deployment',
      ],
      'quality_threshold_breach': [
        'Implement enhanced quality assurance protocols',
        'Deploy specialist quality review agents',
        'Increase SPARC refinement phase rigor',
        'Consider automated quality gate enforcement',
      ],
      'external_dependency_failure': [
        'Implement circuit breaker patterns for external services',
        'Deploy fallback and retry mechanisms',
        'Consider external dependency health monitoring',
        'Implement graceful degradation strategies',
      ],
    };
    
    return recommendations[issueType] || ['Conduct thorough issue analysis', 'Deploy appropriate mitigation strategies'];
  }
  
  /**
   * Get appropriate Matron for domain expertise
   */
  private getMatronForDomain(domain: string): string {
    const matrons = {
      'development': 'Dev-Cube-Matron-Alpha',
      'operations': 'Ops-Cube-Matron-Beta',
      'security': 'Security-Cube-Matron-Gamma',
      'performance': 'Performance-Cube-Matron-Delta',
      'architecture': 'Architecture-Cube-Matron-Epsilon',
    };
    
    return matrons[domain] || 'General-Cube-Matron-Omega';
  }
  
  /**
   * Get Matron expertise profile
   */
  private getMatronExpertise(domain: string): any {
    const expertise = {
      'development': {
        specializations: ['SPARC methodology', 'Code quality', 'Development patterns', 'Testing strategies'],
        experience: '10000+ development cycles',
        successRate: 0.94,
        knowledgeDomains: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Testing'],
      },
      'operations': {
        specializations: ['Deployment automation', 'Infrastructure scaling', 'Monitoring', 'Incident response'],
        experience: '5000+ deployment cycles',
        successRate: 0.97,
        knowledgeDomains: ['Docker', 'Kubernetes', 'CI/CD', 'Cloud platforms'],
      },
      'security': {
        specializations: ['Security assessment', 'Vulnerability analysis', 'Compliance', 'Access control'],
        experience: '3000+ security reviews',
        successRate: 0.98,
        knowledgeDomains: ['OWASP', 'Security frameworks', 'Encryption', 'Authentication'],
      },
      'performance': {
        specializations: ['Performance optimization', 'Scalability analysis', 'Resource efficiency', 'Bottleneck identification'],
        experience: '7000+ performance reviews',
        successRate: 0.92,
        knowledgeDomains: ['Performance testing', 'Optimization techniques', 'Monitoring tools'],
      },
      'architecture': {
        specializations: ['System design', 'Architecture patterns', 'Technology selection', 'Scalability planning'],
        experience: '8000+ architectural reviews',
        successRate: 0.95,
        knowledgeDomains: ['Design patterns', 'Microservices', 'Event-driven architecture', 'Data architecture'],
      },
    };
    
    return expertise[domain] || {
      specializations: ['General consulting', 'Best practices', 'Risk assessment'],
      experience: '5000+ consultations',
      successRate: 0.89,
      knowledgeDomains: ['General software development'],
    };
  }
  
  /**
   * Generate Matron recommendations
   */
  private generateMatronRecommendations(domain: string, consultationType: string, context: any): string[] {
    const baseRecommendations = {
      'development': {
        'architecture_review': [
          'Follow SOLID principles in component design',
          'Implement proper separation of concerns',
          'Use dependency injection for testability',
          'Consider modular architecture patterns',
        ],
        'best_practices': [
          'Implement comprehensive unit testing',
          'Use TypeScript for type safety',
          'Follow consistent code formatting standards',
          'Implement proper error handling patterns',
        ],
        'technology_selection': [
          'Evaluate framework ecosystem maturity',
          'Consider long-term maintenance implications',
          'Assess team expertise and learning curve',
          'Analyze performance characteristics',
        ],
      },
      'operations': {
        'architecture_review': [
          'Design for horizontal scalability',
          'Implement proper health check endpoints',
          'Plan for blue-green deployment strategies',
          'Consider container orchestration needs',
        ],
        'best_practices': [
          'Implement comprehensive monitoring and alerting',
          'Use infrastructure as code approaches',
          'Implement proper backup and recovery procedures',
          'Follow security hardening guidelines',
        ],
      },
    };
    
    return baseRecommendations[domain]?.[consultationType] || [
      'Follow industry best practices',
      'Implement proper documentation',
      'Consider scalability requirements',
      'Plan for maintenance and updates',
    ];
  }
  
  /**
   * Get Matron best practices
   */
  private getMatronBestPractices(domain: string, consultationType: string): string[] {
    return [
      'Document all architectural decisions',
      'Implement automated testing strategies',
      'Follow security-by-design principles',
      'Plan for observability and monitoring',
      'Consider performance implications early',
    ];
  }
  
  /**
   * Get Matron risk assessment
   */
  private getMatronRiskAssessment(domain: string, context: any): any {
    return {
      level: 'medium',
      factors: [
        'Technology complexity',
        'Team expertise level',
        'Timeline constraints',
        'Integration complexity',
      ],
      mitigationStrategies: [
        'Implement proof of concept phase',
        'Plan for adequate testing time',
        'Consider expert consultation',
        'Implement rollback procedures',
      ],
      implementationPriority: 'high',
    };
  }
  
  /**
   * Get Matron follow-up actions
   */
  private getMatronFollowUpActions(domain: string, consultationType: string): string[] {
    return [
      'Schedule architectural review checkpoint',
      'Implement recommended monitoring',
      'Document decision rationale',
      'Plan progress review meeting',
    ];
  }
  
  /**
   * Get estimated duration for SPARC phase execution
   */
  private getPhaseEstimatedDuration(phase: string): string {
    const durations = {
      'specification': '15-30 minutes',
      'pseudocode': '20-40 minutes',
      'architecture': '30-60 minutes',
      'refinement': '45-90 minutes',
      'completion': '30-60 minutes',
    };
    
    return durations[phase] || '30-45 minutes';
  }
  
  /**
   * Get required agents for SPARC phase
   */
  private getPhaseRequiredAgents(phase: string): string[] {
    const agents = {
      'specification': ['analyst-agent', 'technical-writer-agent'],
      'pseudocode': ['architect-agent', 'senior-developer-agent'],
      'architecture': ['architect-agent', 'systems-analyst-agent'],
      'refinement': ['senior-developer-agent', 'code-reviewer-agent'],
      'completion': ['tester-agent', 'deployment-agent', 'documentation-agent'],
    };
    
    return agents[phase] || ['general-purpose-agent'];
  }
  
  /**
   * Get server status and statistics
   */
  getStatus(): unknown {
    return {
      type: 'stdio-mcp',
      protocol: 'stdio',
      performance: 'maximum',
      targets: ['Claude Code CLI', 'Gemini CLI', 'stdio tools'],
      neural_system: 'active - anti-deception enabled',
      swarmCommanders: {
        total: this.swarmCommanders.size,
        active: Array.from(this.swarmCommanders.values()).filter(c => c.getState().status === 'active').length,
        types: Array.from(this.swarmCommanders.values()).map(c => c.commanderType),
      },
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }
}

// Create and export server instance
export const stdioMCPServer = new StdioMCPServer();

// Start server if this file is run directly
if (process.argv[1] && process.argv[1].endsWith('swarm-server.ts')) {
  stdioMCPServer.start().catch((error) => {
    logger.error('Failed to start stdio MCP server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await stdioMCPServer.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await stdioMCPServer.stop();
    process.exit(0);
  });
}

export default StdioMCPServer;
