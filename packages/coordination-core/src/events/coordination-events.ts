/**
 * @fileoverview Coordination Events
 * 
 * Event definitions for the coordination system.
 */

import type { CoordinationAgent, CoordinationDecision, StrategicObjective } from '../types';

// Base event interface
export interface CoordinationEvent {
  id: string;
  timestamp: number;
  source: string;
  type: string;
}

// Queen-level strategic events
export interface QueenSpawnedEvent extends CoordinationEvent {
  type: 'queen:spawned';
  queenId: string;
  domain: string;
  maxSwarms: number;
}

export interface QueenShutdownEvent extends CoordinationEvent {
  type: 'queen:shutdown';
  queenId: string;
  reason: string;
}

export interface CommanderSpawnedEvent extends CoordinationEvent {
  type: 'commander:spawned';
  queenId: string;
  commanderId: string;
  domain: string;
  capabilities: string[];
}

export interface CrossSwarmCoordinationEvent extends CoordinationEvent {
  type: 'coordination:cross-swarm';
  queenId: string;
  swarms: string[];
  objective: string;
  priority: 'low' | 'medium' | 'high';
  taskId: string;
}

// Commander-level tactical events
export interface CommanderInitializedEvent extends CoordinationEvent {
  type: 'commander:initialized';
  commanderId: string;
  swarmId: string;
  domain: string;
}

export interface MatronSpawnedEvent extends CoordinationEvent {
  type: 'matron:spawned';
  commanderId: string;
  matronId: string;
  domain: string;
  specialization: string;
}

export interface TacticalOperationEvent extends CoordinationEvent {
  type: 'operation:tactical';
  commanderId: string;
  operationType: string;
  operationId: string;
  requirements: string[];
  priority: number;
}

// Matron-level domain events
export interface MatronInitializedEvent extends CoordinationEvent {
  type: 'matron:initialized';
  matronId: string;
  domain: string;
  specialization: string;
  capabilities: string[];
}

export interface DomainCoordinationEvent extends CoordinationEvent {
  type: 'coordination:domain';
  matronId: string;
  domain: string;
  objective: string;
  operationId: string;
  estimatedDuration?: number;
}

export interface CrossDomainCoordinationEvent extends CoordinationEvent {
  type: 'coordination:cross-domain';
  matronIds: string[];
  domains: string[];
  coordinationId: string;
  objective: string;
}

export interface OperationCompletedEvent extends CoordinationEvent {
  type: 'operation:completed';
  matronId: string;
  operationId: string;
  success: boolean;
  duration: number;
}

// Decision events
export interface DecisionMadeEvent extends CoordinationEvent {
  type: 'decision:made';
  decision: CoordinationDecision;
  agentId: string;
  agentRole: 'queen' | 'commander' | 'matron';
}

export interface ObjectiveCreatedEvent extends CoordinationEvent {
  type: 'objective:created';
  objective: StrategicObjective;
  createdBy: string;
}

export interface ObjectiveCompletedEvent extends CoordinationEvent {
  type: 'objective:completed';
  objectiveId: string;
  success: boolean;
  completedBy: string;
  results: Record<string, unknown>;
}

// System events
export interface CoordinationSystemStartedEvent extends CoordinationEvent {
  type: 'system:started';
  config: Record<string, unknown>;
  hierarchyEnabled: {
    queens: boolean;
    commanders: boolean;
    matrons: boolean;
  };
}

export interface CoordinationSystemShutdownEvent extends CoordinationEvent {
  type: 'system:shutdown';
  reason: string;
  activeAgents: number;
  completedOperations: number;
}

export interface PerformanceMetricsEvent extends CoordinationEvent {
  type: 'metrics:performance';
  agentId: string;
  agentType: 'queen' | 'commander' | 'matron';
  metrics: {
    decisionsMade: number;
    averageResponseTime: number;
    successRate: number;
    resourceUtilization: number;
  };
}

// Union type of all coordination events
export type CoordinationEventType = 
  | QueenSpawnedEvent
  | QueenShutdownEvent
  | CommanderSpawnedEvent
  | CrossSwarmCoordinationEvent
  | CommanderInitializedEvent
  | MatronSpawnedEvent
  | TacticalOperationEvent
  | MatronInitializedEvent
  | DomainCoordinationEvent
  | CrossDomainCoordinationEvent
  | OperationCompletedEvent
  | DecisionMadeEvent
  | ObjectiveCreatedEvent
  | ObjectiveCompletedEvent
  | CoordinationSystemStartedEvent
  | CoordinationSystemShutdownEvent
  | PerformanceMetricsEvent;