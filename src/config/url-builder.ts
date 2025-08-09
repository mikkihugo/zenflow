/**
 * @file url-builder implementation
 */


import { DEFAULT_CONFIG } from './defaults';
import type { SystemConfiguration } from './types';

export interface URLBuilderConfig {
  protocol?: 'http' | 'https';
  host?: string;
  port?: number;
  path?: string;
}

export class URLBuilder {
  private config: SystemConfiguration;

  constructor(config: SystemConfiguration = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Build HTTP MCP server URL.
   *
   * @param overrides
   */
  getMCPServerURL(overrides: Partial<URLBuilderConfig> = {}): string {
    const protocol = overrides.protocol || this.getProtocol();
    const host = overrides.host || this.config.interfaces.mcp.http.host;
    const port = overrides.port || this.config.interfaces.mcp.http.port;
    const path = overrides.path || '';

    return this.buildURL(protocol, host, port, path);
  }

  /**
   * Build web dashboard URL.
   *
   * @param overrides
   */
  getWebDashboardURL(overrides: Partial<URLBuilderConfig> = {}): string {
    const protocol = overrides.protocol || this.getProtocol();
    const host = overrides.host || this.config.interfaces.web.host;
    const port = overrides.port || this.config.interfaces.web.port;
    const path = overrides.path || '';

    return this.buildURL(protocol, host, port, path);
  }

  /**
   * Build monitoring dashboard URL.
   *
   * @param overrides
   */
  getMonitoringDashboardURL(overrides: Partial<URLBuilderConfig> = {}): string {
    const protocol = overrides.protocol || this.getProtocol();
    const host = overrides.host || this.config.monitoring.dashboard.host;
    const port = overrides.port || this.config.monitoring.dashboard.port;
    const path = overrides.path || '';

    return this.buildURL(protocol, host, port, path);
  }

  /**
   * Build CORS origins array.
   */
  getCORSOrigins(): string[] {
    const protocol = this.getProtocol();

    // Get all service URLs for CORS
    const mcpURL = this.getMCPServerURL({ protocol });
    const webURL = this.getWebDashboardURL({ protocol });
    const monitoringURL = this.getMonitoringDashboardURL({ protocol });

    // Add configured origins
    const configuredOrigins = this.config.interfaces.web.corsOrigins || [];

    // Convert localhost origins to use current protocol
    const updatedOrigins = configuredOrigins?.map((origin) => {
      if (origin.includes('localhost') && !origin.startsWith('http')) {
        return `${protocol}://${origin}`;
      }
      if (origin.startsWith('http://localhost') && protocol === 'https') {
        return origin.replace('http://', 'https://');
      }
      return origin;
    });

    // Combine all origins and deduplicate
    const allOrigins = [...updatedOrigins, mcpURL, webURL, monitoringURL];

    return [...new Set(allOrigins)];
  }

  /**
   * Get base URL for a service.
   *
   * @param service
   * @param overrides
   */
  getServiceBaseURL(
    service: 'mcp' | 'web' | 'monitoring',
    overrides: Partial<URLBuilderConfig> = {}
  ): string {
    switch (service) {
      case 'mcp':
        return this.getMCPServerURL(overrides);
      case 'web':
        return this.getWebDashboardURL(overrides);
      case 'monitoring':
        return this.getMonitoringDashboardURL(overrides);
      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  /**
   * Get all service endpoints for API documentation.
   */
  getAPIEndpoints(): Array<{ url: string; description: string }> {
    const protocol = this.getProtocol();

    return [
      {
        url: this.getMCPServerURL({ protocol }),
        description: 'MCP Server (Development)',
      },
      {
        url: this.getWebDashboardURL({ protocol }),
        description: 'Web Dashboard (Development)',
      },
      {
        url: this.getMonitoringDashboardURL({ protocol }),
        description: 'Monitoring Dashboard (Development)',
      },
      // Add production URLs if configured
      ...(this.config.environment.isProduction
        ? [
            {
              url: process.env['PRODUCTION_API_URL'] || 'https://api.claude-zen.com',
              description: 'Production API Server',
            },
            {
              url: process.env['PRODUCTION_WEB_URL'] || 'https://dashboard.claude-zen.com',
              description: 'Production Dashboard',
            },
          ]
        : []),
    ];
  }

  /**
   * Build a URL from components.
   *
   * @param protocol
   * @param host
   * @param port
   * @param path
   */
  private buildURL(protocol: string, host: string, port: number, path: string): string {
    // Handle default ports
    const shouldOmitPort =
      (protocol === 'http' && port === 80) || (protocol === 'https' && port === 443);

    const portPart = shouldOmitPort ? '' : `:${port}`;
    const pathPart = path.startsWith('/') ? path : `/${path}`;
    const cleanPath = path === '' ? '' : pathPart;

    return `${protocol}://${host}${portPart}${cleanPath}`;
  }

  /**
   * Get protocol based on environment and configuration.
   */
  private getProtocol(): 'http' | 'https' {
    // Check environment variables first
    if (process.env['FORCE_HTTPS'] === 'true') {
      return 'https';
    }

    if (process.env['FORCE_HTTP'] === 'true') {
      return 'http';
    }

    // Check web interface HTTPS setting
    if (this.config.interfaces.web.enableHttps) {
      return 'https';
    }

    // Default to HTTPS in production, HTTP in development
    return this.config.environment.isProduction ? 'https' : 'http';
  }

  /**
   * Get display URL for a service (replaces 0.0.0.0 with localhost for display).
   *
   * @param service
   * @param overrides
   */
  getDisplayURL(
    service: 'mcp' | 'web' | 'monitoring',
    overrides: Partial<URLBuilderConfig> = {}
  ): string {
    const url = this.getServiceBaseURL(service, overrides);

    // Replace 0.0.0.0 with localhost for better display
    return url.replace('://0.0.0.0:', '://localhost:');
  }

  /**
   * Validate if a URL is allowed by CORS policy.
   *
   * @param url
   */
  isValidCORSOrigin(url: string): boolean {
    const allowedOrigins = this.getCORSOrigins();
    return allowedOrigins.includes(url) || allowedOrigins.includes('*');
  }

  /**
   * Update configuration.
   *
   * @param config
   */
  updateConfig(config: SystemConfiguration): void {
    this.config = config;
  }
}

/**
 * Default URL builder instance using default configuration.
 */
export const defaultURLBuilder = new URLBuilder();

/**
 * Create URL builder with custom configuration.
 *
 * @param config
 */
export const createURLBuilder = (config: SystemConfiguration): URLBuilder => {
  return new URLBuilder(config);
};

/**
 * Convenience functions using default builder.
 *
 * @param overrides
 */
export const getMCPServerURL = (overrides?: Partial<URLBuilderConfig>) =>
  defaultURLBuilder.getMCPServerURL(overrides);

export const getWebDashboardURL = (overrides?: Partial<URLBuilderConfig>) =>
  defaultURLBuilder.getWebDashboardURL(overrides);

export const getMonitoringDashboardURL = (overrides?: Partial<URLBuilderConfig>) =>
  defaultURLBuilder.getMonitoringDashboardURL(overrides);

export const getCORSOrigins = () => defaultURLBuilder.getCORSOrigins();

export const getAPIEndpoints = () => defaultURLBuilder.getAPIEndpoints();
