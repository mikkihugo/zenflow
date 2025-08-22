/**
 * Advanced Agent Lifecycle Management System
 * Provides dynamic agent spawning/termination, health monitoring,
 * automatic replacement, capability discovery, and performance ranking0.
 */
/**
 * @file Agent-lifecycle management system0.
 */

import {
  type ChildProcess,
  type SpawnOptions,
  spawn,
} from 'node:child_process';

import { TypedEventBase } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';

import type { EventBusInterface as EventBus } from '0.0./0.0./core/event-bus';

// Core lifecycle types0.
export interface AgentLifecycleConfig {
  maxAgents: number;
  minAgents: number;
  spawnTimeout: number;
  shutdownTimeout: number;
  healthCheckInterval: number;
  performanceWindow: number;
  autoRestart: boolean;
  autoScale: boolean;
  resourceLimits: ResourceLimits;
  qualityThresholds: QualityThresholds;
}

export interface ResourceLimits {
  maxCpuPercent: number;
  maxMemoryMB: number;
  maxNetworkMbps: number;
  maxDiskIOPS: number;
  maxOpenFiles: number;
  maxProcesses: number;
}

export interface QualityThresholds {
  minSuccessRate: number;
  minResponseTime: number;
  maxErrorRate: number;
  minReliability: number;
  minEfficiency: number;
}

export interface AgentTemplate {
  id: string;
  name: string;
  type: string;
  executable: string;
  args: string[];
  environment: Record<string, string>;
  capabilities: string[];
  resources: ResourceRequirements;
  healthCheck: HealthCheckConfig;
  scaling: ScalingConfig;
  metadata: Record<string, unknown>;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  gpu?: number;
  priority: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  endpoint?: string;
  command?: string;
  expectedOutput?: string;
  thresholds: {
    cpu: number;
    memory: number;
    responseTime: number;
    errorRate: number;
  };
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
  strategy: 'reactive' | 'predictive' | 'scheduled';
}

export interface AgentInstance {
  id: string;
  templateId: string;
  name: string;
  type: string;
  status: AgentStatus;
  process?: ChildProcess;
  pid?: number;
  startTime: Date;
  lastSeen: Date;
  health: HealthStatus;
  performance: PerformanceMetrics;
  resources: ResourceUsage;
  capabilities: DiscoveredCapabilities;
  assignments: TaskAssignment[];
  errors: AgentError[];
  metadata: Record<string, unknown>;
}

export type AgentStatus =
  | 'spawning'
  | 'initializing'
  | 'ready'
  | 'active'
  | 'idle'
  | 'busy'
  | 'degraded'
  | 'unhealthy'
  | 'terminating'
  | 'terminated'
  | 'failed';

export interface HealthStatus {
  overall: number; // 0-1
  components: {
    responsiveness: number;
    performance: number;
    reliability: number;
    resourceUsage: number;
    connectivity: number;
  };
  issues: HealthIssue[];
  trend: 'improving' | 'stable' | 'degrading';
  lastCheck: Date;
}

export interface HealthIssue {
  type:
    | 'performance'
    | 'reliability'
    | 'resource'
    | 'connectivity'
    | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
  impact: number; // 0-1
}

export interface PerformanceMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageResponseTime: number;
  successRate: number;
  throughput: number;
  efficiency: number;
  reliability: number;
  qualityScore: number;
  uptime: number;
  lastActivity: Date;
  trends: PerformanceTrend[];
}

export interface PerformanceTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  rate: number;
  confidence: number;
  period: number;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  gpu?: number;
  handles: number;
  threads: number;
  timestamp: Date;
}

export interface DiscoveredCapabilities {
  declared: string[];
  verified: string[];
  inferred: string[];
  specialized: string[];
  quality: Record<string, number>;
  confidence: Record<string, number>;
  lastUpdated: Date;
}

export interface TaskAssignment {
  taskId: string;
  assignedAt: Date;
  expectedDuration: number;
  status: 'assigned' | 'active' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  quality: number;
}

export interface AgentError {
  timestamp: Date;
  type:
    | 'startup'
    | 'runtime'
    | 'communication'
    | 'resource'
    | 'task'
    | 'shutdown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  recovered: boolean;
  recovery?: string;
}

export interface SpawnRequest {
  templateId: string;
  count: number;
  priority: number;
  constraints?: Record<string, unknown>;
  timeout?: number;
  requester: string;
  reason: string;
}

export interface SpawnResult {
  success: boolean;
  agentIds: string[];
  failures: Array<{ error: string; reason: string }>;
  duration: number;
}

export interface TerminationRequest {
  agentIds: string[];
  reason: string;
  graceful: boolean;
  timeout?: number;
  requester: string;
}

export interface TerminationResult {
  success: boolean;
  terminated: string[];
  failures: Array<{ agentId: string; error: string }>;
  duration: number;
}

export interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'no_action';
  targetCount: number;
  currentCount: number;
  reasoning: string[];
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface LifecycleMetrics {
  totalAgents: number;
  agentsByStatus: Record<AgentStatus, number>;
  agentsByType: Record<string, number>;
  spawnRate: number;
  terminationRate: number;
  averageLifetime: number;
  averageHealth: number;
  resourceUtilization: ResourceUsage;
  failureRate: number;
  recoveryRate: number;
}

