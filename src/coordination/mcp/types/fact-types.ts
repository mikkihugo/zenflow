/**
 * @fileoverview FACT System TypeScript Types
 * Comprehensive type definitions for FACT (Fast Augmented Context Tools) system coordination
 */

/**
 * Core FACT System Types
 */
export interface FACTSystemConfig {
  backend: 'sqlite' | 'memory' | 'file' | 'jsonb';
  maxMemoryCacheSize: number;
  defaultTTL: number; // milliseconds
  cleanupInterval: number; // milliseconds
  maxEntryAge: number; // milliseconds
  backendConfig?: Record<string, any>;
}

export interface FACTKnowledgeEntry {
  id: string;
  query: string;
  title: string;
  content: string;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  metadata: FACTKnowledgeMetadata;
}

export interface FACTKnowledgeMetadata {
  type: 'web' | 'docs' | 'github' | 'api' | 'papers' | 'forum' | 'manual';
  source: string;
  domains: string[];
  language?: string;
  quality: number; // 0-1
  relevance: number; // 0-1
  freshness: number; // 0-1
  tags: string[];
  author?: string;
  publishedAt?: number;
  extractedAt: number;
}

export interface FACTSearchQuery {
  query: string;
  type?: string;
  domains?: string[];
  tags?: string[];
  minQuality?: number;
  maxAge?: number; // milliseconds
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'timestamp' | 'quality' | 'access_count';
  sortOrder?: 'asc' | 'desc';
}

export interface FACTStorageStats {
  memoryEntries: number;
  persistentEntries: number;
  totalMemorySize: number; // bytes
  cacheHitRate: number; // 0-1
  oldestEntry: number; // timestamp
  newestEntry: number; // timestamp
  topDomains: string[];
  storageHealth: 'excellent' | 'good' | 'fair' | 'poor';
  domainDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  qualityDistribution: { high: number; medium: number; low: number };
}

/**
 * FACT Storage Backend Interface
 */
