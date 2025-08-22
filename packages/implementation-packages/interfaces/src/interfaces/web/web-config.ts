/**
 * @fileoverview Web Interface Configuration
 *
 * Configuration interface for web-based interface components.
 * Provides type-safe configuration for web interface launching and management.
 */

export interface WebConfig {
  port?: number;
  host?: string;
  publicDir?: string;
  apiPath?: string;
  enableCors?: boolean;
  corsOrigins?: string[];
  enableCompression?: boolean;
  enableLogging?: boolean;
  logLevel?: 'error|warn|info|debug';
  maxRequestSize?: string;
  timeout?: number;
  ssl?: {
    enabled: boolean;
    keyPath?: string;
    certPath?: string;
  };
  session?: {
    secret: string;
    maxAge?: number;
    secure?: boolean;
  };
  rateLimit?: {
    windowMs?: number;
    max?: number;
    message?: string;
  };
}

export const DEFAULT_WEB_CONFIG: WebConfig = {
  port: 3000,
  host: 'localhost',
  publicDir: 'public',
  apiPath: '/api',
  enableCors: true,
  corsOrigins: ['http://localhost:3000', 'http://localhost:3002'],
  enableCompression: true,
  enableLogging: true,
  logLevel: 'info',
  maxRequestSize: '10mb',
  timeout: 30000,
  ssl: {
    enabled: false,
  },
  session: {
    secret: 'claude-zen-web-interface',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP',
  },
};
