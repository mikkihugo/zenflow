/**
 * Shared Interface Contracts0.
 *
 * Defines the contracts and abstractions that interfaces can depend on0.
 * Without creating cross-interface dependencies0.
 */
/**
 * @file Interface implementation: contracts0.
 */

import type { CommandResult, ExecutionContext } from '0./command-interfaces';
import type { ComponentStatus } from '0./types';

// Define types that are used in contracts but don't exist elsewhere
export interface CommandContext extends ExecutionContext {
  timestamp?: string;
  user?: string;
}

export interface ProjectConfig {
  name: string;
  type: string;
  path: string;
  template?: string;
  options?: Record<string, unknown>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memory?: number;
  cpu?: number;
  components: ComponentStatus[];
}

/**
 * Project Management Contract0.
 *
 * Abstract interface for project management operations that can be0.
 * Implemented by different interface layers0.0.
 *
 * @example
 */
export interface ProjectManagerContract {
  createProject(config: ProjectConfig): Promise<CommandResult>;
  optimizeProject(path: string): Promise<CommandResult>;
  getProjectStatus(path: string): Promise<SystemHealth>;
  listProjects(): Promise<ProjectSummary[]>;
}

export interface ProjectSummary {
  readonly name: string;
  readonly path: string;
  readonly type: string;
  readonly status: ComponentStatus;
  readonly lastModified: Date;
}

/**
 * Command Execution Contract0.
 *
 * Abstract interface for command execution that can be implemented0.
 * By different command engines0.0.
 *
 * @example
 */
export interface CommandExecutorContract {
  executeCommand(context: CommandContext): Promise<CommandResult>;
  isValidCommand(command: string): boolean;
  getCommandHelp(command?: string): string;
  getAvailableCommands(): string[];
}

/**
 * Swarm Coordination Contract0.
 *
 * Abstract interface for swarm operations that interfaces can use0.
 * Without depending on specific swarm implementations0.0.
 *
 * @example
 */
export interface SwarmCoordinatorContract {
  initializeSwarm(config: SwarmConfig): Promise<CommandResult>;
  monitorSwarm(swarmId: string): Promise<SwarmStatus>;
  coordinateTask(task: SwarmTask): Promise<CommandResult>;
  terminateSwarm(swarmId: string): Promise<CommandResult>;
}

export interface SwarmConfig {
  readonly topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  readonly agentCount: number;
  readonly strategy: 'parallel' | 'sequential' | 'adaptive';
}

export interface SwarmStatus {
  readonly id: string;
  readonly status: 'active' | 'inactive' | 'error';
  readonly agents: number;
  readonly performance: number;
  readonly efficiency: number;
}

export interface SwarmTask {
  readonly description: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly strategy?: string;
  readonly timeout?: number;
}

/**
 * System Monitoring Contract0.
 *
 * Abstract interface for system monitoring and health checks0.
 *
 * @example
 */
export interface SystemMonitorContract {
  getSystemHealth(): Promise<SystemHealth>;
  getComponentStatus(component: string): Promise<ComponentStatus>;
  runHealthCheck(): Promise<CommandResult>;
  getMetrics(): Promise<SystemMetrics>;
}

export interface SystemMetrics {
  readonly cpu: number;
  readonly memory: number;
  readonly disk: number;
  readonly network: number;
  readonly uptime: number;
  readonly performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  readonly responseTime: number;
  readonly throughput: number;
  readonly errorRate: number;
  readonly availability: number;
}

/**
 * Data Service Contract0.
 *
 * Abstract interface for data operations that interfaces can use0.
 *
 * @example
 */
export interface DataServiceContract {
  getData<T>(key: string): Promise<T | null>;
  setData<T>(key: string, value: T): Promise<void>;
  removeData(key: string): Promise<void>;
  listKeys(pattern?: string): Promise<string[]>;
}

/**
 * Configuration Contract0.
 *
 * Abstract interface for configuration management0.
 *
 * @example
 */
export interface ConfigurationContract {
  getConfig<T>(key: string): T | undefined;
  setConfig<T>(key: string, value: T): void;
  loadConfig(path: string): Promise<void>;
  saveConfig(path: string): Promise<void>;
}
