/**
 * Swarm Service
 *
 * Provides swarm operations including start, stop, status, and monitoring.
 * Integrates with the claude-flow swarm system and manages agent lifecycle.
 */

import type { ChildProcess } from 'child_process';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { Result } from '../types/index';
import { ensureDirectory, fileExists } from '../utils/file-system';
import { createLogger, type Logger } from '../utils/logger';

/**
 * Swarm topology types
 */
export type SwarmTopology = 'mesh' | 'hierarchical' | 'ring' | 'star';

/**
 * Swarm agent configuration
 */
export interface SwarmAgent {
  /** Agent ID */
  id: string;

  /** Agent type/role */
  type: string;

  /** Agent name */
  name: string;

  /** Agent status */
  status: 'active' | 'inactive' | 'error';

  /** Process ID (if running) */
  pid?: number;

  /** Agent configuration */
  config: Record<string, any>;

  /** Creation timestamp */
  createdAt: Date;

  /** Last activity timestamp */
  lastActivity?: Date;

  /** Agent metrics */
  metrics: {
    tasksCompleted: number;
    tasksActive: number;
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

/**
 * Swarm configuration
 */
export interface SwarmConfig {
  /** Swarm ID */
  id: string;

  /** Swarm topology */
  topology: SwarmTopology;

  /** Maximum number of agents */
  maxAgents: number;

  /** Swarm strategy */
  strategy: 'balanced' | 'specialized' | 'adaptive' | 'parallel';

  /** Auto-scaling configuration */
  autoScale?: {
    enabled: boolean;
    minAgents: number;
    maxAgents: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
  };

  /** Resource limits */
  resourceLimits?: {
    maxMemory: number;
    maxCpu: number;
    maxDisk: number;
  };

  /** Persistence settings */
  persistence?: {
    enabled: boolean;
    storageType: 'file' | 'database' | 'memory';
    location?: string;
  };
}

/**
 * Swarm status information
 */
export interface SwarmStatus {
  /** Swarm ID */
  id: string;

  /** Overall status */
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';

  /** Number of active agents */
  activeAgents: number;

  /** Total number of agents */
  totalAgents: number;

  /** Swarm configuration */
  config: SwarmConfig;

  /** Start time */
  startTime?: Date;

  /** Uptime in milliseconds */
  uptime: number;

  /** Current tasks */
  activeTasks: number;

  /** Completed tasks */
  completedTasks: number;

  /** Error count */
  errorCount: number;

  /** Resource usage */
  resourceUsage: {
    memory: number;
    cpu: number;
    disk: number;
  };
}

/**
 * Swarm metrics
 */
export interface SwarmMetrics {
  /** Metrics timestamp */
  timestamp: Date;

  /** Performance metrics */
  performance: {
    throughput: number;
    latency: number;
    errorRate: number;
    successRate: number;
  };

  /** Resource metrics */
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkIO: number;
  };

  /** Agent metrics */
  agents: {
    active: number;
    idle: number;
    busy: number;
    failed: number;
  };

  /** Task metrics */
  tasks: {
    queued: number;
    running: number;
    completed: number;
    failed: number;
  };
}

/**
 * Swarm operation result
 */
export interface SwarmOperationResult {
  /** Operation success */
  success: boolean;

  /** Operation message */
  message: string;

  /** Operation details */
  details?: any;

  /** Operation duration */
  duration?: number;

  /** Affected agents */
  affectedAgents?: string[];
}

/**
 * Swarm service implementation
 */
export class SwarmService extends EventEmitter {
  private logger: Logger;
  private swarms = new Map<string, SwarmStatus>();
  private processes = new Map<string, ChildProcess>();
  private dataDir: string;
  private initialized = false;

  constructor(config?: Record<string, any>) {
    super();
    this.logger = createLogger({ prefix: 'SwarmService' });
    this.dataDir = config?.dataDir || join(process.cwd(), 'data', 'swarms');
  }

  /**
   * Initialize the swarm service
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Ensure data directory exists
      await ensureDirectory(this.dataDir);

      // Load existing swarms
      await this.loadSwarms();

      this.initialized = true;
      this.logger.info('Swarm service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize swarm service:', error);
      throw error;
    }
  }

  /**
   * Dispose the swarm service
   */
  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      // Stop all running swarms
      const stopPromises = Array.from(this.swarms.keys()).map((id) => this.stopSwarm(id));

      await Promise.all(stopPromises);

      this.swarms.clear();
      this.processes.clear();
      this.initialized = false;

