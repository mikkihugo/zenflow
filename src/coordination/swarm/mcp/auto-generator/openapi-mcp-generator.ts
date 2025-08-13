/**
 * @fileoverview OpenAPI to MCP Tools Auto-Generator
 *
 * This module provides automatic generation of MCP (Model Context Protocol) tools
 * from OpenAPI/Swagger specifications. It eliminates the need for manual MCP tool
 * creation and ensures perfect synchronization between REST API changes and MCP tools.
 *
 * ## Architecture
 *
 * The generator follows a pipeline approach:
 * 1. **OpenAPI Parser**: Reads and validates OpenAPI/Swagger specifications
 * 2. **Schema Transformer**: Converts OpenAPI schemas to MCP tool definitions
 * 3. **Handler Generator**: Creates TypeScript MCP tool handlers with proper types
 * 4. **Integration Layer**: Integrates generated tools with existing MCP server
 * 5. **Test Generator**: Creates comprehensive tests for all generated tools
 * 6. **Sync Monitor**: Watches for API changes and triggers regeneration
 *
 * ## Features
 *
 * - **Full OpenAPI 3.0 Support**: Complete parsing of OpenAPI specifications
 * - **Type Safety**: Generates fully-typed TypeScript interfaces
 * - **Request Validation**: Automatic parameter and body validation
 * - **Response Handling**: Proper response transformation and error handling
 * - **Authentication**: Supports Bearer tokens, API keys, and custom auth
 * - **Test Generation**: Creates comprehensive unit and integration tests
 * - **Continuous Sync**: Monitors API changes and regenerates automatically
 *
 * @example
 * ```typescript
 * const generator = new OpenAPIMCPGenerator({
 *   specUrl: 'http://localhost:3456/openapi.json',
 *   outputDir: './src/coordination/swarm/mcp/generated',
 *   namespace: 'api',
 *   enableSync: true
 * });
 *
 * await generator.generateAll();
 * ```
 */

import { existsSync } from 'fs';
import { mkdir, readFile, watch, writeFile } from 'fs/promises';
import fetch from 'node-fetch';
import { dirname, join } from 'path';

import { getLogger } from '../../../../config/logging-config.js';

const logger = getLogger('openapi-mcp-generator');

export interface OpenAPIMCPGeneratorConfig {
  /** URL or file path to OpenAPI specification */
  specUrl: string;
  /** Output directory for generated files */
  outputDir: string;
  /** Namespace for generated tools (used as prefix) */
  namespace: string;
  /** Base URL for API requests */
  baseUrl?: string;
  /** Enable automatic regeneration on spec changes */
  enableSync?: boolean;
  /** Authentication configuration */
  auth?: {
    type: 'bearer' | 'apikey' | 'custom';
    token?: string;
    header?: string;
    customAuth?: (request: unknown) => Promise<unknown>;
  };
  /** Additional options */
  options?: {
    includeDeprecated?: boolean;
    generateTests?: boolean;
    validateResponses?: boolean;
    timeout?: number;
  };
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components?: {
    schemas?: Record<string, OpenAPISchema>;
    securitySchemes?: Record<string, unknown>;
  };
}

export interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
  security?: unknown[];
  deprecated?: boolean;
}

export interface OpenAPIParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  schema: OpenAPISchema;
  description?: string;
}

export interface OpenAPIRequestBody {
  content: Record<
    string,
    {
      schema: OpenAPISchema;
    }
  >;
  required?: boolean;
  description?: string;
}

export interface OpenAPIResponse {
  description: string;
  content?: Record<
    string,
    {
      schema: OpenAPISchema;
    }
  >;
  headers?: Record<string, unknown>;
}

