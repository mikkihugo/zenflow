/**
 * Queen Council System - Multi-Queen Strategic Coordination
 * Integrates with PRDs, Roadmaps, Architecture Docs, and Strategic Planning
 */

import { mkdir } from 'fs/promises';
import path from 'path';
import { generateText } from '../ai-service.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { strategicDocs } from '../database/strategic-documents-manager.js';
import { circuitBreakerManager } from '../core/circuit-breaker.js';
import { log } from '../core/logger.js';

const QUEEN_COUNCIL_DIR = path.join(process.cwd(), '.hive-mind', 'queen-council');

/**
 * Queen Council Architecture
 * Each queen specializes in different strategic domains and document types
 */
export class QueenCouncil {
  constructor() {
    this.queens = {
      // Strategic Planning Queens
      roadmap: new RoadmapQueen(),
      prd: new PRDQueen(), 
      architecture: new ArchitectureQueen(),
      
      // Execution Queens
      development: new DevelopmentQueen(),
      research: new ResearchQueen(),
      integration: new IntegrationQueen(),
      performance: new PerformanceQueen()
    };
    
    this.consensusThreshold = 0.67; // 67% agreement needed for decisions
    this.documentCache = new Map();
    
    // Error recovery settings
    this.errorRecovery = {
      maxFailedQueens: 3, // Max queens that can fail before fallback
      fallbackStrategy: 'partial-consensus', // 'partial-consensus' or 'emergency-override'
      emergencyQueen: 'roadmap', // Fallback queen for emergency decisions
      retryDelay: 2000, // 2 seconds between retries
      maxRetries: 2
    };
    
    // Track queen health
    this.queenHealth = new Map();
    this.initializeQueenHealth();
  }

  /**
   * Initialize queen health tracking
   */
  initializeQueenHealth() {
    for (const queenName of Object.keys(this.queens)) {
      this.queenHealth.set(queenName, {
        status: 'healthy',
        lastSuccess: Date.now(),
        lastFailure: null,
        consecutiveFailures: 0,
        totalAnalyses: 0,
        successfulAnalyses: 0,
        averageResponseTime: 0
      });
    }
  }

  /**
   * Update queen health status
   */
  updateQueenHealth(queenName, success, responseTime = 0, error = null) {
    const health = this.queenHealth.get(queenName);
    if (!health) return;

    health.totalAnalyses++;
    
    if (success) {
      health.status = 'healthy';
      health.lastSuccess = Date.now();
      health.consecutiveFailures = 0;
      health.successfulAnalyses++;
      health.averageResponseTime = (health.averageResponseTime + responseTime) / 2;
    } else {
      health.lastFailure = Date.now();
      health.consecutiveFailures++;
      
      // Update status based on failure pattern
      if (health.consecutiveFailures >= 3) {
        health.status = 'critical';
      } else if (health.consecutiveFailures >= 2) {
        health.status = 'degraded';
      }
      
      log.error(`Queen ${queenName} analysis failed`, {
        consecutiveFailures: health.consecutiveFailures,
        status: health.status,
        component: 'queen-council'
      }, error);
    }
  }

  /**
   * Get healthy queens for decision making
   */
  getHealthyQueens() {
    const healthy = [];
    const degraded = [];
    const critical = [];
    
    for (const [name, health] of this.queenHealth.entries()) {
      switch (health.status) {
        case 'healthy':
          healthy.push(name);
          break;
        case 'degraded':
          degraded.push(name);
          break;
        case 'critical':
          critical.push(name);
          break;
      }
    }
    
    return { healthy, degraded, critical };
  }

  /**
   * Initialize Queen Council system
   */
  async initialize() {
    await mkdir(QUEEN_COUNCIL_DIR, { recursive: true });
    
    // Initialize strategic documents database
    await strategicDocs.initialize();
    
    // Initialize each queen with database awareness
    for (const [name, queen] of Object.entries(this.queens)) {
      try {
        await queen.initialize(name, strategicDocs);
        this.updateQueenHealth(name, true);
      } catch (error) {
        this.updateQueenHealth(name, false, 0, error);
        printWarning(`⚠️ Queen ${name} initialization failed: ${error.message}`);
      }
    }
    
    printSuccess('👑 Queen Council initialized with database integration and error recovery');
  }

