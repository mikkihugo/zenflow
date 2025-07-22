/**
 * Swarm Status Panel - Unified TUI/Web Component
 */
import React, { useState, useEffect } from 'react';
import { Box, Text, Static } from 'ink';
import { visionAPI } from '../shared/vision-api.js';

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
    
    // Real-time updates every 2 seconds
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box justifyContent="center">
        <Text color="yellow">🔄 Loading swarm status...</Text>
      </Box>
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

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan" bold>🐝 Swarm Intelligence Center</Text>
      </Box>

      {/* System Metrics */}
      <Box borderStyle="round" borderColor="blue" paddingX={1} marginBottom={1}>
        <Box flexDirection="column" width="100%">
          <Text color="blue" bold>⚡ System Performance</Text>
          <Box justifyContent="space-between" marginTop={0}>
            <Box>
              <Text color="white">🖥️  CPU: </Text>
              <Text color={systemMetrics.cpu > 80 ? 'red' : systemMetrics.cpu > 60 ? 'yellow' : 'green'} bold>
                {systemMetrics.cpu}%
              </Text>
            </Box>
            <Box>
              <Text color="white">💾 Memory: </Text>
              <Text color="white" bold>{systemMetrics.memory}MB</Text>
            </Box>
            <Box>
              <Text color="white">⏰ Uptime: </Text>
              <Text color="green" bold>{systemMetrics.uptime}</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Agent Status */}
      <Box borderStyle="round" borderColor="green" paddingX={1} marginBottom={1}>
        <Box flexDirection="column" width="100%">
          <Text color="green" bold>🤖 Active Agents ({swarmData.agents?.length || 0})</Text>
          
          {swarmData.agents && swarmData.agents.length > 0 ? (
            <Static items={swarmData.agents}>
              {(agent, index) => (
                <Box key={agent.id} justifyContent="space-between" marginTop={index === 0 ? 0 : 0}>
                  <Box>
                    <Text>{getAgentIcon(agent.name)} </Text>
                    <Text color="white" bold>{agent.name}</Text>
                  </Box>
                  <Box>
                    <Text color={getAgentStatusColor(agent.status)} bold>
                      {agent.status.toUpperCase()}
                    </Text>
                    {agent.task && (
                      <Text color="gray"> • {agent.task}</Text>
                    )}
                  </Box>
                </Box>
              )}
            </Static>
          ) : (
            <Text color="gray" marginTop={0}>No active agents</Text>
          )}
        </Box>
      </Box>

      {/* Task Summary */}
      <Box borderStyle="round" borderColor="yellow" paddingX={1} marginBottom={1}>
        <Box flexDirection="column" width="100%">
          <Text color="yellow" bold>📋 Task Overview</Text>
          <Box justifyContent="space-between" marginTop={0}>
            <Box>
              <Text color="green">✅ Done: </Text>
              <Text color="white" bold>{swarmData.tasks?.completed || 0}</Text>
            </Box>
            <Box>
              <Text color="yellow">🔄 Active: </Text>
              <Text color="white" bold>{swarmData.tasks?.inProgress || 0}</Text>
            </Box>
            <Box>
              <Text color="gray">⏳ Queue: </Text>
              <Text color="white" bold>{swarmData.tasks?.pending || 0}</Text>
            </Box>
            <Box>
              <Text color="blue">📊 Total: </Text>
              <Text color="white" bold>{swarmData.tasks?.total || 0}</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Status Indicator */}
      <Box justifyContent="center" marginTop={1}>
        <Text color={swarmData.active ? 'green' : 'red'} bold>
          {swarmData.active ? '🟢 SWARM ACTIVE' : '🔴 SWARM INACTIVE'}
        </Text>
        <Text color="gray"> • Last update: {new Date().toLocaleTimeString()}</Text>
      </Box>
    </Box>
  );
};

export default SwarmPanel;