export interface HiveFACTConfig {
  enableCache?: boolean;
  cacheSize?: number;
  knowledgeSources?: string[];
  autoRefreshInterval?: number;
}

export interface UniversalFact {
  id: string;
  type: 'npm-package' | 'github-repo' | 'api-docs' | 'security-advisory' | 'general' | 'external';
  category: string;
  subject: string; // e.g., "react@18.2.0", "github.com/facebook/react"
  content: any;
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
  swarmAccess: Set<string>; // Which swarms have accessed this fact
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
  result?: any;
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
