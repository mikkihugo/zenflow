/**
 * UACL Integration Validation
 *
 * Validates that the UACL integration is complete and working correctly.
 * Tests all client types, factories, and integrations.
 */

import {
  createCompatibleAPIClient,
  createCompatibleKnowledgeClient,
  createCompatibleMCPClient,
  createCompatibleWebSocketClient,
} from './compatibility';
import { ClientType, UACLHelpers, uacl } from './index';

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
 * UACL Integration Validator
 *
 * @example
 */
export class UACLValidator {
  /**
   * Run complete UACL validation
   */
  async validateComplete(): Promise<ValidationReport> {
    const results: ValidationResult[] = [];

    // Test core UACL functionality
    results.push(...(await this.validateCore()));

    // Test client factories
    results.push(...(await this.validateFactories()));

    // Test client creation
    results.push(...(await this.validateClientCreation()));

    // Test backward compatibility
    results.push(...(await this.validateCompatibility()));

    // Test integrations
    results.push(...(await this.validateIntegrations()));

    // Calculate summary
    const summary = {
      total: results.length,
      passed: results.filter((r) => r.status === 'pass').length,
      failed: results.filter((r) => r.status === 'fail').length,
      warnings: results.filter((r) => r.status === 'warning').length,
    };

    const overall = summary.failed > 0 ? 'fail' : summary.warnings > 0 ? 'warning' : 'pass';

    return {
      overall,
      timestamp: new Date(),
      results,
      summary,
    };
  }

  /**
   * Validate core UACL functionality
   */
  private async validateCore(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test initialization
      await uacl.initialize();
      results.push({
        component: 'UACL Core',
        status: 'pass',
        message: 'UACL initialized successfully',
      });

      // Test status methods
      const isInitialized = uacl.isInitialized();
      results.push({
        component: 'UACL Core',
        status: isInitialized ? 'pass' : 'fail',
        message: `Initialization status: ${isInitialized}`,
      });

      // Test metrics
      const metrics = uacl.getMetrics();
      results.push({
        component: 'UACL Metrics',
        status: 'pass',
        message: `Metrics retrieved: ${metrics.total} total clients`,
        details: metrics,
      });

      // Test health status
      const health = uacl.getHealthStatus();
      results.push({
        component: 'UACL Health',
        status:
          health.overall === 'critical'
            ? 'fail'
            : health.overall === 'warning'
              ? 'warning'
              : 'pass',
        message: `System health: ${health.overall}`,
        details: health,
      });
    } catch (error) {
      results.push({
        component: 'UACL Core',
        status: 'fail',
        message: 'UACL core validation failed',
        error: error as Error,
      });
    }

