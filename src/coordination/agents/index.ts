// Coordination Agents - Export Hub

// Re-export agent functionality
/**
 * @file Agents module exports.
 */

export * from './agent.js';
// export { AgentManager } from './agent-manager.js'; // File not found, commented out
export { AgentRegistry } from './agent-registry.js';
export {
  auditAutoAssignmentCapabilities,
  generateComparisonReport,
  performGapAnalysis,
} from './gap-analysis.js';
