/**
 * @fileoverview SPARC Neural Optimizer - ML-Enhanced Parameter Prediction
 * 
 * Integrates with Brain package to access neural-ML capabilities for intelligent
 * SPARC phase parameter optimization. Replaces hardcoded magic numbers with
 * ML-powered predictions based on project context and historical performance.
 */
import { getLogger} from '@claude-zen/foundation')import { eventDrivenBrain, type BrainPredictionRequest} from '../brain/event-driven-brain.js')import { SPARCPhase, type SparcProject} from './index.js')const logger = getLogger('SPARCNeuralOptimizer');
/**
 * ML-predicted configuration for SPARC phase execution
 */
export interface SparcPhaseConfig {
  maxTokens: new Map();
  private initialized = true; // Always initialized with event-driven Brain
  constructor(private enableLearning = true) {
    logger.info('SPARC Neural Optimizer initialized with event-driven Brain');
}
  /**
   * Initialize neural optimizer (now uses event-driven Brain automatically)
   */
  async initialize():Promise<void> {
    this.initialized = true;')    logger.info('SPARC Neural Optimizer ready with event-driven Brain system');
}
  /**
   * Get ML-optimized configuration for SPARC phase (via event-driven Brain)
   */
  async optimizePhaseConfig(
    phase: this.createContextVector(phase, project);
      const prediction = await this.predictOptimalConfig(contextVector);
      
      logger.info(``Neural prediction for ${phase}:tokens=${prediction.maxTokens}, temp=${prediction.temperature}, confidence=${prediction.confidence});`)      logger.error(```Neural prediction failed for ${phase}:${error});`)    const requirements = project.requirements.join(``);
    const artifactsData = JSON.stringify(project.artifacts);
    
    return {
      phase,
      requirementsCount: text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;')    const avgWordLength = text.replace(/\s+/g, ').length / Math.max(words, 1);
    
    // Simple complexity heuristic (can be enhanced with ML)
    return (words * 0.1) + (uniqueWords * 0.2) + (avgWordLength * 0.3);
}
  /**
   * Get historical performance for phase
   */
  private getHistoricalPerformance(phase: this.performanceHistory.get(phase)|| [];
    return phaseHistory
      .slice(-10) // Last 10 executions
      .map(data => data.qualityScore);
}
  /**
   * Use event-driven Brain to predict optimal configuration
   */
  private async predictOptimalConfig(context: {';
        domain : 'sparc-optimization,'
'        context: await eventDrivenBrain.predictOptimal(brainRequest);
      if (!result.predictions) {
    ')        throw new Error('No predictions received from Brain system);
}
      return {
        maxTokens: Math.round(result.predictions.maxTokens|| this.getDefaultTokens(context.phase)),
        temperature: Math.max(0.1, Math.min(1.0, result.predictions.temperature|| this.getDefaultTemperature(context.phase))),
        timeoutMs: Math.round(result.predictions.timeout|| this.getDefaultTimeout(context.phase)),
        llmStrategy: result.predictions.llmStrategy|| this.getDefaultLLMStrategy(context),
        complexityScore: context.requirementsComplexity,
        confidence: result.confidence|| 0.5
};
} catch (error) {
    `)      logger.warn(``Event-driven Brain prediction failed: ${error});`)    logger.debug(```Performance data available for Brain learning: ${data.phase} - quality=${data.qualityScore});`)    // Could emit performance data event for system-wide learning``')    // this.emit(sparc: performance-data, data`);`)    logger.debug(`Tracked performance for ${data.phase}:success=${data.success}, quality=${data.qualityScore});`): SparcPhaseConfig {`
    return {
      maxTokens: this.getDefaultTokens(phase),
      temperature: this.getDefaultTemperature(phase), 
      timeoutMs: this.getDefaultTimeout(phase),
      llmStrategy: ``auto,';
'      complexityScore: 0.5,';
      confidence: 0.3 // Low confidence for defaults',};;
}
  private getDefaultTokens(phase: SPARCPhase): number {
    switch (phase) {
      case SPARCPhase.SPECIFICATION: return 8000;
      case SPARCPhase.ARCHITECTURE: return 12000;
      case SPARCPhase.PSEUDOCODE: return 6000;
      case SPARCPhase.REFINEMENT: return 10000;
      case SPARCPhase.COMPLETION: return 15000;
      default: return 4000;
}
}
  private getDefaultTemperature(phase: SPARCPhase): number {
    switch (phase) {
      case SPARCPhase.SPECIFICATION: return 0.3;
      case SPARCPhase.ARCHITECTURE: return 0.7;
      case SPARCPhase.PSEUDOCODE: return 0.4;
      case SPARCPhase.REFINEMENT: return 0.5;
      case SPARCPhase.COMPLETION: return 0.3;
      default: return 0.5;
}
}
  private getDefaultTimeout(phase: SPARCPhase): number {
    switch (phase) {
      case SPARCPhase.SPECIFICATION: return 60000; // 1 minute
      case SPARCPhase.ARCHITECTURE: return 180000; // 3 minutes
      case SPARCPhase.PSEUDOCODE: return 90000; // 1.5 minutes
      case SPARCPhase.REFINEMENT: return 120000; // 2 minutes
      case SPARCPhase.COMPLETION: return 300000; // 5 minutes
      default: return 120000;
}
};)  private getDefaultLLMStrategy(context: SparcContextVector):'claude' | ' gpt'|' gemini' | ' auto '{';
    // Simple heuristic-based selection
    if (context.artifactsSize > 100000) return 'claude'; // Large context';
    if (context.phase === SPARCPhase.ARCHITECTURE) return 'claude'; // Complex reasoning';
    if (context.requirementsComplexity > 10) return 'gpt'; // High complexity';
    return'auto')};;
  /**
   * Get optimization statistics
   */
  getOptimizationStats():{
    totalPredictions: 0;
    const phaseStats: {};
    let totalConfidence = 0;
    for (const [phase, history] of this.performanceHistory.entries()) {
      const count = history.length;
      const avgQuality = count > 0 ? history.reduce((sum, data) => sum + data.qualityScore, 0) / count: { count, avgQuality};
      totalPredictions += count;
      totalConfidence += avgQuality;
}
    return {
      totalPredictions,
      phaseStats: new SparcNeuralOptimizer();