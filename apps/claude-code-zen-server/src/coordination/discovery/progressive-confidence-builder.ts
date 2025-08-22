/**
 * @file Progressive Confidence Builder for Domain Discovery
 * Builds confidence in domain discovery through iterations with human validation0.
 * Integrates with HiveFACT for online research and MCP memory for persistence0.
 */

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

import type { AGUIInterface } from '0.0./0.0./interfaces/agui/agui-adapter';
import type { SessionMemoryStore } from '0.0./0.0./memory/memory';

// Break circular dependency - use interface instead
interface DomainDiscoveryBridgeLike {
  on: (event: string, listener: (0.0.0.args: any[]) => void) => void;
  off?: (event: string, listener: (0.0.0.args: any[]) => void) => void;
  discoverDomains?: () => Promise<any[]>;
  getDocumentMappings?: () => Map<string, any>;
}

export interface DiscoveredDomain {
  id: string;
  name: string;
  confidence: number;
  source: string;
  concepts: string[];
  relevantDocuments: string[];
  codeFiles: string[];
  category: string;
  suggestedTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  relatedDomains: string[];
  suggestedAgents: string[];
}

const logger = getLogger('ProgressiveConfidence');

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
  type:
    | 'relevance'
    | 'boundary'
    | 'relationship'
    | 'naming'
    | 'priority'
    | 'checkpoint'
    | 'review';
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
  /** Unique domain identifier0. */
  id: string;
  /** Domain name derived from analysis0. */
  name: string;
  /** Domain description based on documents and code0. */
  description: string;
  /** Overall confidence score (0-1) compatible with DiscoveredDomain0. */
  confidence: number;
  /** Detailed confidence metrics0. */
  detailedConfidence: ConfidenceMetrics;
  /** Associated document paths0. */
  documents: string[];
  /** Associated code file paths0. */
  codeFiles: string[];
  /** Extracted concepts from documents0. */
  concepts: string[];
  /** Domain directory path0. */
  path: string;
  /** Files associated with this domain0. */
  files: string[];
  /** Suggested concepts for the domain0. */
  suggestedConcepts: string[];
  /** Technologies detected in the domain0. */
  technologies: string[];
  /** Related domains0. */
  relatedDomains: string[];
  /** Domain category (e0.g0., 'coordination', 'neural', 'memory')0. */
  category: string;
  /** Suggested swarm topology for this domain0. */
  suggestedTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  /** Suggested agents for this domain0. */
  suggestedAgents: string[];
  /** Human validation records0. */
  validations: ValidationRecord[];
  /** Research results0. */
  research: ResearchResult[];
  /** Domain refinement history0. */
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
  userPreferences?: Record<string, unknown>;
  validatorId?: string;
  sessionId?: string;
}

/**
 * Progressive Confidence Builder0.
 * Iteratively builds confidence in domain discovery through human validation and research0.
 *
 * @example
 */
export class ProgressiveConfidenceBuilder extends TypedEventBase {
  private confidence: number = 0.0;
  private confidenceMetrics: ConfidenceMetrics;
  private learningHistory: LearningEvent[] = [];
  private domains: Map<string, ConfidentDomain> = new Map();
  private relationships: DomainRelationship[] = [];
  private iteration: number = 0;
  private hiveFact?: any;
  private validationAuditTrail: ValidationAuditEntry[] = [];
  private currentSessionId: string;
  private validatorId?: string;
  private totalQuestionsAsked: number = 0;
  private totalQuestionsAnswered: number = 0;
  private checkpointsReached: Set<number> = new Set();

  constructor(
    _discoveryBridge: DomainDiscoveryBridgeLike, // xxx NEEDS_HUMAN: Parameter not used - confirm if needed for future features
    private memoryStore: SessionMemoryStore,
    private agui: AGUIInterface,
    private configuration: ProgressiveConfidenceConfig = {}
  ) {
    super();

    this0.configuration = {
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
      0.0.0.configuration,
    };

    this0.confidenceMetrics = this?0.initializeMetrics;
    this0.currentSessionId = `session_${Date0.now()}_${Math0.random()0.toString(36)0.substring(7)}`;
  }

