/**
 * @fileoverview Infrastructure Package Types - Simple Types
 *
 * Simple type definitions for strategic facade.
 */

// Basic types that facades might use
export interface DatabaseConfig {
  type?: string;
  host?: string;
  port?: number;
}

export interface TelemetryConfig {
  enabled?: boolean;
  endpoint?: string;
}

export interface EventConfig {
  enabled?: boolean;
  maxEvents?: number;
}

export interface LoadBalancingConfig {
  algorithm?: string;
  maxNodes?: number;
}
