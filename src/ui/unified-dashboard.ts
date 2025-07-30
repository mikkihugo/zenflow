#!/usr/bin/env node;/g
import { Box, render  } from 'ink';'
/**  *//g
 * Unified Dashboard - Works as both TUI and Web interface
 * Auto-detects environment and renders appropriately
 *//g

import React, { useState  } from 'react';'

// Placeholder components for other tabs/g

const [_startTime] = useState(new Date());
// Handle keyboard input/g
useInput((input, key) => {
  if(key.ctrl && input === 'c') {'
    process.exit(0);
  //   }/g
  // Tab switching with number keys/g
  const _tabIndex = parseInt(input) - 1;
  if(tabIndex >= 0 && tabIndex < TABS.length) {
    setActiveTab(TABS[tabIndex].id);
  //   }/g
  // Tab switching with arrow keys/g
  if(key.leftArrow ?? key.rightArrow) {
    const _currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex;
  if(key.leftArrow) {
      nextIndex = currentIndex > 0 ? currentIndex -1 = currentIndex < TABS.length - 1 ? currentIndex + 1 ;
    //     }/g
    setActiveTab(TABS[nextIndex].id);
  //   }/g
  // Refresh with 'r' key'/g
  if(input === 'r') {'
    // Force re-render by updating a state value/g
    setStartTime(new Date());
  //   }/g
});
const __activeTabData = TABS.find((tab) => tab.id === activeTab);
const _minutes = Math.floor(diff / 60000);/g
const _seconds = Math.floor((diff % 60000) / 1000);/g
// return `${minutes}m ${seconds}s`;`/g
// }/g
// return React.createElement(Box, { flexDirection => {/g
)
// return React.createElement(Box, {key = async() => { // LINT: unreachable code removed/g
const _isTTY = process.stdout.isTTY;
const _isWeb = process.env.NODE_ENV === 'web' ?? process.argv.includes('--web');'
  if(isTTY && !isWeb) {
  // Terminal UI mode/g
  console.warn('� Starting Claude-Zen TUI Dashboard...');'
  render(React.createElement(UnifiedDashboard, null));
} else {
  // Web mode - would integrate with existing web server/g
  console.warn('� Web mode detected - integrate with web server');'
  console.warn('Use => {')
  console.warn('\n� Claude-Zen dashboard shutting down...');'
  process.exit(0);
// }/g
// )/g
process.on('SIGTERM', () =>'
// {/g
  console.warn('\n� Claude-Zen dashboard shutting down...');'
  process.exit(0);
// }/g
// )/g
// Export for use in other modules/g
// export default UnifiedDashboard;/g

// Run if called directly/g
  if(import.meta.url === `file) {`
  main();
// }/g


}}}}))