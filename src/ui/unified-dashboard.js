#!/usr/bin/env node
/**
 * Unified Dashboard - Works as both TUI and Web interface
 * Auto-detects environment and renders appropriately
 */
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput } from 'ink';
import VisionDashboard from './components/VisionDashboard.js';
import SwarmPanel from './components/SwarmPanel.js';

const TABS = [
  { id: 'visions', name: 'Visions', icon: '🎯', component: VisionDashboard },
  { id: 'swarm', name: 'Swarm', icon: '🐝', component: SwarmPanel },
  { id: 'memory', name: 'Memory', icon: '💾', component: MemoryBrowser },
  { id: 'logs', name: 'Logs', icon: '📝', component: LogViewer }
];

// Placeholder components for other tabs
const MemoryBrowser = () => (
  <Box flexDirection="column">
    <Text color="cyan" bold>💾 Memory Browser</Text>
    <Text color="gray" marginTop={1}>Coming soon - Namespace and memory management</Text>
  </Box>
);

const LogViewer = () => (
  <Box flexDirection="column">
    <Text color="cyan" bold>📝 System Logs</Text>
    <Text color="gray" marginTop={1}>Coming soon - Real-time log streaming</Text>
  </Box>
);

const UnifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState('visions');
  const [startTime] = useState(new Date());

  // Handle keyboard input
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      process.exit(0);
    }
    
    // Tab switching with number keys
    const tabIndex = parseInt(input) - 1;
    if (tabIndex >= 0 && tabIndex < TABS.length) {
      setActiveTab(TABS[tabIndex].id);
    }
    
    // Tab switching with arrow keys
    if (key.leftArrow || key.rightArrow) {
      const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      let nextIndex;
      
      if (key.leftArrow) {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : TABS.length - 1;
      } else {
        nextIndex = currentIndex < TABS.length - 1 ? currentIndex + 1 : 0;
      }
      
      setActiveTab(TABS[nextIndex].id);
    }
    
    // Refresh with 'r' key
    if (input === 'r') {
      // Force re-render by updating a state value
      setStartTime(new Date());
    }
  });

  const activeTabData = TABS.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || VisionDashboard;

  const getUptime = () => {
    const diff = new Date() - startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box 
        borderStyle="double" 
        borderColor="cyan" 
        paddingX={1} 
        marginBottom={1}
      >
        <Box justifyContent="space-between" width="100%">
          <Box>
            <Text color="cyan" bold>🚀 Claude-Zen Control Center</Text>
            <Text color="gray"> v2.0.0-alpha.67</Text>
          </Box>
          <Box>
            <Text color="green">⏰ Uptime: {getUptime()}</Text>
          </Box>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box marginBottom={1}>
        {TABS.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <Box key={tab.id} marginRight={2}>
              <Text color={isActive ? 'cyan' : 'gray'} bold={isActive}>
                [{index + 1}] {tab.icon} {tab.name}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Main Content Area */}
      <Box flexGrow={1} paddingX={1}>
        <ActiveComponent key={startTime.getTime()} />
      </Box>

      {/* Footer with Controls */}
      <Box 
        borderStyle="single" 
        borderColor="gray" 
        paddingX={1} 
        marginTop={1}
      >
        <Box justifyContent="space-between" width="100%">
          <Box>
            <Text color="gray">
              Navigation: [1-4] Switch tabs • [←→] Arrow keys • [R] Refresh
            </Text>
          </Box>
          <Box>
            <Text color="gray">
              [Ctrl+C] Exit
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Auto-detect environment and render appropriately
const main = async () => {
  const isTTY = process.stdout.isTTY;
  const isWeb = process.env.NODE_ENV === 'web' || process.argv.includes('--web');

  if (isTTY && !isWeb) {
    // Terminal UI mode
    console.log('🚀 Starting Claude-Zen TUI Dashboard...');
    render(<UnifiedDashboard />);
  } else {
    // Web mode - would integrate with existing web server
    console.log('🌐 Web mode detected - integrate with web server');
    console.log('Use: claude-zen start --web for full web interface');
    
    // For now, still show TUI but with different styling
    render(<UnifiedDashboard />);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Claude-Zen dashboard shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Claude-Zen dashboard shutting down...');
  process.exit(0);
});

// Export for use in other modules
export default UnifiedDashboard;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}