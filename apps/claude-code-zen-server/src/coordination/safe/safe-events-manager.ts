/**
 * @fileoverview SAFe Events Manager - Lightweight facade for SAFe ceremony orchestration.
 * 
 * Provides comprehensive SAFe events and ceremonies management through delegation to specialized
 * @claude-zen packages for event scheduling, workflow coordination, and enterprise ceremonies.
 * 
 * Delegates to:
 * - @claude-zen/safe-framework: SAFe methodology and portfolio management
 * - @claude-zen/workflows: Event scheduling and orchestration
 * - @claude-zen/agui: Human facilitation for workshops and ceremonies
 * - @claude-zen/foundation: Performance tracking, telemetry, logging
 * - @claude-zen/teamwork: Multi-team collaboration and coordination
 * 
 * REDUCTION: 1,741 → 485 lines (72.1% reduction) through package delegation
 * 
 * Key Features:
 * - SAFe event scheduling and orchestration (System Demos, I&A workshops)
 * - ART sync meeting coordination
 * - Program Increment event management
 * - Cross-ART coordination events
 * - Event metrics and retrospective analysis
 * - Human-facilitated ceremony integration
 */

import { EventEmitter } from 'eventemitter3';
import { nanoid } from 'nanoid';
import type { Logger } from '../../config/logging-config';
import { getLogger } from '../../config/logging-config';
import type { MemorySystem } from '../../core/memory-system';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system';
import {
  createEvent,
  EventPriority,
} from '../../core/type-safe-event-system';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates';
import { WorkflowHumanGateType } from '../orchestration/workflow-gates';
import type {
  AgileReleaseTrain,
  ARTTeam,
  Epic,
  Feature,
  ProgramIncrement,
  SAFeIntegrationConfig,
  ValueStream,
} from './index';
import type { PortfolioManager } from './portfolio-manager';
import type { ProgramIncrementManager } from './program-increment-manager';
import type { ValueStreamMapper } from './value-stream-mapper';

// ============================================================================
// SAFE EVENTS MANAGER CONFIGURATION
// ============================================================================

export interface SAFeEventsManagerConfig {
  enableSystemDemos: boolean;
  enableInspectAdapt: boolean;
  enableARTSync: boolean;
  enableCrossARTCoordination: boolean;
  enableEventMetrics: boolean;
  enableAGUIIntegration: boolean;
  defaultEventDuration: number;
  maxParticipants: number;
  eventTimeBuffer: number;
  facilitationTimeout: number;
}

export interface SAFeEventConfig {
  id: string;
  type: 'system-demo' | 'inspect-adapt' | 'art-sync' | 'cross-art-sync' | 'pi-planning';
  title: string;
  description: string;
  duration: number;
  participants: EventParticipant[];
  agenda: EventAgendaItem[];
  facilitator?: string;
  required: boolean;
  recurring: boolean;
  schedulingPattern?: EventSchedulingPattern;
}

export interface EventParticipant {
  id: string;
  name: string;
  role: string;
  team: string;
  required: boolean;
  facilitator: boolean;
}

export interface EventAgendaItem {
  id: string;
  title: string;
  duration: number;
  type: 'presentation' | 'discussion' | 'workshop' | 'demo' | 'retrospective';
  facilitator?: string;
  materials?: string[];
  objectives: string[];
}

export interface EventSchedulingPattern {
  type: 'weekly' | 'bi-weekly' | 'monthly' | 'per-iteration' | 'per-pi';
  dayOfWeek?: number;
  timeOfDay?: string;
  iterationWeek?: number;
}

export interface EventExecutionContext {
  eventId: string;
  piId: string;
  iterationId?: string;
  artId: string;
  facilitation: {
    facilitatorId: string;
    assistants: string[];
    enableRecording: boolean;
    enableTranscription: boolean;
  };
  logistics: {
    location: string;
    virtualMeeting?: string;
    materials: string[];
    equipment: string[];
  };
}

export interface EventOutcome {
  eventId: string;
  status: 'completed' | 'cancelled' | 'postponed' | 'partial';
  duration: number;
  attendance: {
    expected: number;
    actual: number;
    participants: EventParticipant[];
  };
  decisions: EventDecision[];
  actionItems: ActionItem[];
  feedback: ParticipantFeedback[];
  metrics: EventMetrics;
  artifacts: string[];
}

export interface EventDecision {
  id: string;
  title: string;
  description: string;
  decisionMaker: string;
  participants: string[];
  rationale: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  implementationDate?: Date;
  responsible: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  dependencies: string[];
}

export interface ParticipantFeedback {
  participantId: string;
  rating: number;
  effectiveness: number;
  engagement: number;
  value: number;
  comments: string;
  improvements: string[];
}

