// Coordination Agents - Export Hub

// Re-export agent functionality
export * from './agent.ts';
export { default as Agent } from './agent.ts';
export { AgentManager } from './agent-manager';
export { AgentRegistry } from './agent-registry';
export {
  auditAutoAssignmentCapabilities,
  generateComparisonReport,
  performGapAnalysis,
} from './gap-analysis';
