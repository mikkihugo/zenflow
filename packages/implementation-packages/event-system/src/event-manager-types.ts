/**
 * Event Manager Types - Extracted to break circular dependencies.
 *
 * This file contains type definitions that were causing circular imports
 * between factories.ts and adapter files.
 */

import type {
  EventManagerConfig,
  EventManager,
  SystemEvent,
} from './core/interfaces';
import type {
  CommunicationEvent,
  CoordinationEvent,
  DatabaseEvent,
  InterfaceEvent,
  MemoryEvent,
  NeuralEvent,
  WorkflowEvent,
} from './types';
import type { MonitoringEvent } from './types';

/**
 * Workflow Event Manager Interface.
 *
 * Specialized event manager for workflow orchestration and task execution.
 * Provides comprehensive workflow lifecycle management with step-by-step
 * execution tracking and coordinated task orchestration.
 *
 * @interface WorkflowEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const workflowManager = await createWorkflowEventManager('task-orchestrator');
 *
 * // Process a workflow step
 * await workflowManager.processWorkflowStep('step-1', {
 *   action: 'validate',
 *   payload: { userId: '123', data: {...} }
 * });
 *
 * // Check workflow status
 * const status = await workflowManager.getWorkflowStatus('workflow-456');
 * console.log(`Workflow status: ${status}`);
 * ```
 */
export interface WorkflowEventManager extends EventManager {
  /**
   * Process a single workflow step with execution tracking.
   *
   * @param stepId - Unique identifier for the workflow step
   * @param data - Step execution data and parameters
   * @returns Promise that resolves when step processing is complete
   * @throws {Error} If step processing fails or stepId is invalid
   */
  processWorkflowStep(stepId: string, data: unknown): Promise<void>;

  /**
   * Get the current status of a workflow execution.
   *
   * @param workflowId - Unique identifier for the workflow
   * @returns Promise resolving to workflow status ('pending', 'running', 'completed', 'failed')
   * @throws {Error} If workflow is not found
   */
  getWorkflowStatus(workflowId: string): Promise<string>;

  /**
   * Cancel a running workflow and cleanup resources.
   *
   * @param workflowId - Unique identifier for the workflow to cancel
   * @returns Promise that resolves when cancellation is complete
   * @throws {Error} If workflow cannot be cancelled or is not found
   */
  cancelWorkflow(workflowId: string): Promise<void>;
}

/**
 * Neural Event Manager Interface.
 *
 * Specialized event manager for neural network operations and AI model coordination.
 * Handles neural signal processing, model training coordination, and AI system
 * lifecycle management within the event-driven architecture.
 *
 * @interface NeuralEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const neuralManager = await createNeuralEventManager('ai-coordinator');
 *
 * // Process neural signals
 * await neuralManager.processNeuralSignal({
 *   type: 'learning_update',
 *   modelId: 'transformer-v1',
 *   weights: [...]
 * });
 *
 * // Train model with new data
 * await neuralManager.trainModel('transformer-v1', trainingData);
 * ```
 */
export interface NeuralEventManager extends EventManager {
  /**
   * Process incoming neural signals for model coordination.
   *
   * @param signal - Neural signal data containing model updates or coordination info
   * @returns Promise that resolves when signal processing is complete
   * @throws {Error} If signal format is invalid or processing fails
   */
  processNeuralSignal(signal: unknown): Promise<void>;

  /**
   * Coordinate model training with distributed data.
   *
   * @param modelId - Unique identifier for the model to train
   * @param data - Training data and configuration parameters
   * @returns Promise that resolves when training coordination is complete
   * @throws {Error} If model is not found or training fails to start
   */
  trainModel(modelId: string, data: unknown): Promise<void>;

  /**
   * Get the current status of a neural model.
   *
   * @param modelId - Unique identifier for the model
   * @returns Promise resolving to model status ('training', 'ready', 'error', 'updating')
   * @throws {Error} If model is not found
   */
  getModelStatus(modelId: string): Promise<string>;
}

/**
 * Memory Event Manager Interface.
 *
 * Specialized event manager for memory operations and caching coordination.
 * Provides distributed memory management with event-driven synchronization
 * across multiple agents and system components.
 *
 * @interface MemoryEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const memoryManager = await createMemoryEventManager('cache-coordinator');
 *
 * // Store data in distributed memory
 * await memoryManager.storeMemoryEvent('session:user123', {
 *   preferences: {...},
 *   lastActivity: new Date()
 * });
 *
 * // Retrieve cached data
 * const userData = await memoryManager.retrieveMemoryEvent('session:user123');
 * ```
 */
export interface MemoryEventManager extends EventManager {
  /**
   * Store data in the distributed memory system with event coordination.
   *
   * @param key - Unique key for the memory entry
   * @param data - Data to store in memory
   * @returns Promise that resolves when storage is complete
   * @throws {Error} If storage fails or key is invalid
   */
  storeMemoryEvent(key: string, data: unknown): Promise<void>;

