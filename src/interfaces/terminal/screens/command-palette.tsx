/**
 * Command Palette Screen.
 *
 * Quick access to all commands with fuzzy search, like VS Code Ctrl+Shift+P.
 * Massive productivity boost and feature discoverability.
 */

import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  type SwarmStatus,
} from '../components/index/index.js';

export interface Command {
  id: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  action: () => void | Promise<void>;
  requiresSwarm?: boolean;
  keybinding?: string;
}

export interface CommandPaletteProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
  onNavigate?: (screen: string) => void;
  onExecuteCommand?: (command: Command) => void;
}

/**
 * Command Palette Component.
 *
 * Provides fuzzy search and quick execution of all system commands.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  swarmStatus,
  onBack,
  onExit,
  onNavigate,
  onExecuteCommand,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [recentCommands, setRecentCommands] = useState<Command[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Available commands
  const allCommands: Command[] = [
    // Navigation Commands
    {
      id: 'nav-swarm-dashboard',
      title: 'Swarm Dashboard',
      description: 'View real-time swarm monitoring and agent status',
      category: 'Navigation',
      keywords: ['swarm', 'dashboard', 'agents', 'monitoring'],
      action: () => onNavigate?.('swarm-dashboard'),
      keybinding: 'Ctrl+S',
    },
    {
      id: 'nav-logs-viewer',
      title: 'Live Logs Viewer',
      description: 'View real-time system logs with filtering',
      category: 'Navigation',
      keywords: ['logs', 'debug', 'streaming', 'filter'],
      action: () => onNavigate?.('logs-viewer'),
      keybinding: 'Ctrl+L',
    },
    {
      id: 'nav-performance-monitor',
      title: 'Performance Monitor',
      description: 'Real-time system metrics and resource usage',
      category: 'Navigation',
      keywords: ['performance', 'metrics', 'cpu', 'memory', 'monitor'],
      action: () => onNavigate?.('performance-monitor'),
      keybinding: 'Ctrl+M',
    },
    {
      id: 'nav-file-browser',
      title: 'File Browser',
      description: 'Navigate and manage project files',
      category: 'Navigation',
      keywords: ['files', 'explorer', 'browse', 'project'],
      action: () => onNavigate?.('file-browser'),
      keybinding: 'Ctrl+E',
    },
    {
      id: 'nav-mcp-tester',
      title: 'MCP Tool Tester',
      description: 'Test and debug MCP tools with interactive parameters',
      category: 'Navigation',
      keywords: ['mcp', 'tools', 'test', 'debug', 'parameters'],
      action: () => onNavigate?.('mcp-tester'),
      keybinding: 'Ctrl+T',
    },

    // Swarm Commands
    {
      id: 'swarm-init',
      title: 'Initialize Swarm',
      description: 'Create new swarm with specified topology',
      category: 'Swarm',
      keywords: ['swarm', 'init', 'create', 'topology'],
      action: async () => {
        setIsExecuting(true);
        // Mock swarm initialization
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsExecuting(false);
      },
    },
    {
      id: 'swarm-spawn-agent',
      title: 'Spawn Agent',
      description: 'Create new agent in the active swarm',
      category: 'Swarm',
      keywords: ['agent', 'spawn', 'create', 'swarm'],
      action: async () => {
        setIsExecuting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsExecuting(false);
      },
      requiresSwarm: true,
    },
    {
      id: 'swarm-orchestrate',
      title: 'Orchestrate Task',
      description: 'Distribute task across swarm agents',
      category: 'Swarm',
      keywords: ['task', 'orchestrate', 'distribute', 'agents'],
      action: async () => {
        setIsExecuting(true);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setIsExecuting(false);
      },
      requiresSwarm: true,
    },

    // System Commands
    {
      id: 'system-status',
      title: 'System Status',
      description: 'View comprehensive system health and metrics',
      category: 'System',
      keywords: ['status', 'health', 'system', 'metrics'],
      action: () => onNavigate?.('status'),
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      category: 'System',
      keywords: ['settings', 'config', 'preferences'],
      action: () => onNavigate?.('settings'),
    },
    {
      id: 'system-clear-logs',
      title: 'Clear All Logs',
      description: 'Clear all system logs and debug information',
      category: 'System',
      keywords: ['clear', 'logs', 'debug', 'clean'],
      action: async () => {
        setIsExecuting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsExecuting(false);
      },
    },

    // MCP Commands
    {
      id: 'mcp-list-servers',
      title: 'List MCP Servers',
      description: 'Show all configured MCP servers and their status',
      category: 'MCP',
      keywords: ['mcp', 'servers', 'list', 'status'],
      action: () => onNavigate?.('mcp-servers'),
    },
    {
      id: 'mcp-test-tools',
      title: 'Test MCP Tools',
      description: 'Interactive testing of MCP tools and capabilities',
      category: 'MCP',
      keywords: ['mcp', 'tools', 'test', 'capabilities'],
      action: () => onNavigate?.('mcp-tester'),
    },

    // Development Commands
    {
      id: 'dev-workspace',
      title: 'Open Workspace',
      description: 'Access document-driven development workflow',
      category: 'Development',
      keywords: ['workspace', 'development', 'documents', 'workflow'],
      action: () => onNavigate?.('workspace'),
    },
    {
      id: 'dev-help',
      title: 'Help & Documentation',
      description: 'View system documentation and help information',
      category: 'Development',
      keywords: ['help', 'docs', 'documentation', 'guide'],
      action: () => onNavigate?.('help'),
    },
  ];

  // Fuzzy search implementation
  const fuzzyMatch = useCallback((query: string, text: string): number => {
    if (!query) return 1;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return 1;
    }

    // Character-by-character fuzzy matching
    let score = 0;
    let queryIndex = 0;

    for (
      let i = 0;
      i < textLower.length && queryIndex < queryLower.length;
      i++
    ) {
      if (textLower[i] === queryLower[queryIndex]) {
        score += 1;
        queryIndex++;
      }
    }

    return queryIndex === queryLower.length ? score / queryLower.length : 0;
  }, []);

  // Filter and sort commands based on search
  const filteredCommands = allCommands
    .map((cmd) => {
      const titleScore = fuzzyMatch(searchQuery, cmd.title);
      const descScore = fuzzyMatch(searchQuery, cmd.description);
      const keywordScore = Math.max(
        ...cmd.keywords.map((k) => fuzzyMatch(searchQuery, k)),
      );
      const totalScore = Math.max(titleScore, descScore, keywordScore);

      return { ...cmd, score: totalScore };
    })
    .filter((cmd) => !searchQuery || cmd.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Show top 10 results

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) =>
        Math.min(filteredCommands.length - 1, prev + 1),
      );
    } else if (key.return) {
      executeSelectedCommand();
    }
  });

  const executeSelectedCommand = useCallback(async () => {
    const selectedCommand = filteredCommands[selectedIndex];
    if (!selectedCommand) return;

    // Check if swarm is required
    if (selectedCommand.requiresSwarm && swarmStatus?.status !== 'active') {
      // Could show error message here
      return;
    }

    // Add to recent commands
    setRecentCommands((prev) => [
      selectedCommand,
      ...prev.filter((cmd) => cmd.id !== selectedCommand.id).slice(0, 4),
    ]);

    // Execute command
    if (onExecuteCommand) {
      onExecuteCommand(selectedCommand);
    } else {
      await selectedCommand.action();
    }

    // Close palette after execution unless it's a navigation command
    if (!selectedCommand.id.startsWith('nav-')) {
      onBack();
    }
  }, [filteredCommands, selectedIndex, swarmStatus, onExecuteCommand, onBack]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Navigation':
        return 'cyan';
      case 'Swarm':
        return 'yellow';
      case 'System':
        return 'green';
      case 'MCP':
        return 'magenta';
      case 'Development':
        return 'blue';
      default:
        return 'white';
    }
  };

  return (
    <Box
      flexDirection="column"
      height="100%"
    >
      {/* Header */}
      <Header
        title="Command Palette"
        subtitle="Quick access to all features"
        swarmStatus={swarmStatus}
        mode="standard"
        showBorder={true}
      />

      {/* Search Input */}
      <Box
        paddingX={3}
        paddingY={2}
        borderStyle="single"
        borderColor="cyan"
      >
        <Box
          flexDirection="column"
          width="100%"
        >
          <Text
            color="cyan"
            bold
          >
            🔍 Search Commands:
          </Text>
          <Box marginTop={1}>
            <Text color="gray">❯ </Text>
            <TextInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Type to search commands..."
            />
          </Box>
        </Box>
      </Box>

      {/* Results */}
      <Box
        flexGrow={1}
        paddingX={2}
        paddingY={1}
      >
        <Box
          flexDirection="column"
          width="100%"
        >
          {filteredCommands.length === 0 ? (
            <Box
              justifyContent="center"
              alignItems="center"
              height={10}
            >
              <Text color="gray">
                {searchQuery
                  ? 'No commands match your search'
                  : 'Start typing to search commands'}
              </Text>
            </Box>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = selectedIndex === index;
              const isDisabled =
                cmd.requiresSwarm && swarmStatus?.status !== 'active';

              return (
                <Box
                  key={cmd.id}
                  flexDirection="column"
                  backgroundColor={isSelected ? 'blue' : undefined}
                  paddingX={isSelected ? 2 : 1}
                  paddingY={1}
                  borderStyle={isSelected ? 'single' : undefined}
                  borderColor={isSelected ? 'cyan' : undefined}
                >
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                  >
                    <Box flexDirection="row">
                      <Text
                        color={isDisabled ? 'gray' : 'white'}
                        bold={isSelected}
                      >
                        {isSelected ? '▶ ' : '  '}
                        {cmd.title}
                      </Text>
                      {cmd.keybinding && (
                        <Text
                          color="gray"
                          dimColor
                        >
                          {' '}
                          ({cmd.keybinding})
                        </Text>
                      )}
                    </Box>
                    <Text
                      color={getCategoryColor(cmd.category)}
                      dimColor
                    >
                      {cmd.category}
                    </Text>
                  </Box>
                  {isSelected && (
                    <Box
                      marginTop={1}
                      paddingLeft={2}
                    >
                      <Text
                        color="gray"
                        wrap="wrap"
                      >
                        {cmd.description}
                      </Text>
                      {isDisabled && (
                        <Text
                          color="red"
                          dimColor
                        >
                          ⚠️ Requires active swarm
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* Recent Commands */}
      {recentCommands.length > 0 && !searchQuery && (
        <Box
          paddingX={2}
          paddingY={1}
          borderStyle="single"
          borderColor="gray"
        >
          <Box flexDirection="column">
            <Text
              color="gray"
              bold
            >
              📋 Recent Commands:
            </Text>
            <Box
              marginTop={1}
              flexDirection="row"
              flexWrap="wrap"
            >
              {recentCommands.map((cmd, index) => (
                <Box
                  key={cmd.id}
                  marginRight={2}
                  marginBottom={1}
                >
                  <Text
                    color="cyan"
                    dimColor
                  >
                    {index + 1}. {cmd.title}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Footer */}
      <Box
        paddingY={1}
        paddingX={2}
      >
        <InteractiveFooter
          currentScreen="Command Palette"
          availableScreens={[
            { key: '↑↓', name: 'Navigate' },
            { key: 'Enter', name: 'Execute' },
            { key: 'Type', name: 'Search' },
            { key: 'Q/Esc', name: 'Back' },
          ]}
          status={
            isExecuting ? 'Executing...' : `${filteredCommands.length} commands`
          }
        />
      </Box>
    </Box>
  );
};

export default CommandPalette;
