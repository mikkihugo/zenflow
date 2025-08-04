/**
 * @fileoverview Progressive Confidence Builder for Domain Discovery
 * Builds confidence in domain discovery through iterations with human validation.
 * Integrates with HiveFACT for online research and MCP memory for persistence.
 */

import { EventEmitter } from 'node:events';
import { createLogger } from '@core/logger';
import type { DomainDiscoveryBridge, DiscoveredDomain } from './domain-discovery-bridge';
import { getHiveFACT, type HiveFACTSystem } from '../hive-fact-integration';
import type { SessionMemoryStore } from '@memory/memory';
import type { AGUIInterface } from '@interfaces/agui/agui-adapter';

const logger = createLogger({ prefix: 'ProgressiveConfidence' });

export interface LearningEvent {
  timestamp: number;
  type: 'document_import' | 'human_validation' | 'online_research' | 'confidence_update' | 'domain_refinement';
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
  type: 'relevance' | 'boundary' | 'relationship' | 'naming' | 'priority';
  question: string;
  context: any;
  options?: string[];
  allowCustom?: boolean;
  confidence: number;
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

export interface ConfidentDomain extends DiscoveredDomain {
  confidence: ConfidenceMetrics;
  validations: ValidationRecord[];
  research: ResearchResult[];
  refinementHistory: DomainRefinement[];
}

export interface ValidationRecord {
  questionId: string;
  question: string;
  userResponse: string;
  timestamp: number;
  impactOnConfidence: number;
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
}

export interface DiscoveryContext {
  projectPath: string;
  existingDomains?: DiscoveredDomain[];
  previousLearning?: LearningEvent[];
  userPreferences?: Record<string, any>;
}

/**
 * Progressive Confidence Builder
 * Iteratively builds confidence in domain discovery through human validation and research
 */
export class ProgressiveConfidenceBuilder extends EventEmitter {
  private confidence: number = 0.0;
  private confidenceMetrics: ConfidenceMetrics;
  private learningHistory: LearningEvent[] = [];
  private domains: Map<string, ConfidentDomain> = new Map();
  private relationships: DomainRelationship[] = [];
  private iteration: number = 0;
  private hiveFact?: HiveFACTSystem;
  
  constructor(
    private discoveryBridge: DomainDiscoveryBridge,
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
      ...config
    };
    
    this.confidenceMetrics = this.initializeMetrics();
  }

  /**
   * Build confidence through progressive iterations
   */
  async buildConfidence(context: DiscoveryContext): Promise<ConfidentDomainMap> {
    logger.info('Starting progressive confidence building', {
      projectPath: context.projectPath,
      targetConfidence: this.config.targetConfidence
    });

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
    this.hiveFact = getHiveFACT();

    // Main confidence building loop
    while (this.confidence < this.config.targetConfidence! && this.iteration < this.config.maxIterations!) {
      this.iteration++;
      logger.info(`Starting iteration ${this.iteration}`, { currentConfidence: this.confidence });

      try {
        // 1. Import and analyze more documents
        await this.importMoreDocuments(context);

        // 2. Ask targeted validation questions
        await this.performHumanValidation();

        // 3. Research online if confidence is low
        if (this.confidence < this.config.researchThreshold!) {
          await this.performOnlineResearch();
        }

        // 4. Refine domain understanding
        await this.refineDomainUnderstanding();

        // 5. Update confidence metrics
        this.updateConfidenceMetrics();

        // 6. Persist learning to memory
        await this.persistLearning();

        // 7. Show progress to user
        await this.showProgress();

        // Emit progress event
        this.emit('progress', {
          iteration: this.iteration,
          confidence: this.confidence,
          metrics: this.confidenceMetrics,
          domainCount: this.domains.size
        });

      } catch (error) {
        logger.error(`Error in iteration ${this.iteration}:`, error);
        this.recordLearningEvent('confidence_update', {
          error: error instanceof Error ? error.message : 'Unknown error',
          iteration: this.iteration
        }, -0.1); // Reduce confidence on error
      }
    }

    // Final validation before returning
    if (this.confidence >= this.config.targetConfidence!) {
      await this.performFinalValidation();
    }

    return this.buildConfidentDomainMap();
  }

