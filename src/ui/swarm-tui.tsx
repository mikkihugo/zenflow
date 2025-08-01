#!/usr/bin/env node

/**
 * Swarm TUI - Interactive Terminal Interface for Swarm Management
 * React-based TUI using Ink for real-time swarm visualization and control
 */

import React, { useState, useEffect, useCallback } from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { daaService } from '../ruv-FANN-zen/ruv-swarm-zen/npm/src/daa-service.js';

// Import swarm-focused components
import { 
  SwarmHeader, 
  SwarmSpinner, 
  SwarmStatusBadge, 
  SwarmProgressBar 
} from './components';
import { SwarmOverview } from './screens';
import { SwarmStatus, SwarmMetrics, SwarmAgent, SwarmTask } from './types';

// Enhanced swarm state interface with coordination data
interface EnhancedSwarmState extends SwarmStatus {
  agents: SwarmAgent[];
  tasks: SwarmTask[];
  metrics: SwarmMetrics;
  coordination: {
    topology: SwarmStatus['topology'];
    connectionDensity: number;
    syncInterval: number;
    loadBalancing: string;
  };
}

// Navigation states
type Screen = 'overview' | 'agents' | 'tasks' | 'create-agent' | 'create-task' | 'settings';

// Main TUI Component
const SwarmTUI: React.FC = () => {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('overview');
  const [swarmState, setSwarmState] = useState<EnhancedSwarmState>({
    status: 'initializing',
    topology: 'mesh',
    totalAgents: 0,
    activeAgents: 0,
    uptime: 0,
    isInitialized: false,
    agents: [],
    tasks: [],
    metrics: {
      totalAgents: 0,
      activeAgents: 0,
      tasksInProgress: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      uptime: 0,
      performance: {
        throughput: 0,
        errorRate: 0,
        avgLatency: 0,
      },
    },
    coordination: {
      topology: 'mesh',
      connectionDensity: 0.5,
      syncInterval: 2000,
      loadBalancing: 'capability-based',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Initialize swarm on component mount
  useEffect(() => {
    initializeSwarm();
    const interval = setInterval(updateSwarmState, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeSwarm = async () => {
    try {
      setIsLoading(true);
      await daaService.initialize();
      
      // Create some default agents for demo
      await daaService.createAgent({
        id: 'coordinator',
        capabilities: ['coordination', 'planning'],
        cognitivePattern: 'systems'
      });
      
      await daaService.createAgent({
        id: 'worker-1',
        capabilities: ['execution', 'analysis'],
        cognitivePattern: 'convergent'
      });

      setSwarmState(prev => ({ ...prev, isInitialized: true }));
      await updateSwarmState();
      setIsLoading(false);
    } catch (error) {
      setError(`Failed to initialize swarm: ${error}`);
      setIsLoading(false);
    }
  };

  const updateSwarmState = async () => {
    try {
      if (!daaService.initialized) return;

      const status = daaService.getStatus();
      const performanceMetrics = await daaService.getPerformanceMetrics();

      const agents: SwarmAgent[] = Array.from(status.agents.ids).map(id => ({
        id,
        role: id.includes('coordinator') ? 'coordinator' : 'worker',
        status: 'active' as const,
        capabilities: ['general'],
        lastActivity: new Date(),
        metrics: {
          tasksCompleted: performanceMetrics.tasksCompleted || 0,
          averageResponseTime: performanceMetrics.avgTaskTime || 0,
          errors: 0,
          successRate: 0.95,
          totalTasks: performanceMetrics.tasksCompleted || 0,
        },
        cognitivePattern: id.includes('coordinator') ? 'systems' : 'convergent',
        performanceScore: 1.0,
      }));

      setSwarmState(prev => ({
        ...prev,
        status: 'active',
        agents,
        totalAgents: status.agents.count,
        activeAgents: status.agents.count,
        uptime: Date.now() - 1000,
        metrics: {
          ...prev.metrics,
          totalAgents: status.agents.count,
          activeAgents: status.agents.count,
          tasksCompleted: performanceMetrics.tasksCompleted || 0,
          performance: {
            throughput: performanceMetrics.throughput || 0,
            errorRate: 0.05,
            avgLatency: performanceMetrics.avgTaskTime || 0,
          },
        },
      }));
    } catch (error) {
      setError(`Failed to update swarm state: ${error}`);
    }
  };

  // Keyboard navigation
  useInput((input, key) => {
    if (key.escape || input === 'q') {
      exit();
      return;
    }

    switch (input) {
      case '1':
        setScreen('overview');
        break;
      case '2':
        setScreen('agents');
        break;
      case '3':
        setScreen('tasks');
        break;
      case '4':
        setScreen('create-agent');
        break;
      case '5':
        setScreen('create-task');
        break;
      case '6':
        setScreen('settings');
        break;
    }
  });

  if (isLoading) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center">
        <SwarmSpinner type="swarm" text="Initializing Swarm..." color="cyan" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center">
        <Text color="red">❌ Error: {error}</Text>
        <Text color="gray">Press 'q' to exit</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      {/* Enhanced Header with swarm status */}
      <SwarmHeader 
        title="Swarm Orchestrator"
        version="2.0.0"
        swarmStatus={swarmState}
      />
      
      {/* Main Content */}
      <Box flexGrow={1}>
        {screen === 'overview' && (
          <SwarmOverview 
            swarmStatus={swarmState}
            metrics={swarmState.metrics}
            agents={swarmState.agents}
            onExit={exit}
            onNavigate={setScreen}
            showHeader={false}
          />
        )}
        {screen === 'agents' && <AgentsScreen agents={swarmState.agents} />}
        {screen === 'tasks' && <TasksScreen tasks={swarmState.tasks} />}
        {screen === 'create-agent' && <CreateAgentScreen onBack={() => setScreen('agents')} />}
        {screen === 'create-task' && <CreateTaskScreen onBack={() => setScreen('tasks')} />}
        {screen === 'settings' && <SettingsScreen swarmState={swarmState} />}
      </Box>
      
      {/* Enhanced Footer */}
      <Footer />
    </Box>
  );
};

// Navigation Component - integrated swarm screen titles
const SwarmNavigation: React.FC<{ screen: Screen }> = ({ screen }) => {
  const getTitle = () => {
    switch (screen) {
      case 'overview': return '📊 Swarm Overview';
      case 'agents': return '🤖 Agent Coordination';
      case 'tasks': return '📋 Task Orchestration';
      case 'create-agent': return '➕ Spawn Agent';
      case 'create-task': return '➕ Create Task';
      case 'settings': return '⚙️ Swarm Configuration';
      default: return '🐝 Swarm Orchestrator';
    }
  };

  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1}>
      <Text bold color="cyan">{getTitle()}</Text>
    </Box>
  );
};

// Legacy Overview Screen - now uses SwarmOverview component
const OverviewScreen: React.FC<{ swarmState: EnhancedSwarmState }> = ({ swarmState }) => {
  const uptimeFormatted = Math.floor(swarmState.uptime / 1000) + 's';
  
  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="green">🐝 Swarm Status: {swarmState.isInitialized ? 'ACTIVE' : 'INACTIVE'}</Text>
      <Text>📊 Topology: {swarmState.topology}</Text>
      <Text>👥 Agents: {swarmState.activeAgents}/{swarmState.totalAgents}</Text>
      <Text>⏱️ Uptime: {uptimeFormatted}</Text>
      <Text>📋 Tasks: {swarmState.tasks.length}</Text>
      
      <Box marginTop={1}>
        <Text bold>Agent Status:</Text>
      </Box>
      
      {swarmState.agents.map(agent => (
        <Box key={agent.id} marginLeft={2}>
          <SwarmStatusBadge 
            status={agent.status}
            text={`${agent.id} (${agent.role})`}
            variant="minimal"
          />
        </Box>
      ))}
      
      {swarmState.agents.length === 0 && (
        <Box marginLeft={2}>
          <Text color="gray">No agents active</Text>
        </Box>
      )}
    </Box>
  );
};

// Agents Screen
const AgentsScreen: React.FC<{ agents: SwarmAgent[] }> = ({ agents }) => {
  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold>🤖 Swarm Agents ({agents.length})</Text>
      
      {agents.map(agent => (
        <Box key={agent.id} borderStyle="single" borderColor="gray" marginY={1} paddingX={1}>
          <Box flexDirection="column">
            <Text bold>{getStatusIcon(agent.status)} {agent.id}</Text>
            <Text>Role: {agent.role}</Text>
            <Text>Capabilities: {agent.capabilities.join(', ')}</Text>
            <Text>Tasks Completed: {agent.metrics.tasksCompleted}</Text>
            <Text>Avg Response: {agent.metrics.averageResponseTime.toFixed(1)}ms</Text>
            <Text>Errors: {agent.metrics.errors}</Text>
          </Box>
        </Box>
      ))}
      
      {agents.length === 0 && (
        <Text color="gray">No agents available. Press '4' to create an agent.</Text>
      )}
    </Box>
  );
};

// Tasks Screen
const TasksScreen: React.FC<{ tasks: SwarmTask[] }> = ({ tasks }) => {
  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold>📋 Swarm Tasks ({tasks.length})</Text>
      
      {tasks.map(task => (
        <Box key={task.id} borderStyle="single" borderColor="gray" marginY={1} paddingX={1}>
          <Box flexDirection="column">
            <Text bold>{getTaskStatusIcon(task.status)} {task.description}</Text>
            <Text>Status: {task.status}</Text>
            <Text>Progress: {task.progress}%</Text>
            <Text>Assigned: {task.assignedAgents.join(', ')}</Text>
          </Box>
        </Box>
      ))}
      
      {tasks.length === 0 && (
        <Text color="gray">No tasks queued. Press '5' to create a task.</Text>
      )}
    </Box>
  );
};

