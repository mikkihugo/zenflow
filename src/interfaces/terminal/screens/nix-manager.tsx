/**
 * Nix Manager Screen
 *
 * Interactive Nix environment management and package discovery
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import EnvironmentDetector, {
  type EnvironmentSnapshot,
  type EnvironmentTool,
} from '../../../utils/environment-detector.js';
import NixIntegration, {
  type NixEnvironment,
  type NixPackage,
} from '../../../utils/nix-integration.js';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';

export interface NixManagerProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

interface NixManagerState {
  isLoading: boolean;
  environment: NixEnvironment | null;
  environmentSnapshot: EnvironmentSnapshot | null;
  selectedCategory: 'overview' | 'packages' | 'setup' | 'suggestions';
  error?: Error;
}

/**
 * Nix Manager Screen Component
 *
 * Provides interactive Nix environment management
 */
export const NixManager: React.FC<NixManagerProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [state, setState] = useState<NixManagerState>({
    isLoading: true,
    environment: null,
    environmentSnapshot: null,
    selectedCategory: 'overview',
  });

  const nixIntegration = new NixIntegration();
  const envDetector = new EnvironmentDetector();

  // Load Nix environment on mount
  useEffect(() => {
    const loadEnvironment = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

        // Load both Nix-specific and general environment data
        const [env, snapshot] = await Promise.all([
          nixIntegration.detectEnvironment(),
          envDetector.detectEnvironment(),
        ]);

        setState((prev) => ({
          ...prev,
          environment: env,
          environmentSnapshot: snapshot,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    };

    loadEnvironment();

    // Listen for environment updates
    envDetector.on('detection-complete', (snapshot) => {
      setState((prev) => ({ ...prev, environmentSnapshot: snapshot }));
    });

    return () => {
      envDetector.removeAllListeners();
      envDetector.stopAutoDetection();
    };
  }, []);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }

    if (input === 'r' || input === 'R') {
      // Refresh environment
      setState((prev) => ({ ...prev, isLoading: true }));
      nixIntegration.detectEnvironment().then((env) => {
        setState((prev) => ({ ...prev, environment: env, isLoading: false }));
      });
    }
  });

  const handleCategorySelect = (category: string) => {
    setState((prev) => ({
      ...prev,
      selectedCategory: category as NixManagerState['selectedCategory'],
    }));
  };

  const handleAutoSetup = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const result = await nixIntegration.autoSetup();

      // Refresh environment after setup
      const env = await nixIntegration.detectEnvironment();
      setState((prev) => ({
        ...prev,
        environment: env,
        isLoading: false,
      }));

      // TODO: Show setup results in a modal or notification
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
    }
  };

  const renderOverview = () => {
    if (!state.environment) return null;

    const { nixAvailable, flakesEnabled, currentShell, packages } =
      state.environment;
    const installedPackages = packages.filter((p) => p.installed);
    const availablePackages = packages.filter((p) => p.available);

    return (
      <Box flexDirection="column">
        <Text
          bold
          color="cyan"
        >
          📦 Nix Environment Overview
        </Text>
        <Box marginY={1} />

        {/* Status Cards */}
        <Box
          flexDirection="row"
          gap={2}
        >
          <Box
            borderStyle="single"
            borderColor={nixAvailable ? 'green' : 'red'}
            padding={1}
            width={25}
          >
            <Text
              bold
              color={nixAvailable ? 'green' : 'red'}
            >
              {nixAvailable ? '✓' : '✗'} Nix Available
            </Text>
            <Text color="gray">Core system</Text>
          </Box>

          <Box
            borderStyle="single"
            borderColor={flakesEnabled ? 'green' : 'yellow'}
            padding={1}
            width={25}
          >
            <Text
              bold
              color={flakesEnabled ? 'green' : 'yellow'}
            >
              {flakesEnabled ? '✓' : '○'} Flakes
            </Text>
            <Text color="gray">Reproducible builds</Text>
          </Box>

          <Box
            borderStyle="single"
            borderColor={currentShell ? 'blue' : 'gray'}
            padding={1}
            width={25}
          >
            <Text
              bold
              color={currentShell ? 'blue' : 'gray'}
            >
              {currentShell ? '●' : '○'} Dev Shell
            </Text>
            <Text color="gray">{currentShell || 'Not active'}</Text>
          </Box>
        </Box>

        <Box marginY={1} />

        {/* Package Summary */}
        <Box
          borderStyle="single"
          borderColor="cyan"
          padding={1}
        >
          <Text
            bold
            color="cyan"
          >
            Package Summary
          </Text>
          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginTop={1}
          >
            <Box
              flexDirection="column"
              alignItems="center"
            >
              <Text
                bold
                color="green"
              >
                {installedPackages.length}
              </Text>
              <Text color="gray">Installed</Text>
            </Box>
            <Box
              flexDirection="column"
              alignItems="center"
            >
              <Text
                bold
                color="blue"
              >
                {availablePackages.length}
              </Text>
              <Text color="gray">Available</Text>
            </Box>
            <Box
              flexDirection="column"
              alignItems="center"
            >
              <Text
                bold
                color="yellow"
              >
                {packages.filter((p) => p.category === 'beam').length}
              </Text>
              <Text color="gray">BEAM Tools</Text>
            </Box>
            <Box
              flexDirection="column"
              alignItems="center"
            >
              <Text
                bold
                color="magenta"
              >
                {packages.filter((p) => p.category === 'dev-tools').length}
              </Text>
              <Text color="gray">Dev Tools</Text>
            </Box>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box marginTop={2}>
          <Text
            bold
            color="white"
          >
            Quick Actions:
          </Text>
          <Text>• Press 'A' for auto-setup</Text>
          <Text>• Press 'R' to refresh environment</Text>
          <Text>• Navigate to 'Setup' for detailed configuration</Text>
        </Box>
      </Box>
    );
  };

  const renderPackages = () => {
    if (!state.environment) return null;

    const packagesByCategory = state.environment.packages.reduce(
      (acc, pkg) => {
        if (!acc[pkg.category]) acc[pkg.category] = [];
        acc[pkg.category].push(pkg);
        return acc;
      },
      {} as Record<string, NixPackage[]>,
    );

    return (
      <Box flexDirection="column">
        <Text
          bold
          color="cyan"
        >
          📦 Available Packages
        </Text>
        <Box marginY={1} />

        {Object.entries(packagesByCategory).map(([category, pkgs]) => (
          <Box
            key={category}
            marginBottom={2}
          >
            <Text
              bold
              color="yellow"
            >
              {category.toUpperCase()}
            </Text>
            <Box
              flexDirection="column"
              marginLeft={2}
            >
              {pkgs.map((pkg) => (
                <Box
                  key={pkg.name}
                  justifyContent="space-between"
                >
                  <Text>
                    {pkg.installed ? '✓' : pkg.available ? '○' : '✗'} {pkg.name}
                  </Text>
                  <Text color="gray">{pkg.description}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderSetup = () => {
    if (!state.environment) return null;

    return (
      <Box flexDirection="column">
        <Text
          bold
          color="cyan"
        >
          ⚙️ Nix Setup Assistant
        </Text>
        <Box marginY={1} />

        <Box
          borderStyle="single"
          borderColor="green"
          padding={2}
        >
          <Text
            bold
            color="green"
          >
            🚀 Auto Setup
          </Text>
          <Text>
            Automatically configure Nix for Claude Code Zen development:
          </Text>
          <Box marginTop={1}>
            <Text>• Creates flake.nix with BEAM language support</Text>
            <Text>• Enables Nix flakes if needed</Text>
            <Text>• Sets up development shell environment</Text>
          </Box>
          <Box marginTop={1}>
            <Text color="yellow">Press 'A' to run auto setup</Text>
          </Box>
        </Box>

        <Box
          marginTop={2}
          borderStyle="single"
          borderColor="blue"
          padding={2}
        >
          <Text
            bold
            color="blue"
          >
            📋 Manual Setup Steps
          </Text>
          <Box marginTop={1}>
            {state.environment.suggestedSetup.map((step, index) => (
              <Text key={index}>• {step}</Text>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderSuggestions = () => {
    if (!state.environment) return null;

    const missingBeam = state.environment.packages.filter(
      (p) => p.category === 'beam' && p.available && !p.installed,
    );

    const missingDev = state.environment.packages.filter(
      (p) => p.category === 'dev-tools' && p.available && !p.installed,
    );

    return (
      <Box flexDirection="column">
        <Text
          bold
          color="cyan"
        >
          💡 Smart Suggestions
        </Text>
        <Box marginY={1} />

        {missingBeam.length > 0 && (
          <Box
            borderStyle="single"
            borderColor="yellow"
            padding={1}
            marginBottom={1}
          >
            <Text
              bold
              color="yellow"
            >
              🔧 Missing BEAM Tools
            </Text>
            {missingBeam.map((pkg) => (
              <Text key={pkg.name}>
                • {pkg.name} - {pkg.description}
              </Text>
            ))}
            <Box marginTop={1}>
              <Text color="cyan">
                Suggest: nix-shell -p {missingBeam.map((p) => p.name).join(' ')}
              </Text>
            </Box>
          </Box>
        )}

        {missingDev.length > 0 && (
          <Box
            borderStyle="single"
            borderColor="blue"
            padding={1}
            marginBottom={1}
          >
            <Text
              bold
              color="blue"
            >
              🛠️ Missing Dev Tools
            </Text>
            {missingDev.map((pkg) => (
              <Text key={pkg.name}>
                • {pkg.name} - {pkg.description}
              </Text>
            ))}
            <Box marginTop={1}>
              <Text color="cyan">
                Suggest: nix-shell -p {missingDev.map((p) => p.name).join(' ')}
              </Text>
            </Box>
          </Box>
        )}

        {!state.environment.flakesEnabled && (
          <Box
            borderStyle="single"
            borderColor="magenta"
            padding={1}
          >
            <Text
              bold
              color="magenta"
            >
              ⚡ Enable Flakes
            </Text>
            <Text>Flakes provide reproducible development environments</Text>
            <Text color="cyan">
              Run: echo "experimental-features = nix-command flakes" {'>'}
              {'>'} ~/.config/nix/nix.conf
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  const categoryMenuItems = [
    { label: '📋 Overview', value: 'overview' },
    { label: '📦 Packages', value: 'packages' },
    { label: '⚙️ Setup', value: 'setup' },
    { label: '💡 Suggestions', value: 'suggestions' },
  ];

  if (state.isLoading) {
    return (
      <Box
        flexDirection="column"
        height="100%"
      >
        <Header
          title="Nix Manager"
          swarmStatus={swarmStatus}
          showBorder
        />
        <Box
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="yellow">🔍 Scanning Nix environment...</Text>
        </Box>
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box
        flexDirection="column"
        height="100%"
      >
        <Header
          title="Nix Manager - Error"
          swarmStatus={swarmStatus}
          showBorder
        />
        <Box
          flexGrow={1}
          padding={2}
        >
          <Text color="red">❌ Failed to load Nix environment:</Text>
          <Text color="red">{state.error.message}</Text>
        </Box>
        <InteractiveFooter
          currentScreen="Nix Manager"
          availableScreens={[{ key: 'Esc/Q', name: 'Back' }]}
          status="Error loading environment"
        />
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      height="100%"
    >
      <Header
        title="Nix Manager"
        swarmStatus={swarmStatus}
        showBorder
      />

      {/* Environment status */}
      <Box
        paddingX={2}
        paddingY={1}
      >
        <StatusBadge
          status={state.environment?.nixAvailable ? 'active' : 'error'}
          text={
            state.environment
              ? `Nix ${state.environment.nixAvailable ? 'Available' : 'Missing'}`
              : 'Loading...'
          }
        />
      </Box>

      <Box
        flexGrow={1}
        paddingX={2}
      >
        <Box
          flexDirection="row"
          height="100%"
        >
          {/* Left sidebar - Category navigation */}
          <Box
            width={20}
            paddingRight={2}
          >
            <Text
              bold
              color="white"
            >
              Categories:
            </Text>
            <Box marginY={1} />
            <SelectInput
              items={categoryMenuItems}
              onSelect={handleCategorySelect}
              itemComponent={({ isSelected, label }) => (
                <Text
                  color={isSelected ? 'cyan' : 'white'}
                  bold={isSelected}
                >
                  {isSelected ? '▶ ' : '  '}
                  {label}
                </Text>
              )}
            />
          </Box>

          {/* Main content area */}
          <Box
            flexGrow={1}
            borderLeft
            borderColor="gray"
            paddingLeft={2}
          >
            {state.selectedCategory === 'overview' && renderOverview()}
            {state.selectedCategory === 'packages' && renderPackages()}
            {state.selectedCategory === 'setup' && renderSetup()}
            {state.selectedCategory === 'suggestions' && renderSuggestions()}
          </Box>
        </Box>
      </Box>

      <InteractiveFooter
        currentScreen="Nix Manager"
        availableScreens={[
          { key: '↑↓', name: 'Navigate' },
          { key: 'A', name: 'Auto Setup' },
          { key: 'R', name: 'Refresh' },
          { key: 'Esc/Q', name: 'Back' },
        ]}
        status={
          state.environment
            ? `${state.environment.packages.filter((p) => p.installed).length} packages installed`
            : 'Loading...'
        }
      />
    </Box>
  );
};

export default NixManager;
