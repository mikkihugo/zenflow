/**
 * @file Progressive Confidence Builder for Domain Discovery
 * Builds confidence in domain discovery through iterations with human validation.
 * Integrates with HiveFACT for online research and MCP memory for persistence.
 */

import { EventEmitter } from 'node:events';
import { createLogger } from '@core/logger';
import type { AGUIInterface } from '@interfaces/agui/agui-adapter';
import type { SessionMemoryStore } from '@memory/memory';
import { getHiveFACT, type HiveFACTSystem } from '../hive-fact-integration';
import type { DiscoveredDomain, DomainDiscoveryBridge } from './domain-discovery-bridge';

const logger = createLogger({ prefix: 'ProgressiveConfidence' });

export interface LearningEvent {
  timestamp: number;
  type:
    | 'document_import'
    | 'human_validation'
    | 'online_research'
    | 'confidence_update'
    | 'domain_refinement';
  data: any;
  confidenceBefore: number;
  confidenceAfter: number;
  source: string;
}

export interface ConfidenceMetrics {
  overall: number;
  documentCoverage: number;
  humanValidations: number;
  researchDepth: number;
  domainClarity: number;
  consistency: number;
}

export interface ValidationQuestion {
  id: string;
  type: 'relevance' | 'boundary' | 'relationship' | 'naming' | 'priority' | 'checkpoint' | 'review';
  question: string;
  context: any;
  options?: string[];
  allowCustom?: boolean;
  confidence: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  validationReason?: string;
  expectedImpact?: number;
}

export interface ResearchResult {
  query: string;
  sources: string[];
  insights: string[];
  confidence: number;
  relevantDomains: string[];
}

export interface ConfidentDomainMap {
  domains: Map<string, ConfidentDomain>;
  relationships: DomainRelationship[];
  confidence: ConfidenceMetrics;
  learningHistory: LearningEvent[];
  validationCount: number;
  researchCount: number;
}

export interface ConfidentDomain {
  /** Unique domain identifier */
  id: string;
  /** Domain name derived from analysis */
  name: string;
  /** Domain description based on documents and code */
  description: string;
  /** Overall confidence score (0-1) compatible with DiscoveredDomain */
  confidence: number;
  /** Detailed confidence metrics */
  detailedConfidence: ConfidenceMetrics;
  /** Associated document paths */
  documents: string[];
  /** Associated code file paths */
  codeFiles: string[];
  /** Extracted concepts from documents */
  concepts: string[];
  /** Domain directory path */
  path: string;
  /** Files associated with this domain */
  files: string[];
  /** Suggested concepts for the domain */
  suggestedConcepts: string[];
  /** Technologies detected in the domain */
  technologies: string[];
  /** Related domains */
  relatedDomains: string[];
  /** Domain category (e.g., 'coordination', 'neural', 'memory') */
  category: string;
  /** Suggested swarm topology for this domain */
  suggestedTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  /** Suggested agents for this domain */
  suggestedAgents: string[];
  /** Human validation records */
  validations: ValidationRecord[];
  /** Research results */
  research: ResearchResult[];
  /** Domain refinement history */
  refinementHistory: DomainRefinement[];
}

export interface ValidationRecord {
  questionId: string;
  question: string;
  userResponse: string;
  timestamp: number;
  impactOnConfidence: number;
  validationType: ValidationQuestion['type'];
  confidenceBefore: number;
  confidenceAfter: number;
  validationDuration?: number;
  validatorNotes?: string;
}

export interface DomainRefinement {
  timestamp: number;
  changes: string[];
  reason: string;
  confidenceImpact: number;
}

export interface DomainRelationship {
  sourceDomain: string;
  targetDomain: string;
  type: 'depends_on' | 'communicates_with' | 'extends' | 'implements' | 'uses';
  confidence: number;
  evidence: string[];
}

export interface ProgressiveConfidenceConfig {
  targetConfidence?: number;
  maxIterations?: number;
  researchThreshold?: number;
  validationBatchSize?: number;
  memoryNamespace?: string;
  validationCheckpoints?: number[];
  requireHumanApprovalAt?: number[];
  minimumValidationsPerDomain?: number;
  validationTimeoutMs?: number;
  enableDetailedAuditTrail?: boolean;
}

export interface ValidationAuditEntry {
  id: string;
  timestamp: number;
  sessionId: string;
  validationType: 'checkpoint' | 'approval' | 'correction' | 'review';
  confidenceLevel: number;
  domainCount: number;
  questionsAsked: number;
  questionsAnswered: number;
  significantChanges: string[];
  validatorId?: string;
  notes?: string;
}

export interface DiscoveryContext {
  projectPath: string;
  existingDomains?: DiscoveredDomain[];
  previousLearning?: LearningEvent[];
  userPreferences?: Record<string, any>;
  validatorId?: string;
  sessionId?: string;
}

/**
 * Progressive Confidence Builder
 * Iteratively builds confidence in domain discovery through human validation and research
 *
 * @example
 */