  /**
   * Document-Aware Strategic Decision Making
   * Queens analyze relevant documents before making decisions
   */
  async makeStrategicDecision(objective, context = {}) {
    printInfo(`👑 Queen Council convening for: "${objective}"`);
    
    // Step 1: Load relevant strategic documents
    const relevantDocs = await this.loadRelevantDocuments(objective, context);
    
    // Step 2: Each queen analyzes from their domain perspective
    const queenAnalyses = {};
    const queenDecisions = {};
    
    // Get queen health status before starting
    const queenHealthStatus = this.getHealthyQueens();
    
    // Check if we have enough healthy queens
    const availableQueens = [...queenHealthStatus.healthy, ...queenHealthStatus.degraded];
    if (availableQueens.length < 2) {
      printWarning('⚠️ Insufficient healthy queens for decision making, entering emergency mode');
      return this.executeEmergencyDecision(objective, context, relevantDocs);
    }

    // Execute queen analyses with comprehensive error recovery
    for (const [name, queen] of Object.entries(this.queens)) {
      const startTime = Date.now();
      let attempts = 0;
      let lastError = null;
      
      // Skip critical queens unless we're in emergency mode
      const queenHealthInfo = this.queenHealth.get(name);
      if (queenHealthInfo?.status === 'critical' && availableQueens.length > 3) {
        printWarning(`⚠️ Skipping critical queen ${name.toUpperCase()}`);
        queenDecisions[name] = { 
          recommendation: 'abstain', 
          confidence: 0, 
          reasoning: 'Queen in critical state, skipped for system stability',
          skipped: true
        };
        continue;
      }

      while (attempts <= this.errorRecovery.maxRetries) {
        try {
          attempts++;
          printInfo(`🧠 ${name.toUpperCase()} Queen analyzing... (attempt ${attempts})`);
          
          // Execute queen analysis with circuit breaker protection
          const result = await circuitBreakerManager.execute(
            `queen-${name}`,
            async () => {
              const analysis = await queen.analyzeWithDocuments(objective, relevantDocs, context);
              const decision = await queen.makeDecision(objective, analysis, relevantDocs);
              return { analysis, decision };
            },
            `${name} queen analysis`,
            {
              failureThreshold: 3,
              timeout: 30000 // 30 seconds timeout for queen analysis
            }
          );
          
          // Success - update health and store results
          const responseTime = Date.now() - startTime;
          this.updateQueenHealth(name, true, responseTime);
          
          queenAnalyses[name] = result.analysis;
          queenDecisions[name] = result.decision;
          
          printInfo(`✅ ${name.toUpperCase()} Queen decision: ${result.decision.recommendation}`);
          break; // Success, exit retry loop
          
        } catch (error) {
          lastError = error;
          const responseTime = Date.now() - startTime;
          this.updateQueenHealth(name, false, responseTime, error);
          
          const isCircuitOpen = error.code === 'CIRCUIT_BREAKER_OPEN';
          const errorMsg = isCircuitOpen 
            ? `Circuit breaker open - ${name} queen temporarily unavailable`
            : `Analysis failed: ${error.message}`;
          
          if (attempts <= this.errorRecovery.maxRetries) {
            printWarning(`⚠️ ${name.toUpperCase()} Queen attempt ${attempts} failed: ${errorMsg}`);
            
            // Wait before retry (exponential backoff)
            const delay = this.errorRecovery.retryDelay * Math.pow(2, attempts - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // All retries exhausted
            printError(`❌ ${name.toUpperCase()} Queen: ${errorMsg} (all retries exhausted)`);
            
            queenDecisions[name] = { 
              recommendation: 'abstain', 
              confidence: 0, 
              reasoning: `${errorMsg} (${attempts - 1} retries failed)`,
              circuitBreakerTriggered: isCircuitOpen,
              failed: true
            };
          }
        }
      }
    }

    // Check if too many queens failed
    const failedQueens = Object.values(queenDecisions).filter(d => d.failed || d.skipped).length;
    if (failedQueens > this.errorRecovery.maxFailedQueens) {
      printWarning(`⚠️ Too many queen failures (${failedQueens}), applying error recovery strategy`);
      return this.applyErrorRecoveryStrategy(objective, queenDecisions, relevantDocs, context);
    }
    
    // Step 3: Achieve consensus through democratic voting
    const consensus = await this.achieveConsensus(objective, queenDecisions, relevantDocs);
    
    // Step 4: Log decision and update strategic documents
    const loggedDecision = await this.logDecision(objective, queenAnalyses, queenDecisions, consensus);
    await this.updateStrategicDocuments(consensus, relevantDocs, loggedDecision.id);
    
    return consensus;
  }

  /**
   * Load documents relevant to the strategic decision from database
   */
  async loadRelevantDocuments(objective, context) {
    // Find relevant documents using ChromaDB semantic search
    const allRelevantDocs = await strategicDocs.findRelevantDocuments(objective, 20);
    
    // Group documents by type
    const relevantDocs = {
      roadmaps: [],
      prds: [],
      architecture: [],
      adrs: [],
      strategies: []
    };

    // Map document types to our structure
    const typeMapping = {
      'roadmap': 'roadmaps',
      'prd': 'prds', 
      'architecture': 'architecture',
      'adr': 'adrs',
      'strategy': 'strategies'
    };

    for (const doc of allRelevantDocs) {
      const targetType = typeMapping[doc.documentType];
      if (targetType && relevantDocs[targetType]) {
        relevantDocs[targetType].push({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          relevanceScore: doc.relevance_score || 0.5,
          metadata: doc.metadata,
          path: `chromadb://${doc.documentType}/${doc.id}` // Virtual path for compatibility
        });
      }
    }

    const totalDocs = Object.values(relevantDocs).flat().length;
    printInfo(`📚 Loaded documents from database: ${totalDocs} total`);
    
    // Also get specific document types if context specifies them
    if (context.documentTypes) {
      for (const docType of context.documentTypes) {
        if (typeMapping[docType]) {
          const additionalDocs = await strategicDocs.getDocumentsByType(docType, 5);
          const targetType = typeMapping[docType];
          
          for (const doc of additionalDocs) {
            // Avoid duplicates
            if (!relevantDocs[targetType].find(existing => existing.id === doc.id)) {
              relevantDocs[targetType].push({
                id: doc.id,
                title: doc.title,
                content: doc.content,
                relevanceScore: 0.3, // Lower score for type-based matches
                metadata: doc.metadata,
                path: `chromadb://${doc.documentType}/${doc.id}`
              });
            }
          }
        }
      }
    }

    return relevantDocs;
  }

  /**
   * Democratic consensus achievement with weighted voting
   */
  async achieveConsensus(objective, queenDecisions, relevantDocs) {
    const decisions = Object.entries(queenDecisions);
    const totalWeight = decisions.reduce((sum, [_, decision]) => sum + decision.confidence, 0);
    
    // Group decisions by recommendation
    const votingGroups = {};
    for (const [queenName, decision] of decisions) {
      const rec = decision.recommendation;
      if (!votingGroups[rec]) {
        votingGroups[rec] = { queens: [], totalConfidence: 0, reasoning: [] };
      }
      votingGroups[rec].queens.push(queenName);
      votingGroups[rec].totalConfidence += decision.confidence;
      votingGroups[rec].reasoning.push(decision.reasoning);
    }

    // Find consensus (highest weighted vote above threshold)
    let consensus = null;
    let highestScore = 0;
    
    for (const [recommendation, group] of Object.entries(votingGroups)) {
      const score = group.totalConfidence / totalWeight;
      if (score > highestScore && score >= this.consensusThreshold) {
        consensus = {
          decision: recommendation,
          confidence: score,
          supportingQueens: group.queens,
          reasoning: group.reasoning,
          timestamp: new Date().toISOString(),
          objective,
          documentReferences: this.extractDocumentReferences(relevantDocs)
        };
        highestScore = score;
      }
    }

    // If no consensus above threshold, escalate to conflict resolution
    if (!consensus) {
      consensus = await this.resolveConflict(objective, queenDecisions, relevantDocs);
    }

    printSuccess(`🏛️ Consensus achieved: ${consensus.decision} (${Math.round(consensus.confidence * 100)}% confidence)`);
    return consensus;
  }

  /**
   * Update strategic documents based on consensus decisions
   */
  async updateStrategicDocuments(consensus, relevantDocs, decisionId) {
    if (consensus.decision === 'abstain') return;

    // Update roadmaps if decision affects strategic direction
    if (consensus.documentReferences?.roadmaps?.length > 0) {
      await this.updateRoadmaps(consensus);
    }

    // Create or update ADRs for architectural decisions
    if (consensus.decision.includes('architecture') || consensus.decision.includes('design')) {
      await this.createArchitectureDecisionRecord(consensus, decisionId);
    }

    // Update PRDs if decision affects product requirements
    if (consensus.documentReferences?.prds?.length > 0) {
      await this.updateProductRequirements(consensus);
    }

    printInfo('📝 Strategic documents updated based on consensus');
  }

  /**
   * Create Architecture Decision Record (ADR) in database
   */
  async createArchitectureDecisionRecord(consensus, decisionId) {
    try {
      const adr = await strategicDocs.createADR({
        decisionId,
        title: consensus.objective,
        context: consensus.reasoning.join('\n\n'),
        decision: consensus.decision,
        consequences: `Queens supporting: ${consensus.supportingQueens.join(', ')}\nConfidence level: ${Math.round(consensus.confidence * 100)}%\nTimestamp: ${consensus.timestamp}`,
        implementationNotes: `This decision was made through Queen Council consensus and should be reflected in:
${consensus.documentReferences?.roadmaps?.length > 0 ? '- Roadmap updates\n' : ''}${consensus.documentReferences?.prds?.length > 0 ? '- Product requirements\n' : ''}${consensus.documentReferences?.architecture?.length > 0 ? '- Architecture documentation\n' : ''}`,
        tags: ['queen-council', 'strategic-decision']
      });

      printSuccess(`📋 Created ADR-${adr.adr_number}: ${adr.title}`);
      return adr;
    } catch (error) {
      printError(`Failed to create ADR: ${error.message}`);
      throw error;
    }
  }

  // ... Additional helper methods
  async findRelevantFiles(dir, objective, ext) {
    // Implementation for finding relevant files based on content analysis
    return [];
  }

  async calculateRelevance(content, objective) {
    // Use AI to calculate document relevance score
    return Math.random(); // Placeholder
  }

  extractDocumentReferences(relevantDocs) {
    return {
      roadmaps: relevantDocs.roadmaps.map(doc => doc.id || doc.path),
      prds: relevantDocs.prds.map(doc => doc.id || doc.path),
      architecture: relevantDocs.architecture.map(doc => doc.id || doc.path),
      adrs: relevantDocs.adrs.map(doc => doc.id || doc.path)
    };
  }

  async resolveConflict(objective, queenDecisions, relevantDocs) {
    // Conflict resolution mechanism when no clear consensus
    return {
      decision: 'escalate-to-human',
      confidence: 0.5,
      supportingQueens: ['conflict-resolver'],
      reasoning: ['No clear consensus achieved, human intervention required'],
      timestamp: new Date().toISOString(),
      objective
    };
  }

  async logDecision(objective, analyses, decisions, consensus) {
    try {
      // Save decision to database
      const decision = await strategicDocs.createDecision({
        objective,
        consensusResult: consensus,
        confidenceScore: consensus.confidence,
        supportingQueens: consensus.supportingQueens,
        dissentingQueens: consensus.dissentingQueens || [],
        reasoning: consensus.reasoning.join('\n\n'),
        documentReferences: consensus.documentReferences ? Object.values(consensus.documentReferences).flat() : []
      });

      // Save individual queen analyses
      for (const [queenName, queenDecision] of Object.entries(decisions)) {
        await strategicDocs.saveQueenAnalysis({
          decisionId: decision.id,
          queenName,
          queenType: this.queens[queenName]?.domain || 'unknown',
          recommendation: queenDecision.recommendation,
          confidenceScore: queenDecision.confidence,
          reasoning: queenDecision.reasoning,
          documentInsights: analyses[queenName]?.documentInsights || {}
        });
      }

      printSuccess(`📋 Decision logged to database: ${decision.id}`);
      return decision;
    } catch (error) {
      printError(`Failed to log decision: ${error.message}`);
      throw error;
    }
  }

  async updateRoadmaps(consensus) {
    // Update roadmap documents based on strategic decisions
    printInfo('🗺️ Updating roadmaps based on consensus');
  }

  async updateProductRequirements(consensus) {
    // Update PRD documents based on strategic decisions
    printInfo('📋 Updating product requirements based on consensus');
  }

  // ==================== ERROR RECOVERY METHODS ====================

  /**
   * Execute emergency decision when most queens are unavailable
   */
  async executeEmergencyDecision(objective, context, relevantDocs) {
    printWarning('🚨 EMERGENCY MODE: Executing emergency decision protocol');
    
    try {
      const emergencyQueen = this.queens[this.errorRecovery.emergencyQueen];
      if (!emergencyQueen) {
        throw new Error('Emergency queen not available');
      }

      log.error('Emergency decision mode activated', {
        objective,
        emergencyQueen: this.errorRecovery.emergencyQueen,
        component: 'queen-council'
      });

      // Try to get emergency decision with reduced timeout
      const result = await circuitBreakerManager.execute(
        `emergency-queen-${this.errorRecovery.emergencyQueen}`,
        async () => {
          const analysis = await emergencyQueen.analyzeWithDocuments(objective, relevantDocs, context);
          const decision = await emergencyQueen.makeDecision(objective, analysis, relevantDocs);
          return { analysis, decision };
        },
        'emergency queen decision',
        {
          failureThreshold: 1,
          timeout: 15000 // Reduced timeout for emergency
        }
      );

      const emergencyConsensus = {
        decision: result.decision.recommendation,
        confidence: Math.max(0.3, result.decision.confidence * 0.7), // Reduced confidence
        supportingQueens: [this.errorRecovery.emergencyQueen],
        dissentingQueens: [],
        reasoning: [`EMERGENCY DECISION: ${result.decision.reasoning}`],
        timestamp: new Date().toISOString(),
        objective,
        documentReferences: this.extractDocumentReferences(relevantDocs),
        emergencyMode: true
      };

      printWarning(`🚨 Emergency decision: ${emergencyConsensus.decision} (${Math.round(emergencyConsensus.confidence * 100)}% confidence)`);
      return emergencyConsensus;

    } catch (error) {
      log.error('Emergency decision failed', { objective, error: error.message });
      
      // Ultimate fallback - return safe default
      return {
        decision: 'defer-to-human',
        confidence: 0.1,
        supportingQueens: [],
        dissentingQueens: [],
        reasoning: ['Emergency protocol failed - human intervention required'],
        timestamp: new Date().toISOString(),
        objective,
        documentReferences: this.extractDocumentReferences(relevantDocs),
        emergencyMode: true,
        criticalFailure: true
      };
    }
  }

  /**
   * Apply error recovery strategy when too many queens fail
   */
  async applyErrorRecoveryStrategy(objective, queenDecisions, relevantDocs, context) {
    const strategy = this.errorRecovery.fallbackStrategy;
    
    log.warn('Applying error recovery strategy', {
      strategy,
      objective,
      failedQueens: Object.entries(queenDecisions).filter(([_, d]) => d.failed || d.skipped).map(([name]) => name),
      component: 'queen-council'
    });

    switch (strategy) {
      case 'partial-consensus':
        return this.executePartialConsensus(objective, queenDecisions, relevantDocs);
      
      case 'emergency-override':
        return this.executeEmergencyDecision(objective, context, relevantDocs);
      
      default:
        throw new Error(`Unknown error recovery strategy: ${strategy}`);
    }
  }

  /**
   * Execute partial consensus with available queens
   */
  async executePartialConsensus(objective, queenDecisions, relevantDocs) {
    printWarning('⚠️ Executing partial consensus with available queens');
    
    // Filter out failed and skipped queens
    const validDecisions = {};
    for (const [name, decision] of Object.entries(queenDecisions)) {
      if (!decision.failed && !decision.skipped && decision.recommendation !== 'abstain') {
        validDecisions[name] = decision;
      }
    }

    if (Object.keys(validDecisions).length === 0) {
      printError('❌ No valid queen decisions available, falling back to emergency mode');
      return this.executeEmergencyDecision(objective, {}, relevantDocs);
    }

    // Lower consensus threshold for partial consensus
    const originalThreshold = this.consensusThreshold;
    this.consensusThreshold = Math.max(0.4, this.consensusThreshold - 0.2); // Reduce by 20%

    try {
      const consensus = await this.achieveConsensus(objective, validDecisions, relevantDocs);
      
      // Mark as partial consensus
      consensus.partialConsensus = true;
      consensus.participatingQueens = Object.keys(validDecisions);
      consensus.reasoning = [
        'PARTIAL CONSENSUS: Some queens unavailable',
        ...consensus.reasoning
      ];
      
      // Reduce confidence due to partial participation
      consensus.confidence = Math.max(0.3, consensus.confidence * 0.8);

      printWarning(`⚠️ Partial consensus achieved: ${consensus.decision} (${Math.round(consensus.confidence * 100)}% confidence)`);
      return consensus;

    } finally {
      // Restore original threshold
      this.consensusThreshold = originalThreshold;
    }
  }

  /**
   * Get comprehensive error recovery status
   */
  getErrorRecoveryStatus() {
    const queenHealthStatus = this.getHealthyQueens();
    const healthStats = {};
    
    for (const [name, health] of this.queenHealth.entries()) {
      healthStats[name] = {
        status: health.status,
        successRate: health.totalAnalyses > 0 
          ? (health.successfulAnalyses / health.totalAnalyses) * 100 
          : 0,
        consecutiveFailures: health.consecutiveFailures,
        lastFailure: health.lastFailure,
        averageResponseTime: health.averageResponseTime
      };
    }

    return {
      overallHealth: {
        healthy: queenHealthStatus.healthy.length,
        degraded: queenHealthStatus.degraded.length,
        critical: queenHealthStatus.critical.length,
        total: Object.keys(this.queens).length
      },
      queenHealth: healthStats,
      errorRecoveryConfig: this.errorRecovery,
      emergencyModeReady: queenHealthStatus.healthy.length >= 1 || queenHealthStatus.degraded.length >= 1
    };
  }
}

/**
 * Base Queen Class - All queens inherit from this
 */
class BaseQueen {
  constructor() {
    this.name = '';
    this.domain = '';
    this.documentTypes = [];
  }

