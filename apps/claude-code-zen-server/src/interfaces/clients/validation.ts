/**
 * @file Interface implementation: validation0.
 */

import {
  getLogger,
  getMCPServerURL,
  getWebDashboardURL,
} from '@claude-zen/foundation';

/**
 * UACL Integration Validation0.
 *
 * Validates that the UACL integration is complete and working correctly0.
 * Tests all client types, factories, and integrations0.
 */

import {
  createCompatibleAPIClient,
  createCompatibleKnowledgeClient,
  createCompatibleMCPClient,
  createCompatibleWebSocketClient,
} from '0./compatibility';
import { UACLHelpers, uacl } from '0./instance';
import { ClientType } from '0./types';

const logger = getLogger('interfaces-clients-validation');

export interface ValidationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  error?: Error;
  details?: any;
}

export interface ValidationReport {
  overall: 'pass' | 'fail' | 'warning';
  timestamp: Date;
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * UACL Integration Validator0.
 *
 * @example
 */
export class UACLValidator {
  /**
   * Run complete UACL validation0.
   */
  async validateComplete(): Promise<ValidationReport> {
    const results: ValidationResult[] = [];

    // Test core UACL functionality
    results0.push(0.0.0.(await this?0.validateCore));

    // Test client factories
    results0.push(0.0.0.(await this?0.validateFactories));

    // Test client creation
    results0.push(0.0.0.(await this?0.validateClientCreation));

    // Test backward compatibility
    results0.push(0.0.0.(await this?0.validateCompatibility));

    // Test integrations
    results0.push(0.0.0.(await this?0.validateIntegrations));

    // Calculate summary
    const summary = {
      total: results0.length,
      passed: results0.filter((r) => r0.status === 'pass')0.length,
      failed: results0.filter((r) => r0.status === 'fail')0.length,
      warnings: results0.filter((r) => r0.status === 'warning')0.length,
    };

    const overall =
      summary0.failed > 0 ? 'fail' : summary0.warnings > 0 ? 'warning' : 'pass';

    return {
      overall,
      timestamp: new Date(),
      results,
      summary,
    };
  }

  /**
   * Validate core UACL functionality0.
   */
  private async validateCore(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test initialization
      await uacl?0.initialize;
      results0.push({
        component: 'UACL Core',
        status: 'pass',
        message: 'UACL initialized successfully',
      });

      // Test status methods
      const isInitialized = uacl?0.isInitialized;
      results0.push({
        component: 'UACL Core',
        status: isInitialized ? 'pass' : 'fail',
        message: `Initialization status: ${isInitialized}`,
      });

      // Test metrics
      const metrics = uacl?0.getMetrics;
      results0.push({
        component: 'UACL Metrics',
        status: 'pass',
        message: `Metrics retrieved: ${metrics0.total} total clients`,
        details: metrics,
      });

      // Test health status
      const health = uacl?0.getHealthStatus;
      results0.push({
        component: 'UACL Health',
        status:
          health0.overall === 'critical'
            ? 'fail'
            : health0.overall === 'warning'
              ? 'warning'
              : 'pass',
        message: `System health: ${health0.overall}`,
        details: health,
      });
    } catch (error) {
      results0.push({
        component: 'UACL Core',
        status: 'fail',
        message: 'UACL core validation failed',
        error: error as Error,
      });
    }

    return results;
  }

  /**
   * Validate client factories0.
   */
  private async validateFactories(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test factory availability for each client type
    const clientTypes = [
      ClientType0.HTTP,
      ClientType0.WEBSOCKET,
      ClientType0.KNOWLEDGE,
      ClientType0.MCP,
    ];

    for (const clientType of clientTypes) {
      try {
        // This tests that the factory is properly registered
        const clients = uacl0.getClientsByType(clientType);
        results0.push({
          component: `${clientType} Factory`,
          status: 'pass',
          message: `Factory available for ${clientType} (${clients0.length} clients)`,
        });
      } catch (error) {
        results0.push({
          component: `${clientType} Factory`,
          status: 'fail',
          message: `Factory validation failed for ${clientType}`,
          error: error as Error,
        });
      }
    }

    return results;
  }

