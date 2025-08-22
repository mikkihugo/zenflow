/**
 * @fileoverview Coordination Core Types
 *
 * Clean, minimal coordination types without complex dependencies.
 */

// Strategic coordination roles
export type CoordinationRole = 'queen | commander' | 'matron';

// Domain types for generic matrons
export type MatronDomain ='' | '''development | operations' | 'security''' | '''testing | analytics' | 'research';

// Basic coordination agent interface
export interface CoordinationAgent {
  id: string;
  role: CoordinationRole;
  domain?: MatronDomain;
  capabilities: string[];
  active: boolean;
  lastActivity: number;
}

// Strategic objectives
export interface StrategicObjective {
  id: string;
  type: 'resource-allocation''' | '''priority-routing''' | '''cross-swarm-coordination';
  scope: 'single-swarm''' | '''multi-swarm''' | '''global';
  priority: number;
  timeframe: {
    start: number;
    deadline: number;
  };
  resources: {
    agents: number;
    computational: number;
  };
}

// Coordination decisions
export interface CoordinationDecision {
  id: string;
  timestamp: number;
  decisionMaker: CoordinationRole;
  decisionType: 'strategic''' | '''tactical';
  action: string;
  parameters: Record<string, unknown>;
  confidence: number;
  reasoning: string;
}

// Coordination configuration
export interface CoordinationConfig {
  hierarchy: {
    enableQueens: boolean;
    enableCommanders: boolean;
    enableMatrons: boolean;
  };
  coordination: {
    timeout: number;
    concurrency: number;
  };
}

// Performance metrics
export interface CoordinationMetrics {
  decisionsMade: number;
  averageDecisionTime: number;
  successRate: number;
  swarmsCoordinated: number;
}
