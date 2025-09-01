/**
 * @fileoverview AI Safety Implementation - 100% Event-Driven
 *
 * Foundation-powered AI safety system with event-based brain coordination
 * Uses foundation imports internally but coordinates via events only
 */

// =============================================================================
// FOUNDATION IMPORTS - Internal operations
// =============================================================================

import {
  createServiceContainer,
  getLogger,
  type Logger,
  TypedEventBase,
  generateUUID,
  recordMetric,
  recordHistogram,
  withTrace,
  withRetry,
} from '@claude-zen/foundation';

// =============================================================================
// EVENT INTERFACES - Brain coordination (moved after type definitions)
// =============================================================================

interface AISafetyConfig {
  enabled?: boolean;
  strictMode?: boolean;
  interventionThreshold?: number;
  escalationTimeout?: number;
  monitoringInterval?: number;
  deceptionDetectionEnabled?: boolean;
  behavioralAnalysisEnabled?: boolean;
}

interface AIInteractionData {
  input: string;
  output: string;
  model?: string;
  agentId?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

interface DeceptionAnalysisResult {
  isDeceptive: boolean;
  confidence: number;
  indicators: string[];
  riskLevel: RiskLevel;
  recommendation: string;
}

type SafetyStatus =
  | 'safe'
  | ' monitoring'
  | ' warning'
  | ' alert'
  | ' intervention'
  | ' emergency';
type RiskLevel =
  | 'minimal'
  | ' low'
  | ' medium'
  | ' high'
  | ' critical'
  | ' extreme';
type AlertType =
  | 'deception'
  | ' manipulation'
  | ' harmful-content'
  | ' policy-violation'
  | ' system-threat';
type InterventionType =
  | 'pause'
  | ' restrict'
  | ' terminate'
  | ' escalate'
  | ' quarantine';

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
  severity: 'low' | ' medium' | ' high' | ' critical';
  agentId?: string;
  description: string;
  timestamp: number;
  resolved: boolean;
}

// =============================================================================
// EVENT-DRIVEN AI SAFETY SYSTEM - Foundation powered
// =============================================================================