export interface FACTStorageBackend {
  initialize(): Promise<void>;
  store(entry: FACTKnowledgeEntry): Promise<void>;
  get(id: string): Promise<FACTKnowledgeEntry | null>;
  search(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
  cleanup(maxAge: number): Promise<number>;
  getStats(): Promise<Partial<FACTStorageStats>>;
  shutdown(): Promise<void>;
}

/**
 * FACT Swarm System Types
 */
export interface FACTSwarmAgent {
  id: string;
  type: 'researcher' | 'analyzer' | 'gatherer' | 'coordinator' | 'specialist';
  name: string;
  specialization: string;
  sources: string[];
  capabilities: string[];
  status: 'idle' | 'active' | 'busy' | 'error' | 'offline';
  createdAt: number;
  lastActiveAt: number;
  metrics: FACTAgentMetrics;
}

export interface FACTAgentMetrics {
  missionsCompleted: number;
  successRate: number; // 0-1
  avgExecutionTime: number; // milliseconds
  qualityScore: number; // 0-1
  knowledgeGathered: number;
  errorsEncountered: number;
  lastPerformanceReview: number;
}

export interface FACTSwarmMission {
  id: string;
  description: string;
  strategy: 'parallel' | 'sequential' | 'adaptive';
  timeLimit: number; // seconds
  qualityThreshold: number; // 0-1
  sources: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  assignedAgents: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  progress: number; // 0-1
  results: FACTMissionResults;
}

export interface FACTMissionResults {
  knowledge: FACTKnowledgeEntry[];
  executionTime: number; // milliseconds
  successRate: number; // 0-1
  qualityScore: number; // 0-1
  relevanceScore: number; // 0-1
  freshnessScore: number; // 0-1
  completeness: number; // 0-1
  cacheHitRate: number; // 0-1
  errors: FACTMissionError[];
  agentPerformance: Record<string, FACTAgentPerformance>;
}

export interface FACTMissionError {
  agentId: string;
  timestamp: number;
  error: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

export interface FACTAgentPerformance {
  agentId: string;
  tasksAssigned: number;
  tasksCompleted: number;
  avgExecutionTime: number;
  qualityContribution: number;
  errorsCount: number;
}

export interface FACTSwarmStatus {
  activeMissions: number;
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  successRate: number; // 0-1
  avgMissionTime: number; // milliseconds
  totalKnowledgeGathered: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * FACT Project Analysis Types
 */
export interface FACTProjectAnalysis {
  projectPath: string;
  fileCount: number;
  totalLines: number;
  primaryLanguage: string;
  technologies: string[];
  patterns: string[];
  knowledgeNeeds: FACTKnowledgeNeed[];
  recommendations: string[];
  complexity: 'low' | 'medium' | 'high' | 'expert';
  analysisTimestamp: number;
}

export interface FACTKnowledgeNeed {
  category: 'technology' | 'pattern' | 'library' | 'concept' | 'implementation' | 'best_practice';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  suggestedSources: string[];
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  context?: string[];
}

/**
 * FACT Performance Monitoring Types
 */
export interface FACTMonitoringSession {
  id: string;
  missionId?: string;
  duration: number; // seconds
  metrics: string[];
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'failed';
}

export interface FACTMonitoringResults {
  sessionId: string;
  activeMissions: number;
  completedTasks: number;
  metrics: {
    performance: FACTPerformanceMetrics;
    quality: FACTQualityMetrics;
    efficiency: FACTEfficiencyMetrics;
    coverage: FACTCoverageMetrics;
  };
  agentPerformance: FACTAgentPerformance[];
  insights: string[];
  optimizations: string[];
}

export interface FACTPerformanceMetrics {
  successRate: number; // 0-1
  avgResponseTime: number; // milliseconds
  throughput: number; // tasks per minute
  errorRate: number; // 0-1
  systemUtilization: number; // 0-1
}

export interface FACTQualityMetrics {
  avgScore: number; // 0-10
  distribution: {
    excellent: number; // 9-10
    good: number; // 7-8
    fair: number; // 5-6
    poor: number; // 0-4
  };
  consistencyScore: number; // 0-1
  relevanceScore: number; // 0-1
}

export interface FACTEfficiencyMetrics {
  cacheHitRate: number; // 0-1
  duplicateRate: number; // 0-1
  resourceUtilization: number; // 0-1
  costPerKnowledge: number; // arbitrary units
}

export interface FACTCoverageMetrics {
  sourcesCovered: string[];
  topicsCovered: string[];
  gapsIdentified: string[];
  coverageCompleteness: number; // 0-1
}

/**
 * FACT Cache Optimization Types
 */
export interface FACTCacheOptimization {
  strategy: 'aggressive' | 'balanced' | 'conservative';
  targetHitRate: number; // 0-1
  maxMemoryUsage: number; // bytes
  autoTune: boolean;
}

export interface FACTOptimizationResult {
  executionTime: number; // milliseconds
  optimizations: FACTOptimizationAction[];
  recommendations: string[];
  performanceGain: number; // 0-1
  memoryReduction: number; // bytes
  hitRateImprovement: number; // 0-1
}

export interface FACTOptimizationAction {
  type: 'cache_resize' | 'entry_cleanup' | 'index_rebuild' | 'compression' | 'partitioning';
  description: string;
  impact: 'low' | 'medium' | 'high';
  executionTime: number; // milliseconds
}

export interface FACTClearResult {
  entriesRemoved: number;
  memoryFreed: number; // bytes
  executionTime: number; // milliseconds
  warnings: string[];
}

/**
 * FACT Integration Types
 */
export interface FACTRAGIntegration {
  ragServiceUrl: string;
  sharedADRAccess: boolean;
  domainSpecificRAG: Record<string, string>; // domain -> RAG service URL
  hiveRAGAccess: boolean;
  syncStrategy: 'one_way' | 'bidirectional' | 'none';
}

export interface FACTRAGQuery {
  query: string;
  scope: 'service' | 'domain' | 'hive' | 'adr_global';
  contextType?: string;
  maxResults?: number;
}

export interface FACTRAGResult {
  entries: any[]; // RAG system specific format
  metadata: {
    source: string;
    confidence: number;
    processingTime: number;
  };
}

/**
 * FACT Tool Result Types (extending MCP types)
 */
export interface FACTToolContext {
  toolName: string;
  executionId: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface FACTToolMetrics {
  executionTime: number;
  memoryUsed: number;
  cacheHits: number;
  cacheMisses: number;
  errorsCount: number;
}

export interface FACTToolResult {
  success: boolean;
  data?: any;
  error?: string;
  context: FACTToolContext;
  metrics: FACTToolMetrics;
  recommendations?: string[];
}

/**
 * FACT Event Types
 */
export type FACTEventType =
  | 'system_initialized'
  | 'storage_optimized'
  | 'cache_cleared'
  | 'mission_started'
  | 'mission_completed'
  | 'agent_spawned'
  | 'knowledge_stored'
  | 'error_occurred'
  | 'performance_threshold_exceeded';

export interface FACTEvent {
  type: FACTEventType;
  timestamp: number;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
}

/**
 * Utility types
 */
export type FACTToolName =
  | 'fact_init'
  | 'fact_analyze_project'
  | 'fact_gather'
  | 'fact_query'
  | 'fact_status'
  | 'fact_swarm_spawn'
  | 'fact_swarm_mission'
  | 'fact_swarm_monitor'
  | 'fact_swarm_results'
  | 'fact_cache_status'
  | 'fact_cache_clear'
  | 'fact_storage_optimize';

export type FACTAgentType = 'researcher' | 'analyzer' | 'gatherer' | 'coordinator' | 'specialist';
export type FACTMissionStrategy = 'parallel' | 'sequential' | 'adaptive';
export type FACTComplexityLevel = 'simple' | 'moderate' | 'complex' | 'expert';
export type FACTHealthStatus = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Re-export common types for convenience
 */
export type { MCPTool, MCPToolResult } from '../mcp-types';