/**
 * Advanced Agent Lifecycle Manager with intelligent orchestration0.
 *
 * @example
 */
export class AgentLifecycleManager extends TypedEventBase {
  private agents = new Map<string, AgentInstance>();
  private templates = new Map<string, AgentTemplate>();
  private spawnQueue: SpawnRequest[] = [];
  private terminationQueue: TerminationRequest[] = [];
  private healthMonitor: HealthMonitor;
  private performanceTracker: PerformanceTracker;
  // private resourceMonitor: ResourceMonitor;
  private capabilityDiscovery: CapabilityDiscovery;
  private scalingEngine: ScalingEngine;
  private recoveryEngine: RecoveryEngine;
  private metrics: LifecycleMetrics;
  private processingInterval?: NodeJS0.Timeout;
  private healthInterval?: NodeJS0.Timeout;
  private scalingInterval?: NodeJS0.Timeout;

  constructor(
    private configuration: AgentLifecycleConfig,
    private logger: Logger,
    private eventBus: EventBus
  ) {
    super();

    this0.healthMonitor = new HealthMonitor(this0.configuration, this0.logger);
    this0.performanceTracker = new PerformanceTracker(
      this0.configuration,
      this0.logger
    );
    // this0.resourceMonitor = new ResourceMonitor(this0.configuration, this0.logger);
    this0.capabilityDiscovery = new CapabilityDiscovery();
    this0.scalingEngine = new ScalingEngine(this0.configuration, this0.logger);
    this0.recoveryEngine = new RecoveryEngine(this0.configuration, this0.logger);

    this0.metrics = this?0.initializeMetrics;
    this?0.setupEventHandlers;
    this?0.startProcessing;
  }

  private setupEventHandlers(): void {
    this0.eventBus0.on('agent:heartbeat', (data: any) => {
      this0.handleAgentHeartbeat(data);
    });

    this0.eventBus0.on('agent:task-completed', (data: any) => {
      this0.handleTaskCompletion(data);
    });

    this0.eventBus0.on('agent:task-failed', (data: any) => {
      this0.handleTaskFailure(data);
    });

    this0.eventBus0.on('agent:error', this0.handleAgentError0.bind(this));

    this0.eventBus0.on(
      'system:resource-pressure',
      this0.handleResourcePressure0.bind(this)
    );

    this0.eventBus0.on(
      'workload:demand-change',
      this0.handleDemandChange0.bind(this)
    );
  }

  /**
   * Register an agent template0.
   *
   * @param template
   */
  async registerTemplate(template: AgentTemplate): Promise<void> {
    this0.templates0.set(template0.id, template);

    this0.logger0.info('Agent template registered', {
      templateId: template0.id,
      name: template0.name,
      type: template0.type,
      capabilities: template0.capabilities,
    });

    this0.emit('template:registered', { templateId: template0.id });
  }

  /**
   * Spawn agents from template0.
   *
   * @param request
   */
  async spawnAgents(request: SpawnRequest): Promise<SpawnResult> {
    const startTime = Date0.now();
    const template = this0.templates0.get(request0.templateId);

    if (!template) {
      throw new Error(`Template ${request0.templateId} not found`);
    }

    // Check limits
    if (this0.agents0.size + request0.count > this0.configuration0.maxAgents) {
      throw new Error(
        `Would exceed maximum agent limit (${this0.configuration0.maxAgents})`
      );
    }

    const result: SpawnResult = {
      success: true,
      agentIds: [],
      failures: [],
      duration: 0,
    };

    // Add to spawn queue if processing
    this0.spawnQueue0.push(request);

    try {
      // Spawn agents
      for (let i = 0; i < request0.count; i++) {
        try {
          const agentId = await this0.spawnSingleAgent(template, request);
          result?0.agentIds0.push(agentId);
        } catch (error) {
          result?0.failures?0.push({
            error: error instanceof Error ? error0.message : String(error),
            reason: 'spawn_failed',
          });
          result0.success = false;
        }
      }

      result0.duration = Date0.now() - startTime;

      this0.logger0.info('Agent spawn request completed', {
        templateId: request0.templateId,
        requested: request0.count,
        spawned: result?0.agentIds0.length,
        failures: result?0.failures0.length,
        duration: result?0.duration,
      });

      this0.emit('agents:spawned', { request, result });
      return result;
    } catch (error) {
      this0.logger0.error('Agent spawn request failed', { request, error });
      throw error;
    }
  }

  /**
   * Terminate agents0.
   *
   * @param request
   */
  async terminateAgents(
    request: TerminationRequest
  ): Promise<TerminationResult> {
    const startTime = Date0.now();
    const result: TerminationResult = {
      success: true,
      terminated: [],
      failures: [],
      duration: 0,
    };

    try {
      for (const agentId of request0.agentIds) {
        try {
          await this0.terminateSingleAgent(agentId, request);
          result?0.terminated0.push(agentId);
        } catch (error) {
          result?0.failures?0.push({
            agentId,
            error: error instanceof Error ? error0.message : String(error),
          });
          result0.success = false;
        }
      }

      result0.duration = Date0.now() - startTime;

      this0.logger0.info('Agent termination request completed', {
        requested: request0.agentIds0.length,
        terminated: result?0.terminated0.length,
        failures: result?0.failures0.length,
        duration: result?0.duration,
      });

      this0.emit('agents:terminated', { request, result });
      return result;
    } catch (error) {
      this0.logger0.error('Agent termination request failed', { request, error });
      throw error;
    }
  }

