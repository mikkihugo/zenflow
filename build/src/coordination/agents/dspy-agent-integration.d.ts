/**
 * DSPy Agent Integration with Existing Coordination System.
 *
 * Integrates DSPy neural enhancement agents into the existing swarm coordination.
 * System, with specialized prompts defining each agent's behavior and expertise.
 */
import type { SessionMemoryStore } from '../../memory/memory.ts';
import type { DSPyConfig } from '../../neural/types/dspy-types.ts';
import type { SwarmCoordinator } from '../swarm/core/swarm-coordinator.ts';
/**
 * DSPy Agent Types (matches agent-types.ts).
 */
export type DSPyAgentType = 'prompt-optimizer' | 'example-generator' | 'metric-analyzer' | 'pipeline-tuner' | 'neural-enhancer';
/**
 * DSPy Agent Prompt Definitions.
 * Each agent has specialized prompts that define their behavior and expertise.
 */
export declare const DSPyAgentPrompts: Record<DSPyAgentType, {
    systemPrompt: string;
    behaviorPrompt: string;
    expertisePrompt: string;
    taskPrompt: string;
}>;
/**
 * DSPy Agent Integration Class.
 * Bridges DSPy functionality with existing coordination system.
 *
 * @example
 */
export declare class DSPyAgentIntegration {
    private swarmCoordinator;
    private dspyWrapper;
    private dspyAgents;
    constructor(swarmCoordinator: SwarmCoordinator, _memoryStore: SessionMemoryStore);
    /**
     * Initialize the DSPy wrapper with configuration.
     *
     * @param config
     */
    initialize(config?: DSPyConfig): Promise<void>;
    /**
     * Register DSPy agents with the existing coordination system.
     */
    registerDSPyAgents(): Promise<void>;
    /**
     * Create a DSPy agent compatible with existing coordination system.
     *
     * @param agentType
     */
    private createDSPyAgent;
    /**
     * Get capabilities for each DSPy agent type.
     *
     * @param agentType
     */
    private getDSPyAgentCapabilities;
    /**
     * Execute DSPy optimization using existing coordination system.
     *
     * @param programName
     * @param signature
     * @param description
     * @param examples
     * @param options
     * @param options.agentTypes
     * @param options.coordinationStrategy
     */
    executeDSPyOptimization(programName: string, signature: string, description: string, examples: Array<{
        input: any;
        output: any;
    }>, options?: {
        agentTypes?: DSPyAgentType[];
        coordinationStrategy?: 'parallel' | 'sequential' | 'collaborative';
    }): Promise<{
        program: any;
        result: any;
    }>;
    /**
     * Get DSPy agent status from coordination system.
     */
    getDSPyAgentStatus(): Array<{
        id: string;
        type: DSPyAgentType;
        status: string;
        capabilities: string[];
        performance: any;
    }>;
    /**
     * Answer the user's question: "Can workflows be automatically enhanced by neural?".
     */
    demonstrateNeuralWorkflowEnhancement(): Promise<{
        canEnhance: boolean;
        enhancementCapabilities: string[];
        exampleResults: any;
    }>;
    /**
     * Cleanup DSPy agents from coordination system.
     */
    cleanup(): Promise<void>;
    /**
     * Create a DSPy program using the wrapper architecture.
     *
     * @param signature
     * @param description
     * @private
     */
    private createDSPyProgram;
    /**
     * Optimize a DSPy program using the wrapper architecture.
     *
     * @param program
     * @param examples
     * @private
     */
    private optimizeProgram;
}
export default DSPyAgentIntegration;
//# sourceMappingURL=dspy-agent-integration.d.ts.map