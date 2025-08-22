/**
 * @fileoverview Modern Configuration System using Convict + Dotenv
 *
 * Professional configuration management with schema validation, environment coercion,
 * and structured configuration loading. Replaces custom ZEN environment variable system.
 *
 * Features:
 * - JSON schema validation with convict
 * - Automatic environment variable loading with dotenv
 * - Type-safe configuration with TypeScript
 * - Documentation generation from schema
 * - Environment-specific configuration files
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import convict from 'convict';
import * as dotenv from 'dotenv';

import { getLogger } from './src/logging';

const logger = getLogger('config');

// Load environment variables
dotenv.config();

/**
 * Configuration schema definition with convict
 */
const configSchema = {
  // Logging configuration
  logging: {
    level: {
      doc: 'The logging level',
      format: ['error', 'warn', 'info', 'debug', 'trace'],
      default: 'info',
      env: 'ZEN_LOG_LEVEL',
    },
    console: {
      doc: 'Enable console logging',
      format: Boolean,
      default: true,
      env: 'ZEN_LOG_CONSOLE',
    },
    file: {
      doc: 'Enable file logging',
      format: Boolean,
      default: false,
      env: 'ZEN_LOG_FILE',
    },
    timestamp: {
      doc: 'Include timestamps in logs',
      format: Boolean,
      default: true,
      env: 'ZEN_LOG_TIMESTAMP',
    },
    format: {
      doc: 'Log format',
      format: ['text', 'json'],
      default: 'text',
      env: 'ZEN_LOG_FORMAT',
    },
  },

  // Metrics and monitoring
  metrics: {
    enabled: {
      doc: 'Enable metrics collection',
      format: Boolean,
      default: false,
      env: 'ZEN_ENABLE_METRICS',
    },
    interval: {
      doc: 'Metrics collection interval in milliseconds',
      format: 'int',
      default: 60000,
      env: 'ZEN_METRICS_INTERVAL',
    },
  },

  // Storage configuration
  storage: {
    backend: {
      doc: 'Storage backend type',
      format: ['memory', 'sqlite', 'lancedb', 'kuzu'],
      default: 'memory',
      env: 'ZEN_MEMORY_BACKEND',
    },
    dataDir: {
      doc: 'Base data directory for all project data',
      format: String,
      default: '.claude-zen/data',
      env: 'ZEN_DATA_DIR',
    },
    memoryDir: {
      doc: 'Memory storage directory (relative to dataDir)',
      format: String,
      default: 'memory',
      env: 'ZEN_MEMORY_DIR',
    },
    dbPath: {
      doc: 'Main database file path (relative to dataDir)',
      format: String,
      default: 'zen.db',
      env: 'ZEN_DB_PATH',
    },
    swarmDir: {
      doc: 'Swarm data directory (relative to dataDir)',
      format: String,
      default: 'swarms',
      env: 'ZEN_SWARM_DIR',
    },
    neuralDir: {
      doc: 'Neural network data directory (relative to dataDir)',
      format: String,
      default: 'neural',
      env: 'ZEN_NEURAL_DIR',
    },
    cacheDir: {
      doc: 'Cache directory (relative to dataDir)',
      format: String,
      default: 'cache',
      env: 'ZEN_CACHE_DIR',
    },
    logsDir: {
      doc: 'Log files directory (relative to dataDir)',
      format: String,
      default: 'logs',
      env: 'ZEN_LOGS_DIR',
    },
  },

  // Project and workspace
  project: {
    configDir: {
      doc: 'Project configuration directory',
      format: String,
      default: '.claude-zen' as const,
      env: 'ZEN_PROJECT_CONFIG_DIR',
    },
    workspaceDbPath: {
      doc: 'Workspace database path',
      format: String,
      default: '.claude-zen/workspace.db',
      env: 'ZEN_WORKSPACE_DB_PATH',
    },
    storeInUserHome: {
      doc: 'Store configuration in user home directory',
      format: Boolean,
      default: true,
      env: 'ZEN_STORE_CONFIG_IN_USER_HOME',
    },
  },

  // Neural and AI features
  neural: {
    learning: {
      doc: 'Enable neural learning features',
      format: Boolean,
      default: true,
      env: 'ZEN_NEURAL_LEARNING',
    },
    cacheSize: {
      doc: 'Neural cache size',
      format: 'int',
      default: 1000,
      env: 'ZEN_NEURAL_CACHE_SIZE',
    },
  },

  // Performance settings
  performance: {
    maxConcurrent: {
      doc: 'Maximum concurrent operations',
      format: 'int',
      default: 5,
      env: 'ZEN_MAX_CONCURRENT',
    },
    timeoutMs: {
      doc: 'Operation timeout in milliseconds',
      format: 'int',
      default: 300000,
      env: 'ZEN_TIMEOUT_MS',
    },
  },

  // Development settings
  development: {
    debug: {
      doc: 'Enable debug mode',
      format: Boolean,
      default: false,
      env: 'ZEN_DEBUG_MODE',
    },
    verboseErrors: {
      doc: 'Enable verbose error reporting',
      format: Boolean,
      default: false,
      env: 'ZEN_VERBOSE_ERRORS',
    },
  },
};

