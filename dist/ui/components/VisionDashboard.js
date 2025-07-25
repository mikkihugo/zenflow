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
      React.createElement(Text, { color: "cyan", bold: true }, `🎯 Vision Dashboard (${visions.length} visions)`)
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
        marginBottom: 1
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
            React.createElement(Text, { color: "white", bold: true }, `${progressPercent}%`)
          )
        ),

        vision.phases && vision.phases.length > 0 && React.createElement(Box, { marginTop: 0 },
          React.createElement(Text, { color: "yellow" }, "🔄 Current Phase: "),
          React.createElement(Text, { color: "white" },
            vision.phases.find(p => p.status === 'in_progress')?.name || 
            vision.phases.find(p => p.status === 'pending')?.name ||
            'All phases complete'
          )
        )
      );
    }),

    React.createElement(Box, { marginTop: 1, borderStyle: "single", borderColor: "gray", paddingX: 1 },
      React.createElement(Text, { color: "gray" },
        "💡 Use arrow keys to navigate • Press Enter to view details • Press R to refresh"
      )
    )
  );
};

export default VisionDashboard;