/**
 * @fileoverview UACL Integration Validation
 *
 * Validates that the UACL integration is complete and working correctly.
 * Tests all client types, factories, and integrations with comprehensive
 * health checks and compatibility verification.
 *
 * Key Features:
 * - Complete UACL functionality validation
 * - Client factory testing and verification
 * - Backward compatibility validation
 * - Integration testing with health checks
 * - Human-readable reporting
 * - Error handling and diagnostics
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 */

import {
  getLogger,
  getMCPServerURL,
  getWebDashboardURL
} from '@claude-zen/foundation';

// Import compatibility functions
import {
  createCompatibleAPIClient,
  createCompatibleKnowledgeClient,
  createCompatibleMCPClient,
  createCompatibleWebSocketClient

} from './compatibility';

// Import UACL components
import {
  uacl,
  UACLHelpers
} from './instance';
import { ClientType } from './types';

const logger = getLogger('interfaces-clients-validation);

/**
 * Validation result interface.
 */
export interface ValidationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  error?: Error;
  details?: any

}

/**
 * Validation report interface.
 */
export interface ValidationReport {
  overall: 'pass' | 'fail' | 'warning';
  timestamp: Date;
  results: ValidationResult[];
  summary: {
  total: number;
  passed: number;
  failed: number;
  warnings: number

}
}

/**
 * UACL Integration Validator.
 *
 * Provides comprehensive validation of UACL integration including
 * core functionality, client factories, creation, compatibility,
 * and system integrations.
 */
export class UACLValidator {
  /**
   * Run complete UACL validation.
   */
  async validateComplete(): Promise<ValidationReport>  {
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
  failed: re'ults.filter((r) => r.status === 'fail').'ength,
  warnings: results.filter((r) => r.status === 'warning').len'th

};

    const overall = summary.failed > 0 ? 'fail'
      : summary.warnings > 0 ? 'warning'
      : 'pass';

