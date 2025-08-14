import { existsSync } from 'fs';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import { getLogger } from '../../../../config/logging-config.js';
const logger = getLogger('mcp-to-api-converter');
export class MCPToAPIConverter {
    config;
    mcpTools = [];
    constructor(config) {
        this.config = {
            generateClient: true,
            basePath: '/api/v1/tools',
            auth: {
                required: true,
                type: 'bearer',
            },
            validation: {
                validateInputs: true,
                validateOutputs: true,
                strictMode: false,
            },
            ...config,
        };
    }
    async convertAll() {
        logger.info('Starting MCP tools → API conversion', {
            mcpDir: this.config.mcpToolsDir,
            apiDir: this.config.apiOutputDir,
            namespace: this.config.namespace,
        });
        try {
            await this.discoverMCPTools();
            await this.ensureOutputDirectory();
            const apis = await this.generateAPIEndpoints();
            await this.generateExpressRouter(apis);
            await this.generateOpenAPISpec(apis);
            if (this.config.generateClient) {
                await this.generateMCPClients(apis);
            }
            await this.generateAPITests(apis);
            await this.generateDocumentation(apis);
            logger.info('MCP tools → API conversion completed', {
                toolsConverted: this.mcpTools.length,
                apisGenerated: apis.length,
                outputDir: this.config.apiOutputDir,
            });
        }
        catch (error) {
            logger.error('MCP tools → API conversion failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    async discoverMCPTools() {
        const mcpFiles = await this.findMCPToolFiles(this.config.mcpToolsDir);
        for (const filePath of mcpFiles) {
            try {
                const tools = await this.extractMCPToolsFromFile(filePath);
                this.mcpTools.push(...tools);
            }
            catch (error) {
                logger.warn('Failed to extract MCP tools from file', {
                    file: filePath,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        logger.info('Discovered MCP tools', { count: this.mcpTools.length });
    }
    async findMCPToolFiles(dir) {
        const files = [];
        if (!existsSync(dir)) {
            return files;
        }
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                const subFiles = await this.findMCPToolFiles(fullPath);
                files.push(...subFiles);
            }
            else if (entry.isFile() && this.isMCPToolFile(entry.name)) {
                files.push(fullPath);
            }
        }
        return files;
    }
    isMCPToolFile(filename) {
        return ((filename.endsWith('-tools.ts') ||
            filename.endsWith('-tools.js') ||
            filename.includes('mcp') ||
            filename.includes('tool')) &&
            !filename.includes('.test.') &&
            !filename.includes('.spec.'));
    }
    async extractMCPToolsFromFile(filePath) {
        const content = await readFile(filePath, 'utf-8');
        const tools = [];
        const toolPatterns = [
            /(\w+):\s*{\s*name:\s*['"`]([^'"`]+)['"`],\s*description:\s*['"`]([^'"`]+)['"`],\s*inputSchema:\s*({[\s\S]*?}),?\s*}/g,
            /export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)[\s\S]*?\/\*\*[\s\S]*?\*\//g,
            /export\s+const\s+(\w+_TOOLS|\w+_MCP_TOOLS)\s*=\s*\[([\s\S]*?)\]/g,
        ];
        for (const pattern of toolPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                try {
                    const tool = this.parseToolDefinition(match, content, filePath);
                    if (tool) {
                        tools.push(tool);
                    }
                }
                catch (error) {
                    logger.debug('Failed to parse tool definition', {
                        file: filePath,
                        match: match[0].substring(0, 100),
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
        }
        const handlerPattern = /export\s+(?:async\s+)?function\s+(handle_\w+|execute_\w+)\s*\([^)]*\)/g;
        let handlerMatch;
        while ((handlerMatch = handlerPattern.exec(content)) !== null) {
            const handlerName = handlerMatch[1];
            const toolName = handlerName.replace(/^(handle_|execute_)/, '');
            const existingTool = tools.find((t) => t.name === toolName);
            if (existingTool) {
                existingTool.handler = this.extractFunctionCode(content, handlerMatch.index);
            }
        }
        return tools;
    }
    parseToolDefinition(match, content, filePath) {
        try {
            const toolName = match[1] || match[2];
            const description = match[3] || 'Generated from MCP tool';
            const inputSchema = {
                type: 'object',
                properties: {},
                required: [],
                additionalProperties: false,
            };
            const handler = this.findHandlerForTool(content, toolName);
            return {
                name: toolName,
                description,
                inputSchema,
                handler: handler || `// Handler for ${toolName} not found`,
                filePath,
            };
        }
        catch (error) {
            return null;
        }
    }
    findHandlerForTool(content, toolName) {
        const handlerPattern = new RegExp(`(export\\s+(?:async\\s+)?function\\s+(?:handle_${toolName}|execute_${toolName}|${toolName}_handler)\\s*\\([^)]*\\)[\\s\\S]*?^})`, 'm');
        const match = handlerPattern.exec(content);
        return match ? match[1] : '';
    }
    extractFunctionCode(content, startIndex) {
        let braceCount = 0;
        let started = false;
        let endIndex = startIndex;
        for (let i = startIndex; i < content.length; i++) {
            const char = content[i];
            if (char === '{') {
                braceCount++;
                started = true;
            }
            else if (char === '}') {
                braceCount--;
                if (started && braceCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }
        return content.substring(startIndex, endIndex);
    }
    async generateAPIEndpoints() {
        const apis = [];
        for (const tool of this.mcpTools) {
            const api = await this.generateAPIFromTool(tool);
            apis.push(api);
        }
        return apis;
    }
    async generateAPIFromTool(tool) {
        const endpoint = this.createAPIEndpointDefinition(tool);
        const handler = this.generateAPIHandler(tool, endpoint);
        const types = this.generateAPITypes(tool, endpoint);
        const tests = this.generateAPITest(tool, endpoint);
        const client = this.generateMCPClient(tool, endpoint);
        return {
            endpoint,
            handler,
            types,
            tests,
            client,
        };
    }
    createAPIEndpointDefinition(tool) {
        const toolPath = tool.name.replace(/_/g, '-').toLowerCase();
        return {
            path: `${this.config.basePath}/${this.config.namespace}/${toolPath}`,
            method: this.determineHTTPMethod(tool),
            operationId: `${this.config.namespace}_${tool.name}`,
            summary: tool.description || `Execute ${tool.name}`,
            description: `${tool.description}\n\nConverted from MCP tool: ${tool.name}`,
            tags: [this.config.namespace, 'tools', 'converted'],
            requestBody: this.createRequestBodySchema(tool),
            parameters: this.createParameterSchema(tool),
            responses: this.createResponseSchema(tool),
            security: this.config.auth?.required ? [{ bearerAuth: [] }] : undefined,
        };
    }
    determineHTTPMethod(tool) {
        const name = tool.name.toLowerCase();
        if (name.includes('get') ||
            name.includes('list') ||
            name.includes('status') ||
            name.includes('search')) {
            return 'GET';
        }
        if (name.includes('create') || name.includes('add')) {
            return 'POST';
        }
        if (name.includes('update') || name.includes('modify')) {
            return 'PUT';
        }
        if (name.includes('patch') || name.includes('edit')) {
            return 'PATCH';
        }
        if (name.includes('delete') || name.includes('remove')) {
            return 'DELETE';
        }
        return 'POST';
    }
    createRequestBodySchema(tool) {
        if (!tool.inputSchema.properties ||
            Object.keys(tool.inputSchema.properties).length === 0) {
            return undefined;
        }
        return {
            required: true,
            content: {
                'application/json': {
                    schema: tool.inputSchema,
                },
            },
        };
    }
    createParameterSchema(tool) {
        const method = this.determineHTTPMethod(tool);
        if (method !== 'GET' || !tool.inputSchema.properties) {
            return [];
        }
        return Object.entries(tool.inputSchema.properties).map(([name, schema]) => ({
            name,
            in: 'query',
            required: tool.inputSchema.required?.includes(name),
            schema,
            description: schema.description || `Parameter ${name}`,
        }));
    }
    createResponseSchema(tool) {
        return {
            '200': {
                description: 'Successful operation',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean', example: true },
                                data: { type: 'object', description: 'Operation result' },
                                metadata: {
                                    type: 'object',
                                    properties: {
                                        tool: { type: 'string', example: tool.name },
                                        executionTime: { type: 'number', example: 123 },
                                        timestamp: { type: 'string', format: 'date-time' },
                                    },
                                },
                            },
                            required: ['success', 'data'],
                        },
                    },
                },
            },
            '400': {
                description: 'Bad Request - Invalid input parameters',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                error: { type: 'string' },
                                code: { type: 'string', example: 'INVALID_INPUT' },
                                details: { type: 'object' },
                            },
                        },
                    },
                },
            },
            '401': {
                description: 'Unauthorized - Invalid or missing authentication',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                error: { type: 'string', example: 'Authentication required' },
                                code: { type: 'string', example: 'UNAUTHORIZED' },
                            },
                        },
                    },
                },
            },
            '500': {
                description: 'Internal Server Error - Tool execution failed',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                error: { type: 'string' },
                                code: { type: 'string', example: 'TOOL_EXECUTION_FAILED' },
                                details: { type: 'object' },
                            },
                        },
                    },
                },
            },
        };
    }
    generateAPIHandler(tool, endpoint) {
        const handlerName = `handle${this.toPascalCase(tool.name)}`;
        const importPath = this.getImportPathForTool(tool);
        return `
/**
 * Generated API handler for ${tool.name}
 * Converted from MCP tool
 */
import { Request, Response } from 'express';
import { getLogger } from '../../../../../config/logging-config.js';
${importPath ? `import { ${this.getOriginalHandlerName(tool)} } from '${importPath}';` : ''}

const logger = getLogger('api-${this.config.namespace}-${tool.name}');

export interface ${this.toPascalCase(tool.name)}Request {
${this.generateRequestInterface(tool, endpoint)}
}

export interface ${this.toPascalCase(tool.name)}Response {
  success: boolean;
  data: unknown;
  metadata: {
    tool: string;
    executionTime: number;
    timestamp: string;
  };
}

/**
 * ${endpoint.summary}
 */
export async function ${handlerName}(
  req: Request<any, ${this.toPascalCase(tool.name)}Response, ${this.toPascalCase(tool.name)}Request>,
  res: Response<${this.toPascalCase(tool.name)}Response>
): Promise<void> {
  const startTime = Date.now();
  
  try {
    logger.debug('API request received', { 
      tool: '${tool.name}',
      method: req.method,
      body: req.body,
      query: req.query,
    });

    // Extract parameters based on HTTP method
    const args = ${endpoint.method === 'GET' ? 'req.query' : 'req.body'};

    ${this.config.validation?.validateInputs ? this.generateInputValidation(tool) : '// Input validation disabled'}

    // Execute original MCP tool logic
    ${importPath
            ? `
    const result = await ${this.getOriginalHandlerName(tool)}(args);
    `
            : `
    // TODO: Implement tool logic for ${tool.name}
    const result = { message: 'Tool logic not yet implemented', args };
    `}

    const executionTime = Date.now() - startTime;

    // Return standardized API response
    const response: ${this.toPascalCase(tool.name)}Response = {
      success: true,
      data: result,
      metadata: {
        tool: '${tool.name}',
        executionTime,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);

    logger.debug('API request completed successfully', {
      tool: '${tool.name}',
      executionTime,
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    logger.error('API request failed', {
      tool: '${tool.name}',
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    });

    // Return error response
    res.status(error instanceof ValidationError ? 400 : 500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof ValidationError ? 'INVALID_INPUT' : 'TOOL_EXECUTION_FAILED',
      metadata: {
        tool: '${tool.name}',
        executionTime,
        timestamp: new Date().toISOString(),
      },
    } as any);
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
`;
    }
    generateAPITypes(tool, endpoint) {
        return `
/**
 * Generated TypeScript types for ${tool.name} API
 */

export interface ${this.toPascalCase(tool.name)}RequestBody {
${this.generateInterfaceFromSchema(tool.inputSchema, '  ')}
}

export interface ${this.toPascalCase(tool.name)}QueryParams {
${endpoint.method === 'GET' ? this.generateInterfaceFromSchema(tool.inputSchema, '  ') : '  // No query parameters for non-GET requests'}
}

export interface ${this.toPascalCase(tool.name)}Response {
  success: boolean;
  data: unknown;
  metadata: {
    tool: string;
    executionTime: number;
    timestamp: string;
  };
}

export interface ${this.toPascalCase(tool.name)}ErrorResponse {
  success: false;
  error: string;
  code: string;
  metadata: {
    tool: string;
    executionTime: number;
    timestamp: string;
  };
}
`;
    }
    generateAPITest(tool, endpoint) {
        return `
/**
 * Generated API tests for ${tool.name}
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ${this.generateHandlerName(tool)} } from './${tool.name}';

const app = express();
app.use(express.json());
app.${endpoint.method.toLowerCase()}('${endpoint.path}', ${this.generateHandlerName(tool)});

describe('${tool.name} API', () => {
  it('should handle successful requests', async () => {
    const testData = ${this.generateTestData(tool)};

    const response = await request(app)
      .${endpoint.method.toLowerCase()}('${endpoint.path}')
      ${endpoint.method === 'GET' ? '.query(testData)' : '.send(testData)'}
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.metadata.tool).toBe('${tool.name}');
    expect(response.body.metadata.executionTime).toBeGreaterThan(0);
  });

  it('should handle validation errors', async () => {
    const response = await request(app)
      .${endpoint.method.toLowerCase()}('${endpoint.path}')
      ${endpoint.method === 'GET' ? '.query({})' : '.send({})'}
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
    expect(response.body.code).toBe('INVALID_INPUT');
  });

  it('should include proper metadata', async () => {
    const testData = ${this.generateTestData(tool)};

    const response = await request(app)
      .${endpoint.method.toLowerCase()}('${endpoint.path}')
      ${endpoint.method === 'GET' ? '.query(testData)' : '.send(testData)'}
      .expect(200);

    expect(response.body.metadata).toMatchObject({
      tool: '${tool.name}',
      executionTime: expect.any(Number),
      timestamp: expect.any(String),
    });
  });
});
`;
    }
    generateMCPClient(tool, endpoint) {
        return `
/**
 * Generated MCP client wrapper for ${tool.name} API
 * This replaces the original MCP tool with an API client
 */
import fetch from 'node-fetch';
import { getLogger } from '../../../../../config/logging-config.js';

const logger = getLogger('mcp-client-${tool.name}');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3456';
const API_ENDPOINT = '${endpoint.path}';

/**
 * MCP Tool Definition (now API client)
 */
export const ${tool.name.toUpperCase()}_TOOL = {
  name: '${tool.name}',
  description: '${tool.description}',
  inputSchema: ${JSON.stringify(tool.inputSchema, null, 2)},
};

/**
 * MCP Tool Handler (now API client)
 */
export async function handle_${tool.name}(args: unknown): Promise<unknown> {
  try {
    logger.debug('Executing MCP tool via API', { 
      tool: '${tool.name}',
      endpoint: API_ENDPOINT,
    });

    const requestOptions: unknown = {
      method: '${endpoint.method}',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
    };

    // Add body or query params based on method
    let url = \`\${API_BASE_URL}\${API_ENDPOINT}\`;
    
    if ('${endpoint.method}' === 'GET') {
      // Add query parameters
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(args)) {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      }
      if (queryParams.toString()) {
        url += '?' + queryParams.toString();
      }
    } else {
      // Add body for POST/PUT/PATCH requests
      requestOptions.body = JSON.stringify(args);
    }

    // Make API request
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(\`API request failed: \${response.status} \${response.statusText}\`);
    }

    const result = await response.json();
    
    // Return the data portion (MCP expects just the data, not the wrapper)
    return result.data;

  } catch (error) {
    logger.error('MCP tool API request failed', {
      tool: '${tool.name}',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get authentication headers
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  
  ${this.generateAuthHeadersCode()}
  
  return headers;
}

// Export for MCP server registration
export const MCP_TOOL_DEFINITION = ${tool.name.toUpperCase()}_TOOL;
export const MCP_TOOL_HANDLER = handle_${tool.name};
`;
    }
    async ensureOutputDirectory() {
        if (!existsSync(this.config.apiOutputDir)) {
            await mkdir(this.config.apiOutputDir, { recursive: true });
        }
    }
    toPascalCase(str) {
        return str
            .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
            .replace(/^[a-z]/, (c) => c.toUpperCase());
    }
    generateHandlerName(tool) {
        return `handle${this.toPascalCase(tool.name)}`;
    }
    getImportPathForTool(tool) {
        return `../../../../../coordination/swarm/mcp/${basename(tool.filePath, '.ts')}`;
    }
    getOriginalHandlerName(tool) {
        return `handle_${tool.name}`;
    }
    generateRequestInterface(tool, endpoint) {
        return this.generateInterfaceFromSchema(tool.inputSchema, '  ');
    }
    generateInterfaceFromSchema(schema, indent) {
        if (!schema.properties) {
            return `${indent}[key: string]: unknown;`;
        }
        return Object.entries(schema.properties)
            .map(([key, prop]) => {
            const optional = schema.required?.includes(key) ? '' : '?';
            const type = this.schemaToTypeScript(prop);
            const description = prop.description
                ? `\n${indent}/** ${prop.description} */\n${indent}`
                : '';
            return `${description}${key}${optional}: ${type};`;
        })
            .join(`\n${indent}`);
    }
    schemaToTypeScript(schema) {
        switch (schema.type) {
            case 'string':
                return 'string';
            case 'number':
            case 'integer':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'array':
                return `${this.schemaToTypeScript(schema.items || { type: 'any' })}[]`;
            case 'object':
                return 'Record<string, unknown>';
            default:
                return 'any';
        }
    }
    generateInputValidation(tool) {
        return `
    // Input validation
    if (!args || typeof args !== 'object') {
      throw new ValidationError('Request body must be an object');
    }

    // Check required fields
    ${tool.inputSchema.required
            ? tool.inputSchema.required
                .map((field) => `
    if (args.${field} === undefined) {
      throw new ValidationError('Required field "${field}" is missing');
    }`)
                .join('')
            : '// No required fields'}
    `;
    }
    generateTestData(tool) {
        const testData = {};
        if (tool.inputSchema.properties) {
            for (const [key, schema] of Object.entries(tool.inputSchema.properties)) {
                testData[key] = this.generateTestValue(schema);
            }
        }
        return JSON.stringify(testData, null, 4);
    }
    generateTestValue(schema) {
        switch (schema.type) {
            case 'string':
                return 'test-string';
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
    generateAuthHeadersCode() {
        if (!this.config.auth?.required) {
            return '// No authentication required';
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
    headers['X-API-Key'] = process.env.API_KEY;
  }`;
            default:
                return '// Unknown auth type';
        }
    }
    async generateExpressRouter(apis) {
        const routerContent = `
/**
 * Generated Express.js router for converted MCP tools
 * Auto-generated - do not edit manually
 */
import express from 'express';
${apis.map((api) => `import { ${this.generateHandlerName(this.mcpTools.find((t) => t.name === api.endpoint.operationId.split('_').slice(-1)[0]))} } from './${this.mcpTools.find((t) => t.name === api.endpoint.operationId.split('_').slice(-1)[0]).name}';`).join('\n')}

const router = express.Router();

${apis
            .map((api) => {
            const tool = this.mcpTools.find((t) => api.endpoint.operationId.includes(t.name));
            return `
// ${api.endpoint.summary}
router.${api.endpoint.method.toLowerCase()}('/${tool.name}', ${this.generateHandlerName(tool)});`;
        })
            .join('\n')}

export default router;
`;
        await writeFile(join(this.config.apiOutputDir, 'router.ts'), routerContent, 'utf-8');
    }
    async generateOpenAPISpec(apis) {
        const spec = {
            openapi: '3.0.0',
            info: {
                title: `${this.config.namespace} API`,
                version: '1.0.0',
                description: `API endpoints converted from MCP tools in namespace: ${this.config.namespace}`,
            },
            servers: [
                {
                    url: 'http://localhost:3456',
                    description: 'Development server',
                },
            ],
            paths: {},
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        };
        for (const api of apis) {
            const path = api.endpoint.path.replace(this.config.basePath, '');
            if (!spec.paths[path]) {
                spec.paths[path] = {};
            }
            spec.paths[path][api.endpoint.method.toLowerCase()] = {
                operationId: api.endpoint.operationId,
                summary: api.endpoint.summary,
                description: api.endpoint.description,
                tags: api.endpoint.tags,
                parameters: api.endpoint.parameters,
                requestBody: api.endpoint.requestBody,
                responses: api.endpoint.responses,
                security: api.endpoint.security,
            };
        }
        await writeFile(join(this.config.apiOutputDir, 'openapi.json'), JSON.stringify(spec, null, 2), 'utf-8');
    }
    async generateAPITests(apis) {
        for (const api of apis) {
            const tool = this.mcpTools.find((t) => api.endpoint.operationId.includes(t.name));
            await writeFile(join(this.config.apiOutputDir, `${tool.name}.test.ts`), api.tests, 'utf-8');
        }
    }
    async generateMCPClients(apis) {
        const clientDir = join(this.config.apiOutputDir, '../mcp-clients');
        await mkdir(clientDir, { recursive: true });
        for (const api of apis) {
            const tool = this.mcpTools.find((t) => api.endpoint.operationId.includes(t.name));
            await writeFile(join(clientDir, `${tool.name}-client.ts`), api.client, 'utf-8');
        }
        const clientIndex = `
/**
 * Generated MCP clients for API endpoints
 * These replace the original MCP tools with API clients
 */
${apis
            .map((api) => {
            const tool = this.mcpTools.find((t) => api.endpoint.operationId.includes(t.name));
            return `export { MCP_TOOL_DEFINITION as ${tool.name.toUpperCase()}_TOOL, MCP_TOOL_HANDLER as ${tool.name}_handler } from './${tool.name}-client';`;
        })
            .join('\n')}

// Export all tools as array
export const ALL_CONVERTED_TOOLS = [
${apis
            .map((api) => {
            const tool = this.mcpTools.find((t) => api.endpoint.operationId.includes(t.name));
            return `  ${tool.name.toUpperCase()}_TOOL`;
        })
            .join(',\n')}
];

// Export all handlers as object
export const ALL_CONVERTED_HANDLERS = {
${apis
            .map((api) => {
            const tool = this.mcpTools.find((t) => api.endpoint.operationId.includes(t.name));
            return `  '${tool.name}': ${tool.name}_handler`;
        })
            .join(',\n')}
};
`;
        await writeFile(join(clientDir, 'index.ts'), clientIndex, 'utf-8');
    }
    async generateDocumentation(apis) {
        const documentation = `
# Converted MCP Tools → API Documentation

Auto-generated from MCP tools in namespace: **${this.config.namespace}**

**Generated:** ${new Date().toISOString()}
**Tools Converted:** ${this.mcpTools.length}
**APIs Created:** ${apis.length}

## Architecture

This conversion creates an **API-first architecture** where:

1. **All functionality is exposed as REST API endpoints**
2. **MCP tools become thin API clients**
3. **Consistent data validation and response format**
4. **Multi-protocol support** (REST, MCP, GraphQL possible)
5. **Better testing and caching capabilities**

## Conversion Benefits

- ✅ **Unified Interface**: Same data validation and response format
- ✅ **Better Testing**: Direct API testing vs MCP protocol testing
- ✅ **HTTP Caching**: Standard caching and CDN support
- ✅ **Load Balancing**: Standard HTTP load balancing
- ✅ **Monitoring**: Standard HTTP monitoring and metrics
- ✅ **Multi-Protocol**: Same functionality via REST, MCP, GraphQL
- ✅ **Documentation**: Single OpenAPI spec covers all functionality

## API Endpoints

${apis
            .map((api) => {
            const tool = this.mcpTools.find((t) => api.endpoint.operationId.includes(t.name));
            return `
### \`${api.endpoint.method} ${api.endpoint.path}\`

**Original MCP Tool:** \`${tool.name}\`
**Description:** ${api.endpoint.description}

**Tags:** ${api.endpoint.tags.join(', ')}

${api.endpoint.requestBody ? '**Request Body:** JSON object with tool parameters' : '**Parameters:** Query parameters'}

**Response:** Standardized JSON response with data, metadata, and success status
`;
        })
            .join('\n')}

## Usage Examples

### Direct API Usage

\`\`\`bash
# Example API call
curl -X POST "http://localhost:3456${this.config.basePath}/${this.config.namespace}/example-tool" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \$API_TOKEN" \\
  -d '{"param1": "value1"}'
\`\`\`

### MCP Client Usage (Backward Compatible)

\`\`\`typescript
import { ${this.mcpTools[0]?.name}_handler } from './mcp-clients';

// Same interface as original MCP tool
const result = await ${this.mcpTools[0]?.name}_handler({
  param1: 'value1'
});
\`\`\`

## Files Generated

- \`router.ts\` - Express.js router with all endpoints
- \`openapi.json\` - OpenAPI 3.0 specification
- \`{tool-name}.ts\` - Individual API handlers
- \`{tool-name}.test.ts\` - API tests
- \`mcp-clients/{tool-name}-client.ts\` - MCP client wrappers
- \`mcp-clients/index.ts\` - All MCP clients export
- \`README.md\` - This documentation

## Migration Path

1. **Phase 1: Dual Operation** (Current)
   - Original MCP tools continue working
   - New API endpoints available
   - MCP clients call APIs internally

2. **Phase 2: API-First** (Future)
   - All new functionality as APIs first
   - MCP tools generated from OpenAPI specs
   - Consistent development workflow

3. **Phase 3: Full Integration** (Future)
   - GraphQL layer on top of APIs
   - WebSocket real-time subscriptions
   - Advanced caching and optimization

---

**⚠️ Note:** This is auto-generated. Original MCP tools are still available for backward compatibility.
`;
        await writeFile(join(this.config.apiOutputDir, 'README.md'), documentation, 'utf-8');
    }
    getStats() {
        return {
            mcpToolsFound: this.mcpTools.length,
            namespace: this.config.namespace,
            outputDir: this.config.apiOutputDir,
            generateClient: this.config.generateClient,
        };
    }
}
export default MCPToAPIConverter;
//# sourceMappingURL=mcp-to-api-converter.js.map