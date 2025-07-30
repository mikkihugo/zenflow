/**
 * CLI Utilities - Shared CLI utility functions
 * Provides comprehensive utility functions for CLI operations
 */

import type { JSONObject } from '../types/core.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Command execution result interface
 */
export interface CommandExecutionResult {success = > boolean
errorMessage?: string;
aliases?: string[];
}

/**
 * Neural training parameters
 */
export interface NeuralTrainingParams {
  model?: string;
  epochs?: number;
  data?: string;
  timestamp?: number;
}

/**
 * Neural training result
 */
export interface NeuralTrainingResult {success = ============================================================================
// COLOR FORMATTING FUNCTIONS
// =============================================================================

/**
 * Print success message with checkmark
 * @param message - Message to display
 */
export function printSuccess(message = ============================================================================
// COMMAND VALIDATION HELPERS
// =============================================================================

/**
 * Validate command arguments
 * @param args - Command arguments
 * @param minLength - Minimum required length
 * @param usage - Usage string to display on error
 * @returns True if valid, false otherwise
 */
export function validateArgs(args = ============================================================================
// FILE SYSTEM HELPERS
// =============================================================================

/**
 * Ensure directory exists, create if needed
 * @param path - Directory path
 * @returns Promise resolving to true if successful
 */
export async function ensureDirectory(path = = 'EEXIST') {
      throw err;
    }
return true;
}
}

/**
 * Check if file exists
 * @param path - File path
 * @returns Promise resolving to true if file exists
 */
export async function fileExists(path = ============================================================================
// JSON HELPERS
// =============================================================================

/**
 * Read JSON file with default fallback
 * @param path - File path
 * @param defaultValue - Default value if file doesn't exist
 * @returns Promise resolving to parsed JSON or default value
 */
export async function readJsonFile<T = JSONObject>(path, defaultValue = {} as T): Promise<T> {
  try {
    const content = await (process as any).readTextFile(path);
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Write object to JSON file
 * @param path - File path
 * @param data - Data to write
 */
export async function writeJsonFile(path = ============================================================================
// STRING HELPERS
// =============================================================================

/**
 * Format timestamp to locale string
 * @param timestamp - Timestamp to format
 * @returns Formatted timestamp string
 */
export function formatTimestamp(_timestamp = 100): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Format bytes to human readable string
 * @param bytes - Number of bytes
 * @returns Formatted byte string
 */
export function formatBytes(bytes = ['B', 'KB', 'MB', 'GB'];
let size = bytes;
let unitIndex = 0;

while (size >= 1024 && unitIndex < units.length - 1) {
  size /= 1024;
  unitIndex++;
}

return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// =============================================================================
// COMMAND EXECUTION HELPERS
// =============================================================================

/**
 * Parse command line flags and arguments
 * @param args - Raw command arguments
 * @returns Parsed flags, arguments, and provided flags set
 */
export function parseFlags(args = {};
const providedFlags = new Set<string>(); // Track explicitly provided flags
const filteredArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg.startsWith('--')) {
    const flagName = arg.substring(2);
    const nextArg = args[i + 1];

    if (nextArg && !nextArg.startsWith('--')) {
      flags[flagName] = nextArg;
      providedFlags.add(flagName);
      i++; // Skip next arg since we consumed it
    } else {
      flags[flagName] = true;
      providedFlags.add(flagName);
    }
  } else if (arg.startsWith('-') && arg.length > 1) {
    // Short flags
    const shortFlags = arg.substring(1);
    for (const flag of shortFlags) {
      flags[flag] = true;
      providedFlags.add(flag);
    }
  } else {
    filteredArgs.push(arg);
  }
}

return { flags, args = { ...flags };

// Handle queen-type -> queenType
if (flags['queen-type'] && !flags.queenType) {
  normalized.queenType = flags['queen-type'];
}

// Handle max-workers -> maxWorkers
if (flags['max-workers'] && !flags.maxWorkers) {
  normalized.maxWorkers = parseInt(flags['max-workers']);
}

// Handle auto-scale -> autoScale
if (flags['auto-scale'] && !flags.autoScale) {
  normalized.autoScale = flags['auto-scale'] === 'true';
}

return normalized;
}

/**
 * Apply smart defaults to flags
 * @param flags - Current flags
 * @param providedFlags - Set of explicitly provided flags
 * @param defaults - Default values
 * @returns Flags with defaults applied
 */
export function applySmartDefaults(
  flags = { ...flags };

for (const [key, defaultValue] of Object.entries(defaults)) {
  // Check both camelCase and kebab-case variants
  const kebabKey = camelToKebab(key);

  if (!providedFlags.has(key) && !providedFlags.has(kebabKey)) {
    result[key] = defaultValue;
  }
}

return result;
}

/**
 * Convert camelCase to kebab-case
 * @param str - String to convert
 * @returns Kebab-case string
 */
function camelToKebab(str = ============================================================================
// FLAG VALIDATION SYSTEM
// =============================================================================

/**
 * Flag validator configuration map
 */
const FLAG_VALIDATORS = {
      queenType => {
      const num = parseInt(value);
return num > 0 && num <= 50;
},errorMessage = []

for (const [flagName, config] of Object.entries(FLAG_VALIDATORS)) {
    const value = flags[flagName];
    
    if (value !== undefined) {
      if (config.validValues && !config.validValues.includes(value)) {
        errors.push(`Invalid ${flagName}: "${value}". Must be oneof = ============================================================================
// PROCESS EXECUTION HELPERS
// =============================================================================

/**
 * Run shell command with options
 * @param command - Command to run
 * @param args - Command arguments
 * @param options - Execution options
 * @returns Promise resolving to command execution result
 */
export async function runCommand(command = [], 
  options = {}
): Promise<CommandExecutionResult> {
  try {
    // Check if we're in Node.js environment
    if (typeof process !== 'undefined' && (process as any).versions && (process as any).versions.node) {
      // Node.js environment
      const { spawn } = await import('child_process');

      return new Promise((resolve) => {
        const child = spawn(command, args, {stdio = '';
        const stderr = '';

        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          resolve({
            success = == 0,
            code => {
          resolve({success = new (process as any).Command(command, {
        args,
        ...options,
      });

      const result = await cmd.output();

      return {success = == 0,code = ============================================================================
// CONFIGURATION HELPERS
// =============================================================================

/**
 * Load CLI configuration from file
 * @param path - Configuration file path
 * @returns Promise resolving to configuration object
 */
export async function loadConfig(path = 'claude-zen.config.json'): Promise<CliConfiguration> {
  const defaultConfig = {terminal = await (process as any).readTextFile(path);
    return { ...defaultConfig, ...JSON.parse(content) };
  } catch {
    return defaultConfig;
  }
}

/**
 * Save configuration to file
 * @param config - Configuration to save
 * @param path - File path
 */
export async function saveConfig(config = 'claude-zen.config.json'): Promise<void> {
  await writeJsonFile(path, config);
}

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generate unique ID with optional prefix
 * @param prefix - Optional prefix for ID
 * @returns Generated unique ID
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

// =============================================================================
// ARRAY HELPERS
// =============================================================================

/**
 * Split array into chunks of specified size
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(array = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// =============================================================================
// ENVIRONMENT HELPERS
// =============================================================================

/**
 * Get environment variable with fallback
 * @param name - Variable name
 * @param defaultValue - Default value if not found
 * @returns Environment variable value or default
 */
export function getEnvVar(name = null): string | null {
  return (process as any).env.get(name) ?? defaultValue;
}

/**
 * Set environment variable
 * @param name - Variable name
 * @param value - Variable value
 */
export function setEnvVar(name = ============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if string is valid JSON
 * @param str - String to validate
 * @returns True if valid JSON
 */
export function isValidJson(str = ============================================================================
// PROGRESS AND STATUS HELPERS
// =============================================================================

/**
 * Show progress bar in console
 * @param current - Current progress
 * @param total - Total items
 * @param message - Optional message
 */
export function showProgress(current = ''): void {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));
  console.warn(`\r${bar} ${percentage}% ${message}`);
}

/**
 * Clear current console line
 */
export function clearLine(): void {
  console.warn('\r\x1b[K');
}

// =============================================================================
// ASYNC HELPERS
// =============================================================================

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export function sleep(ms = > setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxAttempts - Maximum retry attempts
 * @param delay - Initial delay in milliseconds
 * @returns Promise resolving to function result
 */
export async function retry<T>(fn = > Promise<T>, 
  maxAttempts = 3, 
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) {
        throw err;
      }
      await sleep(delay * attempt);
    }
  }
  throw new Error('Retry function failed to execute');
}

// =============================================================================
// CLAUDE FLOW MCP INTEGRATION HELPERS
// =============================================================================

/**
 * Call RuvSwarm MCP tool (redirects to library)
 * @param tool - Tool name
 * @param params - Tool parameters
 * @returns Promise resolving to tool result
 */
export async function callRuvSwarmMCP(tool = {}): Promise<any> {
  // Redirect to the new library-based implementation
  const { callRuvSwarmLibrary } = await import('./utils.js');
  return await callRuvSwarmLibrary(tool, params);
}

/**
 * Direct ruv-swarm neural training (real WASM implementation)
 * @param params - Training parameters
 * @returns Promise resolving to training result
 */
export async function callRuvSwarmDirectNeural(params = {}): Promise<NeuralTrainingResult> {
  try {
    const modelName = params.model || 'general';
    const epochs = params.epochs || 50;
    const dataSource = params.data || 'recent';

    console.warn(`🧠 Using REAL ruv-swarm WASM neural training...`);
    console.warn(
      `🚀Executing = = 'undefined' && (process as any).versions?.node) {
      // Node.js environment - use spawn with stdio inherit
      const { spawn } = await import('node:child_process');

      result = await new Promise((_resolve) => {
        const _child = spawn(
          'npx',
          [
            'ruv-swarm',
            'neural',
            'train',
            '--model',
            modelName,
            '--iterations',
            epochs.toString(),
            '--data-source',
            dataSource,
            '--output-format',
            'json',
          ],
          {
            stdio => {
          resolve({
            success = === 0,
            code => {
          resolve({success = await runCommand('npx', [
        'ruv-swarm', 
        'neural', 
        'train',
        '--model', modelName,
        '--iterations', epochs.toString(),
        '--data-source', dataSource,
        '--output-format', 'json'
      ], {stdout = '.ruv-swarm/neural';
      const files = await (process as any).readDir(neuralDir);
      let latestFile = null;
      let latestTime = 0;

      for await (const file of files) {
        if (file.name.startsWith(`training-${modelName}-`) && file.name.endsWith('.json')) {
          const filePath = `${neuralDir}/${file.name}`;
          const stat = await (process as any).stat(filePath);
          if (stat.mtime > latestTime) {
            latestTime = stat.mtime;
            latestFile = filePath;
          }
        }
      }

      if (latestFile) {
        const _content = await (process as any).readTextFile(latestFile);

        return {success = === 0,modelId = === 0,
      modelId = {}): Promise<CommandExecutionResult> {
  try {
    const command = 'npx';
    const args = ['ruv-swarm', 'hook', hookName];

    // Add parameters as CLI arguments
    Object.entries(params).forEach(([key, value]) => {
      args.push(`--${key}`);
      if (value !== true && value !== false) {
        args.push(String(value));
      }
    });

    const _result = await runCommand(command, args, {stdout = await runCommand('npx', ['ruv-swarm', '--version'], {stdout = ============================================================================
// NEURAL TRAINING SPECIFIC HELPERS
// =============================================================================

/**
 * Train neural model with specified parameters
 * @param modelName - Name of model to train
 * @param dataSource - Data source for training
 * @param epochs - Number of training epochs
 * @returns Promise resolving to training result
 */
export async function trainNeuralModel(_modelName = 50
): Promise<any> {
  let { callRuvSwarmLibrary } = await import('./utils.js');
  return await callRuvSwarmLibrary('neural_train', {
    model = {}
): Promise<any> {
  const { callRuvSwarmLibrary } = await import('./utils.js');
  return await callRuvSwarmLibrary('neural_patterns', {action = null): Promise<SwarmStatusResult> {
  const { callRuvSwarmLibrary } = await import('./utils.js');
  return await callRuvSwarmLibrary('swarm_status', {
    swarmId = {}
): Promise<AgentSpawnResult> {
  const { callRuvSwarmLibrary } = await import('./utils.js');
  return await callRuvSwarmLibrary('agent_spawn', {
    type: agentType,
    config: config,
    timestamp: Date.now(),
  });
}
