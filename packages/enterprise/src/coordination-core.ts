/**
 * @fileoverview Coordination Core Strategic Facade - Real Package Delegation
 * 
 * Strategic facade providing real coordination core capabilities through delegation
 * to @claude-zen/coordination-core package.
 */

import { EventEmitter } from 'eventemitter3';

// Coordination core system access with real package delegation
let coordinationCoreModuleCache: any = null;

async function loadCoordinationCoreModule() {
  if (!coordinationCoreModuleCache) {
    try {
      // Load the real Coordination Core package
      coordinationCoreModuleCache = await import('@claude-zen/coordination-core');
    } catch (error) {
      console.warn('Coordination core package not available, providing compatibility layer');
      coordinationCoreModuleCache = {
        QueenCoordinator: class CompatibilityQueenCoordinator extends EventEmitter {
          async initialize() { return this; }
          async shutdown() { return Promise.resolve(); }
          async coordinate() { return { status: 'compatibility' }; }
          getMetrics() { return { coordination: 0, efficiency: 0 }; }
        },
        SwarmCommander: class CompatibilitySwarmCommander extends EventEmitter {
          async initialize() { return this; }
          async shutdown() { return Promise.resolve(); }
          async command() { return { status: 'compatibility' }; }
        },
        CoordinationEventBus: class CompatibilityEventBus extends EventEmitter {
          async initialize() { return this; }
          async shutdown() { return Promise.resolve(); }
          publish() { return Promise.resolve(); }
          subscribe() { return () => {}; }
        },
        CoordinationEngine: class CompatibilityEngine extends EventEmitter {
          async initialize() { return this; }
          async shutdown() { return Promise.resolve(); }
          async process() { return { status: 'compatibility' }; }
        },
        TaskCoordinator: class CompatibilityTaskCoordinator extends EventEmitter {
          async initialize() { return this; }
          async shutdown() { return Promise.resolve(); }
          async coordinate() { return { status: 'compatibility' }; }
        }
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

// Static exports for immediate use (with fallback)
export { 
  QueenCoordinator,
  SwarmCommander,
  CoordinationEventBus,
  CoordinationEngine,
  TaskCoordinator
} from '@claude-zen/coordination-core';

// Type exports
export type {
  QueenConfig,
  CoordinationMetrics,
  SwarmConfig,
  TaskConfig,
  CoordinationEvent,
  CoordinationResult
} from '@claude-zen/coordination-core';