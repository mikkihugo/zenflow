import { useCallback, useEffect, useState } from 'react';
import type { UseAsyncState } from './index';

// Configuration data types
export interface SwarmConfig {
  maxAgents: number;
  defaultTimeout: number;
  retryAttempts: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  autoRestart: boolean;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
}

export interface UIConfig {
  theme: 'dark' | 'light' | 'auto';
  refreshInterval: number;
  maxLogLines: number;
  showAdvancedMetrics: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
}

export interface ConfigData {
  swarm: SwarmConfig;
  ui: UIConfig;
  version: string;
  lastModified: Date;
}

export interface ConfigHook extends UseAsyncState<ConfigData> {
  swarmConfig: SwarmConfig;
  uiConfig: UIConfig;
  updateSwarmConfig: (config: Partial<SwarmConfig>) => Promise<void>;
  updateUIConfig: (config: Partial<UIConfig>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isDirty: boolean;
  save: () => Promise<void>;
}

export interface UseConfigOptions {
  autoSave?: boolean;
  saveDelay?: number;
  onConfigChange?: (config: ConfigData) => void;
  onError?: (error: Error) => void;
}

// Default configuration values
const DEFAULT_SWARM_CONFIG: SwarmConfig = {
  maxAgents: 10,
  defaultTimeout: 30000,
  retryAttempts: 3,
  logLevel: 'info',
  enableMetrics: true,
  autoRestart: true,
  topology: 'hierarchical',
};

const DEFAULT_UI_CONFIG: UIConfig = {
  theme: 'dark',
  refreshInterval: 5000,
  maxLogLines: 1000,
  showAdvancedMetrics: false,
  animationsEnabled: true,
  compactMode: false,
};

/**
 * Custom hook for managing application configuration
 *
 * Provides configuration management with persistence,
 * validation, and real-time updates.
 */
export const useConfig = (options: UseConfigOptions = {}): ConfigHook => {
  const { autoSave = true, saveDelay = 1000, onConfigChange, onError } = options;

  const [data, setData] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Mock storage functions - replace with actual storage implementation
  const loadConfig = useCallback(async (): Promise<ConfigData> => {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      // Try to load from localStorage (or other storage)
      const stored = localStorage.getItem('claude-flow-config');

      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          swarm: { ...DEFAULT_SWARM_CONFIG, ...parsed.swarm },
          ui: { ...DEFAULT_UI_CONFIG, ...parsed.ui },
          version: parsed.version || '1.0.0',
          lastModified: new Date(parsed.lastModified || Date.now()),
        };
      }
    } catch (err) {
      console.warn('Failed to load stored config, using defaults:', err);
    }

    // Return default configuration
    return {
      swarm: DEFAULT_SWARM_CONFIG,
      ui: DEFAULT_UI_CONFIG,
      version: '1.0.0',
      lastModified: new Date(),
    };
  }, []);

  const saveConfig = useCallback(async (config: ConfigData): Promise<void> => {
    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const toStore = {
        swarm: config.swarm,
        ui: config.ui,
        version: config.version,
        lastModified: config.lastModified.toISOString(),
      };

      localStorage.setItem('claude-flow-config', JSON.stringify(toStore));
    } catch (err) {
      throw new Error(
        `Failed to save configuration: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }, []);

  const refetch = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const configData = await loadConfig();
      setData(configData);
      setIsDirty(false);
      onConfigChange?.(configData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load configuration');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [loading, loadConfig, onConfigChange, onError]);

  const save = useCallback(async () => {
    if (!data || !isDirty) return;

    try {
      const updatedConfig = {
        ...data,
        lastModified: new Date(),
      };

      await saveConfig(updatedConfig);
      setData(updatedConfig);
      setIsDirty(false);
      onConfigChange?.(updatedConfig);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save configuration');
      setError(error);
      onError?.(error);
    }
  }, [data, isDirty, saveConfig, onConfigChange, onError]);

  const updateSwarmConfig = useCallback(
    async (updates: Partial<SwarmConfig>) => {
      if (!data) return;

      const newConfig = {
        ...data,
        swarm: { ...data.swarm, ...updates },
      };

      setData(newConfig);
      setIsDirty(true);

      if (autoSave) {
        // Debounced save
        setTimeout(() => {
          if (isDirty) {
            save();
          }
        }, saveDelay);
      }
    },
    [data, autoSave, saveDelay, save, isDirty]
  );

  const updateUIConfig = useCallback(
    async (updates: Partial<UIConfig>) => {
      if (!data) return;

      const newConfig = {
        ...data,
        ui: { ...data.ui, ...updates },
      };

      setData(newConfig);
      setIsDirty(true);

      if (autoSave) {
        // Debounced save
        setTimeout(() => {
          if (isDirty) {
            save();
          }
        }, saveDelay);
      }
    },
    [data, autoSave, saveDelay, save, isDirty]
  );

  const resetToDefaults = useCallback(async () => {
    const defaultConfig: ConfigData = {
      swarm: DEFAULT_SWARM_CONFIG,
      ui: DEFAULT_UI_CONFIG,
      version: '1.0.0',
      lastModified: new Date(),
    };

    setData(defaultConfig);
    setIsDirty(true);

    if (autoSave) {
      await save();
    }
  }, [autoSave, save]);

  // Load configuration on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    swarmConfig: data?.swarm || DEFAULT_SWARM_CONFIG,
    uiConfig: data?.ui || DEFAULT_UI_CONFIG,
    updateSwarmConfig,
    updateUIConfig,
    resetToDefaults,
    isDirty,
    save,
  };
};

// Utility functions for configuration validation
export const ConfigValidation = {
  validateSwarmConfig: (config: Partial<SwarmConfig>): string[] => {
    const errors: string[] = [];

    if (config.maxAgents !== undefined && (config.maxAgents < 1 || config.maxAgents > 100)) {
      errors.push('maxAgents must be between 1 and 100');
    }

    if (config.defaultTimeout !== undefined && config.defaultTimeout < 1000) {
      errors.push('defaultTimeout must be at least 1000ms');
    }

    if (
      config.retryAttempts !== undefined &&
      (config.retryAttempts < 0 || config.retryAttempts > 10)
    ) {
      errors.push('retryAttempts must be between 0 and 10');
    }

    return errors;
  },

  validateUIConfig: (config: Partial<UIConfig>): string[] => {
    const errors: string[] = [];

    if (config.refreshInterval !== undefined && config.refreshInterval < 1000) {
      errors.push('refreshInterval must be at least 1000ms');
    }

    if (
      config.maxLogLines !== undefined &&
      (config.maxLogLines < 100 || config.maxLogLines > 10000)
    ) {
      errors.push('maxLogLines must be between 100 and 10000');
    }

    return errors;
  },
};

// Default export for convenience
export default useConfig;
