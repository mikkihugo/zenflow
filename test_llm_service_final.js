// Test updated LLM Integration Service with GitHub Models
import { LLMIntegrationService } from './src/coordination/services/llm-integration.service.js';

async function testLLMService() {
  console.log('🔧 Testing Updated LLM Integration Service...\n');

  const service = new LLMIntegrationService({
    projectPath: process.cwd(),
    preferredProvider: 'github-models',
    model: 'openai/gpt-5-nano',
    debug: true,
    githubToken: process.env.GITHUB_TOKEN,
  });

  // Test 1: Domain Analysis
  console.log('📊 Test 1: Domain Analysis...');
  try {
    const domainRequest = {
      task: 'domain-analysis',
      context: {
        domains: [
          { name: 'neural-networks', files: ['gnn.js', 'model.js'] },
          { name: 'graph-database', files: ['kuzu.dao.ts', 'query.ts'] },
        ],
        dependencies: [
          { from: 'neural-networks', to: 'graph-database', strength: 0.8 },
        ],
      },
      requiresFileOperations: false,
    };

    const result = await service.analyze(domainRequest);

    console.log('✅ Domain Analysis Results:');
    console.log('  - Success:', result.success);
    console.log('  - Provider:', result.provider);
    console.log('  - Execution Time:', result.executionTime + 'ms');
    console.log('  - Data Type:', typeof result.data);

    if (result.success && result.data) {
      if (typeof result.data === 'object') {
        console.log('  - ✅ Structured Response (Object)');
        console.log('  - Keys:', Object.keys(result.data));
      } else {
        console.log(
          '  - Response preview:',
          String(result.data).substring(0, 200) + '...',
        );
      }
    }
  } catch (error) {
    console.error('❌ Domain analysis failed:', error.message);
  }

  // Test 2: Smart Analysis Selection
  console.log('\n🧠 Test 2: Smart Analysis Selection...');
  try {
    const smartRequest = {
      task: 'typescript-error-analysis',
      context: {
        files: ['src/test.ts'],
        errors: [
          {
            message: "Property 'unknown' does not exist",
            file: 'test.ts',
            line: 10,
          },
        ],
      },
      requiresFileOperations: false,
    };

    const smartResult = await service.analyzeSmart(smartRequest);

    console.log('✅ Smart Analysis Results:');
    console.log('  - Success:', smartResult.success);
    console.log('  - Provider Selected:', smartResult.provider);
    console.log('  - Execution Time:', smartResult.executionTime + 'ms');

    if (smartResult.success && smartResult.data) {
      console.log('  - Response Type:', typeof smartResult.data);
      if (
        typeof smartResult.data === 'object' &&
        smartResult.data.errorAnalysis
      ) {
        console.log('  - ✅ Structured Error Analysis');
        console.log('  - Errors Found:', smartResult.data.errorAnalysis.length);
      }
    }
  } catch (error) {
    console.error('❌ Smart analysis failed:', error.message);
  }

  // Test 3: Rate Limit Status
  console.log('\n📊 Test 3: Rate Limit Status...');
  console.log(
    '  - GitHub Models Cooldown:',
    service.isInCooldown('github-models'),
  );
  console.log('  - Gemini Cooldown:', service.isInCooldown('gemini'));
  console.log(
    '  - GitHub Remaining (min):',
    service.getCooldownRemaining('github-models'),
  );
  console.log(
    '  - Gemini Remaining (min):',
    service.getCooldownRemaining('gemini'),
  );

  // Test 4: Configuration
  console.log('\n⚙️ Test 4: Service Configuration...');
  console.log('  - Preferred Provider:', service.config?.preferredProvider);
  console.log('  - Model:', service.config?.model);
  console.log('  - Max Tokens:', service.config?.maxTokens);
  console.log(
    '  - Rate Limit Cooldown:',
    service.config?.rateLimitCooldown,
    'ms',
  );
  console.log('  - GitHub Token Set:', !!service.config?.githubToken);
}

testLLMService().catch(console.error);
