/**
 * @file Event Registry Initializer - Sets up and initializes the dynamic event registry
 *
 * Initializes the event registry system with active modules and provides
 * event data for dashboard visualization components.
 */

import { getLogger } from '../core/logging/logging.service';

const logger = getLogger('event-registry-initializer');

export interface ActiveModule {
  id: string;
  name: string;
  type:
    | 'sparc'
    | 'brain'
    | 'dspy'
    | 'teamwork'
    | 'llm'
    | 'git'
    | 'system'
    | ' safe'
    | 'claude-code';
  status: 'active' | 'idle' | 'error' | 'disconnected';
  lastSeen: Date;
  eventCount: number;
  events: string[];
  metadata: {
    version?: string;
    description?: string;
    uptime: number;
    memoryUsage?: number;
  };
}

export interface EventFlow {
  id: string;
  eventName: string;
  source: string;
  target: string;
  timestamp: Date;
  latency: number;
  success: boolean;
}

export interface EventMetrics {
  totalEvents: number;
  eventsPerSecond: number;
  averageLatency: number;
  errorRate: number;
  activeModules: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

export class EventRegistryInitializer {
  private activeModules: ActiveModule[] = [];
  private eventFlows: EventFlow[] = [];
  private eventMetrics: EventMetrics = {
    totalEvents: 0,
    eventsPerSecond: 0,
    averageLatency: 0,
    errorRate: 0,
    activeModules: 0,
    systemHealth: 'healthy',
  };
  private intervalId: NodeJS.Timeout | null = null;
  private broadcastCallback: ((type: string, data: unknown) => void) | null =
    null;

  constructor() {
    this.initializeModules();
  }

  /**
   * Set broadcast callback for external systems (like WebSocket)
   */
  setBroadcastCallback(callback: (type: string, data: unknown) => void): void {
    this.broadcastCallback = callback;
  }

  /**
   * Initialize the event registry with active modules
   */
  private initializeModules(): void {
    logger.info('Initializing event registry with active modules...');

    this.activeModules = [
      {
        id: 'sparc-manager-001',
        name: 'SPARC Manager',
        type: 'sparc',
        status: 'active',
        lastSeen: new Date(),
        eventCount: 156,
        events: [
          'sparc:phase-review-needed',
          'sparc:phase-complete',
          'sparc:project-complete',
        ],
        metadata: {
          version: '1.2.0',
          description: '5-phase systematic development methodology',
          uptime: Date.now(),
          memoryUsage: 45.2,
        },
      },
      {
        id: 'brain-system-001',
        name: 'Brain System',
        type: 'brain',
        status: 'active',
        lastSeen: new Date(),
        eventCount: 89,
        events: [
          'brain:predict-request',
          'brain:prediction-complete',
          'brain:learning-update',
        ],
        metadata: {
          version: '2.1.0',
          description: 'Neural ML coordination and optimization',
          uptime: Date.now(),
          memoryUsage: 78.9,
        },
      },
      {
        id: 'dspy-engine-001',
        name: 'DSPy Engine',
        type: 'dspy',
        status: 'active',
        lastSeen: new Date(),
        eventCount: 34,
        events: [
          'dspy:optimize-request',
          'dspy:optimization-complete',
          'dspy:llm-request',
        ],
        metadata: {
          version: '1.5.2',
          description: 'Prompt optimization and improvement',
          uptime: Date.now(),
          memoryUsage: 62.1,
        },
      },
      {
        id: 'llm-provider-001',
        name: 'LLM Provider',
        type: 'llm',
        status: 'active',
        lastSeen: new Date(),
        eventCount: 234,
        events: [
          'llm:inference-request',
          'llm:inference-complete',
          'llm:inference-failed',
        ],
        metadata: {
          version: '3.0.1',
          description: 'Multi-provider LLM integration',
          uptime: Date.now(),
          memoryUsage: 91.5,
        },
      },
      {
        id: 'teamwork-manager-001',
        name: 'Teamwork Manager',
        type: 'teamwork',
        status: 'idle',
        lastSeen: new Date(Date.now() - 45000),
        eventCount: 12,
        events: ['teamwork:review-acknowledged', 'teamwork:review-complete'],
        metadata: {
          version: '1.0.8',
          description: 'Multi-agent collaboration system',
          uptime: Date.now(),
          memoryUsage: 23.4,
        },
      },
      {
        id: 'git-operations-001',
        name: 'Git Operations',
        type: 'git',
        status: 'active',
        lastSeen: new Date(),
        eventCount: 67,
        events: [
          'git:operation:started',
          'git:operation:completed',
          'git:conflict:resolved',
        ],
        metadata: {
          version: '2.3.1',
          description: 'Git repository management and operations',
          uptime: Date.now(),
          memoryUsage: 15.7,
        },
      },
      {
        id: 'claude-code-001',
        name: 'Claude Code',
        type: 'claude-code',
        status: 'active',
        lastSeen: new Date(),
        eventCount: 45,
        events: [
          'claude-code:execute-task',
          'claude-code:task-complete',
          'claude-code:task-failed',
        ],
        metadata: {
          version: '4.2.1',
          description: 'AI-powered code implementation tool',
          uptime: Date.now(),
          memoryUsage: 67.8,
        },
      },
    ];

    this.eventMetrics.activeModules = this.activeModules.length;
    this.eventMetrics.totalEvents = this.activeModules.reduce(
      (total, module) => total + module.eventCount,
      0
    );

    logger.info(`Initialized ${this.activeModules.length} active modules`);
  }

