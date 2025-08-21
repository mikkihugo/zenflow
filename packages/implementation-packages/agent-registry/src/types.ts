/**
 * @fileoverview Agent Registry Types
 * 
 * Type definitions for the agent registry system, including configuration,
 * metadata, lifecycle management, and health monitoring types.
 * 
 * @package @claude-zen/agent-registry
 * @version 1.0.0
 */

export interface AgentRegistrationConfig {
  templateId: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface AgentInstance {
  id: string;
  templateId: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error' | 'disposed';
  config: Record<string, unknown>;
  capabilities: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  lastActivity: Date;
  health: AgentHealthStatus;
}

export interface AgentHealthStatus {
  isHealthy: boolean;
  lastCheckAt: Date;
  errorCount: number;
  lastError?: Error;
  uptime: number;
  performance: {
    averageResponseTime: number;
    tasksCompleted: number;
    successRate: number;
  };
}

export interface AgentRegistryOptions {
  healthCheckInterval?: number;
  autoCleanup?: boolean;
  maxRetries?: number;
  defaultTimeout?: number;
  persistentStorage?: boolean;
}

export interface AgentTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  defaultConfig: Record<string, unknown>;
  requiredCapabilities: string[];
  optionalCapabilities: string[];
  metadata: Record<string, unknown>;
}

export interface RegistryStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  errorAgents: number;
  averageHealth: number;
  topCapabilities: string[];
  performanceMetrics: {
    averageResponseTime: number;
    totalTasksCompleted: number;
    overallSuccessRate: number;
  };
}