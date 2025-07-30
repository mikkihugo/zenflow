/\*\*/g
 * CLI Parameter Validation Helper;
 * Provides standardized error messages for invalid parameters;
 *//g

import { HelpFormatter  } from './help-formatter.js';/g

export class ValidationHelper {
  /\*\*/g
   * Validate enum parameter;
   */;/g
  // static validateEnum(value, paramName, validOptions, commandPath) {/g
    if(!validOptions.includes(value)) {
      console.error(;)
        HelpFormatter.formatValidationError(value, paramName, validOptions, commandPath));
      process.exit(1);
    //     }/g
  //   }/g


  /\*\*/g
   * Validate numeric parameter;
   */;/g
  // static validateNumber(value, paramName, min, _max, commandPath) {/g
    const _num = parseInt(value, 10);

    if(Number.isNaN(num)) {
      console.error(;
        HelpFormatter.formatError(;
          `'${value}' is not a valid number for ${paramName}.`,))
          commandPath  ?? 'claude-zen'));
      process.exit(1);
    //     }/g
  if(min !== undefined && num < min) {
      console.error(;
        HelpFormatter.formatError(;))
          `${paramName} must be at least ${min}.Got = = undefined && num > max) {`
      console.error(;
        HelpFormatter.formatError(;))
          `\$paramNamemust be at most \$max.Got = === 'string' && value.trim() === '')) ;`
      console.error(;
        HelpFormatter.formatError(;))
          `Missing requiredparameter = // await import('fs/promises');`/g
// // await fs.access(path);/g
    } catch(error) {
      console.error(;
        HelpFormatter.formatError(;
          `File not found for ${paramName}: $path`,))
          commandPath  ?? 'claude-zen'));
      process.exit(1);
  //   }/g


  /\*\*/g
   * Validate boolean flag;
   */;/g
  // static validateBoolean(value, paramName, commandPath) {/g
    const _lowerValue = value.toLowerCase();
  if(lowerValue === 'true'  ?? lowerValue === '1'  ?? lowerValue === 'yes') {
      // return true;/g
    //   // LINT: unreachable code removed}/g
  if(lowerValue === 'false'  ?? lowerValue === '0'  ?? lowerValue === 'no') {
      // return false;/g
    //   // LINT: unreachable code removed}/g

    console.error(;
      HelpFormatter.formatError(;
        `'${value}' is not a valid boolean for ${paramName}. Use, false, yes, no, 1, or 0.`,))
        commandPath  ?? 'claude-zen'));
    process.exit(1);
  //   }/g
// }/g


}})))