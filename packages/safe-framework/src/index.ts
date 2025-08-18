/**
 * @fileoverview SAFe Framework Integration
 * 
 * Comprehensive Scaled Agile Framework (SAFe) integration providing:
 * - Portfolio management with lean portfolio management
 * - Program Increment (PI) planning and execution
 * - Value stream mapping and optimization
 */

// ============================================================================
// TYPES - SAFe framework type definitions
// ============================================================================
export type {
  // Portfolio types
  PortfolioEpic,
  InvestmentHorizon,
  ValueStream,
  
  // Program types  
  ProgramIncrement,
  PIObjective,
  
  // Configuration types
  SafeConfiguration,
  PIConfiguration,
  PortfolioConfiguration
} from './types';

// ============================================================================
// EVENTS - SAFe-specific event management
// ============================================================================
export type {
  SafeEvent,
  PortfolioEpicEvent,
  PIPlanningEvent,
  SafeEventType
} from './events/safe-events';

export {
  isPortfolioEvent,
  isPIEvent
} from './events/safe-events';

// ============================================================================
// MANAGERS - Core SAFe management components (placeholder)
// ============================================================================

/**
 * Placeholder for SAFe portfolio manager - to be implemented
 */
export class SafePortfolioManager {
  public readonly id: string;
  
  constructor(config: SafeConfiguration) {
    this.id = `safe-portfolio-${Date.now()}`;
    // Implementation to be added
  }
  
  async initialize(): Promise<void> {
    // Implementation to be added
  }
}

// ============================================================================
// UTILITIES AND FACTORIES
// ============================================================================

/**
 * Create a SAFe framework integration
 */
export function createSafeFramework(config: SafeConfiguration) {
  return new SafePortfolioManager(config);
}

// Re-export types
import type { SafeConfiguration } from './types';