export class ProgressiveConfidenceBuilder extends EventEmitter {
  private confidence: number = 0.0;
  private confidenceMetrics: ConfidenceMetrics;
  private learningHistory: LearningEvent[] = [];
  private domains: Map<string, ConfidentDomain> = new Map();
  private relationships: DomainRelationship[] = [];
  private iteration: number = 0;
  private hiveFact?: HiveFACTSystem;
  private validationAuditTrail: ValidationAuditEntry[] = [];
  private currentSessionId: string;
  private validatorId?: string;
  private totalQuestionsAsked: number = 0;
  private totalQuestionsAnswered: number = 0;
  private checkpointsReached: Set<number> = new Set();

  constructor(
    private _discoveryBridge: DomainDiscoveryBridge, // xxx NEEDS_HUMAN: Parameter not used - confirm if needed for future features
    private memoryStore: SessionMemoryStore,
    private agui: AGUIInterface,
    private config: ProgressiveConfidenceConfig = {}
  ) {
    super();

    this.config = {
      targetConfidence: 0.8,
      maxIterations: 10,
      researchThreshold: 0.6,
      validationBatchSize: 5,
      memoryNamespace: 'progressive-confidence',
      validationCheckpoints: [0.3, 0.5, 0.7, 0.9],
      requireHumanApprovalAt: [0.5, 0.8],
      minimumValidationsPerDomain: 2,
      validationTimeoutMs: 300000, // 5 minutes default
      enableDetailedAuditTrail: true,
      ...config,
    };

    this.confidenceMetrics = this.initializeMetrics();
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Build confidence through progressive iterations
   *
   * @param context
   */
  async buildConfidence(context: DiscoveryContext): Promise<ConfidentDomainMap> {
    logger.info('Starting progressive confidence building', {
      projectPath: context.projectPath,
      targetConfidence: this.config.targetConfidence,
      sessionId: this.currentSessionId,
    });

    // Store validator information
    if (context.validatorId !== undefined) {
      this.validatorId = context.validatorId;
    }

    // Initialize with existing domains if provided
    if (context.existingDomains) {
      await this.initializeFromExisting(context.existingDomains);
    }

    // Load previous learning if available
    if (context.previousLearning) {
      this.learningHistory.push(...context.previousLearning);
      this.recalculateConfidenceFromHistory();
    }

    // Initialize HiveFACT for research
    const hiveFact = getHiveFACT();
    if (hiveFact !== null) {
      this.hiveFact = hiveFact;
    }

    // Main confidence building loop
    while (
      this.confidence < this.config.targetConfidence! &&
      this.iteration < this.config.maxIterations!
    ) {
      this.iteration++;
      logger.info(`Starting iteration ${this.iteration}`, { currentConfidence: this.confidence });

      try {
        // 1. Import and analyze more documents
        await this.importMoreDocuments(context);

        // 2. Check for validation checkpoints
        await this.checkValidationCheckpoints();

        // 3. Ask targeted validation questions
        await this.performHumanValidation();

        // 4. Research online if confidence is low
        if (this.confidence < this.config.researchThreshold!) {
          await this.performOnlineResearch();
        }

        // 5. Refine domain understanding
        await this.refineDomainUnderstanding();

        // 6. Update confidence metrics
        this.updateConfidenceMetrics();

        // 7. Persist learning to memory
        await this.persistLearning();

        // 8. Update audit trail
        if (this.config.enableDetailedAuditTrail) {
          await this.updateAuditTrail();
        }

        // 9. Show progress to user
        await this.showProgress();

        // Emit progress event
        this.emit('progress', {
          iteration: this.iteration,
          confidence: this.confidence,
          metrics: this.confidenceMetrics,
          domainCount: this.domains.size,
        });
      } catch (error) {
        logger.error(`Error in iteration ${this.iteration}:`, error);
        this.recordLearningEvent(
          'confidence_update',
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            iteration: this.iteration,
          },
          -0.1
        ); // Reduce confidence on error
      }
    }

    // Final validation before returning
    if (this.confidence >= this.config.targetConfidence!) {
      await this.performFinalValidation();
    }

    return this.buildConfidentDomainMap();
  }

  /**
   * Check if we've reached a validation checkpoint
   */
  private async checkValidationCheckpoints(): Promise<void> {
    const checkpoints = this.config.validationCheckpoints || [];
    const approvalPoints = this.config.requireHumanApprovalAt || [];

    for (const checkpoint of checkpoints) {
      if (this.confidence >= checkpoint && !this.checkpointsReached.has(checkpoint)) {
        this.checkpointsReached.add(checkpoint);

        // Check if this is an approval checkpoint
        if (approvalPoints.includes(checkpoint)) {
          await this.performCheckpointValidation(checkpoint, true);
        } else {
          await this.performCheckpointValidation(checkpoint, false);
        }
      }
    }
  }