  /**
   * Retrieve data from the distributed memory system.
   *
   * @param key - Unique key for the memory entry to retrieve
   * @returns Promise resolving to the stored data, or undefined if not found
   * @throws {Error} If retrieval fails
   */
  retrieveMemoryEvent(key: string): Promise<unknown>;

  /**
   * Clear all cached data from the memory system.
   *
   * @returns Promise that resolves when cache clearing is complete
   * @throws {Error} If cache clearing fails
   */
  clearMemoryCache(): Promise<void>;
}

/**
 * Interface Event Manager Interface.
 *
 * Specialized event manager for user interface interactions and component state management.
 * Coordinates UI events across distributed interface components with real-time updates
 * and state synchronization.
 *
 * @interface InterfaceEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const uiManager = await createInterfaceEventManager('ui-coordinator');
 *
 * // Handle user interactions
 * await uiManager.handleUIInteraction('submit-button', 'click');
 *
 * // Update component state
 * await uiManager.updateInterface('user-profile', {
 *   name: 'John Doe',
 *   status: 'online'
 * });
 * ```
 */
export interface InterfaceEventManager extends EventManager {
  /**
   * Handle user interface interactions with event coordination.
   *
   * @param element - CSS selector or element identifier
   * @param action - Type of interaction ('click', 'focus', 'change', etc.)
   * @returns Promise that resolves when interaction handling is complete
   * @throws {Error} If element is not found or action is invalid
   */
  handleUIInteraction(element: string, action: string): Promise<void>;

  /**
   * Update interface component state with distributed synchronization.
   *
   * @param componentId - Unique identifier for the UI component
   * @param state - New state data for the component
   * @returns Promise that resolves when state update is complete
   * @throws {Error} If component is not found or state is invalid
   */
  updateInterface(componentId: string, state: unknown): Promise<void>;

  /**
   * Refresh a specific UI component and its data.
   *
   * @param componentId - Unique identifier for the component to refresh
   * @returns Promise that resolves when component refresh is complete
   * @throws {Error} If component is not found or refresh fails
   */
  refreshComponent(componentId: string): Promise<void>;
}

/**
 * Database Event Manager Interface.
 *
 * Specialized event manager for database operations and transaction coordination.
 * Provides distributed database event handling with transaction management,
 * schema migrations, and query optimization coordination.
 *
 * @interface DatabaseEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const dbManager = await createDatabaseEventManager('db-coordinator');
 *
 * // Process database transaction
 * await dbManager.processTransaction('txn-12345');
 *
 * // Handle schema changes
 * await dbManager.handleSchemaChange('migration-v2.1');
 * ```
 */
export interface DatabaseEventManager extends EventManager {
  /**
   * Process a database transaction with distributed coordination.
   *
   * @param transactionId - Unique identifier for the transaction
   * @returns Promise that resolves when transaction processing is complete
   * @throws {Error} If transaction fails or ID is invalid
   */
  processTransaction(transactionId: string): Promise<void>;

  /**
   * Handle database schema changes and migrations.
   *
   * @param changeId - Unique identifier for the schema change
   * @returns Promise that resolves when schema change is complete
   * @throws {Error} If schema change fails or ID is invalid
   */
  handleSchemaChange(changeId: string): Promise<void>;

  /**
   * Optimize database queries for better performance.
   *
   * @param queryId - Unique identifier for the query to optimize
   * @returns Promise that resolves when query optimization is complete
   * @throws {Error} If query is not found or optimization fails
   */
  optimizeQuery(queryId: string): Promise<void>;
}

/**
 * System Event Manager Interface.
 *
 * Specialized event manager for system-level operations and infrastructure management.
 * Handles system alerts, health monitoring, and service lifecycle management
 * with distributed coordination and fault tolerance.
 *
 * @interface SystemEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const systemManager = await createSystemEventManager('system-coordinator');
 *
 * // Handle system alerts
 * await systemManager.handleSystemAlert('cpu-threshold-exceeded');
 *
 * // Perform health checks
 * const isHealthy = await systemManager.processHealthCheck();
 * ```
 */
export interface SystemEventManager extends EventManager {
  /**
   * Handle system alerts and notifications with coordinated response.
   *
   * @param alertId - Unique identifier for the system alert
   * @returns Promise that resolves when alert handling is complete
   * @throws {Error} If alert is not found or handling fails
   */
  handleSystemAlert(alertId: string): Promise<void>;

  /**
   * Process comprehensive system health checks.
   *
   * @returns Promise resolving to true if system is healthy, false otherwise
   * @throws {Error} If health check fails to execute
   */
  processHealthCheck(): Promise<boolean>;

  /**
   * Restart a system service with coordinated shutdown and startup.
   *
   * @param serviceId - Unique identifier for the service to restart
   * @returns Promise that resolves when service restart is complete
   * @throws {Error} If service is not found or restart fails
   */
  restartService(serviceId: string): Promise<void>;
}

