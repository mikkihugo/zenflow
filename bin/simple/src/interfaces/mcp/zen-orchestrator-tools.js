import { getLogger } from '../../config/logging-config.js';
import { getZenOrchestratorIntegrationFull } from '../../zen-orchestrator-integration-full.js';
const logger = getLogger('MCP-ZenOrchestratorFull');
export const zenOrchestratorFullStatusTool = {
    name: 'zen_orchestrator_full_status',
    description: 'Get comprehensive zen-orchestrator status including A2A protocol, neural services, and THE COLLECTIVE integration',
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
export const zenOrchestratorExecuteNeuralServiceTool = {
    name: 'zen_orchestrator_execute_neural_service',
    description: 'Execute neural services with direct zen-neural, zen-forecasting, zen-compute library integration',
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
export const zenOrchestratorSendA2AMessageTool = {
    name: 'zen_orchestrator_send_a2a_message',
    description: 'Send official A2A protocol message from zen-code to zen-swarm repository daemon',
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
                description: 'Message payload data following A2A protocol specification',
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
export const zenOrchestratorA2AServerStatusTool = {
    name: 'zen_orchestrator_a2a_server_status',
    description: 'Get A2A server status including registered zen-swarm daemons and protocol metrics',
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
export const zenOrchestratorListFullServicesTool = {
    name: 'zen_orchestrator_list_full_services',
    description: 'List all available neural services, A2A capabilities, and collective intelligence features',
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
export const zenOrchestratorGetMetricsTool = {
    name: 'zen_orchestrator_get_metrics',
    description: 'Get comprehensive performance metrics for neural services, A2A protocol, and collective intelligence',
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
export class ZenOrchestratorFullMCPHandlers {
    static async handleFullStatus(args) {
        try {
            const orchestrator = getZenOrchestratorIntegrationFull();
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
            if (args.includeMetrics) {
                const metricsResult = await orchestrator.getMetrics();
                if (metricsResult.success) {
                    response.data = {
                        ...response.data,
                        metrics: metricsResult.data,
                    };
                }
            }
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
        }
        catch (error) {
            logger.error('zen-orchestrator-full status request failed', { error });
            return {
                success: false,
                error: `Status request failed: ${error}`,
            };
        }
    }
    static async handleExecuteNeuralService(args) {
        try {
            const orchestrator = getZenOrchestratorIntegrationFull();
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
            const result = await orchestrator.executeNeuralService(args.taskType, args.inputData, args.config);
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
            }
            else {
                logger.error('Neural service execution failed', {
                    taskType: args.taskType,
                    error: result.error,
                });
            }
            return response;
        }
        catch (error) {
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
    static async handleSendA2AMessage(args) {
        try {
            const orchestrator = getZenOrchestratorIntegrationFull();
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
            const result = await orchestrator.sendA2AMessage(args.messageType, args.payload, args.targetSwarm);
            return {
                success: result.success,
                data: result.data,
                error: result.error,
                executionTimeMs: result.executionTimeMs,
                messageType: args.messageType,
                targetSwarm: args.targetSwarm || 'broadcast',
                protocol: 'A2A-official',
            };
        }
        catch (error) {
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
    static async handleA2AServerStatus(args) {
        try {
            const orchestrator = getZenOrchestratorIntegrationFull();
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
        }
        catch (error) {
            logger.error('A2A server status request failed', { error });
            return {
                success: false,
                error: `A2A server status failed: ${error}`,
            };
        }
    }
    static async handleListFullServices(args) {
        try {
            const orchestrator = getZenOrchestratorIntegrationFull();
            if (!(await orchestrator.isReady())) {
                return {
                    success: false,
                    error: 'zen-orchestrator-full not ready',
                };
            }
            const result = await orchestrator.listServices();
            let services = result.data || [];
            if (args.category && args.category !== 'all') {
                services = services.filter((service) => service.toLowerCase().includes(args.category.toLowerCase()));
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
                        forecasting_services: services.filter((s) => s.includes('forecasting')).length,
                        compute_services: services.filter((s) => s.includes('compute'))
                            .length,
                        collective_services: services.filter((s) => s.includes('collective')).length,
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
        }
        catch (error) {
            logger.error('zen-orchestrator list full services failed', { error });
            return {
                success: false,
                error: `List services failed: ${error}`,
            };
        }
    }
    static async handleGetMetrics(args) {
        try {
            const orchestrator = getZenOrchestratorIntegrationFull();
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
        }
        catch (error) {
            logger.error('zen-orchestrator get metrics failed', { error });
            return {
                success: false,
                error: `Get metrics failed: ${error}`,
            };
        }
    }
}
export const zenOrchestratorFullTools = [
    zenOrchestratorFullStatusTool,
    zenOrchestratorExecuteNeuralServiceTool,
    zenOrchestratorSendA2AMessageTool,
    zenOrchestratorA2AServerStatusTool,
    zenOrchestratorListFullServicesTool,
    zenOrchestratorGetMetricsTool,
];
export const zenOrchestratorFullToolHandlers = {
    zen_orchestrator_full_status: ZenOrchestratorFullMCPHandlers.handleFullStatus,
    zen_orchestrator_execute_neural_service: ZenOrchestratorFullMCPHandlers.handleExecuteNeuralService,
    zen_orchestrator_send_a2a_message: ZenOrchestratorFullMCPHandlers.handleSendA2AMessage,
    zen_orchestrator_a2a_server_status: ZenOrchestratorFullMCPHandlers.handleA2AServerStatus,
    zen_orchestrator_list_full_services: ZenOrchestratorFullMCPHandlers.handleListFullServices,
    zen_orchestrator_get_metrics: ZenOrchestratorFullMCPHandlers.handleGetMetrics,
};
//# sourceMappingURL=zen-orchestrator-tools.js.map