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
        console.log(`✅ Valid GitHub token format detected:${modelsToken.startsWith('ghp_') ? ' PAT' : ' OAuth'}`);
} else {
        console.log('⚠️ No GitHub token available - skipping token validation');
        console.log('💡 Set GITHUB_TOKEN environment variable');
}
});

    it('should validate token format for GitHub Models', () => {
      if (modelsToken) {
        const isPAT = modelsToken.startsWith('ghp_');
        const isOAuth = modelsToken.startsWith('gho_');
        expect(isPAT || isOAuth).toBe(true);
        console.log(`🔑 GitHub Models API token format:${isPAT ? 'PAT (ghp_)' : ' OAuth (gho_)'}`);
        
        if (!isPAT) {
          console.log('⚠️  GitHub Models may prefer PAT tokens over OAuth tokens');
}
} else {
        console.log('⚠️ No Models token available - skipping format validation');
}
});
});

  describe('Real API Health Check', () => {
    it('should connect to GitHub Models API', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping health check');
        return;
}

      const isHealthy = await modelsAPI.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
      console.log(`🏥 GitHub Models API Health:${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
}, 15000);

    it('should list real models from GitHub Models API', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping models list');
        return;
}

      const models = await modelsAPI.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      
      console.log(`📋 GitHub Models:${models.length} available`);
      console.log(`🎯 Available models:${models.slice(0, 5).join(',    ')}${models.length > 5 ? '...' : ''}`);
'      
      // Check for expected models
      const expectedModels = ['openai/gpt-4o',    'openai/gpt-4.1',    'meta/llama-3.3-70b-instruct',    'mistral-ai/mistral-large-2411'];
      const foundModels = expectedModels.filter(model => models.includes(model));
      console.log(`🔥 Expected models found:${foundModels.join(',    ')}`);
}, 15000);
});

  describe('Real API Execution', () => {
    it('should execute real chat completion with GPT-4o', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping real API execution');
        return;
}

      const result = await modelsAPI.execute({
        messages:[{
          role: 'user',          content:'Write a simple Python function that calculates the factorial of a number. Be concise.')}]
});

      if (result.isErr()) {
        console.log(`❌ GitHub Models API Error:${result.error.message}`);
        console.log(`   Code:${result.error.code}`);
        console.log(`   Details:`, result.error.details);
        
        // GitHub Models requires special access - skip if unauthorized
        if (result.error.message?.includes('unauthorized') || result.error.message?.includes(' Invalid Github auth token')) {
          console.log('⚠️  GitHub Models API requires special access or beta approval');
          console.log('💡 This is expected if you don\' t have GitHub Models beta access');
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
        
        console.log(`🤖 GitHub Models Response (${response.content.length} chars):`);
        console.log(`📊 Metadata:Model=${response.metadata?.model}, Tokens=${response.metadata?.tokens}`);
        console.log(`✂️ Content Preview:${response.content.substring(0, 150)}...`);
}
}, 30000);

    it('should handle different models from GitHub marketplace', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping model testing');
        return;
}

      // Get available models
      const models = await modelsAPI.listModels();
      const testModels = models.filter(m => 
        ['openai/gpt-4o',    'openai/gpt-4.1',    'meta/llama-3.3-70b-instruct'].includes(m)
      ).slice(0, 2);

      if (testModels.length === 0) {
        console.log('⚠️ No suitable test models available');
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
          console.log(`✅ Model ${model}:Response received (${result.value.content.length} chars)`);
          expect(result.value.metadata?.model).toBe(model);
}
}
}, 60000);

    it('should handle multimodal capabilities', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping multimodal test');
        return;
}

      // Test with GPT-4o which supports multimodal
      const gpt4oAPI = new GitHubModelsAPI({
        token:modelsToken,
        model:'openai/gpt-4o')});

      const capabilities = gpt4oAPI.getCapabilities();
      expect(capabilities.features).toBeDefined();
      expect(capabilities.features.multimodal).toBeDefined();
      
      console.log(`🖼️ Multimodal support:${capabilities.features.multimodal}`);
      console.log(`🧠 Reasoning support:${capabilities.features.reasoning}`);
      console.log(`💻 Coding support:${capabilities.features.coding}`);
      console.log(`📋 Planning support:${capabilities.features.planning}`);
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
        console.log(`🚫 Expected error with invalid PAT token:${result.error.message}`);
}
}, 15000);

    it('should handle network errors', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping network error test');
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
        console.log(`🌐 Expected network error:${result.error.message}`);
}
}, 15000);

    it('should handle invalid model selection', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping invalid model test');
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
        console.log(`🚫 Expected error with invalid model:${result.error.message}`);
}
}, 15000);
});

  describe('Provider Factory Integration', () => {
    it('should create provider via factory with real PAT token', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping factory test');
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
        console.log(`🏭 Models Factory test successful:${result.value.content.substring(0, 100)}...`);
}
}, 20000);
});

  describe('API Capabilities Comparison', () => {
    it('should show different capabilities than Copilot API', async () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping capabilities comparison');
        return;
}

      const capabilities = modelsAPI.getCapabilities();
      
      expect(capabilities).toBeDefined();
      expect(capabilities.features).toBeDefined();
      expect(capabilities.models).toBeDefined();
      expect(capabilities.maxTokens).toBe(4000); // GitHub Models limit
      expect(capabilities.contextWindow).toBe(8000); // GitHub Models input limit
      
      console.log('🔍 GitHub Models API Capabilities: ');
'      console.log(`   Max Tokens:${capabilities.maxTokens}`);
      console.log(`   Context Window:${capabilities.contextWindow}`);
      console.log(`   Available Models:${capabilities.models?.length}`);
      console.log(`   Streaming:${capabilities.features.streaming}`);
      console.log(`   Multimodal:${capabilities.features.multimodal}`);
      console.log(`   Custom Tools:${capabilities.features.customTools}`);
      console.log(`   Pricing:$${capabilities.pricing?.inputTokens}/1K input, $${capabilities.pricing?.outputTokens}/1K output`);
});
});

  describe('Usage Statistics', () => {
    it('should track usage statistics', () => {
      if (!modelsToken) {
        console.log('⚠️ No Models token available - skipping usage stats');
        return;
}

      const stats = modelsAPI.getUsageStats();
      expect(stats).toBeDefined();
      expect(typeof stats.requestCount).toBe('number');
      expect(typeof stats.lastRequestTime).toBe('number');
      
      console.log(`📊 Usage Stats:${stats.requestCount} requests, last:${new Date(stats.lastRequestTime).toISOString()}`);
});
});
});