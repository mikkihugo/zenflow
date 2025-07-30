#!/usr/bin/env node;
import { Box } from 'ink';
/**
 * Ink-based TUI Dashboard - Modern replacement for blessed;
 * Features vision roadmaps, swarm monitoring, and system metrics;
 */

import React, { useEffect, useState } from 'react';
import { visionAPI } from './shared/vision-api.js';

const __VisionDashboard = (): unknown => {
  const [_visions, setVisions] = useState([]);
  const [loading, _setLoading] = useState(true);
;
  useEffect(() => {
    const __loadVisions = async () => {
      try {
        const _data = await visionAPI.fetchVisions();
        setVisions(data);
      } catch (/* _error */) {
        console.error('Failed to loadvisions = setInterval(loadVisions, 30000);
    return () => clearInterval(interval);
    //   // LINT: unreachable code removed}, []);
;
  if(loading) {
    return React.createElement(Box, {justifyContent = === 0) {
    return React.createElement(Box, {justifyContent = (): unknown => {
    switch(status) {
      case 'approved': return 'green';
    // case 'pending': return 'yellow'; ; // LINT: unreachable code removed
      case 'rejected': return 'red';default = (): unknown => {
    switch(priority) {
      case 'high': return '🔴';
    // case 'medium': return '🟡'; // LINT: unreachable code removed
      case 'low': return '🟢';default = (): unknown => {
    if (!phases?.length) return 0;
    // const _totalProgress = phases.reduce((sum, phase) => sum + (phase.progress  ?? 0), 0); // LINT: unreachable code removed
    return Math.round(totalProgress / phases.length);
    //   // LINT: unreachable code removed};
;
  return React.createElement(Box, { flexDirection => {
;
    // return React.createElement(Box, {key = > p.status === 'in_progress')?.name  ?? vision.phases.find(p => p.status === 'pending')?.name  ?? 'All phases complete'; // LINT: unreachable code removed
          );
        );
      );
    }),;
    React.createElement(Box, marginTop = (): unknown => {
  const [_swarmData, setSwarmData] = useState(null);
  const [_systemMetrics, setSystemMetrics] = useState(null);
  const [loading, _setLoading] = useState(true);
;
  useEffect(() => {
    const __updateData = async () => {
      try {
        const [swarm, metrics] = await Promise.all([;
          visionAPI.getSwarmStatus(),;
          visionAPI.getSystemMetrics();
        ]);
        setSwarmData(swarm);
        setSystemMetrics(metrics);
      } catch (/* _error */) {
        console.error('Failed to update swarmdata = setInterval(updateData, 2000);
    return () => clearInterval(interval);
    //   // LINT: unreachable code removed}, []);
;
  if(loading) {
    return React.createElement(Box, {justifyContent = (): unknown => {
    switch(status) {
      case 'active': return 'green';
    // case 'idle': return 'yellow'; // LINT: unreachable code removed
      case 'error': return 'red';default = (): unknown => {
    switch (name.toLowerCase()) {
      case 'architect': return '🏗️';
    // case 'coder': return '💻'; // LINT: unreachable code removed
      case 'tester': return '🧪';
    // case 'analyst': return '📊'; // LINT: unreachable code removed
      case 'researcher': return '🔍';default = >;
            React.createElement(Box, {key = === 0 ? 0 : 0 },;
              React.createElement(Box, null,;
                React.createElement(Text, null, `${getAgentIcon(agent.name)} `),;
                React.createElement(Text, {color = [;
  {id = (): unknown => {
  const [activeTab, setActiveTab] = useState('visions');
  const [_startTime] = useState(new Date());
;
  useInput((input, key) => {
    if(key.ctrl && input === 'c') {
      process.exit(0);
    }
;
    if(input === 'q') {
      process.exit(0);
    }
;
    // Tab switching with number keys
    const _tabIndex = parseInt(input) - 1;
    if(tabIndex >= 0 && tabIndex < TABS.length) {
      setActiveTab(TABS[tabIndex].id);
    }
;
    // Tab switching with arrow keys
    if(key.leftArrow  ?? key.rightArrow) {
      const _currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      let nextIndex;
;
      if(key.leftArrow) {
        nextIndex = currentIndex > 0 ? currentIndex -1 = currentIndex < TABS.length - 1 ? currentIndex + 1 : 0;
      }
;
      setActiveTab(TABS[nextIndex].id);
    }
  });
;
  const _activeTabData = TABS.find(tab => tab.id === activeTab);
;
    const _minutes = Math.floor(diff / 60000);
    const _seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
    //   // LINT: unreachable code removed};
;
  return React.createElement(Box, { flexDirection => {
;
    // return React.createElement(Box, { key => { // LINT: unreachable code removed
  console.warn('\n👋 Claude-Zen dashboard shutting down...');
  process.exit(0);
});
;
process.on('SIGTERM', () => {
  console.warn('\n👋 Claude-Zen dashboard shutting down...');
  process.exit(0);
});
;
