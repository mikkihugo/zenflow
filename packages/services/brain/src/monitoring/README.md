# Intelligence Subsystem - Agent Health Monitor

## Overview

The Intelligence subsystem provides advanced monitoring, learning, and optimization capabilities for the Claude Code Zen swarm coordination system. This directory contains:

- **Agent Learning System** (`agent-learning-system.ts`) - Dynamic performance optimization and learning rate adaptation
- **Agent Health Monitor** (`agent-health-monitor.ts`) - Comprehensive health monitoring and recovery recommendations

## Agent Health Monitor

### Features

The `AgentHealthMonitor` provides comprehensive health management for swarm agents with the following capabilities:

#### Real-time Health Tracking

- **Health Status**: Tracks agent status (healthy, degraded, unhealthy, critical, unknown)
- **Performance Metrics**: Monitors CPU, memory, disk usage, network latency, task success rates
- **Health Scoring**: Calculates weighted health scores based on multiple performance factors
- **Trend Analysis**: Analyzes health trends over time with confidence scoring

#### Predictive Health Detection

- **Trend Prediction**: Predicts future health status based on historical data
- **Degradation Detection**: Early warning system for performance degradation
- **Contributing Factors**: Identifies specific issues affecting agent health
- **Time-to-Change Estimation**: Predicts when status changes will occur

#### Alerting and Notification System

- **Threshold-based Alerts**: Configurable thresholds for all monitored metrics
- **Severity Classification**: Alert severity levels (info, warning, error, critical)
- **Alert Aggregation**: Prevents alert spam through intelligent aggregation
- **Alert Resolution**: Track and resolve alerts with resolution details

#### Recovery Action Recommendations

- **Intelligent Recommendations**: AI-powered recovery action suggestions
- **Priority Scoring**: Actions prioritized by impact and urgency
- **Risk Assessment**: Risk level analysis for each recovery action
- **Automation Support**: Support for automated and manual recovery actions
- **Confidence Scoring**: Confidence levels for recovery success

#### System-wide Analytics

- **Health Summary**: System-wide health overview and statistics
- **Performance Trends**: System-level performance trend analysis
- **Top Issues Identification**: Identifies most common health issues
- **Recovery Tracking**: Tracks recovery attempts and success rates

### Usage

#### Basic Setup

```typescript
import {
  AgentHealthMonitor,
  createAgentHealthMonitor,
  type HealthMonitorConfig,
} from './agent-health-monitor.ts';

// Create with default configuration
const healthMonitor = createAgentHealthMonitor();

// Create with custom configuration
const customConfig: Partial<HealthMonitorConfig> = {
  healthCheckInterval: 30000,
  alertThresholds: {
    cpu: 0.8,
    memory: 0.9,
    taskFailureRate: 0.3,
  },
};

const monitor = new AgentHealthMonitor(customConfig);
```

#### Health Monitoring

```typescript
// Update agent health metrics
monitor.updateAgentHealth('agent-1', {
  cpuUsage: 0.65,
  memoryUsage: 0.45,
  taskSuccessRate: 0.92,
  averageResponseTime: 1500,
  errorRate: 0.05,
});

// Get agent health status
const health = monitor.getAgentHealth('agent-1');
console.log(`Agent health: ${health.status} (score: ${health.healthScore})`);

// Get health trend analysis
const trend = monitor.getHealthTrend('agent-1');
console.log(`Health trend: ${trend.trend} (confidence: ${trend.confidence})`);
```

#### Health Queries

```typescript
// Get agents by health status
const healthyAgents = monitor.getHealthyAgents();
const degradedAgents = monitor.getDegradedAgents();
const unhealthyAgents = monitor.getUnhealthyAgents();

// Get system-wide health summary
const summary = monitor.getSystemHealthSummary();
console.log(`System health: ${summary.systemHealthScore}`);
console.log(`Active alerts: ${summary.activeAlerts}`);
```

#### Alert Management

```typescript
// Get active alerts
const alerts = monitor.getActiveAlerts('agent-1');
alerts.forEach((alert) => {
  console.log(`Alert: ${alert.type} - ${alert.severity} - ${alert.message}`);
});

// Resolve an alert
monitor.resolveAlert(alertId, 'Issue resolved through optimization');
```

#### Recovery Actions

```typescript
// Get recovery recommendations
const recommendations = monitor.getRecoveryRecommendations('agent-1');
recommendations.forEach((action) => {
  console.log(
    `Action: ${action.type} - ${action.priority} - ${action.description}`
  );
});

// Execute a recovery action
const success = await monitor.executeRecoveryAction('agent-1', actionId);
console.log(`Recovery action ${success ? 'succeeded' : 'failed'}`);
```

### Integration with Learning System

The Health Monitor can integrate with the Agent Learning System for enhanced optimization:

