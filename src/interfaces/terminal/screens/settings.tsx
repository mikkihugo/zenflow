/**
 * Settings Screen.
 *
 * System configuration and preferences management interface.
 * Allows users to modify various system settings.
 */

import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Header,
  InteractiveFooter,
  LoadingSpinner,
  StatusBadge,
  type SwarmStatus,
} from '../components/index/index.js';

export interface SystemSetting {
  key: string;
  name: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
  category: 'general' | 'swarm' | 'performance' | 'security';
}

export interface SettingsProps {
  swarmStatus?: SwarmStatus;
  onBack: () => void;
  onExit: () => void;
}

interface MenuItem {
  label: string;
  value: string;
  description?: string;
}

export const Settings: React.FC<SettingsProps> = ({
  swarmStatus,
  onBack,
  onExit,
}) => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');

  // Mock settings data
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSettings([
        // General Settings
        {
          key: 'debug_mode',
          name: 'Debug Mode',
          value: true,
          type: 'boolean',
          description: 'Enable detailed debugging information',
          category: 'general',
        },
        {
          key: 'log_level',
          name: 'Log Level',
          value: 'info',
          type: 'select',
          options: ['debug', 'info', 'warn', 'error'],
          description: 'Set the minimum logging level',
          category: 'general',
        },
        {
          key: 'auto_save',
          name: 'Auto Save',
          value: true,
          type: 'boolean',
          description: 'Automatically save configurations',
          category: 'general',
        },

        // Swarm Settings
        {
          key: 'max_agents',
          name: 'Max Agents',
          value: 10,
          type: 'number',
          description: 'Maximum number of agents in swarm',
          category: 'swarm',
        },
        {
          key: 'default_topology',
          name: 'Default Topology',
          value: 'hierarchical',
          type: 'select',
          options: ['mesh', 'hierarchical', 'ring', 'star'],
          description: 'Default swarm topology for new swarms',
          category: 'swarm',
        },
        {
          key: 'agent_timeout',
          name: 'Agent Timeout',
          value: 30000,
          type: 'number',
          description: 'Agent task timeout in milliseconds',
          category: 'swarm',
        },

        // Performance Settings
        {
          key: 'parallel_execution',
          name: 'Parallel Execution',
          value: true,
          type: 'boolean',
          description: 'Enable parallel task execution',
          category: 'performance',
        },
        {
          key: 'cache_size',
          name: 'Cache Size (MB)',
          value: 256,
          type: 'number',
          description: 'Maximum cache size in megabytes',
          category: 'performance',
        },
        {
          key: 'refresh_interval',
          name: 'Refresh Interval (ms)',
          value: 2000,
          type: 'number',
          description: 'UI refresh interval in milliseconds',
          category: 'performance',
        },

        // Security Settings
        {
          key: 'secure_mode',
          name: 'Secure Mode',
          value: false,
          type: 'boolean',
          description: 'Enable additional security measures',
          category: 'security',
        },
        {
          key: 'api_rate_limit',
          name: 'API Rate Limit',
          value: 100,
          type: 'number',
          description: 'API requests per minute limit',
          category: 'security',
        },
      ]);

      setIsLoading(false);
    };

    loadSettings();
  }, []);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      onBack();
    }
  });

  const categories = [
    { key: 'general', name: 'General', icon: '⚙️' },
    { key: 'swarm', name: 'Swarm', icon: '🐝' },
    { key: 'performance', name: 'Performance', icon: '⚡' },
    { key: 'security', name: 'Security', icon: '🔒' },
  ];

  const menuItems: MenuItem[] = [
    ...categories.map((cat) => ({
      label: `${cat.icon} ${cat.name} Settings`,
      value: `category-${cat.key}`,
      description: `Configure ${cat.name.toLowerCase()} settings`,
    })),
    {
      label: '💾 Save Configuration',
      value: 'save',
      description: 'Save all settings to configuration file',
    },
    {
      label: '🔄 Reset to Defaults',
      value: 'reset',
      description: 'Reset all settings to default values',
    },
    {
      label: '📤 Export Settings',
      value: 'export',
      description: 'Export settings to file',
    },
    {
      label: '📥 Import Settings',
      value: 'import',
      description: 'Import settings from file',
    },
    {
      label: '🔙 Back to Main Menu',
      value: 'back',
      description: 'Return to the main menu',
    },
  ];

  const handleSelect = (item: MenuItem) => {
    if (item.value.startsWith('category-')) {
      const category = item.value.replace('category-', '');
      setSelectedCategory(category);
    } else {
      switch (item.value) {
        case 'back':
          onBack();
          break;
        case 'save':
        case 'reset':
        case 'export':
        case 'import':
          // Handle other actions
          break;
        default:
          break;
      }
    }
  };

  const formatValue = (setting: SystemSetting) => {
    if (setting.type === 'boolean') {
      return setting.value ? '✅ Enabled' : '❌ Disabled';
    }
    return setting.value.toString();
  };

  const getSettingIcon = (category: string) => {
    const categoryData = categories.find((c) => c.key === category);
    return categoryData?.icon || '⚙️';
  };

  const renderSettingsTable = () => {
    const filteredSettings =
      selectedCategory === 'all'
        ? settings
        : settings.filter((s) => s.category === selectedCategory);

    return (
      <Box flexDirection="column" marginBottom={2}>
        <Text bold>
          {getSettingIcon(selectedCategory)}{' '}
          {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}{' '}
          Settings:
        </Text>
        <Box marginBottom={1} />

        {filteredSettings.map((setting) => (
          <Box
            key={setting.key}
            justifyContent="space-between"
            marginBottom={1}
          >
            <Box flexDirection="column" width="70%">
              <Text bold color="cyan">
                {setting.name}
              </Text>
              <Text dimColor>{setting.description}</Text>
            </Box>
            <Box alignItems="center" width="30%">
              <Text color="green">{formatValue(setting)}</Text>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderStats = () => (
    <Box flexDirection="column" marginBottom={2}>
      <Text bold>📊 Configuration Overview:</Text>
      <Box marginBottom={1} />

      <Box flexDirection="row" justifyContent="space-between">
        {categories.map((cat) => {
          const count = settings.filter((s) => s.category === cat.key).length;
          return (
            <Box key={cat.key} flexDirection="column" width="20%">
              <Text color="cyan">
                {cat.icon} {cat.name}:
              </Text>
              <Text bold>{count} settings</Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Box flexDirection="column" height="100%">
        <Header title="Settings" swarmStatus={swarmStatus} showBorder={true} />
        <Box flexGrow={1} justifyContent="center" alignItems="center">
          <LoadingSpinner text="Loading system settings..." />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      <Header
        title="System Configuration & Settings"
        swarmStatus={swarmStatus}
        showBorder={true}
      />

      <Box flexGrow={1} paddingX={2}>
        <Box flexDirection="column" width="100%">
          {renderStats()}
          {selectedCategory !== 'general' && renderSettingsTable()}

          <Text bold>Select a category or action:</Text>
          <Box marginBottom={1} />

          <SelectInput
            items={menuItems}
            onSelect={handleSelect}
            itemComponent={({ isSelected, label }) => (
              <Text color={isSelected ? 'cyan' : 'white'}>
                {isSelected ? '▶ ' : '  '}
                {label}
              </Text>
            )}
          />
        </Box>
      </Box>

      <InteractiveFooter
        currentScreen="Settings"
        availableScreens={[
          { key: '↑↓', name: 'Navigate' },
          { key: 'Enter', name: 'Select' },
          { key: 'Esc/Q', name: 'Back' },
        ]}
        status={`${settings.length} settings • ${categories.length} categories`}
      />
    </Box>
  );
};

export default Settings;
