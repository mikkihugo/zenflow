#!/usr/bin/env node

/**
 * Simplified Swarm TUI - Interactive Terminal Interface for Swarm Management
 * Basic implementation without complex dependencies
 */

import React, { useState, useEffect } from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';

// Simple swarm status display
const SwarmStatus: React.FC<{ status: any }> = ({ status }) => (
  <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
    <Text color="cyan" bold>🐝 Swarm Status</Text>
    <Text>Active Swarms: {status.activeSwarms || 0}</Text>
    <Text>Total Agents: {status.totalAgents || 0}</Text>
    <Text>Active Tasks: {status.activeTasks || 0}</Text>
    <Text>Success Rate: {status.metrics?.successRate || 0}%</Text>
  </Box>
);

// Simple menu component
const SwarmMenu: React.FC<{ onSelect: (action: string) => void }> = ({ onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const menuItems = [
    { label: '🚀 Initialize Swarm', value: 'init' },
    { label: '🤖 Spawn Agent', value: 'spawn' },
    { label: '📋 Create Task', value: 'task' },
    { label: '📊 View Status', value: 'status' },
    { label: '❌ Exit', value: 'exit' }
  ];

  useInput((input, key) => {
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (key.downArrow && selectedIndex < menuItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (key.return) {
      onSelect(menuItems[selectedIndex].value);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="yellow" bold>Select an action:</Text>
      {menuItems.map((item, index) => (
        <Text
          key={item.value}
          color={index === selectedIndex ? 'cyan' : 'white'}
          backgroundColor={index === selectedIndex ? 'blue' : undefined}
        >
          {index === selectedIndex ? '> ' : '  '}{item.label}
        </Text>
      ))}
    </Box>
  );
};

// Main TUI application
const SwarmTUI: React.FC = () => {
  const { exit } = useApp();
  const [currentView, setCurrentView] = useState<'menu' | 'status' | 'loading'>('menu');
  const [status, setStatus] = useState<any>({
    activeSwarms: 0,
    totalAgents: 0,
    activeTasks: 0,
    metrics: { successRate: 100 }
  });

  const handleMenuSelect = async (action: string) => {
    switch (action) {
      case 'init':
        setCurrentView('loading');
        // Simulate swarm initialization
        setTimeout(() => {
          setStatus(prev => ({ ...prev, activeSwarms: prev.activeSwarms + 1 }));
          setCurrentView('menu');
        }, 2000);
        break;
        
      case 'spawn':
        setCurrentView('loading');
        // Simulate agent spawning
        setTimeout(() => {
          setStatus(prev => ({ ...prev, totalAgents: prev.totalAgents + 1 }));
          setCurrentView('menu');
        }, 1500);
        break;
        
      case 'task':
        setCurrentView('loading');
        // Simulate task creation
        setTimeout(() => {
          setStatus(prev => ({ ...prev, activeTasks: prev.activeTasks + 1 }));
          setCurrentView('menu');
        }, 1000);
        break;
        
      case 'status':
        setCurrentView('status');
        break;
        
      case 'exit':
        exit();
        break;
    }
  };

  useInput((input, key) => {
    if (key.escape || (input === 'q' && currentView !== 'menu')) {
      setCurrentView('menu');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="magenta" bold>
          🐝 Claude Flow - Direct Swarm Management TUI
        </Text>
      </Box>

      {currentView === 'menu' && (
        <SwarmMenu onSelect={handleMenuSelect} />
      )}

      {currentView === 'status' && (
        <Box flexDirection="column">
          <SwarmStatus status={status} />
          <Text color="gray" marginTop={1}>
            Press ESC or 'q' to return to menu
          </Text>
        </Box>
      )}

      {currentView === 'loading' && (
        <Box justifyContent="center" alignItems="center" padding={2}>
          <Text color="yellow">🔄 Processing...</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Use arrow keys to navigate, Enter to select, ESC to go back
        </Text>
      </Box>
    </Box>
  );
};

export function launchSwarmTUI() {
  console.log('🐝 Launching Simplified Swarm TUI...');
  render(<SwarmTUI />);
}

export default SwarmTUI;