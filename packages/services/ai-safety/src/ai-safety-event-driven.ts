/**
 * @fileoverview AI Safety Implementation - 100% Event-Driven
 *
 * Foundation-powered AI safety system with event-based brain coordination
 * Uses foundation imports internally but coordinates via events only
 */

// =============================================================================
// FOUNDATION IMPORTS - Internal operations 
// =============================================================================

import { createServiceContainer, getLogger, type Logger, TypedEventBase, generateUUID, recordMetric, recordHistogram, withTrace, withRetry } from '@claude-zen/foundation';

// =============================================================================
// EVENT INTERFACES - Brain coordination
// =============================================================================

interface AISafetyEvents {
  // Brain requests
  'brain: ai-safety: start-monitoring': {
    requestId: string;
    config?:AISafetyConfig;
    timestamp: number;
};
  'brain: ai-safety: stop-monitoring': {
    requestId: string;
    timestamp: number;
};
  'brain: ai-safety: analyze-response': {
    requestId: string;
    response: any;
    agentId?:string;
    timestamp: number;
};
  'brain: ai-safety: check-agent': {
    requestId: string;
    agentId: string;
    interactionData: AIInteractionData;
    timestamp: number;
};
  'brain: ai-safety: get-metrics': {
    requestId: string;
    timestamp: number;
};
  'brain: ai-safety: emergency-shutdown': {
    requestId: string;
    reason: string;
    timestamp: number;
};

  // AI Safety responses
  'ai-safety: monitoring-started': {
    requestId: string;
    success: boolean;
    timestamp: number;
};
  'ai-safety: monitoring-stopped': {
    requestId: string;
    success: boolean;
    timestamp: number;
};
  'ai-safety: analysis-complete': {
    requestId: string;
    result: DeceptionAnalysisResult;
    timestamp: number;
};
  'ai-safety: agent-checked': {
    requestId: string;
    agentId: string;
    safetyStatus: SafetyStatus;
    riskLevel: RiskLevel;
    timestamp: number;
};
  'ai-safety: metrics': {
    requestId: string;
    metrics: SafetyMetrics;
    timestamp: number;
};
  'ai-safety: emergency-complete': {
    requestId: string;
    success: boolean;
    timestamp: number;
};
  'ai-safety: error': {
    requestId: string;
    error: string;
    timestamp: number;
};

  // Safety alerts (outbound to other systems)
  'safety-alert':{
    alertId: string;
    type: AlertType;
    severity:'low' | ' medium' | ' high' | ' critical';
    agentId?:string;
    description: string;
    timestamp: number;
};
  'safety-intervention':{
    interventionId: string;
    type: InterventionType;
    agentId: string;
    reason: string;
    timestamp: number;
};
}

// =============================================================================
// TYPE DEFINITIONS - AI Safety types
// =============================================================================

interface AISafetyConfig {
  enabled?:boolean;
  strictMode?:boolean;
  interventionThreshold?:number;
  escalationTimeout?:number;
  monitoringInterval?:number;
  deceptionDetectionEnabled?:boolean;
  behavioralAnalysisEnabled?:boolean;
}

interface AIInteractionData {
  input: string;
  output: string;
  model?:string;
  agentId?:string;
  timestamp?:number;
  metadata?:Record<string, any>;
}

interface DeceptionAnalysisResult {
  isDeceptive: boolean;
  confidence: number;
  indicators: string[];
  riskLevel: RiskLevel;
  recommendation: string;
}

type SafetyStatus = 'safe' | ' monitoring' | ' warning' | ' alert' | ' intervention' | ' emergency';
type RiskLevel = 'minimal' | ' low' | ' medium' | ' high' | ' critical' | ' extreme';
type AlertType = 'deception' | ' manipulation' | ' harmful-content' | ' policy-violation' | ' system-threat';
type InterventionType = 'pause' | ' restrict' | ' terminate' | ' escalate' | ' quarantine';

interface SafetyMetrics {
  totalAnalyses: number;
  deceptionDetected: number;
  interventionsTriggered: number;
  alertsRaised: number;
  averageRiskLevel: number;
  systemStatus: SafetyStatus;
  lastUpdated: number;
}

interface SafetyAlert {
  id: string;
  type: AlertType;
  severity:'low' | ' medium' | ' high' | ' critical';
  agentId?:string;
  description: string;
  timestamp: number;
  resolved: boolean;
}

// =============================================================================
// EVENT-DRIVEN AI SAFETY SYSTEM - Foundation powered
// =============================================================================