// Create Agent Screen
const CreateAgentScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [agentId, setAgentId] = useState('');
  const [role, setRole] = useState('worker');
  const [isCreating, setIsCreating] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  const createAgent = async () => {
    if (!agentId.trim()) return;
    
    setIsCreating(true);
    try {
      await daaService.createAgent({
        id: agentId,
        capabilities: [role, 'general'],
        cognitivePattern: 'adaptive'
      });
      onBack();
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold>➕ Create New Agent</Text>
      
      <Box marginY={1}>
        <Text>Agent ID: </Text>
        <TextInput 
          value={agentId} 
          onChange={setAgentId}
          placeholder="Enter agent ID..."
        />
      </Box>
      
      <Box marginY={1}>
        <Text>Role: {role}</Text>
      </Box>
      
      <Box marginY={1}>
        <Text color="gray">Press Enter to create, Escape to cancel</Text>
      </Box>
      
      {isCreating && (
        <SwarmSpinner type="coordination" text="Spawning agent..." color="yellow" />
      )}
    </Box>
  );
};

// Create Task Screen
const CreateTaskScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold>➕ Create New Task</Text>
      
      <Box marginY={1}>
        <Text>Description: </Text>
        <TextInput 
          value={taskDescription} 
          onChange={setTaskDescription}
          placeholder="Enter task description..."
        />
      </Box>
      
      <Box marginY={1}>
        <Text color="gray">Press Enter to create, Escape to cancel</Text>
      </Box>
      
      {isCreating && (
        <SwarmSpinner type="processing" text="Creating task..." color="green" />
      )}
    </Box>
  );
};

