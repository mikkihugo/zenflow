/**
 * API Types
 *
 * Types for REST API, HTTP clients, and web interfaces.
 * Consolidated from:api-types.ts, api-response.ts, client-types.ts, express-api-types.ts
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ResponseMeta {
  requestId: string;
  duration: number;
  version: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
}

// ============================================================================
// Request Types
// ============================================================================

export interface ApiRequest {
  method: 'GET' | ' POST' | ' PUT' | ' DELETE' | ' PATCH';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
  timeout?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | ' desc';
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, unknown>;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface QueryParams extends PaginationParams, FilterParams {}

// ============================================================================
// Client Types
// ============================================================================

export interface HttpClient {
  get<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>>;
}

export interface ClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  auth?: ClientAuth;
  retry?: RetryConfig;
}

export interface ClientAuth {
  type: 'bearer' | ' basic' | ' api-key';
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
}

export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff?: 'fixed' | ' exponential';
}

// ============================================================================
// WebSocket Types
// ============================================================================

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
  id?: string;
  timestamp: Date;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  maxReconnects?: number;
  reconnectDelay?: number;
}

export interface WebSocketClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send<T>(message: WebSocketMessage<T>): Promise<void>;
  on<T>(type: string, handler: (payload: T) => void): void;
  off(type: string, handler?: Function): void;
}

// ============================================================================
// Route Types
// ============================================================================

export type RouteHandler = (
  req: unknown,
  res: unknown,
  next?: unknown
) => void | Promise<void>;

export interface RouteDefinition {
  method: 'GET' | ' POST' | ' PUT' | ' DELETE' | ' PATCH' | ' ALL';
  path: string;
  handler: RouteHandler;
  middleware?: RouteHandler[];
  auth?: boolean;
  rateLimit?: RateLimitConfig;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skip?: (req: unknown) => boolean;
}

// ============================================================================
// Dashboard & UI Types
// ============================================================================

export interface DashboardConfig {
  title: string;
  theme?: 'light' | ' dark' | ' auto';
  features: DashboardFeatures;
  layout: DashboardLayout;
}

export interface DashboardFeatures {
  metrics: boolean;
  logs: boolean;
  coordination: boolean;
  agui: boolean;
  settings: boolean;
}

export interface DashboardLayout {
  sidebar: boolean;
  header: boolean;
  footer: boolean;
  panels: string[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | ' table' | ' metric' | ' log';
  title: string;
  config: Record<string, unknown>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return (
    obj && typeof obj.success === 'boolean' && obj.timestamp instanceof Date
  );
}

export function isApiError(obj: unknown): obj is ApiError {
  return obj && typeof obj.code === 'string' && typeof obj.message === 'string';
}

export function isPaginatedResponse<T>(
  obj: unknown
): obj is PaginatedResponse<T> {
  return (
    isApiResponse(obj) &&
    obj.meta?.pagination &&
    typeof obj.meta.pagination.total === 'number'
  );
}
