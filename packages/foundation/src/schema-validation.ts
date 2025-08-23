/**
 * @fileoverview JSON Schema Validation System - Foundation Integration
 *
 * **EXTRACTED FROM MAIN APP → FOUNDATION INTEGRATION**
 *
 * Standards-compliant JSON Schema Draft 7 validation system now integrated
 * into @claude-zen/foundation for universal use across all packages.
 *
 * Key Features:
 * - JSON Schema Draft 7 compliance (RFC 7159)
 * - AJV validation with strict mode
 * - Language-agnostic schema definitions
 * - Progressive enhancement support (Kanban → Agile → SAFe)
 * - Integration with foundation error handling
 * - Foundation DI container support
 *
 * **FOUNDATION INTEGRATION:**
 * - Uses foundation Logger interface
 * - Integrates with foundation error handling
 * - Available for DI injection
 * - Follows foundation patterns
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (extracted from main app)
 * @version 1.0.0
 */

// import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import Ajv, { type ValidateFunction } from 'ajv';

import type { Logger } from './logging';
import type { JsonObject, JsonValue, UnknownRecord } from './types/primitives';

// Node.js fetch polyfill for older versions
declare const fetch: (url: string) => Promise<{ ok: boolean; status: number; statusText: string; json: () => Promise<unknown> }>;

// ============================================================================
// FOUNDATION-INTEGRATED JSON SCHEMA SYSTEM
// ============================================================================

export interface SchemaRegistry {
  [schemaName: string]: {
    schema: JsonObject; // JSON Schema Draft 7
    validator: ValidateFunction;
    modes: ('kanban' | 'agile' | 'safe')[];
  };
}

export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public readonly documentType?: string,
    public readonly validationErrors?: string[],
  ) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

export class JsonSchemaManager {
  private ajv: Ajv;
  private schemas: SchemaRegistry = {};
  private logger: Logger;
  private schemasPath: string;

  constructor(logger: Logger, schemasPath = './schemas') {
    this.logger = logger;
    this.schemasPath = schemasPath;

    // Configure AJV with standards compliance
    this.ajv = new Ajv({
      allErrors: true, // Return all validation errors
      verbose: true, // Detailed error information
      validateSchema: true, // Validate schemas themselves
      addUsedSchema: false, // Prevent schema pollution
      loadSchema: this.loadSchemaAsync.bind(this),
    });

    // Add standard formats (RFC 3339 dates, UUIDs, etc.)
    // addFormats(this.ajv);

    this.loadAllSchemas();
  }

  /**
   * Load all JSON Schema files from the schemas directory
   */
  private loadAllSchemas(): void {
    const schemaFiles = [
      'business-epic.json',
      'architecture-runway.json',
      'program-epic.json',
      'feature.json',
      'story.json',
    ];

    for (const file of schemaFiles) {
      try {
        const schemaPath = join(this.schemasPath, file);
        const schemaContent = JSON.parse(readFileSync(schemaPath, 'utf8'));
        const schemaName = file.replace('.json', '').replace('-', '_');

        this.registerSchema(schemaName, schemaContent);
        this.logger.info(`Loaded JSON Schema: ${schemaName}`);
      } catch (error) {
        this.logger.error(`Failed to load schema ${file}:`, error);
      }
    }
  }

