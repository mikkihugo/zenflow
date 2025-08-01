/**
 * Swarm UI Types - Comprehensive type definitions for swarm-focused UI components
 * Aligned with swarm orchestration patterns and coordination workflows
 */

// Core swarm status and metrics types
export interface SwarmStatus {
  status: 'active' | 'idle' | 'error' | 'initializing' | 'coordinating';
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star' | 'distributed';
  totalAgents: number;
  activeAgents: number;
  uptime: number;
  isInitialized: boolean;
}

export interface SwarmMetrics {
  totalAgents: number;
  activeAgents: number;
  tasksInProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  uptime: number;
  performance: {
    throughput: number; // tasks per minute
    errorRate: number; // 0-1 percentage
    avgLatency: number; // milliseconds
  };
}

export interface SwarmAgent {
  id: string;
  role: string;
  type?: string;
  name?: string;
  status: 'active' | 'idle' | 'busy' | 'error' | 'stopped';
  capabilities: string[];
  currentTask?: string;
  lastActivity: Date;
  metrics: {
    tasksCompleted: number;
    averageResponseTime: number;
    errors: number;
    successRate: number;
    totalTasks: number;
  };
  cognitivePattern?: string;
  performanceScore?: number;
}

export interface SwarmTask {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'assigned';
  assignedAgents: string[];
  progress: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  requirements?: {
    capabilities: string[];
    minAgents: number;
    maxAgents: number;
    timeout?: number;
  };
  dependencies?: string[];
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// Coordination and orchestration types
export interface SwarmCoordination {
  topology: SwarmStatus['topology'];
  connectionDensity: number;
  syncInterval: number;
  loadBalancing: 'round-robin' | 'least-loaded' | 'capability-based';
  failureHandling: 'retry' | 'redistribute' | 'isolate';
  autoScale: boolean;
  maxAgents: number;
}

export interface SwarmMemory {
  sessionId: string;
  agentMemories: Map<string, any>;
  sharedContext: Record<string, any>;
  persistentState: Record<string, any>;
  coordinationHistory: Array<{
    timestamp: Date;
    action: string;
    agentId: string;
    context: any;
  }>;
}

// Neural network and AI types
export interface NeuralPatterns {
  cognitivePatterns: string[];
  learningRate: number;
  trainingData: Array<{
    input: any;
    output: any;
    feedback: number;
  }>;
  modelPerformance: {
    accuracy: number;
    loss: number;
    epochs: number;
  };
}

// UI component base types
export interface BaseUIProps {
  testId?: string;
  className?: string;
  swarmContext?: {
    swarmId: string;
    agentId?: string;
    taskId?: string;
  };
}

// Event types for swarm UI interactions
export type SwarmUIEvent =
  | 'swarm:initialized'
  | 'swarm:agent_added'
  | 'swarm:agent_removed'
  | 'swarm:task_created'
  | 'swarm:task_assigned'
  | 'swarm:task_completed'
  | 'swarm:task_failed'
  | 'swarm:coordination_update'
  | 'swarm:metrics_update'
  | 'swarm:error';

export interface SwarmEventData {
  timestamp: Date;
  eventType: SwarmUIEvent;
  swarmId: string;
  agentId?: string;
  taskId?: string;
  data: any;
}

// Configuration types
export interface SwarmUIConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    errorColor: string;
    successColor: string;
  };
  refreshInterval: number;
  maxVisibleAgents: number;
  maxVisibleTasks: number;
  showAdvancedMetrics: boolean;
  enableRealTimeUpdates: boolean;
  debugMode: boolean;
}
