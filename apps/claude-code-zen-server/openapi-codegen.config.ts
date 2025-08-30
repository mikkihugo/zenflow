/**
 * OpenAPI TypeScript Code Generation Configuration
 *
 * Generates type-safe TypeScript clients and types from OpenAPI specifications
 * Optimized for AI tool integration and development efficiency
 */

import type { ConfigFile } from 'openapi-typescript-codegen';

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
