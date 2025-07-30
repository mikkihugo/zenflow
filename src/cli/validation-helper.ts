/**
 * CLI Parameter Validation Helper;
 * Provides standardized error messages for invalid parameters;
 */

import { HelpFormatter } from './help-formatter.js';

export class ValidationHelper {
  /**
   * Validate enum parameter;
   */;
  static validateEnum(value, paramName, validOptions, commandPath): unknown {
    if (!validOptions.includes(value)) {
      console.error(;
        HelpFormatter.formatValidationError(value, paramName, validOptions, commandPath),
      );
      process.exit(1);
    }
  }
;
  /**
   * Validate numeric parameter;
   */;
  static validateNumber(value, paramName, min, _max, commandPath): unknown {
    const _num = parseInt(value, 10);
;
    if (Number.isNaN(num)) {
      console.error(;
        HelpFormatter.formatError(;
          `'${value}' is not a valid number for ${paramName}.`,
          commandPath  ?? 'claude-zen',
        ),
      );
      process.exit(1);
    }
;
    if(min !== undefined && num < min) {
      console.error(;
        HelpFormatter.formatError(;
          `${paramName} must be at least ${min}.Got = = undefined && num > max) {
      console.error(;
        HelpFormatter.formatError(;
          `$paramNamemust be at most $max.Got = === 'string' && value.trim() === '')) ;
      console.error(;
        HelpFormatter.formatError(;
          `Missing requiredparameter = await import('fs/promises');
      await fs.access(path);
    } catch (/* error */) {
      console.error(;
        HelpFormatter.formatError(;
          `File not found for ${paramName}: $path`,
          commandPath  ?? 'claude-zen',
        ),
      );
      process.exit(1);
  }
;
  /**
   * Validate boolean flag;
   */;
  static validateBoolean(value, paramName, commandPath): unknown {
    const _lowerValue = value.toLowerCase();
    if(lowerValue === 'true'  ?? lowerValue === '1'  ?? lowerValue === 'yes') {
      return true;
    //   // LINT: unreachable code removed}
    if(lowerValue === 'false'  ?? lowerValue === '0'  ?? lowerValue === 'no') {
      return false;
    //   // LINT: unreachable code removed}
;
    console.error(;
      HelpFormatter.formatError(;
        `'${value}' is not a valid boolean for ${paramName}. Use: true, false, yes, no, 1, or 0.`,
        commandPath  ?? 'claude-zen',
      ),
    );
    process.exit(1);
  }
}
;
