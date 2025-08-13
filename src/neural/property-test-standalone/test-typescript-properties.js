/**
 * Simple standalone demonstration of TypeScript property-based testing
 */

const fc = require('fast-check');

// Simple neural network functions for testing
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function relu(x) {
  return Math.max(0, x);
}

function normalizeData(data) {
  const mean = data.reduce((sum, x) => sum + x, 0) / data.length;
  const variance =
    data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / data.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return data.map(() => 0);
  return data.map((x) => (x - mean) / stdDev);
}

function meanSquaredError(predictions, targets) {
  const sum = predictions.reduce((acc, p, i) => acc + (p - targets[i]) ** 2, 0);
  return sum / predictions.length;
}
fc.assert(
  fc.property(fc.float({ min: -1000, max: 1000, noNaN: true }), (x) => {
    const result = sigmoid(x);
    return result >= 0 && result <= 1 && Number.isFinite(result);
  }),
  { numRuns: 1000 }
);
fc.assert(
  fc.property(fc.float({ min: -1000, max: 1000, noNaN: true }), (x) => {
    const result = relu(x);
    return result >= 0 && Number.isFinite(result);
  }),
  { numRuns: 1000 }
);
fc.assert(
  fc.property(
    fc.array(fc.float({ min: -10, max: 10, noNaN: true }), {
      minLength: 5,
      maxLength: 20,
    }),
    fc.array(fc.float({ min: -10, max: 10, noNaN: true }), {
      minLength: 5,
      maxLength: 20,
    }),
    (pred, targets) => {
      if (pred.length !== targets.length) return true; // skip mismatched lengths

      const loss = meanSquaredError(pred, targets);
      return loss >= 0 && Number.isFinite(loss);
    }
  ),
  { numRuns: 1000 }
);
fc.assert(
  fc.property(
    fc.array(fc.float({ min: -100, max: 100, noNaN: true }), {
      minLength: 10,
      maxLength: 50,
    }),
    (data) => {
      const unique = [...new Set(data)];
      if (unique.length <= 1) return true; // Skip constant arrays

      const normalized = normalizeData(data);

      // Check all values are finite
      if (!normalized.every((x) => Number.isFinite(x))) return false;

      // Check mean is approximately 0
      const mean =
        normalized.reduce((sum, x) => sum + x, 0) / normalized.length;
      if (Math.abs(mean) > 1e-10) return false;

      // Check standard deviation is approximately 1
      const variance =
        normalized.reduce((sum, x) => sum + (x - mean) ** 2, 0) /
        normalized.length;
      const stdDev = Math.sqrt(variance);
      if (Math.abs(stdDev - 1.0) > 1e-10) return false;

      return true;
    }
  ),
  { numRuns: 500 }
);
fc.assert(
  fc.property(
    fc.array(
      fc.oneof(
        fc.float({ min: -1e6, max: 1e6, noNaN: true }),
        fc.constant(0),
        fc.constant(Number.MAX_VALUE),
        fc.constant(Number.MIN_VALUE)
      ),
      { minLength: 1, maxLength: 10 }
    ),
    (extremeInputs) => {
      // All functions should handle extreme inputs gracefully
      const sigmoidResults = extremeInputs.map(sigmoid);
      const reluResults = extremeInputs.map(relu);

      // Check all results are finite and within expected bounds
      const sigmoidValid = sigmoidResults.every(
        (r) => Number.isFinite(r) && r >= 0 && r <= 1
      );
      const reluValid = reluResults.every((r) => Number.isFinite(r) && r >= 0);

      return sigmoidValid && reluValid;
    }
  ),
  { numRuns: 1000 }
);
