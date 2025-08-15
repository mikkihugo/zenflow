/**
 * @fileoverview Phase 2: Cross-Swarm Knowledge Sharing System
 * 
 * This module implements advanced knowledge sharing mechanisms between swarms,
 * enabling pattern transfer, collaborative learning, and swarm performance optimization
 * through shared intelligence.
 * 
 * @author Claude Code Zen Team - Phase 2 Implementation
 * @version 2.0.0
 * @since 2025-08-14
 */

import { EventEmitter } from 'node:events';
import type { SwarmDatabaseManager, SuccessfulPattern, SwarmRepositories } from './swarm-database-manager.ts';
import type { EnhancedVectorPatternDiscovery, CrossSwarmPatternResult, PatternCluster } from './phase2-enhanced-vector-discovery.ts';
import { inject, injectable } from '../../../di/decorators/injectable.ts';
import { CORE_TOKENS, type ILogger } from '../../../di/tokens/core-tokens.ts';

/**
 * Knowledge Transfer Request
 */
export interface KnowledgeTransferRequest {
  id: string;
  sourceSwarmId: string;
  targetSwarmId: string;
  patternIds: string[];
  requestType: 'pattern_transfer' | 'cluster_sharing' | 'performance_insight';
  priority: 'low' | 'medium' | 'high' | 'critical';
  contextRequirements: Record<string, unknown>;
  expectedBenefit: number;
  requestedAt: string;
  completedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Knowledge Transfer Result
 */
export interface KnowledgeTransferResult {
  transferId: string;
  sourceSwarmId: string;
  targetSwarmId: string;
  transferredPatterns: TransferredPattern[];
  adaptationRequired: boolean;
  adaptationInstructions?: string[];
  transferEffectiveness: number;
  potentialImprovements: string[];
  transferredAt: string;
}

/**
 * Transferred Pattern with Adaptation Info
 */
export interface TransferredPattern {
  originalPattern: SuccessfulPattern;
  adaptedPattern: SuccessfulPattern;
  adaptationLevel: 'none' | 'minimal' | 'moderate' | 'significant';
  adaptationChanges: string[];
  confidenceScore: number;
  recommendedUsage: string[];
}

/**
 * Swarm Performance Comparison
 */
export interface SwarmPerformanceComparison {
  swarmId: string;
  comparedWith: string[];
  performanceMetrics: {
    averageTaskSuccessRate: number;
    averageCompletionTime: number;
    patternUtilizationRate: number;
    knowledgeTransferRate: number;
    adaptationSuccess: number;
  };
  relativePerformance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  improvementOpportunities: string[];
  recommendedKnowledgeExchanges: string[];
  comparisonTimestamp: string;
}

/**
 * Pattern Recommendation Engine
 */
export interface PatternRecommendation {
  patternId: string;
  sourceSwarmId: string;
  targetSwarmId: string;
  pattern: SuccessfulPattern;
  relevanceScore: number;
  adaptationComplexity: 'low' | 'medium' | 'high';
  expectedImpact: number;
  reasoning: string[];
  prerequisites: string[];
  riskFactors: string[];
  implementationGuidance: string[];
}

/**
 * Swarm Knowledge Network Node
 */
export interface SwarmKnowledgeNode {
  swarmId: string;
  expertise: string[];
  knowledgeStrengths: Record<string, number>;
  learningNeeds: string[];
  sharingHistory: Record<string, number>;
  receptivityScore: number;
  contributionScore: number;
  networkPosition: 'hub' | 'connector' | 'specialist' | 'learner';
  lastUpdated: string;
}

/**
 * Cross-Swarm Knowledge Sharing Engine
 * 
 * Manages knowledge transfer between swarms, including:
 * - Pattern recommendation and transfer
 * - Swarm performance comparison and analysis
 * - Knowledge network optimization
 * - Collaborative learning orchestration
 */
@injectable
export class CrossSwarmKnowledgeSharing extends EventEmitter {
  private transferRequests: Map<string, KnowledgeTransferRequest> = new Map();
  private knowledgeNetwork: Map<string, SwarmKnowledgeNode> = new Map();
  private performanceComparisons: Map<string, SwarmPerformanceComparison> = new Map();
  private recommendationCache: Map<string, PatternRecommendation[]> = new Map();

  constructor(
    @inject(CORE_TOKENS.Logger) private _logger: ILogger,
    private swarmDatabaseManager: SwarmDatabaseManager,
    private vectorPatternDiscovery: EnhancedVectorPatternDiscovery
  ) {
    super();
    this._logger.info('Cross-Swarm Knowledge Sharing Engine initialized');
  }

