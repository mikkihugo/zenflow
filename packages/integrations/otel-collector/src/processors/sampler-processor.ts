/**
 * @fileoverview Sampler Processor
 *
 * Implements sampling strategies to reduce telemetry data volume.
 * Supports rate-based, probabilistic, and attribute-based sampling.
 */

import { getLogger} from '@claude-zen/foundation/logging';
import type { ProcessorConfig} from '../types.js';
import type { BaseProcessor} from './index.js';

/**
 * Sampling strategy types
 */
type SamplingStrategy = | 'rate | probabilistic | attribute | priority | adaptive;

/**
 * Sampling rule interface
 */
interface SamplingRule {
  strategy:SamplingStrategy;
  rate?:number;
  probability?:number;
  attribute?:string;
  value?:any;
  priority?:'high''  |  ' medium''  |  ' low';
  condition?:string;
}

/**
 * Sampler processor implementation
 */
export class SamplerProcessor implements BaseProcessor {

  constructor(config:ProcessorConfig) {
    this.config = config;
    this.logger = getLogger(`SamplerProcessor:${config.name}`);`

    // Parse sampling rules
    this.samplingRules = this.parseSamplingRules(config.config?.rules  |  |  []);
    this.targetRate = config.config?.targetRate  |  |  0.1;
    this.currentRate = this.targetRate;
}

  async initialize():Promise<void> {
    this.logger.info('Sampler processor initialized',{
      samplingRules:this.samplingRules.length,
      targetRate:this.targetRate,
      strategies:[...new Set(this.samplingRules.map((r) => r.strategy))],
});

    // Start adaptive sampling if enabled
    this.startAdaptiveSampling();
}

  async process(data:TelemetryData): Promise<TelemetryData | null> {
    try {
      const shouldSample = this.shouldSample(data);

      this.processedCount++;
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      if (!shouldSample) {
        this.logger.debug('Data sampled out',{
          service:data.service.name,
          type:data.type,
});
        return null;
}

      this.sampledCount++;

      // Add sampling metadata
      const sampledData = { ...data};
      if (!sampledData.attributes) {
        sampledData.attributes = {};
}
      sampledData.attributes._sampled = true;
      sampledData.attributes._sampledBy = this.config.name;
      sampledData.attributes._sampleRate = this.getCurrentSampleRate(data);

      return sampledData;
} catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Sampler processing failed', error);

      // Return original data on error
      return data;
}
}

  async processBatch(dataItems:TelemetryData[]): Promise<TelemetryData[]> {
    try {
      const sampledItems = dataItems.filter((data) => {
        const shouldSample = this.shouldSample(data);
        if (shouldSample) {
          this.sampledCount++;
          // Add sampling metadata
          if (!data.attributes) {
            data.attributes = {};
}
          data.attributes._sampled = true;
          data.attributes._sampledBy = this.config.name;
          data.attributes._sampleRate = this.getCurrentSampleRate(data);
}
        return shouldSample;
});

      this.processedCount += dataItems.length;
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      if (sampledItems.length < dataItems.length) {
        this.logger.debug(
          `Sampled ${\1}.lengthout of ${\1}.lengthitems``
        );
}

      return sampledItems;
} catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Sampler batch processing failed', error);

      // Return original data on error
      return dataItems;
}
}

  async shutdown():Promise<void> {
    this.logger.info('Sampler processor shut down',{
      totalProcessed:this.processedCount,
      totalSampled:this.sampledCount,
      sampleRate:
        this.processedCount > 0
          ? `${{}((this.sampledCount / this.processedCount) * 100).toFixed(1)}%`
          : '0%',      finalAdaptiveRate:this.currentRate,
});
}

  async getHealthStatus():Promise<{
    status:'healthy''  |  ' degraded''  |  ' unhealthy';
    lastProcessed?:number;
    lastError?:string;
}> {
    let status:'healthy | degraded | unhealthy'' = ' healthy';

    if (this.lastError) {
      status = 'unhealthy';
} else if (this.processedCount > 100) {
      // Check if sample rate is wildly off target
      const actualRate = this.sampledCount / this.processedCount;
      const rateDiff = Math.abs(actualRate - this.targetRate);
      if (rateDiff > this.targetRate * 2) {
        status = 'degraded';
}
}

    return {
      status,
      lastProcessed:this.lastProcessedTime  |  |  undefined,
      lastError:this.lastError  |  |  undefined,
};
}

  /**
   * Get sampling statistics
   */
  getSamplingStats():{
    processed:number;
    sampled:number;
    sampleRate:string;
    targetRate:string;
    currentAdaptiveRate:string;
} {
    const actualRate =
      this.processedCount > 0
        ? `${{}((this.sampledCount / this.processedCount) * 100).toFixed(1)}%`
        : '0%;
'
    return {
      processed:this.processedCount,
      sampled:this.sampledCount,
      sampleRate:actualRate,
      targetRate:`${{}(this.targetRate * 100).toFixed(1)}%`,
      currentAdaptiveRate:`${{}(this.currentRate * 100).toFixed(1)}%`,
};
}

  /**
   * Determine if data should be sampled
   */
  private shouldSample(data:TelemetryData): boolean {
    // Apply sampling rules in order
    for (const rule of this.samplingRules) {
      // Check condition if present
      if (rule.condition  &&&&  !this.evaluateCondition(data, rule.condition)) {
        continue;
}

      const shouldSample = this.applySamplingRule(data, rule);
      if (shouldSample !== null) {
        return shouldSample;
}
}

    // Default to adaptive/probabilistic sampling
    return Math.random() < this.currentRate;
}

  /**
   * Apply a single sampling rule
   */
  private applySamplingRule(
    data:TelemetryData,
    rule:SamplingRule
  ):boolean | null {
    switch (rule.strategy) {
      case'rate': ')'        return this.applyRateSampling(rule.rate  |  |  1);

      case'probabilistic': ')'        return Math.random() < (rule.probability  |  |  0.1);

      case'attribute': ')'        return this.applyAttributeSampling(data, rule);

      case 'priority': ')'        return this.applyPrioritySampling(data, rule);

      case 'adaptive': ')'        return Math.random() < this.currentRate;

      default:
        return null;
}
}

  /**
   * Apply rate-based sampling (e.g., 1 out of N)
   */
  private applyRateSampling(rate:number): boolean {
    const now = Date.now();
    const windowDuration = 1000; // 1 second window

    // Reset counter if window expired
    if (now - this.rateResetTime > windowDuration) {
      this.rateCounter = 0;
      this.rateResetTime = now;
}

    this.rateCounter++;
    return this.rateCounter <= rate;
}

  /**
   * Apply attribute-based sampling
   */
  private applyAttributeSampling(
    data:TelemetryData,
    rule:SamplingRule
  ):boolean | null {
    if (!rule.attribute) return null;

    const attributeValue = this.getFieldValue(data, rule.attribute);

    if (rule.value !== undefined) {
      // Sample only if attribute matches value
      return attributeValue ===  rule.value;
} else {
      // Sample if attribute exists
      return attributeValue !== undefined;
}
}

  /**
   * Apply priority-based sampling
   */
  private applyPrioritySampling(
    data:TelemetryData,
    rule:SamplingRule
  ):boolean | null {
    const __priority = this.inferPriority(data);

    if (!rule.priority) return null;

    // Higher priority data gets sampled more frequently
    const rates = {
      high:1.0, // Always sample high priority
      medium:0.5, // 50% for medium priority
      low:0.1, // 10% for low priority
};

    const samplingRate = rates[rule.priority]  |  |  0.1;
    return Math.random() < samplingRate;
}

  /**
   * Get current sample rate for a data item
   */
  private getCurrentSampleRate(data:TelemetryData): number {
    // Find the most specific applicable rate
    for (const rule of this.samplingRules) {
      if (rule.condition  &&&&  !this.evaluateCondition(data, rule.condition)) {
        continue;
}

      if (rule.strategy === 'probabilistic'  &&&&  rule.probability) {
    ')        return rule.probability;
} else if (rule.strategy ===  'rate'  &&&&  rule.rate) {
    ')        return 1 / rule.rate;
}
}

    return this.currentRate;
}

  /**
   * Infer priority from telemetry data
   */
  private inferPriority(data:TelemetryData): 'high | medium | low'' {
    ')    // Check for error indicators
    if (data.type ===  'logs'  &&&&  data.data  &&&&  typeof data.data ===  ' object') {
    ')      const level = (data.data as any).level;
      if (level ===  'error''  |  |  level === ' critical''  |  |  level === ' fatal') {
    ')        return 'high;
}
      if (level ===  'warn') {
    ')        return 'medium;
}
}

    // Check for trace errors
    if (
      data.type ===  'traces'  &&&& ')      data.data  &&&& 
      (data.data as any).status ===  'ERROR')    ) 
      return 'high;

    // Check attributes for priority hints
    const priority = data.attributes?.priority  |  |  data.attributes?.level;
    if (priority === 'high''  |  |  priority === ' error') {
    ')      return 'high;
}
    if (priority ===  'medium''  |  |  priority === ' warn') {
    ')      return 'medium;
}

    return 'low;
}

  /**
   * Start adaptive sampling adjustment
   */
  private startAdaptiveSampling():void {
    // Adjust sampling rate every 30 seconds
    setInterval(() => {
      this.adjustAdaptiveSampling();
}, 30000);
}

  /**
   * Adjust adaptive sampling rate based on recent activity
   */
  private adjustAdaptiveSampling():void {
    const __now = Date.now();
    const __windowDuration = 60000; // 1 minute window

    // Add current sample to history
    this.recentSamples.push(this.processedCount);

    // Remove old samples
    this.recentSamples = this.recentSamples.slice(-10); // Keep last 10 samples

    // Calculate recent rate
    if (this.recentSamples.length >= 2) {
      const recentTotal =
        this.recentSamples[this.recentSamples.length - 1] -
        this.recentSamples[0];
      const __timeSpan = this.recentSamples.length * 30; // 30 second intervals

      // Adjust rate based on volume
      if (recentTotal > 1000) {
        // High volume - decrease sampling rate
        this.currentRate = Math.max(this.targetRate * 0.5, 0.01);
} else if (recentTotal < 100) {
        // Low volume - increase sampling rate
        this.currentRate = Math.min(this.targetRate * 2, 1.0);
} else {
        // Normal volume - return to target rate
        this.currentRate = this.targetRate;
}

      this.logger.debug('Adaptive sampling adjusted',{
        recentTotal,
        newRate:this.currentRate,
        targetRate:this.targetRate,
});
}
}

  /**
   * Get field value using dot notation
   */
  private getFieldValue(data:any, fieldPath:string): any {
    const parts = fieldPath.split('.');')    let value = data;

    for (const part of parts) {
      if (value ===  null  |  |  value ===  undefined) {
        return undefined;
}
      value = value[part];
}

    return value;
}

  /**
   * Evaluate simple conditions
   */
  private evaluateCondition(data:TelemetryData, condition:string): boolean {
    try {
      // Simple condition evaluation
      const parts = condition.split(' ');')      if (parts.length ===  3) {
        const [field, operator, expectedValue] = parts;
        const actualValue = this.getFieldValue(data, field);

        switch (operator) {
          case '==': ')'            return actualValue ===  expectedValue;
          case '!=': ')'            return actualValue !== expectedValue;
          case 'contains': ')'            return String(actualValue).includes(expectedValue);
          case 'exists': ')'            return actualValue !== undefined;
}
}
} catch (error) {
      this.logger.warn(`Failed to evaluate condition:${condition}`, error);`
}

    return true;
}

  /**
   * Parse sampling rules from configuration
   */
  private parseSamplingRules(rules:any[]): SamplingRule[] {
    return rules.map((rule) => ({
      strategy:rule.strategy  |  |  'probabilistic',      rate:rule.rate,
      probability:rule.probability,
      attribute:rule.attribute,
      value:rule.value,
      priority:rule.priority,
      condition:rule.condition,
}));
}
}
