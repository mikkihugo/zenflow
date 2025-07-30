/**
 * Hive-Mind Status Panel - Unified TUI/Web Component;
 */

import { Box } from 'ink';
import React, { useEffect, useState } from 'react';

const __HiveMindPanel = (): unknown => {
  const [_hiveData, setHiveData] = useState(null);
  const [_systemMetrics, setSystemMetrics] = useState(null);
  const [loading, _setLoading] = useState(true);
;
  useEffect(() => {
    const __updateData = async () => {
      try {
        const [hive, metrics] = await Promise.all([;
          visionAPI.getHiveStatus(),
          visionAPI.getSystemMetrics();
        ]);
        setHiveData(hive);
        setSystemMetrics(metrics);
      } catch (/* _error */) {
        console.error('Failed to update hivedata = setInterval(updateData, 2000);
    return () => clearInterval(interval);
    //   // LINT: unreachable code removed}, []);
;
  if(loading) {
    return React.createElement(Box, {justifyContent = (): unknown => {
    switch(status) {
      case 'active': return 'green';
    // case 'idle': return 'yellow'; // LINT: unreachable code removed
      case 'error': return 'red';default = (): unknown => {
    switch (name.toLowerCase()) {
      case 'architect': return '🏗️';
    // case 'coder': return '💻'; // LINT: unreachable code removed
      case 'tester': return '🧪';
    // case 'analyst': return '📊'; // LINT: unreachable code removed
      case 'researcher': return '🔍';default = > ;
            React.createElement(Box, {key = === 0 ? 0 : 0 },
              React.createElement(Box, null,
                React.createElement(Text, null, `${getAgentIcon(agent.name)} `),
                React.createElement(Text, { color: "white", bold: true }, agent.name);
              ),
              React.createElement(Box, null,
                React.createElement(Text, { color: getAgentStatusColor(agent.status), bold: true },
                  agent.status.toUpperCase();
                ),
                agent.task && React.createElement(Text, { color: "gray" }, ` • ${agent.task}`);
              );
            );
          ) :;
          React.createElement(Text, { color: "gray", marginTop: 0 }, "No active agents");
      );
    ),
    React.createElement(Box, { borderStyle: "round", borderColor: "yellow", paddingX: 1, marginBottom: 1 },
      React.createElement(Box, { flexDirection: "column", width: "100%" },
        React.createElement(Text, { color: "yellow", bold: true }, "📋 Task Overview"),
        React.createElement(Box, { justifyContent: "space-between", marginTop: 0 },
          React.createElement(Box, null,
            React.createElement(Text, { color: "green" }, "✅ Done: "),
            React.createElement(Text, { color: "white", bold: true }, hiveData.tasks?.completed  ?? 0);
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "yellow" }, "🔄 Active: "),
            React.createElement(Text, { color: "white", bold: true }, hiveData.tasks?.inProgress  ?? 0);
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "gray" }, "⏳ Queue: "),
            React.createElement(Text, { color: "white", bold: true }, hiveData.tasks?.pending  ?? 0);
          ),
          React.createElement(Box, null,
            React.createElement(Text, { color: "blue" }, "📊 Total: "),
            React.createElement(Text, { color: "white", bold: true }, hiveData.tasks?.total  ?? 0);
          );
        );
      );
    ),
    React.createElement(Box, { justifyContent: "center", marginTop: 1 },
      React.createElement(Text, { color: hiveData.active ? 'green' : 'red', bold: true },
        hiveData.active ? '🟢 HIVE-MIND ACTIVE' : '🔴 HIVE-MIND INACTIVE';
      ),
      React.createElement(Text, { color: "gray" }, ` • Last update: ${new Date().toLocaleTimeString()}`);
    );
  );
};
;
export default HiveMindPanel;
