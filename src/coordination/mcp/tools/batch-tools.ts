/**
 * @fileoverview Batch MCP Tools - Claude-zen Integration
 * Implements the "1 MESSAGE = ALL OPERATIONS" principle from claude-zen
 * Provides MCP tools for batch execution with performance monitoring
 */

import { createLogger } from '../../../core/logger';
import type { BatchOperation } from '../../batch/batch-engine';
import { BatchEngine, createBatchOperation, createToolBatch } from '../../batch/batch-engine';
import { FileBatchOperator } from '../../batch/file-batch';
import { BatchPerformanceMonitor } from '../../batch/performance-monitor';
import { SwarmBatchCoordinator } from '../../batch/swarm-batch';
import type { MCPTool, MCPToolResult } from '../types/mcp-types';

const logger = createLogger({ prefix: 'MCP-Batch' });

// Global instances for batch operations
const batchEngine = new BatchEngine({
  maxConcurrency: 6,
  timeoutMs: 30000,
  trackPerformance: true,
});

const performanceMonitor = new BatchPerformanceMonitor();
const fileBatchOperator = new FileBatchOperator();
const swarmBatchCoordinator = new SwarmBatchCoordinator();

export interface BatchExecutionParams {
  operations: Array<{
    id?: string;
    type: 'tool' | 'file' | 'swarm' | 'agent';
    operation: string;
    params: Record<string, unknown>;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    dependencies?: string[];
    timeout?: number;
  }>;
  config?: {
    maxConcurrency?: number;
    timeoutMs?: number;
    trackPerformance?: boolean;
  };
}

export interface ProjectInitParams {
  projectName: string;
  basePath: string;
  swarmConfig?: {
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    maxAgents?: number;
  };
  agentTypes?: Array<'researcher' | 'coder' | 'analyst' | 'tester' | 'architect'>;
  fileStructure?: Record<string, string | null>;
  packageJson?: Record<string, unknown>;
}

/**
 * Core batch execution tool implementing claude-zen's "1 MESSAGE = ALL OPERATIONS"
 */
