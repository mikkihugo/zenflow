#!/usr/bin/env node
/**
 * Ink-based TUI Dashboard - Modern replacement for blessed
 * Features vision roadmaps, swarm monitoring, and system metrics
 */
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, Static } from 'ink';
import { visionAPI } from './shared/vision-api.js';

const VisionDashboard = () => {
  const [visions, setVisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVisions = async () => {
      try {
        const data = await visionAPI.fetchVisions();
        setVisions(data);
      } catch (error) {
        console.error('Failed to load visions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVisions();
    const interval = setInterval(loadVisions, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return React.createElement(Box, { justifyContent: 'center' },
      React.createElement(Text, { color: 'yellow' }, '🔄 Loading visions...')
    );
  }

  if (visions.length === 0) {
    return React.createElement(Box, { justifyContent: 'center' },
      React.createElement(Text, { color: 'gray' }, '📝 No visions found. Create one to get started!')
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'yellow'; 
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getPhaseProgress = (phases) => {
    if (!phases?.length) return 0;
    const totalProgress = phases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
    return Math.round(totalProgress / phases.length);
  };

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Box, { marginBottom: 1 },
      React.createElement(Text, { color: 'cyan', bold: true }, `🎯 Vision Dashboard (${visions.length} visions)`)
    ),
    React.createElement(Static, { items: visions }, (vision, index) => {
      const progressPercent = getPhaseProgress(vision.phases);
      
      return React.createElement(Box, {
        key: vision.id,
        flexDirection: 'column',
        borderStyle: 'round',
        borderColor: 'gray',
        paddingX: 1,
        paddingY: 0,
        marginBottom: 1
      },
        React.createElement(Box, { justifyContent: 'space-between' },
          React.createElement(Box, null,
            React.createElement(Text, { color: 'white', bold: true }, vision.title),
            React.createElement(Text, { color: 'gray' }, ` • ${vision.category}`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, null, `${getPriorityIcon(vision.priority)} `),
            React.createElement(Text, { color: getStatusColor(vision.status), bold: true }, vision.status.toUpperCase())
          )
        ),
        React.createElement(Box, { marginTop: 0, marginBottom: 0 },
          React.createElement(Text, { color: 'gray', wrap: 'wrap' },
            vision.description.length > 80 ? vision.description.substring(0, 80) + '...' : vision.description
          )
        ),
        React.createElement(Box, { justifyContent: 'space-between' },
          React.createElement(Box, null,
            React.createElement(Text, { color: 'green' }, '💰 ROI: '),
            React.createElement(Text, { color: 'white', bold: true }, vision.expected_roi)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: 'blue' }, '📊 Progress: '),
            React.createElement(Text, { color: 'white', bold: true }, `${progressPercent}%`)
          )
        ),
        vision.phases && vision.phases.length > 0 && React.createElement(Box, { marginTop: 0 },
          React.createElement(Text, { color: 'yellow' }, '🔄 Current Phase: '),
          React.createElement(Text, { color: 'white' },
            vision.phases.find(p => p.status === 'in_progress')?.name || 
            vision.phases.find(p => p.status === 'pending')?.name ||
            'All phases complete'
          )
        )
      );
    }),
    React.createElement(Box, { marginTop: 1, borderStyle: 'single', borderColor: 'gray', paddingX: 1 },
      React.createElement(Text, { color: 'gray' }, '💡 Use arrow keys to navigate • Press R to refresh • Press Q to quit')
    )
  );
};

const SwarmPanel = () => {
  const [swarmData, setSwarmData] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateData = async () => {
      try {
        const [swarm, metrics] = await Promise.all([
          visionAPI.getSwarmStatus(),
          visionAPI.getSystemMetrics()
        ]);
        setSwarmData(swarm);
        setSystemMetrics(metrics);
      } catch (error) {
        console.error('Failed to update swarm data:', error);
      } finally {
        setLoading(false);
      }
    };

    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return React.createElement(Box, { justifyContent: 'center' },
      React.createElement(Text, { color: 'yellow' }, '🔄 Loading swarm status...')
    );
  }

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'idle': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getAgentIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'architect': return '🏗️';
      case 'coder': return '💻';
      case 'tester': return '🧪';
      case 'analyst': return '📊';
      case 'researcher': return '🔍';
      default: return '🤖';
    }
  };

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Box, { marginBottom: 1 },
      React.createElement(Text, { color: 'cyan', bold: true }, '🐝 Swarm Intelligence Center')
    ),
    
    // System Metrics
    React.createElement(Box, { borderStyle: 'round', borderColor: 'blue', paddingX: 1, marginBottom: 1 },
      React.createElement(Box, { flexDirection: 'column', width: '100%' },
        React.createElement(Text, { color: 'blue', bold: true }, '⚡ System Performance'),
        React.createElement(Box, { justifyContent: 'space-between', marginTop: 0 },
          React.createElement(Box, null,
            React.createElement(Text, { color: 'white' }, '🖥️  CPU: '),
            React.createElement(Text, { 
              color: systemMetrics.cpu > 80 ? 'red' : systemMetrics.cpu > 60 ? 'yellow' : 'green',
              bold: true 
            }, `${systemMetrics.cpu}%`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: 'white' }, '💾 Memory: '),
            React.createElement(Text, { color: 'white', bold: true }, `${systemMetrics.memory}MB`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: 'white' }, '⏰ Uptime: '),
            React.createElement(Text, { color: 'green', bold: true }, systemMetrics.uptime)
          )
        )
      )
    ),

    // Agent Status
    React.createElement(Box, { borderStyle: 'round', borderColor: 'green', paddingX: 1, marginBottom: 1 },
      React.createElement(Box, { flexDirection: 'column', width: '100%' },
        React.createElement(Text, { color: 'green', bold: true }, `🤖 Active Agents (${swarmData.agents?.length || 0})`),
        swarmData.agents && swarmData.agents.length > 0 ?
          React.createElement(Static, { items: swarmData.agents }, (agent, index) =>
            React.createElement(Box, { key: agent.id, justifyContent: 'space-between', marginTop: index === 0 ? 0 : 0 },
              React.createElement(Box, null,
                React.createElement(Text, null, `${getAgentIcon(agent.name)} `),
                React.createElement(Text, { color: 'white', bold: true }, agent.name)
              ),
              React.createElement(Box, null,
                React.createElement(Text, { color: getAgentStatusColor(agent.status), bold: true }, agent.status.toUpperCase()),
                agent.task && React.createElement(Text, { color: 'gray' }, ` • ${agent.task}`)
              )
            )
          ) :
          React.createElement(Text, { color: 'gray', marginTop: 0 }, 'No active agents')
      )
    ),

    // Task Summary
    React.createElement(Box, { borderStyle: 'round', borderColor: 'yellow', paddingX: 1, marginBottom: 1 },
      React.createElement(Box, { flexDirection: 'column', width: '100%' },
        React.createElement(Text, { color: 'yellow', bold: true }, '📋 Task Overview'),
        React.createElement(Box, { justifyContent: 'space-between', marginTop: 0 },
          React.createElement(Box, null,
            React.createElement(Text, { color: 'green' }, '✅ Done: '),
            React.createElement(Text, { color: 'white', bold: true }, `${swarmData.tasks?.completed || 0}`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: 'yellow' }, '🔄 Active: '),
            React.createElement(Text, { color: 'white', bold: true }, `${swarmData.tasks?.inProgress || 0}`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: 'gray' }, '⏳ Queue: '),
            React.createElement(Text, { color: 'white', bold: true }, `${swarmData.tasks?.pending || 0}`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: 'blue' }, '📊 Total: '),
            React.createElement(Text, { color: 'white', bold: true }, `${swarmData.tasks?.total || 0}`)
          )
        )
      )
    ),

    // Status Indicator
    React.createElement(Box, { justifyContent: 'center', marginTop: 1 },
      React.createElement(Text, { color: swarmData.active ? 'green' : 'red', bold: true },
        swarmData.active ? '🟢 SWARM ACTIVE' : '🔴 SWARM INACTIVE'
      ),
      React.createElement(Text, { color: 'gray' }, ` • Last update: ${new Date().toLocaleTimeString()}`)
    )
  );
};

