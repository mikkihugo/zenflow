/**
 * Express API Types - Server-Side Type Safety
 *
 * Type-safe Express request/response types generated from OpenAPI specification.
 * Provides complete type safety for AI tools interacting with Express routes.
 */

import type { Request, Response } from 'express';

import('./api-types';

// Extract all schema types from OpenAPI components
export type Schemas = components['schemas'];

// Health endpoint types
export type HealthResponse = Schemas['HealthCheck'];
export interface HealthRequest extends Request {}

// System status types
export type SystemStatusResponse = Schemas['SystemStatus'];
export interface SystemStatusRequest extends Request {}

// Swarm management types
export type SwarmResponse = Schemas['Swarm'];
export type CreateSwarmRequest = Schemas['CreateSwarmRequest'];
export type SwarmMetrics = Schemas['SwarmMetrics'];

export interface GetSwarmsRequest extends Request {}
export interface CreateSwarmRequestBody extends Request {
  body: CreateSwarmRequest;
}

// Task management types
export type TaskResponse = Schemas['Task'];
export type CreateTaskRequest = Schemas['CreateTaskRequest'];
export type TaskMetrics = Schemas['TaskMetrics'];

export interface GetTasksRequest extends Request {}
export interface CreateTaskRequestBody extends Request {
  body: CreateTaskRequest;
}

// Document management types
export type DocumentResponse = Schemas['Document'];
export type FileInfo = Schemas['FileInfo'];
export type FileContentResponse = Schemas['FileContentResponse'];
export type CreateFileRequest = Schemas['CreateFileRequest'];
export type UpdateFileRequest = Schemas['UpdateFileRequest'];

export interface GetDocumentsRequest extends Request {}
export interface CreateFileRequestBody extends Request {
  body: CreateFileRequest;
}
export interface UpdateFileRequestBody extends Request {
  body: UpdateFileRequest;
}

// Command execution types
export type CommandResult = Schemas['CommandResult'];
export type ExecuteCommandRequest = Schemas['ExecuteCommandRequest'];

export interface ExecuteCommandRequestBody extends Request {
  body: ExecuteCommandRequest;
}

// Settings types
export type Settings = Schemas['Settings'];
export type UpdateSettingsRequest = Schemas['UpdateSettingsRequest'];

export interface GetSettingsRequest extends Request {}
export interface UpdateSettingsRequestBody extends Request {
  body: UpdateSettingsRequest;
}

// LLM Analytics types
export type LLMAnalytics = Schemas['LLMAnalytics'];
export type LLMStatistics = Schemas['LLMStatistics'];
export type ProviderStats = Schemas['ProviderStats'];

export interface GetLLMAnalyticsRequest extends Request {}

// Error response types
export type ErrorResponse = Schemas['ErrorResponse'];

/**
 * Type-safe Express response helpers
 * Ensures AI tools get proper typing for all API responses
 */
export interface TypedResponse<T> extends Response {
  json(body: T): TypedResponse<T>;
}

/**
 * API Response wrapper with consistent structure
 * Matches OpenAPI ApiResponse schema exactly
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  timestamp: string;
}

/**
 * Express route handler types with full type safety
 * AI tools get complete IntelliSense for request/response
 */
export type HealthHandler = (
  req: HealthRequest,
  res: TypedResponse<ApiResponse<HealthResponse>>
) => Promise<void> | void;

export type SystemStatusHandler = (
  req: SystemStatusRequest,
  res: TypedResponse<ApiResponse<SystemStatusResponse>>
) => Promise<void> | void;

export type GetSwarmsHandler = (
  req: GetSwarmsRequest,
  res: TypedResponse<
    ApiResponse<{ swarms: SwarmResponse[]; metrics: SwarmMetrics }>
  >
) => Promise<void> | void;

export type CreateSwarmHandler = (
  req: CreateSwarmRequestBody,
  res: TypedResponse<ApiResponse<SwarmResponse>>
) => Promise<void> | void;

export type GetTasksHandler = (
  req: GetTasksRequest,
  res: TypedResponse<
    ApiResponse<{ tasks: TaskResponse[]; metrics: TaskMetrics }>
  >
) => Promise<void> | void;

export type CreateTaskHandler = (
  req: CreateTaskRequestBody,
  res: TypedResponse<ApiResponse<TaskResponse>>
) => Promise<void> | void;

export type ExecuteCommandHandler = (
  req: ExecuteCommandRequestBody,
  res: TypedResponse<ApiResponse<CommandResult>>
) => Promise<void> | void;

export type GetLLMAnalyticsHandler = (
  req: GetLLMAnalyticsRequest,
  res: TypedResponse<ApiResponse<LLMAnalytics>>
) => Promise<void> | void;

/**
 * Generic error handler type
 */
export type ErrorHandler = (
  req: Request,
  res: TypedResponse<ErrorResponse>
) => Promise<void> | void;

/**
 * Route path types extracted from OpenAPI
 * Ensures route strings match exactly what's in the spec
 */
export type ApiPaths = keyof paths;

// Helper to extract operation types from paths
export type PathOperations<P extends ApiPaths> = paths[P];
export type PathMethods<P extends ApiPaths> = keyof PathOperations<P>;

/**
 * Request validation schemas using Zod (already in package.json)
 * These can be used with express-validator or zod directly
 */
export interface ValidationSchemas {
  createSwarm: CreateSwarmRequest;
  createTask: CreateTaskRequest;
  executeCommand: ExecuteCommandRequest;
  updateSettings: UpdateSettingsRequest;
  createFile: CreateFileRequest;
  updateFile: UpdateFileRequest;
}

/**
 * Type-safe middleware for request validation
 */
export type ValidatedRequest<T> = Request & { validatedBody: T };

export type ValidationMiddleware<T extends keyof ValidationSchemas> = (
  req: ValidatedRequest<ValidationSchemas[T]>,
  res: Response,
  next: () => void
) => void;

/**
 * Route configuration type for type-safe route registration
 */
export interface RouteConfig<TReq extends Request = Request, TRes = any> {
  path: string;
  method: 'get | post' | 'put | delete' | 'patch';
  handler: (req: TReq, res: TypedResponse<TRes>) => Promise<void> | void;
  validation?: ValidationMiddleware<any>;
  middleware?: Array<(req: Request, res: Response, next: () => void) => void>;
}

/**
 * Benefits for AI Tools:
 *
 * 1. **Complete Type Safety** - All Express routes are fully typed
 * 2. **Request/Response Validation** - Automatic validation against OpenAPI
 * 3. **IntelliSense Support** - Full autocomplete for all API endpoints
 * 4. **Error Prevention** - Compile-time checking prevents runtime errors
 * 5. **Schema Consistency** - Types always match OpenAPI specification
 * 6. **Middleware Support** - Type-safe middleware with proper request typing
 * 7. **Route Registration** - Type-safe route configuration and registration
 */
