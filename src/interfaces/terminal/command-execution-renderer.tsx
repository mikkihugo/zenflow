/**
 * Command Execution Renderer - Google Standard Component
 *
 * Renders command execution results with rich terminal output.
 * Focuses solely on UI rendering - business logic handled by CommandExecutionEngine.
 * Renamed from generic CLIMode to reflect actual responsibility: rendering command execution results.
 */

import { Box, Text, useApp } from 'ink';
import type React from 'react';
import { useEffect, useState } from 'react';
import AdvancedCLICommands from './advanced-cli-commands';
import { CommandExecutionEngine, type CommandResult } from './command-execution-engine';
import { ErrorMessage, Header, LoadingSpinner, StatusBadge } from './components/index';
import { MockCommandHandler } from './utils/mock-command-handler';

export interface CommandExecutionProps {
  commands: string[];
  flags: Record<string, any>;
  onExit: (code: number) => void;
}

interface ExecutionState {
  status: 'loading' | 'success' | 'error' | 'idle';
  result?: CommandResult;
  error?: Error;
}

/**
 * Command Execution Renderer Component
 *
 * Renders command execution results in a clean, formatted way.
 * UI-only component - delegates business logic to MockCommandHandler.
 *
 * @param root0
 * @param root0.commands
 * @param root0.flags
 * @param root0.onExit
 */