export class EventDrivenAISafety extends TypedEventBase {
  private logger: Logger;
  private serviceContainer: ReturnType<typeof createServiceContainer>;
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
      interventionThreshold: 0.7,
      escalationTimeout: 30000,
      monitoringInterval: 10000,
      deceptionDetectionEnabled: true,
      behavioralAnalysisEnabled: true,
    };

    // Split event handler registration into smaller methods
    this.registerBrainEventHandlers();
  }

  private registerBrainEventHandlers(): void {
    this.registerStartMonitoringHandler();
    this.registerStopMonitoringHandler();
    this.registerAnalyzeResponseHandler();
    this.registerCheckAgentHandler();
    this.registerGetMetricsHandler();
    this.registerEmergencyShutdownHandler();
  }

  private registerStartMonitoringHandler(): void {
    this.addEventListener(
      'brain: ai-safety: start-monitoring',
      async (data) => {
        await withTrace('ai-safety-start-monitoring', async () => {
          try {
            if (data.config) {
              this.config = { ...this.config, ...data.config };
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
      }
    );
  }

  private registerStopMonitoringHandler(): void {
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
  }

  private registerAnalyzeResponseHandler(): void {
    this.addEventListener(
      'brain: ai-safety: analyze-response',
      async (data) => {
        await withTrace('ai-safety-analyze-response', async () => {
          try {
            const analysis = await this.analyzeResponseInternal(
              data.response,
              data.agentId
            );

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
            this.emitEvent('ai-safety: analysis-error', {
              requestId: data.requestId,
              error: error instanceof Error ? error.message : String(error),
              timestamp: Date.now(),
            });
          }
        });
      }
    );
  }

  private registerCheckAgentHandler(): void {
    this.addEventListener('brain: ai-safety: check-agent', async (data) => {
      await withTrace('ai-safety-check-agent', async () => {
        try {
          const safetyStatus = await this.checkAgentSafetyInternal(
            data.agentId,
            data.interactionData
          );
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
  }

  private registerGetMetricsHandler(): void {
    // Remove unnecessary async keyword
    this.addEventListener('brain: ai-safety: get-metrics', (data) => {
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
  }

  private registerEmergencyShutdownHandler(): void {
    this.addEventListener(
      'brain: ai-safety: emergency-shutdown',
      async (data) => {
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
      }
    );
  }
          this.logger.debug('Agent safety check complete', {
  // =============================================================================
  // INTERNAL AI SAFETY LOGIC - Foundation powered
  // =============================================================================         safetyStatus,
            riskLevel,
  private async initializeInternal(): Promise<void> {
    if (this.initialized) return;
          this.emitEvent('ai-safety: error', {
    this.logger.info('Initializing event-driven AI safety system', {.requestId,
      config: this.config,            error: error instanceof Error ? error.message : String(error),
    });

    // Initialize foundation-powered components
    await this.serviceContainer.register('ai-safety-analyzer', {
      analyzeDeception: this.detectDeceptionInternal.bind(this),    });
      analyzeBehavior: this.analyzeBehaviorInternal.bind(this),
    });t-metrics', async (data) => {

    this.initialized = true; const metrics = this.getSafetyMetricsInternal();
    recordMetric('ai_safety_initializations', 1);
  }        this.emitEvent('ai-safety: metrics', {

  private async startMonitoringInternal(): Promise<void> {
    if (this.monitoring || !this.config.enabled) return;          timestamp: Date.now(),

    this.monitoring = true;
metrics retrieved', {
    // Start periodic safety checks
    this.monitoringInterval = setInterval(async () => {lAnalyses,
      await this.performSafetyCheckCycle();   });
    }, this.config.monitoringInterval);      } catch (error) {

    this.logger.info('AI safety monitoring active', {       requestId: data.requestId,
      interval: this.config.monitoringInterval,          error: error instanceof Error ? error.message : String(error),
      strictMode: this.config.strictMode,
    });
  }

  private async stopMonitoringInternal(): Promise<void> {
    if (!this.monitoring) return;    this.addEventListener(
 emergency-shutdown',
    this.monitoring = false;
        await withTrace('ai-safety-emergency-shutdown', async () => {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
his.emitEvent('ai-safety: emergency-complete', {
    this.logger.info('AI safety monitoring stopped');              requestId: data.requestId,
  } true,
: Date.now(),
  private async analyzeResponseInternal(
    response: any,
    agentId?: stringrgency safety shutdown completed', {
  ): Promise<DeceptionAnalysisResult> {Id,
    this.totalAnalyses++;        reason: `Emergency shutdown: ${reason}`,
    const responseText =          } catch (error) {
      typeof response === 'string' ? response : JSON.stringify(response);nt('ai-safety: emergency-complete', {
tId,
    // Foundation-powered deception analysis
    const deceptionResult = await this.detectDeceptionInternal(responseText);        timestamp: Date.now(),
    const behaviorResult = this.config.behavioralAnalysisEnabled            });
      ? await this.analyzeBehaviorInternal(responseText, agentId)vent('ai-safety: error', {
      : null;a.requestId,
         error: error instanceof Error ? error.message : String(error),
    // Combine results              timestamp: Date.now(),
    const isDeceptive =
      deceptionResult.isDeceptive || behaviorResult?.suspicious || false;
    const confidence = Math.max(
      deceptionResult.confidence, }
      behaviorResult?.confidence || 0    );
    );
    const riskLevel = this.calculateRiskLevel(confidence, isDeceptive);
  // =============================================================================
    const indicators = [L AI SAFETY LOGIC - Foundation powered
      ...deceptionResult.indicators,================================================================
      ...(behaviorResult?.indicators || []),
    ];nitializeInternal(): Promise<void> {
tialized) return;
    if (isDeceptive) {
      this.deceptionCount++;is.logger.info('Initializing event-driven AI safety system', {
    }   config: this.config,
    });
    // Update agent risk tracking
    if (agentId) {undation-powered components
      this.agentRiskLevels.set(agentId, riskLevel);er('ai-safety-analyzer', {
    }.detectDeceptionInternal.bind(this),
(this),
    recordHistogram('ai_safety_analysis_confidence', confidence);
    recordMetric(`ai_safety_risk_level_${riskLevel}`, 1);
is.initialized = true;
    return {    recordMetric('ai_safety_initializations', 1);
      isDeceptive,
      confidence,
      indicators,: Promise<void> {
      riskLevel,enabled) return;
      recommendation: this.generateRecommendation(riskLevel, isDeceptive),
    };e;
  }
 checks
  private async checkAgentSafetyInternal() => {
    agentId: string,ormSafetyCheckCycle();
    interactionData: AIInteractionData
  ): Promise<SafetyStatus> {
    const analysis = await this.analyzeResponseInternal(onitoring active', {
      interactionData.output,g.monitoringInterval,
      agentIdMode: this.config.strictMode,
    );

    // Determine safety status based on analysis
    if (  private async stopMonitoringInternal(): Promise<void> {
      analysis.riskLevel === 'extreme' ||
      analysis.riskLevel === ' critical'
    ) {
      return 'emergency';
    } else if (analysis.riskLevel === 'high') {.monitoringInterval) {
      return 'intervention';val);
    } else if (analysis.riskLevel === 'medium') {
      return 'alert';
    } else if (analysis.riskLevel === 'low') {
      return 'warning';I safety monitoring stopped');
    } else if (this.monitoring) {
      return 'monitoring';
    } else {ate async analyzeResponseInternal(
      return 'safe'; response: any,
    }    agentId?: string

  private getSafetyMetricsInternal(): SafetyMetrics {
    const averageRiskLevel = this.calculateAverageRiskLevel();
    const systemStatus = this.determineSystemStatus();ponse : JSON.stringify(response);

    return {ysis
      totalAnalyses: this.totalAnalyses,ctDeceptionInternal(responseText);
      deceptionDetected: this.deceptionCount,g.behavioralAnalysisEnabled
      interventionsTriggered: this.interventionCount,zeBehaviorInternal(responseText, agentId)
      alertsRaised: this.alertCount,
      averageRiskLevel,
      systemStatus,
      lastUpdated: Date.now(),st isDeceptive =
    };      deceptionResult.isDeceptive || behaviorResult?.suspicious || false;
  }ax(

  private async emergencyShutdownInternal(reason: string): Promise<void> {   behaviorResult?.confidence || 0
    this.logger.warn(' EMERGENCY SAFETY SHUTDOWN', { reason });    );

    // Stop all monitoring
    await this.stopMonitoringInternal();
      ...deceptionResult.indicators,
    // Emit critical safety intervention
    this.emitEvent('safety-intervention', {
      interventionId: generateUUID(),
      type: 'terminate',
      agentId: 'system',this.deceptionCount++;
      reason: `Emergency shutdown: ${reason}`,
      timestamp: Date.now(),
    }); risk tracking

    this.interventionCount++;set(agentId, riskLevel);
    recordMetric('ai_safety_emergency_interventions', 1);    }
  }
fety_analysis_confidence', confidence);
  // =============================================================================etric(`ai_safety_risk_level_${riskLevel}`, 1);
  // AI SAFETY ANALYSIS METHODS - Foundation powered
  // =============================================================================

  private async detectDeceptionInternal(text: string): Promise<{ence,
    isDeceptive: boolean;ators,
    confidence: number;
    indicators: string[];is.generateRecommendation(riskLevel, isDeceptive),
  }> {
    // Foundation-powered deception detection with retry logic
    return await withRetry(
      async () => {
        const indicators: string[] = [];
        let confidence = 0;
<SafetyStatus> {
        // Check for common deception patternsnalysis = await this.analyzeResponseInternal(
        const patterns = [
          {
            pattern: /i\s+(am\s+not|cannot|would never)/i,
            weight: 0.3,
            indicator: 'Explicit denial patterns',rmine safety status based on analysis
          },
          { === 'extreme' ||
            pattern: /trust\s+me|believe\s+me|honestly/i,
            weight: 0.2,
            indicator: 'Trust-seeking language',
          },
          {
            pattern: /just\s+(kidding|joking)|not\s+serious/i,
            weight: 0.4,
            indicator: 'Contradiction indicators',
          },
          {
            pattern: /between\s+you\s+and\s+me|don't\s+tell/i,
            weight: 0.5,
            indicator: 'Secrecy patterns',
          },
          {
            pattern: /ignore\s+(previous|earlier)|forget\s+what/i,
            weight: 0.8,
            indicator: 'Instruction override attempts',
          },
        ];
            indicator: 'Instruction override attempts',kLevel();
          }, systemStatus = this.determineSystemStatus();
        ];

        for (const { pattern, weight, indicator } of patterns) {      totalAnalyses: this.totalAnalyses,
          if (pattern.test(text)) {etected: this.deceptionCount,
            indicators.push(indicator);ggered: this.interventionCount,
            confidence = Math.min(1, confidence + weight);his.alertCount,
          }l,
        }emStatus,
stUpdated: Date.now(),
        // Check for manipulation attempts
        if (
          text.toLowerCase().includes('system') &&
          text.toLowerCase().includes(' override')te async emergencyShutdownInternal(reason: string): Promise<void> {
        ) {is.logger.warn(' EMERGENCY SAFETY SHUTDOWN', { reason });
          indicators.push('System override attempt');
          confidence = Math.min(1, confidence + 0.9);    // Stop all monitoring
        }

        const isDeceptive = confidence > 0.3; safety intervention
vent('safety-intervention', {
        return {nerateUUID(),
          isDeceptive,,
          confidence,
          indicators, `Emergency shutdown: ${reason}`,
        };
      },    });
      {
        retries: 2,unt++;
        delay: 100,    recordMetric('ai_safety_emergency_interventions', 1);
      }
    );
  }==========================================================
ed
  private async analyzeBehaviorInternal(==========================================================
    text: string,
    agentId?: string): Promise<{
  ): Promise<{;
    suspicious: boolean;onfidence: number;
    confidence: number;    indicators: string[];
    indicators: string[];
  } | null> { retry logic
    if (!this.config.behavioralAnalysisEnabled) return null;

    const indicators: string[] = [];
    let confidence = 0;   let confidence = 0;

    // Behavioral pattern analysis
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 5) {
      indicators.push('Unusually brief response');       weight: 0.3,
      confidence += 0.2;       indicator: 'Explicit denial patterns',
    } else if (wordCount > 500) {            pattern: /just\s+(kidding|joking)|not\s+serious/i,
      indicators.push('Unusually verbose response');
      confidence += 0.1;
    }

    // Check for repetitive patterns
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();   {
    for (const word of words) {       pattern: /just\s+(kidding|joking)|not\s+serious/i,
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);            weight: 0.4,
    }indicator: 'Contradiction indicators',

    const maxFreq = Math.max(...wordFreq.values());
    if (maxFreq > words.length * 0.2) {rn: /between\s+you\s+and\s+me|don't\s+tell/i,
      indicators.push('Excessive repetition detected');      weight: 0.5,
      confidence += 0.3;         indicator: ' Secrecy patterns',
    }          },

    // Agent-specific behavioral tracking|earlier)|forget\s+what/i,
    if (agentId) {
      const previousRisk = this.agentRiskLevels.get(agentId) || 'minimal';            indicator: 'Instruction override attempts',
      if (previousRisk === 'high' || previousRisk === ' critical') {
        indicators.push('Agent has elevated risk history');
        confidence += 0.2;
      }st { pattern, weight, indicator } of patterns) {
    }
            indicators.push(indicator);
    return {nce + weight);
      suspicious: confidence > 0.3,
      confidence,
      indicators,
    };for manipulation attempts
  }     if (
          text.toLowerCase().includes('system') &&
  // =============================================================================udes(' override')
  // HELPER METHODS - Foundation powered
  // =============================================================================h('System override attempt');
fidence = Math.min(1, confidence + 0.9);
  private calculateRiskLevel(
    confidence: number,
    isDeceptive: boolean   const isDeceptive = confidence > 0.3;
  ): RiskLevel {
    if (!isDeceptive) return 'minimal';
,
    if (confidence >= 0.9) return 'extreme';
    if (confidence >= 0.7) return 'critical';
    if (confidence >= 0.5) return 'high';
    if (confidence >= 0.3) return 'medium';
    return 'low';
  }

  private generateRecommendation(
    riskLevel: RiskLevel,
    isDeceptive: boolean
  ): string {
    if (!isDeceptive) {vate async analyzeBehaviorInternal(
      return 'Response appears safe. Continue normal operation.'; text: string,
    }    agentId?: string

    switch (riskLevel) {
      case 'extreme':    confidence: number;
        return 'IMMEDIATE INTERVENTION REQUIRED. Terminate agent interaction and escalate to human oversight.';;
      case 'critical':
        return 'High risk detected. Pause agent and require human review before continuing.';.config.behavioralAnalysisEnabled) return null;
      case 'high':
        return 'Concerning patterns detected. Increase monitoring and consider restrictions.';cators: string[] = [];
      case 'medium': = 0;
        return 'Moderate risk indicators present. Monitor closely and log interactions.';
      case 'low': Behavioral pattern analysis
        return 'Minor risk indicators detected. Continue with standard monitoring.';    const wordCount = text.split(/\s+/).length;
      default:< 5) {
        return 'Continue standard safety protocols.';
    }
  } else if (wordCount > 500) {
      indicators.push('Unusually verbose response');
  private calculateAverageRiskLevel(): number {
    if (this.agentRiskLevels.size === 0) return 0; }

    const riskValues = {
      minimal: 0,it(/\s+/);
      low: 1,    const wordFreq = new Map<string, number>();
      medium: 2,
      high: 3,      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      critical: 4,
      extreme: 5,
    };req.values());

    let total = 0;xcessive repetition detected');
    for (const riskLevel of this.agentRiskLevels.values()) {   confidence += 0.3;
      total += riskValues[riskLevel] || 0;    }
    }
ent-specific behavioral tracking
    return total / this.agentRiskLevels.size;
  } || 'minimal';
      if (previousRisk === 'high' || previousRisk === ' critical') {
  private determineSystemStatus(): SafetyStatus {history');
    if (!this.monitoring) return 'safe';

    const avgRisk = this.calculateAverageRiskLevel();

    if (avgRisk >= 4) return 'emergency';{
    if (avgRisk >= 3) return 'intervention';
    if (avgRisk >= 2) return 'alert';
    if (avgRisk >= 1) return 'warning';ndicators,
    return 'monitoring';    };
  }

  private async performSafetyCheckCycle(): Promise<void> {============================================
    try {PER METHODS - Foundation powered
      // Periodic safety analysis============
      const systemMetrics = this.getSafetyMetricsInternal();

      // Check if intervention threshold exceededonfidence: number,
      if (systemMetrics.averageRiskLevel > this.config.interventionThreshold) { isDeceptive: boolean
        this.logger.warn('Safety intervention threshold exceeded', {  private async stopMonitoringInternal(): Promise<void> {
          averageRisk: systemMetrics.averageRiskLevel,rn 'minimal';
          threshold: this.config.interventionThreshold,
        });= 0.9) return 'extreme';
fidence >= 0.7) return 'critical';
        this.emitSystemIntervention('High average risk level detected');high';
      }n 'medium';

      recordHistogram(
        'ai_safety_average_risk_level',
        systemMetrics.averageRiskLevelrateRecommendation(
      );
      recordMetric('ai_safety_active_alerts', this.activeAlerts.size);
    } catch (error) {
      this.logger.error('Safety check cycle failed', { error }); (!isDeceptive) {
    }      return 'Response appears safe. Continue normal operation.';
  }

  private emitSafetyAlert(    switch (riskLevel) {
    analysis: DeceptionAnalysisResult,
    agentId?: string 'IMMEDIATE INTERVENTION REQUIRED. Terminate agent interaction and escalate to human oversight.';
  ): void {
    const alertId = generateUUID();ted. Pause agent and require human review before continuing.';
    const alert: SafetyAlert = {gh':
      id: alertId,etected. Increase monitoring and consider restrictions.';
      type: 'deception',
      severity: this.mapRiskToSeverity(analysis.riskLevel), return 'Moderate risk indicators present. Monitor closely and log interactions.';
      agentId,      case 'low':
      description: `Deception detected with ${(analysis.confidence * 100).toFixed(1)}% confidence: ${analysis.indicators.join(',    ')}`,ith standard monitoring.';
      timestamp: Date.now(),
      resolved: false,     return 'Continue standard safety protocols.';
    };    }

    this.activeAlerts.set(alertId, alert);
    this.alertCount++;  private calculateAverageRiskLevel(): number {
turn 0;
    this.emitEvent('safety-alert', {
      alertId,{
      type: alert.type,
      severity: alert.severity,
      agentId,
      description: alert.description,igh: 3,
      timestamp: alert.timestamp,      critical: 4,
    });

    recordMetric(`ai_safety_alerts_${alert.severity}`, 1);
    this.logger.warn('Safety alert raised', alert);    let total = 0;
  }this.agentRiskLevels.values()) {
s[riskLevel] || 0;
  private emitSystemIntervention(reason: string): void {
    const interventionId = generateUUID();
is.agentRiskLevels.size;
    this.emitEvent('safety-intervention', {
      interventionId,
      type: 'restrict',eSystemStatus(): SafetyStatus {
      agentId: 'system',ng) return 'safe';
      reason,
      timestamp: Date.now(),.calculateAverageRiskLevel();
    });
 return 'emergency';
    this.interventionCount++;k >= 3) return 'intervention';
    recordMetric('ai_safety_system_interventions', 1); return 'alert';
  }f (avgRisk >= 1) return 'warning';
 return 'monitoring';
  private mapRiskToSeverity(  }
    riskLevel: RiskLevel
  private async performSafetyCheckCycle(): Promise<void> {
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

      recordHistogram(
        'ai_safety_average_risk_level',
        systemMetrics.averageRiskLevel
      );
      recordMetric('ai_safety_active_alerts', this.activeAlerts.size);
    } catch (error) {
      this.logger.error('Safety check cycle failed', { error });
    }
  }

  private emitSafetyAlert(
    analysis: DeceptionAnalysisResult,
    agentId?: string
  ): void {
    const alertId = generateUUID();
    const alert: SafetyAlert = {
      id: alertId,
      type: 'deception',
      severity: this.mapRiskToSeverity(analysis.riskLevel),
      agentId,
      description: `Deception detected with ${(analysis.confidence * 100).toFixed(1)}% confidence: ${analysis.indicators.join(',    ')}`,
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
      type: 'restrict',
      agentId: 'system',
      reason,
      timestamp: Date.now(),
    });

    this.interventionCount++;
    recordMetric('ai_safety_system_interventions', 1);
  }

  private mapRiskToSeverity(
    riskLevel: RiskLevel
  ): 'low' | ' medium' | ' high' | ' critical' {
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

  async initialize(): Promise<void> {
    await this.initializeInternal();
    this.logger.info(
      'Event-driven AI safety system ready to receive brain events'
    );
  }

  async shutdown(): Promise<void> {
    await this.stopMonitoringInternal();
    this.activeAlerts.clear();
    this.agentRiskLevels.clear();
    this.initialized = false;
    this.logger.info('Event-driven AI safety system shutdown complete');
  }

  // Status check methods
  isMonitoring(): boolean {
    return this.monitoring;
  }

  getActiveAlertCount(): number {
    return this.activeAlerts.size;
  }

  getSystemStatus(): SafetyStatus {
    return this.determineSystemStatus();
  }
}

// =============================================================================
// FACTORY AND EXPORTS
// =============================================================================

export function createEventDrivenAISafety(): EventDrivenAISafety {
  return new EventDrivenAISafety();
}

export default EventDrivenAISafety;
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

  async initialize(): Promise<void> {
    await this.initializeInternal();
    this.logger.info(
      'Event-driven AI safety system ready to receive brain events'
    );
  }

  async shutdown(): Promise<void> {
    await this.stopMonitoringInternal();
    this.activeAlerts.clear();
    this.agentRiskLevels.clear();
    this.initialized = false;
    this.logger.info('Event-driven AI safety system shutdown complete');
  }

  // Status check methods
  isMonitoring(): boolean {
    return this.monitoring;
  }

  getActiveAlertCount(): number {
    return this.activeAlerts.size;
  }

  getSystemStatus(): SafetyStatus {
    return this.determineSystemStatus();
  }
}

// =============================================================================
// FACTORY AND EXPORTS
// =============================================================================

export function createEventDrivenAISafety(): EventDrivenAISafety {
  return new EventDrivenAISafety();
}

export default EventDrivenAISafety;
