"use strict";
/**
 * Central source of truth for agent types
 * This file ensures consistency across TypeScript types and runtime validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_ORCHESTRATION_STRATEGIES = exports.ORCHESTRATION_STRATEGIES = exports.VALID_SWARM_STRATEGIES = exports.SWARM_STRATEGIES = exports.AGENT_TYPE_SCHEMA = exports.VALID_AGENT_TYPES = exports.AGENT_TYPES = void 0;
exports.isValidAgentType = isValidAgentType;
exports.AGENT_TYPES = {
    COORDINATOR: 'coordinator',
    RESEARCHER: 'researcher',
    CODER: 'coder',
    ANALYST: 'analyst',
    ARCHITECT: 'architect',
    TESTER: 'tester',
    REVIEWER: 'reviewer',
    OPTIMIZER: 'optimizer',
    DOCUMENTER: 'documenter',
    MONITOR: 'monitor',
    SPECIALIST: 'specialist'
};
// Array of all valid agent types for runtime validation
exports.VALID_AGENT_TYPES = Object.values(exports.AGENT_TYPES);
// JSON Schema for agent type validation
exports.AGENT_TYPE_SCHEMA = {
    type: 'string',
    enum: exports.VALID_AGENT_TYPES,
    description: 'Type of AI agent'
};
// Helper function to validate agent type
function isValidAgentType(type) {
    return exports.VALID_AGENT_TYPES.includes(type);
}
// Strategy types
exports.SWARM_STRATEGIES = {
    AUTO: 'auto',
    RESEARCH: 'research',
    DEVELOPMENT: 'development',
    ANALYSIS: 'analysis',
    TESTING: 'testing',
    OPTIMIZATION: 'optimization',
    MAINTENANCE: 'maintenance',
    CUSTOM: 'custom'
};
exports.VALID_SWARM_STRATEGIES = Object.values(exports.SWARM_STRATEGIES);
// Task orchestration strategies (different from swarm strategies)
exports.ORCHESTRATION_STRATEGIES = {
    PARALLEL: 'parallel',
    SEQUENTIAL: 'sequential',
    ADAPTIVE: 'adaptive',
    BALANCED: 'balanced'
};
exports.VALID_ORCHESTRATION_STRATEGIES = Object.values(exports.ORCHESTRATION_STRATEGIES);