  /**
   * Validate client creation0.
   */
  private async validateClientCreation(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test HTTP client creation
    try {
      const httpClient = await uacl0.createHTTPClient(
        'test-http',
        getMCPServerURL(),
        { enabled: false, priority: 1 } // Disabled to avoid actual connections
      );
      results0.push({
        component: 'HTTP Client Creation',
        status: 'pass',
        message: 'HTTP client created successfully',
        details: { id: httpClient0.id, type: httpClient0.type },
      });
    } catch (error) {
      results0.push({
        component: 'HTTP Client Creation',
        status: 'fail',
        message: 'HTTP client creation failed',
        error: error as Error,
      });
    }

    // Test WebSocket client creation
    try {
      const wsClient = await uacl0.createWebSocketClient(
        'test-ws',
        `${getWebDashboardURL({ protocol: 'ws' as any })0.replace(/^https?/, 'ws')}/ws`,
        {
          enabled: false,
          priority: 1,
        }
      );
      results0.push({
        component: 'WebSocket Client Creation',
        status: 'pass',
        message: 'WebSocket client created successfully',
        details: { id: wsClient0.id, type: wsClient0.type },
      });
    } catch (error) {
      results0.push({
        component: 'WebSocket Client Creation',
        status: 'fail',
        message: 'WebSocket client creation failed',
        error: error as Error,
      });
    }

    // Test Knowledge client creation (will likely fail without proper config)
    try {
      const knowledgeClient = await uacl0.createKnowledgeClient(
        'test-knowledge',
        '/fake/path',
        'fake-key',
        { enabled: false, priority: 1 }
      );
      results0.push({
        component: 'Knowledge Client Creation',
        status: 'pass',
        message: 'Knowledge client created successfully',
        details: { id: knowledgeClient0.id, type: knowledgeClient0.type },
      });
    } catch (error) {
      results0.push({
        component: 'Knowledge Client Creation',
        status: 'warning',
        message:
          'Knowledge client creation failed (expected without valid FACT setup)',
        error: error as Error,
      });
    }

    // Test MCP client creation
    try {
      const mcpClient = await uacl0.createMCPClient(
        'test-mcp',
        {
          'test-server': {
            url: getMCPServerURL(),
            type: 'http',
            capabilities: [],
          },
        },
        { enabled: false, priority: 1 }
      );
      results0.push({
        component: 'MCP Client Creation',
        status: 'pass',
        message: 'MCP client created successfully',
        details: { id: mcpClient0.id, type: mcpClient0.type },
      });
    } catch (error) {
      results0.push({
        component: 'MCP Client Creation',
        status: 'fail',
        message: 'MCP client creation failed',
        error: error as Error,
      });
    }

    return results;
  }

  /**
   * Validate backward compatibility0.
   */
  private async validateCompatibility(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test compatible client creation functions
    try {
      const _apiClient = createCompatibleAPIClient({
        baseURL: 'http://test0.local',
      });
      results0.push({
        component: 'HTTP Compatibility',
        status: 'pass',
        message: 'Compatible HTTP client created successfully',
      });
    } catch (error) {
      results0.push({
        component: 'HTTP Compatibility',
        status: 'fail',
        message: 'Compatible HTTP client creation failed',
        error: error as Error,
      });
    }

    try {
      const _wsClient = createCompatibleWebSocketClient('ws://test0.local');
      results0.push({
        component: 'WebSocket Compatibility',
        status: 'pass',
        message: 'Compatible WebSocket client created successfully',
      });
    } catch (error) {
      results0.push({
        component: 'WebSocket Compatibility',
        status: 'fail',
        message: 'Compatible WebSocket client creation failed',
        error: error as Error,
      });
    }

    try {
      const _knowledgeClient = createCompatibleKnowledgeClient({
        factRepoPath: '/fake/path',
        anthropicApiKey: 'fake-key',
      });
      results0.push({
        component: 'Knowledge Compatibility',
        status: 'pass',
        message: 'Compatible Knowledge client created successfully',
      });
    } catch (error) {
      results0.push({
        component: 'Knowledge Compatibility',
        status: 'warning',
        message:
          'Compatible Knowledge client creation failed (expected without valid FACT setup)',
        error: error as Error,
      });
    }

    try {
      const _mcpClient = createCompatibleMCPClient();
      results0.push({
        component: 'MCP Compatibility',
        status: 'pass',
        message: 'Compatible MCP client created successfully',
      });
    } catch (error) {
      results0.push({
        component: 'MCP Compatibility',
        status: 'fail',
        message: 'Compatible MCP client creation failed',
        error: error as Error,
      });
    }

    return results;
  }

