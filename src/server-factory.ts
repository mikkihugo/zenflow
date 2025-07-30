/**
 * Server Factory and Builder
 * Centralized server creation and configuration management
 */

import { UnifiedClaudeFlowServer } from './unified-server.js';
import { ClaudeZenServer } from './api/claude-zen-server.js';
import { HTTPMCPServer } from './mcp/http-mcp-server.js';

// Import types
import {
  UnifiedServer,
  ServerConfig,
  ServerType,
  ServerFactory,
  ServerBuilder,
  RouteDefinition,
  MiddlewareDefinition,
  HealthCheckDefinition,
  ValidationResult,
  ValidationError,
  ProtocolType,
  ServerFeatures,
  SecurityConfig,
  PerformanceConfig,
  MonitoringConfig,
  MiddlewareConfig
} from './types/server.js';
import { JSONObject, JSONValue } from './types/core.js';

/**
 * Default server configurations for different server types
 */
const DEFAULT_CONFIGS: Record<ServerType, Partial<ServerConfig>> = {
  unified: {
    name: 'Claude Flow Unified Server',
    type: 'unified',
    version: '2.1.0',
    host: '0.0.0.0',
    port: 3000,
    secure: false,
    protocols: {
      http: {
        enabled: true,
        version: '1.1',
        keepAlive: true,
        timeout: 30000
      },
      websocket: {
        enabled: true,
        path: '/ws',
        compression: true,
        heartbeat: true,
        heartbeatInterval: 30000
      },
      mcp: {
        enabled: true,
        endpoint: '/mcp',
        capabilities: {},
        maxConnections: 100
      },
      grpc: {
        enabled: false,
        reflection: false,
        healthCheck: false
      },
      sse: {
        enabled: false,
        endpoint: '/events',
        keepAlive: true
      }
    },
    features: {
      enableAPI: true,
      enableSwagger: true,
      enableGraphQL: false,
      enableWebSocket: true,
      enableSSE: false,
      enableMCP: true,
      enableGRPC: false,
      enableNeural: true,
      enableAGUI: true,
      enableHotReload: false,
      enableDebugMode: false,
      enableMetrics: true,
      enableTracing: false,
      enableCORS: true,
      enableCSRF: false,
      enableRateLimit: true,
      enableAuth: false
    }
  },
  api: {
    name: 'Claude Flow API Server',
    type: 'api',
    version: '2.1.0',
    host: '0.0.0.0',
    port: 3000,
    secure: false,
    protocols: {
      http: {
        enabled: true,
        version: '1.1',
        keepAlive: true,
        timeout: 30000
      },
      websocket: {
        enabled: true,
        path: '/ws',
        compression: true,
        heartbeat: true,
        heartbeatInterval: 30000
      },
      mcp: {
        enabled: false,
        endpoint: '/mcp',
        capabilities: {},
        maxConnections: 0
      },
      grpc: {
        enabled: false,
        reflection: false,
        healthCheck: false
      },
      sse: {
        enabled: false,
        endpoint: '/events',
        keepAlive: true
      }
    },
    features: {
      enableAPI: true,
      enableSwagger: true,
      enableGraphQL: false,
      enableWebSocket: true,
      enableSSE: false,
      enableMCP: false,
      enableGRPC: false,
      enableNeural: true,
      enableAGUI: true,
      enableHotReload: false,
      enableDebugMode: false,
      enableMetrics: true,
      enableTracing: false,
      enableCORS: true,
      enableCSRF: false,
      enableRateLimit: true,
      enableAuth: false
    }
  },
  mcp: {
    name: 'Claude Flow MCP Server',
    type: 'mcp',
    version: '2.1.0',
    host: '0.0.0.0',
    port: 3000,
    secure: false,
    protocols: {
      http: {
        enabled: true,
        version: '1.1',
        keepAlive: true,
        timeout: 30000
      },
      websocket: {
        enabled: false,
        path: '/ws',
        compression: false,
        heartbeat: false,
        heartbeatInterval: 0
      },
      mcp: {
        enabled: true,
        endpoint: '/mcp',
        capabilities: {},
        maxConnections: 100
      },
      grpc: {
        enabled: false,
        reflection: false,
        healthCheck: false
      },
      sse: {
        enabled: false,
        endpoint: '/events',
        keepAlive: false
      }
    },
    features: {
      enableAPI: false,
      enableSwagger: false,
      enableGraphQL: false,
      enableWebSocket: false,
      enableSSE: false,
      enableMCP: true,
      enableGRPC: false,
      enableNeural: false,
      enableAGUI: false,
      enableHotReload: false,
      enableDebugMode: false,
      enableMetrics: true,
      enableTracing: false,
      enableCORS: true,
      enableCSRF: false,
      enableRateLimit: true,
      enableAuth: false
    }
  },
  websocket: {
    name: 'Claude Flow WebSocket Server',
    type: 'websocket',
    version: '2.1.0',
    host: '0.0.0.0',
    port: 3000,
    secure: false,
    protocols: {
      http: {
        enabled: true,
        version: '1.1',
        keepAlive: true,
        timeout: 30000
      },
      websocket: {
        enabled: true,
        path: '/ws',
        compression: true,
        heartbeat: true,
        heartbeatInterval: 30000
      },
      mcp: {
        enabled: false,
        endpoint: '/mcp',
        capabilities: {},
        maxConnections: 0
      },
      grpc: {
        enabled: false,
        reflection: false,
        healthCheck: false
      },
      sse: {
        enabled: true,
        endpoint: '/events',
        keepAlive: true
      }
    },
    features: {
      enableAPI: false,
      enableSwagger: false,
      enableGraphQL: false,
      enableWebSocket: true,
      enableSSE: true,
      enableMCP: false,
      enableGRPC: false,
      enableNeural: false,
      enableAGUI: true,
      enableHotReload: false,
      enableDebugMode: false,
      enableMetrics: true,
      enableTracing: false,
      enableCORS: true,
      enableCSRF: false,
      enableRateLimit: true,
      enableAuth: false
    }
  },
  grpc: {
    name: 'Claude Flow gRPC Server',
    type: 'grpc',
    version: '2.1.0',
    host: '0.0.0.0',
    port: 50051,
    secure: false,
    protocols: {
      http: {
        enabled: false,
        version: '1.1',
        keepAlive: false,
        timeout: 0
      },
      websocket: {
        enabled: false,
        path: '/ws',
        compression: false,
        heartbeat: false,
        heartbeatInterval: 0
      },
      mcp: {
        enabled: false,
        endpoint: '/mcp',
        capabilities: {},
        maxConnections: 0
      },
      grpc: {
        enabled: true,
        reflection: true,
        healthCheck: true
      },
      sse: {
        enabled: false,
        endpoint: '/events',
        keepAlive: false
      }
    },
    features: {
      enableAPI: false,
      enableSwagger: false,
      enableGraphQL: false,
      enableWebSocket: false,
      enableSSE: false,
      enableMCP: false,
      enableGRPC: true,
      enableNeural: false,
      enableAGUI: false,
      enableHotReload: false,
      enableDebugMode: false,
      enableMetrics: true,
      enableTracing: true,
      enableCORS: false,
      enableCSRF: false,
      enableRateLimit: false,
      enableAuth: true
    }
  }
};

