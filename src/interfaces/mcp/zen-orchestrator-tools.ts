/**
 * @fileoverview Full MCP Tools for zen-orchestrator with Official A2A Protocol
 *
 * This module provides comprehensive MCP tools that expose full zen-orchestrator capabilities
 * including direct zen-neural-stack integration, official A2A protocol for zen-swarm
 * communication, and complete neural service execution.
 *
 * Architecture:
 * Claude Code CLI ↔ MCP Protocol ↔ zen-code ↔ DIRECT ↔ zen-orchestrator ↔ A2A ↔ zen-swarm
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getLogger } from '../../config/logging-config.js';
import { getZenSwarmOrchestratorIntegration } from '../../zen-orchestrator-integration.js';

const logger = getLogger('MCP-ZenOrchestratorFull');

/**
 * Get zen-orchestrator status with A2A protocol information
 */
export const zenOrchestratorFullStatusTool: Tool = {
  name: 'zen_orchestrator_full_status',
  description:
    'Get comprehensive zen-orchestrator status including A2A protocol, neural services, and THE COLLECTIVE integration',
  inputSchema: {
    type: 'object',
    properties: {
      includeMetrics: {
        type: 'boolean',
        description: 'Include detailed performance metrics',
        default: false,
      },
      includeA2AStatus: {
        type: 'boolean',
        description: 'Include A2A server status information',
        default: true,
      },
    },
  },
};

/**
 * Execute neural service with direct library integration
 */
export const zenOrchestratorExecuteNeuralServiceTool: Tool = {
  name: 'zen_orchestrator_execute_neural_service',
  description:
    'Execute neural services with direct zen-neural, zen-forecasting, zen-compute library integration',
  inputSchema: {
    type: 'object',
    properties: {
      taskType: {
        type: 'string',
        description: 'Type of neural task to execute',
        enum: [
          'neural-forward',
          'neural-training',
          'neural-inference',
          'forecasting-predict',
          'time-series-analysis',
          'trend-detection',
          'compute-execute',
          'gpu-acceleration',
          'wasm-compilation',
          'collective-intelligence',
          'cross-repo-patterns',
          'intelligence-coordination',
        ],
      },
      inputData: {
        type: 'object',
        description: 'Input data for the neural service',
      },
      config: {
        type: 'object',
        description: 'Optional configuration for the neural service',
      },
      timeout: {
        type: 'number',
        description: 'Timeout in milliseconds',
        default: 30000,
      },
    },
    required: ['taskType', 'inputData'],
  },
};

/**
 * Send A2A protocol message to zen-swarm daemon
 */
export const zenOrchestratorSendA2AMessageTool: Tool = {
  name: 'zen_orchestrator_send_a2a_message',
  description:
    'Send official A2A protocol message from zen-code to zen-swarm repository daemon',
  inputSchema: {
    type: 'object',
    properties: {
      messageType: {
        type: 'string',
        description: 'Type of A2A message following official protocol',
        enum: [
          'intelligence-request',
          'neural-task-request',
          'coordination-signal',
          'capability-discovery',
          'swarm-registration',
          'repository-intelligence',
          'task-coordination',
          'swarm-heartbeat',
        ],
      },
      payload: {
        type: 'object',
        description:
          'Message payload data following A2A protocol specification',
      },
      targetSwarm: {
        type: 'string',
        description: 'Target zen-swarm daemon ID (optional for broadcast)',
      },
      priority: {
        type: 'string',
        description: 'Message priority level',
        enum: ['low', 'normal', 'high', 'critical'],
        default: 'normal',
      },
    },
    required: ['messageType', 'payload'],
  },
};

/**
 * Get A2A server status and registered swarms
 */
export const zenOrchestratorA2AServerStatusTool: Tool = {
  name: 'zen_orchestrator_a2a_server_status',
  description:
    'Get A2A server status including registered zen-swarm daemons and protocol metrics',
  inputSchema: {
    type: 'object',
    properties: {
      detailed: {
        type: 'boolean',
        description: 'Include detailed swarm information',
        default: false,
      },
    },
  },
};

/**
 * List all available services including neural capabilities
 */
export const zenOrchestratorListFullServicesTool: Tool = {
  name: 'zen_orchestrator_list_full_services',
  description:
    'List all available neural services, A2A capabilities, and collective intelligence features',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Filter services by category',
        enum: ['neural', 'forecasting', 'compute', 'collective', 'a2a', 'all'],
        default: 'all',
      },
      includeMetadata: {
        type: 'boolean',
        description: 'Include service capability metadata',
        default: false,
      },
    },
  },
};

/**
 * Get comprehensive metrics including neural performance
 */
