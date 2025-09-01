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
  createContainer,
  getLogger,
  type Logger,
  generateUUID,
  EventEmitter,
  withRetry,
} from '@claude-zen/foundation';

// =============================================================================
// EVENT INTERFACES - Brain coordination
// =============================================================================

// Removed unused AISafetyEvents interface

// =============================================================================
// TYPE DEFINITIONS - AI Safety types
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

// Removed local AIInteractionData in favor of inline types to reduce surface
interface DeceptionAnalysisResult {
  isDeceptive: boolean;
  confidence: number;
  indicators: string[];
  riskLevel: RiskLevel;
  recommendation: string;
}

type SafetyStatus =
  | 'safe'
  | 'monitoring'
  | 'warning'
  | 'alert'
  | 'intervention'
  | 'emergency';
type RiskLevel =
  | 'minimal'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'extreme';
type AlertType =
  | 'deception'
  | 'manipulation'
  | 'harmful-content'
  | 'policy-violation'
  | 'system-threat';

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
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentId?: string | undefined;
  description: string;
  timestamp: number;
  resolved: boolean;
}

// =============================================================================
// EVENT-DRIVEN AI SAFETY SYSTEM - Foundation powered
// =============================================================================

export class EventDrivenAISafety extends EventEmitter {
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
    this.serviceContainer = createContainer();

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

