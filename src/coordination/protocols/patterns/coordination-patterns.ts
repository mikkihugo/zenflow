/**
 * Advanced Coordination Patterns System
 * Provides leader election algorithms, distributed consensus (Raft-like),
 * work-stealing queues, hierarchical coordination with delegation
 */

import { createHash, randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import type { IEventBus } from '@core/event-bus';
import type { ILogger } from '@core/logger';

// Core coordination types
export interface CoordinationNode {
  id: string;
  type: 'leader' | 'follower' | 'candidate' | 'coordinator' | 'worker';
  status: 'active' | 'inactive' | 'failed' | 'suspected';
  capabilities: string[];
  load: number;
  priority: number;
  lastHeartbeat: Date;
  metadata: Record<string, unknown>;
}

export interface LeaderElectionConfig {
  algorithm: 'bully' | 'ring' | 'raft' | 'fast-bully';
  timeoutMs: number;
  heartbeatInterval: number;
  maxRetries: number;
  priorityBased: boolean;
  minNodes: number;
}

export interface ConsensusConfig {
  algorithm: 'raft' | 'pbft' | 'tendermint';
  electionTimeout: [number, number]; // Min, max in ms
  heartbeatInterval: number;
  logReplicationTimeout: number;
  maxLogEntries: number;
  snapshotThreshold: number;
}

export interface WorkStealingConfig {
  maxQueueSize: number;
  stealThreshold: number;
  stealRatio: number;
  retryInterval: number;
  maxRetries: number;
  loadBalancingInterval: number;
}

export interface HierarchicalConfig {
  maxDepth: number;
  fanOut: number;
  delegationThreshold: number;
  escalationTimeout: number;
  rebalanceInterval: number;
}

// Leader election types
export interface ElectionMessage {
  type: 'election' | 'answer' | 'coordinator' | 'heartbeat' | 'victory';
  candidateId: string;
  priority: number;
  timestamp: Date;
  term?: number;
  signature: string;
}

export interface ElectionState {
  currentTerm: number;
  currentLeader?: string;
  votedFor?: string;
  state: 'follower' | 'candidate' | 'leader';
  votes: Set<string>;
  lastElection: Date;
  electionTimeout?: NodeJS.Timeout;
}

// Consensus types
export interface LogEntry {
  term: number;
  index: number;
  command: any;
  timestamp: Date;
  committed: boolean;
  checksum: string;
}

export interface ConsensusState {
  currentTerm: number;
  log: LogEntry[];
  commitIndex: number;
  lastApplied: number;
  nextIndex: Map<string, number>;
  matchIndex: Map<string, number>;
  state: 'follower' | 'candidate' | 'leader';
  votedFor?: string;
  votes: Set<string>;
}

export interface AppendEntriesRequest {
  term: number;
  leaderId: string;
  prevLogIndex: number;
  prevLogTerm: number;
  entries: LogEntry[];
  leaderCommit: number;
}

export interface AppendEntriesResponse {
  term: number;
  success: boolean;
  matchIndex?: number;
  conflictIndex?: number;
  conflictTerm?: number;
}

export interface VoteRequest {
  term: number;
  candidateId: string;
  lastLogIndex: number;
  lastLogTerm: number;
}

export interface VoteResponse {
  term: number;
  voteGranted: boolean;
  reason?: string;
}

// Work stealing types
export interface WorkItem {
  id: string;
  type: string;
  payload: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  timeout: number;
  created: Date;
  stolen?: boolean;
  owner?: string;
}

export interface WorkQueue {
  nodeId: string;
  items: WorkItem[];
  capacity: number;
  processing: Set<string>;
  completed: number;
  failed: number;
  lastActivity: Date;
}

export interface StealRequest {
  requesterId: string;
  targetId: string;
  requestedCount: number;
  timestamp: Date;
}

export interface StealResponse {
  success: boolean;
  items: WorkItem[];
  reason?: string;
}

// Hierarchical coordination types
export interface HierarchyNode {
  id: string;
  parentId?: string;
  children: Set<string>;
  level: number;
  span: number;
  role: 'root' | 'coordinator' | 'leaf';
  delegation: DelegationConfig;
  load: LoadInfo;
}

export interface DelegationConfig {
  maxDelegations: number;
  currentDelegations: number;
  thresholds: {
    delegate: number;
    escalate: number;
    rebalance: number;
  };
}

export interface LoadInfo {
  current: number;
  capacity: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  utilization: number;
}

export interface DelegationRequest {
  delegatorId: string;
  delegateId: string;
  task: any;
  constraints: Record<string, unknown>;
  deadline?: Date;
  priority: number;
}

export interface EscalationRequest {
  escalatorId: string;
  supervisorId: string;
  reason: string;
  context: any;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Advanced Coordination Patterns Manager
 */
export class CoordinationPatterns extends EventEmitter {
  private nodes = new Map<string, CoordinationNode>();
  private leaderElection: LeaderElection;
  private consensusEngine: ConsensusEngine;
  private workStealingSystem: WorkStealingSystem;
  private hierarchicalCoordinator: HierarchicalCoordinator;
  private currentPattern:
    | 'leader-follower'
    | 'consensus'
    | 'work-stealing'
    | 'hierarchical'
    | 'hybrid' = 'hybrid';
  private patternMetrics: PatternMetrics;

  constructor(
    private nodeId: string,
    private config: {
      election: LeaderElectionConfig;
      consensus: ConsensusConfig;
      workStealing: WorkStealingConfig;
      hierarchical: HierarchicalConfig;
    },
    private logger: ILogger,
    private eventBus: IEventBus,
  ) {
    super();

    this.leaderElection = new LeaderElection(nodeId, config.election, logger, eventBus);
    this.consensusEngine = new ConsensusEngine(nodeId, config.consensus, logger, eventBus);
    this.workStealingSystem = new WorkStealingSystem(nodeId, config.workStealing, logger, eventBus);
    this.hierarchicalCoordinator = new HierarchicalCoordinator(
      nodeId,
      config.hierarchical,
      logger,
      eventBus,
    );

    this.patternMetrics = this.initializeMetrics();
    this.setupEventHandlers();
    this.startCoordination();
  }

  private setupEventHandlers(): void {
    // Leader election events
    this.leaderElection.on('leader:elected', (data) => {
      this.handleLeaderElected(data);
    });

    this.leaderElection.on('leader:failed', (data) => {
      this.handleLeaderFailed(data);
    });

    // Consensus events
    this.consensusEngine.on('consensus:reached', (data) => {
      this.handleConsensusReached(data);
    });

    this.consensusEngine.on('log:committed', (data) => {
      this.handleLogCommitted(data);
    });

    // Work stealing events
    this.workStealingSystem.on('work:stolen', (data) => {
      this.handleWorkStolen(data);
    });

    this.workStealingSystem.on('work:completed', (data) => {
      this.handleWorkCompleted(data);
    });

    // Hierarchical events
    this.hierarchicalCoordinator.on('delegation:created', (data) => {
      this.handleDelegationCreated(data);
    });

    this.hierarchicalCoordinator.on('escalation:triggered', (data) => {
      this.handleEscalationTriggered(data);
    });

    // Network events
    this.eventBus.on('node:joined', (data) => {
      this.handleNodeJoined(data);
    });

    this.eventBus.on('node:left', (data) => {
      this.handleNodeLeft(data);
    });

    this.eventBus.on('network:partition', (data) => {
      this.handleNetworkPartition(data);
    });
  }

  /**
   * Register a node in the coordination system
   */
  async registerNode(node: CoordinationNode): Promise<void> {
    this.nodes.set(node.id, node);

    this.logger.info('Node registered for coordination', {
      nodeId: node.id,
      type: node.type,
      capabilities: node.capabilities,
    });

    // Notify all subsystems
    await this.leaderElection.addNode(node);
    await this.consensusEngine.addNode(node);
    await this.workStealingSystem.addNode(node);
    await this.hierarchicalCoordinator.addNode(node);

    this.emit('node:registered', { nodeId: node.id });
  }

  /**
   * Start leader election
   */
  async startElection(): Promise<string> {
    return await this.leaderElection.startElection();
  }

  /**
   * Propose a value for consensus
   */
  async proposeConsensus(value: any): Promise<boolean> {
    return await this.consensusEngine.propose(value);
  }

  /**
   * Submit work to the work-stealing system
   */
  async submitWork(item: Omit<WorkItem, 'id' | 'created' | 'attempts'>): Promise<string> {
    return await this.workStealingSystem.submitWork(item);
  }

  /**
   * Delegate a task in the hierarchy
   */
  async delegateTask(request: DelegationRequest): Promise<boolean> {
    return await this.hierarchicalCoordinator.delegate(request);
  }

  /**
   * Escalate an issue up the hierarchy
   */
  async escalate(request: EscalationRequest): Promise<boolean> {
    return await this.hierarchicalCoordinator.escalate(request);
  }

  /**
   * Switch coordination pattern
   */
  async switchPattern(pattern: CoordinationPatterns['currentPattern']): Promise<void> {
    const oldPattern = this.currentPattern;
    this.currentPattern = pattern;

    this.logger.info('Coordination pattern switched', {
      from: oldPattern,
      to: pattern,
    });

    // Reconfigure subsystems based on new pattern
    await this.reconfigureForPattern(pattern);

    this.emit('pattern:switched', { from: oldPattern, to: pattern });
  }

  /**
   * Get current coordination status
   */
  getCoordinationStatus(): {
    pattern: string;
    leader?: string;
    consensusState: any;
    workQueues: number;
    hierarchyDepth: number;
    metrics: PatternMetrics;
  } {
    return {
      pattern: this.currentPattern,
      leader: this.leaderElection.getCurrentLeader(),
      consensusState: this.consensusEngine.getState(),
      workQueues: this.workStealingSystem.getQueueCount(),
      hierarchyDepth: this.hierarchicalCoordinator.getDepth(),
      metrics: this.patternMetrics,
    };
  }

  /**
   * Get coordination metrics
   */
  getMetrics(): PatternMetrics {
    return { ...this.patternMetrics };
  }

  private async reconfigureForPattern(
    pattern: CoordinationPatterns['currentPattern'],
  ): Promise<void> {
    switch (pattern) {
      case 'leader-follower':
        await this.leaderElection.enable();
        await this.consensusEngine.disable();
        await this.workStealingSystem.disable();
        await this.hierarchicalCoordinator.disable();
        break;

      case 'consensus':
        await this.leaderElection.disable();
        await this.consensusEngine.enable();
        await this.workStealingSystem.disable();
        await this.hierarchicalCoordinator.disable();
        break;

      case 'work-stealing':
        await this.leaderElection.disable();
        await this.consensusEngine.disable();
        await this.workStealingSystem.enable();
        await this.hierarchicalCoordinator.disable();
        break;

      case 'hierarchical':
        await this.leaderElection.disable();
        await this.consensusEngine.disable();
        await this.workStealingSystem.disable();
        await this.hierarchicalCoordinator.enable();
        break;

      case 'hybrid':
        await this.leaderElection.enable();
        await this.consensusEngine.enable();
        await this.workStealingSystem.enable();
        await this.hierarchicalCoordinator.enable();
        break;
    }
  }

  private startCoordination(): void {
    // Start all coordination subsystems
    this.leaderElection.start();
    this.consensusEngine.start();
    this.workStealingSystem.start();
    this.hierarchicalCoordinator.start();

    // Start metrics collection
    setInterval(() => {
      this.updateMetrics();
    }, 5000);
  }

  private updateMetrics(): void {
    this.patternMetrics = {
      electionCount: this.leaderElection.getElectionCount(),
      consensusOperations: this.consensusEngine.getOperationCount(),
      workItemsProcessed: this.workStealingSystem.getProcessedCount(),
      delegationsActive: this.hierarchicalCoordinator.getActiveDelegations(),
      averageLatency: this.calculateAverageLatency(),
      throughput: this.calculateThroughput(),
      failureRate: this.calculateFailureRate(),
      coordinationEfficiency: this.calculateCoordinationEfficiency(),
    };
  }

  private calculateAverageLatency(): number {
    // Aggregate latency from all subsystems
    return (
      (this.leaderElection.getAverageLatency() +
        this.consensusEngine.getAverageLatency() +
        this.workStealingSystem.getAverageLatency() +
        this.hierarchicalCoordinator.getAverageLatency()) /
      4
    );
  }

  private calculateThroughput(): number {
    // Aggregate throughput from all subsystems
    return;
    this.consensusEngine.getThroughput() +
      this.workStealingSystem.getThroughput() +
      this.hierarchicalCoordinator.getThroughput();
  }

  private calculateFailureRate(): number {
    const totalOperations =
      this.consensusEngine.getOperationCount() +
      this.workStealingSystem.getProcessedCount() +
      this.hierarchicalCoordinator.getActiveDelegations();

    const failures =
      this.consensusEngine.getFailureCount() +
      this.workStealingSystem.getFailureCount() +
      this.hierarchicalCoordinator.getFailureCount();

    return totalOperations > 0 ? failures / totalOperations : 0;
  }

  private calculateCoordinationEfficiency(): number {
    // Efficiency metric based on successful coordination vs overhead
    const successfulOps =
      this.consensusEngine.getSuccessfulOperations() +
      this.workStealingSystem.getSuccessfulOperations() +
      this.hierarchicalCoordinator.getSuccessfulOperations();

    const totalOps =
      this.consensusEngine.getOperationCount() +
      this.workStealingSystem.getProcessedCount() +
      this.hierarchicalCoordinator.getActiveDelegations();

    return totalOps > 0 ? successfulOps / totalOps : 1;
  }

  // Event handlers
  private handleLeaderElected(data: any): void {
    this.logger.info('Leader elected', data);
    this.emit('coordination:leader-elected', data);
  }

  private handleLeaderFailed(data: any): void {
    this.logger.warn('Leader failed', data);
    this.emit('coordination:leader-failed', data);
  }

  private handleConsensusReached(data: any): void {
    this.logger.info('Consensus reached', data);
    this.emit('coordination:consensus-reached', data);
  }

  private handleLogCommitted(data: any): void {
    this.logger.debug('Log entry committed', data);
    this.emit('coordination:log-committed', data);
  }

  private handleWorkStolen(data: any): void {
    this.logger.debug('Work stolen', data);
    this.emit('coordination:work-stolen', data);
  }

  private handleWorkCompleted(data: any): void {
    this.logger.debug('Work completed', data);
    this.emit('coordination:work-completed', data);
  }

  private handleDelegationCreated(data: any): void {
    this.logger.info('Delegation created', data);
    this.emit('coordination:delegation-created', data);
  }

  private handleEscalationTriggered(data: any): void {
    this.logger.warn('Escalation triggered', data);
    this.emit('coordination:escalation-triggered', data);
  }

  private handleNodeJoined(data: any): void {
    // Update all subsystems with new node
    const node: CoordinationNode = {
      id: data.nodeId,
      type: 'follower',
      status: 'active',
      capabilities: data.capabilities || [],
      load: 0,
      priority: data.priority || 1,
      lastHeartbeat: new Date(),
      metadata: data.metadata || {},
    };

    this.registerNode(node);
  }

  private handleNodeLeft(data: any): void {
    this.nodes.delete(data.nodeId);

    // Notify all subsystems
    this.leaderElection.removeNode(data.nodeId);
    this.consensusEngine.removeNode(data.nodeId);
    this.workStealingSystem.removeNode(data.nodeId);
    this.hierarchicalCoordinator.removeNode(data.nodeId);
  }

  private handleNetworkPartition(data: any): void {
    this.logger.warn('Network partition detected', data);

    // Implement partition tolerance strategies
    if (this.currentPattern === 'consensus') {
      // Switch to leader-follower for partition tolerance
      this.switchPattern('leader-follower');
    }
  }

  private initializeMetrics(): PatternMetrics {
    return {
      electionCount: 0,
      consensusOperations: 0,
      workItemsProcessed: 0,
      delegationsActive: 0,
      averageLatency: 0,
      throughput: 0,
      failureRate: 0,
      coordinationEfficiency: 1,
    };
  }

  async shutdown(): Promise<void> {
    await this.leaderElection.shutdown();
    await this.consensusEngine.shutdown();
    await this.workStealingSystem.shutdown();
    await this.hierarchicalCoordinator.shutdown();

    this.emit('shutdown');
    this.logger.info('Coordination patterns shutdown');
  }
}

interface PatternMetrics {
  electionCount: number;
  consensusOperations: number;
  workItemsProcessed: number;
  delegationsActive: number;
  averageLatency: number;
  throughput: number;
  failureRate: number;
  coordinationEfficiency: number;
}

/**
 * Leader Election Implementation
 */
class LeaderElection extends EventEmitter {
  private state: ElectionState;
  private nodes = new Map<string, CoordinationNode>();
  private enabled = true;
  private electionCount = 0;
  private latencyHistory: number[] = [];

  constructor(
    private nodeId: string,
    private config: LeaderElectionConfig,
    private logger: ILogger,
    private eventBus: IEventBus,
  ) {
    super();

    this.state = {
      currentTerm: 0,
      state: 'follower',
      votes: new Set(),
      lastElection: new Date(),
    };
  }

  async start(): Promise<void> {
    if (!this.enabled) return;

    this.logger.info('Starting leader election', { algorithm: this.config.algorithm });
    this.setupHeartbeat();
  }

  async addNode(node: CoordinationNode): Promise<void> {
    this.nodes.set(node.id, node);
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);

    // If current leader left, start new election
    if (this.state.currentLeader === nodeId) {
      this.startElection();
    }
  }

  async startElection(): Promise<string> {
    if (!this.enabled) throw new Error('Leader election disabled');

    const startTime = Date.now();
    this.electionCount++;

    this.logger.info('Starting leader election', {
      term: this.state.currentTerm + 1,
      algorithm: this.config.algorithm,
    });

    try {
      let newLeader: string;

      switch (this.config.algorithm) {
        case 'bully':
          newLeader = await this.bullyElection();
          break;
        case 'ring':
          newLeader = await this.ringElection();
          break;
        case 'raft':
          newLeader = await this.raftElection();
          break;
        case 'fast-bully':
          newLeader = await this.fastBullyElection();
          break;
        default:
          newLeader = await this.bullyElection();
      }

      const latency = Date.now() - startTime;
      this.latencyHistory.push(latency);
      if (this.latencyHistory.length > 100) {
        this.latencyHistory.shift();
      }

      this.state.currentLeader = newLeader;
      this.state.state = newLeader === this.nodeId ? 'leader' : 'follower';
      this.state.lastElection = new Date();

      this.emit('leader:elected', {
        leaderId: newLeader,
        term: this.state.currentTerm,
        latency,
      });

      return newLeader;
    } catch (error) {
      this.logger.error('Leader election failed', { error });
      throw error;
    }
  }

  getCurrentLeader(): string | undefined {
    return this.state.currentLeader;
  }

  getElectionCount(): number {
    return this.electionCount;
  }

  getAverageLatency(): number {
    return this.latencyHistory.length > 0
      ? this.latencyHistory.reduce((sum, lat) => sum + lat, 0) / this.latencyHistory.length
      : 0;
  }

  async enable(): Promise<void> {
    this.enabled = true;
    await this.start();
  }

  async disable(): Promise<void> {
    this.enabled = false;
    if (this.state.electionTimeout) {
      clearTimeout(this.state.electionTimeout);
    }
  }

  private async bullyElection(): Promise<string> {
    // Bully algorithm implementation
    this.state.currentTerm++;
    this.state.state = 'candidate';

    const myPriority = this.getNodePriority(this.nodeId);
    const higherPriorityNodes = Array.from(this.nodes.values()).filter(
      (node) =>
        node.id !== this.nodeId &&
        node.status === 'active' &&
        this.getNodePriority(node.id) > myPriority,
    );

    if (higherPriorityNodes.length === 0) {
      // I am the highest priority node
      await this.announceVictory();
      return this.nodeId;
    }

    // Send election messages to higher priority nodes
    const responses = await this.sendElectionMessages(higherPriorityNodes.map((n) => n.id));

    if (responses.length === 0) {
      // No responses from higher priority nodes, I win
      await this.announceVictory();
      return this.nodeId;
    }

    // Wait for coordinator announcement from higher priority node
    return await this.waitForCoordinator();
  }

  private async ringElection(): Promise<string> {
    // Ring algorithm implementation
    const sortedNodes = Array.from(this.nodes.values())
      .filter((node) => node.status === 'active')
      .sort((a, b) => a.id.localeCompare(b.id));

    const myIndex = sortedNodes.findIndex((node) => node.id === this.nodeId);
    if (myIndex === -1) throw new Error('Node not found in ring');

    // Find highest priority active node in ring order
    let highestPriority = -1;
    let leaderId = this.nodeId;

    for (const node of sortedNodes) {
      const priority = this.getNodePriority(node.id);
      if (priority > highestPriority) {
        highestPriority = priority;
        leaderId = node.id;
      }
    }

    return leaderId;
  }

  private async raftElection(): Promise<string> {
    // Simplified Raft leader election
    this.state.currentTerm++;
    this.state.state = 'candidate';
    this.state.votedFor = this.nodeId;
    this.state.votes.clear();
    this.state.votes.add(this.nodeId);

    // Send vote requests
    const voteRequests = Array.from(this.nodes.keys())
      .filter((nodeId) => nodeId !== this.nodeId)
      .map((nodeId) => this.sendVoteRequest(nodeId));

    const responses = await Promise.allSettled(voteRequests);
    const grantedVotes =
      responses.filter((result) => result.status === 'fulfilled' && result.value).length + 1; // +1 for self vote

    const majority = Math.floor(this.nodes.size / 2) + 1;

    if (grantedVotes >= majority) {
      this.state.state = 'leader';
      return this.nodeId;
    }

    // Election failed, revert to follower
    this.state.state = 'follower';
    throw new Error('Failed to achieve majority');
  }

  private async fastBullyElection(): Promise<string> {
    // Fast bully algorithm with optimizations
    return await this.bullyElection(); // Simplified for now
  }

  private async sendElectionMessages(nodeIds: string[]): Promise<any[]> {
    const promises = nodeIds.map((nodeId) => this.sendElectionMessage(nodeId));
    const results = await Promise.allSettled(promises);

    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<any>).value);
  }

  private async sendElectionMessage(nodeId: string): Promise<any> {
    // Simulate sending election message
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ nodeId, response: 'answer' });
      }, Math.random() * 100);
    });
  }

  private async sendVoteRequest(nodeId: string): Promise<boolean> {
    // Simulate sending vote request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.3); // 70% chance of vote
      }, Math.random() * 100);
    });
  }

  private async announceVictory(): Promise<void> {
    this.logger.info('Announcing election victory', { nodeId: this.nodeId });

    // Send coordinator messages to all nodes
    const announcements = Array.from(this.nodes.keys())
      .filter((nodeId) => nodeId !== this.nodeId)
      .map((nodeId) => this.sendCoordinatorMessage(nodeId));

    await Promise.allSettled(announcements);
  }

  private async sendCoordinatorMessage(nodeId: string): Promise<void> {
    // Simulate sending coordinator message
    return new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
  }

  private async waitForCoordinator(): Promise<string> {
    // Wait for coordinator announcement
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Coordinator announcement timeout'));
      }, this.config.timeoutMs);

      // Simulate waiting for coordinator message
      setTimeout(() => {
        clearTimeout(timeout);
        // Return highest priority node as leader
        const highestPriorityNode = Array.from(this.nodes.values())
          .filter((node) => node.status === 'active')
          .sort((a, b) => this.getNodePriority(b.id) - this.getNodePriority(a.id))[0];

        resolve(highestPriorityNode?.id || this.nodeId);
      }, Math.random() * 200);
    });
  }

  private setupHeartbeat(): void {
    setInterval(() => {
      if (this.state.state === 'leader') {
        this.sendHeartbeats();
      } else {
        this.checkLeaderHealth();
      }
    }, this.config.heartbeatInterval);
  }

  private sendHeartbeats(): void {
    // Send heartbeats to all followers
    for (const nodeId of this.nodes.keys()) {
      if (nodeId !== this.nodeId) {
        this.sendHeartbeat(nodeId);
      }
    }
  }

  private sendHeartbeat(nodeId: string): void {
    // Simulate sending heartbeat
    this.eventBus.emit('heartbeat:sent', {
      id: `heartbeat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      version: '1.0.0',
      timestamp: new Date(),
      source: this.nodeId,
      heartbeatId: `heartbeat-${this.nodeId}-${Date.now()}`,
      fromNodeId: this.nodeId,
      from: this.nodeId,
      toNodeId: nodeId,
      heartbeatType: 'node',
      sequenceNumber: this.state.currentTerm,
      interval: 1000,
      payload: {
        status: 'healthy',
        load: 0.5,
        responseTime: 10,
        lastActivity: new Date(),
      },
      expectedResponse: true,
    });
  }

  private checkLeaderHealth(): void {
    if (!this.state.currentLeader) return;

    const leader = this.nodes.get(this.state.currentLeader);
    if (!leader) return;

    const timeSinceLastHeartbeat = Date.now() - leader.lastHeartbeat.getTime();

    if (timeSinceLastHeartbeat > this.config.heartbeatInterval * 3) {
      this.logger.warn('Leader appears to be failed', { leaderId: this.state.currentLeader });
      this.emit('leader:failed', { leaderId: this.state.currentLeader });

      // Start new election
      this.startElection().catch((error) => {
        this.logger.error('Failed to start election after leader failure', { error });
      });
    }
  }

  private getNodePriority(nodeId: string): number {
    const node = this.nodes.get(nodeId);
    return node?.priority || 0;
  }

  async shutdown(): Promise<void> {
    this.enabled = false;
    if (this.state.electionTimeout) {
      clearTimeout(this.state.electionTimeout);
    }
    this.logger.info('Leader election shutdown');
  }
}

/**
 * Consensus Engine Implementation (Raft-like)
 */
class ConsensusEngine extends EventEmitter {
  private state: ConsensusState;
  private nodes = new Map<string, CoordinationNode>();
  private enabled = true;
  private operationCount = 0;
  private successfulOperations = 0;
  private failureCount = 0;
  private latencyHistory: number[] = [];

  constructor(
    private nodeId: string,
    private config: ConsensusConfig,
    private logger: ILogger,
    private eventBus: IEventBus,
  ) {
    super();

    this.state = {
      currentTerm: 0,
      log: [],
      commitIndex: -1,
      lastApplied: -1,
      nextIndex: new Map(),
      matchIndex: new Map(),
      state: 'follower',
      votes: new Set(),
    };
  }

  async start(): Promise<void> {
    if (!this.enabled) return;

    this.logger.info('Starting consensus engine', { algorithm: this.config.algorithm });
    this.setupElectionTimeout();
  }

  async addNode(node: CoordinationNode): Promise<void> {
    this.nodes.set(node.id, node);
    this.state.nextIndex.set(node.id, this.state.log.length);
    this.state.matchIndex.set(node.id, -1);
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.state.nextIndex.delete(nodeId);
    this.state.matchIndex.delete(nodeId);
  }

  async propose(command: any): Promise<boolean> {
    if (!this.enabled) return false;
    if (this.state.state !== 'leader') return false;

    const startTime = Date.now();
    this.operationCount++;

    try {
      const entry: LogEntry = {
        term: this.state.currentTerm,
        index: this.state.log.length,
        command,
        timestamp: new Date(),
        committed: false,
        checksum: this.calculateChecksum(command),
      };

      this.state.log.push(entry);

      // Replicate to followers
      const success = await this.replicateEntry(entry);

      if (success) {
        entry.committed = true;
        this.state.commitIndex = entry.index;
        this.successfulOperations++;

        const latency = Date.now() - startTime;
        this.latencyHistory.push(latency);
        if (this.latencyHistory.length > 100) {
          this.latencyHistory.shift();
        }

        this.emit('consensus:reached', { entry, latency });
        this.emit('log:committed', { entry });

        return true;
      } else {
        this.failureCount++;
        return false;
      }
    } catch (error) {
      this.failureCount++;
      this.logger.error('Consensus proposal failed', { error });
      return false;
    }
  }

  getState(): any {
    return {
      term: this.state.currentTerm,
      state: this.state.state,
      logLength: this.state.log.length,
      commitIndex: this.state.commitIndex,
      lastApplied: this.state.lastApplied,
    };
  }

  getOperationCount(): number {
    return this.operationCount;
  }

  getSuccessfulOperations(): number {
    return this.successfulOperations;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getThroughput(): number {
    // Operations per second over last minute
    return this.successfulOperations; // Simplified
  }

  getAverageLatency(): number {
    return this.latencyHistory.length > 0
      ? this.latencyHistory.reduce((sum, lat) => sum + lat, 0) / this.latencyHistory.length
      : 0;
  }

  async enable(): Promise<void> {
    this.enabled = true;
    await this.start();
  }

  async disable(): Promise<void> {
    this.enabled = false;
  }

  private async replicateEntry(entry: LogEntry): Promise<boolean> {
    const followers = Array.from(this.nodes.keys()).filter((id) => id !== this.nodeId);

    if (followers.length === 0) {
      return true; // Single node cluster
    }

    const replicationPromises = followers.map((followerId) =>
      this.sendAppendEntries(followerId, [entry]),
    );

    const responses = await Promise.allSettled(replicationPromises);
    const successCount = responses.filter(
      (result) => result.status === 'fulfilled' && result.value.success,
    ).length;

    const majority = Math.floor(this.nodes.size / 2) + 1;
    return successCount >= majority - 1; // -1 because leader doesn't need to replicate to itself
  }

  private async sendAppendEntries(
    followerId: string,
    entries: LogEntry[],
  ): Promise<AppendEntriesResponse> {
    const prevLogIndex = this.state.log.length - entries.length - 1;
    const prevLogTerm = prevLogIndex >= 0 ? this.state.log[prevLogIndex].term : 0;

    const request: AppendEntriesRequest = {
      term: this.state.currentTerm,
      leaderId: this.nodeId,
      prevLogIndex,
      prevLogTerm,
      entries,
      leaderCommit: this.state.commitIndex,
    };

    // Simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          term: this.state.currentTerm,
          success: Math.random() > 0.1, // 90% success rate
          matchIndex: prevLogIndex + entries.length,
        });
      }, Math.random() * 50);
    });
  }

  private setupElectionTimeout(): void {
    const timeout = this.getRandomElectionTimeout();

    setTimeout(() => {
      if (this.enabled && this.state.state === 'follower') {
        this.startElection();
      }
      this.setupElectionTimeout(); // Restart timeout
    }, timeout);
  }

  private getRandomElectionTimeout(): number {
    const [min, max] = this.config.electionTimeout;
    return Math.random() * (max - min) + min;
  }

  private async startElection(): Promise<void> {
    this.state.currentTerm++;
    this.state.state = 'candidate';
    this.state.votedFor = this.nodeId;
    this.state.votes.clear();
    this.state.votes.add(this.nodeId);

    this.logger.info('Starting consensus election', { term: this.state.currentTerm });

    // Send vote requests
    const voteRequests = Array.from(this.nodes.keys())
      .filter((nodeId) => nodeId !== this.nodeId)
      .map((nodeId) => this.sendVoteRequest(nodeId));

    const responses = await Promise.allSettled(voteRequests);
    const grantedVotes =
      responses.filter((result) => result.status === 'fulfilled' && result.value.voteGranted)
        .length + 1; // +1 for self vote

    const majority = Math.floor(this.nodes.size / 2) + 1;

    if (grantedVotes >= majority) {
      this.becomeLeader();
    } else {
      this.state.state = 'follower';
    }
  }

  private async sendVoteRequest(nodeId: string): Promise<VoteResponse> {
    const lastLogIndex = this.state.log.length - 1;
    const lastLogTerm = lastLogIndex >= 0 ? this.state.log[lastLogIndex].term : 0;

    const request: VoteRequest = {
      term: this.state.currentTerm,
      candidateId: this.nodeId,
      lastLogIndex,
      lastLogTerm,
    };

    // Simulate vote request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          term: this.state.currentTerm,
          voteGranted: Math.random() > 0.3, // 70% chance of vote
        });
      }, Math.random() * 100);
    });
  }

  private becomeLeader(): void {
    this.state.state = 'leader';

    // Initialize leader state
    for (const nodeId of this.nodes.keys()) {
      this.state.nextIndex.set(nodeId, this.state.log.length);
      this.state.matchIndex.set(nodeId, -1);
    }

    this.logger.info('Became consensus leader', { term: this.state.currentTerm });

    // Start sending heartbeats
    this.sendHeartbeats();
  }

  private sendHeartbeats(): void {
    if (this.state.state !== 'leader') return;

    const heartbeatPromises = Array.from(this.nodes.keys())
      .filter((nodeId) => nodeId !== this.nodeId)
      .map((nodeId) => this.sendAppendEntries(nodeId, []));

    Promise.allSettled(heartbeatPromises).then(() => {
      // Schedule next heartbeat
      setTimeout(() => this.sendHeartbeats(), this.config.heartbeatInterval);
    });
  }

  private calculateChecksum(command: any): string {
    return createHash('sha256').update(JSON.stringify(command)).digest('hex');
  }

  async shutdown(): Promise<void> {
    this.enabled = false;
    this.logger.info('Consensus engine shutdown');
  }
}

/**
 * Work Stealing System Implementation
 */
class WorkStealingSystem extends EventEmitter {
  private workQueues = new Map<string, WorkQueue>();
  private nodes = new Map<string, CoordinationNode>();
  private enabled = true;
  private processedCount = 0;
  private successfulOperations = 0;
  private failureCount = 0;
  private latencyHistory: number[] = [];

  constructor(
    private nodeId: string,
    private config: WorkStealingConfig,
    private logger: ILogger,
    private eventBus: IEventBus,
  ) {
    super();

    // Initialize own work queue
    this.workQueues.set(nodeId, {
      nodeId,
      items: [],
      capacity: config.maxQueueSize,
      processing: new Set(),
      completed: 0,
      failed: 0,
      lastActivity: new Date(),
    });
  }

  async start(): Promise<void> {
    if (!this.enabled) return;

    this.logger.info('Starting work stealing system');
    this.startLoadBalancing();
    this.startWorkProcessing();
  }

  async addNode(node: CoordinationNode): Promise<void> {
    this.nodes.set(node.id, node);

    if (!this.workQueues.has(node.id)) {
      this.workQueues.set(node.id, {
        nodeId: node.id,
        items: [],
        capacity: this.config.maxQueueSize,
        processing: new Set(),
        completed: 0,
        failed: 0,
        lastActivity: new Date(),
      });
    }
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);

    // Redistribute work from removed node
    const queue = this.workQueues.get(nodeId);
    if (queue && queue.items.length > 0) {
      this.redistributeWork(queue.items);
    }

    this.workQueues.delete(nodeId);
  }

  async submitWork(item: Omit<WorkItem, 'id' | 'created' | 'attempts'>): Promise<string> {
    if (!this.enabled) throw new Error('Work stealing system disabled');

    const workItem: WorkItem = {
      ...item,
      id: this.generateWorkId(),
      created: new Date(),
      attempts: 0,
    };

    // Add to least loaded queue
    const targetQueue = this.findLeastLoadedQueue();
    targetQueue.items.push(workItem);
    targetQueue.lastActivity = new Date();

    this.logger.debug('Work submitted', {
      workId: workItem.id,
      targetQueue: targetQueue.nodeId,
      priority: workItem.priority,
    });

    this.emit('work:submitted', { item: workItem, queue: targetQueue.nodeId });
    return workItem.id;
  }

  getQueueCount(): number {
    return this.workQueues.size;
  }

  getProcessedCount(): number {
    return this.processedCount;
  }

  getSuccessfulOperations(): number {
    return this.successfulOperations;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getThroughput(): number {
    // Items per second over last minute
    return this.successfulOperations; // Simplified
  }

  getAverageLatency(): number {
    return this.latencyHistory.length > 0
      ? this.latencyHistory.reduce((sum, lat) => sum + lat, 0) / this.latencyHistory.length
      : 0;
  }

  async enable(): Promise<void> {
    this.enabled = true;
    await this.start();
  }

  async disable(): Promise<void> {
    this.enabled = false;
  }

  private findLeastLoadedQueue(): WorkQueue {
    let leastLoaded = this.workQueues.get(this.nodeId)!;
    let minLoad = leastLoaded.items.length + leastLoaded.processing.size;

    for (const queue of this.workQueues.values()) {
      const load = queue.items.length + queue.processing.size;
      if (load < minLoad) {
        minLoad = load;
        leastLoaded = queue;
      }
    }

    return leastLoaded;
  }

  private startLoadBalancing(): void {
    setInterval(() => {
      if (this.enabled) {
        this.performLoadBalancing();
      }
    }, this.config.loadBalancingInterval);
  }

  private startWorkProcessing(): void {
    setInterval(() => {
      if (this.enabled) {
        this.processWork();
      }
    }, 100); // Process every 100ms
  }

  private performLoadBalancing(): void {
    const myQueue = this.workQueues.get(this.nodeId)!;
    const myLoad = myQueue.items.length + myQueue.processing.size;

    // Try to steal work if underloaded
    if (myLoad < this.config.stealThreshold) {
      this.attemptWorkStealing();
    }
  }

  private async attemptWorkStealing(): Promise<void> {
    // Find most loaded queue
    let mostLoaded: WorkQueue | null = null;
    let maxLoad = this.config.stealThreshold;

    for (const queue of this.workQueues.values()) {
      if (queue.nodeId === this.nodeId) continue;

      const load = queue.items.length;
      if (load > maxLoad) {
        maxLoad = load;
        mostLoaded = queue;
      }
    }

    if (mostLoaded) {
      await this.stealWork(mostLoaded);
    }
  }

  private async stealWork(targetQueue: WorkQueue): Promise<void> {
    const stealCount = Math.floor(targetQueue.items.length * this.config.stealRatio);

    if (stealCount === 0) return;

    const request: StealRequest = {
      requesterId: this.nodeId,
      targetId: targetQueue.nodeId,
      requestedCount: stealCount,
      timestamp: new Date(),
    };

    try {
      const response = await this.sendStealRequest(request);

      if (response.success && response.items.length > 0) {
        const myQueue = this.workQueues.get(this.nodeId)!;

        for (const item of response.items) {
          item.stolen = true;
          item.owner = this.nodeId;
          myQueue.items.push(item);
        }

        this.logger.debug('Work stolen successfully', {
          from: targetQueue.nodeId,
          count: response.items.length,
        });

        this.emit('work:stolen', {
          from: targetQueue.nodeId,
          to: this.nodeId,
          count: response.items.length,
        });
      }
    } catch (error) {
      this.logger.error('Work stealing failed', {
        target: targetQueue.nodeId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async sendStealRequest(request: StealRequest): Promise<StealResponse> {
    // Simulate work stealing request
    return new Promise((resolve) => {
      setTimeout(() => {
        const targetQueue = this.workQueues.get(request.targetId);

        if (!targetQueue || targetQueue.items.length === 0) {
          resolve({ success: false, items: [], reason: 'No work available' });
          return;
        }

        // Steal lowest priority items
        const sortedItems = [...targetQueue.items].sort((a, b) => a.priority - b.priority);
        const stolenItems = sortedItems.slice(0, request.requestedCount);

        // Remove from target queue
        for (const item of stolenItems) {
          const index = targetQueue.items.indexOf(item);
          if (index !== -1) {
            targetQueue.items.splice(index, 1);
          }
        }

        resolve({ success: true, items: stolenItems });
      }, Math.random() * 50);
    });
  }

  private processWork(): void {
    const myQueue = this.workQueues.get(this.nodeId)!;

    if (myQueue.items.length === 0) return;

    // Sort by priority and process highest priority items
    myQueue.items.sort((a, b) => b.priority - a.priority);

    const item = myQueue.items.shift();
    if (!item) return;

    this.executeWorkItem(item);
  }

  private async executeWorkItem(item: WorkItem): Promise<void> {
    const startTime = Date.now();
    const myQueue = this.workQueues.get(this.nodeId)!;

    myQueue.processing.add(item.id);
    item.attempts++;
    this.processedCount++;

    try {
      // Simulate work execution
      await this.simulateWork(item);

      // Work completed successfully
      myQueue.processing.delete(item.id);
      myQueue.completed++;
      this.successfulOperations++;

      const latency = Date.now() - startTime;
      this.latencyHistory.push(latency);
      if (this.latencyHistory.length > 100) {
        this.latencyHistory.shift();
      }

      this.logger.debug('Work completed', {
        workId: item.id,
        latency,
        attempts: item.attempts,
      });

      this.emit('work:completed', { item, latency });
    } catch (error) {
      myQueue.processing.delete(item.id);
      this.failureCount++;

      if (item.attempts < item.maxAttempts) {
        // Retry the work item
        myQueue.items.push(item);
        this.logger.debug('Work failed, retrying', {
          workId: item.id,
          attempts: item.attempts,
          maxAttempts: item.maxAttempts,
        });
      } else {
        // Max attempts reached
        myQueue.failed++;
        this.logger.error('Work failed permanently', {
          workId: item.id,
          attempts: item.attempts,
          error: error instanceof Error ? error.message : String(error),
        });

        this.emit('work:failed', { item, error });
      }
    }
  }

  private async simulateWork(item: WorkItem): Promise<void> {
    // Simulate work execution time based on item type and complexity
    const baseTime = 100;
    const complexity = item.payload?.complexity || 1;
    const executionTime = baseTime * complexity * (0.5 + Math.random());

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.9) {
          // 10% failure rate
          reject(new Error('Simulated work failure'));
        } else {
          resolve();
        }
      }, executionTime);
    });
  }

  private redistributeWork(items: WorkItem[]): void {
    if (items.length === 0) return;

    // Distribute items among remaining queues
    const availableQueues = Array.from(this.workQueues.values()).filter(
      (queue) => queue.nodeId !== this.nodeId,
    );

    if (availableQueues.length === 0) {
      // Add to own queue
      const myQueue = this.workQueues.get(this.nodeId)!;
      myQueue.items.push(...items);
      return;
    }

    let queueIndex = 0;
    for (const item of items) {
      const targetQueue = availableQueues[queueIndex];
      targetQueue.items.push(item);
      queueIndex = (queueIndex + 1) % availableQueues.length;
    }

    this.logger.info('Work redistributed', {
      itemCount: items.length,
      targetQueues: availableQueues.length,
    });
  }

  private generateWorkId(): string {
    return `work-${Date.now()}-${randomBytes(4).toString('hex')}`;
  }

  async shutdown(): Promise<void> {
    this.enabled = false;
    this.logger.info('Work stealing system shutdown');
  }
}

/**
 * Hierarchical Coordinator Implementation
 */
class HierarchicalCoordinator extends EventEmitter {
  private hierarchy = new Map<string, HierarchyNode>();
  private nodes = new Map<string, CoordinationNode>();
  private enabled = true;
  private activeDelegations = 0;
  private successfulOperations = 0;
  private failureCount = 0;
  private latencyHistory: number[] = [];

  constructor(
    private nodeId: string,
    private config: HierarchicalConfig,
    private logger: ILogger,
    private eventBus: IEventBus,
  ) {
    super();

    // Initialize as root node
    this.hierarchy.set(nodeId, {
      id: nodeId,
      children: new Set(),
      level: 0,
      span: 0,
      role: 'root',
      delegation: {
        maxDelegations: config.fanOut,
        currentDelegations: 0,
        thresholds: {
          delegate: config.delegationThreshold,
          escalate: 0.8,
          rebalance: 0.7,
        },
      },
      load: {
        current: 0,
        capacity: 100,
        trend: 'stable',
        utilization: 0,
      },
    });
  }

  async start(): Promise<void> {
    if (!this.enabled) return;

    this.logger.info('Starting hierarchical coordinator');
    this.startRebalancing();
  }

  async addNode(node: CoordinationNode): Promise<void> {
    this.nodes.set(node.id, node);
    await this.insertNodeIntoHierarchy(node);
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.removeNodeFromHierarchy(nodeId);
  }

  async delegate(request: DelegationRequest): Promise<boolean> {
    if (!this.enabled) return false;

    const startTime = Date.now();
    const delegator = this.hierarchy.get(request.delegatorId);
    const delegate = this.hierarchy.get(request.delegateId);

    if (!delegator || !delegate) {
      this.failureCount++;
      return false;
    }

    try {
      // Check delegation constraints
      if (delegator.delegation.currentDelegations >= delegator.delegation.maxDelegations) {
        this.failureCount++;
        return false;
      }

      if (delegate.load.utilization > 0.8) {
        this.failureCount++;
        return false;
      }

      // Establish delegation
      delegator.delegation.currentDelegations++;
      delegate.load.current++;
      delegate.load.utilization = delegate.load.current / delegate.load.capacity;
      this.activeDelegations++;

      const latency = Date.now() - startTime;
      this.latencyHistory.push(latency);
      if (this.latencyHistory.length > 100) {
        this.latencyHistory.shift();
      }

      this.successfulOperations++;

      this.logger.info('Delegation created', {
        from: request.delegatorId,
        to: request.delegateId,
        priority: request.priority,
        latency,
      });

      this.emit('delegation:created', {
        delegatorId: request.delegatorId,
        delegateId: request.delegateId,
        task: request.task,
        latency,
      });

      return true;
    } catch (error) {
      this.failureCount++;
      this.logger.error('Delegation failed', { request, error });
      return false;
    }
  }

  async escalate(request: EscalationRequest): Promise<boolean> {
    if (!this.enabled) return false;

    const escalator = this.hierarchy.get(request.escalatorId);
    if (!escalator || !escalator.parentId) {
      return false;
    }

    const supervisor = this.hierarchy.get(escalator.parentId);
    if (!supervisor) {
      return false;
    }

    this.logger.info('Escalation triggered', {
      from: request.escalatorId,
      to: request.supervisorId,
      reason: request.reason,
      urgency: request.urgency,
    });

    this.emit('escalation:triggered', {
      escalatorId: request.escalatorId,
      supervisorId: request.supervisorId,
      reason: request.reason,
      urgency: request.urgency,
    });

    return true;
  }

  getDepth(): number {
    let maxDepth = 0;
    for (const node of this.hierarchy.values()) {
      maxDepth = Math.max(maxDepth, node.level);
    }
    return maxDepth + 1;
  }

  getActiveDelegations(): number {
    return this.activeDelegations;
  }

  getSuccessfulOperations(): number {
    return this.successfulOperations;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getThroughput(): number {
    return this.successfulOperations; // Simplified
  }

  getAverageLatency(): number {
    return this.latencyHistory.length > 0
      ? this.latencyHistory.reduce((sum, lat) => sum + lat, 0) / this.latencyHistory.length
      : 0;
  }

  async enable(): Promise<void> {
    this.enabled = true;
    await this.start();
  }

  async disable(): Promise<void> {
    this.enabled = false;
  }

  private async insertNodeIntoHierarchy(node: CoordinationNode): Promise<void> {
    // Find appropriate parent based on load and span constraints
    const parent = this.findBestParent();

    if (!parent) {
      // Create as child of root
      const root = this.hierarchy.get(this.nodeId)!;
      this.createChildNode(node, root);
    } else {
      this.createChildNode(node, parent);
    }
  }

  private findBestParent(): HierarchyNode | null {
    let bestParent: HierarchyNode | null = null;
    let minLoad = Infinity;

    for (const node of this.hierarchy.values()) {
      if (
        node.level < this.config.maxDepth - 1 &&
        node.children.size < this.config.fanOut &&
        node.load.utilization < minLoad
      ) {
        minLoad = node.load.utilization;
        bestParent = node;
      }
    }

    return bestParent;
  }

  private createChildNode(node: CoordinationNode, parent: HierarchyNode): void {
    const hierarchyNode: HierarchyNode = {
      id: node.id,
      parentId: parent.id,
      children: new Set(),
      level: parent.level + 1,
      span: 0,
      role: 'leaf',
      delegation: {
        maxDelegations: Math.max(1, Math.floor(this.config.fanOut / 2)),
        currentDelegations: 0,
        thresholds: {
          delegate: this.config.delegationThreshold,
          escalate: 0.8,
          rebalance: 0.7,
        },
      },
      load: {
        current: 0,
        capacity: 50,
        trend: 'stable',
        utilization: 0,
      },
    };

    this.hierarchy.set(node.id, hierarchyNode);
    parent.children.add(node.id);
    parent.span++;

    // Update roles
    if (parent.role === 'leaf') {
      parent.role = 'coordinator';
    }

    this.logger.debug('Node added to hierarchy', {
      nodeId: node.id,
      parentId: parent.id,
      level: hierarchyNode.level,
    });
  }

  private removeNodeFromHierarchy(nodeId: string): void {
    const node = this.hierarchy.get(nodeId);
    if (!node) return;

    // Remove from parent's children
    if (node.parentId) {
      const parent = this.hierarchy.get(node.parentId);
      if (parent) {
        parent.children.delete(nodeId);
        parent.span--;

        if (parent.children.size === 0 && parent.id !== this.nodeId) {
          parent.role = 'leaf';
        }
      }
    }

    // Reassign children to parent or siblings
    if (node.children.size > 0) {
      this.reassignOrphans(Array.from(node.children));
    }

    this.hierarchy.delete(nodeId);
  }

  private reassignOrphans(orphanIds: string[]): void {
    for (const orphanId of orphanIds) {
      const orphan = this.hierarchy.get(orphanId);
      if (!orphan) continue;

      const newParent = this.findBestParent();
      if (newParent) {
        orphan.parentId = newParent.id;
        orphan.level = newParent.level + 1;
        newParent.children.add(orphanId);
        newParent.span++;
      }
    }
  }

  private startRebalancing(): void {
    setInterval(() => {
      if (this.enabled) {
        this.performRebalancing();
      }
    }, this.config.rebalanceInterval);
  }

  private performRebalancing(): void {
    // Check for load imbalances and rebalance if necessary
    for (const node of this.hierarchy.values()) {
      if (node.load.utilization > node.delegation.thresholds.rebalance) {
        this.rebalanceNode(node);
      }
    }
  }

  private rebalanceNode(node: HierarchyNode): void {
    this.logger.debug('Rebalancing node', {
      nodeId: node.id,
      utilization: node.load.utilization,
      threshold: node.delegation.thresholds.rebalance,
    });

    // Implementation would redistribute load or restructure hierarchy
    // For now, just log the rebalancing attempt
  }

  async shutdown(): Promise<void> {
    this.enabled = false;
    this.logger.info('Hierarchical coordinator shutdown');
  }
}

export default CoordinationPatterns;
