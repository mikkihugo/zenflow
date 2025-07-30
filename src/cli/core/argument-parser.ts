/**
 * Command line argument parsing utilities - TypeScript Edition
 * Implements comprehensive argument parsing with full type safety
 */

import { 
  ArgumentParser as IArgumentParser, 
  ParsedArguments, 
  CommandDefinition,
  ValidationResult,
  CommandFlag,
  CommandArgument
} from '../../types/cli';
import { ValidationError } from './cli-error';

// =============================================================================
// BASIC ARGUMENT PARSING
// =============================================================================

export interface ParsedFlags {
  [key: string]: string | number | boolean | string[];
}

export interface ParsedCommand {
  command: string | null;
  subcommand: string | null;
  args: string[];
  flags: ParsedFlags;
  hasFlag: (name: string) => boolean;
  getFlag: <T = any>(name: string, defaultValue?: T) => T;
  getBooleanFlag: (name: string) => boolean;
  requireFlag: <T = any>(name: string, errorMessage?: string) => T;
}

/**
 * Parse command line flags into structured object
 */
export function parseCommandLineArguments(args: string[]): ParsedCommand {
  const flags: ParsedFlags = {};
  const positionalArgs: string[] = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // Handle long flags (--flag=value or --flag value)
    if (arg.startsWith('--')) {
      const equalIndex = arg.indexOf('=');
      
      if (equalIndex > 0) {
        // Format: --flag=value
        const flagName = arg.slice(2, equalIndex);
        const flagValue = arg.slice(equalIndex + 1);
        flags[flagName] = parseValue(flagValue);
      } else {
        // Format: --flag or --flag value
        const flagName = arg.slice(2);
        
        // Check if next argument is a value (not starting with -)
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          flags[flagName] = parseValue(args[i + 1]);
          i++; // Skip next argument as it's been consumed
        } else {
          // Boolean flag
          flags[flagName] = true;
        }
      }
    }
    // Handle short flags (-f value or -f)
    else if (arg.startsWith('-') && arg.length > 1) {
      const flagChars = arg.slice(1);
      
      // Handle multiple short flags like -abc
      if (flagChars.length > 1 && !args[i + 1]?.startsWith('-')) {
        // If next arg doesn't start with -, it's a value for the last flag
        for (let j = 0; j < flagChars.length - 1; j++) {
          flags[flagChars[j]] = true;
        }
        flags[flagChars[flagChars.length - 1]] = parseValue(args[i + 1]);
        i++; // Skip next argument
      } else if (flagChars.length > 1) {
        // Multiple boolean flags like -abc
        for (const char of flagChars) {
          flags[char] = true;
        }
      } else {
        // Single short flag
        const flagName = flagChars;
        
        // Check if next argument is a value
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          flags[flagName] = parseValue(args[i + 1]);
          i++; // Skip next argument
        } else {
          flags[flagName] = true;
        }
      }
    }
    // Positional argument
    else {
      positionalArgs.push(arg);
    }
  }
  
  const [command, subcommand, ...remainingArgs] = positionalArgs;
  
  return {
    command: command || null,
    subcommand: subcommand || null,
    args: remainingArgs,
    flags,
    hasFlag: (name: string) => name in flags,
    getFlag: <T = any>(name: string, defaultValue?: T): T => 
      (flags[name] as T) ?? defaultValue!,
    getBooleanFlag: (name: string) => Boolean(flags[name]),
    requireFlag: <T = any>(name: string, errorMessage?: string): T => {
      if (!(name in flags)) {
        throw new ValidationError(errorMessage || `Required flag --${name} is missing`, name);
      }
      return flags[name] as T;
    }
  };
}

/**
 * Parse string value to appropriate type
 */