/**
 * Communication Event Manager Interface.
 *
 * Specialized event manager for communication protocols and message routing.
 * Handles inter-service communication, protocol management, and distributed
 * message coordination across multiple channels and transports.
 *
 * @interface CommunicationEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const commManager = await createCommunicationEventManager('comm-coordinator');
 *
 * // Send messages through channels
 * await commManager.sendMessage('agent-coordination', {
 *   type: 'task_assignment',
 *   agentId: 'agent-123',
 *   task: {...}
 * });
 *
 * // Receive messages from channels
 * const message = await commManager.receiveMessage('status-updates');
 * ```
 */
export interface CommunicationEventManager extends EventManager {
  /**
   * Send a message through a communication channel.
   *
   * @param channel - Communication channel identifier
   * @param message - Message data to send
   * @returns Promise that resolves when message is sent
   * @throws {Error} If channel is not available or message sending fails
   */
  sendMessage(channel: string, message: unknown): Promise<void>;

  /**
   * Receive a message from a communication channel.
   *
   * @param channel - Communication channel identifier to receive from
   * @returns Promise resolving to the received message, or undefined if none available
   * @throws {Error} If channel is not available or receiving fails
   */
  receiveMessage(channel: string): Promise<unknown>;

  /**
   * Close a communication channel and cleanup resources.
   *
   * @param channel - Communication channel identifier to close
   * @returns Promise that resolves when channel is closed
   * @throws {Error} If channel is not found or closing fails
   */
  closeChannel(channel: string): Promise<void>;
}

/**
 * Coordination Event Manager Interface.
 *
 * Specialized event manager for multi-agent coordination and task orchestration.
 * Handles agent assignment, task coordination, and distributed workflow management
 * with real-time status tracking and coordination protocols.
 *
 * @interface CoordinationEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const coordManager = await createCoordinationEventManager('agent-coordinator');
 *
 * // Coordinate task execution
 * await coordManager.coordinateTask('task-456');
 *
 * // Assign agents to tasks
 * await coordManager.assignAgent('agent-123', 'code-review');
 *
 * // Check coordination status
 * const status = await coordManager.getCoordinationStatus();
 * ```
 */
export interface CoordinationEventManager extends EventManager {
  /**
   * Coordinate task execution across multiple agents.
   *
   * @param taskId - Unique identifier for the task to coordinate
   * @returns Promise that resolves when task coordination is initiated
   * @throws {Error} If task is not found or coordination fails
   */
  coordinateTask(taskId: string): Promise<void>;

  /**
   * Assign a specific agent to a task with coordination tracking.
   *
   * @param agentId - Unique identifier for the agent
   * @param task - Task description or identifier to assign
   * @returns Promise that resolves when agent assignment is complete
   * @throws {Error} If agent is not available or assignment fails
   */
  assignAgent(agentId: string, task: string): Promise<void>;

  /**
   * Get the current coordination status across all managed tasks and agents.
   *
   * @returns Promise resolving to coordination status object with task and agent states
   * @throws {Error} If status retrieval fails
   */
  getCoordinationStatus(): Promise<unknown>;
}

/**
 * Monitoring Event Manager Interface.
 *
 * Specialized event manager for system monitoring, metrics collection, and health tracking.
 * Provides comprehensive monitoring capabilities with real-time metrics processing,
 * health check coordination, and automated report generation.
 *
 * @interface MonitoringEventManager
 * @extends EventManager
 * @example
 * ```typescript
 * const monitorManager = await createMonitoringEventManager('system-monitor');
 *
 * // Process metrics events
 * await monitorManager.processMetricEvent('cpu-usage', {
 *   value: 85.3,
 *   timestamp: new Date(),
 *   threshold: 90
 * });
 *
 * // Generate performance reports
 * const report = await monitorManager.generateReport('performance-summary');
 * ```
 */
export interface MonitoringEventManager extends EventManager {
  /**
   * Process incoming metric events for monitoring and alerting.
   *
   * @param metricId - Unique identifier for the metric type
   * @param data - Metric data including values, timestamps, and metadata
   * @returns Promise that resolves when metric processing is complete
   * @throws {Error} If metric format is invalid or processing fails
   */
  processMetricEvent(metricId: string, data: unknown): Promise<void>;

  /**
   * Handle comprehensive system health checks with monitoring coordination.
   *
   * @returns Promise resolving to true if all monitored systems are healthy
   * @throws {Error} If health check execution fails
   */
  handleHealthCheck(): Promise<boolean>;

  /**
   * Generate monitoring reports based on collected metrics and health data.
   *
   * @param type - Type of report to generate ('performance', 'health', 'alerts', etc.)
   * @returns Promise resolving to the generated report data
   * @throws {Error} If report generation fails or type is invalid
   */
  generateReport(type: string): Promise<unknown>;
}
