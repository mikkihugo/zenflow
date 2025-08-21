/**
 * @fileoverview Minimal DI exports for facade-status-manager
 * 
 * This is a simplified version that just re-exports the awilix functionality
 * needed by facade-status-manager.ts without the complex ServiceContainer implementation.
 */

import { 
  createContainer,
  asClass, 
  asFunction, 
  asValue,
  Lifetime,
  type AwilixContainer
} from 'awilix';

// Re-export exactly what facade-status-manager needs
export { 
  createContainer,
  Lifetime,
  asClass,
  asFunction,
  asValue
};

export type { 
  AwilixContainer
};