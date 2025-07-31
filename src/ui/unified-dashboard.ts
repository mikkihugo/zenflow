#!/usr/bin/env node

import { Box, render } from 'ink';
import React, { useState } from 'react';
import { useInput } from 'ink';

/** Unified Dashboard - Works as both TUI and Web interface
 * Auto-detects environment and renders appropriately
 */

// Tab configuration
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'agents', label: 'Agents' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'memory', label: 'Memory' }
];

// Placeholder components for other tabs
const OverviewTab = () => React.createElement(Box, null, 'Overview Content');
const AgentsTab = () => React.createElement(Box, null, 'Agents Content');
const TasksTab = () => React.createElement(Box, null, 'Tasks Content');
const MemoryTab = () => React.createElement(Box, null, 'Memory Content');

const UnifiedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
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
      const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
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
      setActiveTab(activeTab);
    }
  });

  const activeTabData = TABS.find((tab) => tab.id === activeTab);
  const uptime = Date.now() - startTime.getTime();
  const minutes = Math.floor(uptime / 60000);
  const seconds = Math.floor((uptime % 60000) / 1000);
  const uptimeString = `${minutes}m ${seconds}s`;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return React.createElement(OverviewTab);
      case 'agents': return React.createElement(AgentsTab);
      case 'tasks': return React.createElement(TasksTab);
      case 'memory': return React.createElement(MemoryTab);
      default: return React.createElement(OverviewTab);
    }
  };

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Box, { paddingX: 2, paddingY: 1 },
      React.createElement('text', null, `Claude Flow Dashboard - Uptime: ${uptimeString}`)
    ),
    React.createElement(Box, null,
      TABS.map((tab, index) =>
        React.createElement(Box, { 
          key: tab.id,
          paddingX: 2,
          backgroundColor: tab.id === activeTab ? 'blue' : undefined
        },
          React.createElement('text', null, `${index + 1}. ${tab.label}`)
        )
      )
    ),
    React.createElement(Box, { flex: 1, padding: 1 },
      renderActiveTab()
    ),
    React.createElement(Box, { paddingX: 2 },
      React.createElement('text', null, 'Press 1-4 for tabs, ←→ to navigate, r to refresh, Ctrl+C to exit')
    )
  );
};

const main = async (): Promise<void> => {
  const isTTY = process.stdout.isTTY;
  const isWeb = process.env.NODE_ENV === 'web' || process.argv.includes('--web');
  
  if (isTTY && !isWeb) {
    // Terminal UI mode
    console.log('Starting Claude Flow TUI Dashboard...');
    render(React.createElement(UnifiedDashboard, null));
  } else {
    // Web mode - would integrate with existing web server
    console.log('Web mode detected - integrate with web server');
    console.log('Use --web flag or set NODE_ENV=web for web mode');
  }
};

// Graceful shutdown handlers
process.on('SIGINT', () => {
  console.log('\nClaude Flow dashboard shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nClaude Flow dashboard shutting down...');
  process.exit(0);
});

// Export for use in other modules
export default UnifiedDashboard;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}