const TABS = [
  { id: 'visions', name: 'Visions', icon: '🎯', component: VisionDashboard },
  { id: 'swarm', name: 'Swarm', icon: '🐝', component: SwarmPanel }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('visions');
  const [startTime] = useState(new Date());

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      process.exit(0);
    }
    
    if (input === 'q') {
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
  });

  const activeTabData = TABS.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || VisionDashboard;

  const getUptime = () => {
    const diff = new Date() - startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return React.createElement(Box, { flexDirection: 'column', height: '100%' },
    // Header
    React.createElement(Box, { 
      borderStyle: 'double', 
      borderColor: 'cyan', 
      paddingX: 1, 
      marginBottom: 1
    },
      React.createElement(Box, { justifyContent: 'space-between', width: '100%' },
        React.createElement(Box, null,
          React.createElement(Text, { color: 'cyan', bold: true }, '🚀 Claude-Zen Control Center'),
          React.createElement(Text, { color: 'gray' }, ' v2.0.0-alpha.67')
        ),
        React.createElement(Box, null,
          React.createElement(Text, { color: 'green' }, `⏰ Uptime: ${getUptime()}`)
        )
      )
    ),

    // Tab Navigation
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

    // Main Content Area
    React.createElement(Box, { flexGrow: 1, paddingX: 1 },
      React.createElement(ActiveComponent, { key: startTime.getTime() })
    ),

    // Footer
    React.createElement(Box, { 
      borderStyle: 'single', 
      borderColor: 'gray', 
      paddingX: 1, 
      marginTop: 1
    },
      React.createElement(Box, { justifyContent: 'space-between', width: '100%' },
        React.createElement(Box, null,
          React.createElement(Text, { color: 'gray' }, 'Navigation: [1-2] Switch tabs • [←→] Arrow keys • [R] Refresh')
        ),
        React.createElement(Box, null,
          React.createElement(Text, { color: 'gray' }, '[Q] or [Ctrl+C] Exit')
        )
      )
    )
  );
};

// Main execution
console.log('🚀 Starting Claude-Zen Ink Dashboard...');
render(React.createElement(Dashboard));

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Claude-Zen dashboard shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Claude-Zen dashboard shutting down...');
  process.exit(0);
});