```typescript
import { createAgentLearningSystem } from './agent-learning-system.ts';

const learningSystem = createAgentLearningSystem();
const healthMonitor = new AgentHealthMonitor({}, learningSystem);

// Health updates automatically feed into learning system
healthMonitor.updateAgentHealth('agent-1', {
  cpuUsage: 0.7,
  taskSuccessRate: 0.85,
});

// Learning system adapts based on health performance
const optimalLearningRate = learningSystem.getOptimalLearningRate('agent-1');
```

### Configuration Options

#### Alert Thresholds

```typescript
alertThresholds: {
  cpu: 0.8,           // 80% CPU usage
  memory: 0.9,        // 90% memory usage
  diskUsage: 0.85,    // 85% disk usage
  networkLatency: 1000, // 1000ms network latency
  taskFailureRate: 0.3, // 30% task failure rate
  responseTime: 5000,   // 5000ms response time
  errorRate: 0.2        // 20% error rate
}
```

#### Health Score Weights

```typescript
healthScoreWeights: {
  cpuUsage: 0.2,        // 20% weight
  memoryUsage: 0.25,    // 25% weight
  taskSuccessRate: 0.3, // 30% weight
  responseTime: 0.15,   // 15% weight
  errorRate: 0.1,       // 10% weight
  uptime: 0.0           // 0% weight (optional)
}
```

#### Trend Analysis

```typescript
trendAnalysis: {
  windowSize: 50,           // 50 data points for analysis
  minDataPoints: 10,        // Minimum 10 points for trend
  significanceThreshold: 0.1 // 0.1 threshold for significance
}
```

#### Prediction Settings

```typescript
prediction: {
  enabled: true,        // Enable predictive analysis
  horizonMinutes: 30,   // 30-minute prediction horizon
  updateInterval: 300000 // Update every 5 minutes
}
```

### Health Status Definitions

- **Healthy**: All metrics within normal ranges, health score ≥ 0.7
- **Degraded**: Some metrics concerning but not critical, health score 0.3-0.7
- **Unhealthy**: Multiple metrics in warning ranges, health score < 0.3
- **Critical**: Severe performance issues, immediate attention required
- **Unknown**: Insufficient data or agent not responding

### Recovery Action Types

- **optimize**: Performance optimization and tuning
- **scale_down**: Reduce workload and task complexity
- **scale_up**: Increase resources or capacity
- **restart**: Agent restart for critical issues
- **maintenance**: Scheduled maintenance operations
- **redistribute**: Redistribute tasks to other agents
- **isolate**: Isolate agent from critical operations

### Testing

Comprehensive test suite available in `__tests__/agent-health-monitor.test.ts`:

```bash
# Run health monitor tests
npm test agent-health-monitor.test.ts

# Run with coverage
npm test -- --coverage agent-health-monitor.test.ts
```

### Best Practices

1. **Regular Updates**: Update health metrics frequently for accurate monitoring
2. **Threshold Tuning**: Adjust alert thresholds based on your system characteristics
3. **Trend Analysis**: Use trend analysis for predictive maintenance
4. **Recovery Planning**: Test recovery actions in development environment
5. **Alert Management**: Implement proper alert resolution workflows
6. **System Monitoring**: Monitor system-wide health regularly
7. **Learning Integration**: Integrate with learning system for optimization

### Performance Considerations

- **Memory Usage**: Health history is limited by `historyRetention` setting
- **CPU Impact**: Health calculations are optimized for minimal overhead
- **Storage**: Consider persistence for long-term trend analysis
- **Network**: Monitor network latency for distributed systems
- **Scalability**: Designed to handle hundreds of agents efficiently

### Future Enhancements

- **Machine Learning Models**: Advanced ML models for prediction
- **Anomaly Detection**: Statistical anomaly detection algorithms
- **Auto-Recovery**: Fully automated recovery system
- **Integration APIs**: REST APIs for external monitoring systems
- **Visualization**: Real-time health dashboards
- **Historical Analysis**: Long-term performance analytics

## Architecture Integration

The Health Monitor integrates seamlessly with the existing coordination architecture:

- **Swarm Strategy**: Provides health information for agent selection
- **Event Coordination**: Influences task distribution based on health (replaces load balancing)
- **Task Orchestration**: Considers agent health for task assignment
- **Performance Optimization**: Feeds data to optimization systems
- **Learning Systems**: Integrated with adaptive learning algorithms

## Contributing

When contributing to the Intelligence subsystem:

1. Follow existing code patterns and documentation standards
2. Add comprehensive tests for new features
3. Update this README with new capabilities
4. Consider integration with existing coordination systems
5. Maintain backward compatibility where possible

## License

Part of the Claude Code Zen project. See project LICENSE for details.
