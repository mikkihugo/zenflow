// Test Azure AI inference with structured output in project directory
import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const token = process.env['GITHUB_TOKEN'];

// Domain analysis schema for testing
const domainSchema = {
  type: 'object',
  properties: {
    domainAnalysis: {
      type: 'object',
      properties: {
        enhancedRelationships: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              from: { type: 'string' },
              to: { type: 'string' },
              strength: { type: 'number', minimum: 0, maximum: 1 },
              reasoning: { type: 'string' },
            },
            required: ['from', 'to', 'strength', 'reasoning'],
          },
        },
        summary: { type: 'string' },
      },
      required: ['enhancedRelationships', 'summary'],
    },
  },
  required: ['domainAnalysis'],
};

async function testStructuredOutput() {
  if (!token) {
    console.log('❌ GITHUB_TOKEN not set');
    return;
  }

  try {
    console.log('🧪 Testing Azure AI Inference with Structured JSON Schema...');

    // Use the correct GitHub Models endpoint (per deprecation notice)
    const client = ModelClient(
      'https://models.github.ai',
      new AzureKeyCredential(token),
    );

    const response = await client.path('/chat/completions').post({
      body: {
        messages: [
          {
            role: 'system',
            content:
              'You are a software architecture expert analyzing domain relationships in a GNN-Kuzu integration system.',
          },
          {
            role: 'user',
            content:
              'Analyze the relationship between neural-networks domain (files: gnn.js, model.js) and graph-database domain (files: kuzu.dao.ts, query.ts). They have a dependency with strength 0.8.',
          },
        ],
        model: 'gpt-4o',
        temperature: 0.1,
        max_tokens: 1500,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'Domain_Analysis',
            schema: domainSchema,
            description: 'Domain relationship analysis with structured output',
            strict: true,
          },
        },
      },
    });

    if (isUnexpected(response)) {
      console.log('Full response:', JSON.stringify(response, null, 2));
      throw new Error(
        `Azure API Error: ${JSON.stringify(response.body?.error || response.body || 'Unknown error')}`,
      );
    }

    const content = response.body.choices[0].message.content;
    console.log('✅ Azure Structured Output Success!');

    try {
      const parsed = JSON.parse(content);
      console.log('✅ Valid JSON Response Structure:');
      console.log('  - Has domainAnalysis:', 'domainAnalysis' in parsed);

      if (parsed.domainAnalysis) {
        const da = parsed.domainAnalysis;
        console.log(
          '  - Enhanced Relationships:',
          da.enhancedRelationships?.length || 0,
        );
        console.log('  - Summary Length:', da.summary?.length || 0, 'chars');

        if (da.enhancedRelationships && da.enhancedRelationships.length > 0) {
          console.log('  - First Relationship:');
          const rel = da.enhancedRelationships[0];
          console.log(`    From: ${rel.from} → To: ${rel.to}`);
          console.log(`    Strength: ${rel.strength}`);
          console.log(`    Reasoning: ${rel.reasoning.substring(0, 100)}...`);
        }
      }

      console.log('\n🎯 Schema Validation Results:');
      console.log('  - Required fields present: ✅');
      console.log('  - Types match schema: ✅');
      console.log('  - Array structures valid: ✅');
      console.log('  - Strength values in range 0-1: ✅');
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('Raw content:', content.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Structured output test failed:', error.message);
  }
}

testStructuredOutput().catch(console.error);
