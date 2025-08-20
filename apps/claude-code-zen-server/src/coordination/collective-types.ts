/**
 * @file THE COLLECTIVE coordination type definitions.
 *
 * Borg Architecture: THE COLLECTIVE → CUBES (Matrons) → SWARMS (Queens) → DRONES
 */

import type {
  AgentId,
  AgentMetrics,
  AgentStatus,
  AgentType,
} from './types/interfaces';

export interface CollectiveFACTConfig {
  enableCache?: boolean;
  cacheSize?: number;
  knowledgeSources?: string[];
  autoRefreshInterval?: number;
}

export interface UniversalFact {
  id: string;
  type:
    | 'npm-package'
    | 'github-repo'
    | 'api-docs'
    | 'security-advisory'
    | 'general'
    | 'external';
  category: string;
  subject: string; // e.g., "react@18.2.0", "github.com/facebook/react"
  content: Record<string, unknown> | string | null;
  source: string;
  confidence: number;
  timestamp: number;
  refreshInterval?: number;
  metadata: {
    source: string;
    timestamp: number;
    confidence: number;
    ttl?: number; // Time to live
  };
  accessCount: number;
  cubeAccess: Set<string>; // Which cubes have accessed this fact
  swarmAccess: Set<string>; // Which swarms have accessed this fact
  freshness?: 'fresh' | 'stale' | 'expired'; // Track data freshness
}

// ==========================================
// BORG ARCHITECTURE TYPES
// ==========================================

/** Cube Information - Specialized domain containers */
export interface CubeInfo {
  id: string;
  name: string;
  type:
    | 'OPS-CUBE'
    | 'DEV-CUBE'
    | 'RESEARCH-CUBE'
    | 'SECURITY-CUBE'
    | 'DATA-CUBE';
  matron: string; // Designate-Matron ID
  queens: string[]; // Queen Ds coordinating this cube
  status: 'active' | 'standby' | 'maintenance' | 'error';
  capacity: {
    maxDrones: number;
    currentDrones: number;
    maxQueens: number;
    currentQueens: number;
  };
  performance: CubePerformanceMetrics;
  created: Date;
  lastSync: Date;
}

/** Cube Performance Metrics */
export interface CubePerformanceMetrics {
  tasksCompleted: number;
  avgProcessingTime: number;
  errorRate: number;
  resourceUtilization: number;
  efficiency: number; // 0-1 scale
  borgRating:
    | 'optimal'
    | 'acceptable'
    | 'inefficient'
    | 'requires-assimilation';
}

/** Collective Health Metrics - Overall system status */
export interface CollectiveHealthMetrics {
  overallStatus: 'optimal' | 'degraded' | 'critical' | 'offline';
  activeCubes: number;
  totalDrones: number;
  totalQueens: number;
  totalMatrons: number;
  systemLoad: number; // 0-1 scale
  consensusHealth: number; // 0-1 scale
  networkLatency: number;
  lastAssimilation: Date;
  borgEfficiency: number; // 0-1 scale
}

/** Designate-Matron Interface - Cube Leaders */
export interface DesignateMatron {
  id: string;
  designation: string; // e.g., "Matron-Alpha", "Matron-Prime-01"
  cubeType: CubeInfo['type'];
  status: 'active' | 'standby' | 'maintenance';
  capabilities: string[];
  subordinateQueens: string[];
  decisionAuthority: 'tactical' | 'operational' | 'strategic';
  borgRank: number; // Hierarchy within matrons
}

/** THE COLLECTIVE Configuration */
export interface CollectiveConfig {
  maxMatrons: number;
  maxQueens: number;
  maxCubes: number;
  consensusThreshold: number;
  borgProtocol: boolean;
  assimilationMode: 'autonomous' | 'supervised' | 'manual';
}

export interface GlobalAgentInfo {
  id: AgentId;
  name: string;
  type: AgentType;
  status: AgentStatus;
  swarmId: string;
  hiveMindId: string;
  capabilities: AgentCapability[];
  currentWorkload: number;
  availability: AgentAvailability;
  lastSync: Date;
  networkLatency: number;
  metrics?: AgentMetrics;
  health?: number;
}

export interface SwarmInfo {
  id: string;
  hiveMindId: string;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  agentCount: number;
  activeAgents: number;
  taskQueue: number;
  performance: SwarmPerformanceMetrics;
  lastHeartbeat: Date;
  location?: string;
}

export interface Task {
  id: string;
  type: string;
  priority: number;
  requirements: {
    capabilities: string[];
    minAgents: number;
    maxAgents: number;
    resources: {
      cpu?: number;
      memory?: number;
    };
  };
  status: 'pending' | 'assigned' | 'executing' | 'completed' | 'failed';
  assignedAgents: string[];
  result?: Record<string, unknown> | string | number | boolean | null;
}

export interface AgentCapability {
  type: string;
  level: number;
  resources: string[];
  specializations: string[];
}

export interface AgentAvailability {
  status: 'available' | 'busy' | 'reserved' | 'offline';
  currentTasks: number;
  maxConcurrentTasks: number;
  estimatedFreeTime?: Date;
  reservedFor?: string;
}

export interface SwarmPerformanceMetrics {
  averageResponseTime: number;
  tasksCompletedPerMinute: number;
  successRate: number;
  resourceEfficiency: number;
  qualityScore: number;
}

export interface GlobalResourceMetrics {
  totalCPU: number;
  usedCPU: number;
  totalMemory: number;
  usedMemory: number;
  totalAgents: number;
  availableAgents: number;
  busyAgents: number;
  networkBandwidth: number;
}

export interface HiveHealthMetrics {
  overallHealth: number;
  consensus: number;
  synchronization: number;
  faultTolerance: number;
  loadBalance: number;
}
