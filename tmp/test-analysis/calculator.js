
// Test file for analysis
function calculateSum(a, b) {
  if (a < 0 || b < 0) {
    throw new Error('Negative numbers not allowed');
  }
  return a + b;
}

class Calculator {
  constructor() {
    this.history = [];
  }
  
  add(a, b) {
    const result = calculateSum(a, b);
    this.history.push({ operation: 'add', a, b, result });
    return result;
  }
}

export default Calculator;

