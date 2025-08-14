import { getLogger } from './logging-config.ts';
const logger = getLogger('src-config-manager');
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_CONFIG } from './defaults.ts';
import { ConfigurationLoader } from './loader.ts';
import { ConfigValidator } from './validator.ts';
export class ConfigurationManager extends EventEmitter {
    static instance = null;
    config;
    loader = new ConfigurationLoader();
    validator = new ConfigValidator();
    configPaths = [];
    watchers = [];
    configHistory = [];
    maxHistorySize = 10;
    isLoading = false;
    constructor() {
        super();
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        this.setupErrorHandling();
    }
    static getInstance() {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }
    async initialize(configPaths) {
        if (this.isLoading) {
            throw new Error('Configuration is already being loaded');
        }
        this.isLoading = true;
        try {
            const result = await this.loader.loadConfiguration(configPaths);
            if (result?.validation?.valid) {
                this.config = result?.config;
                if (result?.validation?.warnings.length > 0) {
                    logger.warn('⚠️ Configuration warnings:');
                    result?.validation?.warnings?.forEach((warning) => logger.warn(`  - ${warning}`));
                }
            }
            else {
                logger.error('❌ Configuration validation failed:');
                result?.validation?.errors?.forEach((error) => logger.error(`  - ${error}`));
                if (result?.validation?.warnings.length > 0) {
                    logger.warn('⚠️ Configuration warnings:');
                    result?.validation?.warnings?.forEach((warning) => logger.warn(`  - ${warning}`));
                }
                this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
            }
            this.configPaths = configPaths || [];
            this.setupFileWatchers();
            this.addToHistory(this.config);
            this.emit('config:loaded', {
                config: this.config,
                validation: result?.validation,
            });
            return result?.validation;
        }
        finally {
            this.isLoading = false;
        }
    }
    getConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }
    getSection(section) {
        return JSON.parse(JSON.stringify(this.config[section]));
    }
    get(path) {
        return path
            .split('.')
            .reduce((current, key) => current?.[key], this.config);
    }
    update(path, value) {
        const oldValue = this.get(path);
        const testConfig = JSON.parse(JSON.stringify(this.config));
        this.setNestedValue(testConfig, path, value);
        const validation = this.validator.validate(testConfig);
        if (!validation.valid) {
            return validation;
        }
        this.setNestedValue(this.config, path, value);
        this.addToHistory(this.config);
        const changeEvent = {
            path,
            oldValue,
            newValue: value,
            source: 'runtime',
            timestamp: Date.now(),
        };
        this.emit('config:changed', changeEvent);
        return validation;
    }
    async reload() {
        return this.initialize(this.configPaths);
    }
    validate() {
        return this.validator.validate(this.config);
    }
    getHistory() {
        return [...this.configHistory];
    }
    rollback(steps = 1) {
        if (this.configHistory.length <= steps) {
            return false;
        }
        const targetConfig = this.configHistory[this.configHistory.length - steps - 1];
        const validation = targetConfig
            ? this.validator.validate(targetConfig)
            : { valid: false, errors: ['Invalid target config'] };
        if (!validation.valid) {
            logger.error('Cannot rollback to invalid configuration');
            return false;
        }
        this.config = JSON.parse(JSON.stringify(targetConfig));
        this.emit('config:rollback', { config: this.config, steps });
        return true;
    }
    export(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.config, null, 2);
        }
        return this.toSimpleYaml(this.config);
    }
    getSourcesInfo() {
        return this.loader.getSources();
    }
    destroy() {
        this.watchers.forEach((watcher) => watcher.close());
        this.watchers = [];
        this.configHistory = [];
        this.removeAllListeners();
        ConfigurationManager.instance = null;
    }
    setupFileWatchers() {
        this.watchers.forEach((watcher) => watcher.close());
        this.watchers = [];
        const configFiles = [
            './config/claude-zen.json',
            './claude-zen.config.json',
            ...this.configPaths,
        ];
        for (const configFile of configFiles) {
            try {
                const resolvedPath = path.resolve(configFile);
                if (fs.existsSync(resolvedPath)) {
                    const watcher = fs.watch(resolvedPath, (eventType) => {
                        if (eventType === 'change') {
                            setTimeout(() => {
                                this.reload().catch((error) => {
                                    logger.error('Failed to reload configuration:', error);
                                });
                            }, 1000);
                        }
                    });
                    this.watchers.push(watcher);
                }
            }
            catch (error) {
                logger.warn(`Failed to watch config file ${configFile}:`, error);
            }
        }
    }
    setupErrorHandling() {
        this.on('error', (error) => {
            logger.error('Configuration manager error:', error);
        });
        process.on('SIGINT', () => this.destroy());
        process.on('SIGTERM', () => this.destroy());
    }
    addToHistory(config) {
        this.configHistory.push(JSON.parse(JSON.stringify(config)));
        if (this.configHistory.length > this.maxHistorySize) {
            this.configHistory = this.configHistory.slice(-this.maxHistorySize);
        }
    }
    setNestedValue(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (part && (!(part in current) || typeof current?.[part] !== 'object')) {
                current[part] = {};
            }
            if (part) {
                current = current?.[part];
            }
        }
        const lastPart = parts[parts.length - 1];
        if (lastPart) {
            current[lastPart] = value;
        }
    }
    toSimpleYaml(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let yaml = '';
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value)) {
                yaml += `${spaces}${key}:\n${this.toSimpleYaml(value, indent + 1)}`;
            }
            else if (Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                for (const item of value) {
                    yaml += `${spaces}  - ${item}\n`;
                }
            }
            else {
                yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
            }
        }
        return yaml;
    }
}
export const configManager = ConfigurationManager.getInstance();
//# sourceMappingURL=manager.js.map