/**
 * TypeScript interfaces for configuration
 */
export interface LoggingConfig {
  level: 'error''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''warn''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''info''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''debug''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''trace';
  console: boolean;
  file: boolean;
  timestamp: boolean;
  format: 'text''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''json';
}

export interface MetricsConfig {
  enabled: boolean;
  interval: number;
}

export interface StorageConfig {
  backend: 'memory''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''sqlite''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''lancedb''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''kuzu';
  dataDir: string;
  memoryDir: string;
  dbPath: string;
  swarmDir: string;
  neuralDir: string;
  cacheDir: string;
  logsDir: string;
}

export interface ProjectConfig {
  configDir: string;
  workspaceDbPath: string;
  storeInUserHome: boolean;
}

export interface NeuralConfig {
  learning: boolean;
  cacheSize: number;
}

export interface PerformanceConfig {
  maxConcurrent: number;
  timeoutMs: number;
}

export interface DevelopmentConfig {
  debug: boolean;
  verboseErrors: boolean;
}

export interface Config {
  logging: LoggingConfig;
  metrics: MetricsConfig;
  storage: StorageConfig;
  project: ProjectConfig;
  neural: NeuralConfig;
  performance: PerformanceConfig;
  development: DevelopmentConfig;
  get(key: string, defaultValue?: any): any;
  set(key: string, value: any): void;
  has(key: string): boolean;
  toObject(): Record<string, any>;
  getSchema(): any;
  reload(): void;
}

/**
 * Ensure configuration directory exists with proper .gitignore
 */
function ensureConfigDirectory(configDir: string, isUserMode: boolean): void {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      logger.debug(`Created config directory: ${configDir}`);
    }

    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(configDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = isUserMode
        ? `# Claude Zen User Configuration Directory
# These files may contain sensitive data and should not be committed

# Configuration files
*.json
*.yaml
*.yml
*.toml

# Log files
*.log

# Cache and temporary files
cache/
tmp/
temp/

# Environment files
.env*

# Backup files
*.bak
*.backup

# OS generated files
.DS_Store
Thumbs.db
`
        : `# Claude Zen Repository Configuration Directory
# Repository-specific claude-zen configuration

# Configuration files (may contain sensitive data)
*.json
*.yaml
*.yml
*.toml

# Log files
*.log

# Cache and temporary files
cache/
tmp/
temp/

# Environment files
.env*

# Backup files
*.bak
*.backup
`;

      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
      logger.debug(`Created .gitignore in ${configDir}`);
    }

    // Create sample config file if no config exists
    const sampleConfigPath = path.join(configDir, 'config.sample.json');
    const mainConfigPath = path.join(configDir, 'config.json');

    if (!fs.existsSync(sampleConfigPath) && !fs.existsSync(mainConfigPath)) {
      const sampleConfig = {
        $schema: 'claude-zen-config',
        logging: {
          level: 'info',
          console: true,
          file: false,
          timestamp: true,
          format: 'text',
        },
        metrics: {
          enabled: false,
          interval: 60000,
        },
        storage: {
          backend: 'memory',
          memoryDir: './data/memory',
          dbPath: './data/zen.db',
        },
        neural: {
          learning: true,
          cacheSize: 1000,
        },
        performance: {
          maxConcurrent: 5,
          timeoutMs: 300000,
        },
        development: {
          debug: false,
          verboseErrors: false,
        },
      };

      fs.writeFileSync(
        sampleConfigPath,
        JSON.stringify(sampleConfig, null, 2),
        'utf8'
      );
      logger.debug(`Created sample config in ${configDir}`);
    }
  } catch (error) {
    // Don't fail configuration loading if directory creation fails
    logger.warn(`Failed to ensure config directory ${configDir}:`, error);
  }
}

