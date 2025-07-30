#!/usr/bin/env node;
import { Box, render } from 'ink';
/**
 * Unified Dashboard - Works as both TUI and Web interface;
 * Auto-detects environment and renders appropriately;
 */

import React, { useState } from 'react';

// Placeholder components for other tabs

const [_startTime] = useState(new Date());
// Handle keyboard input
useInput((input, key) => {
  if (key.ctrl && input === 'c') {
    process.exit(0);
  }
  // Tab switching with number keys
  const _tabIndex = parseInt(input) - 1;
  if (tabIndex >= 0 && tabIndex < TABS.length) {
    setActiveTab(TABS[tabIndex].id);
  }
  // Tab switching with arrow keys
  if (key.leftArrow ?? key.rightArrow) {
    const _currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex;
    if (key.leftArrow) {
      nextIndex = currentIndex > 0 ? currentIndex -1 = currentIndex < TABS.length - 1 ? currentIndex + 1 : 0;
    }
    setActiveTab(TABS[nextIndex].id);
  }
  // Refresh with 'r' key
  if (input === 'r') {
    // Force re-render by updating a state value
    setStartTime(new Date());
  }
});
const __activeTabData = TABS.find((tab) => tab.id === activeTab);
const _minutes = Math.floor(diff / 60000);
const _seconds = Math.floor((diff % 60000) / 1000);
return `${minutes}m ${seconds}s`;
}
return React.createElement(Box, { flexDirection => {
;
// return React.createElement(Box, {key = async () => { // LINT: unreachable code removed
const _isTTY = process.stdout.isTTY;
const _isWeb = process.env.NODE_ENV === 'web' ?? process.argv.includes('--web');
if (isTTY && !isWeb) {
  // Terminal UI mode
  console.warn('🚀 Starting Claude-Zen TUI Dashboard...');
  render(React.createElement(UnifiedDashboard, null));
} else {
  // Web mode - would integrate with existing web server
  console.warn('🌐 Web mode detected - integrate with web server');
  console.warn('Use => {
  console.warn('\n👋 Claude-Zen dashboard shutting down...');
  process.exit(0);
}
)
process.on('SIGTERM', () =>
{
  console.warn('\n👋 Claude-Zen dashboard shutting down...');
  process.exit(0);
}
)
// Export for use in other modules
export default UnifiedDashboard;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
