import { NeuralWasmGateway } from '../../../../src/neural/wasm/gateway';

describe('NeuralWasmGateway', () => {
  it('initializes lazily and reports metrics', async () => {
    expect(NeuralWasmGateway.isInitialized()).toBe(false);
    const before = NeuralWasmGateway.getMetrics();
    expect(before.initialized).toBe(false);

    await NeuralWasmGateway.initialize();
    expect(NeuralWasmGateway.isInitialized()).toBe(true);

    const after = NeuralWasmGateway.getMetrics();
    expect(after.initialized).toBe(true);
    expect(after.modulesLoaded).toBeGreaterThanOrEqual(1);
  });

  it('executes a stub task and returns structured result', async () => {
    const result = await NeuralWasmGateway.execute({ task: 'noop' });
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('durationMs');
  });

  it('optimize() is idempotent', async () => {
    await NeuralWasmGateway.optimize();
    const first = NeuralWasmGateway.getMetrics();
    expect(first.optimized).toBe(true);
    const optimizeTime = first.optimizeTimeMs;
    await NeuralWasmGateway.optimize();
    const second = NeuralWasmGateway.getMetrics();
    expect(second.optimizeTimeMs).toBe(optimizeTime); // unchanged
  });
});