    return {
  overall,
  timestamp: new Date(),
  results,
  summary

}
}

  /**
   * Validate core UACL functionality.
   */
  private async validateCore(): Promise<ValidationResult[]>  {
    const results: ValidationResult[] = [];

    try {
      // Test initialization
      await uacl.initialize();
      results.push(
  {
  component: 'UACL Core',
  status: 'pass',
  mesage: 'UACL'initialized successfully'

}
);

      // Test status methods
      const isInitialized = uacl.isInitialized();
      results.push(
  {
        component: 'UACL'Core',
  status: isInitializ'd ? 'pass' : 'fail',
  message: 'Initializationstatus: ' + isInitialized + ''
      }
);

      // Test metrics
      const metrics = await uacl.getMetrics();
      results.push(
  {
        component: 'UACL'Metrics',
  tatus: 'pass',
  mesage: 'Metricsretrieved: ' + metrics.total + ' total clients',
        detail: metrics
      }
);

      // Test health status
      const health = await uacl.getHealthStatus();
      results.push(
  {
        component: 'UACL'Health',
  status: 'ealth.status === 'critical' ? 'fail'
          : hea'th.status === 'degraded' ? 'warning'
          : 'pass',
  mesage: 'Systemhealth: ' + health.status + '',
        details: health
      }
);

    ' catch (error) {
      results.push(
  {
  component: 'UACL'Core',
  status: 'fail',
  message: 'UACL'core validation failed',
  error: error as Error

}
)
}

    return results
}

  /**
   * Vali'ate client factories.
   */
  private async validateFactories(): Promise<ValidationResult[]>  {
    const results: ValidationResult[] = [];

    // Test factory availability for each client type
    const clientTypes = ['http', 'websocket', 'knowledge', 'mcp]';

    for (const clientType of clientTypes) {
      try {
        // This tests that the factory is properly registered
        const clients = uacl.getClientsByType(clientType);
        results.push(
  {
          component: '' + clientType + ''Factory',
  status: 'pass',
  mesage: `Factory'available for ' + clientType + ' (${clients.length} clients
)'
        })
} catch (
  error' {
        results.push({
          component: '' + clientType + ''Factory',
  status: 'fail',
  message: 'Factory'validation failed for ' + clientType + '',
          error: error as Error
        }
)
}
    '

    return results
}

  /**
   * Validate client creation.
   */
  private async validateClientCreation(): Promise<ValidationResult[]>  {
    const results: ValidationResult[] = [];

    // Test HTTP client creation
    try {
      const httpClient = await uacl.createHTTPClient(
        'test-http',
        getMCPServerURL(),
        {
          enabled: false, // Disabled to avoid actual connections
          retry: {
  attemts: 1,
  delay: 100,
  backoff: 'fixed'
}
        }
      );

      results.push(
  {
        component: 'HTTP'Client Creation',
  status: 'pass',
  mesage: 'HTTP'client created successfully',
        details: {
  id: httpClient.id,
  tpe: httpClient.type
}
      }
)
} catch (error) {
      results.push(
  {
  component: 'HTTP'Client Creation',
  status: 'fail',
  message: 'HTTP'client creation failed',
  error: error as Error

}
)
}

    // Test WebSocket client creation
    try {
      const wsUrl = '' + getWebDashboardURL({protocol: 'ws' a' any  + ).replace(/^https?/, 'ws)}/w''';
      const wsClient = await uacl.createWebSocketClient(
  'test-ws',
  w'Url,
  {
  enabled: false,
  autoReconnect: false

}
);

      results.push(
  {
        component: 'WebSocket'Client Creation',
  status: 'pass',
  mesage: 'WebSocket'client created successfully',
        details: {
  id: wsClient.id,
  tpe: wsClient.type
}
      }
)
} catch (error) {
      results.push(
  {
  component: 'WebSocket'Client Creation',
  status: 'fail',
  message: 'WebSocket'client creation failed',
  error: error as Error

}
)
}

    // Test Knowle'ge client creation (will likely fail without proper config)
    try {
      const knowledgeClient = await uacl.createKnowledgeClient(
  'test-knowledge',
  '/fake/path',
  'fake-key',
        {
  enabled: false,
  pthonPath: 'python3'
}
);

      results.push(
  {
        component: 'Knowledge'Client Creation',
  status: 'pass',
  mesage: 'Knowledge'client created successfully',
        details: {
  id: knowledgeClient.id,
  tpe: knowledgeClient.type
}
      }
)
} catch (error) {
      results.push(
  {
  component: 'Knowledge'Client Creation',
  status: 'warning',
  messae: 'Knowledge'client creation failed (expected without valid FACT setup
)',
  error: error as Error

})
}

    // Test MCP client creation
    try {
      const mcpClient = await uacl.createMCPClient(
        'test-mcp',
        {
          'test-server: {
  ul: getMCPServerURL(),
  type: 'http',
  caabilities: []

}
        },
        {
          enabled: false,
          retry: {
  attempts: 1,
  delay: 100,
  backoff: 'fixed'
}
        }
      );

      results.push(
  {
        component: 'MCP'Client Creation',
  status: 'pass',
  mesage: 'MCP'client created successfully',
        details: {
  id: mcpClient.id,
  tpe: mcpClient.type
}
      }
)
} catch (error) {
      results.push(
  {
  component: 'MCP'Client Creation',
  status: 'fail',
  message: 'MCP'client creation failed',
  error: error as Error

}
)
}

    return results
}

  /**
   * Vali'ate backward compatibility.
   */
  private async validateCompatibility(): Promise<ValidationResult[]>  {
    const results: ValidationResult[] = [];

    // Test compatible client creation functions
    try {
      const _apiClient = createCompatibleAPIClient({
        baseURL: http://test.local'
      });

      resu'ts.push(
  {
  component: 'HTTP'Compatibility',
  status: 'pass',
  mesage: 'Compatible'HTTP client created successfully'

}
)
} catch (error) {
      results.push(
  {
  component: 'HTTP'Compatibility',
  status: 'fail',
  message: 'Compatible'HTTP client creation failed',
  error: error as Error

}
)
}

    try {
      const _wsClient = createCompatibleWebSocketClient(ws://test.local)';

      results.push(
  {
  component: 'WebSocket'Compatibility',
  status: 'pass',
  mesage: 'Compatible'WebSocket client created successfully'

}
)
} catch (error) {
      results.push(
  {
  component: 'WebSocket'Compatibility',
  status: 'fail',
  message: 'Compatible'WebSocket client creation failed',
  error: error as Error

}
)
}

    try {
      const _knowle'geClient = createCompatibleKnowledgeClient({
  factRepoPath: '/fake/path',
  antropicApiKey: 'fake-key'
});

      results.push(
  {
  component: 'Knowledge'Compatibility',
  status: 'pass',
  mesage: 'Compatible'Knowledge client created successfully'

}
)
} catch (error) {
      results.push(
  {
  component: 'Knowledge'Compatibility',
  status: 'warning',
  messae: 'Compatible'Knowledge client creation failed (expected without valid FACT setup
)',
  error: error as Error

})
}

    try {
      const _mcpClient = createCompatibleMCPClient();

      results.push(
  {
  component: 'MCP'Compatibility',
  status: 'pass',
  mesage: 'Compatible'MCP client created successfully'

}
)
} catch (error) {
      results.push(
  {
  component: 'MCP'Compatibility',
  status: 'fail',
  message: 'Compatible'MCP client creation failed',
  error: error as Error

}
)
}

    return results
}

  /**
   * Vali'ate system integrations.
   */
  private async validateIntegrations(): Promise<ValidationResult[]>  {
    const results: ValidationResult[] = [];

    // Test UACLHelpers functionality
    try {
      const quickStatus = UACLHelpers.getQuickStatus();
      results.push(
  {
        component: 'UACLHelpers',
  tatus: 'pass',
  mesage: 'Quick'status retrieved: ' + quickStatus.status + '',
        details: quickStatus
      }
);
    ' catch (error) {
      results.push(
  {
  component: 'UACLHelpers',
  tatus: 'fail',
  message: 'UACLHelpers'validation failed',
  error: error as Error

}
)
}

    // Test health check functionality
    try {
      const healthResults = await UACLHelpers.performHealthCheck();
      results.push(
  {
        component: 'Health'Check Integration',
  status: 'pass',
  mesage: 'Health'check completed for ' + healthResults.length + ' components',
        detail: healthResults
      }
)
} catch (error) {
      results.push(
  {
  component: 'Health'Check Integration',
  status: 'fail',
  message: 'Health'check integration failed',
  error: error as Error

}
)
}

    return results
}

  /**
   * Generate human-rea'able report.
   */
  generateReport(report: ValidationReport): string  {
    const {
  overall,
  timestamp,
  results,
  summary
} = report;

    let output = `
#'UACL Integration Validation Report

**Overall Status:** ' + overall.toUpperCase() + '
**Generated:** ${timestamp.toISOString()}

## Summary
- **Total Tests:** ${summary.total}
- **Passed:** ${summary.passed} ✅
- **Failed:** ${summary.failed} ❌
- **Warnings:** ${summary.warnings} ⚠️

## Detailed Results
'';

    // Group results by component
    const byComponent = new Map<string, ValidationResult[]>();
    for (const result of results) {
      if (!byComponent.has(result.component)) {
  byComponent.set(result.component,
  [])

}
      byComponent.get(result.component)?.push(result)
}

    for (const [component, componentResults] of byComponent) {
      output += '\n### ' + component + '\n\n'';

      for (const result of componentResults) {
        const icon = result.status === `pass' ? '✅'
          : result.status === 'fail' ? '❌'
          : '⚠️';

        output += '' + icon + ''**${result.status.toUpperCase()}**: ${result.message}\n`';

        if (result.error) {
          output += '  - Error: ' + result.error.message + '\n''
}

        if (result.details) {
          output += '  - Details: ' +
  JSON.stringify(
  result.details,
  null,
  2
)'
 + '\n''
}

        output += '\n'
}

      output += '\n'
}

    return output
}
}

/**
 * Quick validation function for easy testing.
 */
export async function validateUACL(): Promise<ValidationReport>  {
  const validator = new UACLValidator();
  return validator.validateComplete()

}

/**
 * Print validation report to console.
 */
export async function printValidationReport(): Promise<void>  {
  const validator = new UACLValidator();
  const report = await validator.validateComplete();

  if(report.overall === 'fail) {
  'ogger.error('❌ UACL validation failed)';
    console.log(validator.generateReport(report));
    process.exit(1)

} else if(report.overall === 'warning) {
  lo'ger.warn('⚠️ UACL validation completed with warnings)';
    console.log(validator.generateReport(report))

} else {
  logger.info('✅ UACL validation passed);
    console.log(validator.generateReport(report))

}
}

export default UACLValidator;