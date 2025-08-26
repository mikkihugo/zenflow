/**
 * @fileoverview Filter Processor
 *
 * Filters telemetry data based on configurable rules.
 * Can filter by service name, data type, attributes, or custom logic.
 */

import { getLogger } from '@claude-zen/foundation/logging';
import type { ProcessorConfig, TelemetryData } from '../types.js';
import type { BaseProcessor } from './index.js';

/**
 * Filter rule interface
 */
interface FilterRule {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'exists';
  value?: any;
  regex?: RegExp;
}

/**
 * Filter processor implementation
 */
export class FilterProcessor implements BaseProcessor {
  readonly name: string;
  private readonly config: ProcessorConfig;
  private readonly logger: any;
  private readonly includeRules: FilterRule[];
  private readonly excludeRules: FilterRule[];
  private readonly filterMode: string;
  private processedCount = 0;
  private filteredCount = 0;
  private lastProcessedTime = 0;
  private lastError: string | null = null;

  constructor(config: ProcessorConfig) {
    this.name = config.name;
    this.config = config;
    this.logger = getLogger(`FilterProcessor:${config.name}`);

    // Parse filter rules
    this.includeRules = this.parseFilterRules(config.config?.include || []);
    this.excludeRules = this.parseFilterRules(config.config?.exclude || []);
    this.filterMode = config.config?.mode || 'exclude';
  }

  async initialize(): Promise<void> {
    this.logger.info('Filter processor initialized', {
      includeRules: this.includeRules.length,
      excludeRules: this.excludeRules.length,
      filterMode: this.filterMode,
    });
  }

  async process(data: TelemetryData): Promise<TelemetryData | null> {
    try {
      const shouldInclude = this.shouldIncludeData(data);

      this.processedCount++;
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      if (!shouldInclude) {
        this.filteredCount++;
        this.logger.debug('Data filtered out', {
          service: data.service.name,
          type: data.type,
        });
        return null;
      }

      return data;
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Filter processing failed', error);

      // Return original data on error
      return data;
    }
  }

  async processBatch(dataItems: TelemetryData[]): Promise<TelemetryData[]> {
    try {
      const filteredItems = dataItems.filter((data) => {
        const shouldInclude = this.shouldIncludeData(data);
        if (!shouldInclude) {
          this.filteredCount++;
        }
        return shouldInclude;
      });

      this.processedCount += dataItems.length;
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      if (filteredItems.length < dataItems.length) {
        this.logger.debug(
          `Filtered ${dataItems.length - filteredItems.length} out of ${dataItems.length} items`
        );
      }

      return filteredItems;
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Filter batch processing failed', error);

      // Return original data on error
      return dataItems;
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Filter processor shut down', {
      totalProcessed: this.processedCount,
      totalFiltered: this.filteredCount,
      filterRate:
        this.processedCount > 0
          ? `${((this.filteredCount / this.processedCount) * 100).toFixed(1)}%`
          : '0%',
    });
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastProcessed?: number;
    lastError?: string;
  }> {
    return {
      status: this.lastError ? 'unhealthy' : 'healthy',
      lastProcessed: this.lastProcessedTime || undefined,
      lastError: this.lastError || undefined,
    };
  }

  /**
   * Get filter statistics
   */
  getFilterStats(): {
    processed: number;
    filtered: number;
    passed: number;
    filterRate: string;
  } {
    const passed = this.processedCount - this.filteredCount;
    const filterRate =
      this.processedCount > 0
        ? `${((this.filteredCount / this.processedCount) * 100).toFixed(1)}%`
        : '0%';

    return {
      processed: this.processedCount,
      filtered: this.filteredCount,
      passed,
      filterRate,
    };
  }

  /**
   * Determine if data should be included based on filter rules
   */
  private shouldIncludeData(data: TelemetryData): boolean {
    switch (this.filterMode) {
      case 'include':
        // Must match at least one include rule
        return (
          this.includeRules.length === 0 || this.includeRules.some((rule) => this.matchesRule(data, rule))
        );

      case 'exclude':
        // Must not match any exclude rule
        return !this.excludeRules.some((rule) => this.matchesRule(data, rule));

      case 'both': {
        // Must match include rules AND not match exclude rules
        const passesInclude =
          this.includeRules.length === 0 || this.includeRules.some((rule) => this.matchesRule(data, rule));
        const passesExclude = !this.excludeRules.some((rule) =>
          this.matchesRule(data, rule)
        );
        return passesInclude && passesExclude;
      }

      default:
        return true;
    }
  }

  /**
   * Check if data matches a filter rule
   */
  private matchesRule(data: TelemetryData, rule: FilterRule): boolean {
    const fieldValue = this.getFieldValue(data, rule.field);

    if (fieldValue === undefined) {
      return rule.operator !== 'exists';
    }

    switch (rule.operator) {
      case 'exists':
        return fieldValue !== undefined;

      case 'equals':
        return fieldValue === rule.value;

      case 'contains':
        return String(fieldValue).includes(String(rule.value));

      case 'startsWith':
        return String(fieldValue).startsWith(String(rule.value));

      case 'endsWith':
        return String(fieldValue).endsWith(String(rule.value));

      case 'regex':
        if (!rule.regex) return false;
        return rule.regex.test(String(fieldValue));

      default:
        return false;
    }
  }

  /**
   * Get field value from telemetry data using dot notation
   */
  private getFieldValue(data: TelemetryData, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value: any = data;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Parse filter rules from configuration
   */
  private parseFilterRules(rules: any[]): FilterRule[] {
    return rules.map((rule: any) => {
      const parsed: FilterRule = {
        field: rule.field,
        operator: rule.operator || 'equals',
        value: rule.value,
      };

      // Compile regex if needed
      if (parsed.operator === 'regex' && typeof rule.value === 'string') {
        try {
          parsed.regex = new RegExp(rule.value, rule.flags || 'i');
        } catch (error) {
          this.logger.warn(`Invalid regex pattern: ${rule.value}`, error);
          // Fallback to contains operator
          parsed.operator = 'contains';
        }
      }

      return parsed;
    });
  }
}
