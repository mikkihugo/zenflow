/**
 * @fileoverview Coordination Core Strategic Facade - Real Package Delegation
 *
 * Strategic facade providing real coordination core capabilities through delegation
 * to @claude-zen/coordination-core package.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import './module-declarations';

// Coordination core system access with real package delegation
let coordinationCoreModuleCache: any = null;

async function loadCoordinationCoreModule() {
  if (!coordinationCoreModuleCache) {
    try {
      // Load the real Coordination Core package
      coordinationCoreModuleCache = await import(
        '@claude-zen/coordination-core'
      );
    } catch {
      console.warn(
        'Coordination core package not available, providing compatibility layer',
      );
      coordinationCoreModuleCache = {
        QueenCoordinator: class CompatibilityQueenCoordinator extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
          async coordinate() {
            return { status: 'compatibility' };
          }
          override getMetrics() {
            return { coordination: 0, efficiency: 0 } as any;
          }
        },
        SwarmCommander: class CompatibilitySwarmCommander extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
          async command() {
            return { status: 'compatibility' };
          }
        },
        CoordinationEventBus: class CompatibilityEventBus extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
          publish() {
            return Promise.resolve();
          }
          subscribe() {
            return () => {};
          }
        },
        CoordinationEngine: class CompatibilityEngine extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
          async process() {
            return { status: 'compatibility' };
          }
        },
        TaskCoordinator: class CompatibilityTaskCoordinator extends TypedEventBase {
          async initialize() {
            return this;
          }
          async shutdown() {
            return Promise.resolve();
          }
          async coordinate() {
            return { status: 'compatibility' };
          }
        },
      };
    }
  }
  return coordinationCoreModuleCache;
}

// ===============================================================================
// REAL COORDINATION CORE PACKAGE EXPORTS - Direct delegation to actual implementations
// ===============================================================================

export const getQueenCoordinator = async (config?: any) => {
  const module = await loadCoordinationCoreModule();
  return new module.QueenCoordinator(config);
};

export const getSwarmCommander = async (config?: any) => {
  const module = await loadCoordinationCoreModule();
  return new module.SwarmCommander(config);
};

export const getCoordinationEventBus = async (config?: any) => {
  const module = await loadCoordinationCoreModule();
  return new module.CoordinationEventBus(config);
};

export const getCoordinationEngine = async (config?: any) => {
  const module = await loadCoordinationCoreModule();
  return new module.CoordinationEngine(config);
};

export const getTaskCoordinator = async (config?: any) => {
  const module = await loadCoordinationCoreModule();
  return new module.TaskCoordinator(config);
};

// Coordination core implementations are accessed via the facade functions above
// Static exports removed to avoid module not found errors
// All functionality is available through getQueenCoordinator() and related functions