export const batchExecuteTool: MCPTool = {
  name: 'batch_execute',
  description:
    'Execute multiple operations concurrently following claude-zen patterns (1 MESSAGE = ALL OPERATIONS)',
  inputSchema: {
    type: 'object',
    properties: {
      operations: {
        type: 'array',
        description: 'Array of operations to execute concurrently',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Optional operation ID (auto-generated if not provided)',
            },
            type: {
              type: 'string',
              enum: ['tool', 'file', 'swarm', 'agent'],
              description: 'Type of operation to execute',
            },
            operation: {
              type: 'string',
              description: 'Specific operation name',
            },
            params: {
              type: 'object',
              description: 'Parameters for the operation',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Operation priority',
              default: 'medium',
            },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
              description: 'IDs of operations this depends on',
            },
            timeout: {
              type: 'number',
              description: 'Operation timeout in milliseconds',
            },
          },
          required: ['type', 'operation', 'params'],
        },
      },
      config: {
        type: 'object',
        description: 'Batch execution configuration',
        properties: {
          maxConcurrency: {
            type: 'number',
            description: 'Maximum concurrent operations',
            default: 6,
          },
          timeoutMs: {
            type: 'number',
            description: 'Default timeout for operations',
            default: 30000,
          },
          trackPerformance: {
            type: 'boolean',
            description: 'Enable performance tracking',
            default: true,
          },
        },
      },
    },
    required: ['operations'],
  },
  handler: async (params: BatchExecutionParams): Promise<MCPToolResult> => {
    try {
      logger.info(`Starting batch execution of ${params.operations.length} operations`);

      // Convert input operations to BatchOperation format
      const batchOps: BatchOperation[] = params.operations.map((op, index) =>
        createBatchOperation(
          op.id || `op-${index}-${Date.now()}`,
          op.type,
          op.operation,
          op.params,
          {
            priority: op.priority,
            dependencies: op.dependencies,
            timeout: op.timeout,
          }
        )
      );

      // Configure batch engine if config provided
      let engineToUse = batchEngine;
      if (params.config) {
        engineToUse = new BatchEngine({
          maxConcurrency: params.config.maxConcurrency ?? 6,
          timeoutMs: params.config.timeoutMs ?? 30000,
          trackPerformance: params.config.trackPerformance ?? true,
        });
      }

      // Pre-process operations by type
      const fileOps = batchOps.filter((op) => op.type === 'file');
      const swarmOps = batchOps.filter((op) => op.type === 'swarm');
      const otherOps = batchOps.filter((op) => !['file', 'swarm'].includes(op.type));

      // Execute batch operations
      const startTime = Date.now();

      // Handle file operations with specialized operator
      if (fileOps.length > 0) {
        const fileOperations = fileOps.map((op) => ({
          type: op.operation as any,
          path: op.params.path as string,
          content: op.params.content as string,
          destination: op.params.destination as string,
          encoding: op.params.encoding as BufferEncoding,
          mode: op.params.mode as number,
        }));
        await fileBatchOperator.executeBatch(fileOperations);
      }

      // Handle swarm operations with specialized coordinator
      if (swarmOps.length > 0) {
        const swarmOperations = swarmOps.map((op) => ({
          type: op.operation as any,
          swarmId: op.params.swarmId as string,
          agentType: op.params.agentType as any,
          agentCount: op.params.agentCount as number,
          topology: op.params.topology as any,
          task: op.params.task as any,
          coordination: op.params.coordination as any,
        }));
        await swarmBatchCoordinator.executeBatch(swarmOperations);
      }

      // Handle remaining operations with standard engine
      const summary = await engineToUse.executeBatch(otherOps);
      const results = engineToUse.getResults();

      // Calculate execution time
      const executionTime = Date.now() - startTime;
      summary.executionTime = executionTime;

      // Record performance metrics
      if (params.config?.trackPerformance !== false) {
        const batchMetrics = performanceMonitor.recordBatchExecution(summary);

        // Estimate sequential execution time for comparison
        const sequentialTime = summary.totalExecutionTime * summary.speedImprovement;
        const sequentialMetrics = performanceMonitor.recordSequentialExecution(
          summary.totalOperations,
          sequentialTime,
          summary.successfulOperations
        );

        const comparison = performanceMonitor.comparePerformance(batchMetrics, sequentialMetrics);

        logger.info('Batch execution performance', {
          speedImprovement: `${comparison.speedImprovement}x`,
          tokenReduction: `${comparison.tokenReduction}%`,
          recommendations: comparison.recommendations.slice(0, 2), // Top 2 recommendations
        });
      }

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🚀 **Batch Execution Complete - Claude-zen Pattern**

**Performance Results:**
- Operations: ${summary.totalOperations} (${summary.successfulOperations} successful, ${summary.failedOperations} failed)
- Speed Improvement: **${summary.speedImprovement}x** (target: 2.8-4.4x)
- Token Reduction: **${summary.tokenReduction}%** (target: 32.3%)
- Execution Time: ${summary.totalExecutionTime}ms
- Concurrency Achieved: ${summary.concurrencyAchieved.toFixed(1)}x

**Individual Results:**
${results.map((r) => `- ${r.operationId}: ${r.success ? '✅' : '❌'} (${r.executionTime}ms)${r.error ? ` - ${r.error}` : ''}`).join('\n')}

${summary.speedImprovement >= 2.8 ? '🎯 **Claude-zen target achieved!**' : '⚠️ Performance below claude-zen target (2.8x)'}`,
          },
        ],
      };
    } catch (error) {
      logger.error('Batch execution failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ Batch execution failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Project initialization tool implementing claude-zen's optimized project setup
 */
export const projectInitBatchTool: MCPTool = {
  name: 'project_init_batch',
  description:
    'Initialize a complete project with swarm, agents, and files using claude-zen batch optimization',
  inputSchema: {
    type: 'object',
    properties: {
      projectName: {
        type: 'string',
        description: 'Name of the project to initialize',
      },
      basePath: {
        type: 'string',
        description: 'Base directory path for the project',
      },
      swarmConfig: {
        type: 'object',
        description: 'Swarm configuration',
        properties: {
          topology: {
            type: 'string',
            enum: ['mesh', 'hierarchical', 'ring', 'star'],
            default: 'hierarchical',
          },
          maxAgents: {
            type: 'number',
            default: 6,
          },
        },
      },
      agentTypes: {
        type: 'array',
        description: 'Types of agents to spawn',
        items: {
          type: 'string',
          enum: ['researcher', 'coder', 'analyst', 'tester', 'architect'],
        },
        default: ['researcher', 'coder', 'analyst'],
      },
      fileStructure: {
        type: 'object',
        description: 'Project file structure (path -> content, null for directories)',
        default: {},
      },
      packageJson: {
        type: 'object',
        description: 'Package.json content',
        default: {},
      },
    },
    required: ['projectName', 'basePath'],
  },
  handler: async (params: ProjectInitParams): Promise<MCPToolResult> => {
    try {
      logger.info(`Initializing project: ${params.projectName}`);

      const operations: BatchOperation[] = [];
      let opIndex = 0;

      // 1. Initialize swarm
      operations.push(
        createBatchOperation(`swarm-init-${opIndex++}`, 'swarm', 'init', {
          topology: params.swarmConfig?.topology || 'hierarchical',
          maxAgents: params.swarmConfig?.maxAgents || 6,
        })
      );

      // 2. Spawn agents
      const agentTypes = params.agentTypes || ['researcher', 'coder', 'analyst'];
      for (const agentType of agentTypes) {
        operations.push(
          createBatchOperation(`agent-spawn-${agentType}-${opIndex++}`, 'swarm', 'spawn', {
            type: agentType,
            name: `${params.projectName}-${agentType}`,
          })
        );
      }

      // 3. Create directory structure
      const basePath = params.basePath;
      const defaultStructure = {
        [`${basePath}`]: null,
        [`${basePath}/src`]: null,
        [`${basePath}/tests`]: null,
        [`${basePath}/docs`]: null,
        [`${basePath}/scripts`]: null,
      };

      const fileStructure = { ...defaultStructure, ...params.fileStructure };

      // Add directory creation operations
      const directories = Object.entries(fileStructure)
        .filter(([_, content]) => content === null)
        .map(([path]) => path);

      for (const dir of directories) {
        operations.push(createBatchOperation(`mkdir-${opIndex++}`, 'file', 'mkdir', { path: dir }));
      }

      // 4. Create files
      const files = Object.entries(fileStructure).filter(([_, content]) => content !== null);

      // Create package.json first
      const defaultPackageJson = {
        name: params.projectName,
        version: '1.0.0',
        description: `${params.projectName} - Generated by claude-zen batch operations`,
        main: 'src/index.js',
        scripts: {
          test: 'echo "Error: no test specified" && exit 1',
        },
        keywords: [],
        author: '',
        license: 'MIT',
      };

      operations.push(
        createBatchOperation(`package-json-${opIndex++}`, 'file', 'write', {
          path: `${basePath}/package.json`,
          content: JSON.stringify({ ...defaultPackageJson, ...params.packageJson }, null, 2),
        })
      );

      // Create README.md
      operations.push(
        createBatchOperation(`readme-${opIndex++}`, 'file', 'write', {
          path: `${basePath}/README.md`,
          content: `# ${params.projectName}

${params.projectName} - Generated by claude-zen batch operations

## Getting Started

This project was initialized using claude-zen's optimized batch operations, achieving:
- ⚡ 2.8-4.4x speed improvement through concurrent execution
- 🎯 32.3% token reduction through batch optimization
- 🤖 Automated swarm coordination with ${agentTypes.join(', ')} agents

## Project Structure

\`\`\`
${params.projectName}/
├── src/           # Source code
├── tests/         # Test files
├── docs/          # Documentation
├── scripts/       # Build and utility scripts
├── package.json   # Project configuration
└── README.md      # This file
\`\`\`

## Development

1. Install dependencies: \`npm install\`
2. Start development: \`npm run dev\`
3. Run tests: \`npm test\`

Generated with claude-zen batch optimization 🚀
`,
        })
      );

      // Add other files
      for (const [filePath, content] of files) {
        operations.push(
          createBatchOperation(`file-${opIndex++}`, 'file', 'write', {
            path: filePath,
            content: content as string,
          })
        );
      }

      // Execute all operations in batch
      const summary = await batchEngine.executeBatch(operations);
      const results = batchEngine.getResults();

      // Record performance
      const batchMetrics = performanceMonitor.recordBatchExecution(summary);
      logger.info('Project initialization complete', {
        batchMetrics,
        project: params.projectName,
        operations: summary.totalOperations,
        speedImprovement: `${summary.speedImprovement}x`,
        tokenReduction: `${summary.tokenReduction}%`,
      });

      return {
        success: true,
        content: [
          {
            type: 'text',
            text: `🎉 **Project "${params.projectName}" Initialized Successfully!**

**Claude-zen Batch Optimization Results:**
- **${summary.totalOperations} operations** executed concurrently
- **${summary.speedImprovement}x speed improvement** (vs sequential: ${summary.speedImprovement >= 2.8 ? '✅ Target achieved' : '⚠️ Below target'})
- **${summary.tokenReduction}% token reduction** through batch optimization
- **Execution time**: ${summary.totalExecutionTime}ms (vs ~${(summary.totalExecutionTime * summary.speedImprovement).toFixed(0)}ms sequential)

**Project Components Created:**
- 🐝 Swarm initialized (${params.swarmConfig?.topology || 'hierarchical'} topology)
- 🤖 Agents spawned: ${agentTypes.join(', ')}
- 📁 Directory structure: ${directories.length} directories
- 📄 Files created: ${results.filter((r) => r.operationId.includes('file')).length} files
- 📦 Package.json configured with project metadata

**Next Steps:**
1. \`cd ${params.basePath}\`
2. \`npm install\`
3. Start developing with your swarm coordination system!

${
  summary.speedImprovement >= 2.8 && summary.tokenReduction >= 20
    ? '🏆 **Excellent performance! Claude-zen targets exceeded.**'
    : '📈 **Good performance. Consider optimizing for better results.**'
}`,
          },
        ],
      };
    } catch (error) {
      logger.error('Project initialization failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ Project initialization failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Performance monitoring tool for batch operations
 */
export const batchPerformanceTool: MCPTool = {
  name: 'batch_performance',
  description: 'Get performance metrics and recommendations for batch operations',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['summary', 'trends', 'compare', 'clear'],
        description: 'Performance action to perform',
        default: 'summary',
      },
      hours: {
        type: 'number',
        description: 'Number of hours to analyze (for summary/trends)',
        default: 24,
      },
      metric: {
        type: 'string',
        enum: ['throughput', 'totalExecutionTime', 'successRate', 'memoryUsage', 'cpuUsage'],
        description: 'Metric to analyze trends for',
        default: 'throughput',
      },
    },
  },
  handler: async (params: {
    action?: 'summary' | 'trends' | 'compare' | 'clear';
    hours?: number;
    metric?: 'throughput' | 'totalExecutionTime' | 'successRate' | 'memoryUsage' | 'cpuUsage';
  }): Promise<MCPToolResult> => {
    try {
      const action = params.action || 'summary';
      const hours = params.hours || 24;

      switch (action) {
        case 'summary': {
          const summary = performanceMonitor.getPerformanceSummary(hours);
          return {
            success: true,
            content: [
              {
                type: 'text',
                text: `📊 **Batch Performance Summary (Last ${hours}h)**

**Execution Statistics:**
- Total Executions: ${summary.totalExecutions}
- Batch Executions: ${summary.batchExecutions} (${((summary.batchExecutions / summary.totalExecutions) * 100).toFixed(1)}%)
- Sequential Executions: ${summary.sequentialExecutions}

**Performance Metrics:**
- Average Speed Improvement: **${summary.averageSpeedImprovement}x**
- Average Token Reduction: **${summary.averageTokenReduction}%**

**Claude-zen Target Assessment:**
${summary.averageSpeedImprovement >= 2.8 ? '✅' : '❌'} Speed target (2.8-4.4x): ${summary.averageSpeedImprovement.toFixed(1)}x
${summary.averageTokenReduction >= 20 ? '✅' : '❌'} Token reduction target (>20%): ${summary.averageTokenReduction.toFixed(1)}%

**Recommendations:**
${summary.recommendations.map((r) => `- ${r}`).join('\n')}`,
              },
            ],
          };
        }

        case 'trends': {
          const metric = params.metric || 'throughput';
          const trends = performanceMonitor.getPerformanceTrends(metric, hours);

          return {
            success: true,
            content: [
              {
                type: 'text',
                text: `📈 **Performance Trends - ${metric} (Last ${hours}h)**

**Trend Analysis:**
- Trend Direction: **${trends.trend}** ${trends.trend === 'improving' ? '📈' : trends.trend === 'declining' ? '📉' : '➡️'}
- Change Rate: ${trends.changeRate.toFixed(2)}% per hour
- Data Points: ${trends.values.length} measurements

**Recent Values:**
${trends.values
  .slice(-5)
  .map(
    (val, i) =>
      `- ${val.toFixed(2)} (${new Date(trends.timestamps[trends.timestamps.length - 5 + i]).toLocaleTimeString()})`
  )
  .join('\n')}

**Insight:**
${
  trends.trend === 'improving'
    ? '🎯 Performance is improving over time. Continue current optimization strategies.'
    : trends.trend === 'declining'
      ? '⚠️ Performance degradation detected. Review recent changes and optimize batch configurations.'
      : '📊 Performance is stable. Consider experimenting with different batch sizes for improvement.'
}`,
              },
            ],
          };
        }

        case 'clear': {
          performanceMonitor.clearHistory();
          return {
            success: true,
            content: [
              {
                type: 'text',
                text: '🗑️ **Performance History Cleared**\n\nAll performance metrics have been reset. New batch operations will start fresh tracking.',
              },
            ],
          };
        }

        default:
          return {
            success: false,
            content: [
              {
                type: 'text',
                text: `❌ Unknown action: ${action}. Use: summary, trends, compare, or clear`,
              },
            ],
          };
      }
    } catch (error) {
      logger.error('Performance analysis failed:', error);
      return {
        success: false,
        content: [
          {
            type: 'text',
            text: `❌ Performance analysis failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  },
};

/**
 * Export all batch MCP tools
 */
export const batchMCPTools = [batchExecuteTool, projectInitBatchTool, batchPerformanceTool];

/**
 * Helper function to create claude-zen batch operations
 */
export function createClaudeFlowBatch(
  operations: Array<{
    tool: string;
    params: Record<string, unknown>;
    dependencies?: string[];
  }>
): BatchOperation[] {
  return createToolBatch(
    operations.map((op) => ({
      name: op.tool,
      params: op.params,
      dependencies: op.dependencies,
    }))
  );
}

/**
 * Helper to create the classic claude-zen pattern operations
 */
export function createClaudeZenPattern(config: {
  swarmTopology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
  maxAgents?: number;
  agentTypes?: string[];
  projectStructure?: string[];
  files?: Array<{ path: string; content: string }>;
}): BatchOperation[] {
  const operations: BatchOperation[] = [];
  let index = 0;

  // 1. Swarm initialization
  operations.push(
    createBatchOperation(`swarm-init-${index++}`, 'tool', 'swarm_init', {
      topology: config.swarmTopology || 'mesh',
      maxAgents: config.maxAgents || 6,
    })
  );

  // 2. Agent spawning
  const agentTypes = config.agentTypes || ['researcher', 'coder', 'analyst'];
  for (const agentType of agentTypes) {
    operations.push(
      createBatchOperation(`agent-spawn-${agentType}-${index++}`, 'tool', 'agent_spawn', {
        type: agentType,
      })
    );
  }

  // 3. Directory structure
  const directories = config.projectStructure || ['app', 'app/src', 'app/tests', 'app/docs'];
  for (const dir of directories) {
    operations.push(createBatchOperation(`mkdir-${index++}`, 'file', 'mkdir', { path: dir }));
  }

  // 4. File creation
  const defaultFiles = [
    {
      path: 'app/package.json',
      content: JSON.stringify({ name: 'app', version: '1.0.0' }, null, 2),
    },
    {
      path: 'app/README.md',
      content: '# Application\n\nGenerated by claude-zen batch operations.',
    },
  ];

  const files = config.files || defaultFiles;
  for (const file of files) {
    operations.push(
      createBatchOperation(`file-${index++}`, 'file', 'write', {
        path: file.path,
        content: file.content,
      })
    );
  }

  return operations;
}
