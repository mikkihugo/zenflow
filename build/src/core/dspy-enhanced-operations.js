/**
 * @file Dspy-enhanced-operations implementation.
 */
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('DSPyOperations');
export class DSPyEnhancedOperations {
    dspyWrapper;
    programs = new Map();
    constructor(dspyWrapper) {
        this.dspyWrapper = dspyWrapper;
        this.initializePrograms();
    }
    async initializePrograms() {
        try {
            // Code Analysis Program
            const codeAnalysisProgram = await this.dspyWrapper.createProgram('code: string, task_type: string -> analysis: string, suggestions: string[], complexity: number', 'Analyze code and provide intelligent insights, suggestions, and complexity assessment');
            // Error Diagnosis Program
            const errorDiagnosisProgram = await this.dspyWrapper.createProgram('error_message: string, code_context: string, file_path: string -> diagnosis: string, fix_suggestions: string[], confidence: number', 'Diagnose TypeScript/JavaScript errors and provide targeted fix suggestions');
            // Code Generation Program
            const codeGenerationProgram = await this.dspyWrapper.createProgram('requirements: string, context: string, style_guide: string -> code: string, explanation: string, tests: string[]', 'Generate high-quality code based on requirements with proper documentation and tests');
            // Task Orchestration Program
            const taskOrchestrationProgram = await this.dspyWrapper.createProgram('task_description: string, available_agents: string[], project_context: string -> execution_plan: string[], agent_assignments: object, priority_order: string[]', 'Intelligently orchestrate complex tasks across multiple agents with optimal resource allocation');
            // Swarm Optimization Program
            const swarmOptimizationProgram = await this.dspyWrapper.createProgram('current_topology: string, task_requirements: string[], performance_metrics: object -> optimized_topology: string, agent_rebalancing: object, performance_prediction: number', 'Optimize swarm topology and agent distribution for maximum efficiency');
            this.programs.set('code_analysis', codeAnalysisProgram);
            this.programs.set('error_diagnosis', errorDiagnosisProgram);
            this.programs.set('code_generation', codeGenerationProgram);
            this.programs.set('task_orchestration', taskOrchestrationProgram);
            this.programs.set('swarm_optimization', swarmOptimizationProgram);
            logger.info('DSPy programs initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize DSPy programs', { error });
            throw error;
        }
    }
    /**
     * Analyze code using DSPy intelligence.
     *
     * @param code
     * @param taskType
     */
    async analyzeCode(code, taskType = 'general') {
        const program = this.programs.get('code_analysis');
        if (!program)
            throw new Error('Code analysis program not initialized');
        const executionResult = await this.dspyWrapper.execute(program, {
            code,
            task_type: taskType,
        });
        if (!executionResult?.success) {
            throw new Error(`Code analysis failed: ${executionResult?.error?.message}`);
        }
        const result = executionResult?.result;
        if (!result) {
            throw new Error('No result returned from code analysis');
        }
        return {
            analysis: result?.['analysis'],
            suggestions: result?.['suggestions'],
            complexity: result?.['complexity'],
            confidence: result?.['confidence'] || executionResult?.metadata?.confidence || 0.8,
        };
    }
    /**
     * Diagnose errors using DSPy intelligence.
     *
     * @param errorMessage
     * @param codeContext
     * @param filePath
     */
    async diagnoseError(errorMessage, codeContext, filePath) {
        const program = this.programs.get('error_diagnosis');
        if (!program)
            throw new Error('Error diagnosis program not initialized');
        const executionResult = await this.dspyWrapper.execute(program, {
            error_message: errorMessage,
            code_context: codeContext,
            file_path: filePath,
        });
        if (!executionResult?.success) {
            throw new Error(`Error diagnosis failed: ${executionResult?.error?.message}`);
        }
        const result = executionResult?.result;
        if (!result) {
            throw new Error('No result returned from error diagnosis');
        }
        return {
            diagnosis: result?.['diagnosis'],
            fixSuggestions: result?.['fix_suggestions'],
            confidence: result?.['confidence'] || executionResult?.metadata?.confidence || 0.7,
            severity: this.assessErrorSeverity(errorMessage),
        };
    }
    /**
     * Generate code using DSPy intelligence.
     *
     * @param requirements
     * @param context
     * @param styleGuide
     */
    async generateCode(requirements, context, styleGuide = 'typescript-strict') {
        const program = this.programs.get('code_generation');
        if (!program)
            throw new Error('Code generation program not initialized');
        const executionResult = await this.dspyWrapper.execute(program, {
            requirements,
            context,
            style_guide: styleGuide,
        });
        if (!executionResult?.success) {
            throw new Error(`Code generation failed: ${executionResult?.error?.message}`);
        }
        const result = executionResult?.result;
        if (!result) {
            throw new Error('No result returned from code generation');
        }
        return {
            code: result?.['code'],
            explanation: result?.['explanation'],
            tests: result?.['tests'],
            estimatedComplexity: this.estimateComplexity(result?.['code']),
        };
    }
    /**
     * Orchestrate tasks using DSPy intelligence.
     *
     * @param taskDescription
     * @param availableAgents
     * @param projectContext
     */
    async orchestrateTask(taskDescription, availableAgents, projectContext) {
        const program = this.programs.get('task_orchestration');
        if (!program)
            throw new Error('Task orchestration program not initialized');
        const executionResult = await this.dspyWrapper.execute(program, {
            task_description: taskDescription,
            available_agents: availableAgents.join(', '),
            project_context: projectContext,
        });
        if (!executionResult?.success) {
            throw new Error(`Task orchestration failed: ${executionResult?.error?.message}`);
        }
        return {
            execution_plan: executionResult?.result?.['execution_plan'] || [],
            agent_assignments: executionResult?.result?.['agent_assignments'] || {},
            priority_order: executionResult?.result?.['priority_order'] || [],
            estimatedDuration: this.estimateDuration(executionResult?.result?.['execution_plan']?.length || 0),
        };
    }
    /**
     * Optimize swarm using DSPy intelligence.
     *
     * @param currentTopology
     * @param taskRequirements
     * @param performanceMetrics
     */
    async optimizeSwarm(currentTopology, taskRequirements, performanceMetrics) {
        const program = this.programs.get('swarm_optimization');
        if (!program)
            throw new Error('Swarm optimization program not initialized');
        const executionResult = await this.dspyWrapper.execute(program, {
            current_topology: currentTopology,
            task_requirements: taskRequirements.join(', '),
            performance_metrics: JSON.stringify(performanceMetrics),
        });
        if (!executionResult?.success) {
            throw new Error(`Swarm optimization failed: ${executionResult?.error?.message}`);
        }
        const result = executionResult?.result;
        if (!result) {
            throw new Error('No result returned from swarm optimization');
        }
        return {
            optimizedTopology: result?.['optimized_topology'],
            agentRebalancing: result?.['agent_rebalancing'],
            performancePrediction: result?.['performance_prediction'],
            optimizationReasoning: result?.['reasoning'] || 'DSPy optimization applied',
        };
    }
    /**
     * Train DSPy programs with examples from successful operations.
     *
     * @param operationType
     * @param examples
     */
    async trainFromSuccessfulOperations(operationType, examples) {
        const program = this.programs.get(operationType);
        if (!program) {
            logger.warn(`Program ${operationType} not found for training`);
            return;
        }
        // Filter for successful examples only
        const successfulExamples = examples.filter((ex) => ex.success);
        if (successfulExamples.length > 0) {
            try {
                await this.dspyWrapper.addExamples(program, successfulExamples);
                const optimizationResult = await this.dspyWrapper.optimize(program, {
                    strategy: 'auto',
                    maxIterations: 5,
                });
                if (optimizationResult?.success) {
                    // Update the program in our cache
                    this.programs.set(operationType, optimizationResult?.program);
                    logger.info(`Trained ${operationType} program with ${successfulExamples.length} successful examples`, {
                        improvement: optimizationResult?.metrics?.improvementPercent,
                    });
                }
            }
            catch (error) {
                logger.error(`Failed to train ${operationType} program`, { error });
            }
        }
    }
    /**
     * Get DSPy program statistics.
     */
    getProgramStats() {
        return {
            totalPrograms: this.programs.size,
            programTypes: Array.from(this.programs.keys()),
            readyPrograms: Array.from(this.programs.values()).length,
        };
    }
    assessErrorSeverity(errorMessage) {
        if (errorMessage.includes('Cannot find module') || errorMessage.includes('does not exist'))
            return 'high';
        if (errorMessage.includes('Type') && errorMessage.includes('is not assignable'))
            return 'medium';
        if (errorMessage.includes('Property') && errorMessage.includes('does not exist'))
            return 'medium';
        return 'low';
    }
    estimateComplexity(code) {
        const lines = code.split('\n').length;
        const complexity = Math.min(100, Math.max(1, Math.floor(lines / 10) * 10));
        return complexity;
    }
    estimateDuration(stepCount) {
        const minutes = stepCount * 2; // 2 minutes per step
        if (minutes < 60)
            return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
}
export default DSPyEnhancedOperations;