  /**
   * Perform validation at a checkpoint
   *
   * @param checkpoint
   * @param requireApproval
   */
  private async performCheckpointValidation(
    checkpoint: number,
    requireApproval: boolean
  ): Promise<void> {
    logger.info(`Reached validation checkpoint: ${(checkpoint * 100).toFixed(0)}%`, {
      requireApproval,
      currentConfidence: this.confidence,
    });

    const checkpointQuestion: ValidationQuestion = {
      id: `checkpoint_${checkpoint}_${this.iteration}`,
      type: 'checkpoint',
      question: requireApproval
        ? `🔍 APPROVAL CHECKPOINT (${(checkpoint * 100).toFixed(0)}% confidence)\n\nWe've reached a significant milestone. Current state:\n- Domains identified: ${this.domains.size}\n- Confidence: ${(this.confidence * 100).toFixed(1)}%\n- Validations performed: ${this.getTotalValidations()}\n\nDo you approve to continue, or would you like to review/adjust?`
        : `📊 CHECKPOINT (${(checkpoint * 100).toFixed(0)}% confidence)\n\nProgress update:\n- Domains: ${this.domains.size}\n- Confidence: ${(this.confidence * 100).toFixed(1)}%\n\nAny feedback or adjustments needed?`,
      context: {
        checkpoint,
        domains: Array.from(this.domains.keys()),
        metrics: this.confidenceMetrics,
        iteration: this.iteration,
      },
      options: requireApproval
        ? ['Continue', 'Review domains', 'Adjust confidence', 'Add notes']
        : ['Continue', 'Add feedback'],
      confidence: this.confidence,
      priority: requireApproval ? 'critical' : 'high',
      validationReason: 'Validation checkpoint reached',
      expectedImpact: 0.0,
    };

    const response = await this.agui.askQuestion(checkpointQuestion);

    if (response === 'Review domains') {
      await this.reviewDomains();
    } else if (response === 'Adjust confidence') {
      await this.adjustConfidence();
    } else if (response === 'Add notes' || response === 'Add feedback') {
      await this.collectValidatorNotes(checkpoint);
    }

    // Record checkpoint in learning history
    this.recordLearningEvent(
      'confidence_update',
      {
        type: 'checkpoint',
        checkpoint,
        response,
        requireApproval,
      },
      0.0
    );
  }

  /**
   * Import more documents and extract insights
   *
   * @param _context
   */
  private async importMoreDocuments(_context: DiscoveryContext): Promise<void> {
    logger.info('Importing additional documents for analysis');

    // Ask user for more documents to import
    const importQuestion: ValidationQuestion = {
      id: `import_${this.iteration}`,
      type: 'relevance',
      question:
        'Would you like to import additional documentation? (Enter paths or "skip" to continue)',
      context: {
        currentDomains: Array.from(this.domains.keys()),
        documentCount: this.getDocumentCount(),
        confidence: this.confidence,
      },
      allowCustom: true,
      confidence: this.confidence,
    };

    const response = await this.agui.askQuestion(importQuestion);

    if (response && response.toLowerCase() !== 'skip') {
      // Parse document paths
      const paths = response
        .split(/[,\n]/)
        .map((p) => p.trim())
        .filter((p) => p);

      // Import and analyze documents
      for (const path of paths) {
        try {
          const insights = await this.analyzeDocument(path);
          this.recordLearningEvent(
            'document_import',
            {
              path,
              insights,
              extracted: insights.concepts.length,
            },
            0.05
          ); // Small confidence boost per document
        } catch (error) {
          logger.warn(`Failed to import document ${path}:`, error);
        }
      }
    }
  }

  /**
   * Perform targeted human validation
   */
  private async performHumanValidation(): Promise<void> {
    logger.info('Performing human validation round');

    // Generate validation questions based on current understanding
    const questions = this.generateValidationQuestions();

    // Prioritize questions
    const prioritizedQuestions = this.prioritizeQuestions(questions);

    // Batch questions for better UX
    const batches = this.batchQuestions(prioritizedQuestions, this.config.validationBatchSize!);

    for (const batch of batches) {
      const startTime = Date.now();

      // Show batch context
      await this.agui.showMessage(
        `📋 Validation Batch ${batches.indexOf(batch) + 1}/${batches.length} (${batch.length} questions)`,
        'info'
      );

      const responses = await this.agui.askBatchQuestions(batch);
      const duration = Date.now() - startTime;

      for (let i = 0; i < batch.length; i++) {
        const question = batch[i];
        const response = responses[i];

        this.totalQuestionsAsked++;

        if (response && question) {
          this.totalQuestionsAnswered++;
          await this.processValidationResponse(question, response, duration / batch.length);
        }
      }

      // Check if minimum validations met for each domain
      await this.checkMinimumValidations();
    }
  }

  /**
   * Perform online research using HiveFACT
   */
  private async performOnlineResearch(): Promise<void> {
    if (!this.hiveFact) {
      logger.warn('HiveFACT not available for research');
      return;
    }

    logger.info('Performing online research to improve confidence');

    // Research each low-confidence domain
    for (const [domainName, domain] of this.domains) {
      if (domain.detailedConfidence.overall < 0.7) {
        try {
          // Generate research queries
          const queries = this.generateResearchQueries(domain);

          for (const query of queries) {
            const facts = await this.hiveFact.searchFacts({
              query,
              limit: 5,
            });

            if (facts.length > 0) {
              const research: ResearchResult = {
                query,
                sources: facts.map((f) => f.metadata.source),
                insights: this.extractInsights(facts),
                confidence: this.calculateResearchConfidence(facts),
                relevantDomains: [domainName],
              };

              domain.research.push(research);
              this.recordLearningEvent(
                'online_research',
                {
                  domain: domainName,
                  query,
                  factsFound: facts.length,
                  sources: research.sources,
                },
                0.1 * research.confidence
              );
            }
          }
        } catch (error) {
          logger.error(`Research failed for domain ${domainName}:`, error);
        }
      }
    }
  }

