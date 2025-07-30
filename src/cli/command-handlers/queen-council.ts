/**
 * Queen Council System - Multi-Queen Strategic Coordination
 * Integrates with PRDs, Roadmaps, Architecture Docs, and Strategic Planning
 */

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { generateText } from '../ai-service.js';
import { circuitBreakerManager } from '../core/circuit-breaker.js';
import { log } from '../core/logger.js';
import { strategicDocs } from '../database/strategic-documents-manager.js';
import { printError, printInfo, printWarning } from '../utils.js';

const QUEEN_COUNCIL_DIR = path.join(process.cwd(), '.hive-mind', 'queen-council');

/**
 * Queen Council Architecture
 * Each queen specializes in different strategic domains and document types
 */
export class QueenCouncil {
  constructor() {
    this.queens = {
      // Strategic Planning Queensroadmap = 0.67; // 67% agreement needed for decisions
    this.documentCache = new Map();
    
    // Error recovery settings
    this.errorRecovery = {maxFailedQueens = new Map();
    this.initializeQueenHealth();
  }

  /**
   * Initialize queen health tracking
   */
  initializeQueenHealth() {
    for (const queenName of Object.keys(this.queens)) {
      this.queenHealth.set(queenName, {status = 0, error = null): any {
    const health = this.queenHealth.get(queenName);
    if (!health) return;

    health.totalAnalyses++;
    
    if(success) {
      health.status = 'healthy';
      health.lastSuccess = Date.now();
      health.consecutiveFailures = 0;
      health.successfulAnalyses++;
      health.averageResponseTime = (health.averageResponseTime + responseTime) / 2;
    } else {
      health.lastFailure = Date.now();
      health.consecutiveFailures++;
      
      // Update status based on failure pattern
      if(health.consecutiveFailures >= 3) {
        health.status = 'critical';
      } else if(health.consecutiveFailures >= 2) {
        health.status = 'degraded';
      }
      
      log.error(`Queen ${queenName} analysis failed`, {consecutiveFailures = [];
    const degraded = [];
    const critical = [];
    
    for (const [name, health] of this.queenHealth.entries()) {
      switch(health.status) {
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
    await mkdir(QUEEN_COUNCIL_DIR, { recursive = {}): any {
    printInfo(`👑 _Queen _Council _conveningfor = await this.loadRelevantDocuments(objective, context);
    
    // Step 2 = {};
    const queenDecisions = {};
    
    // Get queen health status before starting
    const queenHealthStatus = this.getHealthyQueens();
    
    // Check if we have enough healthy queens
    const availableQueens = [...queenHealthStatus.healthy, ...queenHealthStatus.degraded];
    if(availableQueens.length < 2) {
      printWarning('⚠️ Insufficient healthy queens for decision making, entering emergency mode');
      return this.executeEmergencyDecision(objective, context, relevantDocs);
    }

    // Execute queen analyses with comprehensive error recovery
    for (const [name, queen] of Object.entries(this.queens)) {
      const startTime = Date.now();
      const attempts = 0;
      const _lastError = null;
      
      // Skip critical queens unless we're in emergency mode
      const queenHealthInfo = this.queenHealth.get(name);
      if(queenHealthInfo?.status === 'critical' && availableQueens.length > 3) {
        printWarning(`⚠️ Skipping critical queen ${name.toUpperCase()}`);
        queenDecisions[name] = {recommendation = this.errorRecovery.maxRetries) {
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
            {failureThreshold = Date.now() - startTime;
          this.updateQueenHealth(name, true, responseTime);
          
          queenAnalyses[name] = result.analysis;
          queenDecisions[name] = result.decision;
          
          printInfo(`✅ ${name.toUpperCase()} Queendecision = error;
          const responseTime = Date.now() - startTime;
          this.updateQueenHealth(name, false, responseTime, error);
          
          const isCircuitOpen = error.code === 'CIRCUIT_BREAKER_OPEN';

            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            // All retries exhausted
            printError(`❌ ${name.toUpperCase()} Queen = {recommendation = Object.values(queenDecisions).filter(d => d.failed || d.skipped).length;
    if(failedQueens > this.errorRecovery.maxFailedQueens) {
      printWarning(`⚠️ Too many queen failures (${failedQueens}), applying error recovery strategy`);
      return this.applyErrorRecoveryStrategy(objective, queenDecisions, relevantDocs, context);
    }
    
    // Step3 = await this.achieveConsensus(objective, queenDecisions, relevantDocs);
    
    // Step4 = await this.logDecision(objective, queenAnalyses, queenDecisions, consensus);
    await this.updateStrategicDocuments(consensus, relevantDocs, loggedDecision.id);
    
    return consensus;
  }

  /**
   * Load documents relevant to the strategic decision from database
   */
  async loadRelevantDocuments(objective, context): any {
    // Find relevant documents using ChromaDB semantic search
    const allRelevantDocs = await strategicDocs.findRelevantDocuments(objective, 20);
    
    // Group documents by type
    const relevantDocs = {
      roadmaps = {
      'roadmap': 'roadmaps',
      'prd': 'prds', 
      'architecture': 'architecture',
      'adr': 'adrs',
      'strategy': 'strategies'
    };

    for(const doc of allRelevantDocs) {
      const targetType = typeMapping[doc.documentType];
      if(targetType && relevantDocs[targetType]) {
        relevantDocs[targetType].push({id = Object.values(relevantDocs).flat().length;
    printInfo(`📚 Loaded documents fromdatabase = await strategicDocs.getDocumentsByType(docType, 5);
          const targetType = typeMapping[docType];
          
          for(const doc of additionalDocs) {
            // Avoid duplicates
            if (!relevantDocs[targetType].find(existing => existing.id === doc.id)) {
              relevantDocs[targetType].push({id = Object.entries(queenDecisions);
    const totalWeight = decisions.reduce((sum, [_, decision]) => sum + decision.confidence, 0);
    
    // Group decisions by recommendation
    const votingGroups = {};
    for(const [queenName, decision] of decisions) {
      const rec = decision.recommendation;
      if(!votingGroups[rec]) {
        votingGroups[rec] = {queens = decision.confidence;
      votingGroups[rec].reasoning.push(decision.reasoning);
    }

    // Find consensus (highest weighted vote above threshold)
    let consensus = null;
    const highestScore = 0;
    
    for (const [recommendation, group] of Object.entries(votingGroups)) {
      const score = group.totalConfidence / totalWeight;
      if(score > highestScore && score >= this.consensusThreshold) {
        consensus = {decision = score;
      }
    }

    // If no consensus above threshold, escalate to conflict resolution
    if(!consensus) {
      consensus = await this.resolveConflict(objective, queenDecisions, relevantDocs);
    }

    printSuccess(`🏛️ Consensusachieved = === 'abstain') return;

    // Update roadmaps if decision affects strategic direction
    if(consensus.documentReferences?.roadmaps?.length > 0) {
      await this.updateRoadmaps(consensus);
    }

    // Create or update ADRs for architectural decisions
    if (consensus.decision.includes('architecture') || consensus.decision.includes('design')) {
      await this.createArchitectureDecisionRecord(consensus, decisionId);
    }

    // Update PRDs if decision affects product requirements
    if(consensus.documentReferences?.prds?.length > 0) {
      await this.updateProductRequirements(consensus);
    }

    printInfo('📝 Strategic documents updated based on consensus');
  }

  /**
   * Create Architecture Decision Record (ADR) in database
   */
  async createArchitectureDecisionRecord(consensus, decisionId): any 
    try {
      const _adr = await strategicDocs.createADR({
        decisionId,title = > doc.id || doc.path),prds = > doc.id || doc.path),architecture = > doc.id || doc.path),adrs = > doc.id || doc.path)
    };
  }

  async resolveConflict(objective, queenDecisions, relevantDocs): any 
    // Conflict resolution mechanism when no clear consensus
    return {decision = await strategicDocs.createDecision({
        objective,consensusResult = =================== ERROR RECOVERY METHODS ====================

  /**
   * Execute emergency decision when most queens are unavailable
   */
  async executeEmergencyDecision(objective, context, relevantDocs): any {
    printWarning('🚨 EMERGENCYMODE = this.queens[this.errorRecovery.emergencyQueen];
      if(!emergencyQueen) {
        throw new Error('Emergency queen not available');
      }

      log.error('Emergency decision mode activated', {
        objective,emergencyQueen = await circuitBreakerManager.execute(
        `emergency-queen-${this.errorRecovery.emergencyQueen}`,
        async () => {
          const analysis = await emergencyQueen.analyzeWithDocuments(objective, relevantDocs, context);
          const decision = await emergencyQueen.makeDecision(objective, analysis, relevantDocs);
          return { analysis, decision };
        },
        'emergency queen decision',
        {
          failureThreshold = {decision = this.errorRecovery.fallbackStrategy;
    
    log.warn('Applying error recovery strategy', {
      strategy,
      objective,failedQueens = > d.failed || d.skipped).map(([name]) => name),
      component = {};
    for (const [name, decision] of Object.entries(queenDecisions)) {
      if(!decision.failed && !decision.skipped && decision.recommendation !== 'abstain') {
        validDecisions[name] = decision;
      }
    }

    if (Object.keys(validDecisions).length === 0) {
      printError('❌ No valid queen decisions available, falling back to emergency mode');
      return this.executeEmergencyDecision(objective, {}, relevantDocs);
    }

    // Lower consensus threshold for partial consensus
    const _originalThreshold = this.consensusThreshold;
    this.consensusThreshold = Math.max(0.4, this.consensusThreshold - 0.2); // Reduce by 20%

    try {
      const consensus = await this.achieveConsensus(objective, validDecisions, relevantDocs);
      
      // Mark as partial consensus
      consensus.partialConsensus = true;
      consensus.participatingQueens = Object.keys(validDecisions);
      consensus.reasoning = [
        'PARTIALCONSENSUS = Math.max(0.3, consensus.confidence * 0.8);

      printWarning(`⚠️ Partial consensusachieved = originalThreshold;
    }
  }

  /**
   * Get comprehensive error recovery status
   */
  getErrorRecoveryStatus() {
    const queenHealthStatus = this.getHealthyQueens();
    const healthStats = {};
    
    for (const [name, health] of this.queenHealth.entries()) {
      healthStats[name] = {status = 1 || queenHealthStatus.degraded.length >= 1
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

  async initialize(name, strategicDocsManager): any {
    this.name = name;
    this.strategicDocs = strategicDocsManager;
  }

  async analyzeWithDocuments(objective, relevantDocs, context): any {
    // Base analysis method - override in subclasses
    return {domain = 'strategic-planning';
    this.documentTypes = ['roadmaps', 'strategies'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context): any {
    // Analyze roadmap implications

    return {domain = == 0) {
      return {aligned = roadmaps.map(r => r.content).join('\n---\n');

    this.documentTypes = ['prds', 'specifications'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context): any {
    // Analyze product requirements implications
    const requirementsAnalysis = await this.analyzeRequirements(objective, relevantDocs.prds);

    return {domain = == 0) {
      return {meetsRequirements = prds.map(p => p.content).join('\n---\n');
    const requirementsAnalysis = await generateText(`
      Analyze if this objective meets productrequirements = 'technical-architecture';
    this.documentTypes = ['architecture', 'adrs', 'design'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context): any {
    // Analyze architectural implications
    const architecturalAnalysis = await this.analyzeArchitecture(objective, relevantDocs.architecture);

    return {domain = == 0) {
      return {soundArchitecture = architectureDocs.map(a => a.content).join('\n---\n');
    const _architecturalAnalysis = await generateText(`
      Analyze architectural soundness of thisobjective = 'development-implementation';
    this.documentTypes = ['specifications', 'apis'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context): any {
    return {domain = 'research-analysis';
    this.documentTypes = ['research', 'analysis'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context): any {
    return {domain = 'system-integration';
    this.documentTypes = ['apis', 'integrations'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context): any {
    return {domain = 'performance-optimization';
    this.documentTypes = ['performance', 'benchmarks'];
  }

  async analyzeWithDocuments(objective, relevantDocs, context): any {
    return {domain = input[0];
  const subArgs = input.slice(1);
  const auto = subArgs.includes('--auto') || flags.auto;
  const silent = subArgs.includes('--silent') || flags.silent;

  if (flags.help || flags.h || (!subcommand && !auto)) {
    showQueenCouncilHelp();
    return;
  }

  const council = new QueenCouncil();
  await council.initialize();

  switch(subcommand) {
    case 'convene':
      const objective = subArgs.filter(arg => !arg.startsWith('--')).join(' ').trim();
      if(!objective && !auto) {
        printError('Objective required for queen council (or use --auto for continuous oversight)');
        return;
      }
      
      if(auto) {
        // Auto-convene for continuous strategic oversight
        if (!silent) printSuccess('👑 Queen Council auto-convened for strategic oversight');
        const autoObjective = objective || 'Continuous strategic system oversight and optimization';
        const consensus = await council.makeStrategicDecision(autoObjective, { ...flags,silent = await council.makeStrategicDecision(objective, flags);
        console.warn('\n🏛️ CouncilDecision = (subcommand ? [subcommand, ...subArgs] : []).join(' ').trim() || 'Strategic system oversight';
        const consensus = await council.makeStrategicDecision(autoObjective, { ...flags,silent = await strategicDocs.getRecentDecisions(flags.recent ? 5 );

  if(decisions.length === 0) {
    printInfo('📋 No decision history found');
    return;
  }

  printInfo(`📋 Decision History (${decisions.length} decisions)`);
  console.warn('━'.repeat(60));
  
  decisions.forEach(decision => {
    console.warn(`\n🗓️ ${decision.created_at}`);
    console.warn(`🎯 Objective: ${decision.objective}`);
    console.warn(`🏛️ Decision: ${decision.consensusResult?.decision || 'N/A'} (${Math.round(decision.confidenceScore * 100)}%)`);
    console.warn(`👑 Supporting Queens: ${decision.supportingQueens?.join(', ') || 'None'}`);
    if(decision.total_analyses > 0) {
      console.warn(`🧠 Analyses: ${decision.total_analyses} queens (avg confidence: ${Math.round(decision.avg_queen_confidence * 100)}%)`);
    }
  });
}