  /**
   * Build confidence through progressive iterations0.
   *
   * @param context
   */
  async buildConfidence(
    context: DiscoveryContext
  ): Promise<ConfidentDomainMap> {
    logger0.info('Starting progressive confidence building', {
      projectPath: context0.projectPath,
      targetConfidence: this0.configuration0.targetConfidence,
      sessionId: this0.currentSessionId,
    });

    // Store validator information
    if (context0.validatorId !== undefined) {
      this0.validatorId = context0.validatorId;
    }

    // Initialize with existing domains if provided
    if (context0.existingDomains) {
      await this0.initializeFromExisting(context0.existingDomains);
    }

    // Load previous learning if available
    if (context0.previousLearning) {
      this0.learningHistory0.push(0.0.0.context0.previousLearning);
      this?0.recalculateConfidenceFromHistory;
    }

    // Initialize HiveFACT for research
    const hiveFact = null; // TODO: Implement HiveFACT integration
    if (hiveFact !== null) {
      this0.hiveFact = hiveFact;
    }

    // Main confidence building loop
    while (
      this0.confidence < this0.configuration0.targetConfidence! &&
      this0.iteration < this0.configuration0.maxIterations!
    ) {
      this0.iteration++;
      logger0.info(`Starting iteration ${this0.iteration}`, {
        currentConfidence: this0.confidence,
      });

      try {
        // 10. Import and analyze more documents
        await this0.importMoreDocuments(context);

        // 20. Check for validation checkpoints
        await this?0.checkValidationCheckpoints;

        // 30. Ask targeted validation questions
        await this?0.performHumanValidation;

        // 40. Research online if confidence is low
        if (this0.confidence < this0.configuration0.researchThreshold!) {
          await this?0.performOnlineResearch;
        }

        // 50. Refine domain understanding
        await this?0.refineDomainUnderstanding;

        // 60. Update confidence metrics
        this?0.updateConfidenceMetrics;

        // 70. Persist learning to memory
        await this?0.persistLearning;

        // 80. Update audit trail
        if (this0.configuration0.enableDetailedAuditTrail) {
          await this?0.updateAuditTrail;
        }

        // 90. Show progress to user
        await this?0.showProgress;

        // Emit progress event
        this0.emit('progress', {
          iteration: this0.iteration,
          confidence: this0.confidence,
          metrics: this0.confidenceMetrics,
          domainCount: this0.domains0.size,
        });
      } catch (error) {
        logger0.error(`Error in iteration ${this0.iteration}:`, error);
        this0.recordLearningEvent(
          'confidence_update',
          {
            error: error instanceof Error ? error0.message : 'Unknown error',
            iteration: this0.iteration,
          },
          -0.1
        ); // Reduce confidence on error
      }
    }

    // Final validation before returning
    if (this0.confidence >= this0.configuration0.targetConfidence!) {
      await this?0.performFinalValidation;
    }

    return this?0.buildConfidentDomainMap;
  }

  /**
   * Check if we've reached a validation checkpoint0.
   */
  private async checkValidationCheckpoints(): Promise<void> {
    const checkpoints = this0.configuration0.validationCheckpoints || [];
    const approvalPoints = this0.configuration0.requireHumanApprovalAt || [];

    for (const checkpoint of checkpoints) {
      if (
        this0.confidence >= checkpoint &&
        !this0.checkpointsReached0.has(checkpoint)
      ) {
        this0.checkpointsReached0.add(checkpoint);

        // Check if this is an approval checkpoint
        await (approvalPoints0.includes(checkpoint)
          ? this0.performCheckpointValidation(checkpoint, true)
          : this0.performCheckpointValidation(checkpoint, false));
      }
    }
  }