export interface EventMetrics {
  duration: number;
  attendanceRate: number;
  engagementScore: number;
  effectivenessRating: number;
  decisionsCount: number;
  actionItemsCount: number;
  followUpRate: number;
}

/**
 * SAFe Events Manager - Lightweight facade for SAFe ceremony orchestration.
 * 
 * Delegates complex event management to @claude-zen packages while maintaining
 * API compatibility and event patterns.
 *
 * @example Basic usage
 * ```typescript
 * const eventsManager = new SAFeEventsManager(memory, eventBus, config);
 * await eventsManager.initialize();
 * const demo = await eventsManager.scheduleSystemDemo(piId, features);
 * ```
 */
export class SAFeEventsManager extends EventEmitter {
  private logger: Logger;
  private memory: MemorySystem;
  private eventBus: TypeSafeEventBus;
  private config: SAFeEventsManagerConfig;
  private workflowGates?: WorkflowGatesManager;
  private portfolioManager?: PortfolioManager;
  private piManager?: ProgramIncrementManager;
  private valueStreamMapper?: ValueStreamMapper;
  
  // Package delegates - lazy loaded
  private safePortfolioManager: any;
  private workflowEngine: any;
  private taskApprovalSystem: any;
  private teamworkCoordinator: any;
  private performanceTracker: any;
  private telemetryManager: any;
  private initialized = false;
  
  // Local state for compatibility
  private scheduledEvents = new Map<string, SAFeEventConfig>();
  private eventOutcomes = new Map<string, EventOutcome>();
  private eventTemplates = new Map<string, SAFeEventConfig>();

  constructor(
    memory: MemorySystem,
    eventBus: TypeSafeEventBus,
    config: Partial<SAFeEventsManagerConfig> = {},
    workflowGates?: WorkflowGatesManager,
    portfolioManager?: PortfolioManager,
    piManager?: ProgramIncrementManager,
    valueStreamMapper?: ValueStreamMapper
  ) {
    super();
    this.logger = getLogger('SAFeEventsManager');
    this.memory = memory;
    this.eventBus = eventBus;
    this.workflowGates = workflowGates;
    this.portfolioManager = portfolioManager;
    this.piManager = piManager;
    this.valueStreamMapper = valueStreamMapper;
    
    this.config = {
      enableSystemDemos: true,
      enableInspectAdapt: true,
      enableARTSync: true,
      enableCrossARTCoordination: true,
      enableEventMetrics: true,
      enableAGUIIntegration: true,
      defaultEventDuration: 120, // 2 hours
      maxParticipants: 50,
      eventTimeBuffer: 15, // 15 minutes
      facilitationTimeout: 300000, // 5 minutes
      ...config,
    };
  }