  /**
   * Refine domain understanding based on accumulated knowledge
   */
  private async refineDomainUnderstanding(): Promise<void> {
    logger.info('Refining domain understanding');

    // Analyze patterns across validations and research
    const refinements = this.analyzePatterns();

    for (const refinement of refinements) {
      const domain = this.domains.get(refinement.domainName);
      if (domain) {
        // Apply refinement
        this.applyRefinement(domain, refinement);

        // Record refinement
        domain.refinementHistory.push({
          timestamp: Date.now(),
          changes: refinement.changes,
          reason: refinement.reason,
          confidenceImpact: refinement.confidenceImpact,
        });

        this.recordLearningEvent(
          'domain_refinement',
          {
            domain: refinement.domainName,
            changes: refinement.changes,
            reason: refinement.reason,
          },
          refinement.confidenceImpact
        );
      }
    }

    // Update domain relationships
    this.updateDomainRelationships();
  }

  /**
   * Update confidence metrics based on current state
   */
  private updateConfidenceMetrics(): void {
    const documentCoverage = this.calculateDocumentCoverage();
    const humanValidations = this.calculateValidationScore();
    const researchDepth = this.calculateResearchDepth();
    const domainClarity = this.calculateDomainClarity();
    const consistency = this.calculateConsistency();

    this.confidenceMetrics = {
      overall:
        (documentCoverage + humanValidations + researchDepth + domainClarity + consistency) / 5,
      documentCoverage,
      humanValidations,
      researchDepth,
      domainClarity,
      consistency,
    };

    this.confidence = this.confidenceMetrics.overall;

    // Update individual domain confidence
    for (const domain of this.domains.values()) {
      this.updateDomainConfidence(domain);
    }
  }

  /**
   * Persist learning to memory store
   */
  private async persistLearning(): Promise<void> {
    try {
      // Save learning history
      await this.memoryStore.store(
        `${this.config.memoryNamespace}/learning-history`,
        'progressive-confidence',
        {
          history: this.learningHistory,
          iteration: this.iteration,
          confidence: this.confidence,
          metrics: this.confidenceMetrics,
        }
      );

      // Save domain state
      await this.memoryStore.store(`${this.config.memoryNamespace}/domains`, 'domain-map', {
        domains: Array.from(this.domains.entries()),
        relationships: this.relationships,
      });

      logger.debug('Learning persisted to memory');
    } catch (error) {
      logger.error('Failed to persist learning:', error);
    }
  }

  /**
   * Show progress to user
   */
  private async showProgress(): Promise<void> {
    const progress = {
      iteration: this.iteration,
      confidence: `${(this.confidence * 100).toFixed(1)}%`,
      target: `${(this.config.targetConfidence! * 100).toFixed(1)}%`,
      domains: this.domains.size,
      validations: this.getTotalValidations(),
      research: this.getTotalResearch(),
      metrics: {
        documentCoverage: `${(this.confidenceMetrics.documentCoverage * 100).toFixed(1)}%`,
        humanValidations: `${(this.confidenceMetrics.humanValidations * 100).toFixed(1)}%`,
        researchDepth: `${(this.confidenceMetrics.researchDepth * 100).toFixed(1)}%`,
        domainClarity: `${(this.confidenceMetrics.domainClarity * 100).toFixed(1)}%`,
        consistency: `${(this.confidenceMetrics.consistency * 100).toFixed(1)}%`,
      },
    };

    await this.agui.showProgress(progress);
  }

  /**
   * Perform final validation before completion
   */
  private async performFinalValidation(): Promise<void> {
    logger.info('Performing final validation');

    const summary = this.generateSummary();

    const finalQuestion: ValidationQuestion = {
      id: 'final_validation',
      type: 'boundary',
      question: `Based on my analysis, I've identified ${this.domains.size} domains with ${(this.confidence * 100).toFixed(1)}% confidence. Would you like to:\n\n${summary}\n\n1. Approve and proceed\n2. Request more iterations\n3. Manually adjust domains`,
      context: {
        domains: Array.from(this.domains.entries()),
        relationships: this.relationships,
        confidence: this.confidenceMetrics,
      },
      options: ['1', '2', '3'],
      confidence: this.confidence,
    };

    const response = await this.agui.askQuestion(finalQuestion);

    if (response === '2') {
      // Continue iterations
      this.config.maxIterations! += 3;
    } else if (response === '3') {
      // Allow manual adjustments
      await this.performManualAdjustments();
    }
  }

  /**
   * Initialize from existing domains
   *
   * @param existingDomains
   */
  private async initializeFromExisting(existingDomains: DiscoveredDomain[]): Promise<void> {
    for (const domain of existingDomains) {
      const confidentDomain: ConfidentDomain = {
        ...domain,
        confidence: domain.confidence || 0.5, // Use existing confidence or default
        detailedConfidence: this.initializeMetrics(),
        path: domain.codeFiles.length > 0 && domain.codeFiles[0] ? domain.codeFiles[0] : '', // Use first code file as path
        files: domain.codeFiles, // Same as codeFiles
        suggestedConcepts: domain.concepts, // Use existing concepts
        technologies: [], // Initialize empty, can be populated later
        validations: [],
        research: [],
        refinementHistory: [],
      };

      this.domains.set(domain.name, confidentDomain);
    }
  }

