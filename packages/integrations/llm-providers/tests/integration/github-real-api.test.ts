import { describe, expect, it, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { 
  GitHubCopilotAPI,
  createGitHubCopilotProvider
} from '../../src/api/github-copilot';

// Load real token from .claude-zen configuration
function loadCopilotToken(): string | null {
  try {
    const configPath = path.join(os.homedir(), '.claude-zen', 'copilot-token.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.access_token;
    }
  } catch (error) {
    console.warn('Could not load Copilot token:', error);
  }
  
  // Fallback to environment variable
  return process.env['GITHUB_COPILOT_TOKEN'] || null;
}

// Real API Integration Tests (only run when token available)
describe('GitHub Copilot Real API Integration', () => {
  let copilotToken: string | null;
  let copilotAPI: GitHubCopilotAPI;

  beforeAll(() => {
    copilotToken = loadCopilotToken();
    
    if (copilotToken) {
      copilotAPI = new GitHubCopilotAPI({
        token: copilotToken,
        model: 'gpt-4'
      });
    }
  });

  describe('Token Configuration', () => {
    it('should load token from .claude-zen config', () => {
      const configPath = path.join(os.homedir(), '.claude-zen', 'copilot-token.json');
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        expect(config).toHaveProperty('access_token');
        expect(config.access_token).toMatch(/^gho_/);
        expect(config).toHaveProperty('created_at');
        expect(config).toHaveProperty('source', 'github-copilot-oauth');
      } else {
        console.log('ℹ️ No .claude-zen/copilot-token.json found - skipping token config test');
      }
    });

    it('should validate OAuth token format', () => {
      if (copilotToken) {
        expect(copilotToken).toMatch(/^gho_/);
        expect(copilotToken.length).toBeGreaterThan(20);
        console.log('✅ Valid GitHub Copilot OAuth token format detected');
      } else {
        console.log('⚠️ No Copilot token available - skipping format validation');
      }
    });
  });

  describe('Real API Health Check', () => {
    it('should connect to GitHub Copilot API', async () => {
      if (!copilotToken) {
        console.log('⚠️ No Copilot token available - skipping health check');
        return;
      }

      const isHealthy = await copilotAPI.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
      console.log(`🏥 GitHub Copilot API Health: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    }, 15000);

    it('should list real models from GitHub Copilot API', async () => {
      if (!copilotToken) {
        console.log('⚠️ No Copilot token available - skipping models list');
        return;
      }

      const models = await copilotAPI.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      
      console.log(`📋 GitHub Copilot Models: ${models.length} available`);
      console.log(`🎯 Available models: ${models.slice(0, 5).join(', ')}${models.length > 5 ? '...' : ''}`);
      
      // Check for expected high-quality models
      const expectedModels = ['gpt-4', 'gpt-4-turbo', 'o3-mini', 'claude-sonnet-4'];
      const foundModels = expectedModels.filter(model => models.includes(model));
      console.log(`🔥 High-quality models found: ${foundModels.join(', ')}`);
    }, 15000);
  });

  describe('Real API Execution', () => {
    it('should execute real chat completion', async () => {
      if (!copilotToken) {
        console.log('⚠️ No Copilot token available - skipping real API execution');
        return;
      }

      const result = await copilotAPI.execute({
        messages: [{
          role: 'user',
          content: 'Write a simple TypeScript function that adds two numbers and returns the result. Be concise.'
        }]
      });

      expect(result.isOk()).toBe(true);
      
      if (result.isOk()) {
        const response = result.value;
        expect(response.success).toBe(true);
        expect(response.content).toBeTruthy();
        expect(response.content.length).toBeGreaterThan(10);
        expect(response.metadata?.provider).toBe('github-copilot-api');
        expect(response.metadata?.model).toBeTruthy();
        
        console.log(`🤖 GitHub Copilot Response (${response.content.length} chars):`);
        console.log(`📊 Metadata: Model=${response.metadata?.model}, Tokens=${response.metadata?.tokens}`);
        console.log(`✂️ Content Preview: ${response.content.substring(0, 150)}...`);
      }
    }, 30000);

    it('should handle different models', async () => {
      if (!copilotToken) {
        console.log('⚠️ No Copilot token available - skipping model testing');
        return;
      }

      // Get available models
      const models = await copilotAPI.listModels();
      const testModels = models.filter(m => 
        ['gpt-4', 'gpt-4-turbo', 'o3-mini'].includes(m)
      ).slice(0, 2);

      if (testModels.length === 0) {
        console.log('⚠️ No suitable test models available');
        return;
      }

      for (const model of testModels) {
        const testAPI = new GitHubCopilotAPI({
          token: copilotToken,
          model
        });

        const result = await testAPI.execute({
          messages: [{
            role: 'user',
            content: 'Respond with just the word "success" and nothing else.'
          }]
        });

        expect(result.isOk()).toBe(true);
        
        if (result.isOk()) {
          console.log(`✅ Model ${model}: Response received (${result.value.content.length} chars)`);
          expect(result.value.metadata?.model).toBe(model);
        }
      }
    }, 45000);
  });

  describe('Error Handling', () => {
    it('should handle invalid token gracefully', async () => {
      const invalidAPI = new GitHubCopilotAPI({
        token: 'gho_invalid_token_test',
        model: 'gpt-4'
      });

      const result = await invalidAPI.execute({
        messages: [{ role: 'user', content: 'test' }]
      });

      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        expect(result.error.code).toBeTruthy();
        expect(result.error.message).toContain('GitHub Copilot API error');
        console.log(`🚫 Expected error with invalid token: ${result.error.message}`);
      }
    }, 15000);

    it('should handle network errors', async () => {
      if (!copilotToken) {
        console.log('⚠️ No Copilot token available - skipping network error test');
        return;
      }

      const invalidAPI = new GitHubCopilotAPI({
        token: copilotToken,
        model: 'gpt-4',
        baseURL: 'https://invalid-url-that-does-not-exist-12345.com'
      });

      const result = await invalidAPI.execute({
        messages: [{ role: 'user', content: 'test' }]
      });

      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        expect(result.error.code).toBeTruthy();
        console.log(`🌐 Expected network error: ${result.error.message}`);
      }
    }, 15000);
  });

  describe('Provider Factory Integration', () => {
    it('should create provider via factory with real token', async () => {
      if (!copilotToken) {
        console.log('⚠️ No Copilot token available - skipping factory test');
        return;
      }

      const provider = createGitHubCopilotProvider({
        token: copilotToken,
        model: 'gpt-4'
      });

      expect(provider).toBeDefined();
      expect(provider.id).toBe('github-copilot-api');
      expect(provider.name).toBe('GitHub Copilot Chat API');

      const result = await provider.execute({
        messages: [{
          role: 'user',
          content: 'Just respond with "factory test successful"'
        }]
      });

      expect(result.isOk()).toBe(true);
      
      if (result.isOk()) {
        console.log(`🏭 Factory test successful: ${result.value.content.substring(0, 100)}...`);
      }
    }, 20000);
  });
});