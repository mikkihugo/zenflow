/**
 * @file Knowledge Package - Semantic Context & Decision Memory
 *
 * UNIQUE DOMAIN: Semantic context, decision history, and methodology compliance
 * Does NOT overlap with code-analyzer, language-parsers, or ai-linter
 *
 * Focuses on:
 * - WHY decisions were made (not WHAT code exists)
 * - Project semantic context (not syntax analysis) 
 * - Enterprise methodology compliance (not code quality)
 */

import { getLogger, EventBus } from '@claude-zen/foundation';

const logger = getLogger('semantic-context');

// Semantic Context & Decision Memory System
class SemanticContextProcessor {
  private decisionHistory: Map<string, ArchitecturalDecision> = new Map();
  private contextMemory: Map<string, ProjectSemantics> = new Map();
  private methodologyCompliance: Map<string, ComplianceRecord> = new Map();

  constructor() {
    logger.info('Semantic context processor initialized - decision memory and context tracking');
  }
  
  /**
   * Record architectural decision with full context and reasoning
   * UNIQUE: Stores WHY decisions were made, not WHAT code exists
   */
  async recordDecision(decision: ArchitecturalDecision): Promise<void> {
    const decisionId = `${decision.domain}-${decision.timestamp}`;
    this.decisionHistory.set(decisionId, decision);
    
    logger.info('Recorded architectural decision', { 
      domain: decision.domain, 
      decision: decision.decision,
      reasoning: decision.reasoning.slice(0, 100) + '...'
    });
  }
  
  /**
   * Retrieve similar decisions for context-aware coordination
   * UNIQUE: Semantic similarity of decisions, not code similarity
   */
  async findSimilarDecisions(domain: string, context: string): Promise<ArchitecturalDecision[]> {
    logger.info('Finding similar decisions', { domain, context });
    
    const relevantDecisions = Array.from(this.decisionHistory.values())
      .filter(decision => 
        decision.domain === domain || 
        decision.context.includes(context) ||
        decision.tags.some(tag => context.toLowerCase().includes(tag.toLowerCase()))
      )
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
      
    return relevantDecisions;
  }
  
  /**
   * Store project semantic context (intent, purpose, constraints)
   * UNIQUE: Captures WHY the project exists, not WHAT files it contains
   */
  async storeProjectSemantics(projectId: string, semantics: ProjectSemantics): Promise<void> {
    this.contextMemory.set(projectId, semantics);
    
    logger.info('Stored project semantics', { 
      projectId,
      purpose: semantics.purpose,
      constraints: semantics.constraints.length
    });
  }
  
  /**
   * Retrieve semantic context for coordination decisions
   * UNIQUE: Returns intent and purpose, not file structure
   */
  async getProjectSemantics(projectId: string): Promise<ProjectSemantics | null> {
    const semantics = this.contextMemory.get(projectId);
    if (semantics) {
      logger.info('Retrieved project semantics', { projectId, purpose: semantics.purpose });
    }
    return semantics || null;
  }
  
  /**
   * Track methodology compliance (SAFe 6.0, SPARC) over time
   * UNIQUE: Enterprise methodology adherence, not code quality
   */
  async recordComplianceCheck(projectId: string, methodology: string, compliance: ComplianceRecord): Promise<void> {
    const complianceId = `${projectId}-${methodology}-${Date.now()}`;
    this.methodologyCompliance.set(complianceId, compliance);
    
    logger.info('Recorded compliance check', {
      projectId,
      methodology,
      score: compliance.complianceScore,
      phase: compliance.currentPhase
    });
  }
  
  /**
   * Get compliance history for methodology tracking
   * UNIQUE: Enterprise methodology tracking, not code metrics
   */
  async getComplianceHistory(projectId: string, methodology: string): Promise<ComplianceRecord[]> {
    const history = Array.from(this.methodologyCompliance.entries())
      .filter(([key, _]) => key.startsWith(`${projectId}-${methodology}`))
      .map(([_, record]) => record)
      .sort((a, b) => b.timestamp - a.timestamp);
      
    logger.info('Retrieved compliance history', { 
      projectId, 
      methodology, 
      records: history.length 
    });
    
    return history;
  }
}

// Type definitions for semantic context and decision memory
interface ArchitecturalDecision {
  decision: string;           // What was decided
  reasoning: string;          // WHY it was decided (unique value)
  alternatives: string[];     // What else was considered
  context: string;           // Situation context
  domain: string;            // Area of decision (auth, data, ui, etc.)
  timestamp: number;         // When decided
  decisionMaker: string;     // Who decided
  tags: string[];           // Semantic tags for retrieval
  consequences: string[];    // Expected outcomes
  reviewDate?: number;      // When to review decision
}