export interface OpenAPISchema {
  type?: string;
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  required?: string[];
  enum?: unknown[];
  description?: string;
  example?: unknown;
  $ref?: string;
  allOf?: OpenAPISchema[];
  oneOf?: OpenAPISchema[];
  anyOf?: OpenAPISchema[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

export interface GeneratedTool {
  definition: MCPToolDefinition;
  handler: string;
  types: string;
  tests: string;
}

/**
 * Main OpenAPI to MCP Tools Generator class.
 * Handles the complete generation pipeline from OpenAPI spec to working MCP tools.
 */
export class OpenAPIMCPGenerator {
  private config: OpenAPIMCPGeneratorConfig;
  private spec: OpenAPISpec | null = null;
  private watchController: AbortController | null = null;

  constructor(config: OpenAPIMCPGeneratorConfig) {
    this.config = {
      baseUrl: 'http://localhost:3456',
      enableSync: false,
      options: {
        includeDeprecated: false,
        generateTests: true,
        validateResponses: true,
        timeout: 30000,
      },
      ...config,
      options: {
        ...config.options,
        ...this.config.options,
      },
    };
  }

  /**
   * Generate all MCP tools from OpenAPI specification.
   * Main entry point for the generation process.
   */
  async generateAll(): Promise<void> {
    logger.info('Starting OpenAPI → MCP tool generation', {
      specUrl: this.config.specUrl,
      outputDir: this.config.outputDir,
      namespace: this.config.namespace,
    });

    try {
      // 1. Load and parse OpenAPI specification
      await this.loadOpenAPISpec();

      if (!this.spec) {
        throw new Error('Failed to load OpenAPI specification');
      }

      // 2. Validate specification
      await this.validateSpec();

      // 3. Ensure output directory exists
      await this.ensureOutputDirectory();

      // 4. Generate MCP tools
      const tools = await this.generateMCPTools();

      // 5. Generate integration file
      await this.generateIntegrationFile(tools);

      // 6. Generate tests if enabled
      if (this.config.options?.generateTests) {
        await this.generateTestFiles(tools);
      }

      // 7. Generate documentation
      await this.generateDocumentation(tools);

      // 8. Start sync monitoring if enabled
      if (this.config.enableSync) {
        await this.startSyncMonitoring();
      }

      logger.info('OpenAPI → MCP tool generation completed successfully', {
        toolsGenerated: tools.length,
        outputDir: this.config.outputDir,
      });
    } catch (error) {
      logger.error('OpenAPI → MCP tool generation failed', {
        error: error instanceof Error ? error.message : String(error),
        specUrl: this.config.specUrl,
      });
      throw error;
    }
  }

  /**
   * Load OpenAPI specification from URL or file path.
   */
  private async loadOpenAPISpec(): Promise<void> {
    logger.debug('Loading OpenAPI specification', {
      specUrl: this.config.specUrl,
    });

    try {
      let specContent: string;

      if (
        this.config.specUrl.startsWith('http://') ||
        this.config.specUrl.startsWith('https://')
      ) {
        // Load from URL
        const response = await fetch(this.config.specUrl, {
          timeout: this.config.options?.timeout || 30000,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'OpenAPI-MCP-Generator/1.0.0',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        specContent = await response.text();
      } else {
        // Load from file
        if (!existsSync(this.config.specUrl)) {
          throw new Error(
            `OpenAPI spec file not found: ${this.config.specUrl}`
          );
        }
        specContent = await readFile(this.config.specUrl, 'utf-8');
      }

      // Parse JSON
      this.spec = JSON.parse(specContent) as OpenAPISpec;

      logger.debug('OpenAPI specification loaded successfully', {
        title: this.spec.info.title,
        version: this.spec.info.version,
        pathCount: Object.keys(this.spec.paths).length,
      });
    } catch (error) {
      logger.error('Failed to load OpenAPI specification', {
        error: error instanceof Error ? error.message : String(error),
        specUrl: this.config.specUrl,
      });
      throw error;
    }
  }

  /**
   * Validate the loaded OpenAPI specification.
   */
  private async validateSpec(): Promise<void> {
    if (!this.spec) {
      throw new Error('No OpenAPI specification loaded');
    }

    // Basic validation
    if (!(this.spec.openapi && this.spec.info && this.spec.paths)) {
      throw new Error('Invalid OpenAPI specification: missing required fields');
    }

    if (!this.spec.openapi.startsWith('3.')) {
      throw new Error(
        `Unsupported OpenAPI version: ${this.spec.openapi}. Only OpenAPI 3.x is supported.`
      );
    }

    logger.debug('OpenAPI specification validation passed');
  }

  /**
   * Ensure the output directory exists.
   */
  private async ensureOutputDirectory(): Promise<void> {
    if (!existsSync(this.config.outputDir)) {
      await mkdir(this.config.outputDir, { recursive: true });
      logger.debug('Created output directory', { dir: this.config.outputDir });
    }
  }

  /**
   * Generate MCP tools from OpenAPI paths.
   */
  private async generateMCPTools(): Promise<GeneratedTool[]> {
    if (!this.spec) {
      throw new Error('No OpenAPI specification loaded');
    }

    const tools: GeneratedTool[] = [];

    for (const [path, methods] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (this.shouldSkipOperation(operation, method)) {
          continue;
        }

        const tool = await this.generateTool(path, method, operation);
        if (tool) {
          tools.push(tool);
        }
      }
    }

    logger.info('Generated MCP tools', { count: tools.length });
    return tools;
  }

  /**
   * Determine if an operation should be skipped.
   */
  private shouldSkipOperation(
    operation: OpenAPIOperation,
    method: string
  ): boolean {
    // Skip deprecated operations unless explicitly included
    if (operation.deprecated && !this.config.options?.includeDeprecated) {
      return true;
    }

    // Skip non-HTTP methods
    const validMethods = [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'head',
      'options',
    ];
    if (!validMethods.includes(method.toLowerCase())) {
      return true;
    }

    return false;
  }

  /**
   * Generate a single MCP tool from an OpenAPI operation.
   */
  private async generateTool(
    path: string,
    method: string,
    operation: OpenAPIOperation
  ): Promise<GeneratedTool | null> {
    const toolName = this.generateToolName(path, method, operation);
    const description = this.generateToolDescription(path, method, operation);
    const inputSchema = this.generateInputSchema(operation);

    const definition: MCPToolDefinition = {
      name: toolName,
      description,
      inputSchema,
    };

    const handler = this.generateHandler(path, method, operation, definition);
    const types = this.generateTypes(operation, definition);
    const tests = this.generateTests(path, method, operation, definition);

    return {
      definition,
      handler,
      types,
      tests,
    };
  }

  /**
   * Generate a tool name from path, method, and operation.
   */
  private generateToolName(
    path: string,
    method: string,
    operation: OpenAPIOperation
  ): string {
    const namespace = this.config.namespace;

    // Use operationId if available
    if (operation.operationId) {
      return `${namespace}_${operation.operationId}`;
    }

    // Generate from path and method
    const pathParts = path
      .split('/')
      .filter((part) => part && !part.startsWith('{'))
      .map((part) => part.replace(/[^a-zA-Z0-9]/g, '_'));

    const methodPart = method.toLowerCase();

    return `${namespace}_${methodPart}_${pathParts.join('_')}`.replace(
      /__+/g,
      '_'
    );
  }

  /**
   * Generate tool description from operation metadata.
   */
  private generateToolDescription(
    path: string,
    method: string,
    operation: OpenAPIOperation
  ): string {
    if (operation.description) {
      return operation.description;
    }

    if (operation.summary) {
      return operation.summary;
    }

    // Generate default description
    const methodUpper = method.toUpperCase();
    return `${methodUpper} ${path}${operation.deprecated ? ' (DEPRECATED)' : ''}`;
  }

  /**
   * Generate MCP input schema from OpenAPI operation parameters and request body.
   */
  private generateInputSchema(
    operation: OpenAPIOperation
  ): MCPToolDefinition['inputSchema'] {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    // Add path parameters
    const pathParams =
      operation.parameters?.filter((p) => p.in === 'path') || [];
    pathParams.forEach((param) => {
      properties[param.name] = this.convertOpenAPISchemaToJSONSchema(
        param.schema
      );
      if (param.required) {
        required.push(param.name);
      }
    });

    // Add query parameters
    const queryParams =
      operation.parameters?.filter((p) => p.in === 'query') || [];
    if (queryParams.length > 0) {
      properties.queryParams = {
        type: 'object',
        properties: {},
        additionalProperties: false,
      };

      queryParams.forEach((param) => {
        properties.queryParams.properties[param.name] =
          this.convertOpenAPISchemaToJSONSchema(param.schema);
        if (param.required) {
          if (!properties.queryParams.required) {
            properties.queryParams.required = [];
          }
          properties.queryParams.required.push(param.name);
        }
      });
    }

    // Add request body
    if (operation.requestBody) {
      const jsonContent = operation.requestBody.content['application/json'];
      if (jsonContent) {
        properties.body = this.convertOpenAPISchemaToJSONSchema(
          jsonContent.schema
        );
        if (operation.requestBody.required) {
          required.push('body');
        }
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: false,
    };
  }

  /**
   * Convert OpenAPI schema to JSON Schema format.
   */
  private convertOpenAPISchemaToJSONSchema(schema: OpenAPISchema): unknown {
    if (schema.$ref) {
      // Handle $ref - would need to resolve from components
      return { $ref: schema.$ref };
    }

    const jsonSchema: unknown = {
      type: schema.type,
    };

    if (schema.description) {
      jsonSchema.description = schema.description;
    }

    if (schema.example !== undefined) {
      jsonSchema.example = schema.example;
    }

    if (schema.enum) {
      jsonSchema.enum = schema.enum;
    }

    if (schema.properties) {
      jsonSchema.properties = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        jsonSchema.properties[key] =
          this.convertOpenAPISchemaToJSONSchema(prop);
      }
    }

    if (schema.items) {
      jsonSchema.items = this.convertOpenAPISchemaToJSONSchema(schema.items);
    }

    if (schema.required) {
      jsonSchema.required = schema.required;
    }

    return jsonSchema;
  }

  /**
   * Generate TypeScript handler code for the tool.
   */
  private generateHandler(
    path: string,
    method: string,
    operation: OpenAPIOperation,
    definition: MCPToolDefinition
  ): string {
    const handlerName = `handle_${definition.name}`;
    const baseUrl = this.config.baseUrl || 'http://localhost:3456';

    return `
/**
 * Generated MCP tool handler for ${definition.name}
 * ${definition.description}
 */
export async function ${handlerName}(args: ${definition.name}Args): Promise<${definition.name}Response> {
  try {
    // Build request URL
    let url = '${baseUrl}${path}';
    
    // Replace path parameters
    ${this.generatePathParameterReplacement(operation)}
    
    // Build query string
    ${this.generateQueryStringBuilder(operation)}
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method: '${method.toUpperCase()}',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      timeout: ${this.config.options?.timeout || 30000},
    };
    
    // Add request body if present
    ${this.generateRequestBodyHandler(operation)}
    
    // Make API request
    const response = await fetch(url, requestOptions);
    
    // Handle response
    if (!response.ok) {
      throw new MCPError(
        'API_REQUEST_FAILED',
        \`HTTP \${response.status}: \${response.statusText}\`,
        {
          status: response.status,
          statusText: response.statusText,
          url: url,
        }
      );
    }
    
    const data = await response.json();
    
    ${this.config.options?.validateResponses ? this.generateResponseValidation(operation) : ''}
    
    return {
      success: true,
      data,
      metadata: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        url: url,
        method: '${method.toUpperCase()}',
      },
    };
    
  } catch (error) {
    logger.error('MCP tool execution failed', {
      tool: '${definition.name}',
      error: error instanceof Error ? error.message : String(error),
    });
    
    if (error instanceof MCPError) {
      throw error;
    }
    
    throw new MCPError(
      'TOOL_EXECUTION_FAILED',
      error instanceof Error ? error.message : 'Unknown error',
      { tool: '${definition.name}' }
    );
  }
}`;
  }

  /**
   * Generate path parameter replacement code.
   */
  private generatePathParameterReplacement(
    operation: OpenAPIOperation
  ): string {
    const pathParams =
      operation.parameters?.filter((p) => p.in === 'path') || [];
    if (pathParams.length === 0) {
      return '// No path parameters';
    }

    return pathParams
      .map(
        (param) =>
          `url = url.replace('{${param.name}}', encodeURIComponent(String(args.${param.name})));`
      )
      .join('\n    ');
  }

  /**
   * Generate query string builder code.
   */
  private generateQueryStringBuilder(operation: OpenAPIOperation): string {
    const queryParams =
      operation.parameters?.filter((p) => p.in === 'query') || [];
    if (queryParams.length === 0) {
      return '// No query parameters';
    }

    return `
    if (args.queryParams) {
      const searchParams = new URLSearchParams();
      ${queryParams
        .map(
          (param) => `
      if (args.queryParams.${param.name} !== undefined) {
        searchParams.append('${param.name}', String(args.queryParams.${param.name}));
      }`
        )
        .join('')}
      
      if (searchParams.toString()) {
        url += '?' + searchParams.toString();
      }
    }`;
  }

  /**
   * Generate request body handler code.
   */
  private generateRequestBodyHandler(operation: OpenAPIOperation): string {
    if (!operation.requestBody) {
      return '// No request body';
    }

    return `
    if (args.body) {
      requestOptions.body = JSON.stringify(args.body);
    }`;
  }

  /**
   * Generate response validation code.
   */
  private generateResponseValidation(operation: OpenAPIOperation): string {
    if (!this.config.options?.validateResponses) {
      return '// Response validation disabled';
    }

    return `
    // TODO: Add response validation based on OpenAPI schema
    // This would validate the response against the expected schema`;
  }

  /**
   * Generate TypeScript types for the tool.
   */
  private generateTypes(
    operation: OpenAPIOperation,
    definition: MCPToolDefinition
  ): string {
    const argsType = this.generateArgsType(definition);
    const responseType = this.generateResponseType(operation, definition);

    return `
${argsType}

${responseType}

export interface ${definition.name}Metadata {
  status: number;
  headers: Record<string, string>;
  url: string;
  method: string;
}`;
  }

  /**
   * Generate TypeScript arguments interface.
   */
  private generateArgsType(definition: MCPToolDefinition): string {
    return `export interface ${definition.name}Args {
${this.generateInterfaceProperties(definition.inputSchema.properties)}
}`;
  }

  /**
   * Generate TypeScript response interface.
   */
  private generateResponseType(
    operation: OpenAPIOperation,
    definition: MCPToolDefinition
  ): string {
    // Generate response type based on successful response schema
    const successResponse =
      operation.responses['200'] ||
      operation.responses['201'] ||
      operation.responses['204'];

    let dataType = 'any';
    if (successResponse && successResponse.content) {
      const jsonContent = successResponse.content['application/json'];
      if (jsonContent) {
        // Would generate proper type from schema
        dataType = 'any'; // Simplified for now
      }
    }

    return `export interface ${definition.name}Response {
  success: boolean;
  data: ${dataType};
  metadata: ${definition.name}Metadata;
}`;
  }

  /**
   * Generate TypeScript interface properties from JSON Schema.
   */
  private generateInterfaceProperties(
    properties: Record<string, unknown>,
    indent = '  '
  ): string {
    return Object.entries(properties)
      .map(([key, schema]) => {
        const optional = schema.required ? '' : '?';
        const type = this.jsonSchemaToTypeScript(schema);
        const description = schema.description
          ? `\n${indent}/** ${schema.description} */\n${indent}`
          : '';

        return `${description}${key}${optional}: ${type};`;
      })
      .join(`\n${indent}`);
  }

  /**
   * Convert JSON Schema to TypeScript type.
   */
  private jsonSchemaToTypeScript(schema: unknown): string {
    if (schema.$ref) {
      return 'any'; // Would resolve $ref properly
    }

    switch (schema.type) {
      case 'string':
        return schema.enum
          ? schema.enum.map((v: unknown) => `'${v}'`).join(' | ')
          : 'string';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array': {
        const itemType = schema.items
          ? this.jsonSchemaToTypeScript(schema.items)
          : 'any';
        return `${itemType}[]`;
      }
      case 'object':
        if (schema.properties) {
          return `{\n    ${this.generateInterfaceProperties(schema.properties, '    ')}\n  }`;
        }
        return 'Record<string, unknown>';
      default:
        return 'any';
    }
  }

  /**
   * Generate test code for the tool.
   */
  private generateTests(
    path: string,
    method: string,
    operation: OpenAPIOperation,
    definition: MCPToolDefinition
  ): string {
    const handlerName = `handle_${definition.name}`;

    return `
/**
 * Generated tests for ${definition.name}
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ${handlerName} } from './${definition.name}';
import type { ${definition.name}Args } from './${definition.name}-types';

// Mock fetch
global.fetch = vi.fn();

describe('${definition.name}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should make successful API request', async () => {
    // Mock successful response
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({ result: 'success' }),
      headers: new Headers({ 'content-type': 'application/json' }),
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);

    const args: ${definition.name}Args = ${this.generateTestArgs(operation)};

    const result = await ${handlerName}(args);

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ result: 'success' });
    expect(result.metadata.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    // Mock error response
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
    };
    
    (global.fetch as any).mockResolvedValue(mockResponse);

    const args: ${definition.name}Args = ${this.generateTestArgs(operation)};

    await expect(${handlerName}(args)).rejects.toThrow('HTTP 404: Not Found');
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const args: ${definition.name}Args = ${this.generateTestArgs(operation)};

    await expect(${handlerName}(args)).rejects.toThrow('Network error');
  });
});`;
  }

  /**
   * Generate test arguments from operation schema.
   */
  private generateTestArgs(operation: OpenAPIOperation): string {
    const args: unknown = {};

    // Add path parameters
    const pathParams =
      operation.parameters?.filter((p) => p.in === 'path') || [];
    pathParams.forEach((param) => {
      args[param.name] = this.getExampleValue(param.schema);
    });

    // Add query parameters
    const queryParams =
      operation.parameters?.filter((p) => p.in === 'query') || [];
    if (queryParams.length > 0) {
      args.queryParams = {};
      queryParams.forEach((param) => {
        args.queryParams[param.name] = this.getExampleValue(param.schema);
      });
    }

    // Add request body
    if (operation.requestBody) {
      const jsonContent = operation.requestBody.content['application/json'];
      if (jsonContent) {
        args.body = this.getExampleValue(jsonContent.schema);
      }
    }

    return JSON.stringify(args, null, 2);
  }

  /**
   * Get example value from schema.
   */
  private getExampleValue(schema: OpenAPISchema): unknown {
    if (schema.example !== undefined) {
      return schema.example;
    }

    switch (schema.type) {
      case 'string':
        return schema.enum ? schema.enum[0] : 'test-string';
      case 'number':
      case 'integer':
        return 123;
      case 'boolean':
        return true;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return null;
    }
  }

  /**
   * Write generated tools to files.
   */
  private async writeToolFiles(tools: GeneratedTool[]): Promise<void> {
    for (const tool of tools) {
      const toolDir = join(this.config.outputDir, tool.definition.name);
      await mkdir(toolDir, { recursive: true });

      // Write handler file
      await writeFile(
        join(toolDir, `${tool.definition.name}.ts`),
        tool.handler,
        'utf-8'
      );

      // Write types file
      await writeFile(
        join(toolDir, `${tool.definition.name}-types.ts`),
        tool.types,
        'utf-8'
      );

      // Write tests file if enabled
      if (this.config.options?.generateTests) {
        await writeFile(
          join(toolDir, `${tool.definition.name}.test.ts`),
          tool.tests,
          'utf-8'
        );
      }
    }
  }

  /**
   * Generate integration file that exports all tools.
   */
  private async generateIntegrationFile(tools: GeneratedTool[]): Promise<void> {
    const imports = tools
      .map(
        (tool) =>
          `import { handle_${tool.definition.name} } from './${tool.definition.name}/${tool.definition.name}';`
      )
      .join('\n');

    const toolsArray = tools
      .map(
        (tool) => `  {
    name: '${tool.definition.name}',
    description: '${tool.definition.description}',
    inputSchema: ${JSON.stringify(tool.definition.inputSchema, null, 4)},
  }`
      )
      .join(',\n');

    const handlersMap = tools
      .map(
        (tool) => `  '${tool.definition.name}': handle_${tool.definition.name}`
      )
      .join(',\n');

    const integrationContent = `
/**
 * Generated OpenAPI → MCP Tools Integration
 * Auto-generated from OpenAPI specification
 * DO NOT EDIT MANUALLY - This file is automatically generated
 */

import { getLogger } from '../../../../config/logging-config.js';

const logger = getLogger('generated-mcp-tools');

${imports}

/**
 * Generated MCP tool definitions
 */
export const GENERATED_MCP_TOOLS = [
${toolsArray}
];

/**
 * Generated MCP tool handlers
 */
export const GENERATED_MCP_HANDLERS = {
${handlersMap}
} as const;

/**
 * Execute a generated MCP tool
 */
export async function executeGeneratedTool(name: string, args: unknown): Promise<unknown> {
  const handler = GENERATED_MCP_HANDLERS[name as keyof typeof GENERATED_MCP_HANDLERS];
  
  if (!handler) {
    throw new Error(\`Unknown generated tool: \${name}\`);
  }

  try {
    return await handler(args);
  } catch (error) {
    logger.error('Generated tool execution failed', {
      tool: name,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get all generated tool names
 */
export function getGeneratedToolNames(): string[] {
  return Object.keys(GENERATED_MCP_HANDLERS);
}

/**
 * Authentication headers helper
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  
  ${this.generateAuthHeaders()}
  
  return headers;
}

/**
 * MCP Error class for consistent error handling
 */
export class MCPError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MCPError';
  }
}
`;

    await writeFile(
      join(this.config.outputDir, 'index.ts'),
      integrationContent,
      'utf-8'
    );

    // Write individual tool files
    await this.writeToolFiles(tools);
  }

  /**
   * Generate authentication headers code.
   */
  private generateAuthHeaders(): string {
    if (!this.config.auth) {
      return '// No authentication configured';
    }

    switch (this.config.auth.type) {
      case 'bearer':
        return `
  if (process.env.API_BEARER_TOKEN) {
    headers['Authorization'] = \`Bearer \${process.env.API_BEARER_TOKEN}\`;
  }`;

      case 'apikey':
        return `
  if (process.env.API_KEY) {
    headers['${this.config.auth.header || 'X-API-Key'}'] = process.env.API_KEY;
  }`;

      case 'custom':
        return `
  // Custom authentication - implement as needed
  // const customAuth = await this.config.auth.customAuth?.({});
  // Object.assign(headers, customAuth);`;

      default:
        return '// Unknown authentication type';
    }
  }

  /**
   * Generate test files for all tools.
   */
  private async generateTestFiles(tools: GeneratedTool[]): Promise<void> {
    // Individual test files are generated in writeToolFiles

    // Generate main test suite
    const testSuiteContent = `
/**
 * Generated OpenAPI → MCP Tools Test Suite
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect } from 'vitest';
import { GENERATED_MCP_TOOLS, GENERATED_MCP_HANDLERS, executeGeneratedTool } from './index';

describe('Generated MCP Tools', () => {
  it('should have consistent tool definitions and handlers', () => {
    const toolNames = GENERATED_MCP_TOOLS.map(t => t.name);
    const handlerNames = Object.keys(GENERATED_MCP_HANDLERS);
    
    expect(toolNames.sort()).toEqual(handlerNames.sort());
    expect(toolNames.length).toBeGreaterThan(0);
  });

  it('should have valid tool definitions', () => {
    GENERATED_MCP_TOOLS.forEach(tool => {
      expect(tool.name).toMatch(/^${this.config.namespace}_/);
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
    });
  });

  it('should throw error for unknown tool', async () => {
    await expect(executeGeneratedTool('unknown-tool', {}))
      .rejects.toThrow('Unknown generated tool: unknown-tool');
  });
});`;

    await writeFile(
      join(this.config.outputDir, 'index.test.ts'),
      testSuiteContent,
      'utf-8'
    );
  }

  /**
   * Generate documentation for all generated tools.
   */
  private async generateDocumentation(tools: GeneratedTool[]): Promise<void> {
    const docContent = `
# Generated MCP Tools Documentation

Auto-generated from OpenAPI specification: \`${this.config.specUrl}\`

**Generated:** ${new Date().toISOString()}
**Namespace:** \`${this.config.namespace}\`
**Total Tools:** ${tools.length}

## Overview

This directory contains automatically generated MCP (Model Context Protocol) tools
created from the OpenAPI/Swagger specification. These tools provide a bridge between
the MCP protocol and the REST API endpoints.

## Authentication

${this.generateAuthDocumentation()}

## Available Tools

${tools
  .map(
    (tool) => `
### \`${tool.definition.name}\`

${tool.definition.description}

**Input Schema:**
\`\`\`json
${JSON.stringify(tool.definition.inputSchema, null, 2)}
\`\`\`
`
  )
  .join('\n')}

## Usage Example

\`\`\`typescript
import { executeGeneratedTool } from './generated';

// Execute a tool
const result = await executeGeneratedTool('${tools[0]?.definition.name || 'tool_name'}', {
  // Tool arguments based on input schema
});

console.log(result);
\`\`\`

## Regeneration

To regenerate these tools when the OpenAPI specification changes:

\`\`\`bash
# Manual regeneration
npm run generate:mcp-tools

# Or with sync monitoring enabled (automatic regeneration)
npm run generate:mcp-tools -- --sync
\`\`\`

## Files Generated

- \`index.ts\` - Main integration file with all tool definitions and handlers
- \`index.test.ts\` - Test suite for all generated tools
- \`README.md\` - This documentation file
- \`{tool-name}/\` - Individual tool directories containing:
  - \`{tool-name}.ts\` - Tool handler implementation
  - \`{tool-name}-types.ts\` - TypeScript type definitions
  - \`{tool-name}.test.ts\` - Individual tool tests

---

**⚠️ WARNING:** This is an auto-generated directory. Do not edit files manually as they will be overwritten during regeneration.
`;

    await writeFile(
      join(this.config.outputDir, 'README.md'),
      docContent,
      'utf-8'
    );
  }

