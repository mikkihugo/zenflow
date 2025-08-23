/**
 * Test file with deliberate TypeScript errors for testing intelligent linter
 */

import { someFunction } from './utils';

export class TestClass {
  private name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  getMessage(): string {
    // Deliberate unterminated string literal
    return 'Hello, my name is ' + this.name;
  }
  
  getWarning(): string {
    // Another unterminated string
    return 'This is a warning message';
  }
  
  processData(data: any): void {
    if (data.type === 'critical') {
      console.log('Critical data received');
    } else if (data.type === 'warning') {
      console.log('Warning data received');
    }
  }
}