/**
 * MCP Servers Screen.
 *
 * Management interface for Model Context Protocol servers.
 * Allows starting, stopping, and configuring MCP servers.
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
import { useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  LoadingSpinner,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';

export interface MCPServer {
  name: string;
  status: 'running' | 'stopped' | 'error';
  port?: number;
  protocol: 'http' | 'stdio';
  tools: number;
  lastActive?: Date;
}

export interface MCPServersProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

interface MenuItem {
  label: string;
  value: string;
  description?: string;
}

export const MCPServers: React.FC<MCPServersProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('');

  // Load real MCP servers data
  useEffect(() => {
    const loadServers = async () => {
      setIsLoading(true);

      try {
        // Try to detect actual MCP servers
        const mcpModule = await import(
          '../../interfaces/mcp/start-server.ts'
        ).catch(() => null);

        if (mcpModule?.getMCPServers) {
          const realServers = await mcpModule.getMCPServers();
          setServers(realServers);
        } else {
          // No servers detected
          setServers([]);
        }
      } catch (error) {
        console.error('Failed to load MCP servers:', error);
        setServers([]);
      }

      setIsLoading(false);
    };

    loadServers();
  }, []);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }
  });

  const menuItems: MenuItem[] = [
    {
      label: '📊 View Server Status',
      value: 'status',
      description: 'Display detailed status of all MCP servers',
    },
    {
      label: '🚀 Start Server',
      value: 'start',
      description: 'Start a stopped MCP server',
    },
    {
      label: '⏹️ Stop Server',
      value: 'stop',
      description: 'Stop a running MCP server',
    },
    {
      label: '➕ Add New Server',
      value: 'add',
      description: 'Configure and add a new MCP server',
    },
    {
      label: '🔧 Server Configuration',
      value: 'config',
      description: 'Modify server settings and parameters',
    },
    {
      label: '📜 View Logs',
      value: 'logs',
      description: 'Display server logs and activity',
    },
    {
      label: '🔙 Back to Main Menu',
      value: 'back',
      description: 'Return to the main menu',
    },
  ];

  const handleSelect = (item: MenuItem) => {
    setSelectedAction(item.value);

    switch (item.value) {
      case 'back':
        onBack();
        break;
      case 'status':
        // Handle status view
        break;
      case 'start':
      case 'stop':
      case 'add':
      case 'config':
      case 'logs':
        // Handle other actions
        break;
      default:
        break;
    }
  };

  const getServerStatusBadge = (server: MCPServer) => {
    const statusMap = {
      running: { status: 'active', text: 'Running' },
      stopped: { status: 'idle', text: 'Stopped' },
      error: { status: 'error', text: 'Error' },
    };

    const { status, text } = statusMap[server.status];
    return (
      <StatusBadge
        status={status as any}
        text={text}
        variant="minimal"
      />
    );
  };

  const renderServersTable = () => (
    <Box
      flexDirection="column"
      marginBottom={2}
    >
      <Text bold>📋 MCP Servers:</Text>
      <Box marginBottom={1} />

      {servers.map((server) => (
        <Box
          key={server.name}
          justifyContent="space-between"
          marginBottom={1}
        >
          <Box
            flexDirection="column"
            width="60%"
          >
            <Text
              bold
              color="cyan"
            >
              {server.name}
            </Text>
            <Text dimColor>
              {server.protocol.toUpperCase()}
              {server.port ? ` :${server.port}` : ''} • {server.tools} tools
            </Text>
          </Box>
          <Box alignItems="center">{getServerStatusBadge(server)}</Box>
        </Box>
      ))}
    </Box>
  );

  if (isLoading) {
    return (
      <Box
        flexDirection="column"
        height="100%"
      >
        <Header
          title="MCP Servers"
          swarmStatus={swarmStatus}
          showBorder={true}
        />
        <Box
          flexGrow={1}
          justifyContent="center"
          alignItems="center"
        >
          <LoadingSpinner text="Loading MCP servers..." />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      height="100%"
    >
      <Header
        title="MCP Servers Management"
        swarmStatus={swarmStatus}
        showBorder={true}
      />

      <Box
        flexGrow={1}
        paddingX={2}
      >
        <Box
          flexDirection="column"
          width="100%"
        >
          {renderServersTable()}

          <Text bold>Select an action:</Text>
          <Box marginBottom={1} />

          <SelectInput
            items={menuItems}
            onSelect={handleSelect}
            itemComponent={({ isSelected, label }) => (
              <Text color={isSelected ? 'cyan' : 'white'}>
                {isSelected ? '▶ ' : '  '}
                {label}
              </Text>
            )}
          />
        </Box>
      </Box>

      <InteractiveFooter
        currentScreen="MCP Servers"
        availableScreens={[
          { key: '↑↓', name: 'Navigate' },
          { key: 'Enter', name: 'Select' },
          { key: 'Esc/Q', name: 'Back' },
        ]}
        status={`${servers.filter((s) => s.status === 'running').length}/${servers.length} running`}
      />
    </Box>
  );
};

export default MCPServers;