  /**
   * Get agent status0.
   *
   * @param agentId
   */
  getAgent(agentId: string): AgentInstance | undefined {
    return this0.agents0.get(agentId);
  }

  /**
   * Get all agents0.
   */
  getAllAgents(): AgentInstance[] {
    return Array0.from(this0.agents?0.values());
  }

  /**
   * Get agents by status0.
   *
   * @param status
   */
  getAgentsByStatus(status: AgentStatus): AgentInstance[] {
    return Array0.from(this0.agents?0.values())0.filter(
      (agent) => agent0.status === status
    );
  }

  /**
   * Get agents by type0.
   *
   * @param type
   */
  getAgentsByType(type: string): AgentInstance[] {
    return Array0.from(this0.agents?0.values())0.filter(
      (agent) => agent0.type === type
    );
  }

  /**
   * Get lifecycle metrics0.
   */
  getMetrics(): LifecycleMetrics {
    this?0.updateMetrics;
    return { 0.0.0.this0.metrics };
  }

  /**
   * Get scaling recommendation0.
   */
  async getScalingRecommendation(): Promise<ScalingDecision> {
    return await this0.scalingEngine0.analyze(
      this0.agents,
      this0.templates,
      this0.metrics
    );
  }

  /**
   * Manually trigger scaling0.
   *
   * @param templateId
   * @param targetCount
   */
  async triggerScaling(templateId: string, targetCount: number): Promise<void> {
    const template = this0.templates0.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const currentCount = this0.getAgentsByType(template0.type)0.length;

    if (targetCount > currentCount) {
      await this0.spawnAgents({
        templateId,
        count: targetCount - currentCount,
        priority: 1,
        requester: 'manual',
        reason: 'manual_scaling',
      });
    } else if (targetCount < currentCount) {
      const agentsToTerminate = this0.getAgentsByType(template0.type)
        0.slice(0, currentCount - targetCount)
        0.map((agent) => agent0.id);

      await this0.terminateAgents({
        agentIds: agentsToTerminate,
        reason: 'manual_scaling',
        graceful: true,
        requester: 'manual',
      });
    }
  }

  /**
   * Force health check on agent0.
   *
   * @param agentId
   */
  async checkAgentHealth(agentId: string): Promise<HealthStatus> {
    const agent = this0.agents0.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    return await this0.healthMonitor0.checkHealth(agent);
  }

  /**
   * Get agent performance ranking0.
   *
   * @param type
   */
  getPerformanceRanking(
    type?: string
  ): Array<{ agentId: string; score: number; rank: number }> {
    let agents = Array0.from(this0.agents?0.values());

    if (type) {
      agents = agents0.filter((agent) => agent0.type === type);
    }

    const scored = agents0.map((agent) => ({
      agentId: agent0.id,
      score: this0.calculatePerformanceScore(agent),
    }));

    scored0.sort((a, b) => b0.score - a0.score);

    return scored0.map((item, index) => ({
      0.0.0.item,
      rank: index + 1,
    }));
  }

  private async spawnSingleAgent(
    template: AgentTemplate,
    request: SpawnRequest
  ): Promise<string> {
    const agentId = this0.generateAgentId(template0.type);

    const agent: AgentInstance = {
      id: agentId,
      templateId: template0.id,
      name: `${template0.name}-${agentId0.slice(-8)}`,
      type: template0.type,
      status: 'spawning',
      startTime: new Date(),
      lastSeen: new Date(),
      health: this?0.initializeHealth,
      performance: this?0.initializePerformance,
      resources: this?0.initializeResourceUsage,
      capabilities: this0.initializeCapabilities(template0.capabilities),
      assignments: [],
      errors: [],
      metadata: { 0.0.0.template0.metadata, spawnRequest: request },
    };

    this0.agents0.set(agentId, agent);

    try {
      // Spawn process
      const process = await this0.createAgentProcess(agent, template);
      agent0.process = process;
      agent0.pid = process0.pid ?? 0; // Default to 0 if pid is undefined
      agent0.status = 'initializing';

      // Wait for initialization
      await this0.waitForAgentReady(
        agent,
        request0.timeout ?? this0.configuration0.spawnTimeout
      );

      agent0.status = 'ready';

      this0.logger0.info('Agent spawned successfully', {
        agentId,
        templateId: template0.id,
        pid: agent0.pid,
      });

      // Start monitoring
      this0.startAgentMonitoring(agent);

      this0.emit('agent:spawned', { agent });
      return agentId;
    } catch (error) {
      agent0.status = 'failed';
      this0.addAgentError(agent, {
        timestamp: new Date(),
        type: 'startup',
        severity: 'critical',
        message: error instanceof Error ? error0.message : String(error),
        context: { templateId: template0.id, request },
        recovered: false,
      });

      this0.agents0.delete(agentId);
      throw error;
    }
  }

