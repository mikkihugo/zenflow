/**
 * Command line argument parsing utilities
 * Implements Google's single responsibility principle
 * Separated from command execution logic
 */

import { ValidationError } from './cli-error.js';

/**
 * Parse command line flags into structured object
 * @param {string[]} args - Raw command line arguments
 * @returns {Object} Parsed flags and remaining arguments
 */
export function parseCommandLineArguments(args) {
  const flags = {};
  const positionalArgs = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // Handle long flags (--flag=value or --flag value)
    if (arg.startsWith('--')) {
      const equalIndex = arg.indexOf('=');
      
      if (equalIndex > 0) {
        // Format: --flag=value
        const flagName = arg.slice(2, equalIndex);
        const flagValue = arg.slice(equalIndex + 1);
        flags[flagName] = flagValue;
      } else {
        // Format: --flag or --flag value
        const flagName = arg.slice(2);
        
        // Check if next argument is a value (not starting with -)
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          flags[flagName] = args[i + 1];
          i++; // Skip next argument as it's been consumed
        } else {
          // Boolean flag
          flags[flagName] = true;
        }
      }
    }
    // Handle short flags (-f value or -f)
    else if (arg.startsWith('-') && arg.length > 1) {
      const flagName = arg.slice(1);
      
      // Check if next argument is a value
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        flags[flagName] = args[i + 1];
        i++; // Skip next argument
      } else {
        flags[flagName] = true;
      }
    }
    // Positional argument
    else {
      positionalArgs.push(arg);
    }
  }
  
  return {
    flags,
    positionalArgs,
    hasFlag: (name) => name in flags,
    getFlag: (name, defaultValue = null) => flags[name] ?? defaultValue,
    getBooleanFlag: (name) => Boolean(flags[name]),
    requireFlag: (name, errorMessage = null) => {
      if (!(name in flags)) {
        throw new ValidationError(errorMessage || `Required flag --${name} is missing`);
      }
      return flags[name];
    }
  };
}

/**
 * Validate required positional arguments
 * @param {string[]} args - Positional arguments
 * @param {number} minCount - Minimum required arguments
 * @param {string} usage - Usage string for error message
 */
export function validatePositionalArguments(args, minCount, usage) {
  if (args.length < minCount) {
    throw new ValidationError(`Insufficient arguments. Usage: ${usage}`);
  }
}

/**
 * Parse and validate command structure
 * @param {string[]} argv - Full argv array
 * @returns {Object} Parsed command structure
 */
export function parseCommandStructure(argv) {
  // Skip node and script name
  const args = argv.slice(2);
  
  if (args.length === 0) {
    return {
      command: null,
      subcommand: null,
      args: [],
      flags: {}
    };
  }
  
  const parsed = parseCommandLineArguments(args);
  const [command, subcommand, ...remainingArgs] = parsed.positionalArgs;
  
  return {
    command: command || null,
    subcommand: subcommand || null,
    args: remainingArgs,
    flags: parsed.flags,
    parsedArgs: parsed
  };
}

/**
 * Normalize flag names (convert kebab-case to camelCase)
 * @param {Object} flags - Raw flags object
 * @returns {Object} Normalized flags
 */
export function normalizeFlags(flags) {
  const normalized = {};
  
  for (const [key, value] of Object.entries(flags)) {
    // Convert kebab-case to camelCase
    const normalizedKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    normalized[normalizedKey] = value;
  }
  
  return normalized;
}

/**
 * Create flag validator with common validation patterns
 */
export class FlagValidator {
  constructor(flags) {
    this.flags = flags;
  }
  
  requireString(name, errorMessage = null) {
    const value = this.flags[name];
    if (!value || typeof value !== 'string') {
      throw new ValidationError(errorMessage || `Flag --${name} must be a non-empty string`);
    }
    return value;
  }
  
  requireNumber(name, errorMessage = null) {
    const value = this.flags[name];
    const num = Number(value);
    if (isNaN(num)) {
      throw new ValidationError(errorMessage || `Flag --${name} must be a valid number`);
    }
    return num;
  }
  
  requireOneOf(name, validValues, errorMessage = null) {
    const value = this.flags[name];
    if (!validValues.includes(value)) {
      throw new ValidationError(
        errorMessage || `Flag --${name} must be one of: ${validValues.join(', ')}`
      );
    }
    return value;
  }
  
  getStringFlag(name, defaultValue = null) {
    return this.flags[name] || defaultValue;
  }
  
  getBooleanFlag(name) {
    return Boolean(this.flags[name]);
  }
  
  getNumberFlag(name, defaultValue = 0) {
    const value = this.flags[name];
    return value ? Number(value) : defaultValue;
  }
}