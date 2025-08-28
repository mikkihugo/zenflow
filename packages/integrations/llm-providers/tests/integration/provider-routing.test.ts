import { describe, expect, it, vi} from 'vitest';
import {
  createLLMProvider,
  getGlobalLLM,
  getLLMProviderByCapability,
  LLMProvider,
  listLLMProviders,
  setGlobalLLM,
} from '../../src/index';

describe('Provider Routing Integration', () => {
    ')  beforeEach(() => 
    vi.clearAllMocks(););

  describe('Provider Discovery and Registration', () => {
    ')    it('should discover all available providers', () => {
    ')      const providers = listLLMProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);

      // Should include core providers
      const providerIds = providers.map((p) => p.id);
      expect(providerIds).toContain('claude-code');')
      // Verify provider structure
      providers.forEach((provider) => 
        expect(provider).toHaveProperty('id');')        expect(provider).toHaveProperty('name');')        expect(provider).toHaveProperty('type');')        expect(provider).toHaveProperty('category');')        expect(provider).toHaveProperty('available');')        expect(['cli',    'api']).toContain(provider.type);');
});

    it('should categorize providers correctly', () => {
    ')      const providers = listLLMProviders();

      const cliProviders = providers.filter((p) => p.type === 'cli');')      const __apiProviders = providers.filter((p) => p.type === 'api');')
      expect(cliProviders.length).toBeGreaterThan(0);

      // CLI providers should support file operations
      cliProviders.forEach((provider) => {
        expect(['file-operations',    'agentic-dev']).toContain(provider.category);')});
});

    it('should indicate provider availability status', () => {
    ')      const providers = listLLMProviders();

      providers.forEach((provider) => {
        expect(typeof provider.available).toBe('boolean');')});

      // Claude Code should always be available
      const __claudeProvider = providers.find((p) => p.id === 'claude-code');')      expect(claudeProvider?.available).toBe(true);
});
});

  describe('Capability-Based Routing', () => {
    ')    it('should route to appropriate provider for file operations', () => {
    ')      const provider = getLLMProviderByCapability('file-operations');')
      expect(provider).toBeInstanceOf(LLMProvider);
      expect(provider.getProviderId()).toBe('claude-code');')});

    it('should route to appropriate provider for different capabilities', () => {
    ')      const capabilities = [
        'file-operations',        'agentic-development',        'code-completion',        'chat',        'inference',] as const;

      capabilities.forEach((capability) => {
        const provider = getLLMProviderByCapability(capability);

        expect(provider).toBeInstanceOf(LLMProvider);
        expect(provider.getProviderId()).toBeDefined();

        const info = provider.getProviderInfo();
        expect(info.capabilities).toBeDefined();
});
});

    it('should provide fallback for unknown capabilities', () => {
    ')      const provider = getLLMProviderByCapability('unknown-capability' as any);')
      expect(provider).toBeInstanceOf(LLMProvider);
      expect(provider.getProviderId()).toBe('claude-code'); // Should default to Claude Code')});

    it('should respect provider preferences for capabilities', () => {
    ')      // Test that file operations always go to Claude Code
      const __fileOpsProvider = getLLMProviderByCapability('file-operations');')      expect(fileOpsProvider.getProviderId()).toBe('claude-code');')
      // Test that inference can go to multiple providers
      const __inferenceProvider = getLLMProviderByCapability('inference');')      expect(inferenceProvider).toBeInstanceOf(LLMProvider);
});
});

  describe('Provider Factory Functions', () => {
    ')    it('should create providers with factory function', () => {
    ')      const providers = [
        'claude-code',        'github-models-api',        'cursor-cli',        'gemini-cli',] as const;

      providers.forEach((providerId) => {
        const provider = createLLMProvider(providerId);

        expect(provider).toBeInstanceOf(LLMProvider);
        expect(provider.getProviderId()).toBe(providerId);
});
});

    it('should create default provider when no ID specified', () => {
    ')      const provider = createLLMProvider();

      expect(provider).toBeInstanceOf(LLMProvider);
      expect(provider.getProviderId()).toBe('claude-code');')});

    it('should handle unknown provider IDs gracefully', () => {
    ')      const provider = createLLMProvider('unknown-provider' as any);')
      expect(provider).toBeInstanceOf(LLMProvider);
      expect(provider.getProviderId()).toBe('unknown-provider');')});
});

  describe('Global Provider Management', () => {
    ')    it('should manage global provider instance', () => {
    ')      const provider1 = createLLMProvider('claude-code');')      const provider2 = createLLMProvider('github-models-api');')
      // Set global provider
      setGlobalLLM(provider1);
      expect(getGlobalLLM()).toBe(provider1);

      // Replace global provider
      setGlobalLLM(provider2);
      expect(getGlobalLLM()).toBe(provider2);

      // Clear global provider
      setGlobalLLM(null as any);
      expect(getGlobalLLM()).toBeNull();
});

    it('should isolate global provider from local instances', () => {
    ')      const globalProvider = createLLMProvider('claude-code');')      const localProvider = createLLMProvider('github-models-api');')
      setGlobalLLM(globalProvider);

      expect(getGlobalLLM()).toBe(globalProvider);
      expect(localProvider).not.toBe(globalProvider);
      expect(localProvider.getProviderId()).toBe('github-models-api');')});
});

  describe('Multi-Provider Coordination', () => {
    ')    it('should coordinate tasks across multiple providers', async () => {
    ')      const claudeProvider = createLLMProvider('claude-code');')      const githubProvider = createLLMProvider('github-models-api');')
      // Mock provider responses
      vi.spyOn(claudeProvider as any, 'executeTask').mockResolvedValue(')        success:true,
        result: 'File operations completed',        provider: 'claude-code',);

      vi.spyOn(githubProvider as any, 'executeTask').mockResolvedValue({
    ')        success:true,
        result: 'Inference completed',        provider: 'github-models-api',});

      // Execute tasks on different providers
      const fileTask = await claudeProvider.executeTask(
        'Read and analyze file')      );
      const inferenceTask =
        await githubProvider.executeTask('Generate summary');')
      expect(fileTask.success).toBe(true);
      expect(fileTask.provider).toBe('claude-code');')      expect(inferenceTask.success).toBe(true);
      expect(inferenceTask.provider).toBe('github-models-api');')});

    it('should handle provider failover scenarios', async () => {
    ')      const primaryProvider = createLLMProvider('claude-code');')      const fallbackProvider = createLLMProvider('github-models-api');')
      // Mock primary provider failure
      vi.spyOn(primaryProvider as any, 'executeTask').mockRejectedValue(')        createMockError('Primary provider unavailable',    'PROVIDER_ERROR')')      );

      // Mock fallback provider success
      vi.spyOn(fallbackProvider as any, 'executeTask').mockResolvedValue({
    ')        success:true,
        result: 'Completed via fallback',        provider: 'github-models-api',});

      try {
        await primaryProvider.executeTask('test task');')} catch (_error) {
        // Fallback to secondary provider
        const result = await fallbackProvider.executeTask('test task');')        expect(result.success).toBe(true);
        expect(result.provider).toBe('github-models-api');')}
});

    it('should load balance across multiple providers', async () => {
    ')      const providers = [
        createLLMProvider('claude-code'),
        createLLMProvider('github-models-api'),
];

      // Mock provider responses with different latencies
      providers.forEach((provider, index) => {
        vi.spyOn(provider as any, 'executeTask').mockImplementation(')          async () => {
            await new Promise((resolve) => setTimeout(resolve, index * 100));
            return {
              success:true,
              result:`Result from provider ${index}`,`
              latency:index * 100,
};
}
        );
});

      const __tasks = Array.from({ length:10}, (_, i) => `Task ${i + 1}`);`

      // Simple round-robin load balancing
      const results = await Promise.all(
        tasks.map((task, index) => {
          const provider = providers[index % providers.length];
          return provider.executeTask(task);
})
      );

      expect(results).toHaveLength(10);
      expect(results.every((r) => r.success)).toBe(true);
});
});

  describe('Provider Health and Monitoring', () => {
    ')    it('should monitor provider health across all providers', async () => {
    ')      const providers = [
        createLLMProvider('claude-code'),
        createLLMProvider('github-models-api'),
];

      // Mock health responses
      providers.forEach((provider, index) => {
        vi.spyOn(provider as any, 'health').mockResolvedValue({
    ')          status:index === 0 ? 'healthy' : ' degraded',          latency:(index + 1) * 100,
          lastCheck:Date.now(),
});
});

      const healthChecks = await Promise.all(
        providers.map((provider) => provider.health())
      );

      expect(healthChecks).toHaveLength(2);
      expect(healthChecks[0].status).toBe('healthy');')      expect(healthChecks[1].status).toBe('degraded');')});

    it('should aggregate provider statistics', async () => {
    ')      const providers = [
        createLLMProvider('claude-code'),
        createLLMProvider('github-models-api'),
];

      // Mock stats responses
      providers.forEach((provider, index) => {
        vi.spyOn(provider as any, 'getStats').mockResolvedValue({
    ')          totalRequests:(index + 1) * 100,
          successfulRequests:(index + 1) * 95,
          failedRequests:(index + 1) * 5,
          averageLatency:(index + 1) * 150,
});
});

      const __stats = await Promise.all(
        providers.map((provider) => provider.getStats())
      );

      const aggregateStats = {
        totalRequests:stats.reduce((sum, s) => sum + s.totalRequests, 0),
        totalSuccessful:stats.reduce(
          (sum, s) => sum + s.successfulRequests,
          0
        ),
        totalFailed:stats.reduce((sum, s) => sum + s.failedRequests, 0),
        averageLatency:
          stats.reduce((sum, s) => sum + s.averageLatency, 0) / stats.length,
};

      expect(aggregateStats.totalRequests).toBe(300); // 100 + 200
      expect(aggregateStats.totalSuccessful).toBe(285); // 95 + 190
      expect(aggregateStats.totalFailed).toBe(15); // 5 + 10
      expect(aggregateStats.averageLatency).toBe(225); // (150 + 300) / 2
});
});

  describe('Error Handling and Resilience', () => {
    ')    it('should handle provider initialization failures', () => {
    ')      expect(() => createLLMProvider('claude-code')).not.toThrow();')      expect(() => createLLMProvider('unknown-provider' as any)).not.toThrow();')});

    it('should handle capability resolution failures', () => {
    ')      expect(() => getLLMProviderByCapability('file-operations')).not.toThrow();')      expect(() => getLLMProviderByCapability('unknown' as any)).not.toThrow();')});

    it('should handle provider listing failures gracefully', () => {
    ')      expect(() => listLLMProviders()).not.toThrow();

      const providers = listLLMProviders();
      expect(Array.isArray(providers)).toBe(true);
});

    it('should handle global provider state corruption', () => {
    ')      // Set invalid global provider
      setGlobalLLM(null as any);
      expect(getGlobalLLM()).toBeNull();

      // Set valid provider after null
      const validProvider = createLLMProvider('claude-code');')      setGlobalLLM(validProvider);
      expect(getGlobalLLM()).toBe(validProvider);
});
});

  describe('Performance and Scalability', () => {
    ')    it('should handle rapid provider creation', () => {
    ')      const startTime = Date.now();

      const providers = Array.from({ length:100}, () =>
        createLLMProvider('claude-code')')      );

      const endTime = Date.now();

      expect(providers).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
});

    it('should handle concurrent provider operations', async () => {
    ')      const providers = Array.from({ length:10}, () =>
        createLLMProvider('claude-code')')      );

      // Mock concurrent operations
      providers.forEach((provider) => {
        vi.spyOn(provider as any, 'health').mockResolvedValue({
    ')          status: 'healthy',          latency:Math.random() * 200,
});
});

      const startTime = Date.now();
      const healthChecks = await Promise.all(
        providers.map((provider) => provider.health())
      );
      const endTime = Date.now();

      expect(healthChecks).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
});

    it('should efficiently route capability requests', () => {
    ')      const capabilities = [
        'file-operations',        'agentic-development',        'code-completion',        'chat',        'inference',] as const;

      const startTime = Date.now();

      // Request each capability multiple times
      const providers = capabilities.flatMap((capability) =>
        Array.from({ length:20}, () => getLLMProviderByCapability(capability))
      );

      const endTime = Date.now();

      expect(providers).toHaveLength(100); // 5 capabilities × 20 requests
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
});
});
});
