/**
 * Test file for SDK integration with more errors
 */

export class SDKTestClass {
  private value: number;
  
  constructor(value: number) {
    this.value = value;
  }
  
  getResult(): string {
    // Unterminated string
    return 'The result is: ' + this.value;
  }
  
  checkStatus(status: string): void {
    if (status === 'active') {
      console.log('System is active');
    } else if (status === 'inactive') {
      console.log('System is inactive');  
    }
  }
  
  calculate(): number {
    return this.value * 2;
  }
}