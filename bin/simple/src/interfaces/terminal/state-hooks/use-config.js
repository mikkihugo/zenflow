import { useEffect, useState } from 'react';
import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('ConfigHook');
const defaultConfig = {
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
export const useConfig = () => {
    const [config, setConfig] = useState(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(undefined);
    useEffect(() => {
        loadConfig();
    }, [loadConfig]);
    const loadConfig = async () => {
        try {
            setIsLoading(true);
            setError(undefined);
            const loadedConfig = await loadConfigFromFile();
            if (loadedConfig) {
                setConfig({ ...defaultConfig, ...loadedConfig });
            }
            else {
                setConfig(defaultConfig);
            }
            logger.debug('Terminal configuration loaded successfully');
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to load configuration');
            logger.error('Failed to load terminal configuration:', error);
            setError(error);
            setConfig(defaultConfig);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadConfigFromFile = async () => {
        try {
            const configPaths = [
                './.claude/terminal-config.json',
                './config/terminal.json',
                `${process.env['HOME']}/.claude-zen/terminal-config.json`,
            ];
            for (const configPath of configPaths) {
                try {
                    const fs = await import('node:fs/promises');
                    const configData = await fs.readFile(configPath, 'utf-8');
                    const parsedConfig = JSON.parse(configData);
                    if (parsedConfig?.terminal) {
                        return parsedConfig?.terminal;
                    }
                    if (parsedConfig?.theme || parsedConfig?.swarmConfig) {
                        return parsedConfig;
                    }
                }
                catch (_err) { }
            }
            return null;
        }
        catch (err) {
            logger.warn('Could not load terminal config from file:', err);
            return null;
        }
    };
    const saveConfigToFile = async (newConfig) => {
        try {
            const fs = await import('node:fs/promises');
            const path = await import('node:path');
            const configDir = './.claude';
            try {
                await fs.mkdir(configDir, { recursive: true });
            }
            catch (_err) {
            }
            const configPath = path.join(configDir, 'terminal-config.json');
            const configData = JSON.stringify({ terminal: newConfig }, null, 2);
            await fs.writeFile(configPath, configData, 'utf-8');
            logger.debug('Terminal configuration saved to file');
        }
        catch (err) {
            logger.warn('Could not save terminal config to file:', err);
        }
    };
    const updateConfig = async (updates) => {
        try {
            const newConfig = { ...config, ...updates };
            setConfig(newConfig);
            await saveConfigToFile(newConfig);
            logger.debug('Terminal configuration updated:', updates);
        }
        catch (err) {
            const error = err instanceof Error
                ? err
                : new Error('Failed to update configuration');
            logger.error('Failed to update terminal configuration:', error);
            setError(error);
            throw error;
        }
    };
    const updateUIConfig = async (updates) => {
        await updateConfig({
            ui: { ...config?.ui, ...updates },
        });
    };
    const updateSwarmConfig = async (updates) => {
        await updateConfig({
            swarmConfig: { ...config?.swarmConfig, ...updates },
        });
    };
    const resetConfig = async () => {
        try {
            setConfig(defaultConfig);
            await saveConfigToFile(defaultConfig);
            logger.debug('Terminal configuration reset to defaults');
        }
        catch (err) {
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
//# sourceMappingURL=use-config.js.map