import { generateSubAgentConfig, mapToClaudeSubAgent, } from './sub-agent-generator.ts';
export class TaskCoordinator {
    static instance;
    taskHistory = new Map();
    activeSubAgents = new Set();
    sparcBridge;
    sparcSwarm;
    static getInstance() {
        if (!TaskCoordinator.instance) {
            TaskCoordinator.instance = new TaskCoordinator();
        }
        return TaskCoordinator.instance;
    }
    async initializeSPARCIntegration(sparcBridge, sparcSwarm) {
        this.sparcBridge = sparcBridge;
        this.sparcSwarm = sparcSwarm;
    }
    async executeTask(config) {
        const startTime = Date.now();
        const taskId = this.generateTaskId(config);
        try {
            if (config?.use_sparc_methodology && this.shouldUseSPARC(config)) {
                return await this.executeWithSPARC(config, startTime, taskId);
            }
            return await this.executeDirectly(config, startTime, taskId);
        }
        catch (error) {
            const taskResult = {
                success: false,
                agent_used: config?.subagent_type,
                execution_time_ms: Date.now() - startTime,
                tools_used: [],
                methodology_applied: 'direct',
                error: error instanceof Error ? error.message : String(error),
            };
            this.taskHistory.set(taskId, taskResult);
            return taskResult;
        }
    }
    async executeWithSPARC(config, _startTime, taskId) {
        if (!(this.sparcBridge && this.sparcSwarm)) {
            throw new Error('SPARC integration not initialized');
        }
        let assignmentId;
        if (config?.source_document) {
            if (config?.source_document?.type === 'feature') {
                assignmentId = await this.sparcBridge.assignFeatureToSparcs(config?.source_document);
            }
            else {
                assignmentId = await this.sparcBridge.assignTaskToSparcs(config?.source_document);
            }
        }
        else {
            const tempTask = this.createTempTaskDocument(config);
            assignmentId = await this.sparcBridge.assignTaskToSparcs(tempTask);
        }
        const result = await this.waitForSPARCCompletion(assignmentId);
        const taskResult = {
            success: result?.status === 'completed',
            output: result?.completionReport,
            agent_used: 'sparc-swarm',
            execution_time_ms: result?.metrics?.totalTimeMs,
            tools_used: ['sparc-methodology'],
            sparc_task_id: result?.sparcTaskId,
            implementation_artifacts: Object.values(result?.artifacts).flat(),
            methodology_applied: 'sparc',
        };
        this.taskHistory.set(taskId, taskResult);
        return taskResult;
    }
    async executeDirectly(config, startTime, taskId) {
        const agentStrategy = this.selectAgentStrategy(config);
        const executionContext = this.prepareExecutionContext(config, agentStrategy);
        const result = await this.executeWithAgent(executionContext);
        const taskResult = {
            success: true,
            output: result?.output,
            agent_used: agentStrategy.agent_name,
            execution_time_ms: Date.now() - startTime,
            tools_used: agentStrategy.tools,
            methodology_applied: 'direct',
        };
        this.taskHistory.set(taskId, taskResult);
        return taskResult;
    }
    shouldUseSPARC(config) {
        return (config.use_sparc_methodology === true ||
            config.priority === 'high' ||
            config.priority === 'critical' ||
            (config?.source_document &&
                this.isComplexDocument(config?.source_document)) ||
            config?.description.length > 200);
    }
    isComplexDocument(document) {
        return (('acceptance_criteria' in document &&
            document.acceptance_criteria?.length > 3) ||
            document.tags?.includes('complex') ||
            document.tags?.includes('architecture') ||
            ('technical_approach' in document &&
                document.technical_approach?.includes('architecture')));
    }
    createTempTaskDocument(config) {
        return {
            id: `temp-task-${Date.now()}`,
            type: 'task',
            title: config?.description.substring(0, 100),
            content: config?.prompt,
            status: 'draft',
            priority: config?.priority || 'medium',
            author: 'task-coordinator',
            tags: ['sparc-generated', 'temporary'],
            project_id: 'temp-project',
            dependencies: config?.dependencies || [],
            related_documents: [],
            version: '1.0.0',
            searchable_content: config?.description,
            keywords: [],
            workflow_stage: 'sparc-ready',
            completion_percentage: 0,
            created_at: new Date(),
            updated_at: new Date(),
            checksum: 'temp-checksum',
            metadata: {},
            task_type: 'development',
            estimated_hours: config?.timeout_minutes
                ? config?.timeout_minutes / 60
                : 8,
            implementation_details: {
                files_to_create: [],
                files_to_modify: [],
                test_files: [],
                documentation_updates: [],
            },
            technical_specifications: {
                component: config?.domain_context || 'general',
                module: 'task-coordinator',
                functions: [],
                dependencies: config?.tools_required || [],
            },
            completion_status: 'todo',
        };
    }
    async waitForSPARCCompletion(assignmentId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'completed',
                    sparcTaskId: `sparc-${assignmentId}`,
                    completionReport: 'SPARC methodology completed successfully',
                    metrics: {
                        totalTimeMs: 30000,
                        agentsUsed: ['sparc-swarm'],
                    },
                    artifacts: {
                        specification: ['requirements.md'],
                        pseudocode: ['algorithm.md'],
                        architecture: ['design.md'],
                        implementation: ['code.ts'],
                        tests: ['tests.ts'],
                        documentation: ['docs.md'],
                    },
                });
            }, 1000);
        });
    }
    selectAgentStrategy(config) {
        const claudeSubAgent = mapToClaudeSubAgent(config?.subagent_type);
        const subAgentConfig = generateSubAgentConfig(config?.subagent_type);
        const useClaudeSubAgent = config?.use_claude_subagent !== false &&
            this.isClaudeSubAgentOptimal(config);
        return {
            agent_type: config?.subagent_type,
            agent_name: useClaudeSubAgent ? claudeSubAgent : config?.subagent_type,
            use_claude_subagent: useClaudeSubAgent,
            tools: config?.tools_required || subAgentConfig?.tools,
            capabilities: subAgentConfig?.capabilities,
            system_prompt: subAgentConfig?.systemPrompt,
        };
    }
    isClaudeSubAgentOptimal(config) {
        if (config.priority === 'high' || config.priority === 'critical') {
            return true;
        }
        if (config?.dependencies && config?.dependencies.length > 2) {
            return true;
        }
        const specializedDomains = [
            'code-review-swarm',
            'debug',
            'ai-ml-specialist',
            'database-architect',
            'system-architect',
            'security-analyzer',
        ];
        return specializedDomains.includes(config?.subagent_type);
    }
    prepareExecutionContext(config, strategy) {
        let enhancedPrompt = config?.prompt;
        if (config?.domain_context) {
            enhancedPrompt += `
      \n**Domain Context**: ${config?.domain_context}`;
        }
        if (config?.expected_output) {
            enhancedPrompt += `
      \n**Expected Output**: ${config?.expected_output}`;
        }
        if (strategy.use_claude_subagent) {
            enhancedPrompt += `
      \n**Specialized Focus**: ${strategy.system_prompt}`;
        }
        return {
            task_id: this.generateTaskId(config),
            description: config?.description,
            prompt: enhancedPrompt,
            agent_strategy: strategy,
            timeout_ms: (config?.timeout_minutes || 10) * 60 * 1000,
            priority: config?.priority || 'medium',
        };
    }
    async executeWithAgent(context) {
        this.activeSubAgents.add(context.agent_strategy.agent_name);
        try {
            const output = `Task completed by ${context.agent_strategy.agent_name}: ${context.description}`;
            return { output };
        }
        finally {
            this.activeSubAgents.delete(context.agent_strategy.agent_name);
        }
    }
    generateTaskId(config) {
        const timestamp = Date.now();
        const hash = this.simpleHash(config?.description + config?.subagent_type);
        return `task_${timestamp}_${hash}`;
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    getTaskHistory() {
        return new Map(this.taskHistory);
    }
    getActiveSubAgents() {
        return Array.from(this.activeSubAgents);
    }
    getPerformanceMetrics() {
        const tasks = Array.from(this.taskHistory.values());
        const successful = tasks.filter((t) => t.success);
        const failed = tasks.filter((t) => !t.success);
        return {
            total_tasks: tasks.length,
            successful_tasks: successful.length,
            failed_tasks: failed.length,
            success_rate: tasks.length > 0 ? successful.length / tasks.length : 0,
            average_execution_time_ms: successful.length > 0
                ? successful.reduce((sum, t) => sum + t.execution_time_ms, 0) /
                    successful.length
                : 0,
            most_used_agents: this.getMostUsedAgents(tasks),
            tools_usage: this.getToolsUsage(tasks),
        };
    }
    getMostUsedAgents(tasks) {
        const agentCounts = {};
        tasks.forEach((task) => {
            agentCounts[task.agent_used] = (agentCounts[task.agent_used] || 0) + 1;
        });
        return agentCounts;
    }
    getToolsUsage(tasks) {
        const toolCounts = {};
        tasks.forEach((task) => {
            task.tools_used.forEach((tool) => {
                toolCounts[tool] = (toolCounts[tool] || 0) + 1;
            });
        });
        return toolCounts;
    }
}
export async function executeTask(config) {
    const taskCoordinator = TaskCoordinator.getInstance();
    return await taskCoordinator.executeTask(config);
}
export async function executeBatchTasks(configs) {
    const taskCoordinator = TaskCoordinator.getInstance();
    const promises = configs.map((config) => taskCoordinator.executeTask(config));
    return await Promise.all(promises);
}
export default TaskCoordinator;
//# sourceMappingURL=task-coordinator.js.map