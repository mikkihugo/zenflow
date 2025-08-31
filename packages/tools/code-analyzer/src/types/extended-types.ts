/**
 * Extended Types for Code Analysis
 * Comprehensive type definitions for advanced analysis features
 */

// AST-related types
export interface ImportSpecifier {}

export interface TypeProperty {}

export interface TypeMethod {}

// Control flow types
export interface ControlFlowNode {}

export interface ControlFlowEdge {}

// Data flow types
export interface DataFlowNode {}

export interface DataFlowEdge {}

export interface Definition {}

export interface Use {}

// Call graph types
export interface CallGraphNode {}

export interface CallGraphEdge {}

export interface RecursiveCall {}

// AI Analysis types
export interface ComplexityFactor {}

export interface ComplexityReduction {}

export interface RefactoringStep {}

// Business logic types
export interface BusinessRule {}

export interface Workflow {}

export interface WorkflowStep {}

export interface WorkflowData {}

export interface BusinessEntity {}

export interface EntityAttribute {}

export interface EntityOperation {}

export interface BusinessRelationship {}

export interface BusinessComplexity {}

// Architecture types
export interface PatternViolation {}

// Technical debt types
export interface TechnicalDebtHotspot {}

export interface PayoffStrategy {}

// Bug prediction types
export interface RiskFactor {}

export interface HistoricalBugData {}

export interface BugPattern {}

export interface BugTrend {}

export interface BugPreventionRecommendation {}

// Performance types
export interface EffortPrediction {}

export interface ChangeProneness {}

export interface ChangeFrequency {}

export interface EvolutionaryHotspot {}

export interface PerformanceBottleneck {}

export interface ScalabilityAssessment {}

export interface ScalabilityConcern {}

export interface OptimizationOpportunity {}

// Skill analysis types
export interface Skill {}

export interface SkillGap {}

// Learning types
export interface LearningResource {}

// Common location type
export interface CodeLocation {};
  end: { line: number; column: number; offset?: number };
}