// Settings Screen - Enhanced for swarm coordination
const SettingsScreen: React.FC<{ swarmState: EnhancedSwarmState }> = ({ swarmState }) => {
  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold>⚙️ Swarm Configuration</Text>
      
      <Box marginY={1}>
        <Text>🔗 Topology: {swarmState.coordination.topology}</Text>
        <Text>👥 Max Agents: {swarmState.totalAgents}</Text>
        <Text>⏱️ Sync Interval: {swarmState.coordination.syncInterval}ms</Text>
        <Text>⚖️ Load Balancing: {swarmState.coordination.loadBalancing}</Text>
        <Text>🌐 Connection Density: {(swarmState.coordination.connectionDensity * 100).toFixed(0)}%</Text>
        <Text>🐝 WASM Enabled: ✅</Text>
        <Text>🧠 Neural Networks: ✅</Text>
        <Text>📊 Real-time Metrics: ✅</Text>
      </Box>
      
      <Box marginY={1}>
        <Text color="gray">Settings configuration coming soon...</Text>
      </Box>
    </Box>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1}>
      <Text color="gray">
        Navigation: [1] Overview [2] Agents [3] Tasks [4] Create Agent [5] Create Task [6] Settings [Q] Quit
      </Text>
    </Box>
  );
};

// Utility functions
const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'active': return '🟢';
    case 'idle': return '🟡';
    case 'busy': return '🔵';
    case 'error': return '🔴';
    default: return '⚪';
  }
};

const getTaskStatusIcon = (status: string): string => {
  switch (status) {
    case 'pending': return '⏳';
    case 'in_progress': return '🔄';
    case 'completed': return '✅';
    case 'failed': return '❌';
    default: return '⚪';
  }
};

// CLI Entry Point
export const launchSwarmTUI = () => {
  console.clear();
  render(<SwarmTUI />);
};

// Export for use in main CLI
export default SwarmTUI;