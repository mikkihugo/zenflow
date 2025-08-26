/**
 * @file UEL Communication Event Adapter providing unified event management for communication-related events.
 *
 * Unified Event Layer adapter for communication-related events, providing
 * a consistent interface to scattered EventEmitter patterns across the communication system.
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified communication functionality.
 */

import { getLogger, type Logger, EventEmitter } from '@claude-zen/foundation';

const logger = getLogger('communication-event-adapter');

// Basic interfaces for communication components
interface RPCClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  call(method: string, params?: any): Promise<any>;
}

interface RPCServer {
  start(): Promise<void>;
  stop(): Promise<void>;
  register(method: string, handler: Function): void;
}

interface RPCServerConfig {
  name: string;
  transport: 'stdio' | 'sse' | 'websocket';
  command?: string;
  args?: string[];
  url?: string;
  capabilities?: string[];
}

interface RPCClientConfig {
  serverName: string;
  transport: 'stdio' | 'sse' | 'websocket';
  endpoint?: string;
  timeout?: number;
  retries?: number;
}

// Communication event configuration
interface CommunicationEventConfig {
  enableCorrelation?: boolean;
  enableHealthMonitoring?: boolean;
  enablePerformanceTracking?: boolean;
  
  connection?: {
    maxRetries?: number;
    timeout?: number;
    maxConcurrentConnections?: number;
    connectionTimeout?: number;
    enablePerformanceTracking?: boolean;
  };

  communication?: {
    enabled: boolean;
    strategy: 'websocket' | 'rpc' | 'http' | 'protocol' | 'custom';
    correlationTTL: number;
    maxCorrelationDepth: number;
    correlationPatterns: string[];
    trackMessageFlow: boolean;
    trackConnectionHealth: boolean;
  };

  healthMonitoring?: {
    enabled: boolean;
    interval: number;
    maxConsecutiveFailures: number;
    componentTypes: string[];
  };

  performance?: {
    enabled: boolean;
    trackLatency: boolean;
    trackThroughput: boolean;
    trackReliability: boolean;
    retentionPeriod: number;
  };
}

// Communication correlation tracking
interface CommunicationCorrelation {
  correlationId: string;
  events: any[];
  startTime: Date;
  lastUpdate: Date;
  connectionId?: string;
  protocolType: string;
  messageIds: string[];
  operation: string;
  status: 'active' | 'completed' | 'failed' | 'timeout';
  performance: {
    totalLatency: number;
    communicationEfficiency: number;
    resourceUtilization: number;
  };
  metadata: Record<string, unknown>;
}

// Communication health tracking
interface CommunicationHealthEntry {
  component: string;
  componentType: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin' | 'protocol';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  consecutiveFailures: number;
  communicationLatency: number;
  throughput: number;
  reliability: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
  metadata: Record<string, unknown>;
}

// Wrapped communication component
interface WrappedCommunicationComponent {
  component: unknown;
  componentType: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin' | 'protocol';
  wrapper: EventEmitter;
  originalMethods: Map<string, Function>;
  eventMappings: Map<string, string>;
  isActive: boolean;
  healthMetrics: {
    lastSeen: Date;
    communicationCount: number;
    errorCount: number;
    latencySum: number;
    throughput: number;
  };
}

/**
 * Communication Event Adapter
 * 
 * Provides unified event management for communication-related events
 * with correlation tracking, health monitoring, and performance analytics.
 */
export class CommunicationEventAdapter extends EventEmitter {
  private readonly logger: Logger;
  private readonly config: CommunicationEventConfig;
  private readonly correlations = new Map<string, CommunicationCorrelation>();
  private readonly healthEntries = new Map<string, CommunicationHealthEntry>();
  private readonly wrappedComponents = new Map<string, WrappedCommunicationComponent>();

  constructor(config: CommunicationEventConfig = {}) {
    super();
    this.logger = logger;
    this.config = config;
  }

