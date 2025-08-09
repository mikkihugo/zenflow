/**
 * @file Interactive Discovery TUI - Ink-based interactive discovery workflow
 *
 * This creates a beautiful, interactive TUI for the discovery process that allows users to:
 * 1. Watch analysis progress in real-time
 * 2. Interactively select domains to deploy
 * 3. Configure swarm settings per domain
 * 4. Deploy selected swarms with live progress
 * 5. Monitor deployment status
 */

import { Box, Spacer, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { DeploymentProgress } from './components/deployment-progress.js';
import { DomainCard } from './components/domain-card.js';
import { ProgressBar } from './components/progress-bar.js';
import { SwarmConfigPanel } from './components/swarm-config-panel.js';

export interface SwarmConfig {
  topology: 'mesh' | 'hierarchical' | 'star' | 'ring';
  maxAgents: number;
  resourceLimits: {
    memory: string;
    cpu: number;
  };
  enableAutoScaling: boolean;
  persistence: 'json' | 'sqlite' | 'lancedb';
}

export interface DeploymentStatus {
  status: 'pending' | 'deploying' | 'deployed' | 'failed';
  progress: number;
  message: string;
  agents: {
    created: number;
    total: number;
  };
}

export interface InteractiveDiscoveryProps {
  projectPath: string;
  options: {
    confidence?: number;
    maxIterations?: number;
    skipValidation?: boolean;
  };
  onComplete?: (results: any) => void;
  onCancel?: () => void;
}

/**
 * Main Interactive Discovery TUI Component
 *
 * @param root0
 * @param root0.projectPath
 * @param root0.options
 * @param root0.onComplete
 * @param root0.onCancel
 */
export const InteractiveDiscoveryTUI: React.FC<InteractiveDiscoveryProps> = ({
  projectPath,
  options,
  onComplete,
  onCancel,
}) => {
  const { exit } = useApp();
  const [state, setState] = useState<DiscoveryState>({
    phase: 'analyzing',
    progress: { current: 0, total: 5, message: 'Initializing...' },
    domains: [],
    selectedDomains: new Set(),
    swarmConfigs: new Map(),
    deploymentStatus: new Map(),
  });

  // Key bindings
  useInput((input, key) => {
    if (key.escape || (key.ctrl && input === 'c')) {
      onCancel?.();
      exit();
    }
  });

  // Start analysis on mount
  useEffect(() => {
    startAnalysis();
  }, [startAnalysis]);

  const startAnalysis = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        phase: 'analyzing',
        progress: { current: 1, total: 5, message: 'Analyzing project structure...' },
      }));

      // Simulate analysis phases with real backend integration points
      await simulateAnalysisPhase('Scanning files and dependencies...', 2);
      await simulateAnalysisPhase('Discovering domain boundaries...', 3);
      await simulateAnalysisPhase('Building confidence scores...', 4);
      await simulateAnalysisPhase('Generating recommendations...', 5);

      // Mock discovered domains (in real implementation, this comes from DiscoverCommand)
      const mockDomains: DiscoveredDomain[] = [
        {
          name: 'user-management',
          path: '/src/user',
          confidence: 0.94,
          files: 23,
          concepts: ['authentication', 'user-profiles', 'permissions'],
          technologies: ['typescript', 'nodejs', 'postgresql'],
          estimatedComplexity: 'medium',
          suggestedTopology: 'hierarchical',
          estimatedAgents: 5,
        },
        {
          name: 'payment-processing',
          path: '/src/payment',
          confidence: 0.89,
          files: 31,
          concepts: ['transactions', 'billing', 'subscriptions'],
          technologies: ['typescript', 'stripe-api', 'redis'],
          estimatedComplexity: 'high',
          suggestedTopology: 'star',
          estimatedAgents: 8,
        },
        {
          name: 'notification-system',
          path: '/src/notifications',
          confidence: 0.87,
          files: 15,
          concepts: ['email', 'push-notifications', 'templates'],
          technologies: ['typescript', 'sendgrid', 'websockets'],
          estimatedComplexity: 'low',
          suggestedTopology: 'ring',
          estimatedAgents: 3,
        },
        {
          name: 'api-gateway',
          path: '/src/gateway',
          confidence: 0.96,
          files: 18,
          concepts: ['routing', 'middleware', 'rate-limiting'],
          technologies: ['typescript', 'express', 'nginx'],
          estimatedComplexity: 'medium',
          suggestedTopology: 'star',
          estimatedAgents: 4,
        },
        {
          name: 'data-analytics',
          path: '/src/analytics',
          confidence: 0.78,
          files: 42,
          concepts: ['metrics', 'dashboards', 'reporting'],
          technologies: ['typescript', 'postgresql', 'redis'],
          estimatedComplexity: 'extreme',
          suggestedTopology: 'mesh',
          estimatedAgents: 12,
        },
      ];

      setState((prev) => ({
        ...prev,
        phase: 'reviewing',
        domains: mockDomains,
        progress: { current: 5, total: 5, message: 'Analysis complete!' },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        phase: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, [simulateAnalysisPhase]);

  const simulateAnalysisPhase = async (message: string, step: number): Promise<void> => {
    setState((prev) => ({
      ...prev,
      progress: { current: step, total: 5, message },
    }));

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const handleDomainSelection = useCallback((domain: string, selected: boolean) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedDomains);
      const newConfigs = new Map(prev.swarmConfigs);

      if (selected) {
        newSelected?.add(domain);
        // Set default config for newly selected domain
        const domainData = prev.domains.find((d) => d.name === domain);
        if (domainData) {
          newConfigs?.set(domain, {
            topology: domainData?.suggestedTopology,
            maxAgents: domainData?.estimatedAgents,
            resourceLimits: {
              memory: domainData?.estimatedComplexity === 'extreme' ? '2GB' : '1GB',
              cpu: Math.min(domainData?.estimatedAgents, 4),
            },
            enableAutoScaling: true,
            persistence: domainData?.technologies?.includes('postgresql') ? 'sqlite' : 'json',
          });
        }
      } else {
        newSelected?.delete(domain);
        newConfigs?.delete(domain);
      }

      return {
        ...prev,
        selectedDomains: newSelected,
        swarmConfigs: newConfigs,
      };
    });
  }, []);

  const handleConfigChange = useCallback((domain: string, config: Partial<SwarmConfig>) => {
    setState((prev) => {
      const newConfigs = new Map(prev.swarmConfigs);
      const currentConfig = newConfigs?.get(domain);
      if (currentConfig) {
        newConfigs?.set(domain, { ...currentConfig, ...config });
      }
      return {
        ...prev,
        swarmConfigs: newConfigs,
      };
    });
  }, []);

  const handleDeploy = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      phase: 'deploying',
      progress: { current: 0, total: prev.selectedDomains.size, message: 'Starting deployment...' },
    }));

    // Initialize deployment status for all selected domains
    const initialStatus = new Map<string, DeploymentStatus>();
    state.selectedDomains.forEach((domain) => {
      const config = state.swarmConfigs.get(domain);
      initialStatus.set(domain, {
        status: 'pending',
        progress: 0,
        message: 'Queued for deployment',
        agents: { created: 0, total: config?.["maxAgents"] || 0 },
      });
    });

    setState((prev) => ({ ...prev, deploymentStatus: initialStatus }));

    // Deploy each domain sequentially with progress updates
    let completed = 0;
    for (const domain of state.selectedDomains) {
      await deployDomain(domain);
      completed++;
      setState((prev) => ({
        ...prev,
        progress: {
          current: completed,
          total: prev.selectedDomains.size,
          message: `Deployed ${completed}/${prev.selectedDomains.size} swarms`,
        },
      }));
    }

    setState((prev) => ({
      ...prev,
      phase: 'completed',
      progress: {
        current: prev.selectedDomains.size,
        total: prev.selectedDomains.size,
        message: 'All swarms deployed successfully!',
      },
    }));

    // Auto-exit after showing completion for a moment
    setTimeout(() => {
      onComplete?.(state);
      exit();
    }, 3000);
  }, [state.selectedDomains, state.swarmConfigs, onComplete, exit, deployDomain, state]);

  const deployDomain = async (domain: string): Promise<void> => {
    const config = state.swarmConfigs.get(domain);
    if (!config) return;

    // Update status to deploying
    setState((prev) => ({
      ...prev,
      deploymentStatus: new Map(
        prev.deploymentStatus.set(domain, {
          status: 'deploying',
          progress: 0,
          message: 'Initializing swarm infrastructure...',
          agents: { created: 0, total: config?.["maxAgents"] },
        })
      ),
    }));

    // Simulate deployment phases
    const phases = [
      'Creating swarm coordinator...',
      'Establishing topology...',
      'Spawning specialized agents...',
      'Configuring persistence...',
      'Starting agent coordination...',
      'Finalizing deployment...',
    ];

    for (let i = 0; i < phases.length; i++) {
      setState((prev) => ({
        ...prev,
        deploymentStatus: new Map(
          prev.deploymentStatus.set(domain, {
            status: 'deploying',
            progress: ((i + 1) / phases.length) * 100,
            message: phases[i],
            agents: {
              created: Math.floor(((i + 1) / phases.length) * config?.["maxAgents"]),
              total: config?.["maxAgents"],
            },
          })
        ),
      }));

      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Mark as deployed
    setState((prev) => ({
      ...prev,
      deploymentStatus: new Map(
        prev.deploymentStatus.set(domain, {
          status: 'deployed',
          progress: 100,
          message: 'Swarm operational',
          agents: { created: config?.["maxAgents"], total: config?.["maxAgents"] },
        })
      ),
    }));
  };

  // Render different phases
  const renderContent = () => {
    switch (state.phase) {
      case 'analyzing':
        return <AnalysisPhase state={state} />;
      case 'reviewing':
        return (
          <ReviewPhase
            state={state}
            onDomainSelection={handleDomainSelection}
            onProceedToConfig={() => setState((prev) => ({ ...prev, phase: 'configuring' }))}
          />
        );
      case 'configuring':
        return (
          <ConfigurationPhase
            state={state}
            onConfigChange={handleConfigChange}
            onDeploy={handleDeploy}
            onBack={() => setState((prev) => ({ ...prev, phase: 'reviewing' }))}
          />
        );
      case 'deploying':
        return <DeploymentPhase state={state} />;
      case 'completed':
        return <CompletionPhase state={state} />;
      case 'error':
        return <ErrorPhase error={state.error || 'Unknown error'} />;
      default:
        return <Text>Unknown phase</Text>;
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Header />
      {renderContent()}
    </Box>
  );
};

// Header component
const Header: React.FC = () => (
  <Box marginBottom={1}>
    <Box borderStyle="double" padding={1}>
      <Text bold color="cyan">
        🧠 CLAUDE-ZEN INTERACTIVE DISCOVERY
      </Text>
      <Spacer />
      <Text dimColor>ESC to cancel</Text>
    </Box>
  </Box>
);

// Analysis Phase Component
const AnalysisPhase: React.FC<{ state: DiscoveryState }> = ({ state }) => (
  <Box flexDirection="column">
    <Box marginBottom={1}>
      <Text bold>🔍 Analyzing Your Codebase</Text>
    </Box>

    <Box marginBottom={1}>
      <Spinner type="dots" />
      <Text> {state.progress.message}</Text>
    </Box>

    <ProgressBar current={state.progress.current} total={state.progress.total} showPercentage />

    <Box marginTop={1}>
      <Text dimColor>This may take a few moments depending on project size...</Text>
    </Box>
  </Box>
);

// Review Phase Component
const ReviewPhase: React.FC<{
  state: DiscoveryState;
  onDomainSelection: (domain: string, selected: boolean) => void;
  onProceedToConfig: () => void;
}> = ({ state, onDomainSelection, onProceedToConfig }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (key.downArrow && selectedIndex < state.domains.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (input === ' ') {
      const domain = state.domains[selectedIndex];
      onDomainSelection(domain.name, !state.selectedDomains.has(domain.name));
    } else if (key.return && state.selectedDomains.size > 0) {
      onProceedToConfig();
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>📋 Review Discovered Domains</Text>
        <Spacer />
        <Text dimColor>
          {state.selectedDomains.size} of {state.domains.length} selected
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {state.domains.map((domain, index) => (
          <DomainCard
            key={domain.name}
            domain={domain}
            selected={state.selectedDomains.has(domain.name)}
            highlighted={index === selectedIndex}
          />
        ))}
      </Box>

      <Box>
        <Text dimColor>↑↓ Navigate • SPACE Select • ENTER Continue</Text>
        {state.selectedDomains.size > 0 && (
          <>
            <Spacer />
            <Text color="green">Press ENTER to configure swarms</Text>
          </>
        )}
      </Box>
    </Box>
  );
};

// Configuration Phase Component
const ConfigurationPhase: React.FC<{
  state: DiscoveryState;
  onConfigChange: (domain: string, config: Partial<SwarmConfig>) => void;
  onDeploy: () => void;
  onBack: () => void;
}> = ({ state, onConfigChange, onDeploy, onBack }) => {
  const [selectedDomain, setSelectedDomain] = useState(0);
  const selectedDomains = Array.from(state.selectedDomains);

  useInput((input, key) => {
    if (key.leftArrow && selectedDomain > 0) {
      setSelectedDomain(selectedDomain - 1);
    } else if (key.rightArrow && selectedDomain < selectedDomains.length - 1) {
      setSelectedDomain(selectedDomain + 1);
    } else if (key.return) {
      onDeploy();
    } else if (key.escape) {
      onBack();
    }
  });

  const currentDomain = selectedDomains?.[selectedDomain];
  const config = state.swarmConfigs.get(currentDomain);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>⚙️ Configure Swarms</Text>
        <Spacer />
        <Text dimColor>
          {selectedDomain + 1} of {selectedDomains.length}
        </Text>
      </Box>

      {config && (
        <SwarmConfigPanel
          domain={currentDomain}
          config={config}
          onConfigChange={(newConfig) => onConfigChange(currentDomain, newConfig)}
        />
      )}

      <Box marginTop={1}>
        <Text dimColor>←→ Navigate domains • ENTER Deploy • ESC Back</Text>
      </Box>
    </Box>
  );
};

// Deployment Phase Component
const DeploymentPhase: React.FC<{ state: DiscoveryState }> = ({ state }) => (
  <Box flexDirection="column">
    <Box marginBottom={1}>
      <Text bold>🚀 Deploying Swarms</Text>
    </Box>

    <Box marginBottom={1}>
      <ProgressBar
        current={state.progress.current}
        total={state.progress.total}
        label={state.progress.message}
        showPercentage
      />
    </Box>

    <Box flexDirection="column">
      {Array.from(state.deploymentStatus.entries()).map(([domain, status]) => (
        <DeploymentProgress key={domain} domain={domain} status={status} />
      ))}
    </Box>
  </Box>
);

// Completion Phase Component
const CompletionPhase: React.FC<{ state: DiscoveryState }> = ({ state }) => (
  <Box flexDirection="column" alignItems="center">
    <Box marginBottom={1}>
      <Text bold color="green">
        🎉 Deployment Complete!
      </Text>
    </Box>

    <Box marginBottom={1}>
      <Text>
        Successfully deployed {state.selectedDomains.size} swarms with{' '}
        {Array.from(state.deploymentStatus.values()).reduce(
          (sum, status) => sum + status.agents.created,
          0
        )}{' '}
        total agents.
      </Text>
    </Box>

    <Box>
      <Text dimColor>Launching status dashboard...</Text>
    </Box>
  </Box>
);

// Error Phase Component
const ErrorPhase: React.FC<{ error: string }> = ({ error }) => (
  <Box flexDirection="column">
    <Box marginBottom={1}>
      <Text bold color="red">
        ❌ Error
      </Text>
    </Box>

    <Box marginBottom={1}>
      <Text>{error}</Text>
    </Box>

    <Box>
      <Text dimColor>Press ESC to exit</Text>
    </Box>
  </Box>
);

export default InteractiveDiscoveryTUI;
