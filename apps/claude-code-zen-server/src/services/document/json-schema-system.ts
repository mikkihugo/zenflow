/**
 * @fileoverview JSON Schema System - Standards-Compliant Schema Management
 * 
 * Implements JSON Schema Draft 7 with AJV validation for maximum standards
 * compliance and seamless migration to Erlang/Gleam/Elixir systems.
 * 
 * Key Features:
 * - JSON Schema Draft 7 compliance (RFC 7159)
 * - AJV validation with strict mode
 * - Language-agnostic schema definitions
 * - Progressive enhancement support (Kanban → Agile → SAFe)
 * - Erlang/Elixir migration ready
 * 
 * Future Migration Path:
 * - TypeScript + AJV → Elixir + ExJsonSchema (same schema files)
 * - Prisma ORM → Ecto ORM (similar patterns)
 * - Node.js services → GenServers/GenStateMachines
 * 
 * @author Claude Code Zen Team  
 * @since 2.1.0
 * @version 1.0.0
 */

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Logger } from '@claude-zen/foundation';

// ============================================================================
// STANDARDS-COMPLIANT JSON SCHEMA SYSTEM
// ============================================================================

export interface SchemaRegistry {
  [schemaName: string]: {
    schema: any; // JSON Schema Draft 7
    validator: ValidateFunction;
    modes: ('kanban' | 'agile' | 'safe')[];
  };
}

export class JsonSchemaManager {
  private ajv: Ajv;
  private schemas: SchemaRegistry = {};
  private logger: Logger;
  private schemasPath: string;

  constructor(logger: Logger, schemasPath: string = './schemas') {
    this.logger = logger;
    this.schemasPath = schemasPath;
    
    // Configure AJV with strict standards compliance
    this.ajv = new Ajv({
      strict: true,              // Strict mode for standards compliance
      allErrors: true,           // Return all validation errors
      verbose: true,             // Detailed error information
      validateSchema: true,      // Validate schemas themselves
      addUsedSchema: false,      // Prevent schema pollution
      loadSchema: this.loadSchemaAsync.bind(this)
    });

    // Add standard formats (RFC 3339 dates, UUIDs, etc.)
    addFormats(this.ajv);

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
      'story.json'
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
  private registerSchema(name: string, schema: any): void {
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
        modes
      };

      this.logger.info(`Registered schema ${name} for modes: ${modes.join(', ')}`);
      
    } catch (error) {
      this.logger.error(`Failed to register schema ${name}:`, error);
      throw error;
    }
  }

  /**
   * Extract supported modes from schema metadata
   */
  private extractSupportedModes(schema: any): ('kanban' | 'agile' | 'safe')[] {
    // Check schema metadata for supported modes
    if (schema.metadata?.supportedModes) {
      return schema.metadata.supportedModes;
    }
    
    // Default: assume all modes supported
    return ['kanban', 'agile', 'safe'];
  }

  /**
   * Validate document against JSON Schema
   */
  validate(documentType: string, data: any, mode: 'kanban' | 'agile' | 'safe' = 'kanban'): {
    isValid: boolean;
    errors?: string[];
    data?: any;
  } {
    const schemaEntry = this.schemas[documentType];
    
    if (!schemaEntry) {
      return {
        isValid: false,
        errors: [`Unknown document type: ${documentType}`]
      };
    }

    if (!schemaEntry.modes.includes(mode)) {
      return {
        isValid: false,
        errors: [`Document type ${documentType} not available in ${mode} mode`]
      };
    }

    const isValid = schemaEntry.validator(data);
    
    if (!isValid) {
      const errors = schemaEntry.validator.errors?.map(err => 
        `${err.instancePath || 'root'}: ${err.message}`
      ) || ['Unknown validation error'];
      
      return { isValid: false, errors };
    }

    return { isValid: true, data };
  }

  /**
   * Get schema for document type and mode
   */
  getSchema(documentType: string, mode: 'kanban' | 'agile' | 'safe' = 'kanban'): any {
    const schemaEntry = this.schemas[documentType];
    
    if (!schemaEntry) {
      throw new Error(`Unknown document type: ${documentType}`);
    }

    if (!schemaEntry.modes.includes(mode)) {
      throw new Error(`Document type ${documentType} not available in ${mode} mode`);
    }

    return schemaEntry.schema;
  }

  /**
   * Create document with defaults and validation
   */
  createDocument(
    documentType: string,
    data: any,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban'
  ): any {
    // Apply schema defaults
    const schema = this.getSchema(documentType, mode);
    const documentWithDefaults = this.applyDefaults(schema, data);
    
    // Add schema metadata
    documentWithDefaults.schema_version = this.getSchemaVersion(documentType, mode);
    documentWithDefaults.schema_mode = mode;
    
    // Validate
    const validation = this.validate(documentType, documentWithDefaults, mode);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }

    return documentWithDefaults;
  }

  /**
   * Apply schema defaults to data
   */
  private applyDefaults(schema: any, data: any): any {
    const result = { ...data };
    
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (result[key] === undefined && (prop as any).default !== undefined) {
          result[key] = (prop as any).default;
        }
      }
    }
    
    return result;
  }

  /**
   * Get schema version for mode
   */
  private getSchemaVersion(documentType: string, mode: 'kanban' | 'agile' | 'safe'): string {
    const modeVersionMap = {
      kanban: '1.0.0',
      agile: '2.0.0', 
      safe: '3.0.0'
    };
    
    return modeVersionMap[mode];
  }

  /**
   * Load schema asynchronously (for $ref resolution)
   */
  private async loadSchemaAsync(uri: string): Promise<any> {
    // Implementation for loading external schema references
    // This would be used for schema composition and references
    this.logger.info(`Loading external schema: ${uri}`);
    return {};
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
  isAvailableInMode(documentType: string, mode: 'kanban' | 'agile' | 'safe'): boolean {
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
      safe: 0
    };

    Object.values(this.schemas).forEach(schema => {
      schema.modes.forEach(mode => {
        schemasByMode[mode]++;
      });
    });

    return {
      totalSchemas: Object.keys(this.schemas).length,
      schemasByMode,
      averageValidationTime: 0 // Would track actual validation performance
    };
  }
}