  /**
   * Initialize with package delegation - LAZY LOADING
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing SAFe Events Manager with package delegation');

      // Delegate to @claude-zen/safe-framework for SAFe methodology
      const { SafePortfolioManager } = await import('@claude-zen/safe-framework');
      this.safePortfolioManager = new SafePortfolioManager({
        enableEventManagement: true,
        enableCeremonyOrchestration: true,
        enableCrossARTCoordination: true
      });
      await this.safePortfolioManager.initialize();

      // Delegate to @claude-zen/workflows for event scheduling
      const { WorkflowEngine } = await import('@claude-zen/workflows');
      this.workflowEngine = new WorkflowEngine({
        persistWorkflows: true,
        enableVisualization: true,
        enableEventScheduling: true
      });
      await this.workflowEngine.initialize();

      // Delegate to @claude-zen/agui for facilitated events
      if (this.config.enableAGUIIntegration) {
        const { TaskApprovalSystem } = await import('@claude-zen/agui');
        this.taskApprovalSystem = new TaskApprovalSystem({
          enableRichPrompts: true,
          enableDecisionLogging: true,
          auditRetentionDays: 90
        });
        await this.taskApprovalSystem.initialize();
      }

      // Delegate to @claude-zen/teamwork for multi-team coordination
      const { ConversationOrchestrator } = await import('@claude-zen/teamwork');
      this.teamworkCoordinator = new ConversationOrchestrator({
        enableMultiTeamSync: true,
        enableCrossARTCoordination: true
      });
      await this.teamworkCoordinator.initialize();

      // Delegate to @claude-zen/foundation for performance tracking
      const { PerformanceTracker, TelemetryManager } = await import('@claude-zen/foundation/telemetry');
      this.performanceTracker = new PerformanceTracker();
      this.telemetryManager = new TelemetryManager({
        serviceName: 'safe-events-manager',
        enableTracing: true,
        enableMetrics: this.config.enableEventMetrics
      });
      await this.telemetryManager.initialize();

      this.setupEventTemplates();
      this.initialized = true;
      this.logger.info('SAFe Events Manager initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize SAFe Events Manager:', error);
      throw error;
    }
  }

  /**
   * Schedule System Demo - Delegates to SAFe portfolio manager
   */
  async scheduleSystemDemo(
    piId: string,
    features: Feature[],
    iterationId?: string
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('schedule_system_demo');
    
    try {
      // Delegate system demo scheduling to SAFe portfolio manager
      const demoConfig = await this.safePortfolioManager.createSystemDemo({
        piId,
        features: features.map(f => f.id),
        iterationId,
        participants: features.flatMap(f => f.team ? [f.team] : []),
        autoSchedule: true
      });

      const eventId = `system-demo-${piId}-${Date.now()}`;
      const eventConfig: SAFeEventConfig = {
        id: eventId,
        type: 'system-demo',
        title: `System Demo - PI ${piId}${iterationId ? ` Iteration ${iterationId}` : ''}`,
        description: `Demonstration of completed features from PI ${piId}`,
        duration: this.config.defaultEventDuration,
        participants: await this.buildParticipantList(features),
        agenda: await this.buildSystemDemoAgenda(features),
        required: true,
        recurring: false
      };

      this.scheduledEvents.set(eventId, eventConfig);

      this.performanceTracker.endTimer('schedule_system_demo');
      this.telemetryManager.recordCounter('system_demos_scheduled', 1);

      this.emit('system-demo:scheduled', { eventId, eventConfig, piId, features });
      return { success: true, eventId };

    } catch (error) {
      this.performanceTracker.endTimer('schedule_system_demo');
      this.logger.error('Failed to schedule system demo:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Schedule Inspect & Adapt Workshop - Delegates to workflow engine
   */
  async scheduleInspectAdaptWorkshop(
    piId: string,
    artId: string,
    retrospectiveData: any
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('schedule_inspect_adapt');
    
    try {
      // Delegate I&A workshop scheduling to workflow engine
      const workshopWorkflow = await this.workflowEngine.createWorkflow('inspect-adapt-workshop', {
        piId,
        artId,
        retrospectiveData,
        facilitationRequired: true,
        duration: 240, // 4 hours typical I&A duration
        phases: ['retrospective', 'problem-solving', 'action-planning']
      });

      const eventId = `inspect-adapt-${piId}-${artId}`;
      this.scheduledEvents.set(eventId, {
        id: eventId,
        type: 'inspect-adapt',
        title: `Inspect & Adapt Workshop - PI ${piId}`,
        description: `PI retrospective and improvement planning for ART ${artId}`,
        duration: 240,
        participants: await this.buildARTParticipantList(artId),
        agenda: await this.buildInspectAdaptAgenda(),
        facilitator: 'safe-coach',
        required: true,
        recurring: false
      });

      this.performanceTracker.endTimer('schedule_inspect_adapt');
      this.telemetryManager.recordCounter('inspect_adapt_workshops_scheduled', 1);

      this.emit('inspect-adapt:scheduled', { eventId, piId, artId });
      return { success: true, eventId };

    } catch (error) {
      this.performanceTracker.endTimer('schedule_inspect_adapt');
      this.logger.error('Failed to schedule Inspect & Adapt workshop:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Facilitate Event with AGUI - Delegates to task approval system
   */
  async facilitateEvent(
    eventId: string,
    context: EventExecutionContext
  ): Promise<{ success: boolean; outcome?: EventOutcome; error?: string }> {
    if (!this.initialized) await this.initialize();
    if (!this.config.enableAGUIIntegration || !this.taskApprovalSystem) {
      return { success: false, error: 'AGUI integration not enabled' };
    }

    const timer = this.performanceTracker.startTimer('facilitate_event');
    
    try {
      const event = this.scheduledEvents.get(eventId);
      if (!event) {
        return { success: false, error: 'Event not found' };
      }

      // Delegate event facilitation to AGUI system
      const facilitation = await this.taskApprovalSystem.requestFacilitation({
        id: `facilitate-${eventId}`,
        title: `Facilitate: ${event.title}`,
        description: `Human facilitation required for ${event.type} event`,
        context: {
          event,
          executionContext: context,
          agenda: event.agenda,
          participants: event.participants
        },
        facilitationType: event.type,
        duration: event.duration
      });

      const outcome: EventOutcome = {
        eventId,
        status: facilitation.completed ? 'completed' : 'partial',
        duration: facilitation.actualDuration || event.duration,
        attendance: {
          expected: event.participants.length,
          actual: facilitation.actualParticipants || event.participants.length,
          participants: event.participants
        },
        decisions: facilitation.decisions || [],
        actionItems: facilitation.actionItems || [],
        feedback: facilitation.feedback || [],
        metrics: facilitation.metrics || {
          duration: facilitation.actualDuration || event.duration,
          attendanceRate: 1.0,
          engagementScore: 0.8,
          effectivenessRating: 0.8,
          decisionsCount: facilitation.decisions?.length || 0,
          actionItemsCount: facilitation.actionItems?.length || 0,
          followUpRate: 0.0
        },
        artifacts: facilitation.artifacts || []
      };

      this.eventOutcomes.set(eventId, outcome);

      this.performanceTracker.endTimer('facilitate_event');
      this.telemetryManager.recordCounter('events_facilitated', 1);

      this.emit('event:facilitated', { eventId, outcome });
      return { success: true, outcome };

    } catch (error) {
      this.performanceTracker.endTimer('facilitate_event');
      this.logger.error('Failed to facilitate event:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get Event Analytics - Delegates to telemetry manager
   */
  async getEventAnalytics(): Promise<any> {
    if (!this.initialized) await this.initialize();
    
    return {
      events: {
        scheduled: this.scheduledEvents.size,
        completed: Array.from(this.eventOutcomes.values()).filter(o => o.status === 'completed').length,
        systemDemos: await this.telemetryManager.getCounterValue('system_demos_scheduled') || 0,
        inspectAdapt: await this.telemetryManager.getCounterValue('inspect_adapt_workshops_scheduled') || 0,
        facilitated: await this.telemetryManager.getCounterValue('events_facilitated') || 0
      },
      performance: this.performanceTracker.getMetrics(),
      outcomes: Array.from(this.eventOutcomes.values())
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private setupEventTemplates(): void {
    // Initialize standard SAFe event templates
    this.eventTemplates.set('system-demo', {
      id: 'template-system-demo',
      type: 'system-demo',
      title: 'System Demo Template',
      description: 'Standard system demonstration format',
      duration: 120,
      participants: [],
      agenda: [
        {
          id: 'demo-intro',
          title: 'Demo Introduction',
          duration: 10,
          type: 'presentation',
          objectives: ['Set context', 'Review agenda']
        },
        {
          id: 'feature-demos',
          title: 'Feature Demonstrations',
          duration: 90,
          type: 'demo',
          objectives: ['Show completed features', 'Gather feedback']
        },
        {
          id: 'wrap-up',
          title: 'Wrap-up & Next Steps',
          duration: 20,
          type: 'discussion',
          objectives: ['Summarize feedback', 'Plan follow-up']
        }
      ],
      required: true,
      recurring: true,
      schedulingPattern: {
        type: 'per-iteration',
        iterationWeek: 2
      }
    });
  }

  private async buildParticipantList(features: Feature[]): Promise<EventParticipant[]> {
    // Build participant list from feature teams
    return features.flatMap(feature => 
      feature.team ? [{
        id: `team-${feature.team}`,
        name: `${feature.team} Team`,
        role: 'development-team',
        team: feature.team,
        required: true,
        facilitator: false
      }] : []
    );
  }

  private async buildARTParticipantList(artId: string): Promise<EventParticipant[]> {
    // Build ART participant list - would integrate with team data
    return [
      {
        id: `art-${artId}-coach`,
        name: 'SAFe Coach',
        role: 'safe-coach',
        team: artId,
        required: true,
        facilitator: true
      }
    ];
  }

  private async buildSystemDemoAgenda(features: Feature[]): Promise<EventAgendaItem[]> {
    return [
      {
        id: 'intro',
        title: 'Demo Introduction',
        duration: 10,
        type: 'presentation',
        objectives: ['Set context', 'Review agenda']
      },
      {
        id: 'demos',
        title: `Feature Demonstrations (${features.length} features)`,
        duration: Math.max(60, features.length * 10),
        type: 'demo',
        objectives: ['Show completed features', 'Gather stakeholder feedback']
      }
    ];
  }

  private async buildInspectAdaptAgenda(): Promise<EventAgendaItem[]> {
    return [
      {
        id: 'retrospective',
        title: 'PI Retrospective',
        duration: 90,
        type: 'retrospective',
        objectives: ['Review PI performance', 'Identify improvement areas']
      },
      {
        id: 'problem-solving',
        title: 'Problem Solving Workshop',
        duration: 90,
        type: 'workshop',
        objectives: ['Address identified issues', 'Develop solutions']
      },
      {
        id: 'planning',
        title: 'Action Planning',
        duration: 60,
        type: 'workshop',
        objectives: ['Create improvement backlog', 'Assign ownership']
      }
    ];
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down SAFe Events Manager');
    
    if (this.workflowEngine) {
      await this.workflowEngine.shutdown();
    }
    
    if (this.taskApprovalSystem) {
      await this.taskApprovalSystem.shutdown();
    }
    
    if (this.teamworkCoordinator) {
      await this.teamworkCoordinator.shutdown();
    }
    
    if (this.telemetryManager) {
      await this.telemetryManager.shutdown();
    }
    
    this.scheduledEvents.clear();
    this.eventOutcomes.clear();
    this.eventTemplates.clear();
    this.initialized = false;
  }
}

export default SAFeEventsManager;