#!/usr/bin/env node

import { Box, Text, useInput, render } from 'ink';
import React, { useEffect, useState } from 'react';
import { visionAPI } from './shared/vision-api.js';

/** Ink-based TUI Dashboard - Modern replacement for blessed
 * Features vision roadmaps, swarm monitoring, and system metrics
 */

interface Vision {
  id: string;
  name: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  phases: Array<{
    name: string;
    status: 'completed' | 'in_progress' | 'pending';
    progress?: number;
  }>;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error';
}

interface SwarmData {
  agents: Agent[];
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
}

interface SystemMetrics {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

const VisionDashboard: React.FC = () => {
  const [visions, setVisions] = useState<Vision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVisions = async () => {
      try {
        const data = await visionAPI.fetchVisions();
        setVisions(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load visions:', error);
        setLoading(false);
      }
    };

    loadVisions();
    const interval = setInterval(loadVisions, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return React.createElement(Box, { justifyContent: 'center' },
      React.createElement(Text, null, 'Loading visions...')
    );
  }

  if (visions.length === 0) {
    return React.createElement(Box, { justifyContent: 'center' },
      React.createElement(Text, null, 'No visions available')
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      default: return 'white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const calculateProgress = (phases: Vision['phases']) => {
    if (!phases?.length) return 0;
    const totalProgress = phases.reduce((sum, phase) => sum + (phase.progress ?? 0), 0);
    return Math.round(totalProgress / phases.length);
  };

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Box, { marginBottom: 1 },
      React.createElement(Text, { bold: true }, 'Vision Roadmaps')
    ),
    ...visions.map((vision) =>
      React.createElement(Box, { key: vision.id, flexDirection: 'column', marginBottom: 1 },
        React.createElement(Box, null,
          React.createElement(Text, { color: getStatusColor(vision.status) }, vision.name),
          React.createElement(Text, null, ` ${getPriorityIcon(vision.priority)} `),
          React.createElement(Text, { dimColor: true }, `${calculateProgress(vision.phases)}%`)
        ),
        React.createElement(Text, { dimColor: true }, vision.description),
        React.createElement(Text, { dimColor: true }, 
          vision.phases.find(p => p.status === 'in_progress')?.name ??
          vision.phases.find(p => p.status === 'pending')?.name ??
          'All phases complete'
        )
      )
    )
  );
};

const SwarmMonitor: React.FC = () => {
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
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
        setLoading(false);
      } catch (error) {
        console.error('Failed to update swarm data:', error);
        setLoading(false);
      }
    };

    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return React.createElement(Box, { justifyContent: 'center' },
      React.createElement(Text, null, 'Loading swarm data...')
    );
  }

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'idle': return 'yellow';
      case 'error': return 'red';
      default: return 'white';
    }
  };

  const getAgentIcon = (name: string) => {
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
      React.createElement(Text, { bold: true }, 'Swarm Status')
    ),
    swarmData?.agents && swarmData.agents.length > 0 ?
      swarmData.agents.map((agent, index) =>
        React.createElement(Box, { key: agent.id || index },
          React.createElement(Text, null, `${getAgentIcon(agent.name)} `),
          React.createElement(Text, { color: getAgentStatusColor(agent.status) }, agent.name),
          React.createElement(Text, { dimColor: true }, ` (${agent.type})`)
        )
      ) :
      React.createElement(Text, { dimColor: true }, 'No active agents')
  );
};

const TABS = [
  { id: 'visions', label: 'Visions', component: VisionDashboard },
  { id: 'swarm', label: 'Swarm', component: SwarmMonitor }
];

const InkDashboard: React.FC = () => {
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
  const uptime = Date.now() - startTime.getTime();
  const minutes = Math.floor(uptime / 60000);
  const seconds = Math.floor((uptime % 60000) / 1000);
  const uptimeString = `${minutes}m ${seconds}s`;

  return React.createElement(Box, { flexDirection: 'column' },
    React.createElement(Box, { paddingX: 2, paddingY: 1 },
      React.createElement(Text, { bold: true }, `Claude Flow Dashboard - Uptime: ${uptimeString}`)
    ),
    React.createElement(Box, null,
      TABS.map((tab, index) =>
        React.createElement(Box, {
          key: tab.id,
          paddingX: 2,
          backgroundColor: tab.id === activeTab ? 'blue' : undefined
        },
          React.createElement(Text, null, `${index + 1}. ${tab.label}`)
        )
      )
    ),
    React.createElement(Box, { flex: 1, padding: 1 },
      activeTabData ? React.createElement(activeTabData.component) : null
    ),
    React.createElement(Box, { paddingX: 2 },
      React.createElement(Text, { dimColor: true }, 
        'Press 1-2 for tabs, ←→ to navigate, q or Ctrl+C to exit'
      )
    )
  );
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

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  render(React.createElement(InkDashboard));
}

export default InkDashboard;