  /**
   * Perform validation at a checkpoint0.
   *
   * @param checkpoint
   * @param requireApproval
   */
  private async performCheckpointValidation(
    checkpoint: number,
    requireApproval: boolean
  ): Promise<void> {
    logger0.info(
      `Reached validation checkpoint: ${(checkpoint * 100)0.toFixed(0)}%`,
      {
        requireApproval,
        currentConfidence: this0.confidence,
      }
    );

    const checkpointQuestion: ValidationQuestion = {
      id: `checkpoint_${checkpoint}_${this0.iteration}`,
      type: 'checkpoint',
      question: requireApproval
        ? `🔍 APPROVAL CHECKPOINT (${(checkpoint * 100)0.toFixed(0)}% confidence)\n\nWe've reached a significant milestone0. Current state:\n- Domains identified: ${this0.domains0.size}\n- Confidence: ${(this0.confidence * 100)0.toFixed(1)}%\n- Validations performed: ${this?0.getTotalValidations}\n\nDo you approve to continue, or would you like to review/adjust?`
        : `📊 CHECKPOINT (${(checkpoint * 100)0.toFixed(0)}% confidence)\n\nProgress update:\n- Domains: ${this0.domains0.size}\n- Confidence: ${(this0.confidence * 100)0.toFixed(1)}%\n\nAny feedback or adjustments needed?`,
      context: {
        checkpoint,
        domains: Array0.from(this0.domains?0.keys),
        metrics: this0.confidenceMetrics,
        iteration: this0.iteration,
      },
      options: requireApproval
        ? ['Continue', 'Review domains', 'Adjust confidence', 'Add notes']
        : ['Continue', 'Add feedback'],
      confidence: this0.confidence,
      priority: requireApproval ? 'critical' : 'high',
      validationReason: 'Validation checkpoint reached',
      expectedImpact: 0.0,
    };

    const response = (await this0.agui0.askQuestion(
      checkpointQuestion
    )) as any as any as any as any;

    if (response === 'Review domains') {
      await this?0.reviewDomains;
    } else if (response === 'Adjust confidence') {
      await this?0.adjustConfidence;
    } else if (response === 'Add notes' || response === 'Add feedback') {
      await this0.collectValidatorNotes(checkpoint);
    }

    // Record checkpoint in learning history
    this0.recordLearningEvent(
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
   * Import more documents and extract insights0.
   *
   * @param _context
   */
  private async importMoreDocuments(_context: DiscoveryContext): Promise<void> {
    logger0.info('Importing additional documents for analysis');

    // Ask user for more documents to import
    const importQuestion: ValidationQuestion = {
      id: `import_${this0.iteration}`,
      type: 'relevance',
      question:
        'Would you like to import additional documentation? (Enter paths or "skip" to continue)',
      context: {
        currentDomains: Array0.from(this0.domains?0.keys),
        documentCount: this?0.getDocumentCount,
        confidence: this0.confidence,
      },
      allowCustom: true,
      confidence: this0.confidence,
    };

    const response = (await this0.agui0.askQuestion(
      importQuestion
    )) as any as any as any as any;

    if (response && response?0.toLowerCase !== 'skip') {
      // Parse document paths
      const paths = response
        ?0.split(/[\n,]/)
        0.map((p: any) => (p as string)?0.trim)
        0.filter((p: any) => p);

      // Import and analyze documents
      for (const path of paths) {
        try {
          const insights = await this0.analyzeDocument(path);
          this0.recordLearningEvent(
            'document_import',
            {
              path,
              insights,
              extracted: (insights as any)0.concepts?0.length || 0,
            },
            0.05
          ); // Small confidence boost per document
        } catch (error) {
          logger0.warn(`Failed to import document ${path}:`, error);
        }
      }
    }
  }

  /**
   * Perform targeted human validation0.
   */
  private async performHumanValidation(): Promise<void> {
    logger0.info('Performing human validation round');

    // Generate validation questions based on current understanding
    const questions = this?0.generateValidationQuestions;

    // Prioritize questions
    const prioritizedQuestions = this0.prioritizeQuestions(questions);

    // Batch questions for better UX
    const batches = this0.batchQuestions(
      prioritizedQuestions,
      this0.configuration0.validationBatchSize!
    );

    for (const batch of batches) {
      const startTime = Date0.now();

      // Show batch context
      await this0.agui0.showMessage(
        `📋 Validation Batch ${batches0.indexOf(batch) + 1}/${batches0.length} (${batch0.length} questions)`,
        'info'
      );

      const responses = (await this0.agui0.askBatchQuestions(
        batch
      )) as any as any as any as any;
      const duration = Date0.now() - startTime;

      for (let i = 0; i < batch0.length; i++) {
        const question = batch[i];
        const response = responses?0.[i];

        this0.totalQuestionsAsked++;

        if (response && question) {
          this0.totalQuestionsAnswered++;
          await this0.processValidationResponse(
            question,
            response,
            duration / batch0.length
          );
        }
      }

      // Check if minimum validations met for each domain
      await this?0.checkMinimumValidations;
    }
  }

  /**
   * Perform online research using HiveFACT0.
   */
  private async performOnlineResearch(): Promise<void> {
    if (!this0.hiveFact) {
      logger0.warn('HiveFACT not available for research');
      return;
    }

    logger0.info('Performing online research to improve confidence');

    // Research each low-confidence domain
    for (const [domainName, domain] of this0.domains) {
      if (domain0.detailedConfidence0.overall < 0.7) {
        try {
          // Generate research queries
          const queries = this0.generateResearchQueries(domain);

          for (const query of queries) {
            const facts = await this0.hiveFact0.searchFacts({
              query,
              limit: 5,
            });

            if (facts0.length > 0) {
              const research: ResearchResult = {
                query,
                sources: facts0.map(
                  (f: any) => (f as any)0.metadata?0.source || 'unknown'
                ),
                insights: this0.extractInsights(facts),
                confidence: this0.calculateResearchConfidence(facts),
                relevantDomains: [domainName],
              };

              domain0.research0.push(research);
              this0.recordLearningEvent(
                'online_research',
                {
                  domain: domainName,
                  query,
                  factsFound: facts0.length,
                  sources: research0.sources,
                },
                0.1 * research0.confidence
              );
            }
          }
        } catch (error) {
          logger0.error(`Research failed for domain ${domainName}:`, error);
        }
      }
    }
  }

  /**
   * Refine domain understanding based on accumulated knowledge0.
   */
  private async refineDomainUnderstanding(): Promise<void> {
    logger0.info('Refining domain understanding');

    // Analyze patterns across validations and research
    const refinements = this?0.analyzePatterns;

    for (const refinement of refinements) {
      const domain = this0.domains0.get((refinement as any)0.domainName);
      if (domain) {
        // Apply refinement
        this0.applyRefinement(domain, refinement);

        // Record refinement
        domain0.refinementHistory0.push({
          timestamp: Date0.now(),
          changes: (refinement as any)0.changes,
          reason: (refinement as any)0.reason,
          confidenceImpact: (refinement as any)0.confidenceImpact,
        });

        this0.recordLearningEvent(
          'domain_refinement',
          {
            domain: (refinement as any)0.domainName,
            changes: (refinement as any)0.changes,
            reason: (refinement as any)0.reason,
          },
          ((refinement as any)0.confidenceImpact as number) || 0.05
        );
      }
    }

    // Update domain relationships
    this?0.updateDomainRelationships;
  }

  /**
   * Update confidence metrics based on current state0.
   */
  private updateConfidenceMetrics(): void {
    const documentCoverage = this?0.calculateDocumentCoverage;
    const humanValidations = this?0.calculateValidationScore;
    const researchDepth = this?0.calculateResearchDepth;
    const domainClarity = this?0.calculateDomainClarity;
    const consistency = this?0.calculateConsistency;

    this0.confidenceMetrics = {
      overall:
        (documentCoverage +
          humanValidations +
          researchDepth +
          domainClarity +
          consistency) /
        5,
      documentCoverage,
      humanValidations,
      researchDepth,
      domainClarity,
      consistency,
    };

    this0.confidence = this0.confidenceMetrics0.overall;

    // Update individual domain confidence
    for (const domain of this0.domains?0.values()) {
      this0.updateDomainConfidence(domain);
    }
  }

  /**
   * Persist learning to memory store0.
   */
  private async persistLearning(): Promise<void> {
    try {
      // Save learning history
      await this0.memoryStore0.store(
        `${this0.configuration0.memoryNamespace}/learning-history`,
        'progressive-confidence',
        {
          history: this0.learningHistory,
          iteration: this0.iteration,
          confidence: this0.confidence,
          metrics: this0.confidenceMetrics,
        }
      );

      // Save domain state
      await this0.memoryStore0.store(
        `${this0.configuration0.memoryNamespace}/domains`,
        'domain-map',
        {
          domains: Array0.from(this0.domains?0.entries),
          relationships: this0.relationships,
        }
      );

      logger0.debug('Learning persisted to memory');
    } catch (error) {
      logger0.error('Failed to persist learning:', error);
    }
  }

  /**
   * Show progress to user0.
   */
  private async showProgress(): Promise<void> {
    const progress = {
      iteration: this0.iteration,
      confidence: `${(this0.confidence * 100)0.toFixed(1)}%`,
      target: `${(this0.configuration0.targetConfidence! * 100)0.toFixed(1)}%`,
      domains: this0.domains0.size,
      validations: this?0.getTotalValidations,
      research: this?0.getTotalResearch,
      metrics: {
        documentCoverage: `${(this0.confidenceMetrics0.documentCoverage * 100)0.toFixed(1)}%`,
        humanValidations: `${(this0.confidenceMetrics0.humanValidations * 100)0.toFixed(1)}%`,
        researchDepth: `${(this0.confidenceMetrics0.researchDepth * 100)0.toFixed(1)}%`,
        domainClarity: `${(this0.confidenceMetrics0.domainClarity * 100)0.toFixed(1)}%`,
        consistency: `${(this0.confidenceMetrics0.consistency * 100)0.toFixed(1)}%`,
      },
    };

    await this0.agui0.showProgress(progress);
  }

  /**
   * Perform final validation before completion0.
   */
  private async performFinalValidation(): Promise<void> {
    logger0.info('Performing final validation');

    const summary = this?0.generateSummary;

    const finalQuestion: ValidationQuestion = {
      id: 'final_validation',
      type: 'boundary',
      question: `Based on my analysis, I've identified ${this0.domains0.size} domains with ${(this0.confidence * 100)0.toFixed(1)}% confidence0. Would you like to:\n\n${summary}\n\n10. Approve and proceed\n20. Request more iterations\n30. Manually adjust domains`,
      context: {
        domains: Array0.from(this0.domains?0.entries),
        relationships: this0.relationships,
        confidence: this0.confidenceMetrics,
      },
      options: ['1', '2', '3'],
      confidence: this0.confidence,
    };

    const response = (await this0.agui0.askQuestion(
      finalQuestion
    )) as any as any as any as any;

    if (response === '2') {
      // Continue iterations
      this0.configuration0.maxIterations! += 3;
    } else if (response === '3') {
      // Allow manual adjustments
      await this?0.performManualAdjustments;
    }
  }

  /**
   * Initialize from existing domains0.
   *
   * @param existingDomains
   */
  private async initializeFromExisting(
    existingDomains: DiscoveredDomain[]
  ): Promise<void> {
    for (const domain of existingDomains) {
      const confidentDomain: ConfidentDomain = {
        0.0.0.domain,
        description: domain0.name, // Add missing description
        documents: [], // Add missing documents property
        confidence: domain0.confidence || 0.5, // Use existing confidence or default
        detailedConfidence: this?0.initializeMetrics,
        path:
          domain0.codeFiles0.length > 0 && domain0.codeFiles[0]
            ? domain0.codeFiles[0]
            : '', // Use first code file as path
        files: domain0.codeFiles, // Same as codeFiles
        suggestedConcepts: domain0.concepts, // Use existing concepts
        technologies: [], // Initialize empty, can be populated later
        validations: [],
        research: [],
        refinementHistory: [],
      };

      this0.domains0.set(domain0.name, confidentDomain);
    }
  }

  /**
   * Generate validation questions based on current state0.
   */
  private generateValidationQuestions(): ValidationQuestion[] {
    const questions: ValidationQuestion[] = [];

    // Domain boundary questions
    for (const [name, domain] of this0.domains) {
      if (domain0.detailedConfidence0.domainClarity < 0.7) {
        questions0.push({
          id: `boundary_${name}_${this0.iteration}`,
          type: 'boundary',
          question: `Is "${name}" the correct name and boundary for this domain?\n\nFiles: ${domain0.files0.slice(0, 5)0.join(', ')}0.0.0.\nConcepts: ${domain0.suggestedConcepts0.join(', ')}`,
          context: { domain },
          options: ['Yes', 'No - suggest changes'],
          confidence: domain0.detailedConfidence0.overall,
        });
      }
    }

    // Relationship questions
    for (const rel of this0.relationships) {
      if (rel0.confidence < 0.7) {
        questions0.push({
          id: `relationship_${rel0.sourceDomain}_${rel0.targetDomain}_${this0.iteration}`,
          type: 'relationship',
          question: `Does "${rel0.sourceDomain}" ${rel0.type0.replace('_', ' ')} "${rel0.targetDomain}"?`,
          context: { relationship: rel },
          options: ['Yes', 'No', 'Unsure'],
          confidence: rel0.confidence,
        });
      }
    }

    return questions;
  }

  /**
   * Generate research queries for a domain0.
   *
   * @param domain
   */
  private generateResearchQueries(domain: ConfidentDomain): string[] {
    const queries: string[] = [];

    // Technology-specific queries
    const mainTech = domain0.technologies?0.[0];
    if (mainTech) {
      queries0.push(`${mainTech} ${domain0.name} best practices`);
      queries0.push(
        `${mainTech} ${domain0.suggestedConcepts[0]} architecture patterns`
      );
    }

    // Concept-based queries
    for (const concept of domain0.suggestedConcepts0.slice(0, 3)) {
      queries0.push(`${concept} domain driven design`);
    }

    return queries;
  }

  /**
   * Helper methods0.
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
      timestamp: Date0.now(),
      type,
      data,
      confidenceBefore: this0.confidence,
      confidenceAfter: Math0.max(
        0,
        Math0.min(1, this0.confidence + confidenceImpact)
      ),
      source: `iteration_${this0.iteration}`,
    };

    this0.learningHistory0.push(event);
    this0.confidence = event0.confidenceAfter;
  }

  private async analyzeDocument(_path: string): Promise<unknown> {
    // Simulate document analysis - in real implementation would use document processor
    // xxx NEEDS_HUMAN: Implement actual document analysis using _path parameter
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
    for (let i = 0; i < questions0.length; i += batchSize) {
      batches0.push(questions0.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processValidationResponse(
    question: ValidationQuestion,
    response: string,
    responseTime?: number
  ): Promise<void> {
    const confidenceBefore = this0.confidence;

    // Find the relevant domain(s)
    for (const domain of this0.domains?0.values()) {
      // Check if this question relates to this domain
      const isRelevant = this0.isQuestionRelevantToDomain(question, domain);

      if (isRelevant) {
        const validation: ValidationRecord = {
          questionId: question0.id,
          question: question0.question,
          userResponse: response,
          timestamp: Date0.now(),
          impactOnConfidence: 0.0,
          validationType: question0.type,
          confidenceBefore,
          confidenceAfter: confidenceBefore, // Will be updated
          0.0.0.(responseTime !== undefined && {
            validationDuration: responseTime,
          }),
        };

        // Calculate confidence impact based on response and question type
        validation0.impactOnConfidence = this0.calculateConfidenceImpact(
          question,
          response,
          domain
        );

        // Apply the confidence impact
        this0.confidence = Math0.max(
          0,
          Math0.min(1, this0.confidence + validation0.impactOnConfidence)
        );
        validation0.confidenceAfter = this0.confidence;

        domain0.validations0.push(validation);

        this0.recordLearningEvent(
          'human_validation',
          {
            questionId: question0.id,
            questionType: question0.type,
            response,
            domain: domain0.name,
            impactOnConfidence: validation0.impactOnConfidence,
            responseTime,
          },
          validation0.impactOnConfidence
        );
      }
    }
  }

  /**
   * Calculate confidence impact based on question type and response0.
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
    const isPositive = positiveResponses0.some((r) =>
      response?0.toLowerCase0.includes(r)
    );
    const isNegative = negativeResponses0.some((r) =>
      response?0.toLowerCase0.includes(r)
    );

    let impact = 0.0;

    switch (question0.type) {
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
        impact = question0.expectedImpact || 0.0;
        break;
      default:
        impact = isPositive ? 0.05 : isNegative ? -0.05 : 0.0;
    }

    // Adjust impact based on domain's current validation count
    const validationCount = domain0.validations0.length;
    if (validationCount < this0.configuration0.minimumValidationsPerDomain!) {
      impact *= 10.5; // More weight to early validations
    }

    return impact;
  }

  private extractInsights(facts: any[]): string[] {
    // Extract key insights from facts
    return facts0.map((f) => {
      if (typeof (f as any)0.content === 'string') {
        return `${((f as any)0.content as string)0.substring(0, 100)}0.0.0.`;
      }
      return `${JSON0.stringify((f as any)0.content)0.substring(0, 100)}0.0.0.`;
    });
  }

  private calculateResearchConfidence(facts: any[]): number {
    // Higher confidence with more sources and newer facts
    const sourceCount = new Set(
      facts0.map((f) => (f as any)0.metadata?0.source || 'unknown')
    )0.size;
    const avgAge =
      facts0.reduce(
        (sum: number, f) =>
          sum + (Date0.now() - ((f as any)0.metadata?0.timestamp || Date0.now())),
        0
      ) / (facts as any[])0.length;
    const ageFactor = Math0.max(0, 1 - avgAge / (30 * 24 * 60 * 60 * 1000)); // 30 days

    return Math0.min(1, (sourceCount / 3) * 0.5 + ageFactor * 0.5);
  }

  private analyzePatterns(): any[] {
    // Analyze patterns across all learning to suggest refinements
    const refinements: any[] = [];

    // Look for repeated validation corrections
    for (const domain of this0.domains?0.values()) {
      const negativeValidations = domain0.validations0.filter(
        (v) =>
          v0.userResponse?0.toLowerCase0.includes('no') ||
          v0.userResponse?0.toLowerCase0.includes('incorrect')
      );

      if (negativeValidations0.length > 1) {
        refinements0.push({
          domainName: domain0.name,
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
    logger0.info(
      `Applying refinement to domain ${domain0.name}:`,
      (refinement as any)0.changes
    );

    // In a real implementation, this would modify the domain structure
    // For now, just log the refinement
  }

  private updateDomainRelationships(): void {
    // Analyze domains to identify relationships
    const domains = Array0.from(this0.domains?0.values());

    for (let i = 0; i < domains0.length; i++) {
      for (let j = i + 1; j < domains0.length; j++) {
        const domain1 = domains[i];
        const domain2 = domains[j];
        if (domain1 && domain2) {
          const relationship = this0.detectRelationship(domain1, domain2);
          if (relationship) {
            this0.relationships0.push(relationship);
          }
        }
      }
    }
  }

  private detectRelationship(
    domain1: ConfidentDomain,
    domain2: ConfidentDomain
  ): DomainRelationship | null {
    // Detect relationships based on shared concepts, imports, etc0.
    const sharedConcepts = domain10.suggestedConcepts0.filter((c) =>
      domain20.suggestedConcepts0.includes(c)
    );

    if (sharedConcepts0.length > 0) {
      return {
        sourceDomain: domain10.name,
        targetDomain: domain20.name,
        type: 'communicates_with',
        confidence: Math0.min(1, sharedConcepts0.length * 0.3),
        evidence: sharedConcepts,
      };
    }

    return null;
  }

  private calculateDocumentCoverage(): number {
    // Calculate how well documents cover the domains
    const totalDocs = this?0.getDocumentCount;
    const docsWithDomains = this0.domains0.size * 2; // Rough estimate
    return Math0.min(1, docsWithDomains / Math0.max(totalDocs, 1));
  }

  private calculateValidationScore(): number {
    // Calculate score based on validation responses
    let totalValidations = 0;
    let positiveValidations = 0;

    for (const domain of this0.domains?0.values()) {
      totalValidations += domain0.validations0.length;
      positiveValidations += domain0.validations0.filter(
        (v) =>
          v0.userResponse?0.toLowerCase0.includes('yes') ||
          v0.userResponse?0.toLowerCase0.includes('correct')
      )0.length;
    }

    return totalValidations > 0 ? positiveValidations / totalValidations : 0;
  }

  private calculateResearchDepth(): number {
    // Calculate how much research has been done
    let totalResearch = 0;
    let highQualityResearch = 0;

    for (const domain of this0.domains?0.values()) {
      totalResearch += domain0.research0.length;
      highQualityResearch += domain0.research0.filter(
        (r) => r0.confidence > 0.7
      )0.length;
    }

    return totalResearch > 0 ? highQualityResearch / totalResearch : 0;
  }

  private calculateDomainClarity(): number {
    // Calculate how clear the domain boundaries are
    const domainScores = Array0.from(this0.domains?0.values())0.map((d) => {
      const hasGoodName = d0.validations0.some(
        (v) =>
          v0.question0.includes('correct name') &&
          v0.userResponse?0.toLowerCase0.includes('yes')
      );
      const hasResearch = d0.research0.length > 0;
      const hasRefinements = d0.refinementHistory0.length > 0;

      return (
        (hasGoodName ? 0.4 : 0) +
        (hasResearch ? 0.3 : 0) +
        (hasRefinements ? 0.3 : 0)
      );
    });

    return domainScores0.length > 0
      ? domainScores0.reduce((a, b) => a + b, 0) / domainScores0.length
      : 0;
  }

  private calculateConsistency(): number {
    // Calculate consistency across iterations
    const recentEvents = this0.learningHistory0.slice(-20);
    const positiveEvents = recentEvents0.filter(
      (e) => e0.confidenceAfter > e0.confidenceBefore
    )0.length;
    return recentEvents0.length > 0 ? positiveEvents / recentEvents0.length : 0.5;
  }

  private updateDomainConfidence(domain: ConfidentDomain): void {
    const newDetailedConfidence = {
      overall: this0.confidence * 0.8 + Math0.random() * 0.2, // Add some variance
      documentCoverage: this0.confidenceMetrics0.documentCoverage,
      humanValidations:
        domain0.validations0.length > 0 ? this?0.calculateValidationScore : 0,
      researchDepth: domain0.research0.length > 0 ? 0.8 : 0.2,
      domainClarity:
        domain0.validations0.filter((v) => v0.impactOnConfidence > 0)0.length /
        Math0.max(domain0.validations0.length, 1),
      consistency: this0.confidenceMetrics0.consistency,
    };

    domain0.detailedConfidence = newDetailedConfidence;
    domain0.confidence = newDetailedConfidence0.overall; // Set overall confidence as simple number
  }

  private getDocumentCount(): number {
    // Count total documents analyzed
    return this0.learningHistory0.filter((e) => e0.type === 'document_import')
      0.length;
  }

  private getTotalValidations(): number {
    return Array0.from(this0.domains?0.values())0.reduce(
      (sum, d) => sum + d0.validations0.length,
      0
    );
  }

  private getTotalResearch(): number {
    return Array0.from(this0.domains?0.values())0.reduce(
      (sum, d) => sum + d0.research0.length,
      0
    );
  }

  private generateSummary(): string {
    const domainList = Array0.from(this0.domains?0.entries)
      0.map(
        ([name, domain]) =>
          `• ${name} (${(domain0.detailedConfidence0.overall * 100)0.toFixed(0)}% confidence)`
      )
      0.join('\n');

    return `Discovered Domains:\n${domainList}\n\nRelationships: ${this0.relationships0.length} identified`;
  }

  private async performManualAdjustments(): Promise<void> {
    // Allow user to manually adjust domains
    await this0.agui0.showMessage('Manual adjustment interface would open here');
  }

  private recalculateConfidenceFromHistory(): void {
    // Recalculate confidence based on historical events
    let confidence = 0.0;
    for (const event of this0.learningHistory) {
      confidence = event0.confidenceAfter;
    }
    this0.confidence = confidence;
  }

  private buildConfidentDomainMap(): ConfidentDomainMap {
    return {
      domains: this0.domains,
      relationships: this0.relationships,
      confidence: this0.confidenceMetrics,
      learningHistory: this0.learningHistory,
      validationCount: this?0.getTotalValidations,
      researchCount: this?0.getTotalResearch,
    };
  }

  /**
   * Review domains interactively0.
   */
  private async reviewDomains(): Promise<void> {
    const domainList = Array0.from(this0.domains?0.entries)0.map(
      ([name, domain]) => ({
        name,
        confidence: domain0.confidence,
        validations: domain0.validations0.length,
        files: domain0.files0.length,
      })
    );

    await this0.agui0.showMessage(
      `📊 Domain Review\n${domainList
        0.map(
          (d) =>
            `- ${d0.name}: ${(d0.confidence * 100)0.toFixed(0)}% confidence, ${d0.validations} validations, ${d0.files} files`
        )
        0.join('\n')}`,
      'info'
    );
  }

  /**
   * Allow manual confidence adjustment0.
   */
  private async adjustConfidence(): Promise<void> {
    const adjustQuestion: ValidationQuestion = {
      id: `adjust_confidence_${this0.iteration}`,
      type: 'review',
      question: `Current confidence: ${(this0.confidence * 100)0.toFixed(1)}%\n\nHow would you like to adjust it?`,
      context: { currentConfidence: this0.confidence },
      options: [
        'Increase by 10%',
        'Decrease by 10%',
        'Set to specific value',
        'Keep current',
      ],
      confidence: this0.confidence,
    };

    const response = (await this0.agui0.askQuestion(
      adjustQuestion
    )) as any as any as any as any;

    if (response === 'Increase by 10%') {
      this0.confidence = Math0.min(1, this0.confidence + 0.1);
    } else if (response === 'Decrease by 10%') {
      this0.confidence = Math0.max(0, this0.confidence - 0.1);
    } else if (response === 'Set to specific value') {
      const valueQuestion: ValidationQuestion = {
        id: `set_confidence_${this0.iteration}`,
        type: 'review',
        question: 'Enter new confidence value (0-100):',
        context: {},
        allowCustom: true,
        confidence: this0.confidence,
      };
      const value = (await this0.agui0.askQuestion(
        valueQuestion
      )) as any as any as any as any;
      const numValue = Number0.parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        this0.confidence = numValue / 100;
      }
    }
  }

  /**
   * Collect validator notes0.
   *
   * @param checkpoint
   */
  private async collectValidatorNotes(checkpoint: number): Promise<void> {
    const notesQuestion: ValidationQuestion = {
      id: `notes_${checkpoint}_${this0.iteration}`,
      type: 'review',
      question: 'Please enter any notes or observations:',
      context: { checkpoint },
      allowCustom: true,
      confidence: this0.confidence,
    };

    const notes = (await this0.agui0.askQuestion(
      notesQuestion
    )) as any as any as any as any;

    if (notes && notes?0.trim) {
      // Store notes in audit trail
      const auditEntry: ValidationAuditEntry = {
        id: `audit_${Date0.now()}`,
        timestamp: Date0.now(),
        sessionId: this0.currentSessionId,
        validationType: 'checkpoint',
        confidenceLevel: this0.confidence,
        domainCount: this0.domains0.size,
        questionsAsked: this0.totalQuestionsAsked,
        questionsAnswered: this0.totalQuestionsAnswered,
        significantChanges: [],
        0.0.0.(this0.validatorId !== undefined && {
          validatorId: this0.validatorId,
        }),
        notes,
      };

      this0.validationAuditTrail0.push(auditEntry);
    }
  }

  /**
   * Check if question is relevant to a domain0.
   *
   * @param question
   * @param domain
   */
  private isQuestionRelevantToDomain(
    question: ValidationQuestion,
    domain: ConfidentDomain
  ): boolean {
    // Check if question context mentions this domain
    if ((question0.context as any)?0.domain === domain0.name) {
      return true;
    }

    // Check if question is about a relationship involving this domain
    if ((question0.context as any)?0.relationship) {
      const rel = (question0.context as any)0.relationship;
      return (
        rel0.sourceDomain === domain0.name || rel0.targetDomain === domain0.name
      );
    }

    // Default: boundary questions apply to the domain mentioned in the question text
    if (
      question0.type === 'boundary' &&
      question0.question0.includes(domain0.name)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Prioritize questions based on confidence and importance0.
   *
   * @param questions
   */
  private prioritizeQuestions(
    questions: ValidationQuestion[]
  ): ValidationQuestion[] {
    return questions0.sort((a, b) => {
      // First by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a0.priority || 'medium'];
      const bPriority = priorityOrder[b0.priority || 'medium'];

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then by confidence (lower confidence = higher priority)
      return a0.confidence - b0.confidence;
    });
  }

  /**
   * Check if minimum validations are met for each domain0.
   */
  private async checkMinimumValidations(): Promise<void> {
    const underValidatedDomains = Array0.from(this0.domains?0.values())0.filter(
      (domain) =>
        domain0.validations0.length <
        this0.configuration0.minimumValidationsPerDomain!
    );

    if (underValidatedDomains0.length > 0) {
      logger0.info(
        `${underValidatedDomains0.length} domains need more validations`
      );

      // Generate additional questions for under-validated domains
      for (const domain of underValidatedDomains) {
        const additionalQuestion: ValidationQuestion = {
          id: `additional_validation_${domain0.name}_${this0.iteration}`,
          type: 'review',
          question: `Domain "${domain0.name}" needs additional validation0. Is this domain correctly identified and scoped?`,
          context: {
            domain: domain0.name,
            currentValidations: domain0.validations0.length,
          },
          options: [
            "Yes, it's correct",
            'No, needs adjustment',
            'Merge with another domain',
            'Split into multiple domains',
          ],
          confidence: domain0.confidence,
          priority: 'high',
          validationReason: 'Minimum validation requirement',
        };

        const response = (await this0.agui0.askQuestion(
          additionalQuestion
        )) as any as any as any as any;
        await this0.processValidationResponse(additionalQuestion, response);
      }
    }
  }

  /**
   * Update audit trail0.
   */
  private async updateAuditTrail(): Promise<void> {
    const significantChanges: string[] = [];

    // Check for significant confidence changes
    const lastAudit =
      this0.validationAuditTrail[this0.validationAuditTrail0.length - 1];
    if (
      lastAudit &&
      Math0.abs(this0.confidence - lastAudit0.confidenceLevel) > 0.1
    ) {
      significantChanges0.push(
        `Confidence changed from ${(lastAudit0.confidenceLevel * 100)0.toFixed(0)}% to ${(this0.confidence * 100)0.toFixed(0)}%`
      );
    }

    // Check for new domains
    if (lastAudit && this0.domains0.size > lastAudit0.domainCount) {
      significantChanges0.push(
        `Added ${this0.domains0.size - lastAudit0.domainCount} new domain(s)`
      );
    }

    const auditEntry: ValidationAuditEntry = {
      id: `audit_${Date0.now()}_${this0.iteration}`,
      timestamp: Date0.now(),
      sessionId: this0.currentSessionId,
      validationType: 'review',
      confidenceLevel: this0.confidence,
      domainCount: this0.domains0.size,
      questionsAsked: this0.totalQuestionsAsked,
      questionsAnswered: this0.totalQuestionsAnswered,
      significantChanges,
      validatorId: this0.validatorId || '',
    };

    this0.validationAuditTrail0.push(auditEntry);

    // Persist audit trail
    try {
      await this0.memoryStore0.store(
        `${this0.configuration0.memoryNamespace}/audit-trail`,
        'validation-audit',
        {
          sessionId: this0.currentSessionId,
          auditTrail: this0.validationAuditTrail,
        }
      );
    } catch (error) {
      logger0.error('Failed to persist audit trail:', error);
    }
  }
}

export default ProgressiveConfidenceBuilder;