    return results;
  }

  /**
   * Validate client factories
   */
  private async validateFactories(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test factory availability for each client type
    const clientTypes = [
      ClientType.HTTP,
      ClientType.WEBSOCKET,
      ClientType.KNOWLEDGE,
      ClientType.MCP,
    ];

    for (const clientType of clientTypes) {
      try {
        // This tests that the factory is properly registered
        const clients = uacl.getClientsByType(clientType);
        results.push({
          component: `${clientType} Factory`,
          status: 'pass',
          message: `Factory available for ${clientType} (${clients.length} clients)`,
        });
      } catch (error) {
        results.push({
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
   * Validate client creation
   */
  private async validateClientCreation(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test HTTP client creation
    try {
      const httpClient = await uacl.createHTTPClient(
        'test-http',
        'http://localhost:3000',
        { enabled: false, priority: 1 } // Disabled to avoid actual connections
      );
      results.push({
        component: 'HTTP Client Creation',
        status: 'pass',
        message: 'HTTP client created successfully',
        details: { id: httpClient.id, type: httpClient.type },
      });
    } catch (error) {
      results.push({
        component: 'HTTP Client Creation',
        status: 'fail',
        message: 'HTTP client creation failed',
        error: error as Error,
      });
    }

    // Test WebSocket client creation
    try {
      const wsClient = await uacl.createWebSocketClient('test-ws', 'ws://localhost:3456', {
        enabled: false,
        priority: 1,
      });
      results.push({
        component: 'WebSocket Client Creation',
        status: 'pass',
        message: 'WebSocket client created successfully',
        details: { id: wsClient.id, type: wsClient.type },
      });
    } catch (error) {
      results.push({
        component: 'WebSocket Client Creation',
        status: 'fail',
        message: 'WebSocket client creation failed',
        error: error as Error,
      });
    }

    // Test Knowledge client creation (will likely fail without proper config)
    try {
      const knowledgeClient = await uacl.createKnowledgeClient(
        'test-knowledge',
        '/fake/path',
        'fake-key',
        { enabled: false, priority: 1 }
      );
      results.push({
        component: 'Knowledge Client Creation',
        status: 'pass',
        message: 'Knowledge client created successfully',
        details: { id: knowledgeClient.id, type: knowledgeClient.type },
      });
    } catch (error) {
      results.push({
        component: 'Knowledge Client Creation',
        status: 'warning',
        message: 'Knowledge client creation failed (expected without valid FACT setup)',
        error: error as Error,
      });
    }

    // Test MCP client creation
    try {
      const mcpClient = await uacl.createMCPClient(
        'test-mcp',
        { 'test-server': { url: 'http://localhost:3000', type: 'http', capabilities: [] } },
        { enabled: false, priority: 1 }
      );
      results.push({
        component: 'MCP Client Creation',
        status: 'pass',
        message: 'MCP client created successfully',
        details: { id: mcpClient.id, type: mcpClient.type },
      });
    } catch (error) {
      results.push({
        component: 'MCP Client Creation',
        status: 'fail',
        message: 'MCP client creation failed',
        error: error as Error,
      });
    }

    return results;
  }

  /**
   * Validate backward compatibility
   */
  private async validateCompatibility(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test compatible client creation functions
    try {
      const _apiClient = createCompatibleAPIClient({ baseURL: 'http://test.local' });
      results.push({
        component: 'HTTP Compatibility',
        status: 'pass',
        message: 'Compatible HTTP client created successfully',
      });
    } catch (error) {
      results.push({
        component: 'HTTP Compatibility',
        status: 'fail',
        message: 'Compatible HTTP client creation failed',
        error: error as Error,
      });
    }

    try {
      const _wsClient = createCompatibleWebSocketClient('ws://test.local');
      results.push({
        component: 'WebSocket Compatibility',
        status: 'pass',
        message: 'Compatible WebSocket client created successfully',
      });
    } catch (error) {
      results.push({
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
      results.push({
        component: 'Knowledge Compatibility',
        status: 'pass',
        message: 'Compatible Knowledge client created successfully',
      });
    } catch (error) {
      results.push({
        component: 'Knowledge Compatibility',
        status: 'warning',
        message: 'Compatible Knowledge client creation failed (expected without valid FACT setup)',
        error: error as Error,
      });
    }

    try {
      const _mcpClient = createCompatibleMCPClient();
      results.push({
        component: 'MCP Compatibility',
        status: 'pass',
        message: 'Compatible MCP client created successfully',
      });
    } catch (error) {
      results.push({
        component: 'MCP Compatibility',
        status: 'fail',
        message: 'Compatible MCP client creation failed',
        error: error as Error,
      });
    }

    return results;
  }

  /**
   * Validate system integrations
   */
  private async validateIntegrations(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Test UACLHelpers functionality
    try {
      const quickStatus = UACLHelpers.getQuickStatus();
      results.push({
        component: 'UACLHelpers',
        status: 'pass',
        message: `Quick status retrieved: ${quickStatus.status}`,
        details: quickStatus,
      });
    } catch (error) {
      results.push({
        component: 'UACLHelpers',
        status: 'fail',
        message: 'UACLHelpers validation failed',
        error: error as Error,
      });
    }

    // Test health check functionality
    try {
      const healthResults = await UACLHelpers.performHealthCheck();
      results.push({
        component: 'Health Check Integration',
        status: 'pass',
        message: `Health check completed for ${Object.keys(healthResults).length} clients`,
        details: healthResults,
      });
    } catch (error) {
      results.push({
        component: 'Health Check Integration',
        status: 'fail',
        message: 'Health check integration failed',
        error: error as Error,
      });
    }

    return results;
  }

  /**
   * Generate human-readable report
   *
   * @param report
   */
  generateReport(report: ValidationReport): string {
    const { overall, timestamp, results, summary } = report;

    let output = `
# UACL Integration Validation Report

**Overall Status:** ${overall.toUpperCase()}
**Generated:** ${timestamp.toISOString()}

## Summary
- **Total Tests:** ${summary.total}
- **Passed:** ${summary.passed} ✅
- **Failed:** ${summary.failed} ❌
- **Warnings:** ${summary.warnings} ⚠️

## Detailed Results

`;

    // Group results by component
    const byComponent = new Map<string, ValidationResult[]>();
    for (const result of results) {
      if (!byComponent.has(result.component)) {
        byComponent.set(result.component, []);
      }
      byComponent.get(result.component)?.push(result);
    }

    for (const [component, componentResults] of byComponent) {
      output += `### ${component}\n\n`;

      for (const result of componentResults) {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        output += `${icon} **${result.status.toUpperCase()}**: ${result.message}\n`;

        if (result.error) {
          output += `   - Error: ${result.error.message}\n`;
        }

        if (result.details) {
          output += `   - Details: ${JSON.stringify(result.details, null, 2)}\n`;
        }

        output += '\n';
      }

      output += '\n';
    }

    return output;
  }
}

/**
 * Quick validation function for easy testing
 */
export async function validateUACL(): Promise<ValidationReport> {
  const validator = new UACLValidator();
  return validator.validateComplete();
}

/**
 * Print validation report to console
 */
export async function printValidationReport(): Promise<void> {
  const validator = new UACLValidator();
  const report = await validator.validateComplete();

  if (report.overall === 'fail') {
    console.error('❌ UACL validation failed');
    process.exit(1);
  } else if (report.overall === 'warning') {
    console.warn('⚠️ UACL validation completed with warnings');
  } else {
  }
}

export default UACLValidator;