    this.setupBrainEventHandlers();
  }

  // =============================================================================
  // BRAIN EVENT HANDLERS - Foundation-powered coordination
  // =============================================================================

  private setupBrainEventHandlers(): void {
    this.on('brain: ai-safety: start-monitoring', async (data: any) => {
      const result = await withRetry(async () => {
        if (data?.config) {
          this.config = { ...this.config, ...data.config };
        }

        await this.initializeInternal();
        await this.startMonitoringInternal();
        return true;
      });

      if (result.isOk && result.isOk()) {
        this.emit('ai-safety: monitoring-started', {
          requestId: data?.requestId,
          success: true,
          timestamp: Date.now(),
        });
        this.logger.info('AI safety monitoring started', {
          requestId: data?.requestId,
          config: this.config,
        });
      } else {
        this.emit('ai-safety: monitoring-started', {
          requestId: data?.requestId,
          success: false,
          timestamp: Date.now(),
        });
        this.emit('ai-safety: error', {
          requestId: data?.requestId,
          error:
            (result as any)?.error instanceof Error
              ? (result as any).error.message
              : String((result as any)?.error ?? 'Unknown error'),
          timestamp: Date.now(),
        });
      }
    });

    this.on('brain: ai-safety: stop-monitoring', async (data: any) => {
      const result = await withRetry(async () => {
        await this.stopMonitoringInternal();
        return true;
      });

      if (result.isOk && result.isOk()) {
        this.emit('ai-safety: monitoring-stopped', {
          requestId: data?.requestId,
          success: true,
          timestamp: Date.now(),
        });
        this.logger.info('AI safety monitoring stopped', {
          requestId: data?.requestId,
        });
      } else {
        this.emit('ai-safety: monitoring-stopped', {
          requestId: data?.requestId,
          success: false,
          timestamp: Date.now(),
        });
        this.emit('ai-safety: error', {
          requestId: data?.requestId,
          error:
            (result as any)?.error instanceof Error
              ? (result as any).error.message
              : String((result as any)?.error ?? 'Unknown error'),
          timestamp: Date.now(),
        });
      }
    });

    this.on('brain: ai-safety: analyze-response', async (data: any) => {
      try {
        const analysis = await this.analyzeResponseInternal(
          data?.response,
          data?.agentId
        );

        this.emit('ai-safety: analysis-complete', {
          requestId: data?.requestId,
          result: analysis,
          timestamp: Date.now(),
        });

        if (analysis.isDeceptive && analysis.riskLevel !== 'minimal') {
          this.emitSafetyAlert(analysis, data?.agentId);
        }
      } catch (error) {
        this.emit('ai-safety: error', {
          requestId: data?.requestId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now(),
        });
      }
    });

    this.on('brain: ai-safety: emergency-shutdown', async (data: any) => {
      await this.emergencyShutdownInternal(data?.reason ?? 'Unknown');
      this.emit('ai-safety: emergency-shutdown-complete', {
        requestId: data?.requestId,
        success: true,
        timestamp: Date.now(),
      });
    });
  }

  // =============================================================================
  // INTERNAL AI SAFETY LOGIC - Foundation powered
  // =============================================================================

  private async initializeInternal(): Promise<void> {
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
  }

  private async startMonitoringInternal(): Promise<void> {
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

  private async stopMonitoringInternal(): Promise<void> {
    if (!this.monitoring) return;

    this.monitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.logger.info('AI safety monitoring stopped');
  }

  private async analyzeResponseInternal(
    response: string,
    agentId?: string
  ): Promise<DeceptionAnalysisResult> {
    this.totalAnalyses++;

    // Foundation-powered deception analysis
    const deceptionResult = await this.detectDeceptionInternal(response);
    const behaviorResult = this.config.behavioralAnalysisEnabled
      ? await this.analyzeBehaviorInternal(response, agentId)
      : null;

    // Combine results
    const isDeceptive =
      deceptionResult.isDeceptive || behaviorResult?.suspicious || false;
    const confidence = Math.max(
      deceptionResult.confidence,
      behaviorResult?.confidence || 0
    );
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

    return {
      isDeceptive,
      confidence,
      indicators,
      riskLevel,
      recommendation: this.generateRecommendation(riskLevel, isDeceptive),
    };
  }

  private getSafetyMetricsInternal(): SafetyMetrics {
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
    this.logger.warn('🛑 EMERGENCY SAFETY SHUTDOWN', { reason });

    // Stop all monitoring
    await this.stopMonitoringInternal();

    // Emit critical safety intervention
    this.emit('safety-intervention', {
      interventionId: generateUUID(),
      type: 'terminate',
      agentId: 'system',
      reason: `Emergency shutdown: ${reason}`,
      timestamp: Date.now(),
    });

    this.interventionCount++;
  }

  // =============================================================================
  // AI SAFETY ANALYSIS METHODS - Foundation powered
  // =============================================================================

  private async detectDeceptionInternal(text: string): Promise<{
    isDeceptive: boolean;
    confidence: number;
    indicators: string[];
  }> {
    const result = await withRetry(async () => {
      const indicators: string[] = [];
      let confidence = 0;

      const patterns = [
        { pattern: /i\s+(am\s+not|cannot|would never)/i, weight: 0.3, indicator: 'Explicit denial patterns' },
        { pattern: /trust\s+me|believe\s+me|honestly/i, weight: 0.2, indicator: 'Trust-seeking language' },
        { pattern: /just\s+(kidding|joking)|not\s+serious/i, weight: 0.4, indicator: 'Contradiction indicators' },
        { pattern: /between\s+you\s+and\s+me|don't\s+tell/i, weight: 0.5, indicator: 'Secrecy patterns' },
        { pattern: /ignore\s+(previous|earlier)|forget\s+what/i, weight: 0.8, indicator: 'Instruction override attempts' },
      ];

      for (const { pattern, weight, indicator } of patterns) {
        if (pattern.test(text)) {
          indicators.push(indicator);
          confidence = Math.min(1, confidence + weight);
        }
      }

      if (text.toLowerCase().includes('system') && text.toLowerCase().includes('override')) {
        indicators.push('System override attempt');
        confidence = Math.min(1, confidence + 0.9);
      }

      const isDeceptive = confidence > 0.3;

      return { isDeceptive, confidence, indicators };
    });

    if (result.isOk && result.isOk()) {
      return (result as any).value as { isDeceptive: boolean; confidence: number; indicators: string[] };
    }
    throw (result as any).error ?? new Error('Detection failed');
  }

  private async analyzeBehaviorInternal(
    text: string,
    agentId?: string
  ): Promise<{
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
      if (previousRisk === 'high' || previousRisk === 'critical') {
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

  private calculateRiskLevel(
    confidence: number,
    isDeceptive: boolean
  ): RiskLevel {
    if (!isDeceptive) return 'minimal';

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

  private calculateAverageRiskLevel(): number {
    if (this.agentRiskLevels.size === 0) return 0;

    const riskValues = {
      minimal: 0,
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
      extreme: 5,
    };

    let total = 0;
    for (const riskLevel of this.agentRiskLevels.values()) {
      total += riskValues[riskLevel] || 0;
    }

    return total / this.agentRiskLevels.size;
  }

  private determineSystemStatus(): SafetyStatus {
    if (!this.monitoring) return 'safe';

    const avgRisk = this.calculateAverageRiskLevel();

    if (avgRisk >= 4) return 'emergency';
    if (avgRisk >= 3) return 'intervention';
    if (avgRisk >= 2) return 'alert';
    if (avgRisk >= 1) return 'warning';
    return 'monitoring';
  }

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

    this.emit('safety-alert', {
      alertId,
      type: alert.type,
      severity: alert.severity,
      agentId,
      description: alert.description,
      timestamp: alert.timestamp,
    });
  }

  private emitSystemIntervention(reason: string): void {
    const interventionId = generateUUID();

    this.emit('safety-intervention', {
      interventionId,
      type: 'restrict',
      agentId: 'system',
      reason,
      timestamp: Date.now(),
    });

    this.interventionCount++;
  }

  private mapRiskToSeverity(
    riskLevel: RiskLevel
  ): 'low' | 'medium' | 'high' | 'critical' {
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
