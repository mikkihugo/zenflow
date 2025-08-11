/**
 * DAA (Decentralized Autonomous Agents) MCP Tools.
 * Exposes DAA capabilities through the MCP interface.
 */
/**
 * @file Coordination system: mcp-daa-tools.
 */
export declare class DAA_MCPTools {
    private mcpTools;
    private daaInitialized;
    constructor(enhancedMcpTools: any);
    ensureInitialized(): Promise<void>;
    /**
     * DAA MCP Tool: daa_init.
     * Initialize the DAA service with autonomous agent capabilities.
     *
     * @param params
     */
    daa_init(params: any): Promise<{
        success: boolean;
        initialized: boolean;
        features: {
            autonomousLearning: any;
            peerCoordination: any;
            persistenceMode: any;
            neuralIntegration: boolean;
            cognitivePatterns: number;
        };
        capabilities: Promise<any>;
        timestamp: string;
    }>;
    /**
     * DAA MCP Tool: daa_agent_create.
     * Create an autonomous agent with DAA capabilities.
     *
     * @param params
     */
    daa_agent_create(params: any): Promise<{
        agent: {
            id: any;
            cognitive_pattern: any;
            capabilities: unknown[];
            status: string;
            created_at: string;
        };
        swarm_id: string | null;
        learning_enabled: boolean;
        memory_enabled: any;
    }>;
    /**
     * DAA MCP Tool: daa_agent_adapt.
     * Trigger agent adaptation based on feedback.
     *
     * @param params
     */
    daa_agent_adapt(params: any): Promise<{
        agent_id: any;
        adaptation_complete: boolean;
        previous_pattern: any;
        new_pattern: any;
        performance_improvement: any;
        learning_insights: any;
        timestamp: string;
    }>;
    /**
     * DAA MCP Tool: daa_workflow_create.
     * Create an autonomous workflow with DAA coordination.
     *
     * @param params
     */
    daa_workflow_create(params: any): Promise<{
        workflow_id: any;
        name: any;
        total_steps: any;
        execution_strategy: any;
        dependencies_count: number;
        status: any;
        created_at: string;
    }>;
    /**
     * DAA MCP Tool: daa_workflow_execute.
     * Execute a DAA workflow with autonomous agents.
     *
     * @param params
     */
    daa_workflow_execute(params: any): Promise<{
        workflow_id: any;
        execution_complete: any;
        steps_completed: any;
        total_steps: any;
        execution_time_ms: any;
        agents_involved: any;
        results: any;
        timestamp: string;
    }>;
    /**
     * DAA MCP Tool: daa_knowledge_share.
     * Share knowledge between autonomous agents.
     *
     * @param params
     */
    daa_knowledge_share(params: any): Promise<{
        source_agent: any;
        target_agents: any;
        knowledge_domain: any;
        sharing_complete: boolean;
        agents_updated: any;
        knowledge_transfer_rate: any;
        timestamp: string;
    }>;
    /**
     * DAA MCP Tool: daa_learning_status.
     * Get learning progress and status for DAA agents.
     *
     * @param params
     */
    daa_learning_status(params: any): Promise<any>;
    /**
     * DAA MCP Tool: daa_cognitive_pattern.
     * Analyze or change cognitive patterns for agents.
     *
     * @param params
     */
    daa_cognitive_pattern(params: any): Promise<{
        analysis_type: string;
        agent_id: any;
        current_patterns: any;
        pattern_effectiveness: any;
        recommendations: any;
        optimization_potential: any;
        timestamp: string;
    } | {
        agent_id: any;
        previous_pattern: any;
        new_pattern: any;
        adaptation_success: any;
        expected_improvement: any;
        timestamp: string;
    }>;
    /**
     * DAA MCP Tool: daa_meta_learning.
     * Enable meta-learning capabilities across domains.
     *
     * @param params
     */
    daa_meta_learning(params: any): Promise<{
        meta_learning_complete: boolean;
        source_domain: any;
        target_domain: any;
        transfer_mode: any;
        knowledge_transferred: any;
        agents_updated: any;
        domain_proficiency_gain: any;
        cross_domain_insights: any;
        timestamp: string;
    }>;
    /**
     * DAA MCP Tool: daa_performance_metrics.
     * Get comprehensive DAA performance metrics.
     *
     * @param params
     */
    daa_performance_metrics(params: any): Promise<{
        metrics_category: any;
        time_range: any;
        system_metrics: {
            total_agents: any;
            active_agents: any;
            autonomous_tasks_completed: any;
            average_task_time_ms: any;
            learning_cycles_completed: any;
        };
        performance_metrics: {
            task_success_rate: any;
            adaptation_effectiveness: any;
            knowledge_sharing_events: any;
            cross_domain_transfers: any;
        };
        efficiency_metrics: {
            token_reduction: any;
            parallel_execution_gain: any;
            memory_optimization: any;
        };
        neural_metrics: {
            models_active: any;
            inference_speed_ms: any;
            training_iterations: any;
        };
        timestamp: string;
    }>;
    /**
     * Get all DAA tool definitions for MCP.
     */
    getToolDefinitions(): ({
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                enableLearning: {
                    type: string;
                    description: string;
                };
                enableCoordination: {
                    type: string;
                    description: string;
                };
                persistenceMode: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                id?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                agent_id?: never;
                agentId?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                workflow_id?: never;
                workflowId?: never;
                agentIds?: never;
                parallelExecution?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                detailed?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
                category?: never;
                timeRange?: never;
            };
            required?: never;
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                id: {
                    type: string;
                    description: string;
                };
                capabilities: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                cognitivePattern: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                learningRate: {
                    type: string;
                    description: string;
                };
                enableMemory: {
                    type: string;
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                agent_id?: never;
                agentId?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                workflow_id?: never;
                workflowId?: never;
                agentIds?: never;
                parallelExecution?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                detailed?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
                category?: never;
                timeRange?: never;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                agent_id: {
                    type: string;
                    description: string;
                };
                agentId: {
                    type: string;
                    description: string;
                };
                feedback: {
                    type: string;
                    description: string;
                };
                performanceScore: {
                    type: string;
                    description: string;
                };
                suggestions: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                id?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                workflow_id?: never;
                workflowId?: never;
                agentIds?: never;
                parallelExecution?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                detailed?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
                category?: never;
                timeRange?: never;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                id: {
                    type: string;
                    description: string;
                };
                name: {
                    type: string;
                    description: string;
                };
                steps: {
                    type: string;
                    description: string;
                };
                dependencies: {
                    type: string;
                    description: string;
                };
                strategy: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                agent_id?: never;
                agentId?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                workflow_id?: never;
                workflowId?: never;
                agentIds?: never;
                parallelExecution?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                detailed?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
                category?: never;
                timeRange?: never;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                workflow_id: {
                    type: string;
                    description: string;
                };
                workflowId: {
                    type: string;
                    description: string;
                };
                agentIds: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                parallelExecution: {
                    type: string;
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                id?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                agent_id?: never;
                agentId?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                detailed?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
                category?: never;
                timeRange?: never;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                source_agent: {
                    type: string;
                    description: string;
                };
                sourceAgentId: {
                    type: string;
                    description: string;
                };
                target_agents: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                targetAgentIds: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                knowledgeDomain: {
                    type: string;
                    description: string;
                };
                knowledgeContent: {
                    type: string;
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                id?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                agent_id?: never;
                agentId?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                workflow_id?: never;
                workflowId?: never;
                agentIds?: never;
                parallelExecution?: never;
                detailed?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
                category?: never;
                timeRange?: never;
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                agentId: {
                    type: string;
                    description: string;
                };
                detailed: {
                    type: string;
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                id?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                agent_id?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                workflow_id?: never;
                workflowId?: never;
                agentIds?: never;
                parallelExecution?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
                category?: never;
                timeRange?: never;
            };
            required?: never;
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                agent_id: {
                    type: string;
                    description: string;
                };
                agentId: {
                    type: string;
                    description: string;
                };
                action: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                pattern: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                analyze: {
                    type: string;
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                id?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                workflow_id?: never;
                workflowId?: never;
                agentIds?: never;
                parallelExecution?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                detailed?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
                category?: never;
                timeRange?: never;
            };
            required?: never;
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                sourceDomain: {
                    type: string;
                    description: string;
                };
                targetDomain: {
                    type: string;
                    description: string;
                };
                transferMode: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                agentIds: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                id?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                agent_id?: never;
                agentId?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                workflow_id?: never;
                workflowId?: never;
                parallelExecution?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                detailed?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                category?: never;
                timeRange?: never;
            };
            required?: never;
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: string;
            properties: {
                category: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                timeRange: {
                    type: string;
                    description: string;
                };
                enableLearning?: never;
                enableCoordination?: never;
                persistenceMode?: never;
                id?: never;
                capabilities?: never;
                cognitivePattern?: never;
                learningRate?: never;
                enableMemory?: never;
                agent_id?: never;
                agentId?: never;
                feedback?: never;
                performanceScore?: never;
                suggestions?: never;
                name?: never;
                steps?: never;
                dependencies?: never;
                strategy?: never;
                workflow_id?: never;
                workflowId?: never;
                agentIds?: never;
                parallelExecution?: never;
                source_agent?: never;
                sourceAgentId?: never;
                target_agents?: never;
                targetAgentIds?: never;
                knowledgeDomain?: never;
                knowledgeContent?: never;
                detailed?: never;
                action?: never;
                pattern?: never;
                analyze?: never;
                sourceDomain?: never;
                targetDomain?: never;
                transferMode?: never;
            };
            required?: never;
        };
    })[];
}
export declare const daaMcpTools: DAA_MCPTools;
//# sourceMappingURL=mcp-daa-tools.d.ts.map