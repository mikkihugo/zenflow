/**
 * HiveDetails Module
 * Converted from JavaScript to TypeScript
 */

import { Box, Text } from 'ink';
import React from 'react';

const HiveDetails = ({ hive, hiveName }) => {
  if(!hive) {
    return React.createElement(Box, {padding = hive.stats || {};
  const error = hive.error;

  const totalItems = (stats.totalVisions || 0) + (stats.totalEpics || 0) + 
                     (stats.totalFeatures || 0) + (stats.totalPrds || 0) + 
                     (stats.totalUserStories || 0) + (stats.totalTasks || 0);

  return React.createElement(Box, { borderStyle: "round", padding: 2, flexDirection: "column" },
    React.createElement(Text, { bold: true, color: "cyan" }, `🐝 Service Details: ${hiveName || 'Unknown'}`),
    React.createElement(Text, { color: "gray" }, `Path: ${hive.path || 'Not specified'}`),
    React.createElement(Box, { justifyContent: "center", marginTop: 1 },
      React.createElement(Text, { bold: true, color: "magenta" }, "Service Information")
    ),
    
    error && React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { color: "red" }, `❌ Error: ${error}`)
    ),
    
    React.createElement(Box, { flexDirection: "column", marginTop: 1 },
      React.createElement(Text, { bold: true, color: "yellow" }, "📊 Statistics:"),
      
      React.createElement(Box, { flexDirection: "row", marginTop: 1 },
        React.createElement(Box, { flexDirection: "column", width: 30 },
          React.createElement(Text, null, "🎯 Visions: ", React.createElement(Text, { color: "green" }, stats.totalVisions || 0)),
          React.createElement(Text, null, "📚 Epics: ", React.createElement(Text, { color: "blue" }, stats.totalEpics || 0)),
          React.createElement(Text, null, "⚡ Features: ", React.createElement(Text, { color: "magenta" }, stats.totalFeatures || 0))
        ),
        
        React.createElement(Box, { flexDirection: "column", width: 30 },
          React.createElement(Text, null, "📋 PRDs: ", React.createElement(Text, { color: "cyan" }, stats.totalPrds || 0)),
          React.createElement(Text, null, "👤 User Stories: ", React.createElement(Text, { color: "yellow" }, stats.totalUserStories || 0)),
          React.createElement(Text, null, "✅ Tasks: ", React.createElement(Text, { color: "green" }, stats.totalTasks || 0))
        )
      ),
      
      React.createElement(Box, { marginTop: 2 },
        React.createElement(Text, { color: "gray" }, `Total Items: ${totalItems}`)
      )
    )
  );
};

export default HiveDetails;
