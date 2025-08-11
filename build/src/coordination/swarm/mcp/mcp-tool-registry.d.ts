/**
 * @file This module provides unified MCP Tools for Claude Code CLI Integration with comprehensive coordination and swarm functionality.
 *
 * This module implements a single stdio MCP server that provides ALL coordination and swarm functionality.
 *
 * - Coordination: Task orchestration, resource management, workflow execution.
 * - Swarm: Agent management, swarm coordination, performance monitoring.
 * - Combined: Intelligent task distribution, coordinated swarm execution.
 *
 * This replaces separate coordination/mcp and swarm/mcp servers with one unified server.
 */
import type { McpToolRegistryMap } from '../../../interfaces/mcp/mcp-types.ts';
interface ZenSwarm {
    initialize(): Promise<void>;
    createSwarm(options: {
        name: string;
        topology: string;
        maxAgents: number;
        strategy: string;
        enableCognitiveDiversity: boolean;
        enableNeuralAgents: boolean;
    }): Promise<Swarm>;
    getGlobalMetrics(): Promise<any>;
    getAllSwarms(): Promise<Swarm[]>;
    features: {
        forecasting: boolean;
        cognitive_diversity: boolean;
        neural_networks: boolean;
        simd_support: boolean;
    };
    wasmLoader: {
        loadModule(moduleName: string): Promise<any>;
        getTotalMemoryUsage(): number;
        getModuleStatus(): Record<string, {
            loaded?: boolean;
            size?: number;
        }>;
        modules: Map<string, any>;
    };
}
interface Swarm {
    id: string;
    name?: string;
    topology?: string;
    maxAgents?: number;
    strategy?: string;
    status?: string;
    agents: Map<string, Agent>;
    tasks: Map<string, Task>;
    getStatus(verbose: boolean): Promise<any>;
    spawn(options: {
        type: string;
        name: string;
        capabilities: string[];
        enableNeuralNetwork?: boolean;
    }, agentData?: any): Promise<Agent>;
    orchestrate(options: {
        description: string;
        priority?: string;
        maxAgents?: number;
        estimatedDuration?: number;
        requiredCapabilities?: string[];
    }): Promise<Task>;
}
interface Agent {
    id: string;
    name: string;
    type: string;
    status: string;
    cognitivePattern: string;
    capabilities: string[];
    neuralNetworkId?: string;
    swarmId?: string;
    createdAt?: string;
    neuralConfig?: object;
    getMetrics(): Promise<{
        memoryUsage: number;
    }>;
}
interface Task {
    id: string;
    description: string;
    status: string;
    priority: string;
    assignedAgents: string[];
    result: any;
    error: any;
    createdAt: string;
    completedAt: string;
    executionTime: number;
    swarmId: string;
    getStatus(): Promise<any>;
}
interface Notification {
    agentId?: string;
    type: string;
    timestamp: number;
}
interface TaskResults {
    task_id: string;
    task_description?: string;
    status?: string;
    priority?: string;
    swarm_id?: string;
    assigned_agents?: string[];
    created_at?: string;
    completed_at?: string;
    execution_time_ms?: number;
    execution_summary?: {
        status?: string;
        start_time?: string;
        end_time?: string;
        duration_ms?: number;
        success: boolean;
        error_message?: any;
        agents_involved: number;
        result_entries: number;
    };
    final_result?: any;
    error_details?: {
        message: any;
        timestamp?: string;
        recovery_suggestions: string[];
    } | null;
    agent_results?: Array<{
        agent_id?: string;
        agent_name?: string;
        agent_type?: string;
        output?: string;
        metrics: object;
        timestamp?: string;
        performance: {
            execution_time_ms: number;
            memory_usage_mb: number;
            success_rate: number;
        };
    }>;
    aggregated_performance?: {
        total_execution_time_ms: number;
        avg_execution_time_ms: number;
        total_memory_usage_mb: number;
        overall_success_rate: number;
        agent_count: number;
    };
}
import { AgentError, NeuralError, PersistenceError, ResourceError, SwarmError, TaskError, ValidationError, WasmError, ZenSwarmError } from './error-handler.ts';
/**
 * Enhanced MCP Tools with comprehensive error handling and logging.
 */