  /**
   * Generate validation questions based on current state
   */
  private generateValidationQuestions(): ValidationQuestion[] {
    const questions: ValidationQuestion[] = [];

    // Domain boundary questions
    for (const [name, domain] of this.domains) {
      if (domain.detailedConfidence.domainClarity < 0.7) {
        questions.push({
          id: `boundary_${name}_${this.iteration}`,
          type: 'boundary',
          question: `Is "${name}" the correct name and boundary for this domain?\n\nFiles: ${domain.files.slice(0, 5).join(', ')}...\nConcepts: ${domain.suggestedConcepts.join(', ')}`,
          context: { domain },
          options: ['Yes', 'No - suggest changes'],
          confidence: domain.detailedConfidence.overall,
        });
      }
    }

    // Relationship questions
    for (const rel of this.relationships) {
      if (rel.confidence < 0.7) {
        questions.push({
          id: `relationship_${rel.sourceDomain}_${rel.targetDomain}_${this.iteration}`,
          type: 'relationship',
          question: `Does "${rel.sourceDomain}" ${rel.type.replace('_', ' ')} "${rel.targetDomain}"?`,
          context: { relationship: rel },
          options: ['Yes', 'No', 'Unsure'],
          confidence: rel.confidence,
        });
      }
    }

    return questions;
  }

  /**
   * Generate research queries for a domain
   *
   * @param domain
   */
  private generateResearchQueries(domain: ConfidentDomain): string[] {
    const queries: string[] = [];

    // Technology-specific queries
    const mainTech = domain.technologies?.[0];
    if (mainTech) {
      queries.push(`${mainTech} ${domain.name} best practices`);
      queries.push(`${mainTech} ${domain.suggestedConcepts[0]} architecture patterns`);
    }

    // Concept-based queries
    for (const concept of domain.suggestedConcepts.slice(0, 3)) {
      queries.push(`${concept} domain driven design`);
    }

    return queries;
  }

  /**
   * Helper methods
   */

  private initializeMetrics(): ConfidenceMetrics {
    return {
      overall: 0.0,
      documentCoverage: 0.0,
      humanValidations: 0.0,
      researchDepth: 0.0,
      domainClarity: 0.0,
      consistency: 0.0,
    };
  }

  private recordLearningEvent(
    type: LearningEvent['type'],
    data: any,
    confidenceImpact: number
  ): void {
    const event: LearningEvent = {
      timestamp: Date.now(),
      type,
      data,
      confidenceBefore: this.confidence,
      confidenceAfter: Math.max(0, Math.min(1, this.confidence + confidenceImpact)),
      source: `iteration_${this.iteration}`,
    };

    this.learningHistory.push(event);
    this.confidence = event.confidenceAfter;
  }

  private async analyzeDocument(path: string): Promise<any> {
    // Simulate document analysis - in real implementation would use document processor
    // xxx NEEDS_HUMAN: Implement actual document analysis using path parameter
    return {
      concepts: ['concept1', 'concept2'],
      domains: ['domain1'],
      confidence: 0.7,
    };
  }

