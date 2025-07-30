/**
 * Swarm System Types;
 * Enhanced swarm orchestration with neural integration and advanced coordination;
 */

import type { Identifiable, JSONObject, TypedEventEmitter, UUID } from './core.js';

// =============================================================================
// SWARM CORE TYPES
// =============================================================================

export type SwarmTopology = 'mesh';
| 'hierarchical'
| 'ring'
| 'star'
| 'tree'
| 'hybrid'
| 'adaptive'
export type SwarmStrategy = 'parallel';
| 'sequential'
| 'adaptive'
| 'specialized'
| 'consensus'
| 'competitive'
export type SwarmMode = 'ephemeral' | 'persistent' | 'hybrid' | 'auto-scaling' | 'on-demand';
export type SwarmStatus = 'initializing';
| 'active'
| 'busy'
| 'scaling'
| 'degraded'
| 'stopping'
| 'stopped'
| 'error'
export interface SwarmConfig {
  // Basic configurationname = ============================================================================
// SWARM OBJECTIVE & TASKS
// =============================================================================

export interface SwarmObjective extends Identifiable {name = ============================================================================
// SWARM AGENTS
// =============================================================================

export interface SwarmAgent extends Identifiable {name = ============================================================================
// SWARM TASKS
// =============================================================================

export interface SwarmTask extends Identifiable {type = ============================================================================
// SWARM COORDINATION
// =============================================================================

export interface SwarmCoordinator extends Identifiable {type = ============================================================================
// SWARM PROGRESS & RESULTS
// =============================================================================

export interface SwarmProgress {totalTasks = ============================================================================
// SWARM METRICS
// =============================================================================

export interface SwarmMetrics {
  // Performance metricsthroughput = ============================================================================
// SWARM EVENTS
// =============================================================================

export interface SwarmEvents {
  // Lifecycle events
  'swarm-created': (swarm = > void;
  'swarm-started');
: (swarmId = > void
('agent-left')
: (swarmId = > void
('agent-assigned')
: (swarmId = > void
('agent-completed')
: (swarmId = > void
('agent-failed')
: (swarmId = > void
// Task events
('task-created')
: (swarmId = > void
('task-queued')
: (swarmId = > void
('task-scheduled')
: (swarmId = > void
('task-started')
: (swarmId = > void
('task-progress')
: (swarmId = > void
('task-completed')
: (swarmId = > void
('task-failed')
: (swarmId = > void
('task-timeout')
: (swarmId = > void
('task-cancelled')
: (swarmId = > void
// Coordination events
('coordination-started')
: (swarmId = > void
('coordination-changed')
: (swarmId = > void
('bottleneck-detected')
: (swarmId = > void
('optimization-triggered')
: (swarmId = > void
('scaling-triggered')
: (swarmId = > void
// Quality events
('quality-check')
: (swarmId = > void
('review-completed')
: (swarmId = > void
('test-completed')
: (swarmId = > void
// Performance events
('milestone-reached')
: (swarmId = > void
('performance-warning')
: (swarmId = > void
('resource-exhausted')
: (swarmId = > void
('sla-violated')
: (swarmId = > void
// Learning events
('pattern-discovered')
: (swarmId = > void
('knowledge-shared')
: (swarmId = > void
('adaptation-triggered')
: (swarmId = > void
('improvement-identified')
: (swarmId = > void
[event = > void
// }
// =============================================================================
// SWARM INTERFACE
// =============================================================================

export interface Swarm extends TypedEventEmitter<SwarmEvents>, Identifiable {
  // Configuration and metadata
  readonlyconfig = ============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface SwarmIdentity {
  // id: UUID
  // name: string
  // type: string
  // version: string
  // createdAt: Date
  // creator: string
// }
export interface CoordinationRequest {
  type: 'task_assignment' | 'resource_allocation' | 'conflict_resolution' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  // context: JSONObject
  // constraints: JSONObject
  // preferences: JSONObject
// }
export interface CoordinationResponse {
  // success: boolean
  // action: JSONObject
  // reasoning: string
  confidence: number, // 0-1
  alternatives;
  // metadata: JSONObject
// }
export interface Conflict {
  type: 'resource' | 'dependency' | 'priority' | 'constraint' | 'goal';
  // description: string
  parties;
  severity: 'low' | 'medium' | 'high' | 'critical';
  // context: JSONObject
  // constraints: JSONObject
// }
export interface Resolution {
  // approach: string
  actions;
  // rationale: string
  // impact: JSONObject
  satisfaction: Record<UUID, number>; // 0-1 satisfaction per party
  durability: number, // 0-1 expected persistence
// }
export interface SwarmHealthStatus {
  overall: 'healthy' | 'degraded' | 'critical' | 'failed';
  components: {
    // agents: ComponentHealth
    // coordination: ComponentHealth
    // resources: ComponentHealth
    // tasks: ComponentHealth
    // communication: ComponentHealth
  };
  issues;
  recommendations;
  trends;
// }
export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical' | 'failed';
  score: number, // 0-1
  // metrics: JSONObject
  // lastCheck: Date
// }
export interface HealthIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  // component: string
  // description: string
  // impact: string
  resolution;
  estimated_resolution_time: number, // minutes
// }
export interface HealthTrend {
  // metric: string
  direction: 'improving' | 'stable' | 'degrading';
  rate: number, // percentage change
  confidence: number, // 0-1
  // projection: number
// }
export interface OptimizationResult {
  improvements;
  // changes: JSONObject
  // expected_impact: JSONObject
  confidence: number, // 0-1
  implementation_time: number, // minutes
  // reversible: boolean
// }
export interface LearningOutcome {
  type: 'pattern' | 'strategy' | 'best_practice' | 'anti_pattern' | 'optimization';
  // description: string
  evidence;
  confidence: number, // 0-1
  applicability;
  transferability: number, // 0-1
// }
export interface SwarmReport {
  type: 'progress' | 'performance' | 'quality' | 'comprehensive';
  // swarmId: UUID
  // generatedAt: Date
  period: {
    // start: Date
    // end: Date
  };
  // summary: JSONObject
  // details: JSONObject
  // metrics: JSONObject
  recommendations;
  charts;
  appendices;
// }
export interface Chart {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  // title: string
  // data: JSONObject
  // options: JSONObject
// }
export interface ValidationResult {
  // valid: boolean
  errors;
  warnings;
  suggestions;
// }