/**
 * Server Factory Implementation
 * Creates and configures server instances
 */
export class ClaudeFlowServerFactory implements ServerFactory {
  /**
   * Create a unified server with all protocols enabled
   */
  async createUnifiedServer(config: ServerConfig): Promise<UnifiedServer> {
    const validationResult = this.validateConfig(config);
    if (!validationResult.valid) {
      throw new Error(`Invalid server configuration: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Create unified server with enhanced configuration
    const serverOptions = {
      port: config.port,
      host: config.host,
      enableAPI: config.features.enableAPI,
      enableMCP: config.features.enableMCP,
      enableWebSocket: config.features.enableWebSocket,
      enableNeural: config.features.enableNeural,
      ...config
    };

    return new UnifiedClaudeFlowServer(serverOptions) as UnifiedServer;
  }

  /**
   * Create an API-focused server
   */
  async createAPIServer(config: Partial<ServerConfig>): Promise<UnifiedServer> {
    const defaultConfig = this.getDefaultConfig('api');
    const mergedConfig = this.mergeConfig(defaultConfig, config);
    
    const serverOptions = {
      port: mergedConfig.port,
      host: mergedConfig.host,
      enableWebSocket: mergedConfig.features?.enableWebSocket || true,
      enableMetrics: mergedConfig.features?.enableMetrics || true,
      ...config
    };

    return new ClaudeZenServer(serverOptions) as UnifiedServer;
  }

  /**
   * Create an MCP-focused server
   */
  async createMCPServer(config: Partial<ServerConfig>): Promise<UnifiedServer> {
    const defaultConfig = this.getDefaultConfig('mcp');
    const mergedConfig = this.mergeConfig(defaultConfig, config);
    
    const serverOptions = {
      port: mergedConfig.port,
      host: mergedConfig.host,
      enableGitTools: true,
      enableAllTools: true,
      httpMode: true,
      ...config
    };

    return new HTTPMCPServer(serverOptions) as UnifiedServer;
  }

  /**
   * Validate server configuration
   */
  validateConfig(config: ServerConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate basic configuration
    if (!config.name || typeof config.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Server name is required and must be a string',
        value: config.name
      });
    }

    if (!config.host || typeof config.host !== 'string') {
      errors.push({
        field: 'host',
        message: 'Server host is required and must be a string',
        value: config.host
      });
    }

    if (!config.port || typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
      errors.push({
        field: 'port',
        message: 'Server port must be a number between 1 and 65535',
        value: config.port
      });
    }

    // Validate protocol configuration
    if (config.protocols) {
      if (config.protocols.http?.enabled && config.protocols.http.timeout < 1000) {
        warnings.push('HTTP timeout is very low, consider increasing to at least 1000ms');
      }

      if (config.protocols.websocket?.enabled && !config.protocols.http?.enabled) {
        errors.push({
          field: 'protocols.websocket',
          message: 'WebSocket requires HTTP to be enabled',
          value: config.protocols.websocket.enabled
        });
      }

      if (config.protocols.mcp?.enabled && config.protocols.mcp.maxConnections < 1) {
        errors.push({
          field: 'protocols.mcp.maxConnections',
          message: 'MCP max connections must be at least 1',
          value: config.protocols.mcp.maxConnections
        });
      }
    }

    // Validate features
    if (config.features) {
      if (config.features.enableWebSocket && !config.protocols?.websocket?.enabled) {
        warnings.push('WebSocket feature is enabled but WebSocket protocol is disabled');
      }

      if (config.features.enableMCP && !config.protocols?.mcp?.enabled) {
        warnings.push('MCP feature is enabled but MCP protocol is disabled');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get default configuration for server type
   */
  getDefaultConfig(type: ServerType): ServerConfig {
    const baseConfig = DEFAULT_CONFIGS[type];
    
    if (!baseConfig) {
      throw new Error(`Unknown server type: ${type}`);
    }

    // Generate unique ID and timestamps
    const now = new Date();
    const completeConfig: ServerConfig = {
      id: `server-${type}-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      
      // Security defaults
      security: this.getDefaultSecurityConfig(),
      
      // Performance defaults
      performance: this.getDefaultPerformanceConfig(),
      
      // Monitoring defaults
      monitoring: this.getDefaultMonitoringConfig(),
      
      // Middleware defaults
      middleware: this.getDefaultMiddlewareConfig(),
      
      // Integration defaults
      integrations: {
        neural: {
          enabled: baseConfig.features?.enableNeural || false,
          models: [],
          caching: true
        },
        agui: {
          enabled: baseConfig.features?.enableAGUI || false,
          broadcast: true,
          filtering: true
        },
        databases: {
          sqlite: {
            enabled: true,
            url: 'sqlite://./data/claude-flow.db',
            options: {},
            poolSize: 10,
            timeout: 5000
          },
          lancedb: {
            enabled: baseConfig.features?.enableNeural || false,
            url: './data/vectors',
            options: {}
          },
          kuzu: {
            enabled: baseConfig.features?.enableNeural || false,
            url: './data/graph',
            options: {}
          }
        },
        services: []
      },
      
      ...baseConfig
    } as ServerConfig;

    return completeConfig;
  }

  /**
   * Get default security configuration
   */
  private getDefaultSecurityConfig(): SecurityConfig {
    return {
      authentication: {
        enabled: false,
        type: 'none',
        config: {}
      },
      authorization: {
        enabled: false,
        defaultPolicy: 'allow',
        policies: []
      },
      cors: {
        enabled: true,
        allowedOrigins: ['*'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: [],
        allowCredentials: false,
        maxAge: 86400
      },
      rateLimit: {
        enabled: true,
        type: 'fixed-window',
        requests: 1000,
        window: 900, // 15 minutes
        scope: 'ip',
        headers: true,
        storage: {
          type: 'memory',
          config: {}
        },
        whitelist: []
      },
      csrf: {
        enabled: false,
        secret: '',
        cookie: {
          key: '_csrf',
          sameSite: 'strict',
          secure: false,
          httpOnly: true
        }
      },
      csp: {
        enabled: false,
        directives: {},
        reportOnly: false
      },
      https: {
        enabled: false,
        requestCert: false,
        rejectUnauthorized: true
      },
      headers: {
        helmet: true,
        hsts: false,
        nosniff: true,
        xssProtection: true,
        referrerPolicy: 'same-origin'
      }
    };
  }

  /**
   * Get default performance configuration
   */
  private getDefaultPerformanceConfig(): PerformanceConfig {
    return {
      maxConnections: 1000,
      maxRequestsPerConnection: 100,
      connectionTimeout: 30000,
      requestTimeout: 30000,
      bodyParserLimit: '50mb',
      maxConcurrentRequests: 100,
      cache: {
        enabled: true,
        type: 'memory',
        config: {},
        defaultTTL: 3600
      },
      compression: {
        enabled: true,
        level: 6,
        threshold: 1024
      },
      keepAlive: {
        enabled: true,
        timeout: 65,
        maxRequests: 100
      },
      limits: {
        memory: 512, // MB
        cpu: 80, // percentage
        fileDescriptors: 1024
      }
    };
  }

  /**
   * Get default monitoring configuration
   */
  private getDefaultMonitoringConfig(): MonitoringConfig {
    return {
      health: {
        enabled: true,
        endpoint: '/health',
        interval: 30,
        timeout: 5000,
        checks: [
          {
            name: 'memory',
            type: 'custom',
            config: { threshold: 0.8 },
            timeout: 1000,
            interval: 30,
            retries: 3,
            critical: false
          }
        ]
      },
      metrics: {
        enabled: true,
        endpoint: '/metrics',
        provider: 'prometheus',
        interval: 10,
        retention: 30
      },
      logging: {
        enabled: true,
        level: 'info',
        format: 'json',
        destination: 'console',
        config: {}
      },
      tracing: {
        enabled: false,
        provider: 'jaeger',
        samplingRate: 0.1
      },
      errorTracking: {
        enabled: false,
        provider: 'sentry',
        config: {}
      }
    };
  }

  /**
   * Get default middleware configuration
   */
  private getDefaultMiddlewareConfig(): MiddlewareConfig {
    return {
      builtin: {
        cors: true,
        helmet: true,
        compression: true,
        bodyParser: true,
        cookieParser: false,
        session: false,
        static: false
      },
      custom: [],
      order: ['helmet', 'cors', 'compression', 'bodyParser'],
      global: {
        timeout: 30000,
        errorHandler: true,
        notFoundHandler: true,
        requestLogger: true
      }
    };
  }

  /**
   * Merge configurations with deep merge
   */
  private mergeConfig(defaultConfig: ServerConfig, customConfig: Partial<ServerConfig>): ServerConfig {
    const merged = { ...defaultConfig };
    
    Object.keys(customConfig).forEach(key => {
      const customValue = (customConfig as any)[key];
      const defaultValue = (merged as any)[key];
      
      if (customValue !== undefined) {
        if (typeof customValue === 'object' && customValue !== null && 
            typeof defaultValue === 'object' && defaultValue !== null &&
            !Array.isArray(customValue)) {
          (merged as any)[key] = { ...defaultValue, ...customValue };
        } else {
          (merged as any)[key] = customValue;
        }
      }
    });
    
    return merged;
  }
}

/**
 * Server Builder Implementation
 * Fluent interface for building server configurations
 */
export class ClaudeFlowServerBuilder implements ServerBuilder {
  private config: Partial<ServerConfig> = {};
  private factory: ClaudeFlowServerFactory;

  constructor(factory?: ClaudeFlowServerFactory) {
    this.factory = factory || new ClaudeFlowServerFactory();
  }

  /**
   * Set server configuration
   */
  withConfig(config: Partial<ServerConfig>): ServerBuilder {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Enable or disable a protocol
   */
  withProtocol(protocol: ProtocolType, enabled: boolean): ServerBuilder {
    if (!this.config.protocols) {
      this.config.protocols = {} as any;
    }

    switch (protocol) {
      case 'http':
      case 'https':
        if (!this.config.protocols.http) {
          this.config.protocols.http = { enabled, version: '1.1', keepAlive: true, timeout: 30000 };
        } else {
          this.config.protocols.http.enabled = enabled;
        }
        break;
      case 'ws':
      case 'wss':
        if (!this.config.protocols.websocket) {
          this.config.protocols.websocket = { 
            enabled, 
            path: '/ws', 
            compression: true, 
            heartbeat: true, 
            heartbeatInterval: 30000 
          };
        } else {
          this.config.protocols.websocket.enabled = enabled;
        }
        break;
      case 'mcp':
        if (!this.config.protocols.mcp) {
          this.config.protocols.mcp = { enabled, endpoint: '/mcp', capabilities: {}, maxConnections: 100 };
        } else {
          this.config.protocols.mcp.enabled = enabled;
        }
        break;
      case 'grpc':
        if (!this.config.protocols.grpc) {
          this.config.protocols.grpc = { enabled, reflection: true, healthCheck: true };
        } else {
          this.config.protocols.grpc.enabled = enabled;
        }
        break;
    }

    return this;
  }

  /**
   * Enable or disable a feature
   */
  withFeature(feature: keyof ServerFeatures, enabled: boolean): ServerBuilder {
    if (!this.config.features) {
      this.config.features = {} as ServerFeatures;
    }
    this.config.features[feature] = enabled;
    return this;
  }

  /**
   * Add middleware
   */
  withMiddleware(middleware: MiddlewareDefinition): ServerBuilder {
    if (!this.config.middleware) {
      this.config.middleware = {
        builtin: {
          cors: false,
          helmet: false,
          compression: false,
          bodyParser: false,
          cookieParser: false,
          session: false,
          static: false
        },
        custom: [],
        order: [],
        global: {
          timeout: 30000,
          errorHandler: true,
          notFoundHandler: true,
          requestLogger: true
        }
      };
    }
    
    this.config.middleware.custom!.push({
      name: middleware.name,
      handler: middleware.handler,
      order: middleware.order || 0,
      routes: middleware.routes || [],
      methods: middleware.methods || [],
      enabled: middleware.enabled !== false
    });
    
    return this;
  }

  /**
   * Add route definition
   */
  withRoute(route: RouteDefinition): ServerBuilder {
    // Store route definitions for later use
    if (!(this.config as any).routes) {
      (this.config as any).routes = [];
    }
    (this.config as any).routes.push(route);
    return this;
  }

  /**
   * Add health check
   */
  withHealthCheck(check: HealthCheckDefinition): ServerBuilder {
    if (!this.config.monitoring) {
      this.config.monitoring = this.factory['getDefaultMonitoringConfig']();
    }
    
    this.config.monitoring.health.checks.push(check);
    return this;
  }

  /**
   * Build the server instance
   */
  async build(): Promise<UnifiedServer> {
    // Determine server type based on configuration
    let serverType: ServerType = 'unified';
    
    if (this.config.features) {
      const enabledFeatures = Object.entries(this.config.features).filter(([, enabled]) => enabled);
      
      if (enabledFeatures.length === 1) {
        if (this.config.features.enableMCP) serverType = 'mcp';
        else if (this.config.features.enableWebSocket) serverType = 'websocket';
        else if (this.config.features.enableGRPC) serverType = 'grpc';
        else if (this.config.features.enableAPI) serverType = 'api';
      }
    }

    // Get default configuration and merge with custom config
    const defaultConfig = this.factory.getDefaultConfig(serverType);
    const finalConfig = this.factory['mergeConfig'](defaultConfig, this.config);

    // Create server based on type
    switch (serverType) {
      case 'api':
        return this.factory.createAPIServer(finalConfig);
      case 'mcp':
        return this.factory.createMCPServer(finalConfig);
      default:
        return this.factory.createUnifiedServer(finalConfig);
    }
  }
}

// Export singleton factory instance
export const serverFactory = new ClaudeFlowServerFactory();

// Export builder function for convenience
export function createServerBuilder(): ServerBuilder {
  return new ClaudeFlowServerBuilder(serverFactory);
}

// Export convenience functions
export async function createUnifiedServer(config?: Partial<ServerConfig>): Promise<UnifiedServer> {
  const builder = createServerBuilder();
  if (config) {
    builder.withConfig(config);
  }
  return builder.build();
}

export async function createAPIServer(port?: number, host?: string): Promise<UnifiedServer> {
  return createServerBuilder()
    .withConfig({ port, host })
    .withFeature('enableAPI', true)
    .withFeature('enableMCP', false)
    .build();
}

export async function createMCPServer(port?: number, host?: string): Promise<UnifiedServer> {
  return createServerBuilder()
    .withConfig({ port, host })
    .withFeature('enableMCP', true)
    .withFeature('enableAPI', false)
    .build();
}

export default {
  serverFactory,
  createServerBuilder,
  createUnifiedServer,
  createAPIServer,
  createMCPServer,
  ClaudeFlowServerFactory,
  ClaudeFlowServerBuilder
};