  private batchQuestions(
    questions: ValidationQuestion[],
    batchSize: number
  ): ValidationQuestion[][] {
    const batches: ValidationQuestion[][] = [];
    for (let i = 0; i < questions.length; i += batchSize) {
      batches.push(questions.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processValidationResponse(
    question: ValidationQuestion,
    response: string,
    responseTime?: number
  ): Promise<void> {
    const confidenceBefore = this.confidence;

    // Find the relevant domain(s)
    for (const domain of this.domains.values()) {
      // Check if this question relates to this domain
      const isRelevant = this.isQuestionRelevantToDomain(question, domain);

      if (isRelevant) {
        const validation: ValidationRecord = {
          questionId: question.id,
          question: question.question,
          userResponse: response,
          timestamp: Date.now(),
          impactOnConfidence: 0.0,
          validationType: question.type,
          confidenceBefore,
          confidenceAfter: confidenceBefore, // Will be updated
          ...(responseTime !== undefined && { validationDuration: responseTime }),
        };

        // Calculate confidence impact based on response and question type
        validation.impactOnConfidence = this.calculateConfidenceImpact(question, response, domain);

        // Apply the confidence impact
        this.confidence = Math.max(0, Math.min(1, this.confidence + validation.impactOnConfidence));
        validation.confidenceAfter = this.confidence;

        domain.validations.push(validation);

        this.recordLearningEvent(
          'human_validation',
          {
            questionId: question.id,
            questionType: question.type,
            response,
            domain: domain.name,
            impactOnConfidence: validation.impactOnConfidence,
            responseTime,
          },
          validation.impactOnConfidence
        );
      }
    }
  }

  /**
   * Calculate confidence impact based on question type and response
   *
   * @param question
   * @param response
   * @param domain
   */
  private calculateConfidenceImpact(
    question: ValidationQuestion,
    response: string,
    domain: ConfidentDomain
  ): number {
    const positiveResponses = ['yes', 'correct', 'approve', 'continue'];
    const negativeResponses = ['no', 'incorrect', 'wrong', 'adjust'];
    const isPositive = positiveResponses.some((r) => response.toLowerCase().includes(r));
    const isNegative = negativeResponses.some((r) => response.toLowerCase().includes(r));

    let impact = 0.0;

    switch (question.type) {
      case 'boundary':
        impact = isPositive ? 0.1 : isNegative ? -0.15 : 0.05;
        break;
      case 'relationship':
        impact = isPositive ? 0.05 : isNegative ? -0.05 : 0.02;
        break;
      case 'naming':
        impact = isPositive ? 0.08 : isNegative ? -0.1 : 0.03;
        break;
      case 'priority':
        impact = isPositive ? 0.03 : 0.0;
        break;
      case 'checkpoint':
        // Checkpoints don't directly impact confidence
        impact = 0.0;
        break;
      case 'review':
        // Reviews may have custom impacts
        impact = question.expectedImpact || 0.0;
        break;
      default:
        impact = isPositive ? 0.05 : isNegative ? -0.05 : 0.0;
    }

    // Adjust impact based on domain's current validation count
    const validationCount = domain.validations.length;
    if (validationCount < this.config.minimumValidationsPerDomain!) {
      impact *= 1.5; // More weight to early validations
    }

    return impact;
  }

  private extractInsights(facts: any[]): string[] {
    // Extract key insights from facts
    return facts.map((f) => {
      if (typeof f.content === 'string') {
        return f.content.substring(0, 100) + '...';
      }
      return JSON.stringify(f.content).substring(0, 100) + '...';
    });
  }

  private calculateResearchConfidence(facts: any[]): number {
    // Higher confidence with more sources and newer facts
    const sourceCount = new Set(facts.map((f) => f.metadata.source)).size;
    const avgAge =
      facts.reduce((sum, f) => sum + (Date.now() - f.metadata.timestamp), 0) / facts.length;
    const ageFactor = Math.max(0, 1 - avgAge / (30 * 24 * 60 * 60 * 1000)); // 30 days

    return Math.min(1, (sourceCount / 3) * 0.5 + ageFactor * 0.5);
  }

  private analyzePatterns(): any[] {
    // Analyze patterns across all learning to suggest refinements
    const refinements: any[] = [];

    // Look for repeated validation corrections
    for (const domain of this.domains.values()) {
      const negativeValidations = domain.validations.filter(
        (v) =>
          v.userResponse.toLowerCase().includes('no') ||
          v.userResponse.toLowerCase().includes('incorrect')
      );

      if (negativeValidations.length > 1) {
        refinements.push({
          domainName: domain.name,
          changes: ['Review domain boundary', 'Consider splitting or merging'],
          reason: 'Multiple negative validations',
          confidenceImpact: -0.1,
        });
      }
    }

    return refinements;
  }

  private applyRefinement(domain: ConfidentDomain, refinement: any): void {
    // Apply the refinement to the domain
    logger.info(`Applying refinement to domain ${domain.name}:`, refinement.changes);

    // In a real implementation, this would modify the domain structure
    // For now, just log the refinement
  }

  private updateDomainRelationships(): void {
    // Analyze domains to identify relationships
    const domains = Array.from(this.domains.values());

    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const domain1 = domains[i];
        const domain2 = domains[j];
        if (domain1 && domain2) {
          const relationship = this.detectRelationship(domain1, domain2);
          if (relationship) {
            this.relationships.push(relationship);
          }
        }
      }
    }
  }

  private detectRelationship(
    domain1: ConfidentDomain,
    domain2: ConfidentDomain
  ): DomainRelationship | null {
    // Detect relationships based on shared concepts, imports, etc.
    const sharedConcepts = domain1.suggestedConcepts.filter((c) =>
      domain2.suggestedConcepts.includes(c)
    );

    if (sharedConcepts.length > 0) {
      return {
        sourceDomain: domain1.name,
        targetDomain: domain2.name,
        type: 'communicates_with',
        confidence: Math.min(1, sharedConcepts.length * 0.3),
        evidence: sharedConcepts,
      };
    }

    return null;
  }

  private calculateDocumentCoverage(): number {
    // Calculate how well documents cover the domains
    const totalDocs = this.getDocumentCount();
    const docsWithDomains = this.domains.size * 2; // Rough estimate
    return Math.min(1, docsWithDomains / Math.max(totalDocs, 1));
  }

  private calculateValidationScore(): number {
    // Calculate score based on validation responses
    let totalValidations = 0;
    let positiveValidations = 0;

    for (const domain of this.domains.values()) {
      totalValidations += domain.validations.length;
      positiveValidations += domain.validations.filter(
        (v) =>
          v.userResponse.toLowerCase().includes('yes') ||
          v.userResponse.toLowerCase().includes('correct')
      ).length;
    }

    return totalValidations > 0 ? positiveValidations / totalValidations : 0;
  }

  private calculateResearchDepth(): number {
    // Calculate how much research has been done
    let totalResearch = 0;
    let highQualityResearch = 0;

    for (const domain of this.domains.values()) {
      totalResearch += domain.research.length;
      highQualityResearch += domain.research.filter((r) => r.confidence > 0.7).length;
    }

    return totalResearch > 0 ? highQualityResearch / totalResearch : 0;
  }

  private calculateDomainClarity(): number {
    // Calculate how clear the domain boundaries are
    const domainScores = Array.from(this.domains.values()).map((d) => {
      const hasGoodName = d.validations.some(
        (v) => v.question.includes('correct name') && v.userResponse.toLowerCase().includes('yes')
      );
      const hasResearch = d.research.length > 0;
      const hasRefinements = d.refinementHistory.length > 0;

      return (hasGoodName ? 0.4 : 0) + (hasResearch ? 0.3 : 0) + (hasRefinements ? 0.3 : 0);
    });

    return domainScores.length > 0
      ? domainScores.reduce((a, b) => a + b, 0) / domainScores.length
      : 0;
  }

  private calculateConsistency(): number {
    // Calculate consistency across iterations
    const recentEvents = this.learningHistory.slice(-20);
    const positiveEvents = recentEvents.filter(
      (e) => e.confidenceAfter > e.confidenceBefore
    ).length;
    return recentEvents.length > 0 ? positiveEvents / recentEvents.length : 0.5;
  }

  private updateDomainConfidence(domain: ConfidentDomain): void {
    const newDetailedConfidence = {
      overall: this.confidence * 0.8 + Math.random() * 0.2, // Add some variance
      documentCoverage: this.confidenceMetrics.documentCoverage,
      humanValidations: domain.validations.length > 0 ? this.calculateValidationScore() : 0,
      researchDepth: domain.research.length > 0 ? 0.8 : 0.2,
      domainClarity:
        domain.validations.filter((v) => v.impactOnConfidence > 0).length /
        Math.max(domain.validations.length, 1),
      consistency: this.confidenceMetrics.consistency,
    };

    domain.detailedConfidence = newDetailedConfidence;
    domain.confidence = newDetailedConfidence.overall; // Set overall confidence as simple number
  }

  private getDocumentCount(): number {
    // Count total documents analyzed
    return this.learningHistory.filter((e) => e.type === 'document_import').length;
  }

  private getTotalValidations(): number {
    return Array.from(this.domains.values()).reduce((sum, d) => sum + d.validations.length, 0);
  }

  private getTotalResearch(): number {
    return Array.from(this.domains.values()).reduce((sum, d) => sum + d.research.length, 0);
  }

  private generateSummary(): string {
    const domainList = Array.from(this.domains.entries())
      .map(
        ([name, domain]) =>
          `• ${name} (${(domain.detailedConfidence.overall * 100).toFixed(0)}% confidence)`
      )
      .join('\n');

    return `Discovered Domains:\n${domainList}\n\nRelationships: ${this.relationships.length} identified`;
  }

  private async performManualAdjustments(): Promise<void> {
    // Allow user to manually adjust domains
    await this.agui.showMessage('Manual adjustment interface would open here');
  }

  private recalculateConfidenceFromHistory(): void {
    // Recalculate confidence based on historical events
    let confidence = 0.0;
    for (const event of this.learningHistory) {
      confidence = event.confidenceAfter;
    }
    this.confidence = confidence;
  }

  private buildConfidentDomainMap(): ConfidentDomainMap {
    return {
      domains: this.domains,
      relationships: this.relationships,
      confidence: this.confidenceMetrics,
      learningHistory: this.learningHistory,
      validationCount: this.getTotalValidations(),
      researchCount: this.getTotalResearch(),
    };
  }

  /**
   * Review domains interactively
   */
  private async reviewDomains(): Promise<void> {
    const domainList = Array.from(this.domains.entries()).map(([name, domain]) => ({
      name,
      confidence: domain.confidence,
      validations: domain.validations.length,
      files: domain.files.length,
    }));

    await this.agui.showMessage(
      `📊 Domain Review\n${domainList
        .map(
          (d) =>
            `- ${d.name}: ${(d.confidence * 100).toFixed(0)}% confidence, ${d.validations} validations, ${d.files} files`
        )
        .join('\n')}`,
      'info'
    );
  }

  /**
   * Allow manual confidence adjustment
   */
  private async adjustConfidence(): Promise<void> {
    const adjustQuestion: ValidationQuestion = {
      id: `adjust_confidence_${this.iteration}`,
      type: 'review',
      question: `Current confidence: ${(this.confidence * 100).toFixed(1)}%\n\nHow would you like to adjust it?`,
      context: { currentConfidence: this.confidence },
      options: ['Increase by 10%', 'Decrease by 10%', 'Set to specific value', 'Keep current'],
      confidence: this.confidence,
    };

    const response = await this.agui.askQuestion(adjustQuestion);

    if (response === 'Increase by 10%') {
      this.confidence = Math.min(1, this.confidence + 0.1);
    } else if (response === 'Decrease by 10%') {
      this.confidence = Math.max(0, this.confidence - 0.1);
    } else if (response === 'Set to specific value') {
      const valueQuestion: ValidationQuestion = {
        id: `set_confidence_${this.iteration}`,
        type: 'review',
        question: 'Enter new confidence value (0-100):',
        context: {},
        allowCustom: true,
        confidence: this.confidence,
      };
      const value = await this.agui.askQuestion(valueQuestion);
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        this.confidence = numValue / 100;
      }
    }
  }

