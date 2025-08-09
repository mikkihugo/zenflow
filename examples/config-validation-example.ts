/**
 * @file Configuration Validation System Example
 *
 * Demonstrates the comprehensive configuration validation and health checking system
 */

import {
  type ConfigHealthReport,
  config,
  configHealthChecker,
  createConfigHealthEndpoint,
  createDeploymentReadinessEndpoint,
  runStartupValidation,
  type StartupValidationResult,
} from '../src/config';

/**
 * Example 1: Basic Configuration Health Check
 */
async function basicHealthCheck() {
  console.log('🏥 Basic Health Check Example');
  console.log('================================\n');

  try {
    // Initialize configuration
    await config.init();

    // Get health report
    const healthReport = await config.getHealthReport();
    console.log('📊 Health Report:', {
      status: healthReport.status,
      score: healthReport.score,
      environment: healthReport.environment,
    });

    // Check specific areas
    console.log('🔍 Health Details:');
    console.log('  Structure:', healthReport.details.structure ? '✅' : '❌');
    console.log('  Security:', healthReport.details.security ? '✅' : '❌');
    console.log('  Performance:', healthReport.details.performance ? '✅' : '❌');
    console.log('  Production Ready:', healthReport.details.production ? '✅' : '❌');

    // Show recommendations
    if (healthReport.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      healthReport.recommendations.forEach((rec) => console.log(`  • ${rec}`));
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

/**
 * Example 2: Production Deployment Validation
 */
async function productionDeploymentValidation() {
  console.log('\n🚀 Production Deployment Validation Example');
  console.log('===============================================\n');

  try {
    // Check if production ready
    const isReady = await config.isProductionReady();
    console.log('🚀 Production Ready:', isReady ? '✅ YES' : '❌ NO');

    // Check for port conflicts
    const portCheck = await config.checkPorts();
    if (portCheck.conflicts.length > 0) {
      console.log('\n⚠️  Port Conflicts Detected:');
      portCheck.conflicts.forEach((conflict) => {
        console.log(
          `  ${conflict.severity === 'error' ? '❌' : '⚠️'} Port ${conflict.port}: ${conflict.services.join(', ')}`
        );
      });

      console.log('\n💡 Port Recommendations:');
      portCheck.recommendations.forEach((rec) => console.log(`  • ${rec}`));
    } else {
      console.log('🌐 Ports: ✅ No conflicts detected');
    }

    // Run comprehensive validation
    const validation = await configHealthChecker.validateForProduction();

    console.log('\n📋 Production Validation Results:');
    console.log('  Deployment Ready:', validation.deploymentReady ? '✅' : '❌');
    console.log('  Blockers:', validation.blockers.length);
    console.log('  Warnings:', validation.warnings.length);

    if (validation.blockers.length > 0) {
      console.log('\n🚫 Deployment Blockers:');
      validation.blockers.forEach((blocker) => console.log(`  ❌ ${blocker}`));
    }
  } catch (error) {
    console.error('❌ Production validation failed:', error);
  }
}

/**
 * Example 3: Startup Validation with Options
 */
async function startupValidationExample() {
  console.log('\n🔍 Startup Validation Example');
  console.log('==============================\n');

  try {
    // Run startup validation with various options
    const strictValidation: StartupValidationResult = await runStartupValidation({
      strict: true,
      enforceProductionStandards: true,
      outputFormat: 'console',
      skipValidation: [], // Don't skip anything
    });

    console.log('📊 Validation Summary:');
    console.log('  Success:', strictValidation.success ? '✅' : '❌');
    console.log('  Environment:', strictValidation.environment);
    console.log('  Errors:', strictValidation.errors.length);
    console.log('  Warnings:', strictValidation.warnings.length);
    console.log('  Blockers:', strictValidation.blockers.length);
    console.log('  Exit Code:', strictValidation.exitCode);

    // Show production readiness
    console.log(
      '  Production Ready:',
      strictValidation.validationDetails.productionReady ? '✅' : '❌'
    );

    if (strictValidation.validationDetails.failsafeApplied.length > 0) {
      console.log('\n🛡️  Failsafe Defaults Applied:');
      strictValidation.validationDetails.failsafeApplied.forEach((applied) => {
        console.log(`  🛡️  ${applied}`);
      });
    }
  } catch (error) {
    console.error('❌ Startup validation failed:', error);
  }
}

/**
 * Example 4: Health Monitoring Setup
 */
async function healthMonitoringExample() {
  console.log('\n📡 Health Monitoring Example');
  console.log('=============================\n');

  try {
    // Initialize health checker with monitoring
    await configHealthChecker.initialize({
      enableMonitoring: true,
      healthCheckFrequency: 10000, // 10 seconds
    });

    // Set up event listeners
    configHealthChecker.on('health:changed', (report: ConfigHealthReport) => {
      console.log(`🔄 Health status changed to: ${report.status.toUpperCase()}`);
      console.log(`   Score: ${report.score}/100`);
    });

    configHealthChecker.on('health:critical', (report: ConfigHealthReport) => {
      console.log('🚨 CRITICAL: Configuration health is critical!');
      console.log('   Recommendations:', report.recommendations);
    });

    configHealthChecker.on('health:recovered', (report: ConfigHealthReport) => {
      console.log('✅ RECOVERED: Configuration health has improved');
      console.log(`   New score: ${report.score}/100`);
    });

    console.log('📡 Health monitoring started...');
    console.log('   Frequency: 10 seconds');
    console.log('   Listening for health changes...');

    // Run for 30 seconds then stop
    setTimeout(() => {
      configHealthChecker.stopMonitoring();
      console.log('📡 Health monitoring stopped');
    }, 30000);
  } catch (error) {
    console.error('❌ Health monitoring setup failed:', error);
  }
}

/**
 * Example 5: Express.js Health Endpoints
 */
async function expressHealthEndpointsExample() {
  console.log('\n🌐 Express.js Health Endpoints Example');
  console.log('=======================================\n');

  // This example shows how to integrate health endpoints into an Express app
  const exampleCode = `
// In your Express.js app:
import express from 'express';
import { 
  createConfigHealthEndpoint, 
  createDeploymentReadinessEndpoint 
} from './src/config';

const app = express();

// Configuration health endpoint
app.get('/health/config', createConfigHealthEndpoint());

// Deployment readiness endpoint  
app.get('/health/deployment', createDeploymentReadinessEndpoint());

// Example responses:
// GET /health/config
// {
//   "success": true,
//   "health": {
//     "status": "healthy",
//     "score": 92,
//     "details": {
//       "structure": true,
//       "security": true,
//       "performance": true,
//       "production": true
//     },
//     "recommendations": [],
//     "timestamp": 1623456789123,
//     "environment": "production"
//   },
//   "timestamp": "2024-01-15T10:30:00.000Z"
// }

// GET /health/deployment  
// {
//   "success": true,
//   "deployment": {
//     "ready": true,
//     "blockers": [],
//     "warnings": ["Debug logging enabled in production"],
//     "recommendations": ["Consider using info log level in production"]
//   },
//   "ports": {
//     "conflicts": [],
//     "recommendations": []
//   },
//   "timestamp": "2024-01-15T10:30:00.000Z",
//   "environment": "production"
// }

app.listen(3000, () => {
  console.log('Health endpoints available at:');
  console.log('  http://localhost:3000/health/config');
  console.log('  http://localhost:3000/health/deployment');
});
`;

  console.log(exampleCode);
}

/**
 * Example 6: CI/CD Integration Example
 */
async function cicdIntegrationExample() {
  console.log('\n🔄 CI/CD Integration Example');
  console.log('=============================\n');

  const cicdScript = `
# Docker health check example
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD node scripts/validate-config.js --silent || exit 1

# GitHub Actions workflow step
- name: Validate Configuration
  run: |
    node scripts/validate-config.js --strict --production-standards --json > config-validation.json
    cat config-validation.json
  env:
    NODE_ENV: production
    ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}

# Jenkins pipeline step
stage('Config Validation') {
  steps {
    sh 'node scripts/validate-config.js --strict --json > validation-result.json'
    publishTestResults testResultsPattern: 'validation-result.json'
  }
  post {
    failure {
      echo 'Configuration validation failed - blocking deployment'
    }
  }
}

# Kubernetes deployment readiness probe
readinessProbe:
  httpGet:
    path: /health/deployment
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3

# Terraform deployment validation
resource "null_resource" "config_validation" {
  provisioner "local-exec" {
    command = "node scripts/validate-config.js --strict --production-standards"
    
    # Only run if validation passes
    on_failure = fail
  }
  
  triggers = {
    config_hash = filemd5("config/production.json")
  }
}
`;

  console.log(cicdScript);
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('🎯 Claude-Zen Configuration Validation Examples');
  console.log('=================================================\n');

  try {
    // Run examples
    await basicHealthCheck();
    await productionDeploymentValidation();
    await startupValidationExample();
    await healthMonitoringExample();
    await expressHealthEndpointsExample();
    await cicdIntegrationExample();

    console.log('\n✅ All examples completed successfully!');
    console.log('\n🔗 Quick Start Commands:');
    console.log('  npm run validate-config                    # Basic validation');
    console.log('  npm run validate-config -- --strict        # Strict validation');
    console.log('  node scripts/validate-config.js --help     # Show all options');
  } catch (error) {
    console.error('❌ Examples failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Example execution failed:', error);
    process.exit(1);
  });
}

export {
  basicHealthCheck,
  productionDeploymentValidation,
  startupValidationExample,
  healthMonitoringExample,
};