  /**
   * Request knowledge transfer between swarms
   */
  async requestKnowledgeTransfer(request: Omit<KnowledgeTransferRequest, 'id' | 'requestedAt' | 'status'>): Promise<string> {
    const transferRequest: KnowledgeTransferRequest = {
      ...request,
      id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    this._logger.info(`Knowledge transfer requested: ${transferRequest.id} (${request.sourceSwarmId} → ${request.targetSwarmId})`);

    this.transferRequests.set(transferRequest.id, transferRequest);

    // Process the request asynchronously
    this.processKnowledgeTransferRequest(transferRequest.id).catch(error => {
      this._logger.error(`Knowledge transfer processing failed: ${error}`);
    });

    this.emit('knowledge_transfer_requested', transferRequest);
    return transferRequest.id;
  }

  /**
   * Get pattern recommendations for a target swarm
   */
  async getPatternRecommendations(
    targetSwarmId: string,
    options: {
      limit?: number;
      minRelevance?: number;
      includeAdaptationGuidance?: boolean;
      focusAreas?: string[];
      excludeSourceSwarms?: string[];
    } = {}
  ): Promise<PatternRecommendation[]> {
    const {
      limit = 10,
      minRelevance = 0.6,
      includeAdaptationGuidance = true,
      focusAreas = [],
      excludeSourceSwarms = []
    } = options;

    this._logger.info(`Generating pattern recommendations for swarm ${targetSwarmId}`);

    // Check cache
    const cacheKey = `${targetSwarmId}_${JSON.stringify(options)}`;
    if (this.recommendationCache.has(cacheKey)) {
      const cached = this.recommendationCache.get(cacheKey)!;
      if (new Date().getTime() - new Date(cached[0]?.pattern?.lastUsed || 0).getTime() < 3600000) { // 1 hour cache
        return cached;
      }
    }

    try {
      // Get target swarm's current patterns for comparison
      const targetPatterns = await this.getSwarmPatterns(targetSwarmId);
      const targetExpertise = this.extractSwarmExpertise(targetPatterns);

      // Get all active swarms for knowledge mining
      const activeSwarms = await this.swarmDatabaseManager.getActiveSwarms();
      const recommendations: PatternRecommendation[] = [];

      for (const swarm of activeSwarms) {
        if (swarm.swarmId === targetSwarmId) continue;
        if (excludeSourceSwarms.includes(swarm.swarmId)) continue;

        try {
          const sourcePatterns = await this.getSwarmPatterns(swarm.swarmId);
          const swarmRecommendations = await this.generateSwarmRecommendations(
            targetSwarmId,
            swarm.swarmId,
            sourcePatterns,
            targetExpertise,
            { minRelevance, focusAreas, includeAdaptationGuidance }
          );

          recommendations.push(...swarmRecommendations);
        } catch (error) {
          this._logger.warn(`Failed to generate recommendations from swarm ${swarm.swarmId}: ${error}`);
        }
      }

      // Sort by relevance and expected impact
      recommendations.sort((a, b) => {
        const scoreA = a.relevanceScore * 0.6 + a.expectedImpact * 0.4;
        const scoreB = b.relevanceScore * 0.6 + b.expectedImpact * 0.4;
        return scoreB - scoreA;
      });

      const finalRecommendations = recommendations.slice(0, limit);

      // Cache the results
      this.recommendationCache.set(cacheKey, finalRecommendations);

      this._logger.info(`Generated ${finalRecommendations.length} pattern recommendations for swarm ${targetSwarmId}`);
      this.emit('recommendations_generated', { targetSwarmId, count: finalRecommendations.length });

      return finalRecommendations;

    } catch (error) {
      this._logger.error(`Failed to generate pattern recommendations: ${error}`);
      throw error;
    }
  }

  /**
   * Compare performance between swarms
   */
  async compareSwarmPerformance(
    targetSwarmId: string,
    compareWithSwarms: string[] = [],
    timeWindow: { start: Date; end: Date } = {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date()
    }
  ): Promise<SwarmPerformanceComparison> {
    this._logger.info(`Comparing performance for swarm ${targetSwarmId} with ${compareWithSwarms.length || 'all'} swarms`);

    const cacheKey = `perf_${targetSwarmId}_${compareWithSwarms.join(',')}_${timeWindow.start.getTime()}`;
    if (this.performanceComparisons.has(cacheKey)) {
      return this.performanceComparisons.get(cacheKey)!;
    }

    try {
      // If no specific swarms to compare with, use all active swarms
      if (compareWithSwarms.length === 0) {
        const activeSwarms = await this.swarmDatabaseManager.getActiveSwarms();
        compareWithSwarms = activeSwarms
          .map(s => s.swarmId)
          .filter(id => id !== targetSwarmId);
      }

      // Get performance metrics for target swarm
      const targetMetrics = await this.calculateSwarmPerformanceMetrics(targetSwarmId, timeWindow);

      // Get performance metrics for comparison swarms
      const comparisonMetrics = await Promise.all(
        compareWithSwarms.map(async swarmId => ({
          swarmId,
          metrics: await this.calculateSwarmPerformanceMetrics(swarmId, timeWindow)
        }))
      );

      // Calculate relative performance
      const allMetrics = [
        { swarmId: targetSwarmId, metrics: targetMetrics },
        ...comparisonMetrics
      ];

      const comparison: SwarmPerformanceComparison = {
        swarmId: targetSwarmId,
        comparedWith: compareWithSwarms,
        performanceMetrics: targetMetrics,
        relativePerformance: this.calculateRelativePerformance(targetMetrics, comparisonMetrics.map(c => c.metrics)),
        improvementOpportunities: this.identifyImprovementOpportunities(targetMetrics, comparisonMetrics),
        recommendedKnowledgeExchanges: await this.identifyKnowledgeExchangeOpportunities(targetSwarmId, compareWithSwarms),
        comparisonTimestamp: new Date().toISOString()
      };

      // Cache the results
      this.performanceComparisons.set(cacheKey, comparison);

      this._logger.info(`Performance comparison completed for swarm ${targetSwarmId}: ${comparison.relativePerformance}`);
      this.emit('performance_comparison_completed', comparison);

      return comparison;

    } catch (error) {
      this._logger.error(`Performance comparison failed: ${error}`);
      throw error;
    }
  }

  /**
   * Build and analyze the swarm knowledge network
   */
  async analyzeKnowledgeNetwork(): Promise<Map<string, SwarmKnowledgeNode>> {
    this._logger.info('Analyzing swarm knowledge network');

    try {
      const activeSwarms = await this.swarmDatabaseManager.getActiveSwarms();
      const networkNodes = new Map<string, SwarmKnowledgeNode>();

      // Analyze each swarm's knowledge characteristics
      for (const swarm of activeSwarms) {
        const node = await this.analyzeSwarmKnowledgeNode(swarm.swarmId);
        networkNodes.set(swarm.swarmId, node);
      }

      // Update network positions based on relationships
      this.updateNetworkPositions(networkNodes);

      // Store the updated network
      this.knowledgeNetwork = networkNodes;

      this._logger.info(`Knowledge network analyzed: ${networkNodes.size} nodes`);
      this.emit('knowledge_network_analyzed', { nodeCount: networkNodes.size });

      return networkNodes;

    } catch (error) {
      this._logger.error(`Knowledge network analysis failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get optimal knowledge sharing paths
   */
  async getOptimalSharingPaths(
    sourceSwarmId: string,
    targetSwarmId: string,
    knowledgeType: string
  ): Promise<string[]> {
    this._logger.info(`Finding optimal sharing path: ${sourceSwarmId} → ${targetSwarmId} (${knowledgeType})`);

    // Simple pathfinding - could be enhanced with more sophisticated algorithms
    const network = this.knowledgeNetwork.size > 0 ? this.knowledgeNetwork : await this.analyzeKnowledgeNetwork();
    
    const sourceNode = network.get(sourceSwarmId);
    const targetNode = network.get(targetSwarmId);

    if (!sourceNode || !targetNode) {
      return [sourceSwarmId, targetSwarmId]; // Direct path if nodes not found
    }

    // For now, return direct path - could implement A* or similar for complex networks
    return [sourceSwarmId, targetSwarmId];
  }

  /**
   * Track pattern adoption success
   */
  async trackPatternAdoption(
    transferId: string,
    adoptionMetrics: {
      patternsAdopted: number;
      patternsSuccessful: number;
      averagePerformanceImprovement: number;
      adaptationChallenges: string[];
      unexpectedBenefits: string[];
    }
  ): Promise<void> {
    this._logger.info(`Tracking pattern adoption for transfer ${transferId}`);

    try {
      const request = this.transferRequests.get(transferId);
      if (!request) {
        throw new Error(`Transfer request not found: ${transferId}`);
      }

      // Store adoption metrics
      const cluster = await this.swarmDatabaseManager.getSwarmCluster(request.targetSwarmId);
      
      await cluster.repositories.coordination.create({
        id: `adoption_${transferId}_${Date.now()}`,
        metricName: 'pattern_adoption',
        metricValue: adoptionMetrics.patternsSuccessful / adoptionMetrics.patternsAdopted,
        metadata: {
          transferId,
          sourceSwarmId: request.sourceSwarmId,
          targetSwarmId: request.targetSwarmId,
          adoptionMetrics,
          trackedAt: new Date().toISOString()
        }
      });

      // Update knowledge network nodes
      await this.updateKnowledgeNetworkFromAdoption(request, adoptionMetrics);

      this._logger.info(`Pattern adoption tracked: ${adoptionMetrics.patternsSuccessful}/${adoptionMetrics.patternsAdopted} successful`);
      this.emit('pattern_adoption_tracked', { transferId, metrics: adoptionMetrics });

    } catch (error) {
      this._logger.error(`Pattern adoption tracking failed: ${error}`);
      throw error;
    }
  }

  // Private helper methods

  private async processKnowledgeTransferRequest(requestId: string): Promise<void> {
    const request = this.transferRequests.get(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    try {
      request.status = 'processing';
      this.transferRequests.set(requestId, request);

      const result = await this.executeKnowledgeTransfer(request);

      request.status = 'completed';
      request.completedAt = new Date().toISOString();
      this.transferRequests.set(requestId, request);

      this.emit('knowledge_transfer_completed', { requestId, result });

    } catch (error) {
      request.status = 'failed';
      this.transferRequests.set(requestId, request);
      this.emit('knowledge_transfer_failed', { requestId, error: error.message });
      throw error;
    }
  }

  private async executeKnowledgeTransfer(request: KnowledgeTransferRequest): Promise<KnowledgeTransferResult> {
    this._logger.info(`Executing knowledge transfer: ${request.id}`);

    // Get patterns from source swarm
    const sourcePatterns = await this.getPatternsByIds(request.sourceSwarmId, request.patternIds);
    
    // Analyze patterns for adaptation needs
    const transferredPatterns: TransferredPattern[] = [];
    
    for (const pattern of sourcePatterns) {
      const adaptedPattern = await this.adaptPatternForTargetSwarm(
        pattern,
        request.sourceSwarmId,
        request.targetSwarmId,
        request.contextRequirements
      );
      
      transferredPatterns.push(adaptedPattern);
    }

    // Store transferred patterns in target swarm
    await this.storeTransferredPatterns(request.targetSwarmId, transferredPatterns);

    const result: KnowledgeTransferResult = {
      transferId: request.id,
      sourceSwarmId: request.sourceSwarmId,
      targetSwarmId: request.targetSwarmId,
      transferredPatterns,
      adaptationRequired: transferredPatterns.some(p => p.adaptationLevel !== 'none'),
      adaptationInstructions: this.generateAdaptationInstructions(transferredPatterns),
      transferEffectiveness: this.calculateTransferEffectiveness(transferredPatterns),
      potentialImprovements: this.identifyPotentialImprovements(transferredPatterns),
      transferredAt: new Date().toISOString()
    };

    return result;
  }

  private async getSwarmPatterns(swarmId: string): Promise<SuccessfulPattern[]> {
    const cluster = await this.swarmDatabaseManager.getSwarmCluster(swarmId);
    const patternVectors = await cluster.repositories.vectors.findBy({
      'metadata.type': 'implementation_pattern',
      'metadata.swarmId': swarmId
    });

    return patternVectors.map(pv => pv.metadata.pattern as SuccessfulPattern);
  }

  private async getPatternsByIds(swarmId: string, patternIds: string[]): Promise<SuccessfulPattern[]> {
    const cluster = await this.swarmDatabaseManager.getSwarmCluster(swarmId);
    const patterns: SuccessfulPattern[] = [];

    for (const patternId of patternIds) {
      const patternVectors = await cluster.repositories.vectors.findBy({
        'metadata.pattern.patternId': patternId
      });

      for (const pv of patternVectors) {
        patterns.push(pv.metadata.pattern as SuccessfulPattern);
      }
    }

    return patterns;
  }

  private extractSwarmExpertise(patterns: SuccessfulPattern[]): string[] {
    const expertiseAreas = new Set<string>();
    
    for (const pattern of patterns) {
      // Extract expertise from pattern context and description
      const words = (pattern.context + ' ' + pattern.description).toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 4 && !this.isCommonWord(word)) {
          expertiseAreas.add(word);
        }
      }
    }

    return Array.from(expertiseAreas).slice(0, 10); // Top 10 areas
  }

  private async generateSwarmRecommendations(
    targetSwarmId: string,
    sourceSwarmId: string,
    sourcePatterns: SuccessfulPattern[],
    targetExpertise: string[],
    options: { minRelevance: number; focusAreas: string[]; includeAdaptationGuidance: boolean }
  ): Promise<PatternRecommendation[]> {
    const recommendations: PatternRecommendation[] = [];

    for (const pattern of sourcePatterns) {
      const relevanceScore = this.calculatePatternRelevance(pattern, targetExpertise, options.focusAreas);
      
      if (relevanceScore < options.minRelevance) continue;

      const recommendation: PatternRecommendation = {
        patternId: pattern.patternId,
        sourceSwarmId,
        targetSwarmId,
        pattern,
        relevanceScore,
        adaptationComplexity: this.assessAdaptationComplexity(pattern),
        expectedImpact: this.calculateExpectedImpact(pattern, targetExpertise),
        reasoning: this.generateRecommendationReasoning(pattern, targetExpertise),
        prerequisites: this.identifyPrerequisites(pattern),
        riskFactors: this.identifyRiskFactors(pattern),
        implementationGuidance: options.includeAdaptationGuidance 
          ? this.generateImplementationGuidance(pattern, targetSwarmId)
          : []
      };

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  private async calculateSwarmPerformanceMetrics(
    swarmId: string,
    timeWindow: { start: Date; end: Date }
  ): Promise<SwarmPerformanceComparison['performanceMetrics']> {
    const cluster = await this.swarmDatabaseManager.getSwarmCluster(swarmId);
    
    // Get performance data for the time window
    const performanceData = await cluster.repositories.coordination.findBy({
      metricName: 'agent_performance',
      'metadata.timestamp': {
        $gte: timeWindow.start.toISOString(),
        $lte: timeWindow.end.toISOString()
      }
    });

    if (performanceData.length === 0) {
      return {
        averageTaskSuccessRate: 0,
        averageCompletionTime: 0,
        patternUtilizationRate: 0,
        knowledgeTransferRate: 0,
        adaptationSuccess: 0
      };
    }

    const avgSuccessRate = performanceData.reduce((sum, p) => sum + (p.metadata.successRate || 0), 0) / performanceData.length;
    const avgCompletionTime = performanceData.reduce((sum, p) => sum + (p.metadata.completionTime || 0), 0) / performanceData.length;

    // Get additional metrics
    const patternUsageData = await cluster.repositories.coordination.findBy({
      metricName: 'pattern_usage',
      'metadata.timestamp': {
        $gte: timeWindow.start.toISOString(),
        $lte: timeWindow.end.toISOString()
      }
    });

    const knowledgeTransferData = await cluster.repositories.coordination.findBy({
      metricName: 'pattern_adoption',
      'metadata.timestamp': {
        $gte: timeWindow.start.toISOString(),
        $lte: timeWindow.end.toISOString()
      }
    });

    return {
      averageTaskSuccessRate: avgSuccessRate,
      averageCompletionTime: avgCompletionTime,
      patternUtilizationRate: patternUsageData.length / Math.max(performanceData.length, 1),
      knowledgeTransferRate: knowledgeTransferData.length / Math.max(performanceData.length, 1),
      adaptationSuccess: knowledgeTransferData.length > 0 
        ? knowledgeTransferData.reduce((sum, kt) => sum + kt.metricValue, 0) / knowledgeTransferData.length
        : 0
    };
  }

  private calculateRelativePerformance(
    targetMetrics: SwarmPerformanceComparison['performanceMetrics'],
    comparisonMetrics: SwarmPerformanceComparison['performanceMetrics'][]
  ): SwarmPerformanceComparison['relativePerformance'] {
    if (comparisonMetrics.length === 0) return 'average';

    const avgSuccessRate = comparisonMetrics.reduce((sum, m) => sum + m.averageTaskSuccessRate, 0) / comparisonMetrics.length;
    const relativeSuccessRate = targetMetrics.averageTaskSuccessRate / avgSuccessRate;

    if (relativeSuccessRate >= 1.2) return 'excellent';
    if (relativeSuccessRate >= 1.1) return 'good';
    if (relativeSuccessRate >= 0.9) return 'average';
    if (relativeSuccessRate >= 0.8) return 'below_average';
    return 'poor';
  }

  private identifyImprovementOpportunities(
    targetMetrics: SwarmPerformanceComparison['performanceMetrics'],
    comparisonMetrics: { swarmId: string; metrics: SwarmPerformanceComparison['performanceMetrics'] }[]
  ): string[] {
    const opportunities: string[] = [];

    // Find areas where target is below average
    const avgSuccessRate = comparisonMetrics.reduce((sum, c) => sum + c.metrics.averageTaskSuccessRate, 0) / comparisonMetrics.length;
    if (targetMetrics.averageTaskSuccessRate < avgSuccessRate) {
      opportunities.push('Improve task success rate through pattern optimization');
    }

    const avgPatternUtilization = comparisonMetrics.reduce((sum, c) => sum + c.metrics.patternUtilizationRate, 0) / comparisonMetrics.length;
    if (targetMetrics.patternUtilizationRate < avgPatternUtilization) {
      opportunities.push('Increase pattern utilization for better performance');
    }

    if (targetMetrics.knowledgeTransferRate < 0.1) {
      opportunities.push('Engage more in knowledge sharing with other swarms');
    }

    return opportunities;
  }

  private async identifyKnowledgeExchangeOpportunities(
    targetSwarmId: string,
    compareWithSwarms: string[]
  ): Promise<string[]> {
    const opportunities: string[] = [];

    // For each comparison swarm, identify potential knowledge exchange opportunities
    for (const swarmId of compareWithSwarms) {
      const targetPatterns = await this.getSwarmPatterns(targetSwarmId);
      const sourcePatterns = await this.getSwarmPatterns(swarmId);

      const targetExpertise = this.extractSwarmExpertise(targetPatterns);
      const sourceExpertise = this.extractSwarmExpertise(sourcePatterns);

      // Find complementary expertise
      const uniqueSourceExpertise = sourceExpertise.filter(exp => !targetExpertise.includes(exp));
      if (uniqueSourceExpertise.length > 0) {
        opportunities.push(`Learn ${uniqueSourceExpertise.slice(0, 3).join(', ')} from ${swarmId}`);
      }
    }

    return opportunities.slice(0, 5); // Limit to top 5
  }

  private async analyzeSwarmKnowledgeNode(swarmId: string): Promise<SwarmKnowledgeNode> {
    const patterns = await this.getSwarmPatterns(swarmId);
    const expertise = this.extractSwarmExpertise(patterns);
    
    // Calculate knowledge strengths
    const knowledgeStrengths: Record<string, number> = {};
    for (const area of expertise) {
      const relevantPatterns = patterns.filter(p => 
        p.description.toLowerCase().includes(area) || p.context.toLowerCase().includes(area)
      );
      const avgSuccessRate = relevantPatterns.reduce((sum, p) => sum + p.successRate, 0) / relevantPatterns.length;
      knowledgeStrengths[area] = avgSuccessRate || 0;
    }

    // Identify learning needs (areas with low success rates)
    const learningNeeds = Object.entries(knowledgeStrengths)
      .filter(([, strength]) => strength < 0.7)
      .map(([area]) => area);

    return {
      swarmId,
      expertise,
      knowledgeStrengths,
      learningNeeds,
      sharingHistory: {}, // Would be populated from historical data
      receptivityScore: 0.8, // Would be calculated from adoption history
      contributionScore: patterns.length * 0.1, // Simple metric based on pattern count
      networkPosition: this.determineNetworkPosition(patterns.length, expertise.length),
      lastUpdated: new Date().toISOString()
    };
  }

  private updateNetworkPositions(networkNodes: Map<string, SwarmKnowledgeNode>): void {
    // Simple heuristic for network positions
    const nodes = Array.from(networkNodes.values());
    
    for (const node of nodes) {
      if (node.expertise.length >= 8 && node.contributionScore >= 1.0) {
        node.networkPosition = 'hub';
      } else if (node.expertise.length >= 5 && node.contributionScore >= 0.5) {
        node.networkPosition = 'connector';
      } else if (node.expertise.length >= 3) {
        node.networkPosition = 'specialist';
      } else {
        node.networkPosition = 'learner';
      }
    }
  }

  private async adaptPatternForTargetSwarm(
    pattern: SuccessfulPattern,
    sourceSwarmId: string,
    targetSwarmId: string,
    contextRequirements: Record<string, unknown>
  ): Promise<TransferredPattern> {
    // Analyze pattern for adaptation needs
    const adaptationLevel = this.assessPatternAdaptationLevel(pattern, contextRequirements);
    const adaptationChanges: string[] = [];
    
    let adaptedPattern = { ...pattern };

    // Apply adaptations based on context requirements
    if (adaptationLevel !== 'none') {
      adaptedPattern = await this.applyPatternAdaptations(pattern, contextRequirements, adaptationChanges);
    }

    const confidenceScore = this.calculateAdaptationConfidence(pattern, adaptationLevel, adaptationChanges);

    return {
      originalPattern: pattern,
      adaptedPattern,
      adaptationLevel,
      adaptationChanges,
      confidenceScore,
      recommendedUsage: this.generateRecommendedUsage(adaptedPattern, targetSwarmId)
    };
  }

  private async storeTransferredPatterns(targetSwarmId: string, transferredPatterns: TransferredPattern[]): Promise<void> {
    for (const tp of transferredPatterns) {
      // Store the adapted pattern as a vector
      const embedding = await this.vectorPatternDiscovery.generateEnhancedPatternEmbedding(
        tp.adaptedPattern,
        {
          swarmId: targetSwarmId,
          agentType: 'knowledge-transfer',
          taskComplexity: tp.adaptedPattern.usageCount,
          environmentContext: { transferred: true, adaptationLevel: tp.adaptationLevel }
        }
      );

      const cluster = await this.swarmDatabaseManager.getSwarmCluster(targetSwarmId);
      await cluster.repositories.vectors.addVectors([{
        id: `transferred_${tp.adaptedPattern.patternId}_${Date.now()}`,
        vector: embedding,
        metadata: {
          type: 'transferred_pattern',
          swarmId: targetSwarmId,
          pattern: tp.adaptedPattern,
          transferInfo: {
            originalPattern: tp.originalPattern,
            adaptationLevel: tp.adaptationLevel,
            confidenceScore: tp.confidenceScore,
            transferredAt: new Date().toISOString()
          }
        }
      }]);
    }
  }

  private calculatePatternRelevance(pattern: SuccessfulPattern, targetExpertise: string[], focusAreas: string[]): number {
    let relevance = 0.5; // Base relevance

    // Check overlap with target expertise
    const patternWords = (pattern.description + ' ' + pattern.context).toLowerCase().split(/\s+/);
    const expertiseOverlap = patternWords.filter(word => targetExpertise.includes(word)).length;
    relevance += (expertiseOverlap / Math.max(patternWords.length, 1)) * 0.3;

    // Check focus areas if specified
    if (focusAreas.length > 0) {
      const focusOverlap = patternWords.filter(word => focusAreas.includes(word)).length;
      relevance += (focusOverlap / Math.max(focusAreas.length, 1)) * 0.2;
    }

    // Pattern quality bonus
    relevance += pattern.successRate * 0.2;
    relevance += Math.min(pattern.usageCount / 10, 0.1);

    return Math.min(1, relevance);
  }

  private assessAdaptationComplexity(pattern: SuccessfulPattern): 'low' | 'medium' | 'high' {
    // Heuristics for adaptation complexity
    if (pattern.context.includes('generic') || pattern.context.includes('universal')) {
      return 'low';
    }
    
    if (pattern.context.includes('specific') || pattern.context.includes('custom')) {
      return 'high';
    }

    return 'medium';
  }

  private calculateExpectedImpact(pattern: SuccessfulPattern, targetExpertise: string[]): number {
    // Base impact on pattern success rate and usage
    let impact = pattern.successRate * 0.6;
    impact += Math.min(pattern.usageCount / 10, 0.4);

    // Boost if pattern addresses gap in target expertise
    const patternWords = (pattern.description + ' ' + pattern.context).toLowerCase().split(/\s+/);
    const novelty = patternWords.filter(word => !targetExpertise.includes(word) && word.length > 4).length;
    impact += Math.min(novelty / 10, 0.3);

    return Math.min(1, impact);
  }

  private generateRecommendationReasoning(pattern: SuccessfulPattern, targetExpertise: string[]): string[] {
    const reasons: string[] = [];

    if (pattern.successRate >= 0.8) {
      reasons.push(`High success rate (${Math.round(pattern.successRate * 100)}%) indicates reliability`);
    }

    if (pattern.usageCount >= 5) {
      reasons.push(`Proven effectiveness with ${pattern.usageCount} successful applications`);
    }

    const patternWords = (pattern.description + ' ' + pattern.context).toLowerCase().split(/\s+/);
    const novelWords = patternWords.filter(word => !targetExpertise.includes(word) && word.length > 4);
    if (novelWords.length > 0) {
      reasons.push(`Introduces new concepts: ${novelWords.slice(0, 3).join(', ')}`);
    }

    return reasons;
  }

  private identifyPrerequisites(pattern: SuccessfulPattern): string[] {
    const prerequisites: string[] = [];
    
    // Extract prerequisites from pattern context
    if (pattern.context.includes('require')) {
      prerequisites.push('Review pattern context for specific requirements');
    }
    
    if (pattern.description.includes('depend')) {
      prerequisites.push('Ensure dependent patterns or tools are available');
    }

    return prerequisites;
  }

  private identifyRiskFactors(pattern: SuccessfulPattern): string[] {
    const risks: string[] = [];
    
    if (pattern.successRate < 0.7) {
      risks.push('Lower success rate may indicate context sensitivity');
    }
    
    if (pattern.usageCount < 3) {
      risks.push('Limited usage history - effectiveness may vary');
    }

    return risks;
  }

  private generateImplementationGuidance(pattern: SuccessfulPattern, targetSwarmId: string): string[] {
    const guidance: string[] = [];
    
    guidance.push('Start with a pilot implementation to test effectiveness');
    guidance.push('Monitor success rate and adapt as needed');
    guidance.push(`Original context: ${pattern.context}`);
    
    if (pattern.usageCount >= 5) {
      guidance.push('Pattern has proven track record - follow original approach closely');
    } else {
      guidance.push('Limited usage history - be prepared to adapt significantly');
    }

    return guidance;
  }

  private assessPatternAdaptationLevel(pattern: SuccessfulPattern, contextRequirements: Record<string, unknown>): TransferredPattern['adaptationLevel'] {
    // Simple heuristic - would be more sophisticated in practice
    if (Object.keys(contextRequirements).length === 0) return 'none';
    if (Object.keys(contextRequirements).length <= 2) return 'minimal';
    if (Object.keys(contextRequirements).length <= 4) return 'moderate';
    return 'significant';
  }

  private async applyPatternAdaptations(
    pattern: SuccessfulPattern,
    contextRequirements: Record<string, unknown>,
    adaptationChanges: string[]
  ): Promise<SuccessfulPattern> {
    const adapted = { ...pattern };

    // Apply context-specific adaptations
    for (const [key, value] of Object.entries(contextRequirements)) {
      if (key === 'terminology' && typeof value === 'object') {
        // Replace terminology in description and context
        for (const [oldTerm, newTerm] of Object.entries(value)) {
          adapted.description = adapted.description.replace(new RegExp(oldTerm, 'gi'), newTerm as string);
          adapted.context = adapted.context.replace(new RegExp(oldTerm, 'gi'), newTerm as string);
          adaptationChanges.push(`Replaced ${oldTerm} with ${newTerm}`);
        }
      }
    }

    return adapted;
  }

  private calculateAdaptationConfidence(
    pattern: SuccessfulPattern,
    adaptationLevel: TransferredPattern['adaptationLevel'],
    adaptationChanges: string[]
  ): number {
    let confidence = pattern.successRate * 0.6;

    // Reduce confidence based on adaptation complexity
    switch (adaptationLevel) {
      case 'none':
        confidence += 0.4;
        break;
      case 'minimal':
        confidence += 0.3;
        break;
      case 'moderate':
        confidence += 0.2;
        break;
      case 'significant':
        confidence += 0.1;
        break;
    }

    // Reduce confidence based on number of changes
    confidence -= Math.min(adaptationChanges.length * 0.05, 0.2);

    return Math.max(0.1, Math.min(1, confidence));
  }

  private generateRecommendedUsage(pattern: SuccessfulPattern, targetSwarmId: string): string[] {
    const usage: string[] = [];
    
    usage.push(`Use for: ${pattern.context}`);
    usage.push(`Expected outcome: ${pattern.description}`);
    
    if (pattern.successRate >= 0.8) {
      usage.push('High confidence - suitable for critical tasks');
    } else {
      usage.push('Medium confidence - test in non-critical scenarios first');
    }

    return usage;
  }

  private generateAdaptationInstructions(transferredPatterns: TransferredPattern[]): string[] {
    const instructions: string[] = [];
    
    const needingAdaptation = transferredPatterns.filter(p => p.adaptationLevel !== 'none');
    if (needingAdaptation.length > 0) {
      instructions.push(`${needingAdaptation.length} patterns require adaptation`);
      instructions.push('Review adaptation changes before implementation');
      instructions.push('Monitor initial performance closely');
    }

    return instructions;
  }

  private calculateTransferEffectiveness(transferredPatterns: TransferredPattern[]): number {
    if (transferredPatterns.length === 0) return 0;
    
    const avgConfidence = transferredPatterns.reduce((sum, p) => sum + p.confidenceScore, 0) / transferredPatterns.length;
    return avgConfidence;
  }

  private identifyPotentialImprovements(transferredPatterns: TransferredPattern[]): string[] {
    const improvements: string[] = [];
    
    const lowConfidencePatterns = transferredPatterns.filter(p => p.confidenceScore < 0.6);
    if (lowConfidencePatterns.length > 0) {
      improvements.push(`Monitor ${lowConfidencePatterns.length} low-confidence patterns closely`);
    }

    const highAdaptationPatterns = transferredPatterns.filter(p => p.adaptationLevel === 'significant');
    if (highAdaptationPatterns.length > 0) {
      improvements.push(`Consider creating swarm-specific variants of ${highAdaptationPatterns.length} highly adapted patterns`);
    }

    return improvements;
  }

  private async updateKnowledgeNetworkFromAdoption(
    request: KnowledgeTransferRequest,
    metrics: unknown
  ): Promise<void> {
    // Update network nodes based on successful/failed adoptions
    const targetNode = this.knowledgeNetwork.get(request.targetSwarmId);
    const sourceNode = this.knowledgeNetwork.get(request.sourceSwarmId);

    if (targetNode && sourceNode) {
      // Update sharing history
      targetNode.sharingHistory[request.sourceSwarmId] = 
        (targetNode.sharingHistory[request.sourceSwarmId] || 0) + 1;
      
      sourceNode.contributionScore += metrics.averagePerformanceImprovement * 0.1;
      targetNode.receptivityScore = (targetNode.receptivityScore + metrics.patternsSuccessful / metrics.patternsAdopted) / 2;

      // Update network
      this.knowledgeNetwork.set(request.targetSwarmId, targetNode);
      this.knowledgeNetwork.set(request.sourceSwarmId, sourceNode);
    }
  }

  private determineNetworkPosition(patternCount: number, expertiseCount: number): SwarmKnowledgeNode['networkPosition'] {
    if (patternCount >= 20 && expertiseCount >= 8) return 'hub';
    if (patternCount >= 10 && expertiseCount >= 5) return 'connector';
    if (expertiseCount >= 3) return 'specialist';
    return 'learner';
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they'];
    return commonWords.includes(word);
  }
}

export default CrossSwarmKnowledgeSharing;