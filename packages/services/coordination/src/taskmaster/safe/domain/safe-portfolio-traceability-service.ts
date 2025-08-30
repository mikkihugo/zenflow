/**
 * @fileoverview SAFe Portfolio Traceability Service - TaskMaster Domain Integration
 *
 * Re-exports the main SafePortfolioTraceabilityService for use within the
 * TaskMaster domain. This maintains consistency while providing domain-specific
 * integration patterns.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

// Re-export the main implementation
export {
  SafePortfolioTraceabilityService as default,
  SafePortfolioTraceabilityService,
} from '../../../services/safe-portfolio-traceability-service.js';

// Re-export types for convenience
export type {
  StrategicThemeContext,
  EpicGenerationContext,
  EpicTraceabilityRecord,
  ApprovalRecord,
  LearningOutcome,
} from '../../../services/safe-portfolio-traceability-service.js';

/**
 * TaskMaster-specific configuration for SAFe Portfolio Traceability
 */
export interface TaskMasterSafeConfig {
  readonly enableAutoEpicGeneration: boolean;
  readonly requireHumanApproval: boolean;
  readonly wsjfThreshold: number;
  readonly maxConcurrentEpics: number;
  readonly aiConfidenceThreshold: number;
}

/**
 * TaskMaster integration utilities for SAFe Portfolio Traceability
 */
export class TaskMasterSafeIntegration {
  /**
   * Create TaskMaster-optimized configuration
   */
  static createConfig(): TaskMasterSafeConfig {
    return {
      enableAutoEpicGeneration: true,
      requireHumanApproval: true,
      wsjfThreshold: 5.0,
      maxConcurrentEpics: 25,
      aiConfidenceThreshold: 0.8,
    };
  }

  /**
   * Validate epic context for TaskMaster workflow
   */
  static validateEpicContext(context: any): boolean {
    return !!(
      context.strategic?.themeId &&
      context.business?.problemStatement &&
      context.technical?.complexityAssessment
    );
  }
}