export const CommandExecutionRenderer: React.FC<CommandExecutionProps> = ({
  commands,
  flags,
  onExit,
}) => {
  const { exit } = useApp();
  const [state, setState] = useState<ExecutionState>({ status: 'idle' });
  const [advancedCLI] = useState(() => new AdvancedCLICommands());

  useEffect(() => {
    const executeCommands = async () => {
      if (commands.length === 0) {
        // No commands provided, show help
        displayHelp();
        onExit(0);
        return;
      }

      const [command, ...args] = commands;

      try {
        setState({ status: 'loading' });

        let result: CommandResult;

        // Check if this is an advanced CLI command
        // Skip advanced CLI for core commands that have been enhanced in CommandExecutionEngine
        const coreCommands = [
          'init',
          'status',
          'query',
          'agents',
          'tasks',
          'knowledge',
          'health',
          'sync',
          'contribute',
          'swarm',
          'mcp',
          'workspace',
          'discover',
          'help',
        ];
        const shouldUseAdvancedCLI =
          !coreCommands.includes(command) && advancedCLI.isAdvancedCommand(command);

        if (shouldUseAdvancedCLI) {
          // Execute through Advanced CLI
          try {
            const advancedResult = await advancedCLI.executeCommand(command, args, flags);
            result = {
              success: advancedResult.success,
              message: advancedResult.message,
              data: advancedResult,
              timestamp: new Date(),
            };
          } catch (advancedError) {
            result = {
              success: false,
              error: `Advanced CLI Error: ${advancedError instanceof Error ? advancedError.message : advancedError}`,
              timestamp: new Date(),
            };
          }
        } else {
          // Execute through real command execution engine
          result = await CommandExecutionEngine.executeCommand(command, args, flags);
        }

        setState({
          status: result.success ? 'success' : 'error',
          result,
        });

        // Auto-exit after displaying result
        setTimeout(
          () => {
            onExit(result.success ? 0 : 1);
          },
          flags.interactive ? 0 : 1000
        );
      } catch (error) {
        setState({
          status: 'error',
          error: error as Error,
        });

        setTimeout(
          () => {
            onExit(1);
          },
          flags.interactive ? 0 : 1000
        );
      }
    };

    executeCommands();
  }, [commands, flags, onExit, advancedCLI]);

  const displayHelp = () => {};

  const renderResult = () => {
    if (!state.result) return null;

    const { result } = state;

    // JSON output mode
    if (flags.json) {
      return null;
    }

    return (
      <Box flexDirection="column" padding={1}>
        <Header
          title="🧠 Advanced CLI Execution Result"
          subtitle={commands.join(' ')}
          showBorder={true}
        />

        {result.success ? (
          <Box flexDirection="column">
            <Box marginBottom={1}>
              <StatusBadge status="success" text="✅ Command executed successfully" />
            </Box>

            {result.message && (
              <Box marginBottom={1}>
                <Text color="green">{result.message}</Text>
              </Box>
            )}

            {result.data && (
              <Box marginTop={1}>
                <Box flexDirection="column">{renderAdvancedResultData(result.data)}</Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box flexDirection="column">
            <Box marginBottom={1}>
              <StatusBadge status="error" text="❌ Command failed" />
            </Box>

            <Box marginBottom={1}>
              <Text color="red">{result.error || 'Unknown error occurred'}</Text>
            </Box>
          </Box>
        )}

        {flags.interactive && (
          <Box marginTop={1}>
            <Text dimColor>Press Ctrl+C to exit</Text>
          </Box>
        )}
      </Box>
    );
  };

  const renderAdvancedResultData = (data: any) => {
    // Enhanced rendering for Advanced CLI results
    if (typeof data === 'object' && data !== null) {
      const elements = [];

      // Show summary information
      if (data.summary) {
        elements.push(
          <Box key="summary" marginBottom={1}>
            <Text bold color="cyan">
              📊 Summary:{' '}
            </Text>
            <Text>{data.summary}</Text>
          </Box>
        );
      }

      // Show metrics if available
      if (data.metrics) {
        elements.push(
          <Box key="metrics" marginBottom={1} flexDirection="column">
            <Text bold color="yellow">
              📈 Metrics:
            </Text>
            <Box marginLeft={2} flexDirection="column">
              {Object.entries(data.metrics).map(([key, value]) => (
                <Text key={key}>
                  {key}: <Text color="green">{String(value)}</Text>
                </Text>
              ))}
            </Box>
          </Box>
        );
      }

      // Show duration if available
      if (data.duration) {
        elements.push(
          <Box key="duration" marginBottom={1}>
            <Text bold color="blue">
              ⏱️ Duration:{' '}
            </Text>
            <Text color="cyan">{data.duration}ms</Text>
          </Box>
        );
      }

      // Show additional details
      if (data.details) {
        elements.push(
          <Box key="details" marginBottom={1}>
            <Text bold color="magenta">
              ℹ️ Details:{' '}
            </Text>
            <Text>{data.details}</Text>
          </Box>
        );
      }

      // Show files created/affected
      if (data.filesCreated || data.result?.generatedFiles) {
        const fileCount = data.filesCreated || data.result?.generatedFiles?.length || 0;
        elements.push(
          <Box key="files" marginBottom={1}>
            <Text bold color="green">
              📁 Files:{' '}
            </Text>
            <Text color="cyan">{fileCount} files generated</Text>
          </Box>
        );
      }

      // Show quality score if available
      if (data.qualityScore || data.result?.qualityScore) {
        const score = data.qualityScore || data.result?.qualityScore;
        elements.push(
          <Box key="quality" marginBottom={1}>
            <Text bold color="yellow">
              🎯 Quality Score:{' '}
            </Text>
            <Text color="green">{score}%</Text>
          </Box>
        );
      }

      // Show AI enhancements if available
      if (data.result?.aiEnhancements && typeof data.result.aiEnhancements === 'object') {
        elements.push(
          <Box key="ai-enhancements" marginBottom={1} flexDirection="column">
            <Text bold color="blue">
              🤖 AI Enhancements:
            </Text>
            <Box marginLeft={2} flexDirection="column">
              {Object.entries(data.result.aiEnhancements).map(([key, value]) => (
                <Text key={key}>
                  {key}: <Text color={value ? 'green' : 'red'}>{value ? '✅' : '❌'}</Text>
                </Text>
              ))}
            </Box>
          </Box>
        );
      }

      // Fallback to JSON for other data
      if (elements.length === 0) {
        elements.push(
          <Box key="raw-data" flexDirection="column">
            <Text bold>Result Data:</Text>
            <Box marginLeft={2}>
              <Text>{formatResultData(data)}</Text>
            </Box>
          </Box>
        );
      }

      return elements;
    }

    return (
      <Box flexDirection="column">
        <Text bold>Result:</Text>
        <Box marginLeft={2}>
          <Text>{String(data)}</Text>
        </Box>
      </Box>
    );
  };

  const formatResultData = (data: any): string => {
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  const renderContent = () => {
    switch (state.status) {
      case 'loading':
        return (
          <Box flexDirection="column" alignItems="center" justifyContent="center" height={10}>
            <LoadingSpinner text={`Executing ${commands[0]}...`} />
          </Box>
        );

      case 'success':
      case 'error':
        return renderResult();

      case 'idle':
        return (
          <Box flexDirection="column" padding={1}>
            <Header title="Claude Code Zen Command Execution" />
            <Text>No command provided. Use 'claude-zen help' for usage information.</Text>
          </Box>
        );

      default:
        return <Text>Unknown state</Text>;
    }
  };

  const renderError = () => {
    if (!state.error) return null;

    return (
      <Box padding={1}>
        <ErrorMessage
          error={state.error}
          title="Command Execution Error"
          showStack={flags.verbose}
          actions={[{ key: 'Ctrl+C', action: 'Exit' }]}
        />
      </Box>
    );
  };

  // Handle JSON output mode - don't render React components
  if (flags.json && state.status !== 'loading') {
    return null;
  }

  return (
    <Box flexDirection="column" height="100%">
      {state.error ? renderError() : renderContent()}
    </Box>
  );
};

export default CommandExecutionRenderer;
