/**
 * Configuration State Hook
 *
 * React hook for managing terminal interface configuration state.
 * Note: This is a React hook, NOT a Claude Code hook (which belongs in templates/).
 */

import { useEffect, useState } from 'react';
import { createSimpleLogger } from '../../../core/logger';

const logger = createSimpleLogger('ConfigHook');

export interface TerminalConfig {
  theme: 'dark' | 'light';
  refreshInterval: number;
  verbose: boolean;
  showAnimations: boolean;
  swarmConfig: {
    defaultTopology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    maxAgents: number;
    autoRefresh: boolean;
    showAdvancedMetrics: boolean;
  };
  ui: {
    showBorders: boolean;
    centerAlign: boolean;
    compactMode: boolean;
  };
}

const defaultConfig: TerminalConfig = {
  theme: 'dark',
  refreshInterval: 3000,
  verbose: false,
  showAnimations: true,
  swarmConfig: {
    defaultTopology: 'mesh',
    maxAgents: 10,
    autoRefresh: true,
    showAdvancedMetrics: false,
  },
  ui: {
    showBorders: true,
    centerAlign: false,
    compactMode: false,
  },
};

export interface UseConfigReturn {
  data: TerminalConfig;
  isLoading: boolean;
  error?: Error;
  updateConfig: (updates: Partial<TerminalConfig>) => Promise<void>;
  updateUIConfig: (updates: Partial<TerminalConfig['ui']>) => Promise<void>;
  updateSwarmConfig: (updates: Partial<TerminalConfig['swarmConfig']>) => Promise<void>;
  resetConfig: () => Promise<void>;
}

/**
 * Configuration React Hook
 *
 * Provides reactive configuration management for terminal interface components.
 */
export const useConfig = (): UseConfigReturn => {
  const [config, setConfig] = useState<TerminalConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      // Try to load config from file system
      const loadedConfig = await loadConfigFromFile();
      if (loadedConfig) {
        setConfig({ ...defaultConfig, ...loadedConfig });
      } else {
        setConfig(defaultConfig);
      }

      logger.debug('Terminal configuration loaded successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load configuration');
      logger.error('Failed to load terminal configuration:', error);
      setError(error);
      setConfig(defaultConfig); // Fallback to default
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfigFromFile = async (): Promise<Partial<TerminalConfig> | null> => {
    try {
      // Try different config locations
      const configPaths = [
        './.claude/terminal-config.json',
        './config/terminal.json',
        process.env.HOME + '/.claude-zen/terminal-config.json',
      ];

      for (const configPath of configPaths) {
        try {
          const fs = await import('fs/promises');
          const configData = await fs.readFile(configPath, 'utf-8');
          const parsedConfig = JSON.parse(configData);

          if (parsedConfig.terminal) {
            return parsedConfig.terminal;
          } else if (parsedConfig.theme || parsedConfig.swarmConfig) {
            return parsedConfig;
          }
        } catch (err) {}
      }

      return null;
    } catch (err) {
      logger.warn('Could not load terminal config from file:', err);
      return null;
    }
  };

  const saveConfigToFile = async (newConfig: TerminalConfig) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      // Ensure .claude directory exists
      const configDir = './.claude';
      try {
        await fs.mkdir(configDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      const configPath = path.join(configDir, 'terminal-config.json');
      const configData = JSON.stringify({ terminal: newConfig }, null, 2);

      await fs.writeFile(configPath, configData, 'utf-8');
      logger.debug('Terminal configuration saved to file');
    } catch (err) {
      logger.warn('Could not save terminal config to file:', err);
      // Don't throw error - config updates should still work in memory
    }
  };

  const updateConfig = async (updates: Partial<TerminalConfig>) => {
    try {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      await saveConfigToFile(newConfig);
      logger.debug('Terminal configuration updated:', updates);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update configuration');
      logger.error('Failed to update terminal configuration:', error);
      setError(error);
      throw error;
    }
  };

  const updateUIConfig = async (updates: Partial<TerminalConfig['ui']>) => {
    await updateConfig({
      ui: { ...config.ui, ...updates },
    });
  };

  const updateSwarmConfig = async (updates: Partial<TerminalConfig['swarmConfig']>) => {
    await updateConfig({
      swarmConfig: { ...config.swarmConfig, ...updates },
    });
  };

  const resetConfig = async () => {
    try {
      setConfig(defaultConfig);
      await saveConfigToFile(defaultConfig);
      logger.debug('Terminal configuration reset to defaults');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reset configuration');
      logger.error('Failed to reset terminal configuration:', error);
      setError(error);
      throw error;
    }
  };

  return {
    data: config,
    isLoading,
    error,
    updateConfig,
    updateUIConfig,
    updateSwarmConfig,
    resetConfig,
  };
};

export default useConfig;