/**
 * Ensure .claude-zen directory is ignored in repository .gitignore
 */
function ensureRepoGitignore(): void {
  try {
    const gitignorePath = '.gitignore';
    const zenIgnoreEntry = '.claude-zen/';

    let gitignoreContent = '';
    let needsUpdate = false;

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      // Check if .claude-zen is already ignored (exact match or with comments)
      const lines = gitignoreContent.split('\n');
      const hasZenIgnore = lines.some(
        (line) =>
          line.trim() === zenIgnoreEntry'''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' | ''''''''''''''''''''''''''''''''''''''''''''''''''line.trim() ==='.claude-zen''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' | ''''''''''''''''''''''''''''''''''''''''''''''''''line.trim() ==='.claude-zen/'
      );

      if (!hasZenIgnore) {
        needsUpdate = true;
      }
    } else {
      // Create new .gitignore
      needsUpdate = true;
    }

    if (needsUpdate) {
      const zenSection = `
# Claude Zen Configuration Directory
# Contains project-specific claude-zen settings and may include sensitive data
.claude-zen/
`;

      if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
        gitignoreContent += '\n';
      }

      gitignoreContent += zenSection;
      fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
      logger.debug('Added .claude-zen/ to repository .gitignore');
    }
  } catch (error) {
    // Don't fail configuration loading if .gitignore update fails
    logger.warn('Failed to update repository .gitignore:', error);
  }
}

/**
 * Create and validate configuration
 */
const config = convict(configSchema);

// Load configuration files from .claude-zen directory (user home or per-repo)
const env = process.env['NODE_ENV']'''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''development';

// Check environment variable or default to user home mode
const storeInUserHome =
  process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';

// Build configuration file paths based on mode (exclusive modes)
const configFiles: string[] = [];
let configDir: string;

if (storeInUserHome) {
  // Mode 1: User directory mode (default) - ONLY user configs, no local repo configs
  configDir = path.join(os.homedir(), '.claude-zen');
  configFiles.push(
    `${configDir}/config.json`, // Main user config
    `${configDir}/${env}.json` // Environment-specific user config
  );
} else {
  // Mode 2: Per-repository mode - ONLY local repo configs, no user configs
  configDir = '.claude-zen';
  configFiles.push(
    `${configDir}/config.json`, // Local repo config
    `${configDir}/${env}.json` // Local repo environment config
  );
}

// Ensure config directory exists and has .gitignore
ensureConfigDirectory(configDir, storeInUserHome);

// For repo mode, ensure .claude-zen is ignored in repository .gitignore
if (!storeInUserHome) {
  ensureRepoGitignore();
}

// Load configuration files in priority order
for (const file of configFiles) {
  try {
    if (fs.existsSync(file)) {
      config.loadFile(file);
      logger.debug(`Loaded configuration from ${file}`);
    }
  } catch (error) {
    // File exists but can't be loaded - this is an error
    logger.warn(
      `Configuration file ${file} exists but couldn't be loaded:`,
      error
    );
  }
}

// Log the configuration mode for debugging
logger.debug(
  `Configuration mode: ${storeInUserHome ? 'User directory (~/.claude-zen) - exclusive' : 'Per-repository (./.claude-zen) - exclusive'}`
);
if (storeInUserHome) {
  logger.debug(
    `User config directory: ${path.join(os.homedir(), '.claude-zen')}`
  );
}

// Validate configuration
try {
  config.validate({ allowed: 'strict' });
  logger.debug('Configuration validation successful');
} catch (error) {
  logger.error('Configuration validation failed:', error);
  throw error;
}

/**
 * Configuration implementation with compatibility layer
 */
class ConfigImplementation implements Config {
  get logging(): LoggingConfig {
    return config.get('logging') as LoggingConfig;
  }
  get metrics(): MetricsConfig {
    return config.get('metrics') as MetricsConfig;
  }
  get storage(): StorageConfig {
    return config.get('storage') as StorageConfig;
  }
  get project(): ProjectConfig {
    return config.get('project') as ProjectConfig;
  }
  get neural(): NeuralConfig {
    return config.get('neural') as NeuralConfig;
  }
  get performance(): PerformanceConfig {
    return config.get('performance') as PerformanceConfig;
  }
  get development(): DevelopmentConfig {
    return config.get('development') as DevelopmentConfig;
  }

  get(key: string, defaultValue?: any): any {
    try {
      return config.get(key as any);
    } catch {
      return defaultValue;
    }
  }

  set(key: string, value: any): void {
    config.set(key as any, value);
  }

  has(key: string): boolean {
    try {
      config.get(key as any);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get configuration as plain object
   */
  toObject(): Record<string, any> {
    return config.getProperties();
  }

  /**
   * Get configuration schema documentation
   */
  getSchema(): any {
    return config.getSchema();
  }

  /**
   * Reload configuration from environment and files
   */
  reload(): void {
    // Re-load environment variables
    dotenv.config();

    // Re-validate
    config.validate({ allowed: 'strict' });

    logger.info('Configuration reloaded');
  }
}

// Global configuration instance
let globalConfig: ConfigImplementation'''''''''''''''''''''''''''''''''''''''''''''''''' | ''''''''''''''''''''''''''''''''''''''''''''''''''null = null;

/**
 * Get the global configuration instance
 */
export function getConfig(): Config {
  if (!globalConfig) {
    globalConfig = new ConfigImplementation();
  }
  return globalConfig;
}

/**
 * Reload configuration from environment and files
 */
export function reloadConfig(): void {
  if (globalConfig) {
    globalConfig.reload();
  }
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return getConfig().development.debug;
}

/**
 * Check if metrics are enabled
 */
export function areMetricsEnabled(): boolean {
  return getConfig().metrics.enabled;
}

/**
 * Get storage configuration
 */
export function getStorageConfig(): StorageConfig {
  return getConfig().storage;
}

/**
 * Get project identifier for data isolation in user mode
 */
function getProjectIdentifier(): string {
  // Generate a short hash identifier based on the project path
  // This ensures consistency across runs for the same project path
  const projectPath = process.cwd();
  const pathHash = crypto
    .createHash('sha256')
    .update(projectPath)
    .digest('hex');

  // Use first 8 characters as project ID
  return pathHash.substring(0, 8);
}

/**
 * Get absolute data storage paths based on current configuration mode
 */
export function getDataStoragePaths(): {
  dataDir: string;
  memoryDir: string;
  dbPath: string;
  swarmDir: string;
  neuralDir: string;
  cacheDir: string;
  logsDir: string;
  projectId?: string;
} {
  const storage = getStorageConfig();
  const storeInUserHome =
    process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';

  let baseDataDir: string;
  let projectId: string'''''''''''''''''''''''''''''''''''''''''''''''''' | ''''''''''''''''''''''''''''''''''''''''''''''''''undefined;

  if (storeInUserHome) {
    // User mode: isolate project data in project-specific subdirectories
    projectId = getProjectIdentifier();
    baseDataDir = path.join(os.homedir(),'.claude-zen', 'projects', projectId);
  } else {
    // Repository mode: store data in local .claude-zen directory (no isolation needed)
    baseDataDir = path.join('.claude-zen');
  }

  // Create full data directory path
  const dataDir = path.join(
    baseDataDir,
    storage.dataDir.replace(/^\.claude-zen\//, '')
  );

  return {
    dataDir,
    memoryDir: path.join(dataDir, storage.memoryDir),
    dbPath: path.join(dataDir, storage.dbPath),
    swarmDir: path.join(dataDir, storage.swarmDir),
    neuralDir: path.join(dataDir, storage.neuralDir),
    cacheDir: path.join(dataDir, storage.cacheDir),
    logsDir: path.join(dataDir, storage.logsDir),
    projectId,
  };
}

/**
 * Get neural configuration
 */
export function getNeuralConfig(): NeuralConfig {
  return getConfig().neural;
}

/**
 * Get telemetry configuration (for backward compatibility)
 */
export function getTelemetryConfig() {
  const config = getConfig();
  return {
    serviceName: 'claude-code-zen',
    serviceVersion: '1.0.0',
    enableTracing: config.metrics.enabled,
    enableMetrics: config.metrics.enabled,
    enableLogging: config.logging.console'''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' | ''''''''''''''''''''''''''''''''''''''''''''''''''config.logging.file,
    enableAutoInstrumentation: config.metrics.enabled,
    traceSamplingRatio: 1.0,
    metricsInterval: config.metrics.interval,
    prometheusEndpoint:'/metrics',
    prometheusPort: 9090,
    jaegerEndpoint: 'http://localhost:14268/api/traces',
    enableConsoleExporters: config.development.debug,
  };
}

/**
 * Validate current configuration
 */
export function validateConfig(): void {
  if (!globalConfig) {
    globalConfig = new ConfigImplementation();
  }
  try {
    config.validate({ allowed: 'strict' });
    logger.info('Configuration validation successful');
  } catch (error) {
    logger.error('Configuration validation failed:', error);
    throw error;
  }
}

/**
 * Check for conflicting .claude-zen directories
 */
export function checkConfigDirectoryConflicts(): {
  hasUserConfig: boolean;
  hasRepoConfig: boolean;
  currentMode: 'user''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''repo';
  activeConfigDir: string;
  ignoredConfigDir?: string;
  warning?: string;
} {
  const storeInUserHome =
    process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';
  const userConfigDir = path.join(os.homedir(), '.claude-zen');
  const repoConfigDir = '.claude-zen';

  const hasUserConfig = fs.existsSync(userConfigDir);
  const hasRepoConfig = fs.existsSync(repoConfigDir);

  const result = {
    hasUserConfig,
    hasRepoConfig,
    currentMode: storeInUserHome ? ('user' as const) : ('repo' as const),
    activeConfigDir: storeInUserHome ? userConfigDir : repoConfigDir,
  };

  // Add warning if both exist
  if (hasUserConfig && hasRepoConfig) {
    const ignoredDir = storeInUserHome ? repoConfigDir : userConfigDir;
    const activeDir = storeInUserHome ? userConfigDir : repoConfigDir;

    return {
      ...result,
      ignoredConfigDir: ignoredDir,
      warning: `Both .claude-zen directories exist. Using ${activeDir}, ignoring ${ignoredDir}. Consider removing unused directory to avoid confusion.`,
    };
  }

  return result;
}

/**
 * Initialize configuration directories (can be called manually)
 */
export function initializeConfigDirectories(): void {
  const storeInUserHome =
    process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';

  // Check for conflicts first
  const conflicts = checkConfigDirectoryConflicts();
  if (conflicts.warning) {
    logger.warn(conflicts.warning);
  }

  let configDir: string;
  if (storeInUserHome) {
    configDir = path.join(os.homedir(), '.claude-zen');
  } else {
    configDir = '.claude-zen';
    // Ensure repo .gitignore includes .claude-zen/
    ensureRepoGitignore();
  }

  ensureConfigDirectory(configDir, storeInUserHome);
  logger.info(`Configuration directory initialized: ${configDir}`);
}

/**
 * Update global project registry (user mode only)
 */
function updateProjectRegistry(projectId: string): void {
  const storeInUserHome =
    process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';
  if (!storeInUserHome) return; // Only for user mode

  try {
    const registryPath = path.join(
      os.homedir(),
      '.claude-zen',
      'projects.json'
    );

    let registry: {
      projects: Array<{
        id: string;
        name: string;
        path: string;
        lastAccessed: string;
      }>;
    } = {
      projects: [],
    };

    // Load existing registry
    if (fs.existsSync(registryPath)) {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    }

    // Get a human-readable project name
    let projectName = projectId;
    try {
      const packageJsonPath = path.resolve('package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );
        if (packageJson.name) {
          projectName = packageJson.name;
        }
      }
    } catch {
      // Fallback to directory name
      projectName = path.basename(process.cwd())();
    }

    // Current project info
    const currentProject = {
      id: projectId,
      name: projectName,
      path: process.cwd(),
      lastAccessed: new Date().toISOString(),
    };

    // Update or add project
    const existingIndex = registry.projects.findIndex(
      (p) => p.id === projectId
    );
    if (existingIndex >= 0) {
      registry.projects[existingIndex] = currentProject;
    } else {
      registry.projects.push(currentProject);
    }

    // Sort by last accessed (most recent first)
    registry.projects.sort(
      (a, b) =>
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    );

    // Create directory if needed
    const registryDir = path.dirname(registryPath);
    if (!fs.existsSync(registryDir)) {
      fs.mkdirSync(registryDir, { recursive: true });
    }

    // Save registry
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
    logger.debug(`Updated project registry: ${projectId}`);
  } catch (error) {
    logger.warn('Failed to update project registry:', error);
  }
}

/**
 * Ensure data storage directories exist
 */
export function ensureDataDirectories(): void {
  const dataPaths = getDataStoragePaths();

  try {
    // Update project registry in user mode
    if (dataPaths.projectId) {
      updateProjectRegistry(dataPaths.projectId);
    }

    // Create all data directories
    const dirsToCreate = [
      dataPaths.dataDir,
      dataPaths.memoryDir,
      dataPaths.swarmDir,
      dataPaths.neuralDir,
      dataPaths.cacheDir,
      dataPaths.logsDir,
    ];

    for (const dir of dirsToCreate) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.debug(`Created data directory: ${dir}`);
      }
    }

    // Create .gitignore in data directory to ignore sensitive files
    const dataGitignorePath = path.join(dataPaths.dataDir, '.gitignore');
    if (!fs.existsSync(dataGitignorePath)) {
      const dataGitignoreContent = `# Claude Zen Data Directory
# Contains project data and may include sensitive information

# Database files
*.db
*.sqlite
*.sqlite3

# Memory and cache files
memory/
cache/
tmp/
temp/

# Log files
*.log
logs/

# Neural network data
neural/
models/
weights/

# Swarm coordination data
swarms/
agents/

# Backup files
*.bak
*.backup

# OS generated files
.DS_Store
Thumbs.db
`;

      fs.writeFileSync(dataGitignorePath, dataGitignoreContent, 'utf8');
      logger.debug(
        `Created .gitignore in data directory: ${dataPaths.dataDir}`
      );
    }

    logger.debug(
      `Data directories ensured: ${dataPaths.dataDir}${dataPaths.projectId ? ` (project: ${dataPaths.projectId})` : ''}`
    );
  } catch (error) {
    // Don't fail if data directory creation fails
    logger.warn('Failed to ensure data directories:', error);
  }
}

/**
 * Get list of registered projects (user mode only)
 */
export function getRegisteredProjects(): Array<{
  id: string;
  name: string;
  path: string;
  lastAccessed: string;
}> {
  const storeInUserHome =
    process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';
  if (!storeInUserHome) return []; // Only for user mode

  try {
    const registryPath = path.join(
      os.homedir(),
      '.claude-zen',
      'projects.json'
    );
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      return registry.projects'''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' | ''''''''''''''''''''''''''''''''''''''''''''''''''[];
    }
  } catch (error) {
    logger.warn('Failed to read project registry:', error);
  }

  return [];
}

/**
 * Get current project info
 */
export function getCurrentProject(): {
  id: string;
  name: string;
  path: string;
  mode: 'user''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''repo';
} {
  const storeInUserHome =
    process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';
  const dataPaths = getDataStoragePaths();

  return {
    id: dataPaths.projectId'''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''local',
    name: dataPaths.projectId'''''''''''''''''''''''''''''''''''''''''''''''''' | '''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''' | ''''''''''''''''''''''''''''''''''''''''''''''''''path.basename(process.cwd()),
    path: process.cwd(),
    mode: storeInUserHome ?'user' : 'repo',
  };
}

/**
 * Clean up old projects from registry (removes projects that no longer exist)
 */
export function cleanupProjectRegistry(): void {
  const storeInUserHome =
    process.env['ZEN_STORE_CONFIG_IN_USER_HOME'] !== 'false';
  if (!storeInUserHome) return; // Only for user mode

  try {
    const registryPath = path.join(
      os.homedir(),
      '.claude-zen',
      'projects.json'
    );
    if (!fs.existsSync(registryPath)) return;

    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const validProjects = registry.projects.filter((project: any) => {
      return fs.existsSync(project.path);
    });

    if (validProjects.length !== registry.projects.length) {
      registry.projects = validProjects;
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
      logger.info(
        `Cleaned up project registry: ${registry.projects.length - validProjects.length} invalid projects removed`
      );
    }
  } catch (error) {
    logger.warn('Failed to cleanup project registry:', error);
  }
}

/**
 * Configuration helpers for backward compatibility
 */
export const configHelpers = {
  get: (key: string, defaultValue?: any) => getConfig().get(key, defaultValue),
  set: (key: string, value: any) => getConfig().set(key, value),
  has: (key: string) => getConfig().has(key),
  reload: () => reloadConfig(),
  validate: () => validateConfig(),
  isDebug: () => isDebugMode(),
  areMetricsEnabled: () => areMetricsEnabled(),
  getStorageConfig: () => getStorageConfig(),
  getNeuralConfig: () => getNeuralConfig(),
  getDataPaths: () => getDataStoragePaths(),
  ensureDataDirs: () => ensureDataDirectories(),
  getCurrentProject: () => getCurrentProject(),
  getProjects: () => getRegisteredProjects(),
  cleanupProjects: () => cleanupProjectRegistry(),
  toObject: () => globalConfig?.toObject() || {},
  getSchema: () => globalConfig?.getSchema() || {},
  initDirectories: () => initializeConfigDirectories(),
  checkConflicts: () => checkConfigDirectoryConflicts(),
};

// Export the global config as default
export default getConfig();
