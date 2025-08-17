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
 */
export interface WorkflowEventManager extends EventManager {
  processWorkflowStep(stepId: string, data: unknown): Promise<void>;
  getWorkflowStatus(workflowId: string): Promise<string>;
  cancelWorkflow(workflowId: string): Promise<void>;
}

/**
 * Neural Event Manager Interface.
 */
export interface NeuralEventManager extends EventManager {
  processNeuralSignal(signal: unknown): Promise<void>;
  trainModel(modelId: string, data: unknown): Promise<void>;
  getModelStatus(modelId: string): Promise<string>;
}

/**
 * Memory Event Manager Interface.
 */
export interface MemoryEventManager extends EventManager {
  storeMemoryEvent(key: string, data: unknown): Promise<void>;
  retrieveMemoryEvent(key: string): Promise<unknown>;
  clearMemoryCache(): Promise<void>;
}

/**
 * Interface Event Manager Interface.
 */
export interface InterfaceEventManager extends EventManager {
  handleUIInteraction(element: string, action: string): Promise<void>;
  updateInterface(componentId: string, state: unknown): Promise<void>;
  refreshComponent(componentId: string): Promise<void>;
}

/**
 * Database Event Manager Interface.
 */
export interface DatabaseEventManager extends EventManager {
  processTransaction(transactionId: string): Promise<void>;
  handleSchemaChange(changeId: string): Promise<void>;
  optimizeQuery(queryId: string): Promise<void>;
}

/**
 * System Event Manager Interface.
 */
export interface SystemEventManager extends EventManager {
  handleSystemAlert(alertId: string): Promise<void>;
  processHealthCheck(): Promise<boolean>;
  restartService(serviceId: string): Promise<void>;
}

/**
 * Communication Event Manager Interface.
 */
export interface CommunicationEventManager
  extends EventManager {
  sendMessage(channel: string, message: unknown): Promise<void>;
  receiveMessage(channel: string): Promise<unknown>;
  closeChannel(channel: string): Promise<void>;
}

/**
 * Coordination Event Manager Interface.
 */
export interface CoordinationEventManager
  extends EventManager {
  coordinateTask(taskId: string): Promise<void>;
  assignAgent(agentId: string, task: string): Promise<void>;
  getCoordinationStatus(): Promise<unknown>;
}

/**
 * Monitoring Event Manager Interface.
 */
export interface MonitoringEventManager extends EventManager {
  processMetricEvent(metricId: string, data: unknown): Promise<void>;
  handleHealthCheck(): Promise<boolean>;
  generateReport(type: string): Promise<unknown>;
}