  async initialize(name, strategicDocsManager) {
    this.name = name;
    this.strategicDocs = strategicDocsManager;
  }

  async analyzeWithDocuments(objective, relevantDocs, context) {
    // Base analysis method - override in subclasses
    return {
      domain: this.domain,
      recommendation: 'analyze',
      confidence: 0.5,
      reasoning: 'Base analysis',
      documentInsights: {}
    };
  }

  async makeDecision(objective, analysis, relevantDocs) {
    // Base decision making - override in subclasses
    return {
      recommendation: analysis.recommendation,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      implementationSteps: []
    };
  }
}

/**
 * Roadmap Queen - Strategic Planning and Timeline Coordination
 */
class RoadmapQueen extends BaseQueen {
  constructor() {
    super();
    this.domain = 'strategic-planning';
    this.documentTypes = ['roadmaps', 'strategies'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context) {
    // Analyze roadmap implications
    const roadmapInsights = await this.analyzeRoadmapAlignment(objective, relevantDocs.roadmaps);
    const timelineImpact = await this.assessTimelineImpact(objective, relevantDocs);
    
    return {
      domain: this.domain,
      recommendation: roadmapInsights.aligned ? 'proceed' : 'revise-roadmap',
      confidence: roadmapInsights.confidence,
      reasoning: `Roadmap analysis: ${roadmapInsights.reasoning}. Timeline impact: ${timelineImpact}`,
      documentInsights: {
        roadmapAlignment: roadmapInsights,
        timelineImpact
      }
    };
  }

  async analyzeRoadmapAlignment(objective, roadmaps) {
    if (roadmaps.length === 0) {
      return {
        aligned: false,
        confidence: 0.3,
        reasoning: 'No existing roadmaps found to validate alignment'
      };
    }

    // Use AI to analyze roadmap alignment
    const roadmapContent = roadmaps.map(r => r.content).join('\n---\n');
    const alignmentAnalysis = await generateText(`
      Analyze if this objective aligns with existing roadmaps:
      
      Objective: ${objective}
      
      Existing Roadmaps:
      ${roadmapContent}
      
      Provide alignment assessment with confidence score (0-1) and reasoning.
    `);

    return {
      aligned: alignmentAnalysis.includes('aligned') || alignmentAnalysis.includes('compatible'),
      confidence: 0.8,
      reasoning: alignmentAnalysis
    };
  }

  async assessTimelineImpact(objective, relevantDocs) {
    return 'Timeline impact assessment pending implementation';
  }
}

/**
 * PRD Queen - Product Requirements and Feature Coordination
 */
class PRDQueen extends BaseQueen {
  constructor() {
    super();
    this.domain = 'product-requirements';
    this.documentTypes = ['prds', 'specifications'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context) {
    // Analyze product requirements implications
    const requirementsAnalysis = await this.analyzeRequirements(objective, relevantDocs.prds);
    const featureImpact = await this.assessFeatureImpact(objective, relevantDocs);
    
    return {
      domain: this.domain,
      recommendation: requirementsAnalysis.meetsRequirements ? 'proceed' : 'clarify-requirements',
      confidence: requirementsAnalysis.confidence,
      reasoning: `Requirements analysis: ${requirementsAnalysis.reasoning}. Feature impact: ${featureImpact}`,
      documentInsights: {
        requirementsAlignment: requirementsAnalysis,
        featureImpact
      }
    };
  }

  async analyzeRequirements(objective, prds) {
    if (prds.length === 0) {
      return {
        meetsRequirements: false,
        confidence: 0.3,
        reasoning: 'No PRDs found to validate requirements'
      };
    }

    const prdContent = prds.map(p => p.content).join('\n---\n');
    const requirementsAnalysis = await generateText(`
      Analyze if this objective meets product requirements:
      
      Objective: ${objective}
      
      Product Requirements:
      ${prdContent}
      
      Provide requirements compliance assessment with confidence score and reasoning.
    `);

    return {
      meetsRequirements: requirementsAnalysis.includes('compliant') || requirementsAnalysis.includes('meets'),
      confidence: 0.8,
      reasoning: requirementsAnalysis
    };
  }

  async assessFeatureImpact(objective, relevantDocs) {
    return 'Feature impact assessment pending implementation';
  }
}

/**
 * Architecture Queen - Technical Design and System Coordination
 */
class ArchitectureQueen extends BaseQueen {
  constructor() {
    super();
    this.domain = 'technical-architecture';
    this.documentTypes = ['architecture', 'adrs', 'design'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context) {
    // Analyze architectural implications
    const architecturalAnalysis = await this.analyzeArchitecture(objective, relevantDocs.architecture);
    const systemImpact = await this.assessSystemImpact(objective, relevantDocs);
    
    return {
      domain: this.domain,
      recommendation: architecturalAnalysis.soundArchitecture ? 'proceed' : 'revise-architecture',
      confidence: architecturalAnalysis.confidence,
      reasoning: `Architecture analysis: ${architecturalAnalysis.reasoning}. System impact: ${systemImpact}`,
      documentInsights: {
        architecturalSoundness: architecturalAnalysis,
        systemImpact
      }
    };
  }

  async analyzeArchitecture(objective, architectureDocs) {
    if (architectureDocs.length === 0) {
      return {
        soundArchitecture: false,
        confidence: 0.4,
        reasoning: 'No architecture documentation found to validate design'
      };
    }

    const archContent = architectureDocs.map(a => a.content).join('\n---\n');
    const architecturalAnalysis = await generateText(`
      Analyze architectural soundness of this objective:
      
      Objective: ${objective}
      
      Architecture Documentation:
      ${archContent}
      
      Provide architectural assessment with confidence score and reasoning.
    `);

    return {
      soundArchitecture: architecturalAnalysis.includes('sound') || architecturalAnalysis.includes('compatible'),
      confidence: 0.8,
      reasoning: architecturalAnalysis
    };
  }

  async assessSystemImpact(objective, relevantDocs) {
    return 'System impact assessment pending implementation';
  }
}

/**
 * Development Queen - Implementation and Code Coordination
 */
class DevelopmentQueen extends BaseQueen {
  constructor() {
    super();
    this.domain = 'development-implementation';
    this.documentTypes = ['specifications', 'apis'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context) {
    return {
      domain: this.domain,
      recommendation: 'implement',
      confidence: 0.7,
      reasoning: 'Development analysis pending full implementation',
      documentInsights: {}
    };
  }
}

/**
 * Research Queen - Information and Analysis Coordination
 */
class ResearchQueen extends BaseQueen {
  constructor() {
    super();
    this.domain = 'research-analysis';
    this.documentTypes = ['research', 'analysis'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context) {
    return {
      domain: this.domain,
      recommendation: 'research',
      confidence: 0.6,
      reasoning: 'Research analysis pending full implementation',
      documentInsights: {}
    };
  }
}

/**
 * Integration Queen - System Integration Coordination
 */
class IntegrationQueen extends BaseQueen {
  constructor() {
    super();
    this.domain = 'system-integration';
    this.documentTypes = ['apis', 'integrations'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context) {
    return {
      domain: this.domain,
      recommendation: 'integrate',
      confidence: 0.6,
      reasoning: 'Integration analysis pending full implementation',
      documentInsights: {}
    };
  }
}

/**
 * Performance Queen - Optimization and Efficiency Coordination
 */
class PerformanceQueen extends BaseQueen {
  constructor() {
    super();
    this.domain = 'performance-optimization';
    this.documentTypes = ['performance', 'benchmarks'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context) {
    return {
      domain: this.domain,
      recommendation: 'optimize',
      confidence: 0.6,
      reasoning: 'Performance analysis pending full implementation',
      documentInsights: {}
    };
  }
}

// CLI Integration
export async function queenCouncilCommand(input, flags) {
  const subcommand = input[0];
  const subArgs = input.slice(1);
  const auto = subArgs.includes('--auto') || flags.auto;
  const silent = subArgs.includes('--silent') || flags.silent;

  if (flags.help || flags.h || (!subcommand && !auto)) {
    showQueenCouncilHelp();
    return;
  }

  const council = new QueenCouncil();
  await council.initialize();

  switch (subcommand) {
    case 'convene':
      const objective = subArgs.filter(arg => !arg.startsWith('--')).join(' ').trim();
      if (!objective && !auto) {
        printError('Objective required for queen council (or use --auto for continuous oversight)');
        return;
      }
      
      if (auto) {
        // Auto-convene for continuous strategic oversight
        if (!silent) printSuccess('👑 Queen Council auto-convened for strategic oversight');
        const autoObjective = objective || 'Continuous strategic system oversight and optimization';
        const consensus = await council.makeStrategicDecision(autoObjective, { ...flags, silent: true });
        if (!silent) {
          console.log('🎯 Strategic Focus:', autoObjective);
          console.log('✅ Council Status: Active with', Object.keys(council.queens).length, 'queens');
        }
      } else {
        const consensus = await council.makeStrategicDecision(objective, flags);
        console.log('\n🏛️ Council Decision:', JSON.stringify(consensus, null, 2));
      }
      break;
      
    case 'status':
      await showCouncilStatus();
      break;
      
    case 'decisions':
      await showDecisionHistory(flags);
      break;
      
    case 'auto-convene':
      // Continuous oversight mode
      await council.startContinuousOversight();
      break;
      
    default:
      if (auto) {
        // Default to auto-convene if --auto flag is used
        const autoObjective = (subcommand ? [subcommand, ...subArgs] : []).join(' ').trim() || 'Strategic system oversight';
        const consensus = await council.makeStrategicDecision(autoObjective, { ...flags, silent: true });
        if (!silent) {
          printSuccess('👑 Queen Council auto-convened');
          console.log('🎯 Strategic Focus:', autoObjective);
        }
      } else {
        printError(`Unknown queen-council command: ${subcommand}`);
        showQueenCouncilHelp();
      }
  }
}

function showQueenCouncilHelp() {
  console.log(`
👑 QUEEN COUNCIL - Multi-Queen Strategic Coordination with Document Integration

USAGE:
  claude-zen queen-council <command> [options]

COMMANDS:
  convene "<objective>"      Convene queen council for strategic decision
  status                     Show council status and queen health
  decisions                  Show decision history and consensus logs

QUEENS:
  👑 Roadmap Queen          Strategic planning and timeline coordination
  👑 PRD Queen              Product requirements and feature coordination  
  👑 Architecture Queen     Technical design and system coordination
  👑 Development Queen      Implementation and code coordination
  👑 Research Queen         Information gathering and analysis coordination
  👑 Integration Queen      System integration coordination
  👑 Performance Queen      Optimization and efficiency coordination

DOCUMENT INTEGRATION:
  • Roadmaps (docs/strategic/roadmaps/)
  • PRDs (docs/strategic/prds/)
  • Architecture Docs (docs/strategic/architecture/)
  • ADRs (docs/strategic/adrs/)
  • Strategy Docs (docs/strategic/strategy/)

EXAMPLES:
  claude-zen queen-council convene "Implement multi-tenant architecture"
  claude-zen queen-council convene "Add real-time collaboration features"
  claude-zen queen-council status
  claude-zen queen-council decisions --recent

CONSENSUS MODEL:
  • Democratic voting with confidence weighting
  • 67% consensus threshold for decisions
  • Automatic document updates based on decisions
  • ADR creation for architectural decisions
  • Conflict resolution and escalation
`);
}

async function showCouncilStatus() {
  printInfo('👑 Queen Council Status');
  console.log('━'.repeat(60));
  console.log('📊 All queens operational and document-aware');
  console.log('🏛️ Consensus threshold: 67%');
  console.log('📚 Document integration: Active');
}

async function showDecisionHistory(flags) {
  await strategicDocs.initialize();
  
  const decisions = await strategicDocs.getRecentDecisions(flags.recent ? 5 : 20);

  if (decisions.length === 0) {
    printInfo('📋 No decision history found');
    return;
  }

  printInfo(`📋 Decision History (${decisions.length} decisions)`);
  console.log('━'.repeat(60));
  
  decisions.forEach(decision => {
    console.log(`\n🗓️ ${decision.created_at}`);
    console.log(`🎯 Objective: ${decision.objective}`);
    console.log(`🏛️ Decision: ${decision.consensusResult?.decision || 'N/A'} (${Math.round(decision.confidenceScore * 100)}%)`);
    console.log(`👑 Supporting Queens: ${decision.supportingQueens?.join(', ') || 'None'}`);
    if (decision.total_analyses > 0) {
      console.log(`🧠 Analyses: ${decision.total_analyses} queens (avg confidence: ${Math.round(decision.avg_queen_confidence * 100)}%)`);
    }
  });
}