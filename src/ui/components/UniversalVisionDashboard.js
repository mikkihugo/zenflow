/**
 * Universal Vision Dashboard - Works in TUI (Ink) and Web (React DOM)
 * Same component, automatically adapts rendering based on environment
 */
import React, { useState, useEffect } from 'react';
import {
  UniversalBox as Box,
  UniversalText as Text,
  UniversalStatic as Static,
  useUniversalInput,
  isWeb,
  isTUI
} from '../adapters/render-adapter.js';
import { visionAPI } from '../shared/vision-api.js';

const UniversalVisionDashboard = () => {
  const [visions, setVisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Same logic for both TUI and Web
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

  // Universal input handling (works in both TUI and Web)
  useUniversalInput((input, key) => {
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (key.downArrow && selectedIndex < visions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (input === 'r') {
      setLoading(true);
      visionAPI.fetchVisions().then(setVisions).finally(() => setLoading(false));
    }
  });

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
        <Text color="cyan" bold>
          🎯 Vision Dashboard ({visions.length} visions)
          {isWeb() && <span> - Web Mode</span>}
          {isTUI() && <span> - Terminal Mode</span>}
        </Text>
      </Box>

      {/* Web-specific additions */}
      {isWeb() && (
        <Box style={{ 
          background: 'linear-gradient(90deg, #1a1a2e, #16213e)',
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <Text color="cyan">🌐 Web Interface Active - Full feature set available</Text>
        </Box>
      )}

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
              style={isWeb() ? {
                backgroundColor: isSelected ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px',
                transition: 'all 0.3s ease'
              } : {}}
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
                  {isWeb() && (
                    <div style={{
                      width: '100px',
                      height: '4px',
                      backgroundColor: '#333',
                      borderRadius: '2px',
                      marginLeft: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        backgroundColor: '#00ff00',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}
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
                  
                  {/* Web-specific phase timeline */}
                  {isWeb() && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                      {vision.phases.map((phase, i) => (
                        <div
                          key={i}
                          style={{
                            width: '20px',
                            height: '4px',
                            borderRadius: '2px',
                            backgroundColor: 
                              phase.status === 'completed' ? '#00ff00' :
                              phase.status === 'in_progress' ? '#ffff00' : '#333'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </Box>
              )}

              {/* Web-specific interactive buttons */}
              {isWeb() && (
                <Box marginTop={1} style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      background: '#0066cc',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => console.log('Generate roadmap for:', vision.id)}
                  >
                    📋 Generate Roadmap
                  </button>
                  <button
                    style={{
                      background: '#cc6600',
                      color: 'white', 
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => console.log('Edit vision:', vision.id)}
                  >
                    ✏️ Edit
                  </button>
                </Box>
              )}
            </Box>
          );
        }}
      </Static>

      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray">
          {isTUI() && '💡 TUI: [↑↓] Navigate • [R] Refresh • [Enter] Details'}
          {isWeb() && '💡 Web: Click buttons • Keyboard shortcuts active'}
        </Text>
      </Box>
    </Box>
  );
};

export default UniversalVisionDashboard;