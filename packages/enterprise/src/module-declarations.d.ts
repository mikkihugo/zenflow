/**
 * Module declarations for implementation packages to avoid "Cannot find module" errors
 * These are fallback declarations that enable compilation when packages aren't available
 */

declare module '@claude-zen/agent-manager' {
  export class AgentManager {
    initialize(): Promise<this>;
    shutdown(): Promise<void>;
  }
  export class AgentFactory {
    create(config: any): any;
  }
  export class AgentRegistry {
    register(agent: any): void;
    unregister(id: string): void;
  }
  export class AgentLifecycleManager {
    start(agent: any): Promise<void>;
    stop(agent: any): Promise<void>;
  }
  export interface AgentConfig { [key: string]: any; }
  export interface Agent { [key: string]: any; }
  export interface AgentStatus { [key: string]: any; }
  export interface AgentMetrics { [key: string]: any; }
  export interface LifecycleEvent { [key: string]: any; }
}

declare module '@claude-zen/coordination-core' {
  export class QueenCoordinator {
    initialize(): Promise<this>;
  }
  export class SwarmCommander {
    execute(command: any): Promise<any>;
  }
  export class CoordinationEventBus {
    emit(event: any): void;
  }
  export class CoordinationEngine {
    start(): Promise<void>;
  }
  export class TaskCoordinator {
    coordinate(task: any): Promise<any>;
  }
  export interface QueenConfig { [key: string]: any; }
  export interface CoordinationMetrics { [key: string]: any; }
  export interface SwarmConfig { [key: string]: any; }
  export interface TaskConfig { [key: string]: any; }
  export interface CoordinationEvent { [key: string]: any; }
  export interface CoordinationResult { [key: string]: any; }
}

declare module '@claude-zen/multi-level-orchestration' {
  export class MultiLevelOrchestrationManager {
    initialize(): Promise<this>;
  }
  export class PortfolioOrchestrator {
    orchestrate(portfolio: any): Promise<any>;
  }
  export class ProgramOrchestrator {
    orchestrate(program: any): Promise<any>;
  }
  export class SwarmExecutionOrchestrator {
    orchestrate(swarm: any): Promise<any>;
  }
  export enum OrchestrationLevel {
    PORTFOLIO = 'portfolio',
    PROGRAM = 'program',
    SWARM = 'swarm'
  }
  export class WorkflowStream {
    flow(): any;
  }
  export enum MultiLevelOrchestratorState {
    IDLE = 'idle',
    ACTIVE = 'active'
  }
  export interface OrchestrationConfig { [key: string]: any; }
  export interface PortfolioItem { [key: string]: any; }
  export interface ProgramItem { [key: string]: any; }
  export interface SwarmExecutionItem { [key: string]: any; }
  export interface FlowMetrics { [key: string]: any; }
  export interface WIPLimits { [key: string]: any; }
  export interface CrossLevelDependency { [key: string]: any; }
}

declare module '@claude-zen/agent-registry' {
  export class AgentRegistry {
    register(agent: any): void;
    get(id: string): any;
  }
  export function createRegistry(): AgentRegistry;
  export const defaultRegistry: AgentRegistry;
}

declare module '@claude-zen/interfaces' {
  export interface InterfaceConfig { [key: string]: any; }
  export class InterfaceManager {
    manage(): void;
  }
  export enum InterfaceMode {
    WEB = 'web',
    CLI = 'cli'
  }
}

declare module '@claude-zen/kanban' {
  export class WorkflowKanban {
    initialize(): Promise<this>;
    shutdown(): Promise<void>;
    createTask(config: any): Promise<{ success: boolean; data: any }>;
    updateTask(id: string, update: any): Promise<{ success: boolean; data: any }>;
    deleteTask(id: string): Promise<{ success: boolean }>;
    listTasks(filter?: any): Promise<{ success: boolean; data: any[] }>;
    moveTask(id: string, status: string): Promise<{ success: boolean; data: any }>;
    getMetrics(): Promise<{ success: boolean; data: any }>;
  }
  export const DEFAULT_CONFIG: any;
  export function createWorkflowKanban(config: any): WorkflowKanban;
  export function createHighThroughputWorkflowKanban(config: any): WorkflowKanban;
  export const DEFAULT_WORKFLOW_STATES: string[];
  export const TASK_PRIORITIES: string[];
  export function isValidWorkflowState(state: string): boolean;
  export function isValidTaskPriority(priority: string): boolean;
  export function getNextWorkflowState(current: string): string | null;
  export function getPreviousWorkflowState(current: string): string | null;
  export function isValidStateTransition(from: string, to: string): boolean;
  
  // Type exports
  export interface WorkflowKanbanConfig { [key: string]: any; }
  export interface WorkflowTask { [key: string]: any; }
  export interface TaskState { [key: string]: any; }
  export interface TaskPriority { [key: string]: any; }
  export interface FlowMetrics { [key: string]: any; }
  export interface BottleneckReport { [key: string]: any; }
  export interface WorkflowBottleneck { [key: string]: any; }
  export interface WIPLimits { [key: string]: any; }
  export interface KanbanOperationResult { [key: string]: any; }
  export interface TaskMovementResult { [key: string]: any; }
}