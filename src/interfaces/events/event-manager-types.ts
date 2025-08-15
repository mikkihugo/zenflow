/**
 * Event Manager Types - Extracted to break circular dependencies.
 *
 * This file contains type definitions that were causing circular imports
 * between factories.ts and adapter files.
 */

import type {
  CommunicationEvent,
  CoordinationEvent,
  DatabaseEvent,
  EventManagerConfig,
  IEventManager,
  InterfaceEvent,
  MemoryEvent,
  NeuralEvent,
  SystemEvent,
  WorkflowEvent,
} from './core/interfaces';

/**
 * Workflow Event Manager Interface.
 */
export interface IWorkflowEventManager extends IEventManager<WorkflowEvent> {
  processWorkflowStep(stepId: string, data: unknown): Promise<void>;
  getWorkflowStatus(workflowId: string): Promise<string>;
  cancelWorkflow(workflowId: string): Promise<void>;
}

/**
 * Neural Event Manager Interface.
 */
export interface INeuralEventManager extends IEventManager<NeuralEvent> {
  processNeuralSignal(signal: unknown): Promise<void>;
  trainModel(modelId: string, data: unknown): Promise<void>;
  getModelStatus(modelId: string): Promise<string>;
}

/**
 * Memory Event Manager Interface.
 */
export interface IMemoryEventManager extends IEventManager<MemoryEvent> {
  storeMemoryEvent(key: string, data: unknown): Promise<void>;
  retrieveMemoryEvent(key: string): Promise<unknown>;
  clearMemoryCache(): Promise<void>;
}

/**
 * Interface Event Manager Interface.
 */
export interface IInterfaceEventManager extends IEventManager<InterfaceEvent> {
  handleUIInteraction(element: string, action: string): Promise<void>;
  updateInterface(componentId: string, state: unknown): Promise<void>;
  refreshComponent(componentId: string): Promise<void>;
}

/**
 * Database Event Manager Interface.
 */
export interface IDatabaseEventManager extends IEventManager<DatabaseEvent> {
  processTransaction(transactionId: string): Promise<void>;
  handleSchemaChange(changeId: string): Promise<void>;
  optimizeQuery(queryId: string): Promise<void>;
}

/**
 * System Event Manager Interface.
 */
export interface ISystemEventManager extends IEventManager<SystemEvent> {
  handleSystemAlert(alertId: string): Promise<void>;
  processHealthCheck(): Promise<boolean>;
  restartService(serviceId: string): Promise<void>;
}

/**
 * Communication Event Manager Interface.
 */
export interface ICommunicationEventManager
  extends IEventManager<CommunicationEvent> {
  sendMessage(channel: string, message: unknown): Promise<void>;
  receiveMessage(channel: string): Promise<unknown>;
  closeChannel(channel: string): Promise<void>;
}

/**
 * Coordination Event Manager Interface.
 */
export interface ICoordinationEventManager
  extends IEventManager<CoordinationEvent> {
  coordinateTask(taskId: string): Promise<void>;
  assignAgent(agentId: string, task: string): Promise<void>;
  getCoordinationStatus(): Promise<unknown>;
}
