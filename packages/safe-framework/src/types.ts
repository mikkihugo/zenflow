/**
 * @fileoverview SAFe Framework Types
 * 
 * Core type definitions for Scaled Agile Framework (SAFe) integration.
 */

// ============================================================================
// PORTFOLIO TYPES
// ============================================================================

/**
 * Portfolio epic representing strategic initiatives
 */
export interface PortfolioEpic {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly businessValue: number;
  readonly status: 'backlog' | 'analyzing' | 'implementing' | 'done';
}

/**
 * Investment horizon for portfolio planning
 */
export type InvestmentHorizon = 'near' | 'mid' | 'long';

/**
 * Value stream in the SAFe framework
 */
export interface ValueStream {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly budget: number;
}

// ============================================================================
// PROGRAM INCREMENT TYPES
// ============================================================================

/**
 * Program Increment (PI) planning and execution
 */
export interface ProgramIncrement {
  readonly id: string;
  readonly name: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly status: 'planning' | 'executing' | 'completed';
}

/**
 * PI Objective with business value
 */
export interface PIObjective {
  readonly id: string;
  readonly description: string;
  readonly businessValue: number;
  readonly confidence: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * SAFe framework configuration
 */
export interface SafeConfiguration {
  readonly enablePortfolioManagement: boolean;
  readonly enablePIPlanning: boolean;
  readonly enableValueStreams: boolean;
}

/**
 * Portfolio configuration
 */
export interface PortfolioConfiguration {
  readonly horizonWeights: Record<InvestmentHorizon, number>;
  readonly budgetAllocation: number;
}

/**
 * PI configuration
 */
export interface PIConfiguration {
  readonly duration: number; // weeks
  readonly innovationWeeks: number;
  readonly planningDays: number;
}