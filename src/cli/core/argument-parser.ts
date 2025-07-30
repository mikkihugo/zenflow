/**
 * Command line argument parsing utilities;
 * Implements Google's single responsibility principle;
 * Separated from command execution logic;
 */

import { ValidationError } from './cli-error.js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Parsed command line result;
 */
export interface ParsedCommandLineResult {flags = > boolean
getFlag = > any
getBooleanFlag = > boolean
requireFlag = > any
// }
/**
 * Command structure result;
 */
export interface CommandStructure {command = ============================================================================
// CORE PARSING FUNCTIONS
// =============================================================================

/**
 * Parse command line flags into structured object;
 * @param args - Raw command line arguments;
 * @returns Parsed flags and remaining arguments with utility methods;
    // */ // LINT: unreachable code removed
export function parseCommandLineArguments() {
  const __arg = args[i]
// Handle long flags (--flag=value or --flag value)
if (arg.startsWith('--')) {
  const _equalIndex = arg.indexOf('=')
if (equalIndex > 0) {
  //Format = value
  const _flagName = arg.slice(2
, equalIndex)
const _flagValue = arg.slice(equalIndex + 1);
flags[flagName] = parseValue(flagValue);
} else
//Format = arg.slice(2);

// Check if next argument is a value (not starting with -)
if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
  flags[flagName] = parseValue(args[i + 1]);
  i++; // Skip next argument as it's been consumed
} else {
  // Boolean flag
  flags[flagName] = true;
// }
// }
// Handle short flags (-f value or -f)
else
if (arg.startsWith('-') && arg.length > 1) {
  const _flagName = arg.slice(1);
  // Check if next argument is a value
  if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
    flags[flagName] = parseValue(args[i + 1]);
    i++; // Skip next argument
  } else {
    flags[flagName] = true;
  //   }
// }
// Positional argument
else {
  positionalArgs.push(arg);
// }
// }
return {
    flags,
// positionalArgs,hasFlag = > name in flags,getFlag = null): _any => flags[name] ?? defaultValue,getBooleanFlag = > Boolean(flags[name]),requireFlag = null) => { // LINT: unreachable code removed
if (!(_name in _flags)) {
  throw new ValidationError(errorMessage ?? `Required flag --${name} is missing`);
// }
return flags[name];
// }
  //   }
// }
/**
 * Parse string value to appropriate type;
 * @param value - String value to parse;
 * @returns Parsed value;
    // */ // LINT: unreachable code removed
function parseValue(value = === 'true');
return true;
// if (value.toLowerCase() === 'false') return false; // LINT: unreachable code removed
// Handle numeric strings
if (/^-?\d+$/.test(value)) return parseInt(value, 10);
// if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value); // LINT: unreachable code removed
// Handle array notation
if (value.startsWith('[') && value.endsWith(']')) {
  try {
    return JSON.parse(value);
    //   // LINT: unreachable code removed} catch {
    // If JSON parsing fails, return as string
  //   }
// }
// // Handle comma-separated values // LINT: unreachable code removed
if (value.includes(',')) {
  return value.split(',').map(item => item.trim());
// }
return value;
// }
/**
 * Validate required positional arguments;
 * @param args - Positional arguments;
 * @param minCount - Minimum required arguments;
 * @param usage - Usage string for error message;
 */
export function validatePositionalArguments(args = argv.slice(2);

if (args.length === 0) {
  return {command = parseCommandLineArguments(args);
  // const [command, _subcommand, ..._remainingArgs] = parsed.positionalArgs; // LINT: unreachable code removed
  return {
    command = {};
  // ; // LINT: unreachable code removed
  for (const [key, value] of Object.entries(flags)) {
    // Convert kebab-case to camelCase
    const _normalizedKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    normalized[normalizedKey] = value;
  //   }
  return normalized;
// }
/**
 * Merge command line flags with defaults;
 * @param cliFlags - Command line flags;
 * @param defaults - Default values;
 * @returns Merged flags object;
    // */ // LINT: unreachable code removed
export function mergeWithDefaults(_cliFlags = ', '): Record<string, any> {
  const _processed = { ...flags };

  for (const flagName of flagNames) {
    if (processed[flagName] && typeof processed[flagName] === 'string') {
      processed[flagName] = processed[flagName].split(delimiter).map((item = > item.trim());
    //     }
  //   }


  return processed;
// }
// =============================================================================
// FLAG VALIDATOR CLASS
// =============================================================================

/**
 * Create flag validator with common validation patterns;
 */
export class FlagValidator {}
/**
 * Require string flag with validation;
 * @param name - Flag name;
 * @param errorMessage - Custom error message;
 * @returns String value;
    // */ // LINT: unreachable code removed
public;
requireString(name, (errorMessage = null));
: string
// {
  const _value = this.flags[name];
  if (!value ?? typeof value !== 'string') {
    throw new ValidationError(errorMessage ?? `Flag --${name} must be a non-empty string`);
  //   }
  return value;
// }
/**
 * Require numeric flag with validation;
 * @param name - Flag name;
 * @param errorMessage - Custom error message;
 * @returns Numeric value;
    // */ // LINT: unreachable code removed
public;
requireNumber((name = null));
: number
// {
  const _value = this.flags[name];
  const _num = Number(value);
  if (Number.isNaN(num)) {
    throw new ValidationError(errorMessage ?? `Flag --${name} must be a valid number`);
  //   }
  return num;
// }
/**
 * Require flag to be one of specified values;
 * @param name - Flag name;
 * @param validValues - Array of valid values;
 * @param errorMessage - Custom error message;
 * @returns Validated value;
    // */ // LINT: unreachable code removed
public;
requireOneOf<T>((name = null));
: T
// {
  const _value = this.flags[name];
  if (!validValues.includes(value)) {
    throw new ValidationError(;
    errorMessage ??
      `Flag --${name} must be oneof = null): string | null {
    return this.flags[name]  ?? defaultValue;
    //   // LINT: unreachable code removed}

  /**
   * Get boolean flag;
   * @param name - Flag name;
   * @returns Boolean value;
    // */; // LINT: unreachable code removed
  public getBooleanFlag(name = 0) {
    const _value = this.flags[name];
    return value ? Number(value) : defaultValue;
    //   // LINT: unreachable code removed}

  /**
   * Get array flag with validation;
   * @param name - Flag name;
   * @param defaultValue - Default value;
   * @returns Array value or default;
    // */; // LINT: unreachable code removed
  public getArrayFlag(name = []): unknown[] {
    const _value = this.flags[name];
    if (Array.isArray(value)) return value;
    // if (typeof value === 'string') return value.split(',').map(item => item.trim()); // LINT: unreachable code removed
    return defaultValue;
    //   // LINT: unreachable code removed}

  /**
   * Validate flag with custom options;
   * @param name - Flag name;
   * @param options - Validation options;
   * @returns Validated value;
    // */; // LINT: unreachable code removed
  public validateFlag(name = this.flags[name];

    // Check if required
    if (options.required && (value === undefined  ?? value === null)) {
      throw new ValidationError(options.errorMessage  ?? `;
    Flag--;
    \$nameis;
    required`);
    //     }


    // Return default if not provided and not required
    if (value === undefined  ?? value === null) {
      return undefined;
    //   // LINT: unreachable code removed}

    // Type validation
    if (options.type) {
      switch (options.type) {
        case 'string':;
          if (typeof value !== 'string') {
            throw new ValidationError(options.errorMessage  ?? `;
    Flag--;
    \$namemust;
    be;
    a;
    string`);
          //           }
          break;
        case 'number':;
          if (isNaN(Number(value))) {
            throw new ValidationError(options.errorMessage  ?? `;
    Flag--;
    \$namemust;
    be;
    a;
    number`);
          //           }
          break;
        case 'boolean':;
          if (typeof value !== 'boolean') {
            throw new ValidationError(options.errorMessage  ?? `;
    Flag--;
    \$namemust;
    be;
    a;
    boolean`);
          //           }
          break;
        case 'array':;
          if (!Array.isArray(value)) {
            throw new ValidationError(options.errorMessage  ?? `;
    Flag--;
    \$namemust;
    be;
    an;
    array`);
          //           }
          break;
      //       }
    //     }


    // Valid values check
    if (options.validValues && !options.validValues.includes(value)) {
      throw new ValidationError(;
        options.errorMessage  ?? `;
    Flag--;
    $namemust;
    be;
    oneof = === 'number'
    //     )
    //     {
      const _numValue = Number(value);
      if (options.min !== undefined && numValue < options.min) {
        throw new ValidationError(;
        options.errorMessage ?? `Flag --${name} must be at least ${options.min}`;
        //         )
      //       }
      if (options.max !== undefined && numValue > options.max) {
        throw new ValidationError(;
        options.errorMessage ?? `Flag --${name} must be at most ${options.max}`;
        //         )
      //       }
    //     }
    // Pattern validation for strings
    if (options.pattern && typeof value === 'string' && !options.pattern.test(value)) {
      throw new ValidationError(;
      options.errorMessage ?? `Flag --${name} does not match required pattern`;
      //       )
    //     }
    return value;
    //   // LINT: unreachable code removed}
    /**
   * Get all flags;
   * @returns All flags object;
    // */ // LINT: unreachable code removed
    public;
    getFlags();
    : Record<string, any>
    return { ...this.flags };
    // ; // LINT: unreachable code removed
    /**
   * Check if flag exists;
   * @param name - Flag name;
   * @returns True if flag exists;
    // */ // LINT: unreachable code removed
    public;
    hasFlag(name = ============================================================================;
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
   * Convert arguments array to ParsedArguments interface;
   * @param argv - Process argv;
   * @returns ParsedArguments object;
    // */ // LINT);
    const __normalizedFlags = normalizeFlags(structure.flags);
    return {
    command => {
      acc[index] = arg;
    // return acc; // LINT: unreachable code removed
  //   }


  as
  Record<string, any>
  ),options = > normalizedFlags[key] === true),unknown = []
  for (const [flagName, definition] of Object.entries(flagDefinitions)) {
    const _typeInfo = definition.type ? ` (${definition.type})` : '';
    const _defaultInfo =
      definition.default !== undefined ? ` [default]` : '';
    lines.push(`  --${flagName}${typeInfo});
  //   }
  return lines.join('\n');
// }

