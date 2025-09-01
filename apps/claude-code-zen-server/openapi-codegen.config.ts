/**
 * OpenAPI TypeScript Code Generation Configuration
 *
 * Generates type-safe TypeScript clients and types from OpenAPI specifications
 * Optimized for AI tool integration and development efficiency
 */

// import type { ConfigFile } from 'openapi-typescript-codegen';

// Temporary type definition to avoid TS2307 error
interface ConfigFile {
  input: string;
  output: string;
  client?: string;
  useOptions?: boolean;
  useUnionTypes?: boolean;
  exportModels?: boolean;
  exportSchemas?: boolean;
  indent?: number;
  postfixServices?: string;
  postfixModels?: string;
  request?: string;
  write?: boolean;
  format?: boolean;
  lint?: boolean;
  exportCore?: boolean;
  exportServices?: boolean;
}

const config: ConfigFile = {
  input: './docs/api/openapi.yaml',
  output: './src/generated',

  // Generate TypeScript client with full type safety
  client: 'axios',
  useOptions: true,
  useUnionTypes: true,
  exportModels: true,
  exportSchemas: true,

  // AI-friendly naming conventions
  indent: 2,
  postfixServices: 'Service',
  postfixModels: '',

  // Enhanced type generation for better AI integration
  request: './src/generated/core/request.ts',
  write: true,
  format: true,
  lint: false, // Disabled to prevent code corruption during manual fixes

  // Generate comprehensive API documentation
  exportCore: true,
  exportServices: true,
};

export default config;