  /**
   * Start the event registry and begin broadcasting data
   */
  start(): void {
    logger.info('Starting event registry broadcasting...');

    // Start periodic updates
    this.intervalId = setInterval(() => {
      this.generateEventData();
      this.broadcastUpdates();
    }, 2000);

    logger.info('Event registry broadcasting started');
  }

  /**
   * Stop the event registry
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.info('Event registry broadcasting stopped');
  }

  /**
   * Get current module list
   */
  getActiveModules(): ActiveModule[] {
    return this.activeModules;
  }

  /**
   * Get current event flows
   */
  getEventFlows(): EventFlow[] {
    return this.eventFlows;
  }

  /**
   * Get current event metrics
   */
  getEventMetrics(): EventMetrics {
    return this.eventMetrics;
  }

  /**
   * Generate new event data (simulated for demonstration)
   */
  private generateEventData(): void {
    // Update module metrics
    this.activeModules = this.activeModules.map((module) => ({
      ...module,
      eventCount: module.eventCount + Math.floor(Math.random() * 3),
      lastSeen: module.status === 'active' ? new Date() : module.lastSeen,
      metadata: {
        ...module.metadata,
        uptime: Date.now(),
        memoryUsage: Math.max(
          0,
          Math.min(
            100,
            (module.metadata.memoryUsage || 0) + (Math.random() - 0.5) * 2
          )
        ),
      },
    }));

    // Generate new event flow
    const eventNames = [
      'sparc:phase-complete',
      'brain:predict-request',
      'dspy:optimize-request',
      'llm:inference-request',
    ];
    const sources = [
      'SPARCManager',
      'BrainSystem',
      'DSPyEngine',
      'LLMProvider',
    ];
    const targets = ['System', 'BrainSystem', 'DSPyEngine', 'SPARCManager'];

    if (Math.random() > 0.6) {
      const newFlow: EventFlow = {
        id: 'flow-' + Date.now(),
        eventName: eventNames[Math.floor(Math.random() * eventNames.length)]!,
        source: sources[Math.floor(Math.random() * sources.length)]!,
        target: targets[Math.floor(Math.random() * targets.length)]!,
        timestamp: new Date(),
        latency: Math.random() * 1000 + 50,
        success: Math.random() > 0.1,
      };

      this.eventFlows = [newFlow, ...this.eventFlows.slice(0, 49)]; // Keep last 50 flows
    }

    // Update metrics
    this.eventMetrics.totalEvents = this.activeModules.reduce(
      (total, module) => total + module.eventCount,
      0
    );
    this.eventMetrics.eventsPerSecond = Math.random() * 8 + 1;
    this.eventMetrics.averageLatency = Math.random() * 500 + 100;
    this.eventMetrics.errorRate = Math.max(
      0,
      Math.min(10, this.eventMetrics.errorRate + (Math.random() - 0.5) * 0.5)
    );
    this.eventMetrics.activeModules = this.activeModules.filter(
      (m) => m.status === 'active'
    ).length;

    // Update system health
    if (this.eventMetrics.errorRate > 8) {
      this.eventMetrics.systemHealth = 'critical';
    } else if (this.eventMetrics.errorRate > 5) {
      this.eventMetrics.systemHealth = 'degraded';
    } else {
      this.eventMetrics.systemHealth = 'healthy';
    }

    // Occasionally change module status
    if (Math.random() > 0.9 && this.activeModules.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.activeModules.length);
      const statuses: ActiveModule['status'][] = ['active', 'idle'];
      const activeModule = this.activeModules[randomIndex];
      if (activeModule) {
        activeModule.status =
          statuses[Math.floor(Math.random() * statuses.length)]!;
      }
    }
  }

  /**
   * Broadcast updates to external systems via callback
   */
  private broadcastUpdates(): void {
    if (this.broadcastCallback) {
      // Broadcast module status
      this.broadcastCallback('module-status', this.activeModules);

      // Broadcast event flows
      this.broadcastCallback('event-flows', this.eventFlows.slice(0, 10));

      // Broadcast event metrics
      this.broadcastCallback('event-metrics', this.eventMetrics);

      // Broadcast individual new event flows
      const latestFlow = this.eventFlows[0];
      if (latestFlow && Date.now() - latestFlow.timestamp.getTime() < 3000) {
        this.broadcastCallback('event-flow', latestFlow);
      }
    }
  }
}

// Singleton instance
export const eventRegistryInitializer = new EventRegistryInitializer();
