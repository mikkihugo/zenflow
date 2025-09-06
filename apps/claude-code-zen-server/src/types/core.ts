/**
 * Core System Types
 *
 * Core types for system configuration, lifecycle, and fundamental operations.
 * Consolidated from:core-config.ts, system-config.ts, config-types.ts, logger.ts
 */

// ============================================================================
// System Configuration
// ============================================================================

export interface SystemConfig {
  environment: 'development' | ' staging' | ' production';
  server: {
    port: number;
    host: string;
    cors?: {
      origin: string | string[];
      credentials?: boolean;
    };
  };
  database?: {
    url: string;
    type: 'sqlite' | ' postgres' | ' mongodb';
    options?: Record<string, unknown>;
  };
  logging: LoggingConfig;
  features: FeatureFlags;
  performance: PerformanceConfig;
}

export interface LoggingConfig {
  level: 'error' | ' warn' | ' info' | ' debug';
  format?: 'json' | ' pretty';
  destinations?: ('console' | ' file' | ' remote')[];
  filename?: string;
}

export interface FeatureFlags {
  webInterface: boolean;
  coordination: boolean;
  agui: boolean;
  metrics: boolean;
  experimental?: Record<string, boolean>;
}

export interface PerformanceConfig {
  maxConcurrency: number;
  timeout: number;
  memoryLimit?: number;
  enableProfiling?: boolean;
}

// ============================================================================
// System Health & Metrics
// ============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  components: Record<string, ComponentHealth>;
  checks: HealthCheck[];
  timestamp: Date;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  metrics?: Record<string, number>;
  lastCheck: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | ' fail' | ' warn';
  duration: number;
  message?: string;
}

export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  requests: {
    total: number;
    rate: number;
    errors: number;
  };
  connections: {
    active: number;
    total: number;
  };
  timestamp: Date;
}

// ============================================================================
// Application Lifecycle
// ============================================================================

export interface StartupOptions {
  config: SystemConfig;
  mode: 'server' | ' daemon' | ' cli';
  services?: string[];
  skipHealthChecks?: boolean;
}

export interface ShutdownOptions {
  timeout: number;
  force?: boolean;
  reason?: string;
}

export type SystemEvent =
  | 'startup'
  | 'shutdown'
  | 'error'
  | 'config-change'
  | 'health-check';

// ============================================================================
// Error Handling
// ============================================================================

export interface SystemError extends Error {
  code: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface ErrorContext {
  operation: string;
  component: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isSystemConfig(obj: unknown): obj is SystemConfig {
  return (
    obj &&
    typeof obj.environment === 'string' &&
    typeof obj.server === 'object' &&
    typeof obj.logging === 'object'
  );
}

export function isSystemHealth(obj: unknown): obj is SystemHealth {
  return (
    obj &&
    typeof obj.status === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.uptime === 'number'
  );
}
