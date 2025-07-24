// monitor-command.js - Handles the monitor command

import { log } from '../core/logger.js';
import { healthMonitor } from '../core/health-monitor.js';
import { circuitBreakerManager } from '../core/circuit-breaker.js';
import { printSuccess, printError, printInfo } from '../utils.js';

export async function monitorCommand(args, flags) {
  const subcommand = args[0] || 'status';

  switch (subcommand) {
    case 'status':
      await showSystemStatus();
      break;
      
    case 'start':
      const interval = parseInt(flags.interval) || 60000; // Default 1 minute
      healthMonitor.startMonitoring(interval);
      printSuccess(`💓 Started continuous health monitoring (${interval}ms interval)`);
      break;
      
    case 'stop':
      healthMonitor.stopMonitoring();
      printSuccess('💓 Stopped health monitoring');
      break;
      
    case 'health':
      await showHealthReport();
      break;
      
    case 'circuit-breakers':
      await showCircuitBreakerStatus();
      break;
      
    case 'trend':
      const minutes = parseInt(flags.minutes) || 60;
      await showHealthTrend(minutes);
      break;
      
    default:
      printError(`Unknown monitor command: ${subcommand}`);
      showMonitorHelp();
  }
}

async function showSystemStatus() {
  printInfo('📊 System Status Check');
  console.log('━'.repeat(50));
  
  try {
    const health = await healthMonitor.performHealthCheck();
    
    // Overall status
    const statusIcon = health.status === 'healthy' ? '🟢' : 
                      health.status === 'degraded' ? '🟡' : '🔴';
    console.log(`${statusIcon} Overall Status: ${health.status.toUpperCase()}`);
    console.log(`🕐 Last Check: ${health.timestamp}`);
    console.log('');
    
    // Individual checks
    console.log('🔍 Component Status:');
    for (const [name, check] of Object.entries(health.checks)) {
      const icon = check.status === 'healthy' ? '✅' : 
                   check.status === 'degraded' ? '⚠️' : '❌';
      console.log(`  ${icon} ${name.padEnd(20)}: ${check.status.toUpperCase()}`);
      
      if (check.reason) {
        console.log(`      Reason: ${check.reason}`);
      }
      
      if (check.metrics) {
        const metrics = Object.entries(check.metrics)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        console.log(`      Metrics: ${metrics}`);
      }
    }
    
  } catch (error) {
    printError(`Failed to get system status: ${error.message}`);
  }
}

async function showHealthReport() {
  try {
    const report = await healthMonitor.generateHealthReport();
    console.log(report);
  } catch (error) {
    printError(`Failed to generate health report: ${error.message}`);
  }
}

async function showCircuitBreakerStatus() {
  printInfo('⚡ Circuit Breaker Status');
  console.log('━'.repeat(60));
  
  try {
    const allStatus = circuitBreakerManager.getAllStatus();
    
    if (Object.keys(allStatus).length === 0) {
      console.log('No circuit breakers registered');
      return;
    }
    
    console.log('┌─────────────────────┬─────────┬──────────┬───────────┬─────────────┐');
    console.log('│ Service             │ State   │ Failures │ Successes │ Available   │');
    console.log('├─────────────────────┼─────────┼──────────┼───────────┼─────────────┤');
    
    for (const [name, status] of Object.entries(allStatus)) {
      const statePadded = status.state.padEnd(7);
      const namePadded = name.padEnd(19);
      const failures = status.failureCount.toString().padEnd(8);
      const successes = status.successCount.toString().padEnd(9);
      const available = status.isAvailable ? 'Yes' : 'No';
      
      console.log(`│ ${namePadded} │ ${statePadded} │ ${failures} │ ${successes} │ ${available.padEnd(11)} │`);
    }
    
    console.log('└─────────────────────┴─────────┴──────────┴───────────┴─────────────┘');
    
    // Summary
    const summary = circuitBreakerManager.getHealthSummary();
    console.log('');
    console.log(`📊 Summary: ${summary.totalBreakers} breakers, ${summary.healthyBreakers} healthy, ${summary.openBreakers} open`);
    console.log(`🎯 Overall Health: ${Math.round(summary.overallHealth * 100)}%`);
    
  } catch (error) {
    printError(`Failed to get circuit breaker status: ${error.message}`);
  }
}

async function showHealthTrend(minutes) {
  printInfo(`📈 Health Trend (${minutes} minutes)`);
  console.log('━'.repeat(40));
  
  try {
    const trend = healthMonitor.getHealthTrend(minutes);
    
    if (trend.status === 'no-data') {
      console.log('📊 No health trend data available');
      console.log('   Run some health checks first or start monitoring');
      return;
    }
    
    const trendIcon = trend.status === 'excellent' ? '🟢' : 
                     trend.status === 'good' ? '🟡' : 
                     trend.status === 'concerning' ? '🟠' : '🔴';
    
    console.log(`${trendIcon} Trend Status: ${trend.status.toUpperCase()}`);
    console.log(`📊 Health Rate: ${trend.healthPercentage}%`);
    console.log(`📈 Data Points: ${trend.totalChecks} checks`);
    console.log('');
    console.log('📋 Breakdown:');
    console.log(`  ✅ Healthy:   ${trend.healthyCount}`);
    console.log(`  ⚠️  Degraded:  ${trend.degradedCount}`);
    console.log(`  ❌ Unhealthy: ${trend.unhealthyCount}`);
    console.log('');
    console.log(`🔍 Latest: ${trend.latestStatus.toUpperCase()}`);
    
  } catch (error) {
    printError(`Failed to get health trend: ${error.message}`);
  }
}

function showMonitorHelp() {
  console.log(`
📊 SYSTEM MONITORING - Real-time Health and Performance Monitoring

USAGE:
  claude-zen monitor <command> [options]

COMMANDS:
  status                     Show current system status (default)
  health                     Generate comprehensive health report
  start [--interval=60000]   Start continuous monitoring
  stop                       Stop continuous monitoring
  circuit-breakers           Show circuit breaker status
  trend [--minutes=60]       Show health trend analysis

OPTIONS:
  --interval=<ms>           Monitoring interval in milliseconds (default: 60000)
  --minutes=<num>           Time window for trend analysis (default: 60)

EXAMPLES:
  claude-zen monitor                          # Show current status
  claude-zen monitor start --interval=30000   # Start monitoring every 30s
  claude-zen monitor health                   # Full health report
  claude-zen monitor trend --minutes=120      # 2-hour trend analysis
  claude-zen monitor circuit-breakers         # Circuit breaker dashboard

MONITORED COMPONENTS:
  🗄️  Database connectivity and table health
  ⚡ Circuit breaker status and failure rates
  💾 System resources (CPU, memory, disk)
  🧪 Queen Council operation health
  📊 Performance metrics and trends
`);
}