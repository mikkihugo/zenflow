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
import {
  ErrorMessage,
  Header,
  LoadingSpinner,
  StatusBadge,
  type SwarmStatus,
} from './components/index.js';
import { type CommandResult, MockCommandHandler } from './utils/MockCommandHandler.js';

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
 */
export const CommandExecutionRenderer: React.FC<CommandExecutionProps> = ({
  commands,
  flags,
  onExit,
}) => {
  const { exit } = useApp();
  const [state, setState] = useState<ExecutionState>({ status: 'idle' });

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

        const result = await MockCommandHandler.executeCommand(command, args, flags);

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
  }, [commands, flags, onExit]);

  const displayHelp = () => {
    console.log(`
🧠 Claude Code Zen - Command Execution v2.0.0-alpha.73

USAGE:
  claude-zen [command] [options]

COMMANDS:
  init [name]           Initialize a new project
  status               Show system status  
  swarm <action>       Manage swarms (start, stop, list, status)
  mcp <action>         MCP server operations (start, stop, status)
  workspace <action>   Document-driven development workflow
  help                 Show this help message

OPTIONS:
  --interactive, -i    Keep terminal open after command execution
  --json               Output results in JSON format
  --verbose            Enable verbose logging
  --theme <theme>      Set UI theme (dark, light)

EXAMPLES:
  claude-zen init my-project --template advanced
  claude-zen status --json
  claude-zen swarm start --agents 6 --topology mesh
  claude-zen mcp start --port 3001
  claude-zen workspace init my-workspace

For interactive terminal interface, use: claude-zen --ui

Documentation: https://github.com/ruvnet/claude-zen-flow
`);
  };

  const renderResult = () => {
    if (!state.result) return null;

    const { result } = state;

    // JSON output mode
    if (flags.json) {
      console.log(
        JSON.stringify(
          result.data || {
            success: result.success,
            message: result.message,
            error: result.error,
          },
          null,
          2
        )
      );
      return null;
    }

    return (
      <Box flexDirection="column" padding={1}>
        <Header title="Execution Result" subtitle={commands.join(' ')} showBorder={true} />

        {result.success ? (
          <Box flexDirection="column">
            <Box marginBottom={1}>
              <StatusBadge status="success" text="Command executed successfully" />
            </Box>

            {result.message && (
              <Box marginBottom={1}>
                <Text color="green">{result.message}</Text>
              </Box>
            )}

            {result.data && (
              <Box marginTop={1}>
                <Box flexDirection="column">
                  <Text bold>Result Data:</Text>
                  <Box marginLeft={2}>
                    <Text>{formatResultData(result.data)}</Text>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box flexDirection="column">
            <Box marginBottom={1}>
              <StatusBadge status="error" text="Command failed" />
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
