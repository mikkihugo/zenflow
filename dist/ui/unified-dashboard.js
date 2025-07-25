#!/usr/bin/env node
/**
 * Unified Dashboard - Works as both TUI and Web interface
 * Auto-detects environment and renders appropriately
 */
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput } from 'ink';
import VisionDashboard from './components/VisionDashboard.js';
import HiveMindPanel from './components/SwarmPanel.js';

// Placeholder components for other tabs
const MemoryBrowser = () => React.createElement(Box, { flexDirection: "column" },
  React.createElement(Text, { color: "cyan", bold: true }, "💾 Memory Browser"),
  React.createElement(Text, { color: "gray", marginTop: 1 }, "Coming soon - Namespace and memory management")
);

const LogViewer = () => React.createElement(Box, { flexDirection: "column" },
  React.createElement(Text, { color: "cyan", bold: true }, "📝 System Logs"),
  React.createElement(Text, { color: "gray", marginTop: 1 }, "Coming soon - Real-time log streaming")
);

const TABS = [
  { id: 'visions', name: 'Visions', icon: '🎯', component: VisionDashboard },
  { id: 'hive-mind', name: 'Hive-Mind', icon: '🐝', component: HiveMindPanel },
  { id: 'memory', name: 'Memory', icon: '💾', component: MemoryBrowser },
  { id: 'logs', name: 'Logs', icon: '📝', component: LogViewer }
];

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

  return React.createElement(Box, { flexDirection: "column", height: "100%" },
    React.createElement(Box, { 
      borderStyle: "double", 
      borderColor: "cyan", 
      paddingX: 1, 
      marginBottom: 1
    },
      React.createElement(Box, { justifyContent: "space-between", width: "100%" },
        React.createElement(Box, null,
          React.createElement(Text, { color: "cyan", bold: true }, "🚀 Claude-Zen Control Center"),
          React.createElement(Text, { color: "gray" }, " v2.0.0-alpha.67")
        ),
        React.createElement(Box, null,
          React.createElement(Text, { color: "green" }, `⏰ Uptime: ${getUptime()}`)
        )
      )
    ),

    React.createElement(Box, { marginBottom: 1 },
      TABS.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return React.createElement(Box, { key: tab.id, marginRight: 2 },
          React.createElement(Text, { color: isActive ? 'cyan' : 'gray', bold: isActive },
            `[${index + 1}] ${tab.icon} ${tab.name}`
          )
        );
      })
    ),

    React.createElement(Box, { flexGrow: 1, paddingX: 1 },
      React.createElement(ActiveComponent, { key: startTime.getTime() })
    ),

    React.createElement(Box, { 
      borderStyle: "single", 
      borderColor: "gray", 
      paddingX: 1, 
      marginTop: 1
    },
      React.createElement(Box, { justifyContent: "space-between", width: "100%" },
        React.createElement(Box, null,
          React.createElement(Text, { color: "gray" },
            "Navigation: [1-4] Switch tabs • [←→] Arrow keys • [R] Refresh"
          )
        ),
        React.createElement(Box, null,
          React.createElement(Text, { color: "gray" },
            "[Ctrl+C] Exit"
          )
        )
      )
    )
  );
};

// Auto-detect environment and render appropriately
const main = async () => {
  const isTTY = process.stdout.isTTY;
  const isWeb = process.env.NODE_ENV === 'web' || process.argv.includes('--web');

  if (isTTY && !isWeb) {
    // Terminal UI mode
    console.log('🚀 Starting Claude-Zen TUI Dashboard...');
    render(React.createElement(UnifiedDashboard, null));
  } else {
    // Web mode - would integrate with existing web server
    console.log('🌐 Web mode detected - integrate with web server');
    console.log('Use: claude-zen start --web for full web interface');
    
    // For now, still show TUI but with different styling
    render(React.createElement(UnifiedDashboard, null));
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