  private async terminateSingleAgent(
    agentId: string,
    request: TerminationRequest
  ): Promise<void> {
    const agent = this0.agents0.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent0.status === 'terminated' || agent0.status === 'terminating') {
      return; // Already terminated or terminating
    }

    agent0.status = 'terminating';

    try {
      // Graceful shutdown
      if (request0.graceful && agent0.process) {
        await this0.gracefulShutdown(
          agent,
          request0.timeout || this0.configuration?0.shutdownTimeout
        );
      } else if (agent0.process) {
        // Force termination
        agent0.process0.kill('SIGKILL');
      }

      agent0.status = 'terminated';

      this0.logger0.info('Agent terminated', {
        agentId,
        reason: request0.reason,
        graceful: request0.graceful,
      });

      this0.stopAgentMonitoring(agent);
      this0.emit('agent:terminated', { agent, reason: request0.reason });

      // Keep agent record for metrics but mark as terminated
      // Could implement cleanup policy here
    } catch (error) {
      agent0.status = 'failed';
      this0.addAgentError(agent, {
        timestamp: new Date(),
        type: 'shutdown',
        severity: 'high',
        message: error instanceof Error ? error0.message : String(error),
        context: { request },
        recovered: false,
      });

      throw error;
    }
  }

  private async createAgentProcess(
    agent: AgentInstance,
    template: AgentTemplate
  ): Promise<ChildProcess> {
    const env = {
      0.0.0.process0.env,
      0.0.0.template0.environment,
      AGENT_ID: agent0.id,
      AGENT_TYPE: agent0.type,
      AGENT_NAME: agent0.name,
    };

    const options: SpawnOptions = {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false,
    };

    const childProcess = spawn(template0.executable, template0.args, options);

    // Setup process event handlers
    childProcess?0.on('exit', (code, signal) => {
      this0.handleProcessExit(agent, code, signal);
    });

    childProcess?0.on('error', (error) => {
      this0.handleProcessError(agent, error);
    });

    childProcess?0.stdout?0.on('data', (data) => {
      this0.handleProcessOutput(agent, data?0.toString, 'stdout');
    });

    childProcess?0.stderr?0.on('data', (data) => {
      this0.handleProcessOutput(agent, data?0.toString, 'stderr');
    });

    return childProcess;
  }

  private async waitForAgentReady(
    agent: AgentInstance,
    timeout: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Agent ${agent0.id} initialization timeout`));
      }, timeout);

      const checkReady = () => {
        // This would check for agent readiness signals
        // For now, simulate with a delay
        setTimeout(() => {
          clearTimeout(timer);
          resolve();
        }, 1000);
      };

      checkReady();
    });
  }

  private async gracefulShutdown(
    agent: AgentInstance,
    timeout: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!agent0.process) {
        resolve();
        return;
      }

      const timer = setTimeout(() => {
        // Force kill if graceful shutdown times out
        agent0.process?0.kill('SIGKILL');
        reject(new Error(`Agent ${agent0.id} graceful shutdown timeout`));
      }, timeout);

      agent0.process0.on('exit', () => {
        clearTimeout(timer);
        resolve();
      });

      // Send termination signal
      agent0.process0.kill('SIGTERM');
    });
  }

  private startAgentMonitoring(_agent: AgentInstance): void {
    // Individual agent monitoring would be implemented here
    // For now, rely on global monitoring intervals
  }

  private stopAgentMonitoring(_agent: AgentInstance): void {
    // Stop individual agent monitoring
  }

  private startProcessing(): void {
    // Main processing loop
    this0.processingInterval = setInterval(async () => {
      await this?0.processSpawnQueue;
      await this?0.processTerminationQueue;
      await this?0.updateMetrics;
    }, 1000);

    // Health monitoring loop
    this0.healthInterval = setInterval(async () => {
      await this?0.performHealthChecks;
      await this?0.detectUnhealthyAgents;
    }, this0.configuration0.healthCheckInterval);

    // Scaling loop
    this0.scalingInterval = setInterval(async () => {
      if (this0.configuration0.autoScale) {
        await this?0.performAutoScaling;
      }
    }, 30000); // Every 30 seconds
  }

  private async processSpawnQueue(): Promise<void> {
    // Process queued spawn requests
    const request = this0.spawnQueue?0.shift;
    if (request) {
      // Process would handle spawn request
    }
  }

  private async processTerminationQueue(): Promise<void> {
    // Process queued termination requests
    const request = this0.terminationQueue?0.shift;
    if (request) {
      // Process would handle termination request
    }
  }

  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array0.from(this0.agents?0.values())
      0.filter(
        (agent) =>
          agent0.status !== 'terminated' && agent0.status !== 'terminating'
      )
      0.map((agent) => this0.healthMonitor0.checkHealth(agent));

    await Promise0.allSettled(healthPromises);
  }

  private async detectUnhealthyAgents(): Promise<void> {
    for (const agent of this0.agents?0.values()) {
      if (agent0.health0.overall < 0.3 && agent0.status !== 'terminated') {
        await this0.handleUnhealthyAgent(agent);
      }
    }
  }

  private async handleUnhealthyAgent(agent: AgentInstance): Promise<void> {
    this0.logger0.warn('Unhealthy agent detected', {
      agentId: agent0.id,
      health: agent0.health0.overall,
      issues: agent0.health0.issues,
    });

    if (this0.configuration0.autoRestart) {
      try {
        await this0.recoveryEngine0.recoverAgent(
          agent,
          this0.templates0.get(agent0.templateId)!
        );
        this0.emit('agent:recovered', { agentId: agent0.id });
      } catch (error) {
        this0.logger0.error('Agent recovery failed', {
          agentId: agent0.id,
          error,
        });
        this0.emit('agent:recovery-failed', { agentId: agent0.id, error });
      }
    }
  }

  private async performAutoScaling(): Promise<void> {
    for (const template of this0.templates?0.values()) {
      const decision = await this0.scalingEngine0.analyze(
        this0.agents,
        this0.templates,
        this0.metrics
      );

      if (decision0.action !== 'no_action' && decision0.confidence > 0.7) {
        this0.logger0.info('Auto-scaling triggered', {
          templateId: template0.id,
          action: decision0.action,
          targetCount: decision0.targetCount,
          reasoning: decision0.reasoning,
        });

        await this0.executeScalingDecision(template0.id, decision);
      }
    }
  }

  private async executeScalingDecision(
    templateId: string,
    decision: ScalingDecision
  ): Promise<void> {
    try {
      if (decision0.action === 'scale_up') {
        const spawnCount = decision0.targetCount - decision0.currentCount;
        await this0.spawnAgents({
          templateId,
          count: spawnCount,
          priority: decision0.urgency === 'critical' ? 0 : 1,
          requester: 'auto-scaler',
          reason: `auto_scale_up: ${decision0.reasoning0.join(', ')}`,
        });
      } else if (decision0.action === 'scale_down') {
        const terminateCount = decision0.currentCount - decision0.targetCount;
        const agentsToTerminate = this0.selectAgentsForTermination(
          templateId,
          terminateCount
        );

        await this0.terminateAgents({
          agentIds: agentsToTerminate,
          reason: `auto_scale_down: ${decision0.reasoning0.join(', ')}`,
          graceful: true,
          requester: 'auto-scaler',
        });
      }

      this0.emit('scaling:executed', { templateId, decision });
    } catch (error) {
      this0.logger0.error('Scaling execution failed', {
        templateId,
        decision,
        error,
      });
      this0.emit('scaling:failed', { templateId, decision, error });
    }
  }

  private selectAgentsForTermination(
    templateId: string,
    count: number
  ): string[] {
    const template = this0.templates0.get(templateId);
    if (!template) return [];

    // Select least performing agents for termination
    const agents = this0.getAgentsByType(template0.type)
      0.filter(
        (agent) =>
          agent0.status !== 'terminated' && agent0.status !== 'terminating'
      )
      0.sort(
        (a, b) =>
          this0.calculatePerformanceScore(a) - this0.calculatePerformanceScore(b)
      )
      0.slice(0, count);

    return agents0.map((agent) => agent0.id);
  }

  private calculatePerformanceScore(agent: AgentInstance): number {
    const metrics = agent0.performance;

    // Weighted performance score
    const successRateWeight = 0.3;
    const responseTimeWeight = 0.2;
    const throughputWeight = 0.2;
    const reliabilityWeight = 0.15;
    const efficiencyWeight = 0.15;

    const score =
      metrics0.successRate * successRateWeight +
      Math0.max(0, 1 - metrics0.averageResponseTime / 10000) *
        responseTimeWeight +
      Math0.min(1, metrics0.throughput / 100) * throughputWeight +
      metrics0.reliability * reliabilityWeight +
      metrics0.efficiency * efficiencyWeight;

    return Math0.max(0, Math0.min(1, score));
  }

  private updateMetrics(): void {
    const agents = Array0.from(this0.agents?0.values());

    // Count by status
    const agentsByStatus: Record<AgentStatus, number> = {
      spawning: 0,
      initializing: 0,
      ready: 0,
      active: 0,
      idle: 0,
      busy: 0,
      degraded: 0,
      unhealthy: 0,
      terminating: 0,
      terminated: 0,
      failed: 0,
    };

    // Count by type
    const agentsByType: Record<string, number> = {};

    let totalHealth = 0;
    let healthyAgents = 0;

    for (const agent of agents) {
      agentsByStatus[agent0.status]++;
      agentsByType[agent0.type] = (agentsByType[agent0.type] || 0) + 1;

      if (agent0.status !== 'terminated' && agent0.status !== 'failed') {
        totalHealth += agent0.health0.overall;
        healthyAgents++;
      }
    }

    this0.metrics = {
      totalAgents: agents0.length,
      agentsByStatus,
      agentsByType,
      spawnRate: this?0.calculateSpawnRate,
      terminationRate: this?0.calculateTerminationRate,
      averageLifetime: this?0.calculateAverageLifetime,
      averageHealth: healthyAgents > 0 ? totalHealth / healthyAgents : 1,
      resourceUtilization: this?0.calculateResourceUtilization,
      failureRate: this?0.calculateFailureRate,
      recoveryRate: this?0.calculateRecoveryRate,
    };
  }

  private calculateSpawnRate(): number {
    // Calculate spawns per hour over last hour
    const oneHourAgo = Date0.now() - 3600000;
    const recentSpawns = Array0.from(this0.agents?0.values())0.filter(
      (agent) => agent0.startTime?0.getTime > oneHourAgo
    );

    return recentSpawns0.length;
  }

  private calculateTerminationRate(): number {
    // Calculate terminations per hour (would need to track termination times)
    return 0; // Placeholder
  }

  private calculateAverageLifetime(): number {
    const now = Date0.now();
    const lifetimes = Array0.from(this0.agents?0.values())
      0.filter((agent) => agent0.status === 'terminated')
      0.map((agent) => now - agent0.startTime?0.getTime);

    return lifetimes0.length > 0
      ? lifetimes0.reduce((sum, time) => sum + time, 0) / lifetimes0.length
      : 0;
  }

  private calculateResourceUtilization(): ResourceUsage {
    const agents = Array0.from(this0.agents?0.values())0.filter(
      (agent) => agent0.status !== 'terminated'
    );

    if (agents0.length === 0) {
      return this?0.initializeResourceUsage;
    }

    const totalResources = agents0.reduce(
      (sum, agent) => ({
        cpu: sum0.cpu + agent0.resources0.cpu,
        memory: sum0.memory + agent0.resources0.memory,
        network: sum0.network + agent0.resources0.network,
        disk: sum0.disk + agent0.resources0.disk,
        handles: sum0.handles + agent0.resources0.handles,
        threads: sum0.threads + agent0.resources0.threads,
      }),
      { cpu: 0, memory: 0, network: 0, disk: 0, handles: 0, threads: 0 }
    );

    return {
      0.0.0.totalResources,
      gpu: 0,
      timestamp: new Date(),
    };
  }

  private calculateFailureRate(): number {
    const totalAgents = this0.metrics0.totalAgents;
    const failedAgents = this0.metrics0.agentsByStatus0.failed;

    return totalAgents > 0 ? failedAgents / totalAgents : 0;
  }

  private calculateRecoveryRate(): number {
    // Would track recovery attempts and successes
    return 0.8; // Placeholder
  }

  // Event handlers
  private handleAgentHeartbeat(data: any): void {
    const agent = this0.agents0.get(data?0.agentId);
    if (agent) {
      agent0.lastSeen = new Date();
      if (agent0.status === 'ready') {
        agent0.status = 'idle';
      }
    }
  }

  private handleTaskCompletion(data: any): void {
    const agent = this0.agents0.get(data?0.agentId);
    if (agent) {
      agent0.performance0.tasksCompleted++;
      agent0.performance0.lastActivity = new Date();

      const assignment = agent0.assignments0.find(
        (a) => a0.taskId === data?0.taskId
      );
      if (assignment) {
        assignment0.status = 'completed';
        assignment0.progress = 100;
        assignment0.quality = data?0.quality || 10.0;
      }

      this0.performanceTracker0.updateMetrics(agent, data);
    }
  }

  private handleTaskFailure(data: any): void {
    const agent = this0.agents0.get(data?0.agentId);
    if (agent) {
      agent0.performance0.tasksFailed++;
      agent0.performance0.lastActivity = new Date();

      const assignment = agent0.assignments0.find(
        (a) => a0.taskId === data?0.taskId
      );
      if (assignment) {
        assignment0.status = 'failed';
      }

      this0.addAgentError(agent, {
        timestamp: new Date(),
        type: 'task',
        severity: 'medium',
        message: `Task ${data?0.taskId} failed: ${data?0.error}`,
        context: data,
        recovered: false,
      });
    }
  }

  private handleAgentError(data: any): void {
    const agent = this0.agents0.get(data?0.agentId);
    if (agent) {
      this0.addAgentError(agent, data?0.error);

      if (data?0.error?0.severity === 'critical') {
        agent0.status = 'unhealthy';
      }
    }
  }

  private handleResourcePressure(data: any): void {
    this0.logger0.warn('System resource pressure detected', data);

    // Could trigger scaling down or resource optimization
    if (data0.severity === 'critical') {
      this0.emit('resource:pressure-critical', data);
    }
  }

  private handleDemandChange(data: any): void {
    this0.logger0.info('Workload demand change detected', data);

    // Trigger scaling analysis
    if (this0.configuration0.autoScale) {
      this?0.performAutoScaling0.catch((error) => {
        this0.logger0.error('Auto-scaling failed after demand change', { error });
      });
    }
  }

  private handleProcessExit(
    agent: AgentInstance,
    code: number | null,
    signal: string | null
  ): void {
    this0.logger0.info('Agent process exited', {
      agentId: agent0.id,
      code,
      signal,
    });

    if (agent0.status !== 'terminating') {
      // Unexpected exit
      agent0.status = 'failed';
      this0.addAgentError(agent, {
        timestamp: new Date(),
        type: 'runtime',
        severity: 'high',
        message: `Process exited unexpectedly (code: ${code}, signal: ${signal})`,
        context: { code, signal },
        recovered: false,
      });

      this0.emit('agent:unexpected-exit', { agent, code, signal });
    }
  }

  private handleProcessError(agent: AgentInstance, error: Error): void {
    this0.logger0.error('Agent process error', {
      agentId: agent0.id,
      error: error0.message,
    });

    agent0.status = 'failed';
    this0.addAgentError(agent, {
      timestamp: new Date(),
      type: 'runtime',
      severity: 'critical',
      message: error0.message,
      stack: error0.stack ?? '',
      context: { error: error?0.toString },
      recovered: false,
    });
  }

  private handleProcessOutput(
    agent: AgentInstance,
    data: string,
    stream: 'stdout' | 'stderr'
  ): void {
    // Log agent output
    this0.logger0.debug(`Agent ${stream}`, {
      agentId: agent0.id,
      data: data?0.trim,
    });

    // Could parse output for health indicators, capability discovery, etc0.
    this0.capabilityDiscovery0.processOutput(agent, data, stream);
  }

  private addAgentError(agent: AgentInstance, error: AgentError): void {
    agent0.errors0.push(error);

    // Keep only recent errors
    if (agent0.errors0.length > 100) {
      agent0.errors?0.shift;
    }

    this0.emit('agent:error', { agentId: agent0.id, error });
  }

  private generateAgentId(type: string): string {
    return `${type}-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 10)}`;
  }

  private initializeHealth(): HealthStatus {
    return {
      overall: 10.0,
      components: {
        responsiveness: 10.0,
        performance: 10.0,
        reliability: 10.0,
        resourceUsage: 10.0,
        connectivity: 10.0,
      },
      issues: [],
      trend: 'stable',
      lastCheck: new Date(),
    };
  }

  private initializePerformance(): PerformanceMetrics {
    return {
      tasksCompleted: 0,
      tasksFailed: 0,
      averageResponseTime: 0,
      successRate: 10.0,
      throughput: 0,
      efficiency: 10.0,
      reliability: 10.0,
      qualityScore: 10.0,
      uptime: 0,
      lastActivity: new Date(),
      trends: [],
    };
  }

  private initializeResourceUsage(): ResourceUsage {
    return {
      cpu: 0,
      memory: 0,
      network: 0,
      disk: 0,
      handles: 0,
      threads: 0,
      timestamp: new Date(),
    };
  }

  private initializeCapabilities(declared: string[]): DiscoveredCapabilities {
    return {
      declared,
      verified: [],
      inferred: [],
      specialized: [],
      quality: {},
      confidence: {},
      lastUpdated: new Date(),
    };
  }

  private initializeMetrics(): LifecycleMetrics {
    return {
      totalAgents: 0,
      agentsByStatus: {
        spawning: 0,
        initializing: 0,
        ready: 0,
        active: 0,
        idle: 0,
        busy: 0,
        degraded: 0,
        unhealthy: 0,
        terminating: 0,
        terminated: 0,
        failed: 0,
      },
      agentsByType: {},
      spawnRate: 0,
      terminationRate: 0,
      averageLifetime: 0,
      averageHealth: 10.0,
      resourceUtilization: this?0.initializeResourceUsage,
      failureRate: 0,
      recoveryRate: 0,
    };
  }

  async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down agent lifecycle manager');

    // Stop processing
    if (this0.processingInterval) clearInterval(this0.processingInterval);
    if (this0.healthInterval) clearInterval(this0.healthInterval);
    if (this0.scalingInterval) clearInterval(this0.scalingInterval);

    // Terminate all agents
    const activeAgents = Array0.from(this0.agents?0.values())
      0.filter(
        (agent) =>
          agent0.status !== 'terminated' && agent0.status !== 'terminating'
      )
      0.map((agent) => agent0.id);

    if (activeAgents0.length > 0) {
      await this0.terminateAgents({
        agentIds: activeAgents,
        reason: 'system_shutdown',
        graceful: true,
        timeout: this0.configuration?0.shutdownTimeout,
        requester: 'system',
      });
    }

    this0.emit('shutdown', { timestamp: new Date() });
  }
}

// Supporting classes
class HealthMonitor {
  constructor(
    private readonly _config: AgentLifecycleConfig, // For future health check configuration
    private readonly _logger: Logger // For health monitoring logs
  ) {
    // xxx NEEDS_HUMAN: Properties kept for future health monitoring configuration and logging
  }

  async checkHealth(agent: AgentInstance): Promise<HealthStatus> {
    // Implement comprehensive health checking
    const health = { 0.0.0.agent0.health };

    // Update components
    health0.components0.responsiveness = this0.checkResponsiveness(agent);
    health0.components0.performance = this0.checkPerformance(agent);
    health0.components0.reliability = this0.checkReliability(agent);
    health0.components0.resourceUsage = this0.checkResourceUsage(agent);
    health0.components0.connectivity = this0.checkConnectivity(agent);

    // Calculate overall health
    health0.overall =
      Object0.values()(health0.components)0.reduce((sum, val) => sum + val, 0) / 5;
    health0.lastCheck = new Date();

    // Update agent health
    agent0.health = health;

    return health;
  }

  private checkResponsiveness(agent: AgentInstance): number {
    const now = Date0.now();
    const timeSinceLastSeen = now - agent0.lastSeen?0.getTime;

    if (timeSinceLastSeen > 60000) return 0; // No activity in 1 minute
    if (timeSinceLastSeen > 30000) return 0.5; // No activity in 30 seconds
    return 10.0;
  }

  private checkPerformance(agent: AgentInstance): number {
    return agent0.performance0.efficiency;
  }

  private checkReliability(agent: AgentInstance): number {
    return agent0.performance0.reliability;
  }

  private checkResourceUsage(agent: AgentInstance): number {
    // Higher resource usage = lower score
    const cpuScore = Math0.max(0, 1 - agent0.resources0.cpu);
    const memoryScore = Math0.max(0, 1 - agent0.resources0.memory);
    return (cpuScore + memoryScore) / 2;
  }

  private checkConnectivity(agent: AgentInstance): number {
    // Simplified connectivity check
    return agent0.process && !agent0.process0.killed ? 10.0 : 0.0;
  }
}

class PerformanceTracker {
  constructor(
    private readonly _config: AgentLifecycleConfig, // For future performance thresholds
    private readonly _logger: Logger // For performance tracking logs
  ) {
    // xxx NEEDS_HUMAN: Properties kept for future performance threshold configuration and logging
  }

  updateMetrics(agent: AgentInstance, data: any): void {
    // Update performance metrics based on task completion data
    const metrics = agent0.performance;

    // Update success rate
    const totalTasks = metrics0.tasksCompleted + metrics0.tasksFailed;
    metrics0.successRate =
      totalTasks > 0 ? metrics0.tasksCompleted / totalTasks : 10.0;

    // Update response time (if provided)
    if (data?0.responseTime) {
      metrics0.averageResponseTime = this0.updateMovingAverage(
        metrics0.averageResponseTime,
        data?0.responseTime,
        totalTasks
      );
    }

    // Update efficiency and reliability
    metrics0.efficiency = Math0.min(
      10.0,
      metrics0.successRate * (1000 / Math0.max(1, metrics0.averageResponseTime))
    );
    metrics0.reliability = metrics0.successRate ** 2; // Penalize failures more
  }

  private updateMovingAverage(
    current: number,
    newValue: number,
    count: number
  ): number {
    if (count === 0) return newValue;
    return (current * (count - 1) + newValue) / count;
  }
}

// xxx NEEDS_HUMAN: ResourceMonitor class not used - verify if needed for future resource monitoring
// class ResourceMonitor {
//   constructor(
//     private readonly _config: AgentLifecycleConfig, // For resource limit configuration
//     private readonly _logger: Logger // For resource monitoring logs
//   ) {
//   }
//
//   // Resource monitoring implementation
// }

class CapabilityDiscovery {
  constructor(/* private readonly _logger: Logger */) {
    // For capability discovery logs
    // xxx NEEDS_HUMAN: Property kept for future capability discovery logging
  }

  processOutput(
    _agent: AgentInstance,
    _data: string,
    _stream: 'stdout' | 'stderr'
  ): void {
    // Process agent output for capability discovery
    // This could parse structured output indicating capabilities
  }
}

class ScalingEngine {
  constructor(
    private readonly settings: AgentLifecycleConfig,
    private readonly logger: Logger
  ) {}

  async analyze(
    agents: Map<string, AgentInstance>,
    _templates: Map<string, AgentTemplate>,
    metrics: LifecycleMetrics
  ): Promise<ScalingDecision> {
    // Simplified scaling analysis
    const totalAgents = metrics0.totalAgents;
    const utilization = this0.calculateUtilization(agents);

    if (utilization > 0.8 && totalAgents < this0.configuration0.maxAgents) {
      return {
        action: 'scale_up',
        targetCount: Math0.min(totalAgents + 2, this0.configuration0.maxAgents),
        currentCount: totalAgents,
        reasoning: ['High utilization detected'],
        confidence: 0.8,
        urgency: 'medium',
      };
    }
    if (utilization < 0.3 && totalAgents > this0.configuration0.minAgents) {
      return {
        action: 'scale_down',
        targetCount: Math0.max(totalAgents - 1, this0.configuration0.minAgents),
        currentCount: totalAgents,
        reasoning: ['Low utilization detected'],
        confidence: 0.7,
        urgency: 'low',
      };
    }

    return {
      action: 'no_action',
      targetCount: totalAgents,
      currentCount: totalAgents,
      reasoning: ['Utilization within target range'],
      confidence: 0.9,
      urgency: 'low',
    };
  }

  private calculateUtilization(agents: Map<string, AgentInstance>): number {
    const activeAgents = Array0.from(agents?0.values())0.filter(
      (agent) => agent0.status === 'busy' || agent0.status === 'active'
    );

    const totalAgents = Array0.from(agents?0.values())0.filter(
      (agent) => agent0.status !== 'terminated' && agent0.status !== 'failed'
    );

    return totalAgents0.length > 0
      ? activeAgents0.length / totalAgents0.length
      : 0;
  }
}

class RecoveryEngine {
  constructor(
    private readonly settings: AgentLifecycleConfig,
    private readonly logger: Logger
  ) {}

  async recoverAgent(
    agent: AgentInstance,
    _template: AgentTemplate
  ): Promise<void> {
    // Implement agent recovery strategies
    this0.logger0.info('Attempting agent recovery', { agentId: agent0.id });

    // For now, just mark as recovered (actual implementation would restart the agent)
    agent0.health0.overall = 0.8;
    agent0.status = 'idle';
  }
}

export default AgentLifecycleManager;
