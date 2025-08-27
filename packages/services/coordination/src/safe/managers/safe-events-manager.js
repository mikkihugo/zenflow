/**
 * @fileoverview SAFe Events Manager - Comprehensive SAFe ceremony orchestration.
 *
 * Provides enterprise-grade SAFe events and ceremonies management through specialized
 * event scheduling, workflow coordination, and human-facilitated ceremonies.
 *
 * Key Features:
 * - SAFe event scheduling and orchestration (System Demos, I&A workshops)
 * - ART sync meeting coordination
 * - Program Increment event management
 * - Cross-ART coordination events
 * - Event metrics and retrospective analysis
 * - Human-facilitated ceremony integration
 *
 * Part of the @claude-zen/safe-framework package providing comprehensive
 * Scaled Agile Framework (SAFe) integration capabilities.
 */
import { EventBus } from '@claude-zen/foundation';
import { createEvent, EventPriority, getLogger } from '../types';
 || pi - planning;
title: string;
description: string;
duration: number;
participants: EventParticipant[];
agenda: EventAgendaItem[];
facilitator ?  : string;
required: boolean;
recurring: boolean;
schedulingPattern ?  : EventSchedulingPattern;
 || per - pi;
dayOfWeek ?  : number;
timeOfDay ?  : string;
iterationWeek ?  : number;
/**
 * SAFe Events Manager - Comprehensive SAFe ceremony orchestration.
 *
 * Manages all SAFe events and ceremonies including System Demos, Inspect & Adapt
 * workshops, ART synchronization meetings, and cross-ART coordination events.
 *
 * @example Basic usage
 * ```typescript`
 * const eventsManager = new SAFeEventsManager(memory, eventBus, config);
 * await eventsManager.initialize();
 * const demo = await eventsManager.scheduleSystemDemo(piId, features);
 * ````
 */