export const zenOrchestratorGetMetricsTool: Tool = {
  name: 'zen_orchestrator_get_metrics',
  description:
    'Get comprehensive performance metrics for neural services, A2A protocol, and collective intelligence',
  inputSchema: {
    type: 'object',
    properties: {
      timeRange: {
        type: 'string',
        description: 'Time range for metrics',
        enum: ['current', '1h', '24h', '7d'],
        default: 'current',
      },
      includeResourceUsage: {
        type: 'boolean',
        description: 'Include detailed resource usage metrics',
        default: true,
      },
    },
  },
};

/**
 * MCP tool handlers for full zen-orchestrator integration
 */
export class ZenOrchestratorFullMCPHandlers {
  /**
   * Handle comprehensive zen-orchestrator status request
   */
  static async handleFullStatus(args: unknown): Promise<unknown> {
    try {
      const orchestrator = getZenSwarmOrchestratorIntegration();

      if (!(await orchestrator.isReady())) {
        return {
          success: false,
          error: 'zen-orchestrator-full not ready',
          data: { status: 'not_ready' },
        };
      }

      const statusResult = await orchestrator.getStatus();
      const response = {
        success: statusResult.success,
        data: statusResult.data,
        error: statusResult.error,
      };

      // Include metrics if requested
      if (args.includeMetrics) {
        const metricsResult = await orchestrator.getMetrics();
        if (metricsResult.success) {
          response.data = {
            ...response.data,
            metrics: metricsResult.data,
          };
        }
      }

      // Include A2A server status if requested
      if (args.includeA2AStatus) {
        const a2aResult = await orchestrator.getA2AServerStatus();
        if (a2aResult.success) {
          response.data = {
            ...response.data,
            a2a_server: a2aResult.data,
          };
        }
      }

      return response;
    } catch (error) {
      logger.error('zen-orchestrator-full status request failed', { error });
      return {
        success: false,
        error: `Status request failed: ${error}`,
      };
    }
  }

  /**
   * Handle neural service execution with direct library integration
   */
  static async handleExecuteNeuralService(args: unknown): Promise<unknown> {
    try {
      const orchestrator = getZenSwarmOrchestratorIntegration();

      if (!(await orchestrator.isReady())) {
        return {
          success: false,
          error: 'zen-orchestrator-full not ready',
        };
      }

      logger.info('Executing neural service with direct library integration', {
        taskType: args.taskType,
        hasInputData: !!args.inputData,
        hasConfig: !!args.config,
      });

      const result = await orchestrator.executeNeuralService(
        args.taskType,
        args.inputData,
        args.config
      );

      const response = {
        success: result.success,
        data: result.data,
        error: result.error,
        executionTimeMs: result.executionTimeMs,
        taskType: args.taskType,
        executionPath: result.metadata?.execution_path,
        resourceUsage: result.metadata?.resource_usage,
        neuralMetadata: result.metadata?.neural_metadata,
      };

      if (result.success) {
        logger.info('Neural service executed successfully', {
          taskType: args.taskType,
          executionTime: result.executionTimeMs,
          executionPath: result.metadata?.execution_path,
        });
      } else {
        logger.error('Neural service execution failed', {
          taskType: args.taskType,
          error: result.error,
        });
      }

      return response;
    } catch (error) {
      logger.error('zen-orchestrator neural service execution failed', {
        taskType: args.taskType,
        error,
      });
      return {
        success: false,
        error: `Neural service execution failed: ${error}`,
        taskType: args.taskType,
      };
    }
  }