      this.logger.info('Swarm service disposed');
    } catch (error) {
      this.logger.error('Error disposing swarm service:', error);
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      if (!this.initialized) {
        return {
          healthy: false,
          message: 'Service not initialized',
        };
      }

      // Check if data directory is accessible
      if (!existsSync(this.dataDir)) {
        return {
          healthy: false,
          message: 'Data directory not accessible',
        };
      }

      // Check running swarms
      const runningSwarms = Array.from(this.swarms.values()).filter(
        (swarm) => swarm.status === 'running'
      ).length;

      return {
        healthy: true,
        message: `${runningSwarms} swarms running`,
      };
    } catch (error) {
      return {
        healthy: false,
        message: (error as Error).message,
      };
    }
  }

  /**
   * Start a new swarm
   */
  async startSwarm(config: SwarmConfig): Promise<Result<SwarmOperationResult>> {
    try {
      this.logger.info(`Starting swarm: ${config.id}`);

      // Check if swarm already exists
      if (this.swarms.has(config.id)) {
        const existing = this.swarms.get(config.id)!;
        if (existing.status === 'running') {
          return {
            success: false,
            error: new Error(`Swarm ${config.id} is already running`),
          };
        }
      }

      // Create swarm status
      const swarmStatus: SwarmStatus = {
        id: config.id,
        status: 'starting',
        activeAgents: 0,
        totalAgents: 0,
        config,
        startTime: new Date(),
        uptime: 0,
        activeTasks: 0,
        completedTasks: 0,
        errorCount: 0,
        resourceUsage: {
          memory: 0,
          cpu: 0,
          disk: 0,
        },
      };

      this.swarms.set(config.id, swarmStatus);

      // Start swarm process (mock implementation - would integrate with actual swarm system)
      const process = await this.spawnSwarmProcess(config);
      this.processes.set(config.id, process);

      // Update status
      swarmStatus.status = 'running';
      this.swarms.set(config.id, swarmStatus);

      // Save swarm state
      await this.saveSwarmState(config.id);

      this.emit('swarmStarted', { swarmId: config.id, config });

      return {
        success: true,
        data: {
          success: true,
          message: `Swarm ${config.id} started successfully`,
          details: swarmStatus,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to start swarm ${config.id}:`, error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Stop a swarm
   */
  async stopSwarm(swarmId: string): Promise<Result<SwarmOperationResult>> {
    try {
      this.logger.info(`Stopping swarm: ${swarmId}`);

      const swarm = this.swarms.get(swarmId);
      if (!swarm) {
        return {
          success: false,
          error: new Error(`Swarm ${swarmId} not found`),
        };
      }

      if (swarm.status === 'stopped') {
        return {
          success: true,
          data: {
            success: true,
            message: `Swarm ${swarmId} is already stopped`,
          },
        };
      }

      // Update status
      swarm.status = 'stopping';
      this.swarms.set(swarmId, swarm);

      // Stop process
      const process = this.processes.get(swarmId);
      if (process && !process.killed) {
        process.kill('SIGTERM');

        // Wait for graceful shutdown or force kill after timeout
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            if (!process.killed) {
              process.kill('SIGKILL');
            }
            resolve();
          }, 5000);

          process.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }

      // Update status
      swarm.status = 'stopped';
      swarm.activeAgents = 0;
      this.swarms.set(swarmId, swarm);
      this.processes.delete(swarmId);

      // Save swarm state
      await this.saveSwarmState(swarmId);

      this.emit('swarmStopped', { swarmId });

      return {
        success: true,
        data: {
          success: true,
          message: `Swarm ${swarmId} stopped successfully`,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to stop swarm ${swarmId}:`, error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get swarm status
   */
  async getSwarmStatus(swarmId: string): Promise<Result<SwarmStatus>> {
    try {
      const swarm = this.swarms.get(swarmId);
      if (!swarm) {
        return {
          success: false,
          error: new Error(`Swarm ${swarmId} not found`),
        };
      }

      // Update uptime
      if (swarm.startTime && swarm.status === 'running') {
        swarm.uptime = Date.now() - swarm.startTime.getTime();
      }

      return {
        success: true,
        data: swarm,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * List all swarms
   */
  async listSwarms(): Promise<Result<SwarmStatus[]>> {
    try {
      const swarms = Array.from(this.swarms.values());

      // Update uptimes
      swarms.forEach((swarm) => {
        if (swarm.startTime && swarm.status === 'running') {
          swarm.uptime = Date.now() - swarm.startTime.getTime();
        }
      });

      return {
        success: true,
        data: swarms,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Get swarm metrics
   */
  async getSwarmMetrics(swarmId: string): Promise<Result<SwarmMetrics>> {
    try {
      const swarm = this.swarms.get(swarmId);
      if (!swarm) {
        return {
          success: false,
          error: new Error(`Swarm ${swarmId} not found`),
        };
      }

      // Mock metrics - would integrate with actual monitoring system
      const metrics: SwarmMetrics = {
        timestamp: new Date(),
        performance: {
          throughput: Math.random() * 100,
          latency: Math.random() * 50,
          errorRate: Math.random() * 5,
          successRate: 95 + Math.random() * 5,
        },
        resources: {
          memoryUsage: swarm.resourceUsage.memory,
          cpuUsage: swarm.resourceUsage.cpu,
          diskUsage: swarm.resourceUsage.disk,
          networkIO: Math.random() * 1000,
        },
        agents: {
          active: swarm.activeAgents,
          idle: Math.floor(swarm.activeAgents * 0.3),
          busy: Math.floor(swarm.activeAgents * 0.7),
          failed: 0,
        },
        tasks: {
          queued: Math.floor(Math.random() * 10),
          running: swarm.activeTasks,
          completed: swarm.completedTasks,
          failed: swarm.errorCount,
        },
      };

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Spawn agent in swarm
   */
  async spawnAgent(swarmId: string, agentConfig: Partial<SwarmAgent>): Promise<Result<SwarmAgent>> {
    try {
      const swarm = this.swarms.get(swarmId);
      if (!swarm) {
        return {
          success: false,
          error: new Error(`Swarm ${swarmId} not found`),
        };
      }

      if (swarm.status !== 'running') {
        return {
          success: false,
          error: new Error(`Swarm ${swarmId} is not running`),
        };
      }

      if (swarm.totalAgents >= swarm.config.maxAgents) {
        return {
          success: false,
          error: new Error(`Swarm ${swarmId} has reached maximum agent limit`),
        };
      }

      const agent: SwarmAgent = {
        id: agentConfig.id || `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: agentConfig.type || 'worker',
        name: agentConfig.name || 'Unnamed Agent',
        status: 'active',
        config: agentConfig.config || {},
        createdAt: new Date(),
        metrics: {
          tasksCompleted: 0,
          tasksActive: 0,
          uptime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
        },
      };

      // Update swarm counts
      swarm.totalAgents++;
      swarm.activeAgents++;
      this.swarms.set(swarmId, swarm);

      // Save state
      await this.saveSwarmState(swarmId);

      this.emit('agentSpawned', { swarmId, agent });

      return {
        success: true,
        data: agent,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Spawn swarm process (mock implementation)
   */
  private async spawnSwarmProcess(config: SwarmConfig): Promise<ChildProcess> {
    // This would integrate with the actual claude-flow swarm system
    // For now, we'll create a mock process
    const process = spawn(
      'node',
      [
        '-e',
        `
      console.log('Swarm ${config.id} starting...');
      setInterval(() => {
        console.log('Swarm ${config.id} heartbeat');
      }, 30000);
      
      process.on('SIGTERM', () => {
        console.log('Swarm ${config.id} shutting down...');
        process.exit(0);
      });
    `,
      ],
      {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

    process.stdout?.on('data', (data) => {
      this.logger.debug(`Swarm ${config.id}:`, data.toString().trim());
    });

    process.stderr?.on('data', (data) => {
      this.logger.error(`Swarm ${config.id} error:`, data.toString().trim());
    });

    process.on('exit', (code) => {
      this.logger.info(`Swarm ${config.id} exited with code ${code}`);
      const swarm = this.swarms.get(config.id);
      if (swarm) {
        swarm.status = 'stopped';
        swarm.activeAgents = 0;
        this.swarms.set(config.id, swarm);
      }
      this.emit('swarmExited', { swarmId: config.id, code });
    });

    return process;
  }

  /**
   * Load existing swarms from storage
   */
  private async loadSwarms(): Promise<void> {
    try {
      const swarmFiles = existsSync(this.dataDir)
        ? require('fs')
            .readdirSync(this.dataDir)
            .filter((f: string) => f.endsWith('.json'))
        : [];

      for (const file of swarmFiles) {
        try {
          const filePath = join(this.dataDir, file);
          const data = await readFile(filePath, 'utf8');
          const swarm = JSON.parse(data) as SwarmStatus;

          // Mark stopped swarms as stopped (they don't survive restarts)
          if (swarm.status === 'running') {
            swarm.status = 'stopped';
            swarm.activeAgents = 0;
          }

          this.swarms.set(swarm.id, swarm);
        } catch (error) {
          this.logger.warn(`Failed to load swarm from ${file}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to load swarms:', error);
    }
  }

  /**
   * Save swarm state to storage
   */
  private async saveSwarmState(swarmId: string): Promise<void> {
    try {
      const swarm = this.swarms.get(swarmId);
      if (!swarm) {
        return;
      }

      const filePath = join(this.dataDir, `${swarmId}.json`);
      await writeFile(filePath, JSON.stringify(swarm, null, 2));
    } catch (error) {
      this.logger.error(`Failed to save swarm state for ${swarmId}:`, error);
    }
  }
}
