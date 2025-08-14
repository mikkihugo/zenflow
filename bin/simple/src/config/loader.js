import { getLogger } from './logging-config.ts';
const logger = getLogger('ConfigLoader');
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DEFAULT_CONFIG, ENV_MAPPINGS } from './defaults.ts';
import { ConfigValidator } from './validator.ts';
export class ConfigurationLoader {
    sources = [];
    validator = new ConfigValidator();
    async loadConfiguration(configPaths) {
        this.sources = [];
        this.addSource({
            type: 'defaults',
            priority: 0,
            data: DEFAULT_CONFIG,
        });
        const defaultPaths = [
            './config/claude-zen.json',
            './claude-zen.config.json',
            '~/.claude-zen/config.json',
            '/etc/claude-zen/config.json',
        ];
        const pathsToTry = configPaths || defaultPaths;
        for (const configPath of pathsToTry) {
            await this.loadFromFile(configPath);
        }
        this.loadFromEnvironment();
        this.loadFromCliArgs();
        const mergedConfig = this.mergeSources();
        const validation = this.validator.validate(mergedConfig);
        return {
            config: mergedConfig,
            validation,
        };
    }
    addSource(source) {
        this.sources.push(source);
        this.sources.sort((a, b) => a.priority - b.priority);
    }
    async loadFromFile(filePath) {
        try {
            const resolvedPath = path.resolve(filePath.replace('~', process.env['HOME'] || '~'));
            if (!fs.existsSync(resolvedPath)) {
                return;
            }
            const content = fs.readFileSync(resolvedPath, 'utf8');
            let data;
            if (filePath.endsWith('.json')) {
                data = JSON.parse(content);
            }
            else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
                const module = await import(resolvedPath);
                data = module.default || module;
            }
            else {
                logger.warn(`Unsupported config file format: ${filePath}`);
                return;
            }
            this.addSource({
                type: 'file',
                priority: 10,
                data,
            });
        }
        catch (error) {
            logger.warn(`Failed to load config from ${filePath}:`, error);
        }
    }
    loadFromEnvironment() {
        const envConfig = {};
        for (const [envVar, mapping] of Object.entries(ENV_MAPPINGS)) {
            const value = process.env[envVar];
            if (value !== undefined) {
                let parsedValue = value;
                switch (mapping.type) {
                    case 'number':
                        parsedValue = Number(value);
                        if (Number.isNaN(parsedValue)) {
                            logger.warn(`Invalid number value for ${envVar}: ${value}`);
                            continue;
                        }
                        break;
                    case 'boolean':
                        parsedValue = value.toLowerCase() === 'true' || value === '1';
                        break;
                    case 'array':
                        if (mapping.parser) {
                            parsedValue = mapping.parser(value);
                        }
                        else {
                            parsedValue = value.split(',').map((v) => v.trim());
                        }
                        break;
                    default:
                        parsedValue = value;
                        break;
                }
                this.setNestedProperty(envConfig, mapping.path, parsedValue);
            }
        }
        if (Object.keys(envConfig).length > 0) {
            this.addSource({
                type: 'env',
                priority: 20,
                data: envConfig,
            });
        }
    }
    loadFromCliArgs() {
        const args = process.argv.slice(2);
        const cliConfig = {};
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg?.startsWith('--config.')) {
                const configPath = arg.substring(9);
                const value = args[i + 1];
                if (value && !value.startsWith('--')) {
                    let parsedValue = value;
                    if (value.startsWith('{') || value.startsWith('[')) {
                        try {
                            parsedValue = JSON.parse(value);
                        }
                        catch {
                        }
                    }
                    else if (value === 'true' || value === 'false') {
                        parsedValue = value === 'true';
                    }
                    else if (!Number.isNaN(Number(value))) {
                        parsedValue = Number(value);
                    }
                    this.setNestedProperty(cliConfig, configPath, parsedValue);
                    i++;
                }
            }
        }
        if (Object.keys(cliConfig).length > 0) {
            this.addSource({
                type: 'cli',
                priority: 30,
                data: cliConfig,
            });
        }
    }
    mergeSources() {
        let mergedConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        for (const source of this.sources) {
            mergedConfig = this.deepMerge(mergedConfig, source.data);
        }
        return mergedConfig;
    }
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] &&
                typeof source[key] === 'object' &&
                !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result?.[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
    setNestedProperty(obj, path, value) {
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
    getSources() {
        return [...this.sources];
    }
}
//# sourceMappingURL=loader.js.map