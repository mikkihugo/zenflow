/**
 * @file Swarm Config Panel Component for TUI - Interactive swarm configuration.
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import type React from 'react';
import { useState } from 'react';
import type { SwarmConfig } from '../types.js';

export interface SwarmConfigPanelProps {
  domain: string;
  config: SwarmConfig;
  onConfigChange: (config: Partial<SwarmConfig>) => void;
}

export const SwarmConfigPanel: React.FC<SwarmConfigPanelProps> = ({
  domain,
  config,
  onConfigChange,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const handleFieldEdit = (field: string, currentValue: string | number) => {
    setEditingField(field);
    setTempValue(String(currentValue));
  };

  const handleFieldSave = () => {
    if (!editingField) return;

    const updates: Partial<SwarmConfig> = {};

    switch (editingField) {
      case 'topology':
        updates.topology = tempValue as
          | 'mesh'
          | 'hierarchical'
          | 'star'
          | 'ring';
        break;
      case 'maxAgents':
        updates.maxAgents = Number.parseInt(tempValue) || config?.maxAgents;
        break;
      case 'memory':
        updates.resourceLimits = {
          ...config?.resourceLimits,
          memory: tempValue,
        };
        break;
      case 'cpu':
        updates.resourceLimits = {
          ...config?.resourceLimits,
          cpu: Number.parseInt(tempValue) || config?.resourceLimits?.cpu,
        };
        break;
      case 'persistence':
        updates.persistence = tempValue as 'json' | 'sqlite' | 'lancedb';
        break;
    }

    onConfigChange(updates);
    setEditingField(null);
    setTempValue('');
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  useInput((input, key) => {
    if (editingField) {
      if (key.return) {
        handleFieldSave();
      } else if (key.escape) {
        handleFieldCancel();
      }
    } else {
      // Field selection navigation
      if (input === 't') {
        handleFieldEdit('topology', config?.topology);
      } else if (input === 'a') {
        handleFieldEdit('maxAgents', config?.maxAgents);
      } else if (input === 'm') {
        handleFieldEdit('memory', config?.resourceLimits?.memory);
      } else if (input === 'c') {
        handleFieldEdit('cpu', config?.resourceLimits?.cpu);
      } else if (input === 'p') {
        handleFieldEdit('persistence', config?.persistence);
      } else if (input === 's') {
        onConfigChange({ enableAutoScaling: !config?.enableAutoScaling });
      }
    }
  });

  const getTopologyIcon = (topology: string) => {
    switch (topology) {
      case 'mesh':
        return '🕸️ ';
      case 'hierarchical':
        return '🌳';
      case 'star':
        return '⭐';
      case 'ring':
        return '🔄';
      default:
        return '🔗';
    }
  };

  const getTopologyDescription = (topology: string) => {
    switch (topology) {
      case 'mesh':
        return 'All agents connected (high redundancy)';
      case 'hierarchical':
        return 'Tree structure (efficient coordination)';
      case 'star':
        return 'Central coordinator (simple management)';
      case 'ring':
        return 'Circular communication (balanced load)';
      default:
        return 'Unknown topology';
    }
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="magenta">
          {domain} Swarm Configuration
        </Text>
      </Box>
      <Box borderStyle="single" paddingX={1} flexDirection="column">
        {/* Topology Configuration */}
        <Box marginBottom={1}>
          <Box width={20}>
            <Text color={editingField === 'topology' ? 'cyan' : 'yellow'}>
              [T] Topology:
            </Text>
          </Box>
          {editingField === 'topology' ? (
            <Box>
              <Text>Select: </Text>
              <SelectInput
                items={[
                  { label: '🕸️  Mesh (High Redundancy)', value: 'mesh' },
                  {
                    label: '🌳 Hierarchical (Efficient)',
                    value: 'hierarchical',
                  },
                  { label: '⭐ Star (Centralized)', value: 'star' },
                  { label: '🔄 Ring (Balanced)', value: 'ring' },
                ]}
                onSelect={(item) => {
                  setTempValue(item?.value);
                  handleFieldSave();
                }}
              />
            </Box>
          ) : (
            <Box>
              <Text>
                {getTopologyIcon(config?.topology)} {config?.topology}
              </Text>
              <Text dimColor>
                {' '}
                - {getTopologyDescription(config?.topology)}
              </Text>
            </Box>
          )}
        </Box>

        {/* Max Agents Configuration */}
        <Box marginBottom={1}>
          <Box width={20}>
            <Text color={editingField === 'maxAgents' ? 'cyan' : 'yellow'}>
              [A] Max Agents:
            </Text>
          </Box>
          {editingField === 'maxAgents' ? (
            <Box>
              <Text>Enter count: </Text>
              <TextInput
                value={tempValue}
                onChange={setTempValue}
                onSubmit={handleFieldSave}
                placeholder="1-50"
              />
            </Box>
          ) : (
            <Box>
              <Text>🤖 {config?.maxAgents} agents</Text>
              <Text dimColor>
                {' '}
                (recommended: {Math.ceil(config?.maxAgents * 0.8)}-
                {Math.ceil(config?.maxAgents * 1.2)})
              </Text>
            </Box>
          )}
        </Box>

        {/* Resource Limits */}
        <Box marginBottom={1}>
          <Box width={20}>
            <Text color={editingField === 'memory' ? 'cyan' : 'yellow'}>
              [M] Memory:
            </Text>
          </Box>
          {editingField === 'memory' ? (
            <Box>
              <Text>Enter limit: </Text>
              <TextInput
                value={tempValue}
                onChange={setTempValue}
                onSubmit={handleFieldSave}
                placeholder="512MB, 1GB, 2GB"
              />
            </Box>
          ) : (
            <Box>
              <Text>💾 {config?.resourceLimits?.memory}</Text>
            </Box>
          )}
        </Box>

        <Box marginBottom={1}>
          <Box width={20}>
            <Text color={editingField === 'cpu' ? 'cyan' : 'yellow'}>
              [C] CPU Cores:
            </Text>
          </Box>
          {editingField === 'cpu' ? (
            <Box>
              <Text>Enter cores: </Text>
              <TextInput
                value={tempValue}
                onChange={setTempValue}
                onSubmit={handleFieldSave}
                placeholder="1-16"
              />
            </Box>
          ) : (
            <Box>
              <Text>⚡ {config?.resourceLimits?.cpu} cores</Text>
            </Box>
          )}
        </Box>

        {/* Auto Scaling */}
        <Box marginBottom={1}>
          <Box width={20}>
            <Text color="yellow">[S] Auto Scale:</Text>
          </Box>
          <Box>
            <Text color={config?.enableAutoScaling ? 'green' : 'red'}>
              {config?.enableAutoScaling ? '✅ Enabled' : '❌ Disabled'}
            </Text>
            <Text dimColor>
              {config?.enableAutoScaling
                ? ' - Agents scale based on workload'
                : ' - Fixed agent count'}
            </Text>
          </Box>
        </Box>

        {/* Persistence Configuration */}
        <Box marginBottom={1}>
          <Box width={20}>
            <Text color={editingField === 'persistence' ? 'cyan' : 'yellow'}>
              [P] Persistence:
            </Text>
          </Box>
          {editingField === 'persistence' ? (
            <Box>
              <Text>Select: </Text>
              <SelectInput
                items={[
                  { label: '📄 JSON (Simple)', value: 'json' },
                  { label: '🗃️  SQLite (Structured)', value: 'sqlite' },
                  { label: '🚀 LanceDB (Vector)', value: 'lancedb' },
                ]}
                onSelect={(item) => {
                  setTempValue(item?.value);
                  handleFieldSave();
                }}
              />
            </Box>
          ) : (
            <Box>
              <Text>
                {config.persistence === 'json' && '📄 JSON'}
                {config.persistence === 'sqlite' && '🗃️  SQLite'}
                {config.persistence === 'lancedb' && '🚀 LanceDB'}{' '}
                {config?.persistence}
              </Text>
              <Text dimColor>
                {config.persistence === 'json' && ' - Simple file storage'}
                {config.persistence === 'sqlite' && ' - Structured database'}
                {config.persistence === 'lancedb' &&
                  ' - Vector database with ML'}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>
          {editingField
            ? 'ENTER Save • ESC Cancel'
            : 'T/A/M/C/S/P Edit fields • Use letters to modify settings'}
        </Text>
      </Box>
    </Box>
  );
};