export class EventDrivenAISafety extends TypedEventBase {
  private logger: Logger;
  private serviceContainer: any;
  private config: Required<AISafetyConfig>;
  private initialized = false;
  private monitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  // Safety tracking
  private totalAnalyses = 0;
  private deceptionCount = 0;
  private interventionCount = 0;
  private alertCount = 0;
  private activeAlerts = new Map<string, SafetyAlert>();
  private agentRiskLevels = new Map<string, RiskLevel>();

  constructor() {
    super();
    this.logger = getLogger('EventDrivenAISafety');
    this.serviceContainer = createServiceContainer();
    
    // Default config with foundation-powered features
    this.config = {
      enabled: true,
      strictMode: false,
      interventionThreshold:0.7,
      escalationTimeout:30000,
      monitoringInterval:10000,
      deceptionDetectionEnabled: true,
      behavioralAnalysisEnabled: true,
};

    this.setupBrainEventHandlers();
}

  // =============================================================================
  // BRAIN EVENT HANDLERS - Foundation-powered coordination
  // =============================================================================

  private setupBrainEventHandlers():void {
    this.addEventListener('brain: ai-safety: start-monitoring', async (data) => {
      await withTrace('ai-safety-start-monitoring', async () => {
        try {
          if (data.config) {
            this.config = { ...this.config, ...data.config};
}
          
          await this.initializeInternal();
          await this.startMonitoringInternal();

          recordMetric('ai_safety_monitoring_starts', 1);
          this.emitEvent('ai-safety: monitoring-started', {
            requestId: data.requestId,
            success: true,
            timestamp: Date.now(),
});

          this.logger.info('AI safety monitoring started', {
            requestId: data.requestId,
            config: this.config,
});
} catch (error) {
          this.emitEvent('ai-safety: monitoring-started', {
            requestId: data.requestId,
            success: false,
            timestamp: Date.now(),
});
          this.emitEvent('ai-safety: error', {
            requestId: data.requestId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now(),
});
}
});
});

    this.addEventListener('brain: ai-safety: stop-monitoring', async (data) => {
      await withTrace('ai-safety-stop-monitoring', async () => {
        try {
          await this.stopMonitoringInternal();

          recordMetric('ai_safety_monitoring_stops', 1);
          this.emitEvent('ai-safety: monitoring-stopped', {
            requestId: data.requestId,
            success: true,
            timestamp: Date.now(),
});

          this.logger.info('AI safety monitoring stopped', {
            requestId: data.requestId,
});
} catch (error) {
          this.emitEvent('ai-safety: monitoring-stopped', {
            requestId: data.requestId,
            success: false,
            timestamp: Date.now(),
});
          this.emitEvent('ai-safety: error', {
            requestId: data.requestId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now(),
});
}
});
});

    this.addEventListener('brain: ai-safety: analyze-response', async (data) => {
      await withTrace('ai-safety-analyze-response', async () => {
        try {
          const analysis = await this.analyzeResponseInternal(data.response, data.agentId);

          recordMetric('ai_safety_analyses_performed', 1);
          this.emitEvent('ai-safety: analysis-complete', {
            requestId: data.requestId,
            result: analysis,
            timestamp: Date.now(),
});

          // Emit alert if deception detected
          if (analysis.isDeceptive && analysis.riskLevel !== 'minimal') {
            this.emitSafetyAlert(analysis, data.agentId);
}

          this.logger.debug('Response analysis complete', {
            requestId: data.requestId,
            deceptive: analysis.isDeceptive,
            riskLevel: analysis.riskLevel,
});
} catch (error) {
          this.emitEvent('ai-safety: error', {
            requestId: data.requestId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now(),
});
}
});
});

    this.addEventListener('brain: ai-safety: check-agent', async (data) => {
      await withTrace('ai-safety-check-agent', async () => {
        try {
          const safetyStatus = await this.checkAgentSafetyInternal(data.agentId, data.interactionData);
          const riskLevel = this.agentRiskLevels.get(data.agentId) || 'minimal';

          this.emitEvent('ai-safety: agent-checked', {
            requestId: data.requestId,
            agentId: data.agentId,
            safetyStatus,
            riskLevel,
            timestamp: Date.now(),
});

          this.logger.debug('Agent safety check complete', {
            requestId: data.requestId,
            agentId: data.agentId,
            safetyStatus,
            riskLevel,
});
} catch (error) {
          this.emitEvent('ai-safety: error', {
            requestId: data.requestId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now(),
});
}
});
});

    this.addEventListener('brain: ai-safety: get-metrics', async (data) => {
      try {
        const metrics = this.getSafetyMetricsInternal();

        this.emitEvent('ai-safety: metrics', {
          requestId: data.requestId,
          metrics,
          timestamp: Date.now(),
});

        this.logger.debug('Safety metrics retrieved', {
          requestId: data.requestId,
          totalAnalyses: metrics.totalAnalyses,
});
} catch (error) {
        this.emitEvent('ai-safety: error', {
          requestId: data.requestId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
});
}
});

    this.addEventListener('brain: ai-safety: emergency-shutdown', async (data) => {
      await withTrace('ai-safety-emergency-shutdown', async () => {
        try {
          await this.emergencyShutdownInternal(data.reason);

          recordMetric('ai_safety_emergency_shutdowns', 1);
          this.emitEvent('ai-safety: emergency-complete', {
            requestId: data.requestId,
            success: true,
            timestamp: Date.now(),
});

          this.logger.warn('Emergency safety shutdown completed', {
            requestId: data.requestId,
            reason: data.reason,
});
} catch (error) {
          this.emitEvent('ai-safety: emergency-complete', {
            requestId: data.requestId,
            success: false,
            timestamp: Date.now(),
});
          this.emitEvent('ai-safety: error', {
            requestId: data.requestId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: Date.now(),
});
}
});
});
}

