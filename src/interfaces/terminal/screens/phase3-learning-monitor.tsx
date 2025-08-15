/**
 * Learning Monitor Screen.
 *
 * Real-time Ensemble Learning monitoring interface integrated with
 * the Ink-based TUI system. Displays ensemble performance, neural coordination,
 * tier-specific metrics, and learning events.
 */

import { Box, Text, useInput } from 'ink';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';
import { Phase3EnsembleLearning } from '../../../coordination/swarm/learning/phase-3-ensemble.ts';
import { NeuralEnsembleCoordinator } from '../../../coordination/swarm/learning/neural-ensemble-coordinator.ts';
import { Phase3IntegratorService } from '../../../coordination/swarm/integration/phase3-integrator-service.ts';
import { getLogger } from '../../../config/logging-config.ts';

const logger = getLogger('LearningMonitor');

export interface LearningMetrics {
  ensemble: {
    accuracy: number;
    confidence: number;
    totalPredictions: number;
    adaptationCount: number;
  };
  tierPerformance: {
    tier1: { accuracy: number; models: number; active: boolean };
    tier2: { accuracy: number; models: number; active: boolean };
    tier3: { accuracy: number; models: number; active: boolean };
  };
  neuralCoordination?: {
    alignment: number;
    consensus: number;
    activeIntegrations: number;
    coordinationAccuracy: number;
  };
  recentEvents: Array<{
    timestamp: Date;
    type: string;
    message: string;
    data?: any;
  }>;
  learning: {
    modelUpdates: number;
    strategyAdaptations: number;
    performanceGain: number;
    isLearning: boolean;
  };
}

export interface LearningMonitorProps {
  swarmStatus?: SwarmStatus;
  ensembleSystem?: Phase3EnsembleLearning;
  coordinator?: NeuralEnsembleCoordinator;
  integratorService?: Phase3IntegratorService;
  onBack: () => void;
  onExit: () => void;
}

/**
 * Learning Monitor Component.
 *
 * Displays real-time ensemble learning metrics with visual indicators.
 */