// ============================================================================
// ERLANG/ELIXIR MIGRATION HELPERS
// ============================================================================

/**
 * Export schemas in Erlang/Elixir-friendly format
 */
export function exportSchemasForElixir(manager: JsonSchemaManager): Record<string, any> {
  const schemas: Record<string, any> = {};
  
  manager.getAvailableTypes().forEach(type => {
    schemas[type] = {
      kanban: manager.isAvailableInMode(type, 'kanban') ? manager.getSchema(type, 'kanban') : null,
      agile: manager.isAvailableInMode(type, 'agile') ? manager.getSchema(type, 'agile') : null, 
      safe: manager.isAvailableInMode(type, 'safe') ? manager.getSchema(type, 'safe') : null
    };
  });

  return schemas;
}

/**
 * Generate Elixir validation modules
 */
export function generateElixirValidationModule(
  documentType: string, 
  schema: any
): string {
  const moduleName = documentType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  return `
defmodule DocumentSchemas.${moduleName} do
  @moduledoc """
  ${documentType} validation using JSON Schema
  
  This module was auto-generated from JSON Schema definitions
  and provides validation compatible with the TypeScript implementation.
  """

  @schema ${JSON.stringify(schema, null, 2)}

  def validate(data) do
    case ExJsonSchema.Validator.validate(@schema, data) do
      :ok -> {:ok, data}
      {:error, errors} -> {:error, format_errors(errors)}
    end
  end

  defp format_errors(errors) do
    Enum.map(errors, fn {path, message} ->
      "\#{path}: \#{message}"
    end)
  end
end
  `.trim();
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const jsonSchemaManager = new JsonSchemaManager({
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args)
});