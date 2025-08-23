/**
 * Test file with actual TypeScript compilation errors
 */

import { getLogger } from '@claude-zen/foundation';

export class TestLinterClass {
  private logger = getLogger('TestLinter');
  
  constructor(private config: any) {
    // Unterminated string literal
    this.logger.info('Initializing test class...');
  }
  
  processData(data: string): string {
    if (data.length > 0) {
      // Another unterminated string
      return 'Processing: ' + data + ' - done';
    }
    
    // Missing closing quote
    return 'empty data';
  }
  
  validateInput(input: any): boolean {
    // Syntax error with switch
    switch (input.type) {
      case 'valid':
        return true;
      case 'invalid':
        return false;
      default:
        return false;
    }
  }
}