export const LearningMonitor: React.FC<LearningMonitorProps> = ({
  swarmStatus,
  ensembleSystem,
  coordinator,
  integratorService,
  onBack,
  onExit,
}) => {
  const [metrics, setMetrics] = useState<LearningMetrics>({
    ensemble: {
      accuracy: 0,
      confidence: 0,
      totalPredictions: 0,
      adaptationCount: 0,
    },
    tierPerformance: {
      tier1: { accuracy: 0, models: 0, active: false },
      tier2: { accuracy: 0, models: 0, active: false },
      tier3: { accuracy: 0, models: 0, active: false },
    },
    recentEvents: [],
    learning: {
      modelUpdates: 0,
      strategyAdaptations: 0,
      performanceGain: 0,
      isLearning: false,
    },
  });

  const [selectedView, setSelectedView] = useState<
    'overview' | 'tiers' | 'neural' | 'events'
  >('overview');
  const [refreshRate, setRefreshRate] = useState<number>(2000);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);

  // Collect learning metrics from connected systems
  const collectLearningMetrics =
    useCallback(async (): Promise<LearningMetrics> => {
      let newMetrics = { ...metrics };

      try {
        // First try to get metrics from the integrator service (preferred)
        if (integratorService && integratorService.isOperational()) {
          const integratedMetrics =
            integratorService.getCurrentLearningMetrics();

          if (integratedMetrics) {
            newMetrics = integratedMetrics;

            // Track accuracy history
            const currentAccuracy = newMetrics.ensemble.accuracy;
            setAccuracyHistory((prev) => {
              const newHistory = [...prev, currentAccuracy];
              return newHistory.length > 20
                ? newHistory.slice(-20)
                : newHistory;
            });

            logger.debug(
              'Using integrated metrics from Phase3IntegratorService'
            );
            return newMetrics;
          }
        }

        // Fallback to direct system metrics collection

        // Get ensemble system metrics
        if (ensembleSystem) {
          const ensembleStatus = ensembleSystem.getEnsembleStatus();

          newMetrics.ensemble = {
            accuracy: ensembleStatus.globalMetrics.averageAccuracy * 100,
            confidence: ensembleStatus.globalMetrics.averageConfidence * 100,
            totalPredictions: ensembleStatus.globalMetrics.totalPredictions,
            adaptationCount: ensembleStatus.globalMetrics.adaptationCount || 0,
          };

          // Update tier performance
          Object.entries(ensembleStatus.tierStatus).forEach(
            ([tier, status]) => {
              const tierKey =
                `tier${tier}` as keyof typeof newMetrics.tierPerformance;
              if (newMetrics.tierPerformance[tierKey]) {
                newMetrics.tierPerformance[tierKey] = {
                  accuracy: status.averageAccuracy * 100,
                  models: status.modelCount,
                  active: status.modelCount > 0,
                };
              }
            }
          );

          // Track accuracy history
          const currentAccuracy = newMetrics.ensemble.accuracy;
          setAccuracyHistory((prev) => {
            const newHistory = [...prev, currentAccuracy];
            return newHistory.length > 20 ? newHistory.slice(-20) : newHistory;
          });
        }

        // Get neural coordination metrics
        if (coordinator) {
          try {
            const coordinationStatus = coordinator.getCoordinationStatus();
            newMetrics.neuralCoordination = {
              alignment: coordinationStatus.systemHealth?.averageAlignment || 0,
              consensus: coordinationStatus.systemHealth?.averageConsensus || 0,
              activeIntegrations: coordinationStatus.activeIntegrations,
              coordinationAccuracy:
                coordinationStatus.performanceMetrics.averageAccuracy * 100,
            };
          } catch (error) {
            logger.warn('Failed to get neural coordination status:', error);
          }
        }

        // Use real system data or fallback data if integrator service provides it
        if (!ensembleSystem && !coordinator && !integratorService) {
          // Show zero state when no systems connected
          newMetrics.ensemble = {
            accuracy: 0,
            confidence: 0,
            totalPredictions: 0,
            adaptationCount: 0,
          };
          newMetrics.tierPerformance = {
            tier1: { accuracy: 0, models: 0, active: false },
            tier2: { accuracy: 0, models: 0, active: false },
            tier3: { accuracy: 0, models: 0, active: false },
          };
          newMetrics.learning = {
            modelUpdates: 0,
            strategyAdaptations: 0,
            performanceGain: 0,
            isLearning: false,
          };
          newMetrics.recentEvents = [];
        }
      } catch (error) {
        logger.error('Failed to collect learning metrics:', error);
        // Keep existing metrics on error, don't generate fake data
      }

      return newMetrics;
    }, [integratorService, ensembleSystem, coordinator, metrics]);

  // Add learning event
  const addLearningEvent = (type: string, message: string, data?: any) => {
    const event = {
      timestamp: new Date(),
      type,
      message,
      data,
    };

    setMetrics((prev) => ({
      ...prev,
      recentEvents: [event, ...prev.recentEvents.slice(0, 19)],
    }));
  };

  // Update metrics periodically
  useEffect(() => {
    if (!isLive) return;

    const updateMetrics = async () => {
      const newMetrics = await collectLearningMetrics();
      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, refreshRate);
    return () => clearInterval(interval);
  }, [collectLearningMetrics, refreshRate, isLive]);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }

    switch (input) {
      case '1':
        setSelectedView('overview');
        break;
      case '2':
        setSelectedView('tiers');
        break;
      case '3':
        setSelectedView('neural');
        break;
      case '4':
        setSelectedView('events');
        break;
      case 'p':
      case 'P':
        setIsLive(!isLive);
        break;
      case 'f':
      case 'F':
        setRefreshRate((prev) =>
          prev === 1000 ? 5000 : prev === 5000 ? 10000 : 1000
        );
        break;
      case 'r':
      case 'R':
        // Force refresh
        collectLearningMetrics().then(setMetrics);
        break;
    }
  });

  // Utility functions
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'green';
    if (accuracy >= 80) return 'yellow';
    return 'red';
  };

  const createProgressBar = (
    percentage: number,
    width: number = 20
  ): string => {
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  const createTrendIndicator = (): string => {
    if (accuracyHistory.length < 3) return '→';
    const recent = accuracyHistory.slice(-3);
    const trend = recent[recent.length - 1] - recent[0];
    if (trend > 0.5) return '↗️';
    if (trend < -0.5) return '↘️';
    return '→';
  };

  // Render functions
  const renderOverview = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {/* Main Metrics */}
      <Box flexDirection="row" marginBottom={2}>
        <Box flexDirection="column" width="50%">
          <Text bold color="cyan">
            🎯 Ensemble Performance
          </Text>

          <Box marginTop={1}>
            <Text>Accuracy: </Text>
            <Text color={getAccuracyColor(metrics.ensemble.accuracy)}>
              {metrics.ensemble.accuracy.toFixed(1)}% {createTrendIndicator()}
            </Text>
          </Box>
          <Box>
            <Text color="gray">
              {createProgressBar(metrics.ensemble.accuracy)}
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text>Confidence: </Text>
            <Text color={getAccuracyColor(metrics.ensemble.confidence)}>
              {metrics.ensemble.confidence.toFixed(1)}%
            </Text>
          </Box>
          <Box>
            <Text color="gray">
              {createProgressBar(metrics.ensemble.confidence)}
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text>Total Predictions: </Text>
            <Text color="white">{metrics.ensemble.totalPredictions}</Text>
          </Box>
          <Box>
            <Text>Adaptations: </Text>
            <Text color="cyan">{metrics.ensemble.adaptationCount}</Text>
          </Box>
        </Box>

        <Box flexDirection="column" width="50%">
          <Text bold color="cyan">
            🧠 Learning Status
          </Text>

          <Box marginTop={1}>
            <Text>Learning: </Text>
            <StatusBadge
              status={metrics.learning.isLearning ? 'active' : 'idle'}
              text={metrics.learning.isLearning ? 'ACTIVE' : 'IDLE'}
              variant="minimal"
            />
          </Box>

          <Box marginTop={1}>
            <Text>Model Updates: </Text>
            <Text color="green">{metrics.learning.modelUpdates}</Text>
          </Box>

          <Box>
            <Text>Strategy Adaptations: </Text>
            <Text color="yellow">{metrics.learning.strategyAdaptations}</Text>
          </Box>

          <Box>
            <Text>Performance Gain: </Text>
            <Text
              color={metrics.learning.performanceGain > 0 ? 'green' : 'red'}
            >
              +{(metrics.learning.performanceGain * 100).toFixed(2)}%
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Neural Coordination */}
      {metrics.neuralCoordination && (
        <Box marginBottom={2}>
          <Text bold color="cyan">
            🤖 Neural Coordination
          </Text>
          <Box flexDirection="row" marginTop={1}>
            <Box width="50%">
              <Text>Alignment: </Text>
              <Text color="green">
                {(metrics.neuralCoordination.alignment * 100).toFixed(1)}%
              </Text>
            </Box>
            <Box width="50%">
              <Text>Consensus: </Text>
              <Text color="blue">
                {(metrics.neuralCoordination.consensus * 100).toFixed(1)}%
              </Text>
            </Box>
          </Box>
          <Box flexDirection="row" marginTop={1}>
            <Box width="50%">
              <Text>Active Integrations: </Text>
              <Text color="white">
                {metrics.neuralCoordination.activeIntegrations}
              </Text>
            </Box>
            <Box width="50%">
              <Text>Coord Accuracy: </Text>
              <Text
                color={getAccuracyColor(
                  metrics.neuralCoordination.coordinationAccuracy
                )}
              >
                {metrics.neuralCoordination.coordinationAccuracy.toFixed(1)}%
              </Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* Quick Tier Overview */}
      <Box>
        <Text bold color="cyan">
          📊 Tier Performance Summary
        </Text>
        <Box flexDirection="row" marginTop={1}>
          {Object.entries(metrics.tierPerformance).map(([tier, perf]) => (
            <Box key={tier} width="33%" marginRight={1}>
              <Text>
                {tier.toUpperCase()}:{' '}
                <Text color={getAccuracyColor(perf.accuracy)}>
                  {perf.accuracy.toFixed(1)}%
                </Text>{' '}
                ({perf.models}M)
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderTiers = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="cyan" marginBottom={1}>
        📊 Detailed Tier Performance
      </Text>

      {Object.entries(metrics.tierPerformance).map(([tier, perf]) => (
        <Box
          key={tier}
          marginBottom={2}
          borderStyle="single"
          borderColor="gray"
          padding={1}
        >
          <Box flexDirection="row" justifyContent="space-between">
            <Text bold>
              {tier.toUpperCase()} -{' '}
              {tier === 'tier1'
                ? 'Swarm Commanders'
                : tier === 'tier2'
                  ? 'Queen Coordinators'
                  : 'Neural Learning'}
            </Text>
            <StatusBadge
              status={perf.active ? 'active' : 'idle'}
              text={perf.active ? 'ACTIVE' : 'IDLE'}
              variant="minimal"
            />
          </Box>

          <Box marginTop={1}>
            <Text>Accuracy: </Text>
            <Text color={getAccuracyColor(perf.accuracy)}>
              {perf.accuracy.toFixed(2)}%
            </Text>
          </Box>
          <Box>
            <Text color="gray">{createProgressBar(perf.accuracy)}</Text>
          </Box>

          <Box marginTop={1}>
            <Text>Active Models: </Text>
            <Text color="white">{perf.models}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderNeural = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="cyan" marginBottom={1}>
        🧠 Neural Coordination Details
      </Text>

      {metrics.neuralCoordination ? (
        <Box>
          <Box
            marginBottom={2}
            borderStyle="single"
            borderColor="gray"
            padding={1}
          >
            <Text bold>Coordination Metrics</Text>

            <Box marginTop={1}>
              <Text>Neural Alignment: </Text>
              <Text color="green">
                {(metrics.neuralCoordination.alignment * 100).toFixed(2)}%
              </Text>
            </Box>
            <Box>
              <Text color="gray">
                {createProgressBar(metrics.neuralCoordination.alignment * 100)}
              </Text>
            </Box>

            <Box marginTop={1}>
              <Text>Consensus Strength: </Text>
              <Text color="blue">
                {(metrics.neuralCoordination.consensus * 100).toFixed(2)}%
              </Text>
            </Box>
            <Box>
              <Text color="gray">
                {createProgressBar(metrics.neuralCoordination.consensus * 100)}
              </Text>
            </Box>
          </Box>

          <Box borderStyle="single" borderColor="gray" padding={1}>
            <Text bold>Integration Status</Text>

            <Box marginTop={1}>
              <Text>Active Integrations: </Text>
              <Text color="white">
                {metrics.neuralCoordination.activeIntegrations}
              </Text>
            </Box>

            <Box>
              <Text>Coordination Accuracy: </Text>
              <Text
                color={getAccuracyColor(
                  metrics.neuralCoordination.coordinationAccuracy
                )}
              >
                {metrics.neuralCoordination.coordinationAccuracy.toFixed(2)}%
              </Text>
            </Box>
          </Box>
        </Box>
      ) : (
        <Text color="gray">Neural coordination not available</Text>
      )}
    </Box>
  );

  const renderEvents = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="cyan" marginBottom={1}>
        📝 Recent Learning Events
      </Text>

      {metrics.recentEvents.length === 0 ? (
        <Text color="gray">No recent events</Text>
      ) : (
        <Box flexDirection="column">
          {metrics.recentEvents.slice(0, 10).map((event, index) => (
            <Box key={index} marginBottom={1}>
              <Text>
                <Text color="gray">{event.timestamp.toLocaleTimeString()}</Text>{' '}
                <Text color="yellow">{event.type}</Text>
                {': '}
                <Text color="white">{event.message}</Text>
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderCurrentView = () => {
    switch (selectedView) {
      case 'tiers':
        return renderTiers();
      case 'neural':
        return renderNeural();
      case 'events':
        return renderEvents();
      default:
        return renderOverview();
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Header
        title="Learning Monitor"
        subtitle={`${isLive ? 'LIVE' : 'PAUSED'} | ${refreshRate}ms | View: ${selectedView}`}
        swarmStatus={swarmStatus}
        mode="standard"
        showBorder={true}
      />

      {/* Status Bar */}
      <Box paddingX={2} paddingY={1} borderStyle="single" borderColor="gray">
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row">
            <StatusBadge
              status={metrics.learning.isLearning ? 'active' : 'idle'}
              text={metrics.learning.isLearning ? 'LEARNING' : 'STABLE'}
              variant="minimal"
            />
          </Box>
          <Box flexDirection="row">
            <Text color="cyan">ACC: </Text>
            <Text color={getAccuracyColor(metrics.ensemble.accuracy)}>
              {metrics.ensemble.accuracy.toFixed(1)}%
            </Text>
            <Text color="gray"> | </Text>
            <Text color="cyan">CONF: </Text>
            <Text color={getAccuracyColor(metrics.ensemble.confidence)}>
              {metrics.ensemble.confidence.toFixed(1)}%
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flexGrow={1}>{renderCurrentView()}</Box>

      {/* Footer */}
      <Box paddingY={1} paddingX={2}>
        <InteractiveFooter
          currentScreen="Learning Monitor"
          availableScreens={[
            { key: '1', name: 'Overview' },
            { key: '2', name: 'Tiers' },
            { key: '3', name: 'Neural' },
            { key: '4', name: 'Events' },
            { key: 'P', name: isLive ? 'Pause' : 'Resume' },
            { key: 'F', name: `Speed (${refreshRate}ms)` },
            { key: 'R', name: 'Refresh' },
            { key: 'Q/Esc', name: 'Back' },
          ]}
          status={`${metrics.ensemble.totalPredictions} predictions | ${metrics.learning.modelUpdates} updates`}
        />
      </Box>
    </Box>
  );
};

export default LearningMonitor;
