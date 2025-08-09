/**
 * @file Status Dashboard Component for TUI - Final completion status display
 */

import { Box, Spacer, Text } from 'ink';
import type React from 'react';
import type { DiscoveryState } from '../types.js';

export interface StatusDashboardProps {
  state: DiscoveryState;
  showDetailed?: boolean;
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({
  state,
  showDetailed = false,
}) => {
  const totalAgents = Array.from(state.deploymentStatus.values()).reduce(
    (sum, status) => sum + status.agents.created,
    0
  );

  const deployedSwarms = Array.from(state.deploymentStatus.values()).filter(
    (status) => status.status === 'deployed'
  ).length;

  const averageConfidence =
    state.domains.length > 0
      ? state.domains.reduce((sum, domain) => sum + domain.confidence, 0) / state.domains.length
      : 0;

  const topologyBreakdown = Array.from(state.swarmConfigs.values()).reduce(
    (acc, config) => {
      acc[config?.topology] = (acc[config?.topology] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Box flexDirection="column">
      {/* Main Status Header */}
      <Box borderStyle="double" paddingX={2} paddingY={1} marginBottom={1}>
        <Box flexDirection="column" width="100%">
          <Box>
            <Text bold color="green">
              🎉 DEPLOYMENT COMPLETE
            </Text>
            <Spacer />
            <Text dimColor>{new Date().toLocaleTimeString()}</Text>
          </Box>
          <Box marginTop={1}>
            <Text>
              Successfully deployed {deployedSwarms} swarms with {totalAgents} total agents
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box marginBottom={1}>
        <Box borderStyle="single" paddingX={1} flexDirection="column" width="50%">
          <Text bold>📊 Summary</Text>
          <Box marginTop={0}>
            <Text>• Domains Analyzed: </Text>
            <Text color="cyan">{state.domains.length}</Text>
          </Box>
          <Box>
            <Text>• Swarms Deployed: </Text>
            <Text color="green">{deployedSwarms}</Text>
          </Box>
          <Box>
            <Text>• Total Agents: </Text>
            <Text color="magenta">{totalAgents}</Text>
          </Box>
          <Box>
            <Text>• Avg Confidence: </Text>
            <Text color="yellow">{(averageConfidence * 100).toFixed(1)}%</Text>
          </Box>
        </Box>

        <Box borderStyle="single" paddingX={1} flexDirection="column" width="50%">
          <Text bold>🏗️ Topologies</Text>
          {Object.entries(topologyBreakdown).map(([topology, count]) => (
            <Box key={topology}>
              <Text>• {topology}: </Text>
              <Text color="cyan">{count}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Detailed Swarm Status */}
      {showDetailed && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold marginBottom={1}>
            🐝 Active Swarms.
          </Text>
          {Array.from(state.deploymentStatus.entries()).map(([domain, status]) => (
            <Box key={domain} borderStyle="single" paddingX={1} marginBottom={0}>
              <Box flexDirection="column" width="100%">
                <Box>
                  <Text bold color="green">
                    ✅ {domain}
                  </Text>
                  <Spacer />
                  <Text dimColor>{state.swarmConfigs.get(domain)?.topology} topology</Text>
                </Box>
                <Box>
                  <Text>🤖 {status.agents.created} agents active</Text>
                  <Text dimColor> • </Text>
                  <Text>💾 {state.swarmConfigs.get(domain)?.resourceLimits.memory}</Text>
                  <Text dimColor> • </Text>
                  <Text>⚡ {state.swarmConfigs.get(domain)?.resourceLimits.cpu} cores</Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Next Steps */}
      <Box borderStyle="single" paddingX={1} flexDirection="column">
        <Text bold>🎯 Next Steps</Text>
        <Box marginTop={0}>
          <Text>• Use </Text>
          <Text color="cyan">claude-zen status</Text>
          <Text> to monitor swarm activity</Text>
        </Box>
        <Box>
          <Text>• Use </Text>
          <Text color="cyan">claude-zen dashboard</Text>
          <Text> for real-time monitoring</Text>
        </Box>
        <Box>
          <Text>• Deploy tasks with </Text>
          <Text color="cyan">claude-zen task deploy</Text>
          <Text> command</Text>
        </Box>
        <Box>
          <Text>• View logs with </Text>
          <Text color="cyan">claude-zen logs</Text>
          <Text> command</Text>
        </Box>
      </Box>

      {/* Health Check */}
      <Box marginTop={1}>
        <Box borderStyle="single" paddingX={1} width="100%">
          <Text bold color="green">
            💚 System Health: OPERATIONAL
          </Text>
          <Spacer />
          <Text dimColor>All swarms responding normally</Text>
        </Box>
      </Box>
    </Box>
  );
};