function parseValue(value: string): string | number | boolean | string[] {
  // Handle arrays (comma-separated values)
  if (value.includes(',')) {
    return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
  }
  
  // Handle booleans
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Handle numbers
  if (/^-?\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  if (/^-?\d*\.\d+$/.test(value)) {
    return parseFloat(value);
  }
  
  // Default to string
  return value;
}

// =============================================================================
// COMMAND STRUCTURE PARSING
// =============================================================================

/**
 * Parse and validate command structure
 */
export function parseCommandStructure(argv: string[]): ParsedCommand {
  // Skip node and script name
  const args = argv.slice(2);
  
  if (args.length === 0) {
    return {
      command: null,
      subcommand: null,
      args: [],
      flags: {},
      hasFlag: () => false,
      getFlag: <T = any>(_name: string, defaultValue?: T) => defaultValue!,
      getBooleanFlag: () => false,
      requireFlag: <T = any>(name: string, errorMessage?: string): T => {
        throw new ValidationError(errorMessage || `Required flag --${name} is missing`, name);
      }
    };
  }
  
  return parseCommandLineArguments(args);
}

// =============================================================================
// FLAG NORMALIZATION
// =============================================================================

/**
 * Normalize flag names (convert kebab-case to camelCase)
 */
export function normalizeFlags(flags: ParsedFlags): ParsedFlags {
  const normalized: ParsedFlags = {};
  
  for (const [key, value] of Object.entries(flags)) {
    // Convert kebab-case to camelCase
    const normalizedKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    normalized[normalizedKey] = value;
  }
  
  return normalized;
}

/**
 * Denormalize flag names (convert camelCase to kebab-case)
 */
export function denormalizeFlags(flags: ParsedFlags): ParsedFlags {
  const denormalized: ParsedFlags = {};
  
  for (const [key, value] of Object.entries(flags)) {
    // Convert camelCase to kebab-case
    const denormalizedKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    denormalized[denormalizedKey] = value;
  }
  
  return denormalized;
}

// =============================================================================
// FLAG VALIDATION
// =============================================================================

/**
 * Enhanced flag validator with comprehensive type checking
 */
export class FlagValidator {
  constructor(private flags: ParsedFlags) {}
  
  requireString(name: string, errorMessage?: string): string {
    const value = this.flags[name];
    if (!value || typeof value !== 'string') {
      throw new ValidationError(
        errorMessage || `Flag --${name} must be a non-empty string`,
        name,
        value,
        'string'
      );
    }
    return value;
  }
  
  requireNumber(name: string, min?: number, max?: number, errorMessage?: string): number {
    const value = this.flags[name];
    const num = Number(value);
    
    if (isNaN(num)) {
      throw new ValidationError(
        errorMessage || `Flag --${name} must be a valid number`,
        name,
        value,
        'number'
      );
    }
    
    if (min !== undefined && num < min) {
      throw new ValidationError(
        `Flag --${name} must be at least ${min}`,
        name,
        value,
        `number >= ${min}`
      );
    }
    
    if (max !== undefined && num > max) {
      throw new ValidationError(
        `Flag --${name} must be at most ${max}`,
        name,
        value,
        `number <= ${max}`
      );
    }
    
    return num;
  }
  
  requireInteger(name: string, min?: number, max?: number, errorMessage?: string): number {
    const num = this.requireNumber(name, min, max, errorMessage);
    
    if (!Number.isInteger(num)) {
      throw new ValidationError(
        `Flag --${name} must be an integer`,
        name,
        num,
        'integer'
      );
    }
    
    return num;
  }
  
  requireOneOf<T extends string>(name: string, validValues: T[], errorMessage?: string): T {
    const value = this.flags[name] as string;
    
    if (!validValues.includes(value as T)) {
      throw new ValidationError(
        errorMessage || `Flag --${name} must be one of: ${validValues.join(', ')}`,
        name,
        value,
        validValues.join(' | ')
      );
    }
    
    return value as T;
  }
  
  requireArray(name: string, minLength?: number, maxLength?: number, errorMessage?: string): string[] {
    const value = this.flags[name];
    let array: string[];
    
    if (Array.isArray(value)) {
      array = value as string[];
    } else if (typeof value === 'string') {
      array = value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    } else {
      throw new ValidationError(
        errorMessage || `Flag --${name} must be an array or comma-separated string`,
        name,
        value,
        'array'
      );
    }
    
    if (minLength !== undefined && array.length < minLength) {
      throw new ValidationError(
        `Flag --${name} must have at least ${minLength} items`,
        name,
        value,
        `array with >= ${minLength} items`
      );
    }
    
    if (maxLength !== undefined && array.length > maxLength) {
      throw new ValidationError(
        `Flag --${name} must have at most ${maxLength} items`,
        name,
        value,
        `array with <= ${maxLength} items`
      );
    }
    
    return array;
  }
  
  requireBoolean(name: string, errorMessage?: string): boolean {
    const value = this.flags[name];
    
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    
    throw new ValidationError(
      errorMessage || `Flag --${name} must be a boolean value`,
      name,
      value,
      'boolean'
    );
  }
  
  // Optional getters with type safety
  getStringFlag(name: string, defaultValue?: string): string | undefined {
    const value = this.flags[name];
    return typeof value === 'string' ? value : defaultValue;
  }
  
  getBooleanFlag(name: string, defaultValue = false): boolean {
    const value = this.flags[name];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    return defaultValue;
  }
  
  getNumberFlag(name: string, defaultValue?: number): number | undefined {
    const value = this.flags[name];
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  
  getArrayFlag(name: string, defaultValue: string[] = []): string[] {
    const value = this.flags[name];
    
    if (Array.isArray(value)) {
      return value as string[];
    }
    
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    
    return defaultValue;
  }
  
  // Validation methods
  hasFlag(name: string): boolean {
    return name in this.flags;
  }
  
  validatePattern(name: string, pattern: RegExp, errorMessage?: string): string {
    const value = this.requireString(name);
    
    if (!pattern.test(value)) {
      throw new ValidationError(
        errorMessage || `Flag --${name} does not match required pattern ${pattern}`,
        name,
        value,
        pattern.toString()
      );
    }
    
    return value;
  }
  
  validateUrl(name: string, errorMessage?: string): string {
    const value = this.requireString(name);
    
    try {
      new URL(value);
      return value;
    } catch {
      throw new ValidationError(
        errorMessage || `Flag --${name} must be a valid URL`,
        name,
        value,
        'valid URL'
      );
    }
  }
  
  validatePath(name: string, mustExist = false, errorMessage?: string): string {
    const value = this.requireString(name);
    
    if (mustExist) {
      try {
        // This would need fs.existsSync in a real implementation
        // For now, just do basic validation
        if (!value.startsWith('/') && !value.startsWith('./') && !value.startsWith('../')) {
          // Could be a relative path, that's fine
        }
      } catch {
        throw new ValidationError(
          errorMessage || `Flag --${name} must be a valid file path`,
          name,
          value,
          'valid file path'
        );
      }
    }
    
    return value;
  }
}

// =============================================================================
// ARGUMENT VALIDATION
// =============================================================================

/**
 * Validate required positional arguments
 */
export function validatePositionalArguments(
  args: string[], 
  minCount: number, 
  maxCount?: number,
  usage?: string
): void {
  if (args.length < minCount) {
    throw new ValidationError(
      `Insufficient arguments. Expected at least ${minCount}, got ${args.length}${usage ? `. Usage: ${usage}` : ''}`,
      'args',
      args.length,
      `>= ${minCount} arguments`
    );
  }
  
  if (maxCount !== undefined && args.length > maxCount) {
    throw new ValidationError(
      `Too many arguments. Expected at most ${maxCount}, got ${args.length}${usage ? `. Usage: ${usage}` : ''}`,
      'args',
      args.length,
      `<= ${maxCount} arguments`
    );
  }
}

// =============================================================================
// TYPESCRIPT ARGUMENT PARSER IMPLEMENTATION
// =============================================================================

export class TypeScriptArgumentParser implements IArgumentParser {
  parse(argv: string[]): ParsedArguments {
    const parsed = parseCommandStructure(argv);
    
    return {
      command: parsed.command || undefined,
      args: parsed.args,
      flags: parsed.flags,
      input: [parsed.command, parsed.subcommand, ...parsed.args].filter(Boolean) as string[],
      // These would be populated by meow in a real implementation
      pkg: undefined,
      help: undefined,
      showHelp: (exitCode = 0) => {
        console.log('Help text would go here');
        process.exit(exitCode);
      },
      showVersion: () => {
        console.log('Version would go here');
        process.exit(0);
      }
    };
  }
  
  validate(definition: CommandDefinition, parsed: ParsedArguments): ValidationResult[] {
    const results: ValidationResult[] = [];
    const validator = new FlagValidator(parsed.flags as ParsedFlags);
    
    // Validate arguments
    if (definition.args) {
      for (let i = 0; i < definition.args.length; i++) {
        const argDef = definition.args[i];
        const argValue = parsed.args[i];
        
        // Check required arguments
        if (argDef.required && (argValue === undefined || argValue === '')) {
          results.push({
            valid: false,
            field: `args[${i}]`,
            message: `Required argument '${argDef.name}' is missing`,
            value: argValue
          });
          continue;
        }
        
        // Validate argument if present
        if (argValue !== undefined && argDef.validate) {
          try {
            const validation = argDef.validate(argValue);
            if (typeof validation === 'string') {
              results.push({
                valid: false,
                field: `args[${i}]`,
                message: validation,
                value: argValue
              });
            } else if (!validation) {
              results.push({
                valid: false,
                field: `args[${i}]`,
                message: `Invalid value for argument '${argDef.name}'`,
                value: argValue
              });
            }
          } catch (error) {
            results.push({
              valid: false,
              field: `args[${i}]`,
              message: error instanceof Error ? error.message : 'Validation failed',
              value: argValue
            });
          }
        }
      }
    }
    
    // Validate flags
    if (definition.flags) {
      for (const flagDef of definition.flags) {
        const flagValue = parsed.flags[flagDef.name];
        
        // Check required flags
        if (flagDef.required && flagValue === undefined) {
          results.push({
            valid: false,
            field: `flags.${flagDef.name}`,
            message: `Required flag '--${flagDef.name}' is missing`,
            value: flagValue
          });
          continue;
        }
        
        // Validate flag if present
        if (flagValue !== undefined) {
          try {
            // Type validation
            if (flagDef.type === 'boolean' && typeof flagValue !== 'boolean') {
              results.push({
                valid: false,
                field: `flags.${flagDef.name}`,
                message: `Flag '--${flagDef.name}' must be a boolean`,
                value: flagValue
              });
              continue;
            }
            
            if (flagDef.type === 'number' && typeof flagValue !== 'number') {
              results.push({
                valid: false,
                field: `flags.${flagDef.name}`,
                message: `Flag '--${flagDef.name}' must be a number`,
                value: flagValue
              });
              continue;
            }
            
            if (flagDef.type === 'array' && !Array.isArray(flagValue)) {
              results.push({
                valid: false,
                field: `flags.${flagDef.name}`,
                message: `Flag '--${flagDef.name}' must be an array`,
                value: flagValue
              });
              continue;
            }
            
            // Choice validation
            if (flagDef.choices && !flagDef.choices.includes(String(flagValue))) {
              results.push({
                valid: false,
                field: `flags.${flagDef.name}`,
                message: `Flag '--${flagDef.name}' must be one of: ${flagDef.choices.join(', ')}`,
                value: flagValue
              });
              continue;
            }
            
            // Custom validation
            if (flagDef.validate) {
              const validation = flagDef.validate(flagValue);
              if (typeof validation === 'string') {
                results.push({
                  valid: false,
                  field: `flags.${flagDef.name}`,
                  message: validation,
                  value: flagValue
                });
              } else if (!validation) {
                results.push({
                  valid: false,
                  field: `flags.${flagDef.name}`,
                  message: `Invalid value for flag '--${flagDef.name}'`,
                  value: flagValue
                });
              }
            }
          } catch (error) {
            results.push({
              valid: false,
              field: `flags.${flagDef.name}`,
              message: error instanceof Error ? error.message : 'Validation failed',
              value: flagValue
            });
          }
        }
      }
    }
    
    return results;
  }
  
  generateHelp(definition: CommandDefinition): string {
    let help = `${definition.name} - ${definition.description}\n\n`;
    help += `Usage: ${definition.usage}\n\n`;
    
    if (definition.flags && definition.flags.length > 0) {
      help += 'Flags:\n';
      for (const flag of definition.flags) {
        const alias = flag.alias ? `, -${flag.alias}` : '';
        const required = flag.required ? ' (required)' : '';
        const defaultVal = flag.default !== undefined ? ` (default: ${flag.default})` : '';
        help += `  --${flag.name}${alias}  ${flag.description}${required}${defaultVal}\n`;
      }
      help += '\n';
    }
    
    if (definition.examples && definition.examples.length > 0) {
      help += 'Examples:\n';
      for (const example of definition.examples) {
        help += `  ${example.command}  # ${example.description}\n`;
      }
    }
    
    return help;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const argumentParser = new TypeScriptArgumentParser();