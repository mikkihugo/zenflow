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
// Export main class
export { AgentManager } from './agent-manager';
export { default } from './agent-manager';
/**
 * Package version information
 */
export const VERSION = '1.0.0';
/**
 * Package description
 */
export const DESCRIPTION = 'Basic agent lifecycle management and simple swarm coordination';
/**
 * Default configuration for AgentManager
 */
export const DEFAULT_CONFIG = {
    maxAgents: 100,
    topology: 'mesh',
    timeout: 30000,
    healthCheckInterval: 10000,
    coordinationStrategy: 'adaptive'
};
/**
 * Agent type categories for convenience
 */
export const AGENT_CATEGORIES = {
    DEVELOPMENT: ['coder', 'architect', 'developer', 'fullstack-dev', 'api-dev', 'frontend-dev'],
    ANALYSIS: ['analyst', 'researcher', 'data', 'security-analyzer'],
    OPERATIONS: ['ops', 'devops-engineer', 'infrastructure-ops', 'monitoring-ops'],
    TESTING: ['tester', 'unit-tester', 'integration-tester', 'e2e-tester'],
    COORDINATION: ['coordinator', 'optimizer', 'queen', 'specialist']
};
/**
 * Common capability sets for quick agent configuration
 */
export const CAPABILITY_SETS = {
    TYPESCRIPT_DEV: ['typescript', 'node', 'testing', 'debugging'],
    REACT_DEV: ['react', 'javascript', 'jsx', 'css', 'html'],
    BACKEND_DEV: ['api-development', 'database', 'server-architecture', 'security'],
    FULLSTACK_DEV: ['frontend', 'backend', 'database', 'deployment', 'testing'],
    DATA_ANALYST: ['data-analysis', 'statistics', 'visualization', 'reporting'],
    DEVOPS: ['ci-cd', 'containerization', 'cloud-deployment', 'monitoring']
};
/**
 * Utility function to create an agent with predefined capabilities
 */
export function createAgent(id, type, category) {
    return {
        id,
        type,
        status: 'idle',
        capabilities: category ? [...CAPABILITY_SETS[category]] : []
    };
}
/**
 * Utility function to create AgentManager with common configurations
 */
export function createAgentManager(preset) {
    // Import dynamically to avoid circular dependency issues during build
    const { AgentManager } = require('./agent-manager');
    const manager = new AgentManager();
    // Apply preset configurations
    const presets = {
        small: { maxAgents: 10, topology: 'star' },
        medium: { maxAgents: 50, topology: 'mesh' },
        large: { maxAgents: 200, topology: 'hierarchical' },
        enterprise: { maxAgents: 1000, topology: 'hierarchical', healthCheckInterval: 5000 }
    };
    if (preset && presets[preset]) {
        // Configuration will be applied during initialize() call
        manager.presetConfig = presets[preset];
    }
    return manager;
}
