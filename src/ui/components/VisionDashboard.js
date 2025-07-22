/**
 * Vision Dashboard Component - Works in both TUI and Web
 */
import React, { useState, useEffect } from 'react';
import { Box, Text, Static } from 'ink';
import { visionAPI } from '../shared/vision-api.js';

const VisionDashboard = () => {
  const [visions, setVisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadVisions, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box justifyContent="center">
        <Text color="yellow">🔄 Loading visions...</Text>
      </Box>
    );
  }

  if (visions.length === 0) {
    return (
      <Box justifyContent="center">
        <Text color="gray">📝 No visions found. Create one to get started!</Text>
      </Box>
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

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text color="cyan" bold>🎯 Vision Dashboard ({visions.length} visions)</Text>
      </Box>

      <Static items={visions}>
        {(vision, index) => {
          const isSelected = index === selectedIndex;
          const progressPercent = getPhaseProgress(vision.phases);
          
          return (
            <Box
              key={vision.id}
              flexDirection="column"
              borderStyle="round"
              borderColor={isSelected ? 'cyan' : 'gray'}
              paddingX={1}
              paddingY={0}
              marginBottom={1}
            >
              <Box justifyContent="space-between">
                <Box>
                  <Text color="white" bold>{vision.title}</Text>
                  <Text color="gray"> • {vision.category}</Text>
                </Box>
                <Box>
                  <Text>{getPriorityIcon(vision.priority)} </Text>
                  <Text color={getStatusColor(vision.status)} bold>
                    {vision.status.toUpperCase()}
                  </Text>
                </Box>
              </Box>

              <Box marginTop={0} marginBottom={0}>
                <Text color="gray" wrap="wrap">
                  {vision.description.length > 80 
                    ? vision.description.substring(0, 80) + '...' 
                    : vision.description
                  }
                </Text>
              </Box>

              <Box justifyContent="space-between">
                <Box>
                  <Text color="green">💰 ROI: </Text>
                  <Text color="white" bold>{vision.expected_roi}</Text>
                </Box>
                <Box>
                  <Text color="blue">📊 Progress: </Text>
                  <Text color="white" bold>{progressPercent}%</Text>
                </Box>
              </Box>

              {vision.phases && vision.phases.length > 0 && (
                <Box marginTop={0}>
                  <Text color="yellow">🔄 Current Phase: </Text>
                  <Text color="white">
                    {vision.phases.find(p => p.status === 'in_progress')?.name || 
                     vision.phases.find(p => p.status === 'pending')?.name ||
                     'All phases complete'}
                  </Text>
                </Box>
              )}
            </Box>
          );
        }}
      </Static>

      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray">
          💡 Use arrow keys to navigate • Press Enter to view details • Press R to refresh
        </Text>
      </Box>
    </Box>
  );
};

export default VisionDashboard;