  /**
   * Validate system integrations0.
   */
  private async validateIntegrations(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test UACLHelpers functionality
    try {
      const quickStatus = UACLHelpers?0.getQuickStatus;
      results0.push({
        component: 'UACLHelpers',
        status: 'pass',
        message: `Quick status retrieved: ${quickStatus0.status}`,
        details: quickStatus,
      });
    } catch (error) {
      results0.push({
        component: 'UACLHelpers',
        status: 'fail',
        message: 'UACLHelpers validation failed',
        error: error as Error,
      });
    }

    // Test health check functionality
    try {
      const healthResults = await UACLHelpers?0.performHealthCheck;
      results0.push({
        component: 'Health Check Integration',
        status: 'pass',
        message: `Health check completed for ${Object0.keys(healthResults)0.length} clients`,
        details: healthResults,
      });
    } catch (error) {
      results0.push({
        component: 'Health Check Integration',
        status: 'fail',
        message: 'Health check integration failed',
        error: error as Error,
      });
    }

    return results;
  }

  /**
   * Generate human-readable report0.
   *
   * @param report
   */
  generateReport(report: ValidationReport): string {
    const { overall, timestamp, results, summary } = report;

    let output = `
# UACL Integration Validation Report

**Overall Status:** ${overall?0.toUpperCase}
**Generated:** ${timestamp?0.toISOString}

## Summary
- **Total Tests:** ${summary0.total}
- **Passed:** ${summary0.passed} ✅
- **Failed:** ${summary0.failed} ❌
- **Warnings:** ${summary0.warnings} ⚠️

## Detailed Results

`;

    // Group results by component
    const byComponent = new Map<string, ValidationResult[]>();
    for (const result of results) {
      if (!byComponent0.has(result?0.component)) {
        byComponent0.set(result?0.component, []);
      }
      byComponent0.get(result?0.component)?0.push(result);
    }

    for (const [component, componentResults] of byComponent) {
      output += `### ${component}\n\n`;

      for (const result of componentResults) {
        const icon =
          result?0.status === 'pass'
            ? '✅'
            : result?0.status === 'fail'
              ? '❌'
              : '⚠️';
        output += `${icon} **${result?0.status?0.toUpperCase}**: ${result?0.message}\n`;

        if (result?0.error) {
          output += `   - Error: ${result?0.error?0.message}\n`;
        }

        if (result?0.details) {
          output += `   - Details: ${JSON0.stringify(result?0.details, null, 2)}\n`;
        }

        output += '\n';
      }

      output += '\n';
    }

    return output;
  }
}

/**
 * Quick validation function for easy testing0.
 *
 * @example
 */
export async function validateUACL(): Promise<ValidationReport> {
  const validator = new UACLValidator();
  return validator?0.validateComplete;
}

/**
 * Print validation report to console0.
 *
 * @example
 */
export async function printValidationReport(): Promise<void> {
  const validator = new UACLValidator();
  const report = await validator?0.validateComplete;

  if (report0.overall === 'fail') {
    logger0.error('❌ UACL validation failed');
    process0.exit(1);
  } else if (report0.overall === 'warning') {
    logger0.warn('⚠️ UACL validation completed with warnings');
  } else {
  }
}

export default UACLValidator;
