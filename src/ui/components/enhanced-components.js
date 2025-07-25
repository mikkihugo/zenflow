#!/usr/bin/env node

/**
 * 🎯 ENHANCED INK TUI COMPONENTS
 * 
 * Advanced interactive components for the Claude-Zen TUI:
 * - Real-time progress indicators
 * - Interactive command completion
 * - Visual system monitoring 
 * - Split-pane layouts
 * - Keyboard navigation
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

/**
 * Enhanced Progress Bar with animations and labels
 */
export const ProgressBar = ({ 
  progress = 0, 
  label = '', 
  width = 40, 
  color = 'cyan',
  showPercentage = true,
  animated = true,
  style = 'blocks' // 'blocks', 'dots', 'bars'
}) => {
  const [animationFrame, setAnimationFrame] = useState(0);
  
  useEffect(() => {
    if (animated && progress > 0 && progress < 100) {
      const interval = setInterval(() => {
        setAnimationFrame(prev => (prev + 1) % 4);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [animated, progress]);
  
  const filled = Math.floor((progress / 100) * width);
  const empty = width - filled;
  
  let fillChar, emptyChar;
  switch (style) {
    case 'dots':
      fillChar = '●';
      emptyChar = '○';
      break;
    case 'bars':
      fillChar = '|';
      emptyChar = '·';
      break;
    default:
      fillChar = '█';
      emptyChar = '░';
  }
  
  const animatedFill = animated && progress > 0 && progress < 100 ? 
    fillChar.repeat(Math.max(0, filled - 1)) + ['⠋', '⠙', '⠹', '⠸'][animationFrame] :
    fillChar.repeat(filled);
  
  return (
    <Box>
      <Text color={color}>
        {label && `${label}: `}
        [{animatedFill}{emptyChar.repeat(empty)}]
        {showPercentage && ` ${progress.toFixed(1)}%`}
      </Text>
    </Box>
  );
};

/**
 * Interactive Command Input with auto-completion
 */
export const CommandInput = ({ 
  value = '', 
  placeholder = '', 
  suggestions = [],
  selectedSuggestion = -1,
  onSubmit,
  onComplete,
  showHelp = true
}) => {
  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">$ </Text>
        <Text>{value}</Text>
        {!value && placeholder && (
          <Text color="gray" dimColor>{placeholder}</Text>
        )}
      </Box>
      
      {suggestions.length > 0 && (
        <Box flexDirection="column" marginLeft={2} marginTop={1}>
          <Text color="gray" dimColor>
            Suggestions ({suggestions.length}) - ↑/↓ to navigate, Tab to select:
          </Text>
          {suggestions.slice(0, 6).map((cmd, index) => (
            <Box key={cmd.name} marginLeft={1}>
              <Text 
                color={index === selectedSuggestion ? 'black' : 'white'}
                backgroundColor={index === selectedSuggestion ? 'cyan' : undefined}
                bold={index === selectedSuggestion}
              >
                {index === selectedSuggestion ? '▶ ' : '  '}
                {cmd.name}
              </Text>
              <Text color="gray" marginLeft={1}>
                - {cmd.description.substring(0, 50)}
                {cmd.description.length > 50 ? '...' : ''}
              </Text>
            </Box>
          ))}
          {suggestions.length > 6 && (
            <Text color="gray" dimColor marginLeft={1}>
              ... and {suggestions.length - 6} more
            </Text>
          )}
        </Box>
      )}
      
      {showHelp && suggestions.length === 0 && !value && (
        <Box flexDirection="column" marginLeft={2} marginTop={1}>
          <Text color="gray" dimColor>Quick commands:</Text>
          <Text color="gray" dimColor marginLeft={1}>help, status, init, swarm, memory</Text>
        </Box>
      )}
    </Box>
  );
};

/**
 * Visual Swarm Topology Display
 */
export const SwarmTopology = ({ 
  swarms = [], 
  connections = [],
  activeSwarm = null,
  showMetrics = true 
}) => {
  const [refreshCount, setRefreshCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Box justifyContent="space-between">
        <Text bold color="cyan">🐝 Swarm Topology</Text>
        <Text color="gray" dimColor>
          Updated {refreshCount}s ago
        </Text>
      </Box>
      
      {swarms.length === 0 ? (
        <Box marginTop={1}>
          <Text color="gray" dimColor>No active swarms</Text>
          <Text color="yellow" marginTop={1}>
            💡 Run 'claude-zen swarm create' to start a swarm
          </Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          {swarms.map(swarm => (
            <Box key={swarm.id} marginLeft={2} marginBottom={1}>
              <Box flexDirection="column">
                <Box>
                  <Text 
                    color={swarm.id === activeSwarm ? 'cyan' : 'yellow'}
                    bold={swarm.id === activeSwarm}
                  >
                    {swarm.id === activeSwarm ? '▶ ' : '  '}
                    {swarm.name}
                  </Text>
                  <Text color="gray" marginLeft={1}>
                    ({swarm.agents} agents)
                  </Text>
                  <Text 
                    color={swarm.status === 'active' ? 'green' : 
                          swarm.status === 'idle' ? 'yellow' : 'red'}
                    marginLeft={1}
                  >
                    {swarm.status}
                  </Text>
                </Box>
                
                {showMetrics && swarm.metrics && (
                  <Box marginLeft={4}>
                    <Text color="gray" dimColor>
                      Tasks: {swarm.metrics.tasks || 0} | 
                      CPU: {swarm.metrics.cpu || 0}% | 
                      Memory: {swarm.metrics.memory || 0}MB
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      
      {connections.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="gray" dimColor>Connections:</Text>
          {connections.map((conn, index) => (
            <Box key={index} marginLeft={2}>
              <Text color="blue">
                {conn.from} ←→ {conn.to}
              </Text>
              {conn.bandwidth && (
                <Text color="gray" marginLeft={1}>
                  ({conn.bandwidth})
                </Text>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

/**
 * Enhanced Log Pane with filtering and search
 */
export const LogPane = ({ 
  logs = [], 
  height = 10,
  filter = 'all', // 'all', 'error', 'success', 'info'
  searchTerm = '',
  showTimestamps = true,
  autoScroll = true
}) => {
  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.type !== filter) return false;
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  
  const visibleLogs = autoScroll ? filteredLogs.slice(-height) : filteredLogs.slice(0, height);
  
  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return '❌';
      case 'success': return '✅';
      case 'command': return '⚡';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1} height={height + 4}>
      <Box justifyContent="space-between">
        <Text bold color="cyan">📋 Command Logs</Text>
        <Text color="gray" dimColor>
          {filteredLogs.length}/{logs.length} 
          {filter !== 'all' && ` (${filter})`}
          {searchTerm && ` [${searchTerm}]`}
        </Text>
      </Box>
      
      <Box flexDirection="column" marginTop={1}>
        {visibleLogs.length === 0 ? (
          <Text color="gray" dimColor>
            {logs.length === 0 ? 'No logs yet' : 'No logs match filter'}
          </Text>
        ) : (
          visibleLogs.map((log, index) => (
            <Box key={index}>
              <Text color="gray" dimColor>
                {showTimestamps && new Date(log.timestamp).toLocaleTimeString()}
              </Text>
              <Text 
                color={
                  log.type === 'error' ? 'red' : 
                  log.type === 'success' ? 'green' : 
                  log.type === 'command' ? 'cyan' : 'white'
                }
                marginLeft={showTimestamps ? 1 : 0}
              >
                {getLogIcon(log.type)} {log.message}
              </Text>
            </Box>
          ))
        )}
      </Box>
      
      {filteredLogs.length > height && (
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            ... {filteredLogs.length - height} more entries
          </Text>
        </Box>
      )}
    </Box>
  );
};

/**
 * System Status Panel with real-time metrics
 */
export const StatusPane = ({ 
  status = {}, 
  metrics = {},
  showDetails = true,
  refreshRate = 5000
}) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshRate);
    return () => clearInterval(interval);
  }, [refreshRate]);
  
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Box justifyContent="space-between">
        <Text bold color="cyan">📊 System Status</Text>
        <Text color="gray" dimColor>
          {lastUpdate.toLocaleTimeString()}
        </Text>
      </Box>
      
      <Box flexDirection="column" marginTop={1}>
        <Box>
          <Text>API Server: </Text>
          <Text color={status.apiRunning ? 'green' : 'red'}>
            {status.apiRunning ? '✅ Running' : '❌ Stopped'}
          </Text>
          {status.apiRunning && status.port && (
            <Text color="gray" marginLeft={1}>
              :{status.port}
            </Text>
          )}
        </Box>
        
        <Box>
          <Text>Commands: </Text>
          <Text color="yellow">{status.commandCount || 0}</Text>
        </Box>
        
        <Box>
          <Text>Uptime: </Text>
          <Text color="blue">
            {formatUptime(status.uptime || 0)}
          </Text>
        </Box>
        
        {showDetails && metrics && Object.keys(metrics).length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="gray" dimColor>Metrics:</Text>
            {metrics.apiCalls !== undefined && (
              <Box marginLeft={2}>
                <Text>API Calls: </Text>
                <Text color="cyan">{metrics.apiCalls}</Text>
              </Box>
            )}
            {metrics.executions !== undefined && (
              <Box marginLeft={2}>
                <Text>Executions: </Text>
                <Text color="cyan">{metrics.executions}</Text>
              </Box>
            )}
            {metrics.wsConnections !== undefined && (
              <Box marginLeft={2}>
                <Text>WebSocket: </Text>
                <Text color="cyan">{metrics.wsConnections}</Text>
              </Box>
            )}
            {metrics.errors !== undefined && metrics.errors > 0 && (
              <Box marginLeft={2}>
                <Text>Errors: </Text>
                <Text color="red">{metrics.errors}</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

/**
 * Interactive Help Panel with search
 */
export const HelpPane = ({ 
  selectedCommand = null,
  allCommands = [],
  searchTerm = '',
  category = 'all'
}) => {
  const [commandHelp, setCommandHelp] = useState(null);
  
  useEffect(() => {
    if (selectedCommand) {
      const cmd = allCommands.find(c => c.name === selectedCommand);
      setCommandHelp(cmd);
    }
  }, [selectedCommand, allCommands]);
  
  const filteredCommands = allCommands.filter(cmd => {
    if (category !== 'all' && cmd.category !== category) return false;
    if (searchTerm && !cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !cmd.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Text bold color="cyan">📖 Help & Documentation</Text>
      
      {commandHelp ? (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="yellow">{commandHelp.name}</Text>
          <Text color="gray" marginTop={1}>{commandHelp.description}</Text>
          
          {commandHelp.usage && (
            <Box marginTop={1}>
              <Text color="cyan">Usage: </Text>
              <Text>{commandHelp.usage}</Text>
            </Box>
          )}
          
          {commandHelp.examples && commandHelp.examples.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text color="yellow">Examples:</Text>
              {commandHelp.examples.slice(0, 3).map((example, index) => (
                <Text key={index} color="gray" marginLeft={2}>
                  {example}
                </Text>
              ))}
            </Box>
          )}
          
          {commandHelp.flags && Object.keys(commandHelp.flags).length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text color="yellow">Flags:</Text>
              {Object.entries(commandHelp.flags).slice(0, 3).map(([flag, config]) => (
                <Text key={flag} color="gray" marginLeft={2}>
                  --{flag}: {typeof config === 'object' ? config.description : 'flag option'}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          <Text color="gray" dimColor>Keyboard Shortcuts:</Text>
          <Text marginLeft={2}>Tab - Auto-complete command</Text>
          <Text marginLeft={2}>↑/↓ - Navigate suggestions</Text>
          <Text marginLeft={2}>Enter - Execute command</Text>
          <Text marginLeft={2}>Ctrl+C - Exit</Text>
          <Text marginLeft={2}>F1-F4 - Switch modes</Text>
          <Text marginLeft={2}>Ctrl+L - Toggle layout</Text>
          
          {searchTerm && (
            <Box flexDirection="column" marginTop={1}>
              <Text color="yellow">Search Results ({filteredCommands.length}):</Text>
              {filteredCommands.slice(0, 5).map((cmd) => (
                <Text key={cmd.name} color="gray" marginLeft={2}>
                  {cmd.name} - {cmd.description.substring(0, 40)}...
                </Text>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

/**
 * Split Pane Container with resizing
 */
export const SplitPane = ({ 
  left, 
  right, 
  split = 'vertical', // 'vertical' | 'horizontal'
  leftSize = '60%',
  rightSize = '40%',
  showDivider = true 
}) => {
  return (
    <Box flexDirection={split === 'vertical' ? 'row' : 'column'} flexGrow={1}>
      <Box width={split === 'vertical' ? leftSize : undefined} 
           height={split === 'horizontal' ? leftSize : undefined}>
        {left}
      </Box>
      
      {showDivider && (
        <Box 
          width={split === 'vertical' ? 1 : undefined}
          height={split === 'horizontal' ? 1 : undefined}
          borderStyle="single"
          borderColor="gray"
        />
      )}
      
      <Box width={split === 'vertical' ? rightSize : undefined}
           height={split === 'horizontal' ? rightSize : undefined}>
        {right}
      </Box>
    </Box>
  );
};

export default {
  ProgressBar,
  CommandInput,
  SwarmTopology,
  LogPane,
  StatusPane,
  HelpPane,
  SplitPane
};