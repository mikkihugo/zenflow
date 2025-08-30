/**
 * @fileoverview Value Stream Mapper - SAFe value stream mapping and optimization facade.
 *
 * Provides comprehensive value stream mapping with bottleneck detection through delegation
 * to specialized services for mapping optimization and workflow integration.
 *
 * Delegates to: * - ValueStreamMappingService: Core mapping and workflow-to-value-stream conversion
 * - @claude-zen/brain: BrainCoordinator for intelligent mapping optimization
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for process coordination
 * - @claude-zen/agui: Human-in-loop approvals for critical mapping decisions
 *
 * REDUCTION: 1,062 → 448 lines (58% reduction) through service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { EventBus } from '@claude-zen/foundation';
import type { ValueStream } from '../types';
export type {
  BusinessContext,
  MappingValidationIssue,
  MappingValidationResult,
  StakeholderContext,
  TechnicalContext,
  ValueStreamCreationContext,
  ValueStreamMappingConfig,
  WorkflowStepMapping,
  WorkflowValueStreamMapping,
} from '../services/value-stream/value-stream-mapping-service';
/**
 * Value Stream Mapper state
 */
export interface ValueStreamMapperState {
  valueStreams: Map<string, ValueStream>;
  flowAnalyses: Map<string, any>;
  bottlenecks: Map<string, any[]>;
  optimizationRecommendations: Map<string, any[]>;
  valueDeliveryTracking: Map<string, any>;
  continuousImprovements: any[];
  lastAnalysis: Date;
  lastOptimization: Date;
}
/**
 * Value Stream Mapper - SAFe value stream mapping and optimization facade
 *
 * Provides comprehensive value stream mapping with intelligent workflow-to-value-stream conversion,
 * multi-level orchestration integration, and AI-powered mapping optimization through service delegation.
 */
export declare class ValueStreamMapper extends EventBus {
  private readonly logger;
  private state;
}
export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}
export default ValueStreamMapper;
//# sourceMappingURL=value-stream-mapper.d.ts.map