  /**
   * Collect validator notes
   *
   * @param checkpoint
   */
  private async collectValidatorNotes(checkpoint: number): Promise<void> {
    const notesQuestion: ValidationQuestion = {
      id: `notes_${checkpoint}_${this.iteration}`,
      type: 'review',
      question: 'Please enter any notes or observations:',
      context: { checkpoint },
      allowCustom: true,
      confidence: this.confidence,
    };

    const notes = await this.agui.askQuestion(notesQuestion);

    if (notes && notes.trim()) {
      // Store notes in audit trail
      const auditEntry: ValidationAuditEntry = {
        id: `audit_${Date.now()}`,
        timestamp: Date.now(),
        sessionId: this.currentSessionId,
        validationType: 'checkpoint',
        confidenceLevel: this.confidence,
        domainCount: this.domains.size,
        questionsAsked: this.totalQuestionsAsked,
        questionsAnswered: this.totalQuestionsAnswered,
        significantChanges: [],
        ...(this.validatorId !== undefined && { validatorId: this.validatorId }),
        notes,
      };

      this.validationAuditTrail.push(auditEntry);
    }
  }

  /**
   * Check if question is relevant to a domain
   *
   * @param question
   * @param domain
   */
  private isQuestionRelevantToDomain(
    question: ValidationQuestion,
    domain: ConfidentDomain
  ): boolean {
    // Check if question context mentions this domain
    if (question.context?.domain === domain.name) {
      return true;
    }

    // Check if question is about a relationship involving this domain
    if (question.context?.relationship) {
      const rel = question.context.relationship;
      return rel.sourceDomain === domain.name || rel.targetDomain === domain.name;
    }

    // Default: boundary questions apply to the domain mentioned in the question text
    if (question.type === 'boundary' && question.question.includes(domain.name)) {
      return true;
    }

    return false;
  }