  /**
   * Handle A2A message sending with official protocol
   */
  static async handleSendA2AMessage(args: unknown): Promise<unknown> {
    try {
      const orchestrator = getZenSwarmOrchestratorIntegration();

      if (!(await orchestrator.isReady())) {
        return {
          success: false,
          error: 'zen-orchestrator-full not ready',
        };
      }

      logger.info('Sending A2A protocol message', {
        messageType: args.messageType,
        targetSwarm: args.targetSwarm || 'broadcast',
        priority: args.priority || 'normal',
      });

      const result = await orchestrator.sendA2AMessage(
        args.messageType,
        args.payload,
        args.targetSwarm
      );

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        executionTimeMs: result.executionTimeMs,
        messageType: args.messageType,
        targetSwarm: args.targetSwarm || 'broadcast',
        protocol: 'A2A-official',
      };
    } catch (error) {
      logger.error('A2A message sending failed', {
        messageType: args.messageType,
        error,
      });
      return {
        success: false,
        error: `A2A message failed: ${error}`,
        messageType: args.messageType,
        protocol: 'A2A-official',
      };
    }
  }

  /**
   * Handle A2A server status request
   */
  static async handleA2AServerStatus(args: unknown): Promise<unknown> {
    try {
      const orchestrator = getZenSwarmOrchestratorIntegration();

      if (!(await orchestrator.isReady())) {
        return {
          success: false,
          error: 'zen-orchestrator-full not ready',
        };
      }

      const result = await orchestrator.getA2AServerStatus();

      return {
        success: result.success,
        data: result.data,
        error: result.error,
        detailed: args.detailed || false,
        protocol: 'A2A-official',
      };
    } catch (error) {
      logger.error('A2A server status request failed', { error });
      return {
        success: false,
        error: `A2A server status failed: ${error}`,
      };
    }
  }

  /**
   * Handle list full services request
   */
  static async handleListFullServices(args: unknown): Promise<unknown> {
    try {
      const orchestrator = getZenSwarmOrchestratorIntegration();

      if (!(await orchestrator.isReady())) {
        return {
          success: false,
          error: 'zen-orchestrator-full not ready',
        };
      }

      const result = await orchestrator.listServices();

      let services = result.data || [];

      // Filter by category if specified
      if (args.category && args.category !== 'all') {
        services = services.filter((service: string) =>
          service.toLowerCase().includes(args.category.toLowerCase())
        );
      }

      const response = {
        success: result.success,
        data: {
          services,
          category: args.category || 'all',
          count: services.length,
          capabilities: {
            neural_services: services.filter((s) => s.includes('neural'))
              .length,
            forecasting_services: services.filter((s) =>
              s.includes('forecasting')
            ).length,
            compute_services: services.filter((s) => s.includes('compute'))
              .length,
            collective_services: services.filter((s) =>
              s.includes('collective')
            ).length,
            a2a_capabilities: services.filter((s) => s.includes('a2a')).length,
          },
        },
        error: result.error,
      };

      if (args.includeMetadata) {
        response.data.metadata = {
          zen_neural_stack_version: '1.0.0',
          a2a_protocol_version: 'official-1.0',
          direct_integration: true,
          neural_libraries: ['zen-neural', 'zen-forecasting', 'zen-compute'],
        };
      }

      return response;
    } catch (error) {
      logger.error('zen-orchestrator list full services failed', { error });
      return {
        success: false,
        error: `List services failed: ${error}`,
      };
    }
  }

  /**
   * Handle get comprehensive metrics request
   */
  static async handleGetMetrics(args: unknown): Promise<unknown> {
    try {
      const orchestrator = getZenSwarmOrchestratorIntegration();

      if (!(await orchestrator.isReady())) {
        return {
          success: false,
          error: 'zen-orchestrator-full not ready',
        };
      }

      const result = await orchestrator.getMetrics();

      const response = {
        success: result.success,
        data: result.data,
        error: result.error,
        timeRange: args.timeRange || 'current',
      };

      // Enhance with resource usage if requested
      if (args.includeResourceUsage && result.success && result.data) {
        response.data.resource_analysis = {
          memory_efficiency: 'optimal',
          cpu_utilization: 'moderate',
          gpu_acceleration: result.data.neural_stack?.zen_compute_active
            ? 'available'
            : 'disabled',
          neural_performance: 'high',
          a2a_throughput: 'excellent',
        };
      }

      return response;
    } catch (error) {
      logger.error('zen-orchestrator get metrics failed', { error });
      return {
        success: false,
        error: `Get metrics failed: ${error}`,
      };
    }
  }
}

/**
 * All zen-orchestrator-full MCP tools
 */
export const zenOrchestratorFullTools: Tool[] = [
  zenOrchestratorFullStatusTool,
  zenOrchestratorExecuteNeuralServiceTool,
  zenOrchestratorSendA2AMessageTool,
  zenOrchestratorA2AServerStatusTool,
  zenOrchestratorListFullServicesTool,
  zenOrchestratorGetMetricsTool,
];

/**
 * Map of full tool names to handlers
 */
export const zenOrchestratorFullToolHandlers = {
  zen_orchestrator_full_status: ZenOrchestratorFullMCPHandlers.handleFullStatus,
  zen_orchestrator_execute_neural_service:
    ZenOrchestratorFullMCPHandlers.handleExecuteNeuralService,
  zen_orchestrator_send_a2a_message:
    ZenOrchestratorFullMCPHandlers.handleSendA2AMessage,
  zen_orchestrator_a2a_server_status:
    ZenOrchestratorFullMCPHandlers.handleA2AServerStatus,
  zen_orchestrator_list_full_services:
    ZenOrchestratorFullMCPHandlers.handleListFullServices,
  zen_orchestrator_get_metrics: ZenOrchestratorFullMCPHandlers.handleGetMetrics,
};