  /**
   * Initialize the communication event adapter
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Communication Event Adapter');
    
    if (this.config.enableHealthMonitoring) {
      this.startHealthMonitoring();
    }

    if (this.config.enablePerformanceTracking) {
      this.startPerformanceTracking();
    }
  }

  /**
   * Shutdown the communication event adapter
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Communication Event Adapter');
    this.correlations.clear();
    this.healthEntries.clear();
    this.wrappedComponents.clear();
  }

  /**
   * Wrap a communication component for event management
   */
  wrapComponent(componentId: string, component: any, componentType: string): WrappedCommunicationComponent {
    const wrapper = new EventEmitter();
    const wrappedComponent: WrappedCommunicationComponent = {
      component,
      componentType: componentType as any,
      wrapper,
      originalMethods: new Map(),
      eventMappings: new Map(),
      isActive: true,
      healthMetrics: {
        lastSeen: new Date(),
        communicationCount: 0,
        errorCount: 0,
        latencySum: 0,
        throughput: 0,
      }
    };

    this.wrappedComponents.set(componentId, wrappedComponent);
    this.logger.debug(`Wrapped communication component: ${componentId}`);
    
    return wrappedComponent;
  }

  /**
   * Start correlation tracking for communication events
   */
  startCorrelation(correlationId: string, operation: string, protocolType: string): void {
    const correlation: CommunicationCorrelation = {
      correlationId,
      events: [],
      startTime: new Date(),
      lastUpdate: new Date(),
      protocolType,
      messageIds: [],
      operation,
      status: 'active',
      performance: {
        totalLatency: 0,
        communicationEfficiency: 0,
        resourceUtilization: 0,
      },
      metadata: {}
    };

    this.correlations.set(correlationId, correlation);
    this.emit('correlation:started', correlation);
  }

  /**
   * Update health status for a communication component
   */
  updateHealthStatus(componentId: string, status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'): void {
    const healthEntry = this.healthEntries.get(componentId);
    if (healthEntry) {
      healthEntry.status = status;
      healthEntry.lastCheck = new Date();
      this.emit('health:updated', { componentId, status });
    }
  }

  /**
   * Record communication performance metrics
   */
  recordPerformanceMetrics(componentId: string, latency: number, throughput: number): void {
    const healthEntry = this.healthEntries.get(componentId);
    if (healthEntry) {
      healthEntry.communicationLatency = latency;
      healthEntry.throughput = throughput;
      this.emit('performance:recorded', { componentId, latency, throughput });
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    const interval = this.config.healthMonitoring?.interval || 30000;
    setInterval(() => {
      this.performHealthCheck();
    }, interval);
  }

  /**
   * Start performance tracking
   */
  private startPerformanceTracking(): void {
    this.logger.debug('Performance tracking enabled');
  }

  /**
   * Perform health check on all wrapped components
   */
  private performHealthCheck(): void {
    for (const [componentId, component] of this.wrappedComponents) {
      try {
        // Basic health check logic
        const timeSinceLastSeen = Date.now() - component.healthMetrics.lastSeen.getTime();
        const isHealthy = timeSinceLastSeen < 60000; // 1 minute threshold
        
        this.updateHealthStatus(componentId, isHealthy ? 'healthy' : 'degraded');
      } catch (error) {
        this.logger.error(`Health check failed for component ${componentId}:`, error);
        this.updateHealthStatus(componentId, 'unhealthy');
      }
    }
  }

  /**
   * Get correlation by ID
   */
  getCorrelation(correlationId: string): CommunicationCorrelation | undefined {
    return this.correlations.get(correlationId);
  }

  /**
   * Get health entry by component ID
   */
  getHealthEntry(componentId: string): CommunicationHealthEntry | undefined {
    return this.healthEntries.get(componentId);
  }

  /**
   * Get wrapped component by ID
   */
  getWrappedComponent(componentId: string): WrappedCommunicationComponent | undefined {
    return this.wrappedComponents.get(componentId);
  }

  /**
   * Get current statistics
   */
  getStatistics() {
    return {
      activeCorrelations: this.correlations.size,
      healthEntries: this.healthEntries.size,
      wrappedComponents: this.wrappedComponents.size,
      uptime: Date.now()
    };
  }
}

// Factory function for creating communication event adapters
export function createCommunicationEventAdapter(config?: CommunicationEventConfig): CommunicationEventAdapter {
  return new CommunicationEventAdapter(config);
}

// Default export
export default CommunicationEventAdapter;