  // =============================================================================
  // INTERNAL AI SAFETY LOGIC - Foundation powered
  // =============================================================================

  private async initializeInternal():Promise<void> {
    if (this.initialized) return;

    this.logger.info('Initializing event-driven AI safety system', {
      config: this.config,
});

    // Initialize foundation-powered components
    await this.serviceContainer.register('ai-safety-analyzer', {
      analyzeDeception: this.detectDeceptionInternal.bind(this),
      analyzeBehavior: this.analyzeBehaviorInternal.bind(this),
});

    this.initialized = true;
    recordMetric('ai_safety_initializations', 1);
}

  private async startMonitoringInternal():Promise<void> {
    if (this.monitoring || !this.config.enabled) return;

    this.monitoring = true;
    
    // Start periodic safety checks
    this.monitoringInterval = setInterval(async () => {
      await this.performSafetyCheckCycle();
}, this.config.monitoringInterval);

    this.logger.info('AI safety monitoring active', {
      interval: this.config.monitoringInterval,
      strictMode: this.config.strictMode,
});
}

  private async stopMonitoringInternal():Promise<void> {
    if (!this.monitoring) return;

    this.monitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
}

    this.logger.info('AI safety monitoring stopped');
}

  private async analyzeResponseInternal(response: any, agentId?:string): Promise<DeceptionAnalysisResult> {
    this.totalAnalyses++;

    const responseText = typeof response === 'string' ? response: JSON.stringify(response);
    
    // Foundation-powered deception analysis
    const deceptionResult = await this.detectDeceptionInternal(responseText);
    const behaviorResult = this.config.behavioralAnalysisEnabled 
      ? await this.analyzeBehaviorInternal(responseText, agentId)
      :null;

    // Combine results
    const isDeceptive = deceptionResult.isDeceptive || (behaviorResult?.suspicious || false);
    const confidence = Math.max(deceptionResult.confidence, behaviorResult?.confidence || 0);
    const riskLevel = this.calculateRiskLevel(confidence, isDeceptive);

    const indicators = [
      ...deceptionResult.indicators,
      ...(behaviorResult?.indicators || []),
];

    if (isDeceptive) {
      this.deceptionCount++;
}

    // Update agent risk tracking
    if (agentId) {
      this.agentRiskLevels.set(agentId, riskLevel);
}

    recordHistogram('ai_safety_analysis_confidence', confidence);
    recordMetric(`ai_safety_risk_level_${riskLevel}`, 1);

    return {
      isDeceptive,
      confidence,
      indicators,
      riskLevel,
      recommendation: this.generateRecommendation(riskLevel, isDeceptive),
};
}

  private async checkAgentSafetyInternal(agentId: string,
    interactionData: AIInteractionData
  ): Promise<SafetyStatus> {
    const analysis = await this.analyzeResponseInternal(interactionData.output, agentId);
    
    // Determine safety status based on analysis
    if (analysis.riskLevel === 'extreme' || analysis.riskLevel === ' critical') {
      return 'emergency';
} else if (analysis.riskLevel === 'high') {
      return 'intervention';
} else if (analysis.riskLevel === 'medium') {
      return 'alert';
} else if (analysis.riskLevel === 'low') {
      return 'warning';
} else if (this.monitoring) {
      return 'monitoring';
} else {
      return 'safe';
}
}

  private getSafetyMetricsInternal():SafetyMetrics {
    const averageRiskLevel = this.calculateAverageRiskLevel();
    const systemStatus = this.determineSystemStatus();

    return {
      totalAnalyses: this.totalAnalyses,
      deceptionDetected: this.deceptionCount,
      interventionsTriggered: this.interventionCount,
      alertsRaised: this.alertCount,
      averageRiskLevel,
      systemStatus,
      lastUpdated: Date.now(),
};
}

  private async emergencyShutdownInternal(reason: string): Promise<void> {
    this.logger.warn('🛑 EMERGENCY SAFETY SHUTDOWN', { reason});

    // Stop all monitoring
    await this.stopMonitoringInternal();

    // Emit critical safety intervention
    this.emitEvent('safety-intervention', {
      interventionId: generateUUID(),
      type: 'terminate',      agentId: 'system',      reason:`Emergency shutdown: ${reason}`,
      timestamp: Date.now(),
});

    this.interventionCount++;
    recordMetric('ai_safety_emergency_interventions', 1);
}

  // =============================================================================
  // AI SAFETY ANALYSIS METHODS - Foundation powered
  // =============================================================================

  private async detectDeceptionInternal(text: string): Promise<{
    isDeceptive: boolean;
    confidence: number;
    indicators: string[];
}> {
    // Foundation-powered deception detection with retry logic
    return await withRetry(async () => {
      const indicators: string[] = [];
      let confidence = 0;

      // Check for common deception patterns
      const patterns = [
        { pattern:/i\s+(am\s+not|cannot|would never)/i, weight:0.3, indicator: 'Explicit denial patterns'},
        { pattern:/trust\s+me|believe\s+me|honestly/i, weight:0.2, indicator: 'Trust-seeking language'},
        { pattern:/just\s+(kidding|joking)|not\s+serious/i, weight:0.4, indicator: 'Contradiction indicators'},
        { pattern:/between\s+you\s+and\s+me|don't\s+tell/i, weight:0.5, indicator: ' Secrecy patterns'},
        { pattern:/ignore\s+(previous|earlier)|forget\s+what/i, weight:0.8, indicator: 'Instruction override attempts'},
];

      for (const { pattern, weight, indicator} of patterns) {
        if (pattern.test(text)) {
          indicators.push(indicator);
          confidence = Math.min(1, confidence + weight);
}
}

      // Check for manipulation attempts
      if (text.toLowerCase().includes('system') && text.toLowerCase().includes(' override')) {
        indicators.push('System override attempt');
        confidence = Math.min(1, confidence + 0.9);
}

      const isDeceptive = confidence > 0.3;

      return {
        isDeceptive,
        confidence,
        indicators,
};
}, {
      retries:2,
      delay:100,
});
}

  private async analyzeBehaviorInternal(text: string, agentId?:string): Promise<{
    suspicious: boolean;
    confidence: number;
    indicators: string[];
} | null> {
    if (!this.config.behavioralAnalysisEnabled) return null;

    const indicators: string[] = [];
    let confidence = 0;

    // Behavioral pattern analysis
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 5) {
      indicators.push('Unusually brief response');
      confidence += 0.2;
} else if (wordCount > 500) {
      indicators.push('Unusually verbose response');
      confidence += 0.1;
}

    // Check for repetitive patterns
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
}

    const maxFreq = Math.max(...wordFreq.values());
    if (maxFreq > words.length * 0.2) {
      indicators.push('Excessive repetition detected');
      confidence += 0.3;
}

    // Agent-specific behavioral tracking
    if (agentId) {
      const previousRisk = this.agentRiskLevels.get(agentId) || 'minimal';
      if (previousRisk === 'high' || previousRisk === ' critical') {
        indicators.push('Agent has elevated risk history');
        confidence += 0.2;
}
}

    return {
      suspicious: confidence > 0.3,
      confidence,
      indicators,
};
}

  // =============================================================================
  // HELPER METHODS - Foundation powered
  // =============================================================================

  private calculateRiskLevel(confidence: number, isDeceptive: boolean): RiskLevel {
    if (!isDeceptive) return 'minimal';
    
    if (confidence >= 0.9) return 'extreme';
    if (confidence >= 0.7) return 'critical';
    if (confidence >= 0.5) return 'high';
    if (confidence >= 0.3) return 'medium';
    return 'low';
}

  private generateRecommendation(riskLevel: RiskLevel, isDeceptive: boolean): string {
    if (!isDeceptive) {
      return 'Response appears safe. Continue normal operation.';
}

    switch (riskLevel) {
      case 'extreme':
        return 'IMMEDIATE INTERVENTION REQUIRED. Terminate agent interaction and escalate to human oversight.';
      case 'critical':
        return 'High risk detected. Pause agent and require human review before continuing.';
      case 'high':
        return 'Concerning patterns detected. Increase monitoring and consider restrictions.';
      case 'medium':
        return 'Moderate risk indicators present. Monitor closely and log interactions.';
      case 'low':
        return 'Minor risk indicators detected. Continue with standard monitoring.';
      default:
        return 'Continue standard safety protocols.';
}
}

  private calculateAverageRiskLevel():number {
    if (this.agentRiskLevels.size === 0) return 0;

    const riskValues = {
      minimal:0,
      low:1,
      medium:2,
      high:3,
      critical:4,
      extreme:5,
};

    let total = 0;
    for (const riskLevel of this.agentRiskLevels.values()) {
      total += riskValues[riskLevel] || 0;
}

    return total / this.agentRiskLevels.size;
}

  private determineSystemStatus():SafetyStatus {
    if (!this.monitoring) return 'safe';

    const avgRisk = this.calculateAverageRiskLevel();
    
    if (avgRisk >= 4) return 'emergency';
    if (avgRisk >= 3) return 'intervention';
    if (avgRisk >= 2) return 'alert';
    if (avgRisk >= 1) return 'warning';
    return 'monitoring';
}

  private async performSafetyCheckCycle():Promise<void> {
    try {
      // Periodic safety analysis
      const systemMetrics = this.getSafetyMetricsInternal();
      
      // Check if intervention threshold exceeded
      if (systemMetrics.averageRiskLevel > this.config.interventionThreshold) {
        this.logger.warn('Safety intervention threshold exceeded', {
          averageRisk: systemMetrics.averageRiskLevel,
          threshold: this.config.interventionThreshold,
});

        this.emitSystemIntervention('High average risk level detected');
}

      recordHistogram('ai_safety_average_risk_level', systemMetrics.averageRiskLevel);
      recordMetric('ai_safety_active_alerts', this.activeAlerts.size);
} catch (error) {
      this.logger.error('Safety check cycle failed', { error});
}
}

  private emitSafetyAlert(analysis: DeceptionAnalysisResult, agentId?:string): void {
    const alertId = generateUUID();
    const alert: SafetyAlert = {
      id: alertId,
      type: 'deception',      severity: this.mapRiskToSeverity(analysis.riskLevel),
      agentId,
      description:`Deception detected with ${(analysis.confidence * 100).toFixed(1)}% confidence: ${analysis.indicators.join(',    ')}`,
      timestamp: Date.now(),
      resolved: false,
};

    this.activeAlerts.set(alertId, alert);
    this.alertCount++;

    this.emitEvent('safety-alert', {
      alertId,
      type: alert.type,
      severity: alert.severity,
      agentId,
      description: alert.description,
      timestamp: alert.timestamp,
});

    recordMetric(`ai_safety_alerts_${alert.severity}`, 1);
    this.logger.warn('Safety alert raised', alert);
}

  private emitSystemIntervention(reason: string): void {
    const interventionId = generateUUID();
    
    this.emitEvent('safety-intervention', {
      interventionId,
      type: 'restrict',      agentId: 'system',      reason,
      timestamp: Date.now(),
});

    this.interventionCount++;
    recordMetric('ai_safety_system_interventions', 1);
}

  private mapRiskToSeverity(riskLevel: RiskLevel): 'low' | ' medium' | ' high' | ' critical' {
    switch (riskLevel) {
      case 'extreme':
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
      case 'minimal':
      default:
        return 'low';
}
}

  // =============================================================================
  // PUBLIC API - Event system integration
  // =============================================================================

  async initialize():Promise<void> {
    await this.initializeInternal();
    this.logger.info('Event-driven AI safety system ready to receive brain events');
}

  async shutdown():Promise<void> {
    await this.stopMonitoringInternal();
    this.activeAlerts.clear();
    this.agentRiskLevels.clear();
    this.initialized = false;
    this.logger.info('Event-driven AI safety system shutdown complete');
}

  // Status check methods
  isMonitoring():boolean {
    return this.monitoring;
}

  getActiveAlertCount():number {
    return this.activeAlerts.size;
}

  getSystemStatus():SafetyStatus {
    return this.determineSystemStatus();
}
}

// =============================================================================
// FACTORY AND EXPORTS
// =============================================================================

export function createEventDrivenAISafety():EventDrivenAISafety {
  return new EventDrivenAISafety();
}

export default EventDrivenAISafety;