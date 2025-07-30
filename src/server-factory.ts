/**
 * Server Factory and Builder
 * Centralized server creation and configuration management
 */

import { ClaudeZenServer } from './api/claude-zen-server.js';
import { HTTPMCPServer } from './mcp/http-mcp-server.js';
import { JSONObject, JSONValue } from './types/core.js';

// Import types
import {
  HealthCheckDefinition,
  MiddlewareConfig,
  MiddlewareDefinition,
  MonitoringConfig,
  PerformanceConfig,
  ProtocolType,
  RouteDefinition,
  SecurityConfig,
  ServerBuilder,
  ServerConfig,
  ServerFactory,
  ServerFeatures,
  ServerType,
  UnifiedServer,
  ValidationError,
  ValidationResult,
} from './types/server.js';
import { UnifiedClaudeFlowServer } from './unified-server.js';

/**
 * Default server configurations for different server types
 */
const DEFAULT_CONFIGS = {unified = this.validateConfig(config);
if (!validationResult.valid) {
  throw new Error(`Invalid serverconfiguration = > e.message).join(', ')}`);
}

// Create unified server with enhanced configuration
const serverOptions = {port = this.getDefaultConfig('api');
const mergedConfig = this.mergeConfig(defaultConfig, config);

const serverOptions = {port = this.getDefaultConfig('mcp');
const mergedConfig = this.mergeConfig(defaultConfig, config);

const serverOptions = {port = [];
const warnings = [];

// Validate basic configuration
if (!config.name || typeof config.name !== 'string') {
  errors.push({field = = 'string') {
      errors.push({field = = 'number' || config.port < 1 || config.port > 65535) {
      errors.push({field = == 0,
      errors,
      warnings
    };
}

/**
 * Get default configuration for server type
 */
getDefaultConfig(type = DEFAULT_CONFIGS[type];

if (!baseConfig) {
      throw new Error(`Unknown servertype = new Date();

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
  private config = {};
  private factory = factory || new ClaudeFlowServerFactory();
  }

  /**
   * Set server configuration
   */
  withConfig(config = { ...this.config, ...config };
    return this;
  }

  /**
   * Enable or disable a protocol
   */
  withProtocol(protocol = {} as any;
    }

    switch (protocol) {
      case 'http':
      case 'https':
        if (!this.config.protocols.http) {
          this.config.protocols.http = { enabled,version = enabled;
        }
        break;
      case 'ws':
      case 'wss':
        if (!this.config.protocols.websocket) {
          this.config.protocols.websocket = { 
            enabled,path = enabled;
        }
        break;
      case 'mcp':
        if (!this.config.protocols.mcp) {
          this.config.protocols.mcp = { enabled,endpoint = enabled;
        }
        break;
      case 'grpc':
        if (!this.config.protocols.grpc) {
          this.config.protocols.grpc = { enabled,reflection = enabled;
        }
        break;
    }

    return this;
  }

  /**
   * Enable or disable a feature
   */
  withFeature(feature = {} as ServerFeatures;
    }
    this.config.features[feature] = enabled;
    return this;
  }

  /**
   * Add middleware
   */
  withMiddleware(middleware): ServerBuilder {
    if (!this.config.middleware) {
      this.config.middleware = {builtin = = false
    });
    
    return this;
  }

  /**
   * Add route definition
   */
  withRoute(route = [];
    }
    (this.config as any).routes.push(route);
    return this;
  }

  /**
   * Add health check
   */
  withHealthCheck(check = this.factory['getDefaultMonitoringConfig']();
    }
    
    this.config.monitoring.health.checks.push(check);
    return this;
  }

  /**
   * Build the server instance
   */
  async build(): Promise<UnifiedServer> {
    // Determine server type based on configuration
    let serverType = 'unified';
    
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
        return this.factory.createMCPServer(finalConfig);default = new ClaudeFlowServerFactory();

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
