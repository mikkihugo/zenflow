/**
 * @fileoverview Matron
 * 
 * Universal domain specialist coordinator that can handle any domain.
 */

import { getLogger } from '@claude-zen/foundation';
import { CoordinationEventBus } from '../events/coordination-event-bus';
import type { CoordinationAgent, MatronDomain, CoordinationDecision } from '../types';

const logger = getLogger('matron');

export interface MatronConfig {
  domain: MatronDomain;
  specialization: string;
  capabilities: string[];
  resources?: {
    maxAgents: number;
    priority: number;
  };
}

export interface MatronCoordinationRequest {
  objective: string;
  requirements: string[];
  priority: 'low' | 'medium' | 'high';
  constraints?: Record<string, unknown>;
}

export class Matron implements CoordinationAgent {
  public readonly id: string;
  public readonly role = 'matron' as const;
  public readonly domain: MatronDomain;
  public readonly capabilities: string[];
  public active: boolean = false;
  public lastActivity: number = Date.now();

  private config: MatronConfig;
  private decisions: CoordinationDecision[] = [];
  private activeOperations: Map<string, unknown> = new Map();
  private eventBus: CoordinationEventBus;

  constructor(config: MatronConfig) {
    this.id = `matron-${config.domain}-${config.specialization}-${Date.now()}`;
    this.domain = config.domain;
    this.config = config;
    this.capabilities = this.generateCapabilities(config);
    this.eventBus = CoordinationEventBus.getInstance();
    
    // Setup event handlers
    this.setupEventHandlers();
  }

  /**
   * Generate domain-specific capabilities.
   */
  private generateCapabilities(config: MatronConfig): string[] {
    const baseCaps = ['coordination', 'monitoring', 'optimization'];
    const domainCaps = this.getDomainCapabilities(config.domain);
    return [...baseCaps, ...domainCaps, ...config.capabilities];
  }

  /**
   * Get domain-specific capabilities.
   */
  private getDomainCapabilities(domain: MatronDomain): string[] {
    const domainMap: Record<MatronDomain, string[]> = {
      development: ['code-review', 'architecture-design', 'testing-coordination'],
      operations: ['deployment', 'monitoring', 'infrastructure'],
      security: ['vulnerability-assessment', 'compliance', 'threat-analysis'],
      testing: ['test-planning', 'quality-assurance', 'automation'],
      analytics: ['data-analysis', 'metrics-collection', 'reporting'],
      research: ['literature-review', 'experimentation', 'knowledge-synthesis']
    };
    return domainMap[domain] || [];
  }

  /**
   * Setup event handlers for coordination events.
   */
  private setupEventHandlers(): void {
    // Listen for tactical operations that might need domain expertise
    this.eventBus.on('operation:tactical', async (event: any) => {
      if (event.operationType && this.canHandleOperation(event.operationType)) {
        logger.info(`${this.domain} Matron ${this.id} can assist with operation: ${event.operationId}`);
        await this.onTacticalOperation(event);
      }
    });

    // Listen for cross-domain coordination requests
    this.eventBus.on('coordination:cross-domain', async (event: any) => {
      if (event.matronIds && event.matronIds.includes(this.id)) {
        logger.info(`${this.domain} Matron ${this.id} involved in cross-domain coordination: ${event.coordinationId}`);
        await this.onCrossDomainCoordination(event);
      }
    });

    // Listen for decisions that might affect our domain
    this.eventBus.on('decision:made', async (event: any) => {
      if (event.decision && this.isRelevantDecision(event.decision)) {
        logger.info(`${this.domain} Matron ${this.id} monitoring relevant decision: ${event.decision.id}`);
        await this.onRelevantDecision(event.decision);
      }
    });
  }


  /**
   * Check if we can handle a specific operation type.
   */
  protected canHandleOperation(operationType: string): boolean {
    const domainOperations = {
      development: ['code-review', 'architecture', 'testing'],
      operations: ['deployment', 'monitoring', 'infrastructure'],
      security: ['audit', 'compliance', 'vulnerability-scan'],
      testing: ['test-planning', 'qa', 'automation'],
      analytics: ['data-analysis', 'reporting', 'metrics'],
      research: ['literature-review', 'experimentation', 'synthesis']
    };
    
    return domainOperations[this.domain]?.some(op => operationType.includes(op)) || false;
  }

  /**
   * Check if a decision is relevant to our domain.
   */
  protected isRelevantDecision(decision: CoordinationDecision): boolean {
    return decision.action.includes(this.domain) || 
           this.capabilities.some(cap => decision.action.includes(cap));
  }

  /**
   * Handle tactical operation events (can be overridden by subclasses).
   */
  protected async onTacticalOperation(event: any): Promise<void> {
    // Base implementation - subclasses can override
    this.lastActivity = Date.now();
  }