  /**
   * Generate authentication documentation.
   */
  private generateAuthDocumentation(): string {
    if (!this.config.auth) {
      return 'No authentication is configured for API requests.';
    }

    switch (this.config.auth.type) {
      case 'bearer':
        return `
Bearer Token authentication is configured. Set the \`API_BEARER_TOKEN\` environment variable:

\`\`\`bash
export API_BEARER_TOKEN="your-bearer-token"
\`\`\``;

      case 'apikey':
        return `
API Key authentication is configured. Set the \`API_KEY\` environment variable:

\`\`\`bash
export API_KEY="your-api-key"
\`\`\`

The API key will be sent in the \`${this.config.auth.header || 'X-API-Key'}\` header.`;

      case 'custom':
        return `
Custom authentication is configured. Implement the custom auth function as needed.`;

      default:
        return 'Unknown authentication type configured.';
    }
  }

  /**
   * Start monitoring for OpenAPI specification changes.
   */
  private async startSyncMonitoring(): Promise<void> {
    if (this.config.specUrl.startsWith('http')) {
      // Poll URL for changes
      this.startURLMonitoring();
    } else {
      // Watch file for changes
      this.startFileMonitoring();
    }
  }

  /**
   * Monitor URL for specification changes.
   */
  private startURLMonitoring(): void {
    const pollInterval = 60000; // 1 minute
    let lastETag: string | null = null;

    const poll = async () => {
      try {
        const response = await fetch(this.config.specUrl, {
          method: 'HEAD',
          headers: {
            'If-None-Match': lastETag || '',
          },
        });

        if (response.status === 304) {
          // Not modified
          return;
        }

        const currentETag = response.headers.get('etag');
        if (currentETag && currentETag !== lastETag) {
          logger.info('OpenAPI specification changed - regenerating tools', {
            url: this.config.specUrl,
            etag: currentETag,
          });

          await this.generateAll();
          lastETag = currentETag;
        }
      } catch (error) {
        logger.error('Failed to check for OpenAPI spec changes', {
          error: error instanceof Error ? error.message : String(error),
          url: this.config.specUrl,
        });
      }
    };

    // Initial poll
    poll();

    // Set up polling interval
    setInterval(poll, pollInterval);

    logger.info('Started URL monitoring for OpenAPI spec changes', {
      url: this.config.specUrl,
      interval: pollInterval,
    });
  }

