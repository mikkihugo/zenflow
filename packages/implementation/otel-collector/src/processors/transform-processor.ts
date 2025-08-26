/**
 * @fileoverview Transform Processor
 *
 * Transforms telemetry data by adding, modifying, or removing attributes.
 * Supports field mapping, data enrichment, and format conversion.
 */

import { getLogger } from '@claude-zen/foundation/logging';
import type { ProcessorConfig, TelemetryData } from '../types.js';
import type { BaseProcessor } from './index.js';

/**
 * Transform operation interface
 */
interface TransformOperation {
  type: 'add|modify|remove|rename|map;
  field: string;
  value?: any;
  newField?: string;
  mapping?: Record<string, any>;
  condition?: string;
}

/**
 * Transform processor implementation
 */
export class TransformProcessor implements BaseProcessor {

  constructor(config: ProcessorConfig) {
    this.config = config;
    this.logger = getLogger(`TransformProcessor:${config.name}`);`

    // Parse configuration
    this.addAttributes = config.config?.addAttributes||{};
    this.removeFields = config.config?.removeFields||[];
    this.fieldMappings = config.config?.fieldMappings||{};
    this.operations = this.parseOperations(config.config?.operations||[]);
  }

  async initialize(): Promise<void> {
    this.logger.info('Transform processor initialized', {'
      addAttributes: Object.keys(this.addAttributes).length,
      removeFields: this.removeFields.length,
      fieldMappings: Object.keys(this.fieldMappings).length,
      operations: this.operations.length,
    });
  }

  async process(data: TelemetryData): Promise<TelemetryData|null> {
    try {
      const transformedData = await this.transformData(data);

      this.processedCount++;
      if (transformedData !== data) {
        this.transformedCount++;
      }
      this.lastProcessedTime = Date.now();
      this.lastError = null;

      return transformedData;
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Transform processing failed', error);'

      // Return original data on error
      return data;
    }
  }

  async processBatch(dataItems: TelemetryData[]): Promise<TelemetryData[]> {
    try {
      const transformedItems = await Promise.all(
        dataItems.map((data) => this.transformData(data))
      );

      this.processedCount += dataItems.length;

      // Count actual transformations
      const actuallyTransformed = transformedItems.filter(
        (transformed, index) => transformed !== dataItems[index]
      ).length;
      this.transformedCount += actuallyTransformed;

      this.lastProcessedTime = Date.now();
      this.lastError = null;

      if (actuallyTransformed > 0) {
        this.logger.debug(
          `Transformed $actuallyTransformedout of $dataItems.lengthitems``
        );
      }

      return transformedItems;
    } catch (error) {
      const errorMessage = String(error);
      this.lastError = errorMessage;
      this.logger.error('Transform batch processing failed', error);'

      // Return original data on error
      return dataItems;
    }
  }

  async shutdown(): Promise<void> {
    this.logger.info('Transform processor shut down', {'
      totalProcessed: this.processedCount,
      totalTransformed: this.transformedCount,
      transformRate:
        this.processedCount > 0
          ? ((this.transformedCount / this.processedCount) * 100).toFixed(1) +
            '%''
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
      lastProcessed: this.lastProcessedTime||undefined,
      lastError: this.lastError||undefined,
    };
  }

  /**
   * Get transform statistics
   */
  getTransformStats(): {
    processed: number;
    transformed: number;
    transformRate: string;
  } {
    const transformRate =
      this.processedCount > 0
        ? `${((this.transformedCount / this.processedCount) * 100).toFixed(1)}%`'
        : '0%;

    return {
      processed: this.processedCount,
      transformed: this.transformedCount,
      transformRate,
    };
  }

  /**
   * Transform telemetry data
   */
  private async transformData(data: TelemetryData): Promise<TelemetryData> {
    // Deep clone to avoid mutating original data
    let transformedData: TelemetryData;

    try {
      transformedData = JSON.parse(JSON.stringify(data));
    } catch (error) {
      this.logger.warn('Failed to clone data for transformation', error);'
      return data;
    }

    let wasTransformed = false;

    // Apply add attributes
    if (Object.keys(this.addAttributes).length > 0) {
      if (!transformedData.attributes) {
        transformedData.attributes = {};
      }

      for (const [key, value] of Object.entries(this.addAttributes)) {
        const resolvedValue = this.resolveValue(value, transformedData);
        if (resolvedValue !== undefined) {
          transformedData.attributes[key] = resolvedValue;
          wasTransformed = true;
        }
      }
    }

    // Apply field mappings (rename fields)
    for (const [oldField, newField] of Object.entries(this.fieldMappings)) {
      const value = this.getFieldValue(transformedData, oldField);
      if (value !== undefined) {
        this.setFieldValue(transformedData, newField, value);
        this.removeFieldValue(transformedData, oldField);
        wasTransformed = true;
      }
    }

    // Apply remove fields
    for (const field of this.removeFields) {
      if (this.removeFieldValue(transformedData, field)) {
        wasTransformed = true;
      }
    }

    // Apply custom operations
    for (const operation of this.operations) {
      if (await this.applyOperation(transformedData, operation)) {
        wasTransformed = true;
      }
    }

    // Add transformation metadata
    if (wasTransformed) {
      if (!transformedData.attributes) {
        transformedData.attributes = {};
      }
      transformedData.attributes._transformed = true;
      transformedData.attributes._transformedAt = Date.now();
      transformedData.attributes._transformedBy = this.config.name;
    }

    return transformedData;
  }

  /**
   * Apply a single transform operation
   */
  private async applyOperation(
    data: TelemetryData,
    operation: TransformOperation
  ): Promise<boolean> {
    // Check condition if present
    if (
      operation.condition &&
      !this.evaluateCondition(data, operation.condition)
    ) {
      return false;
    }

    switch (operation.type) {
      case 'add': {'
        if (!data.attributes) {
          data.attributes = {};
        }
        const resolvedValue = this.resolveValue(operation.value, data);
        if (resolvedValue !== undefined) {
          this.setFieldValue(data, operation.field, resolvedValue);
          return true;
        }
        break;
      }

      case 'modify': {'
        const currentValue = this.getFieldValue(data, operation.field);
        if (currentValue !== undefined) {
          const newValue = this.resolveValue(
            operation.value,
            data,
            currentValue
          );
          this.setFieldValue(data, operation.field, newValue);
          return true;
        }
        break;
      }

      case 'remove':'
        return this.removeFieldValue(data, operation.field);

      case 'rename':'
        if (operation.newField) {
          const value = this.getFieldValue(data, operation.field);
          if (value !== undefined) {
            this.setFieldValue(data, operation.newField, value);
            this.removeFieldValue(data, operation.field);
            return true;
          }
        }
        break;

      case 'map':'
        if (operation.mapping) {
          const currentValue = this.getFieldValue(data, operation.field);
          if (
            currentValue !== undefined &&
            operation.mapping[currentValue] !== undefined
          ) {
            this.setFieldValue(
              data,
              operation.field,
              operation.mapping[currentValue]
            );
            return true;
          }
        }
        break;
    }

    return false;
  }

  /**
   * Get field value using dot notation
   */
  private getFieldValue(data: any, fieldPath: string): any {
    const parts = fieldPath.split('.');'
    let value = data;

    for (const part of parts) {
      if (value === null||value === undefined) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Set field value using dot notation
   */
  private setFieldValue(data: any, fieldPath: string, value: any): void {
    const parts = fieldPath.split('.');'
    let current = data;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]||typeof current[part] !=='object') {'
        current[part] = ;
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Remove field value using dot notation
   */
  private removeFieldValue(data: any, fieldPath: string): boolean {
    const parts = fieldPath.split('.');'
    let current = data;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        return false;
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart in current) {
      delete current[lastPart];
      return true;
    }

    return false;
  }

  /**
   * Resolve value (supports templates and functions)
   */
  private resolveValue(
    value: any,
    data: TelemetryData,
    currentValue?: any
  ): any {
    if (typeof value === 'string') {'
      // Template substitution
      return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const resolved = this.getFieldValue(data, path.trim())();
        return resolved !== undefined ? String(resolved) : match;
      });
    }

    if (typeof value === 'function') {'
      try {
        return value(data, currentValue);
      } catch (error) {
        this.logger.warn('Error in transform function', error);'
        return currentValue;
      }
    }

    return value;
  }

  /**
   * Evaluate simple conditions
   */
  private evaluateCondition(data: TelemetryData, condition: string): boolean {
    try {
      // Very simple condition evaluation
      // In production, you'd want a proper expression evaluator'
      const parts = condition.split(' ');'
      if (parts.length === 3) {
        const [field, operator, expectedValue] = parts;
        const actualValue = this.getFieldValue(data, field);

        switch (operator) {
          case '==':'
            return actualValue === expectedValue;
          case '!=':'
            return actualValue !== expectedValue;
          case 'contains':'
            return String(actualValue).includes(expectedValue);
          case 'exists':'
            return actualValue !== undefined;
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to evaluate condition: ${condition}`, error);`
    }

    return true; // Default to true on condition evaluation error
  }

  /**
   * Parse transform operations from configuration
   */
  private parseOperations(operations: any[]): TransformOperation[] {
    return operations.map((op) => ({
      type: op.type||'add',
      field: op.field,
      value: op.value,
      newField: op.newField,
      mapping: op.mapping,
      condition: op.condition,
    }));
  }
}