export class SAFeEventsManager extends EventBus {
    logger;
    memory;
    eventBus;
    // Internal state
    scheduledEvents = new Map();
    eventOutcomes = new Map();
    eventTemplates = new Map();
    initialized = false;
    constructor(_memory, eventBus, config = {}) {
        super();
        this.logger = getLogger('SAFeEventsManager');
        ';
        this.memory = memory;
        this.eventBus = eventBus;
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
     * Initialize the SAFe Events Manager
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            this.logger.info('Initializing SAFe Events Manager');
            ';
            // Setup templates synchronously
            this.setupEventTemplates();
            // In production, this would initialize external event bus connections
            await this.initializeEventBusConnections();
            // Emit initialization event
            this.eventBus.emit('safe-events:initialized', createEvent('safe-events:initialized', { timestamp: Date.now() }, EventPriority.NORMAL));
            this.initialized = true;
            this.logger.info('SAFe Events Manager initialized successfully');
            ';
        }
        catch (error) {
            this.logger.error('Failed to initialize SAFe Events Manager:', error);
            ';
            throw error;
        }
    }
    /**
     * Schedule System Demo
     */
    async scheduleSystemDemo(piId, features, iterationId) {
        if (!this.initialized)
            await this.initialize();
        try {
            const eventId = `system-demo-${piId}-${Date.now()}`;
            `
      const eventConfig: SAFeEventConfig = {
        id: eventId,
        type: 'system-demo',
        title: `;
            System;
            Demo - PI;
            $piId$iterationId ? ` Iteration ${iterationId}` : '' `,`;
            description: `Demonstration of completed features from PI ${piId}`, `
        duration: this.config.defaultEventDuration,
        participants: await this.buildParticipantList(features),
        agenda: await this.buildSystemDemoAgenda(features),
        required: true,
        recurring: false,
      };

      this.scheduledEvents.set(eventId, eventConfig);

      // Store in memory for persistence
      await this.memory.store(
        `;
            safe - events;
            system - demo;
            $eventId `,`;
            eventConfig;
            ;
            this.emit('system-demo:scheduled', { ': eventId,
                eventConfig,
                piId,
                features,
            });
            this.eventBus.emit('safe-events:system-demo:scheduled', createEvent('safe-events:system-demo:scheduled', { ': eventId,
                piId,
                featuresCount: features.length,
            }));
            return { success: true, eventId };
        }
        catch (error) {
            this.logger.error('Failed to schedule system demo:', error);
            ';
            return { success: false, error: error.message };
        }
    }
    /**
     * Schedule Inspect & Adapt Workshop
     */
    async scheduleInspectAdaptWorkshop(piId, artId, _retrospectiveData) {
        if (!this.initialized)
            await this.initialize();
        try {
            const eventId = `inspect-adapt-${piId}-${artId}`;
            `
      const eventConfig: SAFeEventConfig = {
        id: eventId,
        type: 'inspect-adapt',
        title: `;
            Inspect & Adapt;
            Workshop - PI;
            $piId `,`;
            description: `PI retrospective and improvement planning for ART ${artId}`, `
        duration: 240, // 4 hours typical I&A duration
        participants: await this.buildARTParticipantList(artId),
        agenda: await this.buildInspectAdaptAgenda(),
        facilitator: 'safe-coach',
        required: true,
        recurring: false,
      };

      this.scheduledEvents.set(eventId, eventConfig);
      await this.memory.store(
        `;
            safe - events;
            inspect - adapt;
            $eventId `,`;
            eventConfig;
            ;
            this.emit('inspect-adapt:scheduled', { eventId, piId, artId });
            ';
            this.eventBus.emit('safe-events:inspect-adapt:scheduled', createEvent('safe-events:inspect-adapt:scheduled', ', eventId, piId, artId));
            return { success: true, eventId };
        }
        catch (error) {
            this.logger.error('Failed to schedule Inspect & Adapt workshop:', error);
            ';
            return { success: false, error: error.message };
        }
    }
    /**
     * Execute event with outcomes tracking
     */
    async executeEvent(eventId, _context) {
        if (!this.initialized)
            await this.initialize();
        try {
            const event = this.scheduledEvents.get(eventId);
            if (!event) {
                return { success: false, error: 'Event not found' };
                ';
            }
            const outcome = {
                eventId,
                status: 'completed',
                duration: event.duration,
                attendance: {
                    expected: event.participants.length,
                    actual: event.participants.length, // Would be updated with actual attendance
                    participants: event.participants,
                },
                decisions: [],
                actionItems: [],
                feedback: [],
                metrics: {
                    duration: event.duration,
                    attendanceRate: 1.0,
                    engagementScore: 0.8,
                    effectivenessRating: 0.8,
                    decisionsCount: 0,
                    actionItemsCount: 0,
                    followUpRate: 0.0,
                },
                artifacts: [],
            };
            this.eventOutcomes.set(eventId, outcome);
            await this.memory.store(`safe-events:outcome:${eventId}`, outcome);
            `

      this.emit('event:executed', { eventId, outcome });'
      this.eventBus.emit(
        'safe-events:event:executed',
        createEvent('safe-events:event:executed', {'
          eventId,
          status: outcome.status,
        })
      );

      return { success: true, outcome };
    } catch (error) {
      this.logger.error('Failed to execute event:', error);'
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get event analytics and metrics
   */
  async getEventAnalytics(): Promise<any> {
    if (!this.initialized) await this.initialize();

    return {
      events: {
        scheduled: this.scheduledEvents.size,
        completed: Array.from(this.eventOutcomes.values()).filter(
          (o) => o.status === 'completed''
        ).length,
        systemDemos: Array.from(this.scheduledEvents.values()).filter(
          (e) => e.type === 'system-demo''
        ).length,
        inspectAdapt: Array.from(this.scheduledEvents.values()).filter(
          (e) => e.type === 'inspect-adapt').length,
      },
      outcomes: Array.from(this.eventOutcomes.values()),
      templates: Array.from(this.eventTemplates.keys()),
    };
  }

  /**
   * Get scheduled event by ID
   */
  getScheduledEvent(eventId: string): SAFeEventConfig|undefined {
    return this.scheduledEvents.get(eventId);
  }

  /**
   * Get event outcome by ID
   */
  getEventOutcome(eventId: string): EventOutcome|undefined {
    return this.eventOutcomes.get(eventId);
  }

  /**
   * Get all scheduled events
   */
  getAllScheduledEvents(): SAFeEventConfig[] {
    return Array.from(this.scheduledEvents.values())();
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private setupEventTemplates(): void {
    // Initialize standard SAFe event templates
    this.eventTemplates.set('system-demo', {'
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
          objectives: ['Set context', 'Review agenda'],
        },
        {
          id: 'feature-demos',
          title: 'Feature Demonstrations',
          duration: 90,
          type: 'demo',
          objectives: ['Show completed features', 'Gather feedback'],
        },
        {
          id: 'wrap-up',
          title: 'Wrap-up & Next Steps',
          duration: 20,
          type: 'discussion',
          objectives: ['Summarize feedback', 'Plan follow-up'],
        },
      ],
      required: true,
      recurring: true,
      schedulingPattern: {
        type: 'per-iteration',
        iterationWeek: 2,
      },
    });

    this.eventTemplates.set('inspect-adapt', {'
      id: 'template-inspect-adapt',
      type: 'inspect-adapt',
      title: 'Inspect & Adapt Workshop Template',
      description: 'Standard I&A workshop format',
      duration: 240,
      participants: [],
      agenda: [
        {
          id: 'retrospective',
          title: 'PI Retrospective',
          duration: 90,
          type: 'retrospective',
          objectives: ['Review PI performance', 'Identify improvement areas'],
        },
        {
          id: 'problem-solving',
          title: 'Problem Solving Workshop',
          duration: 90,
          type: 'workshop',
          objectives: ['Address identified issues', 'Develop solutions'],
        },
        {
          id: 'planning',
          title: 'Action Planning',
          duration: 60,
          type: 'workshop',
          objectives: ['Create improvement backlog', 'Assign ownership'],
        },
      ],
      required: true,
      recurring: true,
      schedulingPattern: {
        type: 'per-pi',
      },
    });
  }

  private buildParticipantList(features: Feature[]): EventParticipant[] {
    // Build participant list from feature teams
    const uniqueTeams = new Set(features.map((f) => f.team).filter(Boolean));
    return Array.from(uniqueTeams).map((team) => ({
      id: `;
            team - $team `,`;
            name: `${team} Team`, `
      role: 'development-team',
      team: team!,
      required: true,
      facilitator: false,
    }));
  }

  private buildARTParticipantList(artId: string): EventParticipant[] {
    // Build ART participant list
    return [
      {
        id: `;
            art - $artId - coach `,`;
            name: 'SAFe Coach',
                role;
            'safe-coach',
                team;
            artId,
                required;
            true,
                facilitator;
            true,
            ;
        }
        finally { }
        id: `art-${artId}-rte`, `
        name: 'Release Train Engineer',
        role: 'rte',
        team: artId,
        required: true,
        facilitator: false,
      },
    ];
  }

  private buildSystemDemoAgenda(features: Feature[]): EventAgendaItem[] {
    return [
      {
        id: 'intro',
        title: 'Demo Introduction',
        duration: 10,
        type: 'presentation',
        objectives: ['Set context', 'Review agenda'],
      },
      {
        id: 'demos',
        title: `;
        Feature;
        Demonstrations($, { features, : .length }, features) `,`;
        duration: Math.max(60, features.length * 10),
            type;
        'demo',
            objectives;
        ['Show completed features', 'Gather stakeholder feedback'], ,
            id;
        'wrap-up',
            title;
        'Wrap-up & Feedback',
            duration;
        20,
            type;
        'discussion',
            objectives;
        ['Collect feedback', 'Plan next iteration'], ,
        ;
        ;
    }
    /**
     * Initialize event bus connections for production
     */
    async initializeEventBusConnections() {
        // In production, this would establish connections to:
        // - Message queues (Redis, RabbitMQ)
        // - Event streams (Kafka, EventBridge)
        // - Database event listeners
        // Mock async operation for now
        await new Promise((resolve) => setTimeout(resolve, 10));
        this.logger.debug('Event bus connections initialized');
        ';
    }
    /**
     * Cleanup resources
     */
    shutdown() {
        this.logger.info('Shutting down SAFe Events Manager');
        ';
        this.scheduledEvents.clear();
        this.eventOutcomes.clear();
        this.eventTemplates.clear();
        this.initialized = false;
        this.eventBus.emit('safe-events:shutdown', createEvent('safe-events:shutdown', { timestamp: Date.now() }), ');
    }
}
export default SAFeEventsManager;
