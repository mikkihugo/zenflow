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
    return React.createElement(Box, { justifyContent: "center" },
      React.createElement(Text, { color: "yellow" }, "🔄 Loading visions...")
    );
  }

  if (visions.length === 0) {
    return React.createElement(Box, { justifyContent: "center" },
      React.createElement(Text, { color: "gray" }, "📝 No visions found. Create one to get started!")
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

  return React.createElement(Box, { flexDirection: "column" },
    React.createElement(Box, { marginBottom: 1 },
      React.createElement(Text, { color: "cyan", bold: true },
        `🎯 Vision Dashboard (${visions.length} visions)`,
        isWeb() && React.createElement("span", null, " - Web Mode"),
        isTUI() && React.createElement("span", null, " - Terminal Mode")
      )
    ),

    isWeb() && React.createElement(Box, {
      style: { 
        background: 'linear-gradient(90deg, #1a1a2e, #16213e)',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '10px'
      }
    },
      React.createElement(Text, { color: "cyan" }, "🌐 Web Interface Active - Full feature set available")
    ),

    React.createElement(Static, { items: visions }, (vision, index) => {
      const isSelected = index === selectedIndex;
      const progressPercent = getPhaseProgress(vision.phases);
      
      return React.createElement(Box, {
        key: vision.id,
        flexDirection: "column",
        borderStyle: "round",
        borderColor: isSelected ? 'cyan' : 'gray',
        paddingX: 1,
        paddingY: 0,
        marginBottom: 1,
        style: isWeb() ? {
          backgroundColor: isSelected ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '12px',
          transition: 'all 0.3s ease'
        } : {}
      },
        React.createElement(Box, { justifyContent: "space-between" },
          React.createElement(Box, null,
            React.createElement(Text, { color: "white", bold: true }, vision.title),
            React.createElement(Text, { color: "gray" }, ` • ${vision.category}`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, null, `${getPriorityIcon(vision.priority)} `),
            React.createElement(Text, { color: getStatusColor(vision.status), bold: true },
              vision.status.toUpperCase()
            )
          )
        ),

        React.createElement(Box, { marginTop: 0, marginBottom: 0 },
          React.createElement(Text, { color: "gray", wrap: "wrap" },
            vision.description.length > 80 
              ? vision.description.substring(0, 80) + '...' 
              : vision.description
          )
        ),

        React.createElement(Box, { justifyContent: "space-between" },
          React.createElement(Box, null,
            React.createElement(Text, { color: "green" }, "💰 ROI: "),
            React.createElement(Text, { color: "white", bold: true }, vision.expected_roi)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "blue" }, "📊 Progress: "),
            React.createElement(Text, { color: "white", bold: true }, `${progressPercent}%`),
            isWeb() && React.createElement("div", {
              style: {
                width: '100px',
                height: '4px',
                backgroundColor: '#333',
                borderRadius: '2px',
                marginLeft: '8px',
                overflow: 'hidden'
              }
            },
              React.createElement("div", {
                style: {
                  width: `${progressPercent}%`,
                  height: '100%',
                  backgroundColor: '#00ff00',
                  transition: 'width 0.3s ease'
                }
              })
            )
          )
        ),

        vision.phases && vision.phases.length > 0 && React.createElement(Box, { marginTop: 0 },
          React.createElement(Text, { color: "yellow" }, "🔄 Current Phase: "),
          React.createElement(Text, { color: "white" },
            vision.phases.find(p => p.status === 'in_progress')?.name || 
            vision.phases.find(p => p.status === 'pending')?.name ||
            'All phases complete'
          ),
          
          isWeb() && React.createElement("div", {
            style: { marginTop: '8px', display: 'flex', gap: '4px' }
          },
            vision.phases.map((phase, i) => React.createElement("div", {
              key: i,
              style: {
                width: '20px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: 
                  phase.status === 'completed' ? '#00ff00' :
                  phase.status === 'in_progress' ? '#ffff00' : '#333'
              }
            }))
          )
        ),

        isWeb() && React.createElement(Box, { marginTop: 1, style: { display: 'flex', gap: '8px' } },
          React.createElement("button", {
            style: {
              background: '#0066cc',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            },
            onClick: () => console.log('Generate roadmap for:', vision.id)
          }, "📋 Generate Roadmap"),
          React.createElement("button", {
            style: {
              background: '#cc6600',
              color: 'white', 
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            },
            onClick: () => console.log('Edit vision:', vision.id)
          }, "✏️ Edit")
        )
      );
    }),

    React.createElement(Box, { marginTop: 1, borderStyle: "single", borderColor: "gray", paddingX: 1 },
      React.createElement(Text, { color: "gray" },
        isTUI() && '💡 TUI: [↑↓] Navigate • [R] Refresh • [Enter] Details',
        isWeb() && '💡 Web: Click buttons • Keyboard shortcuts active'
      )
    )
  );

};

export default UniversalVisionDashboard;