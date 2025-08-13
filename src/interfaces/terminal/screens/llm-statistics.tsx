/**
 * LLM Statistics Dashboard Screen
 *
 * Real-time visualization of LLM call routing, performance metrics, and system health.
 * Provides comprehensive analytics for the multi-provider LLM integration system.
 */

import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import LLMStatsService, {
  type LLMAnalytics,
  type LLMProviderStats,
  type LLMSystemHealth,
} from '../../../coordination/services/llm-stats-service.ts';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';

export interface LLMStatisticsProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

type ViewMode = 'overview' | 'providers' | 'routing' | 'health' | 'trends';

/**
 * LLM Statistics Dashboard Component
 *
 * Displays comprehensive analytics for LLM system including:
 * - Provider performance and usage statistics
 * - Call routing analysis and efficiency metrics
 * - System health monitoring and alerts
 * - Performance trends and insights
 */
export const LLMStatistics: React.FC<LLMStatisticsProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [analytics, setAnalytics] = useState<LLMAnalytics | null>(null);
  const [systemHealth, setSystemHealth] = useState<LLMSystemHealth | null>(
    null
  );
  const [selectedProvider, setSelectedProvider] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [statsService] = useState(() => new LLMStatsService());

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const analyticsData = statsService.getAnalytics();
      const healthData = statsService.getSystemHealth();

      setAnalytics(analyticsData);
      setSystemHealth(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [statsService]);

  // Auto-refresh data
  useEffect(() => {
    loadAnalytics();

    if (autoRefresh) {
      const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [loadAnalytics, autoRefresh]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }

    if (
      key.leftArrow ||
      key.rightArrow ||
      ['1', '2', '3', '4', '5'].includes(input)
    ) {
      const modes: ViewMode[] = [
        'overview',
        'providers',
        'routing',
        'health',
        'trends',
      ];

      if (key.leftArrow) {
        const currentIndex = modes.indexOf(viewMode);
        setViewMode(modes[(currentIndex - 1 + modes.length) % modes.length]);
      } else if (key.rightArrow) {
        const currentIndex = modes.indexOf(viewMode);
        setViewMode(modes[(currentIndex + 1) % modes.length]);
      } else if (['1', '2', '3', '4', '5'].includes(input)) {
        const index = Number.parseInt(input) - 1;
        if (index >= 0 && index < modes.length) {
          setViewMode(modes[index]);
        }
      }
    }

    if (key.upArrow && viewMode === 'providers' && analytics) {
      setSelectedProvider((prev) => Math.max(0, prev - 1));
    }

    if (key.downArrow && viewMode === 'providers' && analytics) {
      setSelectedProvider((prev) =>
        Math.min(analytics.providerStats.length - 1, prev + 1)
      );
    }

    switch (input) {
      case 'r':
      case 'R':
        loadAnalytics();
        break;
      case 'a':
      case 'A':
        setAutoRefresh(!autoRefresh);
        break;
    }
  });

  const getHealthColor = (health: LLMSystemHealth['overallHealth']): string => {
    switch (health) {
      case 'excellent':
        return 'green';
      case 'good':
        return 'cyan';
      case 'fair':
        return 'yellow';
      case 'poor':
        return 'magenta';
      case 'critical':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (ratio: number): string => {
    return `${Math.round(ratio * 100)}%`;
  };

  const renderOverview = () => {
    if (!(analytics && systemHealth)) return null;

    return (
      <Box flexDirection="column">
        {/* System Summary */}
        <Box paddingX={2} paddingY={1} borderStyle="single" borderColor="cyan">
          <Box flexDirection="column" width="100%">
            <Text color="cyan" bold>
              📊 System Overview
            </Text>
            <Box marginTop={1} flexDirection="row">
              <Box width="50%">
                <Text>
                  📞 Total Calls:{' '}
                  <Text color="white" bold>
                    {formatNumber(analytics.summary.totalCalls)}
                  </Text>
                </Text>
                <Text>
                  ✅ Success Rate:{' '}
                  <Text color="green" bold>
                    {formatPercentage(analytics.summary.successRate)}
                  </Text>
                </Text>
                <Text>
                  ⚡ Avg Response:{' '}
                  <Text color="yellow" bold>
                    {formatDuration(analytics.summary.averageResponseTime)}
                  </Text>
                </Text>
                <Text>
                  🪙 Tokens Used:{' '}
                  <Text color="blue" bold>
                    {formatNumber(analytics.summary.totalTokensUsed)}
                  </Text>
                </Text>
              </Box>
              <Box width="50%">
                <Text>
                  🏥 System Health:{' '}
                  <Text color={getHealthColor(systemHealth.overallHealth)} bold>
                    {systemHealth.overallHealth.toUpperCase()}
                  </Text>
                </Text>
                <Text>
                  📊 Health Score:{' '}
                  <Text color={getHealthColor(systemHealth.overallHealth)} bold>
                    {systemHealth.healthScore}/100
                  </Text>
                </Text>
                <Text>
                  🔌 Active Providers:{' '}
                  <Text color="cyan" bold>
                    {systemHealth.activeProviders}
                  </Text>
                </Text>
                <Text>
                  💰 Est. Savings:{' '}
                  <Text color="green" bold>
                    ${analytics.summary.costSavings.toFixed(2)}
                  </Text>
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Top Providers */}
        <Box
          marginTop={1}
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor="green"
        >
          <Box flexDirection="column" width="100%">
            <Text color="green" bold>
              🏆 Top Performing Providers
            </Text>
            <Box marginTop={1}>
              {analytics.providerStats
                .sort((a, b) => b.successRate - a.successRate)
                .slice(0, 4)
                .map((provider, index) => (
                  <Box
                    key={provider.providerId}
                    flexDirection="row"
                    justifyContent="space-between"
                  >
                    <Text color="white">
                      {index + 1}. {provider.displayName}
                    </Text>
                    <Text color="gray">
                      {formatNumber(provider.totalCalls)} calls •{' '}
                      {formatPercentage(provider.successRate)} success
                    </Text>
                  </Box>
                ))}
            </Box>
          </Box>
        </Box>

        {/* System Alerts */}
        {systemHealth.alerts.length > 0 && (
          <Box
            marginTop={1}
            paddingX={2}
            paddingY={1}
            borderStyle="single"
            borderColor="red"
          >
            <Box flexDirection="column" width="100%">
              <Text color="red" bold>
                🚨 System Alerts
              </Text>
              <Box marginTop={1}>
                {systemHealth.alerts.slice(0, 3).map((alert, index) => (
                  <Text
                    key={index}
                    color={alert.level === 'critical' ? 'red' : 'yellow'}
                  >
                    {alert.level === 'critical' ? '🔴' : '⚠️'} {alert.message}
                  </Text>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderProviders = () => {
    if (!analytics) return null;

    const provider = analytics.providerStats[selectedProvider];
    if (!provider) return null;

    return (
      <Box flexDirection="column">
        {/* Provider List */}
        <Box paddingX={2} paddingY={1} borderStyle="single" borderColor="blue">
          <Box flexDirection="column" width="100%">
            <Text color="blue" bold>
              🔌 Providers ({analytics.providerStats.length})
            </Text>
            <Box marginTop={1}>
              {analytics.providerStats.map((p, index) => (
                <Box
                  key={p.providerId}
                  flexDirection="row"
                  backgroundColor={
                    index === selectedProvider ? 'blue' : undefined
                  }
                  paddingX={index === selectedProvider ? 1 : 0}
                >
                  <Box width="40%">
                    <Text color={index === selectedProvider ? 'white' : 'gray'}>
                      {p.displayName}
                    </Text>
                  </Box>
                  <Box width="20%">
                    <Text
                      color={p.currentStatus === 'active' ? 'green' : 'yellow'}
                    >
                      {p.currentStatus}
                    </Text>
                  </Box>
                  <Box width="20%">
                    <Text color="gray">{formatNumber(p.totalCalls)} calls</Text>
                  </Box>
                  <Box width="20%">
                    <Text color="gray">{formatPercentage(p.successRate)}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Selected Provider Details */}
        <Box
          marginTop={1}
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor="cyan"
        >
          <Box flexDirection="column" width="100%">
            <Text color="cyan" bold>
              📋 {provider.displayName} Details
            </Text>
            <Box marginTop={1} flexDirection="row">
              <Box width="50%">
                <Text>
                  📞 Total Calls:{' '}
                  <Text color="white" bold>
                    {formatNumber(provider.totalCalls)}
                  </Text>
                </Text>
                <Text>
                  ✅ Success Rate:{' '}
                  <Text color="green" bold>
                    {formatPercentage(provider.successRate)}
                  </Text>
                </Text>
                <Text>
                  ⚡ Avg Response:{' '}
                  <Text color="yellow" bold>
                    {formatDuration(provider.averageResponseTime)}
                  </Text>
                </Text>
                <Text>
                  📏 Avg Context:{' '}
                  <Text color="blue" bold>
                    {formatNumber(provider.averageContextLength)} chars
                  </Text>
                </Text>
                <Text>
                  🪙 Tokens Used:{' '}
                  <Text color="purple" bold>
                    {formatNumber(provider.totalTokensUsed)}
                  </Text>
                </Text>
              </Box>
              <Box width="50%">
                <Text>
                  💰 Cost Efficiency:{' '}
                  <Text color="green" bold>
                    {provider.costEfficiency}/100
                  </Text>
                </Text>
                <Text>
                  🎯 Reliability:{' '}
                  <Text color="cyan" bold>
                    {provider.reliability}/100
                  </Text>
                </Text>
                <Text>
                  ⚠️ Rate Limit Hits:{' '}
                  <Text color="red" bold>
                    {provider.rateLimitHits}
                  </Text>
                </Text>
                <Text>
                  📈 Trend:{' '}
                  <Text
                    color={
                      provider.performanceTrend === 'improving'
                        ? 'green'
                        : 'gray'
                    }
                    bold
                  >
                    {provider.performanceTrend}
                  </Text>
                </Text>
                <Text>
                  🕒 Last Used:{' '}
                  <Text color="gray">
                    {provider.lastUsed
                      ? provider.lastUsed.toLocaleTimeString()
                      : 'Never'}
                  </Text>
                </Text>
              </Box>
            </Box>

            {provider.preferredForTasks.length > 0 && (
              <Box marginTop={1}>
                <Text color="yellow">
                  🎯 Preferred Tasks:{' '}
                  <Text color="white">
                    {provider.preferredForTasks.join(', ')}
                  </Text>
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderRouting = () => {
    if (!analytics) return null;

    const routing = analytics.routingStats;

    return (
      <Box flexDirection="column">
        {/* Routing Efficiency */}
        <Box
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor="yellow"
        >
          <Box flexDirection="column" width="100%">
            <Text color="yellow" bold>
              🗺️ Routing Efficiency
            </Text>
            <Box marginTop={1} flexDirection="row">
              <Box width="50%">
                <Text>
                  📊 Total Decisions:{' '}
                  <Text color="white" bold>
                    {formatNumber(routing.totalRoutingDecisions)}
                  </Text>
                </Text>
                <Text>
                  🎯 Optimal Rate:{' '}
                  <Text color="green" bold>
                    {formatPercentage(routing.optimalRoutingRate)}
                  </Text>
                </Text>
                <Text>
                  🔄 Fallback Rate:{' '}
                  <Text color="yellow" bold>
                    {formatPercentage(routing.fallbackRate)}
                  </Text>
                </Text>
                <Text>
                  📈 Efficiency:{' '}
                  <Text color="cyan" bold>
                    {routing.routingEfficiency.toFixed(1)}%
                  </Text>
                </Text>
              </Box>
              <Box width="50%">
                <Text>
                  🔢 Avg Fallbacks:{' '}
                  <Text color="orange" bold>
                    {routing.averageFallbackSteps.toFixed(1)}
                  </Text>
                </Text>
                <Text>
                  📋 Patterns Found:{' '}
                  <Text color="blue" bold>
                    {routing.commonRoutingPatterns.length}
                  </Text>
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Common Routing Patterns */}
        <Box
          marginTop={1}
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor="magenta"
        >
          <Box flexDirection="column" width="100%">
            <Text color="magenta" bold>
              🔀 Common Routing Patterns
            </Text>
            <Box marginTop={1}>
              {routing.commonRoutingPatterns
                .slice(0, 5)
                .map((pattern, index) => (
                  <Box
                    key={index}
                    flexDirection="row"
                    justifyContent="space-between"
                  >
                    <Text color="white">{pattern.pattern.join(' → ')}</Text>
                    <Text color="gray">
                      {pattern.frequency} times •{' '}
                      {formatPercentage(pattern.successRate)} success
                    </Text>
                  </Box>
                ))}
            </Box>
          </Box>
        </Box>

        {/* Task-Specific Routing */}
        <Box
          marginTop={1}
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor="green"
        >
          <Box flexDirection="column" width="100%">
            <Text color="green" bold>
              📋 Task-Specific Routing
            </Text>
            <Box marginTop={1}>
              {Object.entries(routing.taskTypeRouting)
                .slice(0, 4)
                .map(([task, config]) => (
                  <Box key={task} flexDirection="column">
                    <Text color="yellow">{task}</Text>
                    <Text color="gray">
                      {' '}
                      → {config.preferredProvider} (
                      {formatPercentage(config.successRate)})
                    </Text>
                  </Box>
                ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderHealth = () => {
    if (!(systemHealth && analytics)) return null;

    return (
      <Box flexDirection="column">
        {/* Health Status */}
        <Box
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor={getHealthColor(systemHealth.overallHealth)}
        >
          <Box flexDirection="column" width="100%">
            <Text color={getHealthColor(systemHealth.overallHealth)} bold>
              🏥 System Health: {systemHealth.overallHealth.toUpperCase()}
            </Text>
            <Box marginTop={1} flexDirection="row">
              <Box width="50%">
                <Text>
                  📊 Health Score:{' '}
                  <Text color={getHealthColor(systemHealth.overallHealth)} bold>
                    {systemHealth.healthScore}/100
                  </Text>
                </Text>
                <Text>
                  🔌 Active Providers:{' '}
                  <Text color="green" bold>
                    {systemHealth.activeProviders}
                  </Text>
                </Text>
                <Text>
                  ❄️ In Cooldown:{' '}
                  <Text color="blue" bold>
                    {systemHealth.providersInCooldown}
                  </Text>
                </Text>
                <Text>
                  📈 Throughput:{' '}
                  <Text color="cyan" bold>
                    {systemHealth.systemThroughput.toFixed(1)}/min
                  </Text>
                </Text>
              </Box>
              <Box width="50%">
                <Text>
                  ⚡ Avg Latency:{' '}
                  <Text color="yellow" bold>
                    {formatDuration(systemHealth.averageLatency)}
                  </Text>
                </Text>
                <Text>
                  ❌ Error Rate:{' '}
                  <Text color="red" bold>
                    {formatPercentage(systemHealth.errorRate)}
                  </Text>
                </Text>
                <Text>
                  💻 Resource Usage:{' '}
                  <Text color="purple" bold>
                    {systemHealth.resourceUtilization}%
                  </Text>
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* System Alerts */}
        {systemHealth.alerts.length > 0 && (
          <Box
            marginTop={1}
            paddingX={2}
            paddingY={1}
            borderStyle="single"
            borderColor="red"
          >
            <Box flexDirection="column" width="100%">
              <Text color="red" bold>
                🚨 Active Alerts ({systemHealth.alerts.length})
              </Text>
              <Box marginTop={1}>
                {systemHealth.alerts.map((alert, index) => (
                  <Box key={index} flexDirection="column">
                    <Text color={alert.level === 'critical' ? 'red' : 'yellow'}>
                      {alert.level === 'critical' ? '🔴' : '⚠️'} {alert.message}
                    </Text>
                    <Text color="gray">
                      {' '}
                      {alert.timestamp.toLocaleTimeString()}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Health Recommendations */}
        {systemHealth.recommendations.length > 0 && (
          <Box
            marginTop={1}
            paddingX={2}
            paddingY={1}
            borderStyle="single"
            borderColor="blue"
          >
            <Box flexDirection="column" width="100%">
              <Text color="blue" bold>
                💡 Recommendations
              </Text>
              <Box marginTop={1}>
                {systemHealth.recommendations.map((rec, index) => (
                  <Text key={index} color="gray">
                    • {rec}
                  </Text>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderTrends = () => {
    if (!analytics) return null;

    const insights = analytics.insights;

    return (
      <Box flexDirection="column">
        {/* Key Insights */}
        <Box
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor="purple"
        >
          <Box flexDirection="column" width="100%">
            <Text color="purple" bold>
              🔍 Key Insights
            </Text>
            <Box marginTop={1}>
              <Text>
                🏆 Top Performer:{' '}
                <Text color="green" bold>
                  {insights.topPerformingProvider}
                </Text>
              </Text>
              <Text>
                💰 Most Efficient:{' '}
                <Text color="blue" bold>
                  {insights.mostEfficientProvider}
                </Text>
              </Text>
              <Text>
                🎯 Time Range:{' '}
                <Text color="gray">
                  {analytics.timeRange.start.toLocaleDateString()} -{' '}
                  {analytics.timeRange.end.toLocaleDateString()}
                </Text>
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Bottlenecks */}
        {insights.bottlenecks.length > 0 && (
          <Box
            marginTop={1}
            paddingX={2}
            paddingY={1}
            borderStyle="single"
            borderColor="red"
          >
            <Box flexDirection="column" width="100%">
              <Text color="red" bold>
                🚧 Identified Bottlenecks
              </Text>
              <Box marginTop={1}>
                {insights.bottlenecks.map((bottleneck, index) => (
                  <Text key={index} color="yellow">
                    • {bottleneck}
                  </Text>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Optimization Opportunities */}
        {insights.optimizationOpportunities.length > 0 && (
          <Box
            marginTop={1}
            paddingX={2}
            paddingY={1}
            borderStyle="single"
            borderColor="green"
          >
            <Box flexDirection="column" width="100%">
              <Text color="green" bold>
                ⚡ Optimization Opportunities
              </Text>
              <Box marginTop={1}>
                {insights.optimizationOpportunities.map((opp, index) => (
                  <Text key={index} color="gray">
                    • {opp}
                  </Text>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Performance Summary */}
        <Box
          marginTop={1}
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor="cyan"
        >
          <Box flexDirection="column" width="100%">
            <Text color="cyan" bold>
              📈 Performance Summary
            </Text>
            <Box marginTop={1}>
              <Text>
                📊 Total Analysis: {formatNumber(analytics.summary.totalCalls)}{' '}
                operations completed
              </Text>
              <Text>
                ⚡ System Performance:{' '}
                {formatPercentage(analytics.summary.successRate)} success rate
              </Text>
              <Text>
                💰 Cost Optimization: $
                {analytics.summary.costSavings.toFixed(2)} estimated savings
              </Text>
              <Text>
                🎯 Routing Efficiency:{' '}
                {analytics.routingStats.routingEfficiency.toFixed(1)}% optimal
                decisions
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box justifyContent="center" alignItems="center" height={10}>
          <Text color="cyan">Loading LLM statistics...</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box justifyContent="center" alignItems="center" height={10}>
          <Box flexDirection="column" alignItems="center">
            <Text color="red">❌ {error}</Text>
            <Text color="gray">Press 'R' to retry</Text>
          </Box>
        </Box>
      );
    }

    switch (viewMode) {
      case 'overview':
        return renderOverview();
      case 'providers':
        return renderProviders();
      case 'routing':
        return renderRouting();
      case 'health':
        return renderHealth();
      case 'trends':
        return renderTrends();
      default:
        return renderOverview();
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Header
        title="LLM Statistics Dashboard"
        subtitle={`${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} | Auto-refresh: ${autoRefresh ? 'ON' : 'OFF'}`}
        swarmStatus={swarmStatus}
        mode="standard"
        showBorder={true}
      />

      {/* Tab Navigation */}
      <Box paddingX={2} paddingY={1} borderStyle="single" borderColor="blue">
        <Box flexDirection="row" justifyContent="space-between">
          <Text color={viewMode === 'overview' ? 'blue' : 'gray'}>
            1. Overview
          </Text>
          <Text color={viewMode === 'providers' ? 'blue' : 'gray'}>
            2. Providers
          </Text>
          <Text color={viewMode === 'routing' ? 'blue' : 'gray'}>
            3. Routing
          </Text>
          <Text color={viewMode === 'health' ? 'blue' : 'gray'}>4. Health</Text>
          <Text color={viewMode === 'trends' ? 'blue' : 'gray'}>5. Trends</Text>
        </Box>
      </Box>

      {/* Content */}
      <Box flexGrow={1} paddingX={1} paddingY={1}>
        {renderContent()}
      </Box>

      {/* Footer */}
      <Box paddingY={1} paddingX={2}>
        <InteractiveFooter
          currentScreen="LLM Statistics"
          availableScreens={[
            { key: '1-5', name: 'Switch View' },
            { key: '←→', name: 'Navigate' },
            { key: '↑↓', name: 'Select Provider' },
            { key: 'R', name: 'Refresh' },
            { key: 'A', name: 'Auto-refresh' },
            { key: 'Q/Esc', name: 'Back' },
          ]}
          status={
            systemHealth
              ? `Health: ${systemHealth.overallHealth} (${systemHealth.healthScore}/100) | ${systemHealth.activeProviders} active providers`
              : 'Loading...'
          }
        />
      </Box>
    </Box>
  );
};

export default LLMStatistics;