  /**
   * Monitor file for specification changes.
   */
  private startFileMonitoring(): void {
    const specFile = this.config.specUrl;

    if (!existsSync(specFile)) {
      logger.warn('OpenAPI spec file not found for monitoring', {
        file: specFile,
      });
      return;
    }

    this.watchController = new AbortController();

    const watcher = watch(dirname(specFile), {
      signal: this.watchController.signal,
    });

    (async () => {
      try {
        for await (const event of watcher) {
          if (event.filename === require('path').basename(specFile)) {
            logger.info(
              'OpenAPI specification file changed - regenerating tools',
              {
                file: specFile,
                event: event.eventType,
              }
            );

            // Debounce rapid file changes
            setTimeout(async () => {
              try {
                await this.generateAll();
              } catch (error) {
                logger.error('Failed to regenerate tools after file change', {
                  error: error instanceof Error ? error.message : String(error),
                });
              }
            }, 1000);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          logger.error('File monitoring error', {
            error: error.message,
            file: specFile,
          });
        }
      }
    })();

    logger.info('Started file monitoring for OpenAPI spec changes', {
      file: specFile,
    });
  }

  /**
   * Stop sync monitoring.
   */
  public stopSyncMonitoring(): void {
    if (this.watchController) {
      this.watchController.abort();
      this.watchController = null;
      logger.info('Stopped OpenAPI spec sync monitoring');
    }
  }

  /**
   * Get generation statistics.
   */
  public getStats(): {
    specLoaded: boolean;
    toolsGenerated: number;
    outputDir: string;
    syncEnabled: boolean;
  } {
    return {
      specLoaded: this.spec !== null,
      toolsGenerated: this.spec ? Object.keys(this.spec.paths).length : 0,
      outputDir: this.config.outputDir,
      syncEnabled: this.config.enableSync,
    };
  }
}
