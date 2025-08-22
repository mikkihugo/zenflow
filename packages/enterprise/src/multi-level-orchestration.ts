/**
 * @fileoverview Multi-Level Orchestration Strategic Facade - Real Package Delegation
 *
 * Strategic facade providing real multi-level orchestration capabilities through delegation
 * to @claude-zen/multi-level-orchestration package.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import './module-declarations';

// Multi-level orchestration system access with real package delegation
let orchestrationModuleCache: any = null;

async function loadOrchestrationModule() {
  if (!orchestrationModuleCache) {
    try {
      // Load the real Multi-Level Orchestration package
      orchestrationModuleCache = await import('@claude-zen/multi-level-orchestration');
    } catch (error) {
      console.warn('Multi-level orchestration package not available, providing compatibility layer');
      orchestrationModuleCache = {
        MultiLevelOrchestrationManager: class CompatibilityOrchestrationManager extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
          async orchestratePortfolio() {
            return { status: 'compatibility' };
          }
          async orchestrateProgram() {
            return { status: 'compatibility' };
          }
          async orchestrateSwarm() {
            return { status: 'compatibility' };
          }
        },
        PortfolioOrchestrator: class CompatibilityPortfolioOrchestrator extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
        },
        ProgramOrchestrator: class CompatibilityProgramOrchestrator extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
        },
        SwarmExecutionOrchestrator: class CompatibilitySwarmOrchestrator extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
        },
        OrchestrationLevel: {
          PORTFOLIO: 'portfolio',
          PROGRAM: 'program',
          SWARM_EXECUTION: 'execution',
        },
        WorkflowStream: class CompatibilityWorkflowStream {},
        MultiLevelOrchestratorState: class CompatibilityOrchestratorState {},
      };
    }
  }
  return orchestrationModuleCache;
}

// ===============================================================================
// REAL MULTI-LEVEL ORCHESTRATION PACKAGE EXPORTS - Direct delegation to actual implementations
// ===============================================================================

export const getMultiLevelOrchestrationManager = async (config?: any) => {
  const module = await loadOrchestrationModule();
  return new module.MultiLevelOrchestrationManager(config);
};

export const getPortfolioOrchestrator = async (config?: any) => {
  const module = await loadOrchestrationModule();
  return new module.PortfolioOrchestrator(config);
};

export const getProgramOrchestrator = async (config?: any) => {
  const module = await loadOrchestrationModule();
  return new module.ProgramOrchestrator(config);
};

export const getSwarmExecutionOrchestrator = async (config?: any) => {
  const module = await loadOrchestrationModule();
  return new module.SwarmExecutionOrchestrator(config);
};

// Multi-level orchestration implementations are accessed via the facade functions above
// Static exports removed to avoid module not found errors
// All functionality is available through getMultiLevelOrchestrator() and related functions