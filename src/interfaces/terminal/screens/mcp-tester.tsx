/**
 * MCP Tool Tester Screen.
 *
 * Interactive testing of MCP tools with parameter input.
 * Essential for debugging MCP integrations and testing tools before using in workflows.
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';
import { mcpClient } from '../services/mcp-client.js';

export interface MCPTool {
  name: string;
  description: string;
  category: string;
  parameters: MCPParameter[];
  example?: unknown;
}

export interface MCPParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  default?: unknown;
  enum?: string[];
}

export interface TestResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface MCPTesterProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

/**
 * MCP Tool Tester Component.
 *
 * Provides interactive testing interface for MCP tools with parameter forms.
 */
export const MCPTester: React.FC<MCPTesterProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [currentView, setCurrentView] = useState<
    'tools' | 'parameters' | 'results'
  >('tools');
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [selectedToolIndex, setSelectedToolIndex] = useState<number>(0);
  const [parameterValues, setParameterValues] = useState<
    Record<string, unknown>
  >({});
  const [currentParamIndex, setCurrentParamIndex] = useState<number>(0);
  const [parameterInput, setParameterInput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [resultIndex, setResultIndex] = useState<number>(0);
  const [mcpConnectionStatus, setMcpConnectionStatus] = useState<
    'unknown' | 'connected' | 'disconnected'
  >('unknown');
  const [availableTools, setAvailableTools] = useState<MCPTool[]>([]);

  // Test MCP connection and load available tools on mount
  useEffect(() => {
    const initializeMCP = async () => {
      try {
        const isConnected = await mcpClient.testConnection();
        setMcpConnectionStatus(isConnected ? 'connected' : 'disconnected');

        if (isConnected) {
          const tools = await mcpClient.getAvailableTools();
          setAvailableTools(tools);
        }
      } catch (error) {
        setMcpConnectionStatus('disconnected');
      }
    };

    initializeMCP();
  }, []);

  // Available MCP tools (mock data)
  const mockAvailableTools: MCPTool[] = [
    {
      name: 'swarm_init',
      description:
        'Initialize a new swarm with specified topology and configuration',
      category: 'Swarm Management',
      parameters: [
        {
          name: 'topology',
          type: 'string',
          required: true,
          description: 'Swarm topology type',
          enum: ['mesh', 'hierarchical', 'ring', 'star'],
        },
        {
          name: 'maxAgents',
          type: 'number',
          required: false,
          description: 'Maximum number of agents',
          default: 5,
        },
        {
          name: 'strategy',
          type: 'string',
          required: false,
          description: 'Distribution strategy',
          enum: ['balanced', 'specialized', 'adaptive'],
          default: 'balanced',
        },
      ],
      example: {
        topology: 'mesh',
        maxAgents: 8,
        strategy: 'adaptive',
      },
    },
    {
      name: 'agent_spawn',
      description: 'Spawn a new agent in the swarm with specified capabilities',
      category: 'Agent Management',
      parameters: [
        {
          name: 'type',
          type: 'string',
          required: true,
          description: 'Agent type',
          enum: ['researcher', 'coder', 'analyst', 'optimizer', 'coordinator'],
        },
        {
          name: 'name',
          type: 'string',
          required: false,
          description: 'Custom agent name',
        },
        {
          name: 'capabilities',
          type: 'array',
          required: false,
          description: 'Agent capabilities array',
        },
      ],
      example: {
        type: 'researcher',
        name: 'research-agent-1',
        capabilities: ['web_search', 'document_analysis', 'data_extraction'],
      },
    },
    {
      name: 'task_orchestrate',
      description:
        'Orchestrate a task across the swarm with specified strategy',
      category: 'Task Management',
      parameters: [
        {
          name: 'task',
          type: 'string',
          required: true,
          description: 'Task description or instructions',
        },
        {
          name: 'strategy',
          type: 'string',
          required: false,
          description: 'Execution strategy',
          enum: ['parallel', 'sequential', 'adaptive'],
          default: 'adaptive',
        },
        {
          name: 'priority',
          type: 'string',
          required: false,
          description: 'Task priority',
          enum: ['low', 'medium', 'high', 'critical'],
          default: 'medium',
        },
        {
          name: 'maxAgents',
          type: 'number',
          required: false,
          description: 'Maximum agents to use',
        },
      ],
      example: {
        task: 'Analyze user feedback data and generate insights',
        strategy: 'parallel',
        priority: 'high',
        maxAgents: 3,
      },
    },
    {
      name: 'memory_usage',
      description: 'Manage persistent memory across sessions',
      category: 'Memory Management',
      parameters: [
        {
          name: 'action',
          type: 'string',
          required: true,
          description: 'Memory action to perform',
          enum: ['store', 'retrieve', 'list', 'delete', 'clear'],
        },
        {
          name: 'key',
          type: 'string',
          required: false,
          description: 'Memory key for store/retrieve operations',
        },
        {
          name: 'value',
          type: 'object',
          required: false,
          description: 'Value to store (for store action)',
        },
      ],
      example: {
        action: 'store',
        key: 'user_preferences',
        value: { theme: 'dark', autoSave: true },
      },
    },
    {
      name: 'neural_train',
      description:
        'Train neural agents with sample tasks for improved performance',
      category: 'Neural Networks',
      parameters: [
        {
          name: 'agentId',
          type: 'string',
          required: false,
          description: 'Specific agent ID to train (optional)',
        },
        {
          name: 'iterations',
          type: 'number',
          required: false,
          description: 'Number of training iterations',
          default: 10,
        },
        {
          name: 'dataSet',
          type: 'string',
          required: false,
          description: 'Training dataset to use',
          enum: ['default', 'conversation', 'coding', 'analysis'],
          default: 'default',
        },
      ],
      example: {
        iterations: 50,
        dataSet: 'conversation',
      },
    },
  ];

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      if (currentView === 'tools') {
        onBack();
      } else {
        setCurrentView('tools');
        setSelectedTool(null);
        setParameterValues({});
      }
    }

    if (currentView === 'tools') {
      if (key.upArrow) {
        setSelectedToolIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedToolIndex((prev) =>
          Math.min(availableTools.length - 1, prev + 1)
        );
      } else if (key.return) {
        const tool = availableTools[selectedToolIndex];
        setSelectedTool(tool);
        setParameterValues(tool.example || {});
        setCurrentView('parameters');
        setCurrentParamIndex(0);
      }
    } else if (currentView === 'parameters') {
      if (key.upArrow && !parameterInput) {
        setCurrentParamIndex((prev) => Math.max(0, prev - 1));
        setParameterInput(getCurrentParameterValue());
      } else if (key.downArrow && !parameterInput) {
        setCurrentParamIndex((prev) =>
          Math.min((selectedTool?.parameters.length || 1) - 1, prev + 1)
        );
        setParameterInput(getCurrentParameterValue());
      } else if (key.return) {
        if (input === 't' || input === 'T') {
          executeTool();
        }
      }

      // Handle special keys for parameter input
      if (input === 't' || input === 'T') {
        executeTool();
      } else if (input === 'e' || input === 'E') {
        loadExample();
      } else if (input === 'c' || input === 'C') {
        testMCPConnection();
      }
    } else if (currentView === 'results') {
      if (key.upArrow) {
        setResultIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setResultIndex((prev) => Math.min(testResults.length - 1, prev + 1));
      }
    }
  });

  const getCurrentParameterValue = (): string => {
    if (!selectedTool) return '';
    const param = selectedTool.parameters[currentParamIndex];
    const value = parameterValues[param.name];
    if (value === undefined || value === null) return '';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  };

  const updateCurrentParameter = (value: string) => {
    if (!selectedTool) return;
    const param = selectedTool.parameters[currentParamIndex];

    let parsedValue: unknown;
    try {
      switch (param.type) {
        case 'number':
          parsedValue = value === '' ? undefined : Number(value);
          break;
        case 'boolean':
          parsedValue = value.toLowerCase() === 'true';
          break;
        case 'object':
        case 'array':
          parsedValue = value === '' ? undefined : JSON.parse(value);
          break;
        default:
          parsedValue = value === '' ? undefined : value;
      }

      setParameterValues((prev) => ({
        ...prev,
        [param.name]: parsedValue,
      }));
    } catch (error) {
      // Invalid JSON, keep as string
      setParameterValues((prev) => ({
        ...prev,
        [param.name]: value,
      }));
    }
  };

  const loadExample = () => {
    if (selectedTool?.example) {
      setParameterValues(selectedTool.example);
      setParameterInput(getCurrentParameterValue());
    }
  };

  const testMCPConnection = useCallback(async () => {
    try {
      setMcpConnectionStatus('unknown');
      const isConnected = await mcpClient.testConnection();
      setMcpConnectionStatus(isConnected ? 'connected' : 'disconnected');

      if (isConnected) {
        const tools = await mcpClient.getAvailableTools();
        setAvailableTools(tools);
      }
    } catch (error) {
      setMcpConnectionStatus('disconnected');
    }
  }, []);

  const executeTool = useCallback(async () => {
    if (!selectedTool) return;

    setIsExecuting(true);

    try {
      // Execute real MCP tool using our client
      const toolResult = await mcpClient.executeTool(
        selectedTool.name,
        parameterValues
      );

      const result: TestResult = {
        success: toolResult.success,
        data: toolResult.data,
        error: toolResult.error,
        duration: toolResult.duration || 0,
        timestamp: toolResult.timestamp || new Date(),
      };

      setTestResults((prev) => [result, ...prev.slice(0, 19)]); // Keep last 20 results
      setCurrentView('results');
      setResultIndex(0);
    } catch (error) {
      const errorResult: TestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0,
        timestamp: new Date(),
      };
      setTestResults((prev) => [errorResult, ...prev.slice(0, 19)]);
      setCurrentView('results');
      setResultIndex(0);
    } finally {
      setIsExecuting(false);
    }
  }, [selectedTool, parameterValues]);

  const renderToolSelection = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box flexDirection="row" alignItems="center" marginBottom={1}>
        <Text bold color="cyan">
          🛠️ Available MCP Tools
        </Text>
        <Text
          color={mcpConnectionStatus === 'connected' ? 'green' : 'red'}
          marginLeft={2}
        >
          [
          {mcpConnectionStatus === 'connected'
            ? '✓ CONNECTED'
            : '✗ DISCONNECTED'}
          ]
        </Text>
        {mcpConnectionStatus === 'connected' && (
          <Text color="gray" marginLeft={1}>
            ({availableTools.length} real tools)
          </Text>
        )}
      </Box>

      <SelectInput
        items={availableTools.map((tool, index) => {
          const isRealTool = availableTools.includes(tool.name);
          return {
            label: `${isRealTool ? '🟢' : '🔴'} ${tool.name} - ${tool.description}`,
            value: index,
          };
        })}
        onSelect={(item) => {
          const tool = availableTools[item.value];
          setSelectedTool(tool);
          setParameterValues(tool.example || {});
          setCurrentView('parameters');
        }}
      />

      {availableTools[selectedToolIndex] && (
        <Box marginTop={2} borderStyle="single" borderColor="cyan" padding={2}>
          <Box flexDirection="column">
            <Text color="cyan" bold>
              {availableTools[selectedToolIndex].name}
            </Text>
            <Text color="gray" marginTop={1}>
              Category: {availableTools[selectedToolIndex].category}
            </Text>
            <Text wrap="wrap" marginTop={1}>
              {availableTools[selectedToolIndex].description}
            </Text>
            <Text color="yellow" marginTop={1}>
              Parameters: {availableTools[selectedToolIndex].parameters.length}(
              {
                availableTools[selectedToolIndex].parameters.filter(
                  (p) => p.required
                ).length
              }{' '}
              required)
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderParameterForm = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box flexDirection="row" justifyContent="space-between" marginBottom={2}>
        <Text bold color="cyan">
          🔧 Configure: {selectedTool?.name}
        </Text>
        <StatusBadge
          status={isExecuting ? 'initializing' : 'active'}
          text={isExecuting ? 'EXECUTING' : 'READY'}
          variant="minimal"
        />
      </Box>

      {selectedTool?.parameters.map((param, index) => {
        const isSelected = currentParamIndex === index;
        const value = parameterValues[param.name];
        const hasValue = value !== undefined && value !== null && value !== '';

        return (
          <Box
            key={param.name}
            flexDirection="column"
            backgroundColor={isSelected ? 'blue' : undefined}
            paddingX={isSelected ? 1 : 0}
            paddingY={1}
            marginBottom={1}
          >
            <Box flexDirection="row">
              <Text color={param.required ? 'red' : 'white'} bold={isSelected}>
                {param.required ? '* ' : '  '}
                {param.name}
              </Text>
              <Text color="gray" dimColor>
                {' '}
                ({param.type}){param.enum && ` [${param.enum.join('|')}]`}
              </Text>
              {hasValue && (
                <Text color="green" dimColor>
                  {' '}
                  ✓
                </Text>
              )}
            </Box>

            <Text color="gray" wrap="wrap" marginLeft={2}>
              {param.description}
            </Text>

            {isSelected && (
              <Box marginTop={1} marginLeft={2}>
                <Text color="cyan">Value: </Text>
                <TextInput
                  value={parameterInput}
                  onChange={(value) => {
                    setParameterInput(value);
                    updateCurrentParameter(value);
                  }}
                  placeholder={
                    param.default
                      ? `Default: ${param.default}`
                      : 'Enter value...'
                  }
                />
              </Box>
            )}

            {!isSelected && hasValue && (
              <Box marginTop={1} marginLeft={2}>
                <Text color="green">
                  Current:{' '}
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </Text>
              </Box>
            )}
          </Box>
        );
      })}

      <Box marginTop={2} borderStyle="single" borderColor="yellow" padding={1}>
        <Box flexDirection="column">
          <Text color="yellow" bold>
            Actions:
          </Text>
          <Text color="gray">
            • Press 'T' to execute tool with current parameters
          </Text>
          <Text color="gray">• Press 'E' to load example parameters</Text>
          <Text color="gray">• Press 'C' to test MCP connection</Text>
          <Text color="gray">• Use ↑↓ to navigate parameters</Text>
          {mcpConnectionStatus === 'disconnected' && (
            <Text color="red" marginTop={1}>
              ⚠️ MCP server not connected - using fallback mode
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );

  const renderResults = () => (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="cyan" marginBottom={1}>
        📊 Test Results ({testResults.length})
      </Text>

      {testResults.length === 0 ? (
        <Box justifyContent="center" alignItems="center" height={10}>
          <Text color="gray">
            No test results yet. Run a tool to see results.
          </Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          {testResults.map((result, index) => {
            const isSelected = resultIndex === index;

            return (
              <Box
                key={index}
                flexDirection="column"
                backgroundColor={isSelected ? 'blue' : undefined}
                paddingX={isSelected ? 1 : 0}
                paddingY={1}
                borderStyle={isSelected ? 'single' : undefined}
                borderColor={isSelected ? 'cyan' : undefined}
                marginBottom={1}
              >
                <Box flexDirection="row" justifyContent="space-between">
                  <Text color={result.success ? 'green' : 'red'} bold>
                    {result.success ? '✅' : '❌'}
                    {result.data?.toolName || 'Unknown Tool'}
                  </Text>
                  <Text color="gray" dimColor>
                    {result.duration}ms
                  </Text>
                </Box>

                <Text color="gray" dimColor>
                  {result.timestamp.toLocaleTimeString()}
                </Text>

                {isSelected && (
                  <Box marginTop={1} flexDirection="column">
                    {result.success && result.data && (
                      <Box flexDirection="column">
                        <Text color="green" bold>
                          MCP Response:
                        </Text>
                        <Text color="white" wrap="wrap">
                          {typeof result.data === 'object'
                            ? JSON.stringify(result.data, null, 2)
                            : String(result.data)}
                        </Text>
                        {result.data?.id && (
                          <Text color="cyan" marginTop={1}>
                            ID: {result.data.id}
                          </Text>
                        )}
                        {result.data?.status && (
                          <Text color="yellow" marginTop={1}>
                            Status: {result.data.status}
                          </Text>
                        )}
                      </Box>
                    )}

                    {!result.success && result.error && (
                      <Box flexDirection="column">
                        <Text color="red" bold>
                          Error:
                        </Text>
                        <Text color="red" wrap="wrap">
                          {result.error}
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );

  const getCurrentScreenTitle = (): string => {
    switch (currentView) {
      case 'parameters':
        return `Parameters: ${selectedTool?.name || 'Unknown'}`;
      case 'results':
        return `Results (${testResults.length})`;
      default:
        return 'Tool Selection';
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Header
        title="MCP Tool Tester"
        subtitle={`${getCurrentScreenTitle()} | MCP: ${mcpConnectionStatus.toUpperCase()}`}
        swarmStatus={swarmStatus}
        mode="standard"
        showBorder={true}
      />

      {/* Main Content */}
      <Box flexGrow={1}>
        {currentView === 'tools' && renderToolSelection()}
        {currentView === 'parameters' && renderParameterForm()}
        {currentView === 'results' && renderResults()}
      </Box>

      {/* Footer */}
      <Box paddingY={1} paddingX={2}>
        <InteractiveFooter
          currentScreen="MCP Tool Tester"
          availableScreens={
            currentView === 'tools'
              ? [
                  { key: '↑↓', name: 'Navigate' },
                  { key: 'Enter', name: 'Select Tool' },
                  { key: 'Q/Esc', name: 'Back' },
                ]
              : currentView === 'parameters'
                ? [
                    { key: '↑↓', name: 'Navigate Params' },
                    { key: 'T', name: 'Execute Tool' },
                    { key: 'E', name: 'Load Example' },
                    { key: 'C', name: 'Test Connection' },
                    { key: 'Type', name: 'Edit Value' },
                    { key: 'Q/Esc', name: 'Back to Tools' },
                  ]
                : [
                    { key: '↑↓', name: 'Navigate Results' },
                    { key: 'Q/Esc', name: 'Back to Tools' },
                  ]
          }
          status={
            currentView === 'tools'
              ? `${availableTools.length} tools available | MCP: ${mcpConnectionStatus} | Real tools: ${availableTools.length}`
              : currentView === 'parameters'
                ? `${selectedTool?.parameters.length || 0} parameters | MCP: ${mcpConnectionStatus}`
                : `${testResults.length} test results | MCP: ${mcpConnectionStatus}`
          }
        />
      </Box>
    </Box>
  );
};

export default MCPTester;
