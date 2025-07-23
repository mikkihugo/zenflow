/**
 * Hive-Mind Status Panel - Unified TUI/Web Component
 */
import React, { useState, useEffect } from 'react';
import { Box, Text, Static } from 'ink';
import { visionAPI } from '../shared/vision-api.js';

const HiveMindPanel = () => {
  const [hiveData, setHiveData] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateData = async () => {
      try {
        const [hive, metrics] = await Promise.all([
          visionAPI.getHiveStatus(),
          visionAPI.getSystemMetrics()
        ]);
        setHiveData(hive);
        setSystemMetrics(metrics);
      } catch (error) {
        console.error('Failed to update hive data:', error);
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
    return React.createElement(Box, { justifyContent: "center" },
      React.createElement(Text, { color: "yellow" }, "🔄 Loading hive-mind status...")
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

  return React.createElement(Box, { flexDirection: "column" },
    React.createElement(Box, { marginBottom: 1 },
      React.createElement(Text, { color: "cyan", bold: true }, "🐝 Hive-Mind Intelligence Center")
    ),

    React.createElement(Box, { borderStyle: "round", borderColor: "blue", paddingX: 1, marginBottom: 1 },
      React.createElement(Box, { flexDirection: "column", width: "100%" },
        React.createElement(Text, { color: "blue", bold: true }, "⚡ System Performance"),
        React.createElement(Box, { justifyContent: "space-between", marginTop: 0 },
          React.createElement(Box, null,
            React.createElement(Text, { color: "white" }, "🖥️  CPU: "),
            React.createElement(Text, { 
              color: systemMetrics.cpu > 80 ? 'red' : systemMetrics.cpu > 60 ? 'yellow' : 'green', 
              bold: true 
            }, `${systemMetrics.cpu}%`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "white" }, "💾 Memory: "),
            React.createElement(Text, { color: "white", bold: true }, `${systemMetrics.memory}MB`)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "white" }, "⏰ Uptime: "),
            React.createElement(Text, { color: "green", bold: true }, systemMetrics.uptime)
          )
        )
      )
    ),

    React.createElement(Box, { borderStyle: "round", borderColor: "green", paddingX: 1, marginBottom: 1 },
      React.createElement(Box, { flexDirection: "column", width: "100%" },
        React.createElement(Text, { color: "green", bold: true }, `🤖 Active Agents (${hiveData.agents?.length || 0})`),
        
        hiveData.agents && hiveData.agents.length > 0 ? 
          React.createElement(Static, { items: hiveData.agents }, (agent, index) => 
            React.createElement(Box, { key: agent.id, justifyContent: "space-between", marginTop: index === 0 ? 0 : 0 },
              React.createElement(Box, null,
                React.createElement(Text, null, `${getAgentIcon(agent.name)} `),
                React.createElement(Text, { color: "white", bold: true }, agent.name)
              ),
              React.createElement(Box, null,
                React.createElement(Text, { color: getAgentStatusColor(agent.status), bold: true },
                  agent.status.toUpperCase()
                ),
                agent.task && React.createElement(Text, { color: "gray" }, ` • ${agent.task}`)
              )
            )
          ) :
          React.createElement(Text, { color: "gray", marginTop: 0 }, "No active agents")
      )
    ),

    React.createElement(Box, { borderStyle: "round", borderColor: "yellow", paddingX: 1, marginBottom: 1 },
      React.createElement(Box, { flexDirection: "column", width: "100%" },
        React.createElement(Text, { color: "yellow", bold: true }, "📋 Task Overview"),
        React.createElement(Box, { justifyContent: "space-between", marginTop: 0 },
          React.createElement(Box, null,
            React.createElement(Text, { color: "green" }, "✅ Done: "),
            React.createElement(Text, { color: "white", bold: true }, hiveData.tasks?.completed || 0)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "yellow" }, "🔄 Active: "),
            React.createElement(Text, { color: "white", bold: true }, hiveData.tasks?.inProgress || 0)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "gray" }, "⏳ Queue: "),
            React.createElement(Text, { color: "white", bold: true }, hiveData.tasks?.pending || 0)
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "blue" }, "📊 Total: "),
            React.createElement(Text, { color: "white", bold: true }, hiveData.tasks?.total || 0)
          )
        )
      )
    ),

    React.createElement(Box, { justifyContent: "center", marginTop: 1 },
      React.createElement(Text, { color: hiveData.active ? 'green' : 'red', bold: true },
        hiveData.active ? '🟢 HIVE-MIND ACTIVE' : '🔴 HIVE-MIND INACTIVE'
      ),
      React.createElement(Text, { color: "gray" }, ` • Last update: ${new Date().toLocaleTimeString()}`)
    )
  );
};

export default HiveMindPanel;