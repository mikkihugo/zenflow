// Coordination Agents - Export Hub

// Re-export agent functionality
export * from './agent.js';
export { default as Agent } from './agent.js';
export { AgentManager } from './agent-manager';
export { AgentRegistry } from './agent-registry';
export { performGapAnalysis, generateComparisonReport, auditAutoAssignmentCapabilities } from './gap-analysis';
