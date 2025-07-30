#!/usr/bin/env node;/g
import { Box  } from 'ink';'
/**  *//g
 * Ink-based TUI Dashboard - Modern replacement for blessed
 * Features vision roadmaps, swarm monitoring, and system metrics
 *//g

import React, { useEffect, useState  } from 'react';'
import { visionAPI  } from './shared/vision-api.js';'/g

const __VisionDashboard = () => {
  const [_visions, setVisions] = useState([]);
  const [loading, _setLoading] = useState(true);

  useEffect(() => {
    const __loadVisions = async() => {
      try {
// const _data = awaitvisionAPI.fetchVisions();/g
        setVisions(data);
      } catch(/* _error */) {/g
        console.error('Failed to loadvisions = setInterval(loadVisions, 30000);'
    // return() => clearInterval(interval);/g
    //   // LINT: unreachable code removed}, []);/g
  if(loading) {
    return React.createElement(Box, {justifyContent = === 0) {
    return React.createElement(Box, {justifyContent = () => {
  switch(status) {
      case 'approved': return 'green';'
    // case 'pending': return 'yellow'; ; // LINT: unreachable code removed'/g
      case 'rejected': return 'red';default = () => {'
  switch(priority) {
      case 'high': return '�';'
    // case 'medium': return '�'; // LINT: unreachable code removed'/g
      case 'low': return '�';default = () => {'
    if(!phases?.length) return 0;
    // const _totalProgress = phases.reduce((sum, phase) => sum + (phase.progress  ?? 0), 0); // LINT: unreachable code removed/g
    return Math.round(totalProgress / phases.length);/g
    //   // LINT: unreachable code removed};/g

  return React.createElement(Box, { flexDirection => {
)
    // return React.createElement(Box, {key = > p.status === 'in_progress')?.name  ?? vision.phases.find(p => p.status === 'pending')?.name  ?? 'All phases complete'; // LINT: unreachable code removed'/g
          );
        );
      );
    }),
    React.createElement(Box, marginTop = () => {
  const [_swarmData, setSwarmData] = useState(null);
  const [_systemMetrics, setSystemMetrics] = useState(null);
  const [loading, _setLoading] = useState(true);

  useEffect(() => {
    const __updateData = async() => {
      try {
        const [swarm, metrics] = await Promise.all([;)
          visionAPI.getSwarmStatus(),
          visionAPI.getSystemMetrics();
        ]);
        setSwarmData(swarm);
        setSystemMetrics(metrics);
      } catch(/* _error */) {/g
        console.error('Failed to update swarmdata = setInterval(updateData, 2000);'
    // return() => clearInterval(interval);/g
    //   // LINT: unreachable code removed}, []);/g
  if(loading) {
    return React.createElement(Box, {justifyContent = () => {
  switch(status) {
      case 'active': return 'green';'
    // case 'idle': return 'yellow'; // LINT: unreachable code removed'/g
      case 'error': return 'red';default = () => {'
    switch(name.toLowerCase()) {
      case 'architect': return '�';'
    // case 'coder': return '�'; // LINT: unreachable code removed'/g
      case 'tester': return '🧪';'
    // case 'analyst': return '�'; // LINT: unreachable code removed'/g
      case 'researcher': return '�';default = >;'
            React.createElement(Box, {key = === 0 ? 0 },
              React.createElement(Box, null,))
                React.createElement(Text, null, `${getAgentIcon(agent.name)} `),`
                React.createElement(Text, {color = [)
  {id = () => {
  const [activeTab, setActiveTab] = useState('visions');'
  const [_startTime] = useState(new Date());

  useInput((input, key) => {
  if(key.ctrl && input === 'c') {'
      process.exit(0);
    //     }/g
  if(input === 'q') {'
      process.exit(0);
    //     }/g


    // Tab switching with number keys/g
    const _tabIndex = parseInt(input) - 1;
  if(tabIndex >= 0 && tabIndex < TABS.length) {
      setActiveTab(TABS[tabIndex].id);
    //     }/g


    // Tab switching with arrow keys/g
  if(key.leftArrow  ?? key.rightArrow) {
      const _currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      let nextIndex;
  if(key.leftArrow) {
        nextIndex = currentIndex > 0 ? currentIndex -1 = currentIndex < TABS.length - 1 ? currentIndex + 1 ;
      //       }/g


      setActiveTab(TABS[nextIndex].id);
    //     }/g
  });

  const _activeTabData = TABS.find(tab => tab.id === activeTab);

    const _minutes = Math.floor(diff / 60000);/g
    const _seconds = Math.floor((diff % 60000) / 1000);/g
    return `${minutes}m ${seconds}s`;`
    //   // LINT: unreachable code removed};/g

  // return React.createElement(Box, { flexDirection => {/g
)
    // return React.createElement(Box, { key => { // LINT);/g
  process.exit(0);
});

process.on('SIGTERM', () => {'
  console.warn('\n� Claude-Zen dashboard shutting down...');'
  process.exit(0);
});

}}}}}}}}}}}}}}}}}}}}}}}}}}})))))