declare class EnhancedMCPTools {
    private ruvSwarm;
    private activeSwarms;
    private toolMetrics;
    private persistence;
    private persistenceReady;
    private errorContext;
    private errorLog;
    private maxErrorLogSize;
    private logger;
    private daaTools;
    tools: McpToolRegistryMap;
    constructor(ruvSwarmInstance?: ZenSwarm | null);
    /**
     * Initialize persistence layer asynchronously.
     */
    initializePersistence(): Promise<void>;
    /**
     * Ensure persistence is ready before operations.
     */
    ensurePersistenceReady(): Promise<boolean>;
    /**
     * Enhanced error handler with context and logging.
     *
     * @param error
     * @param toolName
     * @param operation
     * @param params
     */
    handleError(error: Error | ZenSwarmError | ValidationError | WasmError | ResourceError | PersistenceError | SwarmError | TaskError | AgentError | NeuralError, toolName: string, operation: string, params?: Record<string, any> | null): Error | ValidationError | AgentError | NeuralError | PersistenceError | ResourceError | SwarmError | TaskError | WasmError | ZenSwarmError;
    /**
     * Determine error severity based on type and message.
     *
     * @param error
     */
    determineSeverity(error: Error | ZenSwarmError | ValidationError | WasmError | ResourceError | PersistenceError | SwarmError | TaskError | AgentError | NeuralError): string;
    /**
     * Determine if error is recoverable.
     *
     * @param error
     */
    isRecoverable(error: Error | ZenSwarmError | ValidationError | WasmError | ResourceError | PersistenceError | SwarmError | TaskError | AgentError | NeuralError): boolean;
    /**
     * Validate and sanitize input parameters for a tool.
     *
     * @param params
     * @param toolName
     */
    validateToolParams(params: Record<string, any>, toolName: string): Record<string, any>;
    /**
     * Get recent error logs for debugging.
     *
     * @param limit
     */
    getErrorLogs(limit?: number): {
        timestamp: string;
        tool: string;
        operation: string;
        error: {
            name: string;
            message: string;
            code: any;
            stack: string | undefined;
        };
        context: object;
        suggestions: any;
        severity: string;
        recoverable: boolean;
    }[];
    /**
     * Get error statistics.
     */
    getErrorStats(): {
        total: number;
        bySeverity: {
            critical: number;
            high: number;
            medium: number;
            low: number;
        };
        byTool: {};
        recoverable: number;
        recentErrors: {
            timestamp: string;
            tool: string;
            operation: string;
            error: {
                name: string;
                message: string;
                code: any;
                stack: string | undefined;
            };
            context: object;
            suggestions: any;
            severity: string;
            recoverable: boolean;
        }[];
    };
    /**
     * 🔧 CRITICAL FIX: Integrate hook notifications with MCP memory system.
     *
     * @param hookInstance
     * @param hookInstance.sessionData
     * @param hookInstance.sessionData.notifications
     */
    integrateHookNotifications(hookInstance: {
        sessionData: {
            notifications: Notification[];
        };
    }): Promise<boolean>;
    /**
     * 🔧 CRITICAL FIX: Retrieve cross-agent notifications for coordinated decision making.
     *
     * @param agentId
     * @param type
     * @param since
     */
    getCrossAgentNotifications(agentId?: string | null, type?: string | null, since?: number | null): Promise<Array<Notification & {
        agentId: string;
        memoryKey: string;
    }>>;
    /**
     * Get list of active agent IDs from database.
     */
    getActiveAgentIds(): Promise<string[]>;
    initialize(ruvSwarmInstance?: null): Promise<ZenSwarm | null>;
    loadExistingSwarms(): Promise<void>;
    swarm_init(params: {
        topology: string;
        maxAgents: number;
        strategy: string;
        enableCognitiveDiversity: boolean;
        enableNeuralAgents: boolean;
        enableForecasting: boolean;
    }): Promise<{
        id: string;
        message: string;
        topology: any;
        strategy: any;
        maxAgents: any;
        features: {
            cognitive_diversity: any;
            neural_networks: any;
            forecasting: any;
            simd_support: boolean;
        };
        created: string;
        performance: {
            initialization_time_ms: number;
            memory_usage_mb: number;
        };
    }>;
    agent_spawn(params: {
        type: string;
        name: string;
        capabilities: string[];
        swarmId?: string;
    }): Promise<{
        agent: {
            id: string;
            name: string;
            type: string;
            cognitive_pattern: string;
            capabilities: string[];
            neural_network_id: string | undefined;
            status: string;
        };
        swarm_info: {
            id: string;
            agent_count: number;
            capacity: string;
        };
        message: string;
        performance: {
            spawn_time_ms: number;
            memory_overhead_mb: number;
        };
    }>;
    task_orchestrate(params: {
        task: string;
        priority?: string;
        strategy?: string;
        maxAgents?: number;
        swarmId?: string;
        requiredCapabilities?: string[];
        estimatedDuration?: number;
    }): Promise<{
        taskId: string;
        status: string;
        description: any;
        priority: any;
        strategy: any;
        assigned_agents: string[];
        swarm_info: {
            id: string;
            active_agents: number;
        };
        orchestration: {
            agent_selection_algorithm: string;
            load_balancing: boolean;
            cognitive_diversity_considered: boolean;
        };
        performance: {
            orchestration_time_ms: number;
            estimated_completion_ms: any;
        };
        message: string;
    }>;
    swarm_status(params: {
        verbose?: boolean;
        swarmId?: string;
    }): Promise<any>;
    task_status(params: {
        taskId?: string;
    }): Promise<any>;
    task_results(params: any): Promise<TaskResults | {
        task_id: string;
        status: string | undefined;
        execution_summary: {
            status?: string;
            start_time?: string;
            end_time?: string;
            duration_ms?: number;
            success: boolean;
            error_message?: any;
            agents_involved: number;
            result_entries: number;
        } | undefined;
        agent_count: number;
        completion_time: number | undefined;
        success: boolean;
        has_errors: boolean;
        result_available: boolean;
    } | {
        task_id: string;
        execution_metrics: {
            status?: string;
            start_time?: string;
            end_time?: string;
            duration_ms?: number;
            success: boolean;
            error_message?: any;
            agents_involved: number;
            result_entries: number;
        } | undefined;
        agent_performance: {};
        resource_utilization: {
            peak_memory_mb: number;
            cpu_time_ms: number;
            efficiency_score: number;
        };
    }>;
    generateRecoverySuggestions(errorMessage: string): string[];
    calculateEfficiencyScore(results: any): number;
    agent_list(params: {
        filter?: string;
        swarmId?: string;
    }): Promise<{
        total_agents: number;
        filter_applied: string;
        agents: {
            id: any;
            name: any;
            type: any;
            status: any;
            cognitive_pattern: any;
            capabilities: any;
            neural_network_id: any;
        }[];
    }>;
    benchmark_run(params: {
        type?: string;
        iterations?: number;
        includeNeuralBenchmarks?: boolean;
        includeSwarmBenchmarks?: boolean;
    }): Promise<{
        benchmark_type: string;
        iterations: number;
        results: any;
        environment: {
            features: {
                forecasting: boolean;
                cognitive_diversity: boolean;
                neural_networks: boolean;
                simd_support: boolean;
            } | undefined;
            memory_usage_mb: number;
            runtime_features: {
                node_version: string;
                platform: NodeJS.Platform;
                arch: NodeJS.Architecture;
                memory_limit: string;
            };
        };
        performance: {
            total_benchmark_time_ms: number;
        };
        summary: any[];
    }>;
    features_detect(params: {
        category?: string;
    }): Promise<{
        runtime: {
            node_version: string;
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            memory_limit: string;
        };
        wasm: {
            modules_loaded: Record<string, {
                loaded?: boolean;
                size?: number;
            }> | undefined;
            total_memory_mb: number;
            simd_support: boolean | undefined;
        };
        ruv_swarm: {
            forecasting: boolean;
            cognitive_diversity: boolean;
            neural_networks: boolean;
            simd_support: boolean;
        } | undefined;
        neural_networks: {
            available: boolean | undefined;
            activation_functions: number;
            training_algorithms: number;
            cascade_correlation: boolean | undefined;
        };
        forecasting: {
            available: boolean | undefined;
            models_available: number;
            ensemble_methods: boolean | undefined;
        };
        cognitive_diversity: {
            available: boolean | undefined;
            patterns_available: number;
            pattern_optimization: boolean | undefined;
        };
    }>;
    memory_usage(params: {
        detail?: string;
    }): Promise<{
        total_mb: number;
        wasm_mb: number;
        javascript_mb: number;
        available_mb: number;
    }>;
    neural_status(params: {
        agentId?: string;
    }): Promise<any>;
    neural_train(params: {
        agentId: string;
        iterations?: number;
        learningRate?: number;
        modelType?: string;
        trainingData?: any;
    }): Promise<{
        agent_id: string;
        neural_network_id: any;
        training_complete: boolean;
        iterations_completed: number;
        model_type: string;
        learning_rate: number;
        final_loss: number;
        final_accuracy: number;
        training_time_ms: number;
        improvements: {
            accuracy_gain: number;
            loss_reduction: number;
            convergence_rate: string;
        };
        training_history: any[];
        performance_metrics: {
            final_loss: number;
            final_accuracy: number;
            training_iterations: number;
            learning_rate: number;
            model_type: string;
            training_time_ms: number;
            last_trained: string;
        };
    }>;
    neural_patterns(params: any): Promise<any>;
    runWasmBenchmarks(iterations: any): Promise<any>;
    runNeuralBenchmarks(iterations: any): Promise<{
        network_creation: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            std_dev: number;
        };
        forward_pass: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            std_dev: number;
        };
        training_epoch: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            std_dev: number;
        };
    }>;
    runSwarmBenchmarks(iterations: any): Promise<{
        swarm_creation: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            note?: never;
        } | {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            note: string;
        } | {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            status: string;
        };
        agent_spawning: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            note?: never;
        } | {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            note: string;
        } | {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            status: string;
        };
        task_orchestration: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            note?: never;
        } | {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            note: string;
        } | {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
            status: string;
        };
    }>;
    runAgentBenchmarks(iterations: any): Promise<{
        cognitive_processing: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
        };
        capability_matching: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
        };
        status_updates: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
        };
    }>;
    runTaskBenchmarks(iterations: any): Promise<{
        task_distribution: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
        };
        result_aggregation: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
        };
        dependency_resolution: {
            avg_ms: number;
            min_ms: number;
            max_ms: number;
        };
    }>;
    generateBenchmarkSummary(benchmarks: any): any[];
    agent_metrics(params: any): Promise<{
        total_agents: number;
        metric_type: any;
        timestamp: string;
        agents: any[];
        summary: {
            avg_performance: number;
            total_neural_networks: any;
            active_agents: number;
        };
    }>;
    swarm_monitor(params: any): Promise<any>;
    recordToolMetrics(toolName: string, startTime: number, status: 'success' | 'error', error?: string | null): void;
    /**
     * Get connection pool health status.
     */
    pool_health(): Promise<Error | {
        healthy: boolean;
        message: string;
        timestamp: string;
        pool_status?: never;
        last_health_check?: never;
    } | {
        healthy: boolean;
        pool_status: {
            total_connections: any;
            active_connections: any;
            available_readers: any;
            available_workers: any;
            queue_lengths: {
                read_queue: any;
                write_queue: any;
                worker_queue: any;
            };
        };
        last_health_check: any;
        timestamp: string;
        message?: never;
    }>;
    /**
     * Get detailed connection pool statistics.
     */
    pool_stats(): Promise<Error | {
        error: string;
        timestamp: string;
        pool_metrics?: never;
        persistence_metrics?: never;
        health_status?: never;
    } | {
        pool_metrics: {
            total_reads: any;
            total_writes: any;
            total_worker_tasks: any;
            failed_connections: any;
            average_read_time: any;
            average_write_time: any;
            active_connections: any;
            available_readers: any;
            available_workers: any;
            queue_lengths: {
                read_queue: any;
                write_queue: any;
                worker_queue: any;
            };
        };
        persistence_metrics: {
            total_operations: number;
            total_errors: number;
            average_response_time: number;
            error_rate: string;
        };
        health_status: {
            healthy: boolean;
            last_check: any;
        };
        timestamp: string;
        error?: never;
    }>;
    /**
     * Get persistence layer statistics.
     */
    persistence_stats(): Promise<Error | {
        error: string;
        timestamp: string;
        persistence_layer?: never;
        connection_pool?: never;
        statistics?: never;
        pool_health?: never;
    } | {
        persistence_layer: string;
        connection_pool: string;
        statistics: {
            total_operations: number;
            total_errors: number;
            average_response_time_ms: number;
            error_rate_percent: string;
            success_rate_percent: string;
        };
        pool_health: {
            healthy: boolean;
            total_connections: any;
            active_connections: any;
            available_readers: any;
            available_workers: any;
        };
        timestamp: string;
        error?: never;
    }>;
    /**
     * Get all tool definitions (both core MCP and DAA tools).
     */
    getAllToolDefinitions(): {
        name: string;
        description: string;
    }[];
}
export { EnhancedMCPTools };
declare const enhancedMCPToolsInstance: EnhancedMCPTools;
export default enhancedMCPToolsInstance;
//# sourceMappingURL=mcp-tool-registry.d.ts.map