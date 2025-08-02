/**
 * @fileoverview Enhanced Terminal Interface Router
 *
 * Integrates the Advanced CLI Engine with the existing terminal interface system.
 * Provides intelligent command routing, AI-assisted operations, and real-time monitoring.
 */

import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useEffect, useState } from 'react';
import { AdvancedCLIEngine } from '../cli/AdvancedCLIEngine.js';
import type { CLIConfig } from '../cli/types/AdvancedCLITypes.js';
import { CommandExecutionRenderer } from './CommandExecutionRenderer.js';
import { InteractiveTerminalApplication } from './InteractiveTerminalApplication.js';
import { detectMode, type TerminalMode } from './utils/mode-detector.js';

export interface TerminalAppProps {
  commands: string[];
  flags: Record<string, any>;
  onExit: (code: number) => void;
}

interface TerminalState {
  mode: TerminalMode;
  cliEngine: AdvancedCLIEngine;
  config: CLIConfig;
  isInitializing: boolean;
  error?: Error;
  commandResult?: any;
}

/**
 * Enhanced Terminal Application Component
 *
 * Provides intelligent command routing between command execution and interactive modes.
 * Integrates advanced CLI capabilities with AI assistance and real-time monitoring.
 */
export const TerminalApp: React.FC<TerminalAppProps> = ({ commands, flags, onExit }) => {
  const [state, setState] = useState<TerminalState>({
    mode: detectMode(commands, flags),
    cliEngine: new AdvancedCLIEngine(),
    config: {
      theme: (flags.theme as 'dark' | 'light') || 'dark',
      verbosity: (flags.verbose ? 'verbose' : flags.quiet ? 'quiet' : 'normal') as any,
      autoCompletion: flags.autoComplete !== false,
      realTimeUpdates: flags.realTime !== false,
      aiAssistance: {
        enabled: flags.aiAssist !== false,
        suggestions: flags.suggestions !== false,
        autoCorrection: flags.autoCorrect !== false,
        contextAware: flags.contextAware !== false,
        learningMode: flags.learn !== false,
      },
      performance: {
        caching: flags.cache !== false,
        parallelization: flags.parallel !== false,
        optimization: flags.optimize !== false,
        monitoring: flags.monitor !== false,
      },
    },
    isInitializing: true,
  });

  // Initialize CLI engine and detect capabilities
  useEffect(() => {
    initializeEnhancedCLI();
  }, []);

  const initializeEnhancedCLI = async () => {
    try {
      setState((prev) => ({ ...prev, isInitializing: true }));

      // Initialize the advanced CLI engine
      await state.cliEngine.getCommandRegistry();

      // Setup event listeners for real-time updates
      state.cliEngine.on('commandExecutionStarted', handleCommandStart);
      state.cliEngine.on('commandExecutionCompleted', handleCommandComplete);
      state.cliEngine.on('commandExecutionFailed', handleCommandError);
      state.cliEngine.on('projectCreationStarted', handleProjectStart);
      state.cliEngine.on('projectCreationCompleted', handleProjectComplete);

      setState((prev) => ({
        ...prev,
        isInitializing: false,
        error: undefined,
      }));

      // Auto-execute commands if in command mode
      if (state.mode === 'command' && commands.length > 0) {
        await executeAdvancedCommand(commands, flags);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isInitializing: false,
        error: error as Error,
      }));
    }
  };

  const executeAdvancedCommand = async (cmdArgs: string[], options: any) => {
    if (cmdArgs.length === 0) {
      setState((prev) => ({
        ...prev,
        error: new Error('No command provided'),
      }));
      return;
    }

    const [commandName, ...args] = cmdArgs;

    try {
      // Check if this is an advanced CLI command
      const command = state.cliEngine.getCommandRegistry().getCommand(commandName);

      if (command) {
        // Execute through advanced CLI engine
        const result = await state.cliEngine.executeCommand(commandName, args, options);
        setState((prev) => ({
          ...prev,
          commandResult: result,
          error: undefined,
        }));
      } else {
        // Handle traditional commands or show help
        await handleTraditionalCommand(commandName, args, options);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
    }
  };

  const handleTraditionalCommand = async (commandName: string, args: string[], options: any) => {
    switch (commandName) {
      case 'help':
      case '--help':
      case '-h':
        setState((prev) => ({
          ...prev,
          commandResult: generateHelpContent(),
        }));
        break;

      case 'version':
      case '--version':
      case '-v':
        setState((prev) => ({
          ...prev,
          commandResult: { version: '2.0.0-alpha.73', mode: 'enhanced' },
        }));
        break;

      default: {
        // Try to suggest similar commands
        const suggestions = suggestCommands(commandName);
        setState((prev) => ({
          ...prev,
          error: new Error(`Unknown command: ${commandName}`),
          commandResult: { suggestions },
        }));
      }
    }
  };

  const generateHelpContent = () => {
    const categories = state.cliEngine.getCommandRegistry().getCategories();

    return {
      title: '🧠 Claude-Zen Advanced CLI - Revolutionary AI Project Management',
      version: '2.0.0-alpha.73',
      description:
        'Intelligent project scaffolding, real-time swarm coordination, and automated development workflows',
      categories: categories.map((cat) => ({
        name: cat.name,
        description: cat.description,
        commands: cat.commands.map((cmd: any) => ({
          name: cmd.name,
          description: cmd.description,
          aiAssisted: cmd.aiAssisted,
          realTimeMonitoring: cmd.realTimeMonitoring,
        })),
      })),
      examples: [
        {
          description: 'Create AI-optimized project with neural network capabilities',
          command:
            'claude-zen create my-project --type=neural-ai --complexity=enterprise --ai-features=all',
        },
        {
          description: 'Monitor swarm execution with real-time dashboard',
          command:
            'claude-zen swarm monitor --real-time --interactive-dashboard --performance-metrics',
        },
        {
          description: 'Generate optimized code from specification',
          command:
            'claude-zen generate from-spec api-requirements.yaml --optimize-performance --add-tests',
        },
        {
          description: 'Launch interactive terminal interface',
          command: 'claude-zen tui --mode=swarm-overview',
        },
      ],
      globalOptions: [
        '--ai-assist: Enable AI assistance and suggestions',
        '--real-time: Enable real-time monitoring and updates',
        '--verbose: Detailed output and logging',
        '--theme: Interface theme (dark|light|auto)',
        '--optimize: Enable performance optimizations',
      ],
    };
  };

  const suggestCommands = (invalidCommand: string): string[] => {
    const allCommands = state.cliEngine.getCommandRegistry().getAllCommands();
    const commandNames = allCommands.map((cmd: any) => cmd.name);

    // Simple string distance suggestion (could be enhanced with more sophisticated matching)
    return commandNames
      .filter(
        (name) =>
          name.includes(invalidCommand) ||
          invalidCommand.includes(name) ||
          levenshteinDistance(name, invalidCommand) <= 2
      )
      .slice(0, 5);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  // Event handlers
  const handleCommandStart = (event: any) => {
    if (state.config.verbosity === 'verbose' || state.config.verbosity === 'debug') {
      console.log(`🚀 Starting command: ${event.command}`);
    }
  };

  const handleCommandComplete = (event: any) => {
    if (state.config.verbosity === 'verbose' || state.config.verbosity === 'debug') {
      console.log(`✅ Command completed: ${event.command}`);
    }
  };

  const handleCommandError = (event: any) => {
    console.error(`❌ Command failed: ${event.command}`, event.error);
  };

  const handleProjectStart = (event: any) => {
    if (state.config.realTimeUpdates) {
      console.log(`🏗️ Creating project: ${event.name}`);
    }
  };

  const handleProjectComplete = (event: any) => {
    if (state.config.realTimeUpdates) {
      console.log(`🎯 Project created: ${event.projectName} (${event.filesGenerated} files)`);
    }
  };

  // Global keyboard shortcuts
  useInput((input, key) => {
    if (key.ctrl && input.toLowerCase() === 'c') {
      onExit(0);
    }
  });

  // Render appropriate interface based on mode and state
  if (state.isInitializing) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" padding={2}>
        <Text color="blue">🧠 Initializing Claude-Zen Advanced CLI...</Text>
        <Text color="gray">Loading AI capabilities and command registry</Text>
      </Box>
    );
  }

  if (state.error && state.mode === 'command') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">❌ {state.error.message}</Text>

        {state.commandResult?.suggestions && state.commandResult.suggestions.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="yellow">💡 Did you mean:</Text>
            {state.commandResult.suggestions.map((suggestion: string, index: number) => (
              <Text key={index} color="cyan">
                {' '}
                {suggestion}
              </Text>
            ))}
          </Box>
        )}

        <Box marginTop={1}>
          <Text color="gray">Use 'claude-zen help' for available commands</Text>
        </Box>
      </Box>
    );
  }

  if (state.mode === 'command') {
    return (
      <CommandExecutionRenderer
        result={state.commandResult}
        error={state.error}
        config={state.config}
        onExit={onExit}
      />
    );
  }

  // Interactive mode
  return <InteractiveTerminalApplication flags={flags} onExit={onExit} />;
};

export default TerminalApp;
