/**
 * Help Screen.
 *
 * Documentation and help information interface.
 * Provides comprehensive system documentation and guides.
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import React from 'react';
import { useState } from 'react';
import {
  Header,
  InteractiveFooter,
  type SwarmStatus,
} from '../components/index/index.js';

export interface HelpProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

interface MenuItem {
  label: string;
  value: string;
  description?: string;
}

interface HelpTopic {
  title: string;
  content: string[];
}

export const Help: React.FC<HelpProps> = ({ swarmStatus, onBack, onExit }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('overview');

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }
  });

  const helpTopics: Record<string, HelpTopic> = {
    overview: {
      title: '🧠 Claude Code Zen Overview',
      content: [
        'Claude Code Zen is a comprehensive AI-powered development platform',
        'that combines swarm intelligence, neural coordination, and advanced',
        'automation capabilities.',
        '',
        '🐝 Swarm Intelligence: Coordinate multiple AI agents for complex tasks',
        '🧠 Neural Networks: Advanced pattern recognition and learning',
        '⚡ Automation: Smart automation and workflow orchestration',
        '🔗 Integration: Seamless integration with various AI models',
        '',
        'Use the navigation menu to explore different features and capabilities.',
      ],
    },
    swarm: {
      title: '🐝 Swarm Management',
      content: [
        'Swarm management allows you to create and coordinate multiple AI agents',
        'working together on complex tasks.',
        '',
        '📊 Dashboard: Real-time monitoring of swarm activities',
        '👥 Agents: Create, configure, and manage individual agents',
        '📋 Tasks: Assign and track task execution across agents',
        '🏗️ Topologies: Choose from mesh, hierarchical, ring, or star',
        '',
        'Key Commands:',
        '• 1-6: Navigate between swarm sections',
        '• R: Refresh real-time data',
        '• Esc/Q: Return to main menu',
      ],
    },
    mcp: {
      title: '🔗 MCP Servers',
      content: [
        'Model Context Protocol (MCP) servers provide external capabilities',
        'and tools for enhanced AI functionality.',
        '',
        '🚀 Server Management: Start, stop, and configure MCP servers',
        '📊 Status Monitoring: Track server health and performance',
        '🛠️ Tool Access: Access specialized tools and capabilities',
        '📜 Logging: View detailed server logs and activity',
        '',
        'Available Servers:',
        '• ruv-swarm: Swarm coordination and neural networks',
        '• claude-flow: Advanced workflow management',
        '• filesystem: File system operations and management',
      ],
    },
    workspace: {
      title: '📚 Workspace Management',
      content: [
        'Document-driven development workspace for managing projects',
        'and automated code generation.',
        '',
        '📂 Projects: Manage multiple development projects',
        '📝 Documents: Process documentation for code generation',
        '🔄 Automation: Automated synchronization and generation',
        '📊 Templates: Project templates and scaffolding',
        '',
        'Workflow:',
        '1. Initialize workspace with documents',
        '2. Process documents for analysis',
        '3. Generate code and artifacts',
        '4. Synchronize and maintain projects',
      ],
    },
    keyboard: {
      title: '⌨️ Keyboard Shortcuts',
      content: [
        'Global Shortcuts:',
        '• Esc/Q: Go back or exit current screen',
        '• ↑↓: Navigate menu items',
        '• Enter: Select menu item',
        '',
        'Main Menu:',
        '• 1: System Status',
        '• 2: Swarm Dashboard',
        '• 3: MCP Servers',
        '• 4: Workspace',
        '• 5: Settings',
        '• 6: Help',
        '',
        'Swarm Dashboard:',
        '• R: Refresh data',
        '• 1-6: Navigate sections',
        '',
        'All Screens:',
        '• Esc: Return to previous screen',
        '• Q: Quick exit',
      ],
    },
    troubleshooting: {
      title: '🔧 Troubleshooting',
      content: [
        'Common Issues and Solutions:',
        '',
        '❌ Swarm Not Starting:',
        '• Check MCP server status',
        '• Verify network connectivity',
        '• Review system logs',
        '',
        '❌ Agents Not Responding:',
        '• Increase timeout settings',
        '• Check agent configuration',
        '• Restart swarm if necessary',
        '',
        '❌ Performance Issues:',
        '• Reduce number of concurrent agents',
        '• Increase system resources',
        '• Enable performance optimizations',
        '',
        'For additional help, check the logs or contact support.',
      ],
    },
  };

  const menuItems: MenuItem[] = [
    {
      label: '🧠 System Overview',
      value: 'overview',
      description: 'Introduction to Claude Code Zen capabilities',
    },
    {
      label: '🐝 Swarm Management',
      value: 'swarm',
      description: 'Guide to swarm coordination and agent management',
    },
    {
      label: '🔗 MCP Servers',
      value: 'mcp',
      description: 'Model Context Protocol server documentation',
    },
    {
      label: '📚 Workspace',
      value: 'workspace',
      description: 'Document-driven development workflow',
    },
    {
      label: '⌨️ Keyboard Shortcuts',
      value: 'keyboard',
      description: 'Complete list of keyboard shortcuts and commands',
    },
    {
      label: '🔧 Troubleshooting',
      value: 'troubleshooting',
      description: 'Common issues and solutions',
    },
    {
      label: '🔙 Back to Main Menu',
      value: 'back',
      description: 'Return to the main menu',
    },
  ];

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'back') {
      onBack();
    } else {
      setSelectedTopic(item.value);
    }
  };

  const renderHelpContent = () => {
    const topic = helpTopics[selectedTopic];
    if (!topic) return null;

    return (
      <Box flexDirection="column" marginBottom={2}>
        <Text bold color="cyan">
          {topic.title}
        </Text>
        <Box marginBottom={1} />

        {topic.content.map((line, index) => (
          <Text key={index}>{line === '' ? ' ' : line}</Text>
        ))}
      </Box>
    );
  };

  return (
    <Box flexDirection="column" height="100%">
      <Header
        title="Help & Documentation"
        swarmStatus={swarmStatus}
        showBorder={true}
      />

      <Box flexGrow={1} paddingX={2}>
        <Box flexDirection="row" width="100%">
          {/* Left column - Menu */}
          <Box flexDirection="column" width="40%" paddingRight={2}>
            <Text bold>Select a help topic:</Text>
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

          {/* Right column - Content */}
          <Box
            flexDirection="column"
            width="60%"
            paddingLeft={2}
            borderLeft
            borderStyle="single"
            borderColor="gray"
          >
            {renderHelpContent()}
          </Box>
        </Box>
      </Box>

      <InteractiveFooter
        currentScreen="Help"
        availableScreens={[
          { key: '↑↓', name: 'Navigate' },
          { key: 'Enter', name: 'Select Topic' },
          { key: 'Esc/Q', name: 'Back' },
        ]}
        status={`Viewing: ${helpTopics[selectedTopic]?.title || 'Help'}`}
      />
    </Box>
  );
};

export default Help;