interface ProjectSemantics {
  purpose: string;           // WHY the project exists
  businessValue: string;     // Business justification
  stakeholders: string[];    // Who cares about this project
  constraints: string[];     // Limitations and requirements
  assumptions: string[];     // What we're assuming
  risks: string[];          // What could go wrong
  successCriteria: string[]; // How we measure success
  context: string;          // Broader organizational context
}

interface ComplianceRecord {
  methodology: 'SAFe6.0' | 'SPARC' | 'Custom';
  currentPhase: string;      // Current methodology phase
  complianceScore: number;   // 0-100 adherence score
  violations: string[];      // What's not compliant
  recommendations: string[]; // How to improve
  nextSteps: string[];      // What to do next
  timestamp: number;        // When assessed
  assessor: string;         // Who assessed
}

// Initialize processor - INTERNAL ONLY
const semanticProcessor = new SemanticContextProcessor();

// Event-driven interface - NO DIRECT EXPORTS
class KnowledgeEventHandler {
  private processor = semanticProcessor;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const eventBus = EventBus.getInstance();

    // Listen for knowledge events from coordination packages
    eventBus.on('knowledge:record-decision', async (data: any) => {
      await this.handleRecordDecision(data);
    });

    eventBus.on('knowledge:find-similar-decisions', async (data: any) => {
      await this.handleFindSimilarDecisions(data);
    });

    eventBus.on('knowledge:store-semantics', async (data: any) => {
      await this.handleStoreSemantics(data);
    });

    eventBus.on('knowledge:get-semantics', async (data: any) => {
      await this.handleGetSemantics(data);
    });

    eventBus.on('knowledge:record-compliance', async (data: any) => {
      await this.handleRecordCompliance(data);
    });

    eventBus.on('knowledge:get-compliance-history', async (data: any) => {
      await this.handleGetComplianceHistory(data);
    });
  }

  private async handleRecordDecision(data: any): Promise<void> {
    try {
      await this.processor.recordDecision(data.decision);
      logger.info('Decision recorded via events', { domain: data.decision.domain });
    } catch (error) {
      logger.error('Failed to record decision:', error);
    }
  }

  private async handleFindSimilarDecisions(data: any): Promise<void> {
    try {
      const decisions = await this.processor.findSimilarDecisions(data.domain, data.context);
      
      // Emit response with correlation ID
      const eventBus = EventBus.getInstance();
      eventBus.emit(`knowledge:similar-decisions:response:${data.requestId}`, {
        decisions,
        domain: data.domain,
        context: data.context
      });
    } catch (error) {
      logger.error('Failed to find similar decisions:', error);
    }
  }

  private async handleStoreSemantics(data: any): Promise<void> {
    try {
      await this.processor.storeProjectSemantics(data.projectId, data.semantics);
      logger.info('Project semantics stored via events', { projectId: data.projectId });
    } catch (error) {
      logger.error('Failed to store project semantics:', error);
    }
  }

  private async handleGetSemantics(data: any): Promise<void> {
    try {
      const semantics = await this.processor.getProjectSemantics(data.projectId);
      
      // Emit response with correlation ID
      const eventBus = EventBus.getInstance();
      eventBus.emit(`knowledge:semantics:response:${data.requestId}`, {
        semantics,
        projectId: data.projectId
      });
    } catch (error) {
      logger.error('Failed to get project semantics:', error);
    }
  }

  private async handleRecordCompliance(data: any): Promise<void> {
    try {
      await this.processor.recordComplianceCheck(data.projectId, data.methodology, data.compliance);
      logger.info('Compliance recorded via events', { 
        projectId: data.projectId, 
        methodology: data.methodology 
      });
    } catch (error) {
      logger.error('Failed to record compliance:', error);
    }
  }

  private async handleGetComplianceHistory(data: any): Promise<void> {
    try {
      const history = await this.processor.getComplianceHistory(data.projectId, data.methodology);
      
      // Emit response with correlation ID
      const eventBus = EventBus.getInstance();
      eventBus.emit(`knowledge:compliance-history:response:${data.requestId}`, {
        history,
        projectId: data.projectId,
        methodology: data.methodology
      });
    } catch (error) {
      logger.error('Failed to get compliance history:', error);
    }
  }
}

// Initialize event handler - PURE EVENT-DRIVEN
const knowledgeEventHandler = new KnowledgeEventHandler();
// Use the event handler to prevent unused warning
void knowledgeEventHandler;

// NO EXPORTS - Pure event-driven package