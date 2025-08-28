import { describe, expect, it, beforeAll} from 'vitest';
import { 
  GitHubModelsAPI,
  createGitHubModelsProvider
} from '../../src/api/github-models';

// Load real GitHub token from environment variables for GitHub Models API
function loadModelsToken():string | null {
  // GitHub Models API works with standard GitHub tokens
  return (
    process.env['GITHUB_TOKEN'] ||      // Standard GitHub token
    process.env['GITHUB_TOKEN_NEW'] ||  // Alternative PAT token
    process.env['GITHUB_PAT'] ||        // Alternative naming
    null
  );
}

// Real GitHub Models API Integration Tests (only run when PAT token available)
describe('GitHub Models Real API Integration', () => {
  let modelsToken:string | null;
  let modelsAPI:GitHubModelsAPI;

  beforeAll(() => {
    modelsToken = loadModelsToken();
    
    if (modelsToken) {
      modelsAPI = new GitHubModelsAPI({
        token:modelsToken,
        model:'openai/gpt-4o')});
}
});

  describe('Token Configuration', () => {
    it('should load GitHub token from environment', () => {
      if (modelsToken) {
        // GitHub Models works with various GitHub token types
        const isValidToken = modelsToken.startsWith('ghp_') || modelsToken.startsWith(' gho_');
        expect(isValidToken).toBe(true);
        expect(modelsToken.length).toBeGreaterThan(20);
        logger.info(`✅ Valid GitHub token format detected:${modelsToken.startsWith('ghp_') ? ' PAT' : ' OAuth'}`);
} else {
        logger.info('⚠️ No GitHub token available - skipping token validation');
        logger.info('💡 Set GITHUB_TOKEN environment variable');
}
});

    it('should validate token format for GitHub Models', () => {
      if (modelsToken) {
        const isPAT = modelsToken.startsWith('ghp_');
        const isOAuth = modelsToken.startsWith('gho_');
        expect(isPAT || isOAuth).toBe(true);
        logger.info(`🔑 GitHub Models API token format:${isPAT ? 'PAT (ghp_)' : ' OAuth (gho_)'}`);
        
        if (!isPAT) {
          logger.info('⚠️  GitHub Models may prefer PAT tokens over OAuth tokens');
}
} else {
        logger.info('⚠️ No Models token available - skipping format validation');
}
});
});

  describe('Real API Health Check', () => {
    it('should connect to GitHub Models API', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping health check');
        return;
}

      const isHealthy = await modelsAPI.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
      logger.info(`🏥 GitHub Models API Health:${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
}, 15000);

    it('should list real models from GitHub Models API', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping models list');
        return;
}

      const models = await modelsAPI.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      
      logger.info(`📋 GitHub Models:${models.length} available`);
      logger.info(`🎯 Available models:${models.slice(0, 5).join(',    ')}${models.length > 5 ? '...' : ''}`);
'      
      // Check for expected models
      const expectedModels = ['openai/gpt-4o',    'openai/gpt-4.1',    'meta/llama-3.3-70b-instruct',    'mistral-ai/mistral-large-2411'];
      const foundModels = expectedModels.filter(model => models.includes(model));
      logger.info(`🔥 Expected models found:${foundModels.join(',    ')}`);
}, 15000);
});

  describe('Real API Execution', () => {
    it('should execute real chat completion with GPT-4o', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping real API execution');
        return;
}

      const result = await modelsAPI.execute({
        messages:[{
          role: 'user',          content:'Write a simple Python function that calculates the factorial of a number. Be concise.')}]
});

      if (result.isErr()) {
        logger.info(`❌ GitHub Models API Error:${result.error.message}`);
        logger.info(`   Code:${result.error.code}`);
        logger.info(`   Details:`, result.error.details);
        
        // GitHub Models requires special access - skip if unauthorized
        if (result.error.message?.includes('unauthorized') || result.error.message?.includes(' Invalid Github auth token')) {
          logger.info('⚠️  GitHub Models API requires special access or beta approval');
          logger.info('💡 This is expected if you don\' t have GitHub Models beta access');
          return; // Skip this test
}
}

      expect(result.isOk()).toBe(true);
      
      if (result.isOk()) {
        const response = result.value;
        expect(response.content).toBeTruthy();
        expect(response.content.length).toBeGreaterThan(10);
        expect(response.metadata?.provider).toBe('github-models');
        expect(response.metadata?.model).toBe('openai/gpt-4o');
        
        logger.info(`🤖 GitHub Models Response (${response.content.length} chars):`);
        logger.info(`📊 Metadata:Model=${response.metadata?.model}, Tokens=${response.metadata?.tokens}`);
        logger.info(`✂️ Content Preview:${response.content.substring(0, 150)}...`);
}
}, 30000);

    it('should handle different models from GitHub marketplace', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping model testing');
        return;
}

      // Get available models
      const models = await modelsAPI.listModels();
      const testModels = models.filter(m => 
        ['openai/gpt-4o',    'openai/gpt-4.1',    'meta/llama-3.3-70b-instruct'].includes(m)
      ).slice(0, 2);

      if (testModels.length === 0) {
        logger.info('⚠️ No suitable test models available');
        return;
}

      for (const model of testModels) {
        const testAPI = new GitHubModelsAPI({
          token:modelsToken,
          model:model as any
});

        const result = await testAPI.execute({
          messages:[{
            role: 'user',            content:'Respond with just "test successful" and nothing else.')}]
});

        expect(result.isOk()).toBe(true);
        
        if (result.isOk()) {
          logger.info(`✅ Model ${model}:Response received (${result.value.content.length} chars)`);
          expect(result.value.metadata?.model).toBe(model);
}
}
}, 60000);

    it('should handle multimodal capabilities', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping multimodal test');
        return;
}

      // Test with GPT-4o which supports multimodal
      const gpt4oAPI = new GitHubModelsAPI({
        token:modelsToken,
        model:'openai/gpt-4o')});

      const capabilities = gpt4oAPI.getCapabilities();
      expect(capabilities.features).toBeDefined();
      expect(capabilities.features.multimodal).toBeDefined();
      
      logger.info(`🖼️ Multimodal support:${capabilities.features.multimodal}`);
      logger.info(`🧠 Reasoning support:${capabilities.features.reasoning}`);
      logger.info(`💻 Coding support:${capabilities.features.coding}`);
      logger.info(`📋 Planning support:${capabilities.features.planning}`);
});
});

  describe('Error Handling', () => {
    it('should handle invalid PAT token gracefully', async () => {
      const invalidAPI = new GitHubModelsAPI({
        token: 'ghp_invalid_token_test',        model:'openai/gpt-4o')});

      const result = await invalidAPI.execute({
        messages:[{ role: 'user', content: ' test'}]
});

      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        expect(result.error.code).toBeTruthy();
        expect(result.error.message).toBeTruthy();
        logger.info(`🚫 Expected error with invalid PAT token:${result.error.message}`);
}
}, 15000);

    it('should handle network errors', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping network error test');
        return;
}

      const invalidAPI = new GitHubModelsAPI({
        token:modelsToken,
        model: 'openai/gpt-4o',        baseURL:'https://invalid-models-url-12345.com')});

      const result = await invalidAPI.execute({
        messages:[{ role: 'user', content: ' test'}]
});

      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        expect(result.error.code).toBeTruthy();
        logger.info(`🌐 Expected network error:${result.error.message}`);
}
}, 15000);

    it('should handle invalid model selection', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping invalid model test');
        return;
}

      const invalidModelAPI = new GitHubModelsAPI({
        token:modelsToken,
        model:'invalid/nonexistent-model' as any
});

      const result = await invalidModelAPI.execute({
        messages:[{ role: 'user', content: ' test'}]
});

      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        logger.info(`🚫 Expected error with invalid model:${result.error.message}`);
}
}, 15000);
});

  describe('Provider Factory Integration', () => {
    it('should create provider via factory with real PAT token', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping factory test');
        return;
}

      const provider = createGitHubModelsProvider({
        token:modelsToken,
        model:'openai/gpt-4o')});

      expect(provider).toBeDefined();
      expect(provider.id).toBe('github-models-api');
      expect(provider.name).toBe('GitHub Models API');

      const result = await provider.execute({
        messages:[{
          role: 'user',          content:'Just respond with "models factory test successful"')}]
});

      expect(result.isOk()).toBe(true);
      
      if (result.isOk()) {
        logger.info(`🏭 Models Factory test successful:${result.value.content.substring(0, 100)}...`);
}
}, 20000);
});

  describe('API Capabilities Comparison', () => {
    it('should show different capabilities than Copilot API', async () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping capabilities comparison');
        return;
}

      const capabilities = modelsAPI.getCapabilities();
      
      expect(capabilities).toBeDefined();
      expect(capabilities.features).toBeDefined();
      expect(capabilities.models).toBeDefined();
      expect(capabilities.maxTokens).toBe(4000); // GitHub Models limit
      expect(capabilities.contextWindow).toBe(8000); // GitHub Models input limit
      
      logger.info('🔍 GitHub Models API Capabilities: ');
'      logger.info(`   Max Tokens:${capabilities.maxTokens}`);
      logger.info(`   Context Window:${capabilities.contextWindow}`);
      logger.info(`   Available Models:${capabilities.models?.length}`);
      logger.info(`   Streaming:${capabilities.features.streaming}`);
      logger.info(`   Multimodal:${capabilities.features.multimodal}`);
      logger.info(`   Custom Tools:${capabilities.features.customTools}`);
      logger.info(`   Pricing:$${capabilities.pricing?.inputTokens}/1K input, $${capabilities.pricing?.outputTokens}/1K output`);
});
});

  describe('Usage Statistics', () => {
    it('should track usage statistics', () => {
      if (!modelsToken) {
        logger.info('⚠️ No Models token available - skipping usage stats');
        return;
}

      const _stats = modelsAPI.getUsageStats();
      expect(stats).toBeDefined();
      expect(typeof stats.requestCount).toBe('number');
      expect(typeof stats.lastRequestTime).toBe('number');
      
      logger.info(`📊 Usage Stats:${stats.requestCount} requests, last:${new Date(stats.lastRequestTime).toISOString()}`);
});
});
});