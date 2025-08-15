/**
 * @fileoverview Validation Test - Designed to Fail
 * 
 * This test is intentionally designed to fail for validation purposes.
 * It demonstrates expected test failure scenarios.
 */

describe('Validation Test - Should Fail', () => {
  it('should fail: 2 + 2 equals 5', () => {
    const result = 2 + 2;
    expect(result).toBe(5); // This will fail since 2 + 2 = 4, not 5
  });

  it('should fail: string comparison', () => {
    const testString = 'hello';
    expect(testString).toBe('world'); // This will fail
  });

  it('should fail: array length check', () => {
    const testArray = [1, 2, 3];
    expect(testArray.length).toBe(5); // This will fail since length is 3
  });

  it('should fail: undefined check', () => {
    const testValue = undefined;
    expect(testValue).toBeDefined(); // This will fail since value is undefined
  });

  it('should fail: truthy check', () => {
    const falsyValue = false;
    expect(falsyValue).toBeTruthy(); // This will fail since false is falsy
  });
});