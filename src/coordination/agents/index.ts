// Coordination Agents - Export Hub

// Re-export agent functionality
/**
 * @file Agents module exports.
 */

export * from './agent';
// export { AgentManager } from './agent-manager'; // File not found, commented out
export { AgentRegistry } from './agent-registry';
export {
  auditAutoAssignmentCapabilities,
  generateComparisonReport,
  performGapAnalysis,
} from './composite-system';
