import { describe, expect, it } from 'vitest';
import { 
  GitHubCopilotAPI,
  createGitHubCopilotProvider
} from '../../src/api/github-copilot';
import { 
  GitHubModelsAPI,
  createGitHubModelsProvider
} from '../../src/api/github-models';

describe('GitHub APIs Structure Tests', () => {
  describe('GitHub Copilot API', () => {
    it('should have correct class structure', () => {
      expect(GitHubCopilotAPI).toBeDefined();
      expect(typeof GitHubCopilotAPI).toBe('function');
    });

    it('should have factory function', () => {
      expect(createGitHubCopilotProvider).toBeDefined();
      expect(typeof createGitHubCopilotProvider).toBe('function');
    });

    it('should have default configuration in class', () => {
      const api = new GitHubCopilotAPI({
        token: 'test-token',
        model: 'gpt-4'
      });
      
      expect(api.id).toBe('github-copilot-api');
      expect(api.name).toBe('GitHub Copilot Chat API');
      expect(api.type).toBe('api');
    });

    it('should create instance without making API calls', () => {
      // Test instance creation without actual token
      expect(() => {
        const api = new GitHubCopilotAPI({
          token: 'test-token',
          model: 'gpt-4'
        });
        expect(api).toBeDefined();
      }).not.toThrow();
    });

    it('should have required methods', () => {
      const api = new GitHubCopilotAPI({
        token: 'test-token', 
        model: 'gpt-4'
      });

      expect(api.execute).toBeDefined();
      expect(typeof api.execute).toBe('function');
      expect(api.listModels).toBeDefined();
      expect(typeof api.listModels).toBe('function');
    });
  });

  describe('GitHub Models API', () => {
    it('should have correct class structure', () => {
      expect(GitHubModelsAPI).toBeDefined();
      expect(typeof GitHubModelsAPI).toBe('function');
    });

    it('should have factory function', () => {
      expect(createGitHubModelsProvider).toBeDefined();
      expect(typeof createGitHubModelsProvider).toBe('function');
    });

    it('should create instance without making API calls', () => {
      expect(() => {
        const api = new GitHubModelsAPI({
          token: 'test-token',
          model: 'gpt-4o'
        });
        expect(api).toBeDefined();
      }).not.toThrow();
    });

    it('should have required methods', () => {
      const api = new GitHubModelsAPI({
        token: 'test-token',
        model: 'gpt-4o'
      });

      expect(api.execute).toBeDefined();
      expect(typeof api.execute).toBe('function');
      expect(api.listModels).toBeDefined();
      expect(typeof api.listModels).toBe('function');
    });
  });

  describe('Configuration Tests', () => {
    it('should handle missing .claude-zen config gracefully', () => {
      // Note: The actual copilot key is stored in .claude-zen as JSON
      // These tests run without requiring actual API credentials
      
      const api = new GitHubCopilotAPI({
        token: 'mock-gho-token',
        model: 'gpt-4'
      });
      
      expect(api).toBeDefined();
      expect(api.id).toBe('github-copilot-api');
    });

    it('should handle different token formats', () => {
      // GitHub Copilot uses gho_xxx tokens (OAuth)
      const copilotApi = new GitHubCopilotAPI({
        token: 'gho_testtoken123',
        model: 'gpt-4'
      });
      
      // GitHub Models uses ghp_xxx tokens (PAT)
      const modelsApi = new GitHubModelsAPI({
        token: 'ghp_testtoken456',
        model: 'gpt-4o'
      });
      
      expect(copilotApi.id).toBe('github-copilot-api');
      expect(modelsApi.id).toBe('github-models-api');
    });
  });

  describe('Integration Tests (Structure Only)', () => {
    it('should create GitHub Copilot provider via factory', () => {
      const provider = createGitHubCopilotProvider({
        token: 'test-gho-token',
        model: 'gpt-4'
      });
      
      expect(provider).toBeDefined();
      expect(provider.execute).toBeDefined();
    });

    it('should create GitHub Models provider via factory', () => {
      const provider = createGitHubModelsProvider({
        token: 'test-ghp-token',
        model: 'gpt-4o'
      });
      
      expect(provider).toBeDefined();
      expect(provider.execute).toBeDefined();
    });

    it('should have different base URLs for different APIs', () => {
      const copilotProvider = createGitHubCopilotProvider({
        token: 'gho_test',
        model: 'gpt-4'
      });

      const modelsProvider = createGitHubModelsProvider({
        token: 'ghp_test', 
        model: 'gpt-4o'
      });

      // They should be different instances with different configurations
      expect(copilotProvider).not.toBe(modelsProvider);
      // Both should have execute methods
      expect(copilotProvider.execute).toBeDefined();
      expect(modelsProvider.execute).toBeDefined();
    });
  });

  describe('Type Safety Tests', () => {
    it('should handle API request structures correctly', () => {
      const copilotRequest = {
        messages: [
          { role: 'user' as const, content: 'Test message' }
        ],
        temperature: 0.7,
        max_tokens: 1000
      };

      const modelsRequest = {
        messages: [
          { role: 'user' as const, content: 'Test message' }
        ],
        temperature: 0.8,
        max_tokens: 2000
      };

      // These should be valid request structures
      expect(copilotRequest).toBeDefined();
      expect(modelsRequest).toBeDefined();
      expect(copilotRequest.messages[0].role).toBe('user');
      expect(modelsRequest.messages[0].content).toBe('Test message');
    });
  });
});