  /**
   * Register a JSON Schema with AJV validator
   */
  private registerSchema(name: string, schema: JsonObject): void {
    try {
      // Validate the schema itself first
      this.ajv.validateSchema(schema);

      // Compile validator
      const validator = this.ajv.compile(schema);

      // Determine which modes this schema supports
      const modes = this.extractSupportedModes(schema);

      this.schemas[name] = {
        schema,
        validator,
        modes,
      };

      this.logger.info(
        `Registered schema ${name} for modes: ${modes.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(`Failed to register schema ${name}:`, error);
      throw error;
    }
  }

  /**
   * Extract supported modes from schema metadata
   */
  private extractSupportedModes(
    schema: JsonObject,
  ): ('kanban' | 'agile' | 'safe')[] {
    // Check schema metadata for supported modes
    const metadata = schema['metadata'];
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      const metadataObj = metadata as JsonObject;
      const supportedModes = metadataObj['supportedModes'];
      if (Array.isArray(supportedModes)) {
        return supportedModes as ('kanban' | 'agile' | 'safe')[];
      }
    }

    // Default: assume all modes supported
    return ['kanban', 'agile', 'safe'];
  }

  /**
   * Validate document against JSON Schema
   */
  validate(
    documentType: string,
    data: JsonValue,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban',
  ): {
    isValid: boolean;
    errors?: string[];
    data?: JsonValue;
  } {
    const schemaEntry = this.schemas[documentType];

    if (!schemaEntry) {
      return {
        isValid: false,
        errors: [`Unknown document type: ${documentType}`],
      };
    }

    if (!schemaEntry.modes.includes(mode)) {
      return {
        isValid: false,
        errors: [`Document type ${documentType} not available in ${mode} mode`],
      };
    }

    const isValid = schemaEntry.validator(data);

    if (!isValid) {
      const errors = schemaEntry.validator.errors?.map((err) => {
        const error = err as unknown as UnknownRecord;
        return `${error['instancePath'] || error['schemaPath'] || 'root'}: ${error['message'] || 'Unknown error'}`;
      })||['Unknown validation error'];

      return { isValid: false, errors };
    }

    return { isValid: true, data };
  }

  /**
   * Validate with foundation error handling integration
   */
  validateWithErrors(
    documentType: string,
    data: JsonValue,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban'): JsonValue {
    const result = this.validate(documentType, data, mode);

    if (!result.isValid) {
      throw new SchemaValidationError(
        `Schema validation failed for ${documentType}`,
        documentType,
        result.errors||[],
      );
    }

    if (!result.data) {
      throw new Error('Validation succeeded but no data returned');
    }
    return result.data;
  }

  /**
   * Get schema for document type and mode
   */
  getSchema(
    documentType: string,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban',
  ): JsonObject {
    const schemaEntry = this.schemas[documentType];

    if (!schemaEntry) {
      throw new SchemaValidationError(`Unknown document type: ${documentType}`);
    }

    if (!schemaEntry.modes.includes(mode)) {
      throw new SchemaValidationError(
        `Document type ${documentType} not available in ${mode} mode`,
      );
    }

    return schemaEntry.schema;
  }

  /**
   * Create document with defaults and validation
   */
  createDocument(
    documentType: string,
    data: JsonValue,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban',
  ): JsonValue {
    // Apply schema defaults
    const schema = this.getSchema(documentType, mode);
    const documentWithDefaults = this.applyDefaults(schema, data);

    // Add schema metadata
    if (
      documentWithDefaults &&
      typeof documentWithDefaults === 'object' &&
      !Array.isArray(documentWithDefaults)
    ) {
      const doc = documentWithDefaults as JsonObject;
      doc['schema_version'] = this.getSchemaVersion(documentType, mode);
      doc['schema_mode'] = mode;
    }

    // Validate with error throwing
    return this.validateWithErrors(documentType, documentWithDefaults, mode);
  }

  /**
   * Apply schema defaults to data
   */
  private applyDefaults(schema: JsonObject, data: JsonValue): JsonValue {
    if (typeof data !== 'object'||data === null||Array.isArray(data)) {
      return data;
    }

    const result = { ...(data as JsonObject) };
    const properties = schema['properties'];

    if (
      properties &&
      typeof properties === 'object' &&
      !Array.isArray(properties)
    ) {
      for (const [key, prop] of Object.entries(properties as JsonObject)) {
        if (
          result[key] === undefined &&
          prop &&
          typeof prop === 'object' &&
          !Array.isArray(prop)
        ) {
          const propObj = prop as JsonObject;
          if (propObj['default'] !== undefined) {
            result[key] = propObj['default'];
          }
        }
      }
    }

    return result;
  }

  /**
   * Get schema version for mode
   */
  private getSchemaVersion(
    _documentType: string,
    mode: 'kanban' | 'agile' | 'safe',
  ): string {
    const modeVersionMap = {
      kanban: '1.0.0',
      agile: '2.0.0',
      safe: '3.0.0',
    };

    return modeVersionMap[mode];
  }

  /**
   * Load schema asynchronously (for $ref resolution)
   */
  private async loadSchemaAsync(uri: string): Promise<JsonObject> {
    // Implementation for loading external schema references
    // Used for schema composition and $ref resolution
    this.logger.info(`Loading external schema: ${uri}`);

    try {
      // Support HTTP/HTTPS URLs and file paths
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } else if (uri.startsWith('file://') || !uri.includes('://')) {
        // File path - use fs to load
        const fs = require('fs').promises;
        const path = require('path');
        const filePath = uri.startsWith('file://') ? uri.slice(7) : uri;
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
        const content = await fs.readFile(absolutePath, 'utf-8');
        return JSON.parse(content);
      } else {
        throw new Error(`Unsupported URI scheme: ${uri}`);
      }
    } catch (error) {
      this.logger.error(`Failed to load schema from ${uri}:`, error);
      throw new Error(`Schema loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all available document types
   */
  getAvailableTypes(): string[] {
    return Object.keys(this.schemas);
  }

  /**
   * Check if document type is available in mode
   */
  isAvailableInMode(
    documentType: string,
    mode: 'kanban' | 'agile' | 'safe',
  ): boolean {
    const schema = this.schemas[documentType];
    return schema ? schema.modes.includes(mode) : false;
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): {
    totalSchemas: number;
    schemasByMode: Record<string, number>;
    averageValidationTime: number;
    } {
    const schemasByMode = {
      kanban: 0,
      agile: 0,
      safe: 0,
    };

    Object.values(this.schemas).forEach((schema) => {
      schema.modes.forEach((mode) => {
        schemasByMode[mode]++;
      });
    });

    return {
      totalSchemas: Object.keys(this.schemas).length,
      schemasByMode,
      averageValidationTime: 0, // Would track actual validation performance
    };
  }
}

// ============================================================================
// DI CONTAINER INTEGRATION
// ============================================================================

/**
 * DI token for JsonSchemaManager
 */
export const JSON_SCHEMA_MANAGER_TOKEN = Symbol('JsonSchemaManager');

/**
 * Create JsonSchemaManager with DI
 */
export function createJsonSchemaManager(
  logger: Logger,
  schemasPath?: string,
): JsonSchemaManager {
  return new JsonSchemaManager(logger, schemasPath);
}
