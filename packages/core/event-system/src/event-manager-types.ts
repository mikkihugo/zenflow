/**
 * Event Manager Types - Extracted to break circular dependencies.
 *
 * This file contains type definitions that were causing circular imports
 * between factories.ts and adapter files.
 */

import type {
  EventManager,
} from './core/interfaces';

/**
 * Workflow Event Manager Interface.
 *
 * Specialized event manager for workflow orchestration and task execution.
 */
export interface WorkflowEventManager extends EventManager {
  /**
   * Process a single workflow step with execution tracking.
   */
  processWorkflowStep(stepId: string, data: unknown): Promise<void>;

  /**
   * Get the current status of a workflow execution.
   */
  getWorkflowStatus(workflowId: string): Promise<string>;

  /**
   * Start a new workflow execution.
   */
  startWorkflow(workflowId: string, config: unknown): Promise<void>;

  /**
   * Stop a running workflow execution.
   */
  stopWorkflow(workflowId: string): Promise<void>;
}

/**
 * System Event Manager Interface.
 *
 * Core system event manager for application lifecycle events.
 */
export interface SystemEventManager extends EventManager {
  /**
   * Handle system startup events.
   */
  handleSystemStartup(): Promise<void>;

  /**
   * Handle system shutdown events.
   */
  handleSystemShutdown(): Promise<void>;

  /**
   * Get system health status.
   */
  getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, unknown>;
  }>;
}

/**
 * Communication Event Manager Interface.
 *
 * Event manager for inter-service communication and messaging.
 */
export interface CommunicationEventManager extends EventManager {
  /**
   * Send a message to another service.
   */
  sendMessage(target: string, message: unknown): Promise<void>;

  /**
   * Broadcast a message to multiple services.
   */
  broadcastMessage(message: unknown): Promise<void>;

  /**
   * Get communication statistics.
   */
  getCommunicationStats(): Promise<{
    messagesSent: number;
    messagesReceived: number;
    errorRate: number;
  }>;
}

/**
 * Coordination Event Manager Interface.
 *
 * Event manager for coordinating distributed operations.
 */
export interface CoordinationEventManager extends EventManager {
  /**
   * Coordinate a distributed operation.
   */
  coordinateOperation(operationId: string, participants: string[]): Promise<void>;

  /**
   * Get coordination status for an operation.
   */
  getCoordinationStatus(operationId: string): Promise<{
    status: 'pending' | 'coordinating' | 'completed' | 'failed';
    participants: string[];
    progress: number;
  }>;
}

/**
 * Monitoring Event Manager Interface.
 *
 * Event manager for system monitoring and alerting.
 */
export interface MonitoringEventManager extends EventManager {
  /**
   * Record a metric value.
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): Promise<void>;

  /**
   * Trigger an alert.
   */
  triggerAlert(alert: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    source: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;

  /**
   * Get monitoring statistics.
   */
  getMonitoringStats(): Promise<{
    metricsRecorded: number;
    alertsTriggered: number;
    systemHealth: number; // 0-100
  }>;
}

/**
 * Interface Event Manager Interface.
 *
 * Event manager for user interface and API events.
 */
export interface InterfaceEventManager extends EventManager {
  /**
   * Handle user interaction events.
   */
  handleUserInteraction(interaction: {
    type: string;
    userId?: string;
    data: unknown;
  }): Promise<void>;

  /**
   * Handle API request events.
   */
  handleAPIRequest(request: {
    method: string;
    path: string;
    userId?: string;
    data?: unknown;
  }): Promise<void>;
}

/**
 * Neural Event Manager Interface.
 *
 * Event manager for neural network and AI operations.
 */
export interface NeuralEventManager extends EventManager {
  /**
   * Process neural computation events.
   */
  processNeuralComputation(computation: {
    type: string;
    inputData: unknown;
    modelId?: string;
  }): Promise<void>;

  /**
   * Handle model training events.
   */
  handleModelTraining(training: {
    modelId: string;
    epoch: number;
    loss: number;
    accuracy: number;
  }): Promise<void>;
}

/**
 * Database Event Manager Interface.
 *
 * Event manager for database operations and state changes.
 */
export interface DatabaseEventManager extends EventManager {
  /**
   * Handle database query events.
   */
  handleDatabaseQuery(query: {
    operation: 'select' | 'insert' | 'update' | 'delete';
    table: string;
    conditions?: unknown;
    data?: unknown;
  }): Promise<void>;

  /**
   * Handle database connection events.
   */
  handleConnectionEvent(event: {
    type: 'connect' | 'disconnect' | 'error';
    database: string;
    details?: unknown;
  }): Promise<void>;
}

/**
 * Memory Event Manager Interface.
 *
 * Event manager for memory operations and cache management.
 */
export interface MemoryEventManager extends EventManager {
  /**
   * Handle cache operations.
   */
  handleCacheOperation(operation: {
    type: 'get' | 'set' | 'delete' | 'clear';
    key?: string;
    value?: unknown;
    ttl?: number;
  }): Promise<void>;

  /**
   * Handle memory pressure events.
   */
  handleMemoryPressure(pressure: {
    level: 'low' | 'medium' | 'high' | 'critical';
    used: number;
    available: number;
    percentage: number;
  }): Promise<void>;
}