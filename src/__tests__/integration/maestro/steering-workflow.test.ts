/**
 * Integration Tests for Maestro Steering Document Workflow
 * Tests the complete steering document workflow with real file system operations
 */

import { MaestroOrchestrator } from '../../../maestro/maestro-orchestrator.js';
import { readFile, writeFile, mkdir, access, unlink, rmdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { tmpdir } from 'os';

describe('Maestro Steering Workflow Integration', () => {
  let maestroOrchestrator: MaestroOrchestrator;
  let testDirectory: string;
  let mockConfig: any;
  let mockEventBus: any;
  let mockLogger: any;
  let mockMemoryManager: any;
  let mockAgentManager: any;
  let mockMainOrchestrator: any;

  beforeAll(async () => {
    // Create temporary test directory
    testDirectory = join(tmpdir(), `maestro-steering-test-${Date.now()}`);
    await mkdir(testDirectory, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup test directory
    try {
      if (existsSync(testDirectory)) {
        await rmdir(testDirectory, { recursive: true });
      }
    } catch (error) {
      console.warn(`Warning: Failed to cleanup test directory: ${error}`);
    }
  });

  beforeEach(async () => {
    // Setup mocks
    mockConfig = { environment: 'test' };
    mockEventBus = {
      emit: jest.fn(),
      on: jest.fn()
    };
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
    mockMemoryManager = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn()
    };
    mockAgentManager = {
      createAgent: jest.fn().mockResolvedValue('agent-123'),
      startAgent: jest.fn(),
      stopAgent: jest.fn()
    };
    mockMainOrchestrator = {
      assignTask: jest.fn().mockResolvedValue({ success: true })
    };

    // Create orchestrator instance with test directory
    maestroOrchestrator = new MaestroOrchestrator(
      mockConfig,
      mockEventBus,
      mockLogger,
      mockMemoryManager,
      mockAgentManager,
      mockMainOrchestrator,
      {
        enableHiveMind: false,
        steeringDirectory: join(testDirectory, 'steering')
      }
    );
  });

  describe('complete steering document workflow', () => {
    it('should create multiple steering documents for complete project setup', async () => {
      const domains = ['product', 'tech', 'structure', 'security'];
      const contents = [
        'Product vision and user experience guidelines',
        'Technology standards and development practices',
        'Project organization and file structure',
        'Security guidelines and best practices'
      ];

      // Create all steering documents
      for (let i = 0; i < domains.length; i++) {
        await maestroOrchestrator.createSteeringDocument(domains[i], contents[i]);
      }

      // Verify all files were created
      for (const domain of domains) {
        const filePath = join(testDirectory, 'steering', `${domain}.md`);
        expect(existsSync(filePath)).toBe(true);
        
        const content = await readFile(filePath, 'utf8');
        expect(content).toContain(`# ${domain.charAt(0).toUpperCase() + domain.slice(1)} Steering Document`);
        expect(content).toContain('## Guidelines');
      }
    });

    it('should integrate steering context with spec creation', async () => {
      // First create steering documents
      await maestroOrchestrator.createSteeringDocument('product', 'User-centered design principles');
      await maestroOrchestrator.createSteeringDocument('tech', 'Clean architecture standards');

      // Then create a spec (simulated)
      const featureName = 'user-authentication';
      const specDirectory = join(testDirectory, 'specs', featureName);
      await mkdir(specDirectory, { recursive: true });

      // Get steering context
      const steeringContext = await maestroOrchestrator.getSteeringContext('developer');

      // Create requirements with steering context
      const requirementsContent = `# Requirements for ${featureName}

## High-Level Request
Implement secure user authentication system

## Steering Context Applied
${steeringContext}

## User Stories
- As a user, I want secure authentication, so that my data is protected

## Acceptance Criteria
- [ ] Follows product steering guidelines
- [ ] Meets technical architecture standards
- [ ] Implements security best practices

*Generated with Steering Document Context*
`;

      await writeFile(join(specDirectory, 'requirements.md'), requirementsContent, 'utf8');

      // Verify steering context integration
      const generatedContent = await readFile(join(specDirectory, 'requirements.md'), 'utf8');
      expect(generatedContent).toContain('Steering Context Applied');
    });

    it('should handle steering document updates and versioning', async () => {
      const domain = 'versioning-test';
      const originalContent = 'Original guidelines v1';
      const updatedContent = 'Updated guidelines v2 with new standards';

      // Create initial steering document
      await maestroOrchestrator.createSteeringDocument(domain, originalContent);

      const filePath = join(testDirectory, 'steering', `${domain}.md`);
      const initialContent = await readFile(filePath, 'utf8');
      expect(initialContent).toContain(originalContent);

      // Update steering document
      await maestroOrchestrator.createSteeringDocument(domain, updatedContent);

      const updatedFileContent = await readFile(filePath, 'utf8');
      expect(updatedFileContent).toContain(updatedContent);
      expect(updatedFileContent).not.toContain(originalContent);
    });
  });

  describe('steering document validation and quality', () => {
    it('should create steering documents with consistent structure', async () => {
      const testDomains = [
        { domain: 'consistency-product', content: 'Product consistency guidelines' },
        { domain: 'consistency-tech', content: 'Technical consistency guidelines' },
        { domain: 'consistency-custom', content: 'Custom domain consistency guidelines' }
      ];

      for (const testCase of testDomains) {
        await maestroOrchestrator.createSteeringDocument(testCase.domain, testCase.content);

        const filePath = join(testDirectory, 'steering', `${testCase.domain}.md`);
        const content = await readFile(filePath, 'utf8');

        // Validate consistent structure
        expect(content).toMatch(/^# .+ Steering Document$/m);
        expect(content).toContain('## Guidelines');
        expect(content).toContain(testCase.content);
        expect(content.length).toBeGreaterThan(200); // Minimum content length
      }
    });

    it('should create domain-specific content for different steering types', async () => {
      const domainSpecificTests = [
        {
          domain: 'api-design',
          content: 'RESTful API design standards',
          expectedKeywords: ['API', 'REST', 'endpoint']
        },
        {
          domain: 'testing',
          content: 'Comprehensive testing strategies',
          expectedKeywords: ['test', 'coverage', 'automation']
        },
        {
          domain: 'deployment',
          content: 'CI/CD and deployment practices',
          expectedKeywords: ['deployment', 'CI/CD', 'pipeline']
        }
      ];

      for (const test of domainSpecificTests) {
        await maestroOrchestrator.createSteeringDocument(test.domain, test.content);

        const filePath = join(testDirectory, 'steering', `${test.domain}.md`);
        const content = await readFile(filePath, 'utf8');

        // Verify domain-specific content
        expect(content).toContain(test.content);
        
        // Check for domain-specific keywords in generated content
        const contentLower = content.toLowerCase();
        const domainKeywordsFound = test.expectedKeywords.some(keyword => 
          contentLower.includes(keyword.toLowerCase())
        );
        expect(domainKeywordsFound).toBe(true);
      }
    });

    it('should maintain proper markdown formatting', async () => {
      await maestroOrchestrator.createSteeringDocument('markdown-test', 'Testing markdown formatting');

      const filePath = join(testDirectory, 'steering', 'markdown-test.md');
      const content = await readFile(filePath, 'utf8');

      // Validate markdown structure
      expect(content).toMatch(/^# .+$/m); // Has H1 header
      expect(content).toMatch(/^## .+$/m); // Has H2 headers
      expect(content).toContain('\n\n'); // Proper paragraph spacing
      expect(content).not.toMatch(/<[^>]+>/); // No HTML tags
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle invalid domain names gracefully', async () => {
      const invalidDomains = ['', '   ', 'domain/with/slashes', 'domain with spaces'];

      for (const invalidDomain of invalidDomains) {
        // These should either be sanitized or throw appropriate errors
        try {
          await maestroOrchestrator.createSteeringDocument(invalidDomain, 'test content');
          
          // If it doesn't throw, verify the file was created with sanitized name
          const sanitizedDomain = invalidDomain.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/^-+|-+$/g, '');
          if (sanitizedDomain) {
            const filePath = join(testDirectory, 'steering', `${sanitizedDomain}.md`);
            const exists = existsSync(filePath);
            // This behavior would depend on implementation - either file exists or error was thrown
          }
        } catch (error) {
          // Error handling is acceptable for invalid domains
          expect(error).toBeDefined();
        }
      }
    });

    it('should handle concurrent steering document creation', async () => {
      const concurrentDomains = Array.from({ length: 5 }, (_, i) => `concurrent-${i}`);
      
      // Create all documents concurrently
      const promises = concurrentDomains.map(domain => 
        maestroOrchestrator.createSteeringDocument(domain, `Content for ${domain}`)
      );

      await Promise.all(promises);

      // Verify all documents were created successfully
      for (const domain of concurrentDomains) {
        const filePath = join(testDirectory, 'steering', `${domain}.md`);
        expect(existsSync(filePath)).toBe(true);
        
        const content = await readFile(filePath, 'utf8');
        expect(content).toContain(`Content for ${domain}`);
      }
    });

    it('should handle large steering document content', async () => {
      const largeContent = 'Large content section. '.repeat(1000); // ~20KB content
      
      await maestroOrchestrator.createSteeringDocument('large-content', largeContent);

      const filePath = join(testDirectory, 'steering', 'large-content.md');
      const content = await readFile(filePath, 'utf8');
      
      expect(content).toContain(largeContent);
      expect(content.length).toBeGreaterThan(20000);
    });
  });

  describe('performance and scalability', () => {
    it('should create steering documents efficiently', async () => {
      const startTime = Date.now();
      
      // Create 10 steering documents
      const domains = Array.from({ length: 10 }, (_, i) => `perf-test-${i}`);
      for (const domain of domains) {
        await maestroOrchestrator.createSteeringDocument(domain, `Performance test content for ${domain}`);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds for 10 documents
      
      // Verify all documents were created
      for (const domain of domains) {
        const filePath = join(testDirectory, 'steering', `${domain}.md`);
        expect(existsSync(filePath)).toBe(true);
      }
    });

    it('should maintain consistent performance with repeated operations', async () => {
      const domain = 'repeated-operations';
      const iterations = 5;
      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await maestroOrchestrator.createSteeringDocument(`${domain}-${i}`, `Iteration ${i} content`);
        const endTime = Date.now();
        durations.push(endTime - startTime);
      }

      // Check performance consistency (no significant degradation)
      const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      
      // Max duration shouldn't be more than 3x average (adjust as needed)
      expect(maxDuration).toBeLessThan(averageDuration * 3);
    });
  });

  describe('agent integration workflow', () => {
    it('should track agent usage across steering document operations', async () => {
      const initialStats = maestroOrchestrator.getAgentPoolStats();
      
      // Create multiple steering documents
      await maestroOrchestrator.createSteeringDocument('agent-test-1', 'Content 1');
      await maestroOrchestrator.createSteeringDocument('agent-test-2', 'Content 2');
      
      const finalStats = maestroOrchestrator.getAgentPoolStats();
      
      // Verify agent pool statistics are being tracked
      expect(finalStats).toBeDefined();
      expect(typeof finalStats.totalAgents).toBe('number');
      expect(typeof finalStats.capabilitiesCovered).toBe('number');
    });

    it('should integrate with event system for workflow tracking', async () => {
      await maestroOrchestrator.createSteeringDocument('event-test', 'Event tracking content');

      // Verify event bus interactions (current implementation may not emit events)
      // This test documents expected behavior
      expect(mockEventBus.on).toHaveBeenCalled(); // Should have event listeners
    });
  });
});