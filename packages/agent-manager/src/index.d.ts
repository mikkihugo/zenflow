/**
 * @fileoverview Agent Manager Package Entry Point
 *
 * Standalone agent lifecycle management and basic swarm coordination package.
 * Provides essential agent operations for CLI tools, APIs, and simple coordination
 * scenarios without advanced methodology dependencies.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 * @since 2024-01-01
 *
 * @example Basic Usage
 * ```typescript
 * import { AgentManager } from '@claude-zen/agent-manager';
 *
 * const manager = new AgentManager();
 * await manager.initialize({ topology: 'mesh', maxAgents: 50 });
 *
 * await manager.addAgent({
 *   id: 'worker-001',
 *   type: 'coder',
 *   status: 'idle',
 *   capabilities: ['typescript', 'react', 'testing']
 * });
 *
 * const coordination = await manager.coordinateAgents(
 *   manager.getAgents(),
 *   'hierarchical'
 * );
 *
 * console.log(`Coordination: ${coordination.success ? 'Success' : 'Failed'}`);
 * ```
 *
 * @example Task Assignment
 * ```typescript
 * import { AgentManager, type SwarmAgent } from '@claude-zen/agent-manager';
 *
 * const manager = new AgentManager();
 * await manager.initialize();
 *
 * // Monitor task completion
 * manager.on('task:completed', (event) => {
 *   console.log(`Task ${event.taskId} completed in ${event.duration}ms`);
 * });
 *
 * // Assign task to best available agent
 * const agentId = await manager.assignTask({
 *   id: 'build-component',
 *   type: 'development',
 *   requirements: ['react', 'typescript'],
 *   priority: 7
 * });
 *
 * if (agentId) {
 *   console.log(`Task assigned to agent: ${agentId}`);
 * }
 * ```
 */
export { AgentManager } from './agent-manager';
export { default } from './agent-manager';
/**
 * Package version information
 */
export declare const VERSION = "1.0.0";
/**
 * Package description
 */
export declare const DESCRIPTION = "Basic agent lifecycle management and simple swarm coordination";
/**
 * Default configuration for AgentManager
 */
export declare const DEFAULT_CONFIG: {
    maxAgents: number;
    topology: "mesh";
    timeout: number;
    healthCheckInterval: number;
    coordinationStrategy: "adaptive";
};
/**
 * Agent type categories for convenience
 */
export declare const AGENT_CATEGORIES: {
    DEVELOPMENT: string[];
    ANALYSIS: string[];
    OPERATIONS: string[];
    TESTING: string[];
    COORDINATION: string[];
};
/**
 * Common capability sets for quick agent configuration
 */
export declare const CAPABILITY_SETS: {
    TYPESCRIPT_DEV: string[];
    REACT_DEV: string[];
    BACKEND_DEV: string[];
    FULLSTACK_DEV: string[];
    DATA_ANALYST: string[];
    DEVOPS: string[];
};
/**
 * Utility function to create an agent with predefined capabilities
 */
export declare function createAgent(id: string, type: string, category?: keyof typeof CAPABILITY_SETS): {
    id: string;
    type: string;
    status: "idle";
    capabilities: string[];
};
/**
 * Utility function to create AgentManager with common configurations
 */
export declare function createAgentManager(preset?: 'small' | 'medium' | 'large' | 'enterprise'): any;
//# sourceMappingURL=index.d.ts.map