  /**
   * Import more documents and extract insights
   */
  private async importMoreDocuments(context: DiscoveryContext): Promise<void> {
    logger.info('Importing additional documents for analysis');

    // Ask user for more documents to import
    const importQuestion: ValidationQuestion = {
      id: `import_${this.iteration}`,
      type: 'relevance',
      question: 'Would you like to import additional documentation? (Enter paths or "skip" to continue)',
      context: {
        currentDomains: Array.from(this.domains.keys()),
        documentCount: this.getDocumentCount(),
        confidence: this.confidence
      },
      allowCustom: true,
      confidence: this.confidence
    };

    const response = await this.agui.askQuestion(importQuestion);
    
    if (response && response.toLowerCase() !== 'skip') {
      // Parse document paths
      const paths = response.split(/[,\n]/).map(p => p.trim()).filter(p => p);
      
      // Import and analyze documents
      for (const path of paths) {
        try {
          const insights = await this.analyzeDocument(path);
          this.recordLearningEvent('document_import', {
            path,
            insights,
            extracted: insights.concepts.length
          }, 0.05); // Small confidence boost per document
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
    
    // Batch questions for better UX
    const batches = this.batchQuestions(questions, this.config.validationBatchSize!);
    
    for (const batch of batches) {
      const responses = await this.agui.askBatchQuestions(batch);
      
      for (let i = 0; i < batch.length; i++) {
        const question = batch[i];
        const response = responses[i];
        
        if (response) {
          this.processValidationResponse(question, response);
        }
      }
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
      if (domain.confidence.overall < 0.7) {
        try {
          // Generate research queries
          const queries = this.generateResearchQueries(domain);
          
          for (const query of queries) {
            const facts = await this.hiveFact.searchFacts({
              query,
              limit: 5
            });

            if (facts.length > 0) {
              const research: ResearchResult = {
                query,
                sources: facts.map(f => f.metadata.source),
                insights: this.extractInsights(facts),
                confidence: this.calculateResearchConfidence(facts),
                relevantDomains: [domainName]
              };

              domain.research.push(research);
              this.recordLearningEvent('online_research', {
                domain: domainName,
                query,
                factsFound: facts.length,
                sources: research.sources
              }, 0.1 * research.confidence);
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
          confidenceImpact: refinement.confidenceImpact
        });

        this.recordLearningEvent('domain_refinement', {
          domain: refinement.domainName,
          changes: refinement.changes,
          reason: refinement.reason
        }, refinement.confidenceImpact);
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
      overall: (documentCoverage + humanValidations + researchDepth + domainClarity + consistency) / 5,
      documentCoverage,
      humanValidations,
      researchDepth,
      domainClarity,
      consistency
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
          metrics: this.confidenceMetrics
        }
      );

      // Save domain state
      await this.memoryStore.store(
        `${this.config.memoryNamespace}/domains`,
        'domain-map',
        {
          domains: Array.from(this.domains.entries()),
          relationships: this.relationships
        }
      );

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
        consistency: `${(this.confidenceMetrics.consistency * 100).toFixed(1)}%`
      }
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
        confidence: this.confidenceMetrics
      },
      options: ['1', '2', '3'],
      confidence: this.confidence
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
   */
  private async initializeFromExisting(existingDomains: DiscoveredDomain[]): Promise<void> {
    for (const domain of existingDomains) {
      const confidentDomain: ConfidentDomain = {
        ...domain,
        confidence: this.initializeMetrics(),
        validations: [],
        research: [],
        refinementHistory: []
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
      if (domain.confidence.domainClarity < 0.7) {
        questions.push({
          id: `boundary_${name}_${this.iteration}`,
          type: 'boundary',
          question: `Is "${name}" the correct name and boundary for this domain?\n\nFiles: ${domain.files.slice(0, 5).join(', ')}...\nConcepts: ${domain.suggestedConcepts.join(', ')}`,
          context: { domain },
          options: ['Yes', 'No - suggest changes'],
          confidence: domain.confidence.overall
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
          confidence: rel.confidence
        });
      }
    }

    return questions;
  }

  /**
   * Generate research queries for a domain
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
      consistency: 0.0
    };
  }

  private recordLearningEvent(type: LearningEvent['type'], data: any, confidenceImpact: number): void {
    const event: LearningEvent = {
      timestamp: Date.now(),
      type,
      data,
      confidenceBefore: this.confidence,
      confidenceAfter: Math.max(0, Math.min(1, this.confidence + confidenceImpact)),
      source: `iteration_${this.iteration}`
    };
    
    this.learningHistory.push(event);
    this.confidence = event.confidenceAfter;
  }

  private async analyzeDocument(path: string): Promise<any> {
    // Simulate document analysis - in real implementation would use document processor
    return {
      concepts: ['concept1', 'concept2'],
      domains: ['domain1'],
      confidence: 0.7
    };
  }

  private batchQuestions(questions: ValidationQuestion[], batchSize: number): ValidationQuestion[][] {
    const batches: ValidationQuestion[][] = [];
    for (let i = 0; i < questions.length; i += batchSize) {
      batches.push(questions.slice(i, i + batchSize));
    }
    return batches;
  }

  private processValidationResponse(question: ValidationQuestion, response: string): void {
    // Find the relevant domain
    for (const domain of this.domains.values()) {
      const validation: ValidationRecord = {
        questionId: question.id,
        question: question.question,
        userResponse: response,
        timestamp: Date.now(),
        impactOnConfidence: 0.0
      };

      // Calculate confidence impact based on response
      if (question.type === 'boundary' && response.toLowerCase().includes('yes')) {
        validation.impactOnConfidence = 0.1;
      } else if (question.type === 'relationship' && response.toLowerCase() === 'yes') {
        validation.impactOnConfidence = 0.05;
      }

      domain.validations.push(validation);
      this.recordLearningEvent('human_validation', {
        questionId: question.id,
        response,
        domain: domain.name
      }, validation.impactOnConfidence);
    }
  }

  private extractInsights(facts: any[]): string[] {
    // Extract key insights from facts
    return facts.map(f => {
      if (typeof f.content === 'string') {
        return f.content.substring(0, 100) + '...';
      }
      return JSON.stringify(f.content).substring(0, 100) + '...';
    });
  }

  private calculateResearchConfidence(facts: any[]): number {
    // Higher confidence with more sources and newer facts
    const sourceCount = new Set(facts.map(f => f.metadata.source)).size;
    const avgAge = facts.reduce((sum, f) => sum + (Date.now() - f.metadata.timestamp), 0) / facts.length;
    const ageFactor = Math.max(0, 1 - avgAge / (30 * 24 * 60 * 60 * 1000)); // 30 days
    
    return Math.min(1, (sourceCount / 3) * 0.5 + ageFactor * 0.5);
  }

  private analyzePatterns(): any[] {
    // Analyze patterns across all learning to suggest refinements
    const refinements: any[] = [];
    
    // Look for repeated validation corrections
    for (const domain of this.domains.values()) {
      const negativeValidations = domain.validations.filter(v => 
        v.userResponse.toLowerCase().includes('no') || 
        v.userResponse.toLowerCase().includes('incorrect')
      );
      
      if (negativeValidations.length > 1) {
        refinements.push({
          domainName: domain.name,
          changes: ['Review domain boundary', 'Consider splitting or merging'],
          reason: 'Multiple negative validations',
          confidenceImpact: -0.1
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
        const relationship = this.detectRelationship(domains[i], domains[j]);
        if (relationship) {
          this.relationships.push(relationship);
        }
      }
    }
  }

  private detectRelationship(domain1: ConfidentDomain, domain2: ConfidentDomain): DomainRelationship | null {
    // Detect relationships based on shared concepts, imports, etc.
    const sharedConcepts = domain1.suggestedConcepts.filter(c => 
      domain2.suggestedConcepts.includes(c)
    );
    
    if (sharedConcepts.length > 0) {
      return {
        sourceDomain: domain1.name,
        targetDomain: domain2.name,
        type: 'communicates_with',
        confidence: Math.min(1, sharedConcepts.length * 0.3),
        evidence: sharedConcepts
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
      positiveValidations += domain.validations.filter(v => 
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
      highQualityResearch += domain.research.filter(r => r.confidence > 0.7).length;
    }
    
    return totalResearch > 0 ? highQualityResearch / totalResearch : 0;
  }

  private calculateDomainClarity(): number {
    // Calculate how clear the domain boundaries are
    const domainScores = Array.from(this.domains.values()).map(d => {
      const hasGoodName = d.validations.some(v => v.question.includes('correct name') && v.userResponse.toLowerCase().includes('yes'));
      const hasResearch = d.research.length > 0;
      const hasRefinements = d.refinementHistory.length > 0;
      
      return (hasGoodName ? 0.4 : 0) + (hasResearch ? 0.3 : 0) + (hasRefinements ? 0.3 : 0);
    });
    
    return domainScores.length > 0 ? domainScores.reduce((a, b) => a + b, 0) / domainScores.length : 0;
  }

  private calculateConsistency(): number {
    // Calculate consistency across iterations
    const recentEvents = this.learningHistory.slice(-20);
    const positiveEvents = recentEvents.filter(e => e.confidenceAfter > e.confidenceBefore).length;
    return recentEvents.length > 0 ? positiveEvents / recentEvents.length : 0.5;
  }

  private updateDomainConfidence(domain: ConfidentDomain): void {
    domain.confidence = {
      overall: this.confidence * 0.8 + Math.random() * 0.2, // Add some variance
      documentCoverage: this.confidenceMetrics.documentCoverage,
      humanValidations: domain.validations.length > 0 ? this.calculateValidationScore() : 0,
      researchDepth: domain.research.length > 0 ? 0.8 : 0.2,
      domainClarity: domain.validations.filter(v => v.impactOnConfidence > 0).length / Math.max(domain.validations.length, 1),
      consistency: this.confidenceMetrics.consistency
    };
  }

  private getDocumentCount(): number {
    // Count total documents analyzed
    return this.learningHistory.filter(e => e.type === 'document_import').length;
  }

  private getTotalValidations(): number {
    return Array.from(this.domains.values()).reduce((sum, d) => sum + d.validations.length, 0);
  }

  private getTotalResearch(): number {
    return Array.from(this.domains.values()).reduce((sum, d) => sum + d.research.length, 0);
  }

  private generateSummary(): string {
    const domainList = Array.from(this.domains.entries())
      .map(([name, domain]) => `• ${name} (${(domain.confidence.overall * 100).toFixed(0)}% confidence)`)
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
      researchCount: this.getTotalResearch()
    };
  }
}

export default ProgressiveConfidenceBuilder;