  /**
   * Handle cross-domain coordination events (can be overridden by subclasses).
   */
  protected async onCrossDomainCoordination(event: any): Promise<void> {
    // Base implementation - subclasses can override
    this.lastActivity = Date.now();
  }

  /**
   * Handle relevant decision events (can be overridden by subclasses).
   */
  protected async onRelevantDecision(decision: CoordinationDecision): Promise<void> {
    // Base implementation - subclasses can override
    this.lastActivity = Date.now();
  }

  /**
   * Coordinate domain-specific work.
   */
  async coordinate(request: MatronCoordinationRequest): Promise<{
    success: boolean;
    operationId: string;
    estimatedDuration?: number;
  }> {
    const operationId = `${this.domain}-op-${Date.now()}`;
    
    const decision: CoordinationDecision = {
      id: `decision-${Date.now()}`,
      timestamp: Date.now(),
      decisionMaker: 'matron',
      decisionType: 'tactical',
      action: 'domain-coordination',
      parameters: { ...request, domain: this.domain },
      confidence: this.calculateConfidence(request),
      reasoning: `Domain-specific coordination for ${this.domain}: ${request.objective}`
    };

    this.decisions.push(decision);
    this.activeOperations.set(operationId, request);
    
    // Emit domain coordination event
    await this.eventBus.createAndEmit({
      type: 'coordination:domain',
      source: this.id,
      matronId: this.id,
      domain: this.domain,
      objective: request.objective,
      operationId: operationId,
      estimatedDuration: this.estimateDuration(request)
    });

    // Emit decision made event
    await this.eventBus.createAndEmit({
      type: 'decision:made',
      source: this.id,
      decision: decision,
      agentId: this.id,
      agentRole: 'matron'
    });
    
    logger.info(`${this.domain} Matron ${this.id} coordinating: ${request.objective}`);
    
    return {
      success: true,
      operationId,
      estimatedDuration: this.estimateDuration(request)
    };
  }

  /**
   * Calculate confidence based on request complexity.
   */
  private calculateConfidence(request: MatronCoordinationRequest): number {
    const baseConfidence = 0.8;
    const complexityPenalty = Math.min(request.requirements.length * 0.05, 0.2);
    return Math.max(baseConfidence - complexityPenalty, 0.6);
  }

  /**
   * Estimate operation duration (in minutes).
   */
  private estimateDuration(request: MatronCoordinationRequest): number {
    const baseTime = 30; // 30 minutes base
    const complexityMultiplier = request.requirements.length * 10;
    const priorityMultiplier = request.priority === 'high' ? 0.8 : request.priority === 'low' ? 1.2 : 1.0;
    
    return Math.round((baseTime + complexityMultiplier) * priorityMultiplier);
  }

  /**
   * Coordinate with another matron.
   */
  async coordinateWith(otherMatron: Matron, task: {
    objective: string;
    requirements: string[];
  }): Promise<{ success: boolean; coordinationId: string }> {
    const coordinationId = `coord-${this.id}-${otherMatron.id}-${Date.now()}`;
    
    // Emit cross-domain coordination event
    await this.eventBus.createAndEmit({
      type: 'coordination:cross-domain',
      source: this.id,
      matronIds: [this.id, otherMatron.id],
      domains: [this.domain, otherMatron.domain],
      coordinationId: coordinationId,
      objective: task.objective
    });
    
    logger.info(`${this.domain} Matron ${this.id} coordinating with ${otherMatron.domain} Matron`);
    
    return {
      success: true,
      coordinationId
    };
  }

  /**
   * Initialize the matron.
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing ${this.domain} Matron ${this.id}`);
    this.active = true;
    this.lastActivity = Date.now();

    // Emit matron initialized event
    await this.eventBus.createAndEmit({
      type: 'matron:initialized',
      source: this.id,
      matronId: this.id,
      domain: this.domain,
      specialization: this.config.specialization,
      capabilities: this.capabilities
    });
  }

  /**
   * Get matron metrics.
   */
  getMetrics() {
    return {
      domain: this.domain,
      specialization: this.config.specialization,
      decisionsMade: this.decisions.length,
      activeOperations: this.activeOperations.size,
      averageConfidence: this.decisions.reduce((sum, d) => sum + d.confidence, 0) / this.decisions.length || 0
    };
  }

  /**
   * Complete an operation.
   */
  async completeOperation(operationId: string, result: { success: boolean; data?: unknown }): Promise<void> {
    this.activeOperations.delete(operationId);
    
    // Emit operation completed event
    await this.eventBus.createAndEmit({
      type: 'operation:completed',
      source: this.id,
      matronId: this.id,
      operationId: operationId,
      success: result.success,
      duration: 0 // Would be calculated from operation start time
    });

    logger.info(`${this.domain} Matron ${this.id} completed operation: ${operationId}`);
  }

  /**
   * Shutdown the matron.
   */
  async shutdown(): Promise<void> {
    this.active = false;
    logger.info(`${this.domain} Matron ${this.id} shutting down`);
  }
}