  /**
   * Prioritize questions based on confidence and importance
   *
   * @param questions
   */
  private prioritizeQuestions(questions: ValidationQuestion[]): ValidationQuestion[] {
    return questions.sort((a, b) => {
      // First by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then by confidence (lower confidence = higher priority)
      return a.confidence - b.confidence;
    });
  }

  /**
   * Check if minimum validations are met for each domain
   */
  private async checkMinimumValidations(): Promise<void> {
    const underValidatedDomains = Array.from(this.domains.values()).filter(
      (domain) => domain.validations.length < this.config.minimumValidationsPerDomain!
    );

    if (underValidatedDomains.length > 0) {
      logger.info(`${underValidatedDomains.length} domains need more validations`);

      // Generate additional questions for under-validated domains
      for (const domain of underValidatedDomains) {
        const additionalQuestion: ValidationQuestion = {
          id: `additional_validation_${domain.name}_${this.iteration}`,
          type: 'review',
          question: `Domain "${domain.name}" needs additional validation. Is this domain correctly identified and scoped?`,
          context: { domain: domain.name, currentValidations: domain.validations.length },
          options: [
            "Yes, it's correct",
            'No, needs adjustment',
            'Merge with another domain',
            'Split into multiple domains',
          ],
          confidence: domain.confidence,
          priority: 'high',
          validationReason: 'Minimum validation requirement',
        };

        const response = await this.agui.askQuestion(additionalQuestion);
        await this.processValidationResponse(additionalQuestion, response);
      }
    }
  }

  /**
   * Update audit trail
   */
  private async updateAuditTrail(): Promise<void> {
    const significantChanges: string[] = [];

    // Check for significant confidence changes
    const lastAudit = this.validationAuditTrail[this.validationAuditTrail.length - 1];
    if (lastAudit && Math.abs(this.confidence - lastAudit.confidenceLevel) > 0.1) {
      significantChanges.push(
        `Confidence changed from ${(lastAudit.confidenceLevel * 100).toFixed(0)}% to ${(this.confidence * 100).toFixed(0)}%`
      );
    }

    // Check for new domains
    if (lastAudit && this.domains.size > lastAudit.domainCount) {
      significantChanges.push(`Added ${this.domains.size - lastAudit.domainCount} new domain(s)`);
    }

    const auditEntry: ValidationAuditEntry = {
      id: `audit_${Date.now()}_${this.iteration}`,
      timestamp: Date.now(),
      sessionId: this.currentSessionId,
      validationType: 'review',
      confidenceLevel: this.confidence,
      domainCount: this.domains.size,
      questionsAsked: this.totalQuestionsAsked,
      questionsAnswered: this.totalQuestionsAnswered,
      significantChanges,
      validatorId: this.validatorId || '',
    };

    this.validationAuditTrail.push(auditEntry);

    // Persist audit trail
    try {
      await this.memoryStore.store(
        `${this.config.memoryNamespace}/audit-trail`,
        'validation-audit',
        {
          sessionId: this.currentSessionId,
          auditTrail: this.validationAuditTrail,
        }
      );
    } catch (error) {
      logger.error('Failed to persist audit trail:', error);
    }
  }
}

export default ProgressiveConfidenceBuilder;
