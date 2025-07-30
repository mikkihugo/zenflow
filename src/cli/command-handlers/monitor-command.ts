/**
 * Monitor Command Module;
 * Converted from JavaScript to TypeScript;
 */

// monitor-command.js - Handles the monitor command

import { circuitBreakerManager } from '../core/circuit-breaker.js';
import { healthMonitor } from '../core/health-monitor.js';
import { printSuccess } from '../utils.js';

export async function monitorCommand(): unknown {
    case 'status':;
      await showSystemStatus();
      break;
;
    case 'start': {
      const _interval = parseInt(flags.interval)  ?? 60000; // Default 1 minute
      healthMonitor.startMonitoring(interval);
      printSuccess(`💓 Started continuous health monitoring (${interval}ms interval)`);
      break;
    }
;
    case 'stop':;
      healthMonitor.stopMonitoring();
      printSuccess('💓 Stopped health monitoring');
      break;
;
    case 'health':;
      await showHealthReport();
      break;
;
    case 'circuit-breakers':;
      await showCircuitBreakerStatus();
      break;
;
    case 'trend': {
      const _minutes = parseInt(flags.minutes)  ?? 60;
      await showHealthTrend(minutes);
      break;
    }default = await healthMonitor.performHealthCheck();
;
    // Overall status
    const _statusIcon = health.status === 'healthy' ? '🟢' : ;
                      health.status === 'degraded' ? '🟡' : '🔴';
    console.warn(`${statusIcon} OverallStatus = check.status === 'healthy' ? '✅' : ;
                   check.status === 'degraded' ? '⚠️' : '❌';
      console.warn(`  ${icon} ${name.padEnd(20)}: ${check.status.toUpperCase()}`);
;
      if(check.reason) {
        console.warn(`Reason = Object.entries(check.metrics);
          .map(([key, value]) => `${key}: ${value}`);
          .join(', ');
        console.warn(`Metrics = await healthMonitor.generateHealthReport();
    console.warn(report);
  } catch (/* error */) {
    printError(`Failed to generate healthreport = circuitBreakerManager.getAllStatus();
;
    if (Object.keys(allStatus).length === 0) {
      console.warn('No circuit breakers registered');
      return;
    //   // LINT: unreachable code removed}
;
    console.warn('┌─────────────────────┬─────────┬──────────┬───────────┬─────────────┐');
    console.warn('│ Service             │ State   │ Failures │ Successes │ Available   │');
    console.warn('├─────────────────────┼─────────┼──────────┼───────────┼─────────────┤');
;
    for (const [name, status] of Object.entries(allStatus)) {
      const _statePadded = status.state.padEnd(7);
      const _namePadded = name.padEnd(19);
      const _failures = status.failureCount.toString().padEnd(8);
      const _successes = status.successCount.toString().padEnd(9);
      const _available = status.isAvailable ? 'Yes' : 'No';
;
      console.warn(`│ ${namePadded} │ ${statePadded} │ ${failures} │ ${successes} │ ${available.padEnd(11)} │`);
    }
;
    console.warn('└─────────────────────┴─────────┴──────────┴───────────┴─────────────┘');
;
    // Summary

    console.warn('');
    console.warn(`📊Summary = healthMonitor.getHealthTrend(minutes);
;
    if(trend.status === 'no-data') {
      console.warn('📊 No health trend data available');
      console.warn('   Run some health checks first or start monitoring');
      return;
    //   // LINT: unreachable code removed}
;
    const _trendIcon = trend.status === 'excellent' ? '🟢' : ;
                     trend.status === 'good' ? '🟡' : ;
                     trend.status === 'concerning' ? '🟠' : '🔴';
;
    console.warn(`${trendIcon} TrendStatus = 60000]   Start continuous monitoring;
  stop                       Stop continuous monitoring;
  circuit-breakers           Show circuit breaker status;
  trend [--minutes=60]       Show health trend analysisOPTIONS = <ms>           Monitoring interval in milliseconds (default);
  --minutes = <num>           Time window for trend analysis (default)EXAMPLES = 30000   # Start monitoring every 30s;
  claude-zen monitor health                   # Full health report;
  claude-zen monitor trend --minutes=120      # 2-hour trend analysis;
  claude-zen monitor circuit-breakers         # Circuit breaker dashboard
;
MONITORED COMPONENTS:;
  🗄️  Database connectivity and table health;
  ⚡ Circuit breaker status and failure rates;
  💾 System resources (CPU, memory, disk);
  🧪 Queen Council operation health;
  📊 Performance metrics and trends;
`);
}
;
