import { getConfig } from '../../config';
import { createFACTClient, KnowledgeHelpers, } from '../adapters/knowledge-client-adapter.ts';
import { UACLFactory } from '../factories.ts';
export async function example1_CreateFACTClient() {
    try {
        const knowledgeClient = await createFACTClient('./FACT', (() => {
            const config = getConfig();
            if (!config?.services?.anthropic?.apiKey) {
                throw new Error('Anthropic API key is required for knowledge client');
            }
            return config?.services?.anthropic?.apiKey;
        })(), {
            caching: {
                enabled: true,
                prefix: 'example-cache',
                ttlSeconds: 1800,
                minTokens: 300,
            },
            tools: [
                'web_scraper',
                'documentation_parser',
                'api_documentation_scraper',
                'stackoverflow_search',
            ],
        });
        await knowledgeClient.connect();
        const _isHealthy = await knowledgeClient.health();
        const _metadata = await knowledgeClient.getMetadata();
        await knowledgeClient.disconnect();
    }
    catch (error) {
        console.error('❌ Example 1 failed:', error);
    }
}
export async function example2_CreateWithFactory() {
    try {
        const factory = new UACLFactory(console, {});
        const knowledgeClient = (await factory.createKnowledgeClient('fact://local', {
            provider: 'fact',
            factConfig: {
                factRepoPath: './FACT',
                anthropicApiKey: (() => {
                    const config = getConfig();
                    if (!config?.services?.anthropic?.apiKey) {
                        throw new Error('Anthropic API key is required for knowledge client');
                    }
                    return config?.services?.anthropic?.apiKey;
                })(),
                pythonPath: 'python3',
            },
            caching: {
                enabled: true,
                prefix: 'factory-cache',
                ttlSeconds: 3600,
                minTokens: 500,
            },
            timeout: 30000,
        }));
        await knowledgeClient.connect();
        const _stats = await knowledgeClient.getKnowledgeStats();
        await knowledgeClient.disconnect();
    }
    catch (error) {
        console.error('❌ Example 2 failed:', error);
    }
}
export async function example3_PerformQueries() {
    try {
        const knowledgeClient = await createFACTClient('./FACT', (() => {
            const config = getConfig();
            if (!config?.services?.anthropic?.apiKey) {
                if (config?.environment?.isDevelopment) {
                    console.warn('Using fallback API key for development');
                    return 'test-key-development';
                }
                throw new Error('Anthropic API key is required');
            }
            return config?.services?.anthropic?.apiKey;
        })());
        await knowledgeClient.connect();
        const basicQuery = {
            query: 'How to implement JWT authentication in Node.js Express?',
            type: 'semantic',
            tools: ['web_scraper', 'stackoverflow_search'],
            metadata: { category: 'authentication' },
        };
        const _basicResponse = await knowledgeClient.send(basicQuery);
        const _docResponse = await knowledgeClient.query('Get React 18 hooks documentation with examples', {
            limit: 5,
            includeMetadata: true,
            filters: { framework: 'react', version: '18' },
        });
        const _semanticResults = await knowledgeClient.semanticSearch('best practices for API error handling', {
            vectorSearch: true,
            similarity: 'cosine',
            threshold: 0.7,
            limit: 3,
        });
        const _searchResults = await knowledgeClient.search('typescript generics', {
            fuzzy: true,
            threshold: 0.8,
            fields: ['title', 'content'],
            limit: 5,
        });
        await knowledgeClient.disconnect();
    }
    catch (error) {
        console.error('❌ Example 3 failed:', error);
    }
}
export async function example4_UseHelpers() {
    try {
        const knowledgeClient = await createFACTClient('./FACT', (() => {
            const config = getConfig();
            if (!config?.services?.anthropic?.apiKey) {
                if (config?.environment?.isDevelopment) {
                    console.warn('Using fallback API key for development');
                    return 'test-key-development';
                }
                throw new Error('Anthropic API key is required');
            }
            return config?.services?.anthropic?.apiKey;
        })());
        await knowledgeClient.connect();
        const _reactDocs = await KnowledgeHelpers.getDocumentation(knowledgeClient, 'react', '18');
        const _expressAPI = await KnowledgeHelpers.getAPIReference(knowledgeClient, 'express', 'app.use');
        const _communityResults = await KnowledgeHelpers.searchCommunity(knowledgeClient, 'docker container optimization', ['docker', 'performance', 'optimization']);
        await knowledgeClient.disconnect();
    }
    catch (error) {
        console.error('❌ Example 4 failed:', error);
    }
}
export async function example5_MonitorPerformance() {
    try {
        const knowledgeClient = await createFACTClient('./FACT', (() => {
            const config = getConfig();
            if (!config?.services?.anthropic?.apiKey) {
                if (config?.environment?.isDevelopment) {
                    console.warn('Using fallback API key for development');
                    return 'test-key-development';
                }
                throw new Error('Anthropic API key is required');
            }
            return config?.services?.anthropic?.apiKey;
        })());
        await knowledgeClient.connect();
        const queries = [
            'What is TypeScript?',
            'How to use React hooks?',
            'Node.js best practices',
            'Docker container optimization',
            'API rate limiting strategies',
        ];
        for (const [_index, query] of queries.entries()) {
            const _response = await knowledgeClient.query(query, {
                includeMetadata: true,
            });
        }
        const _metadata = await knowledgeClient.getMetadata();
        const _isHealthy = await knowledgeClient.health();
        await knowledgeClient.disconnect();
    }
    catch (error) {
        console.error('❌ Example 5 failed:', error);
    }
}
export async function example6_ErrorHandling() {
    try {
        const knowledgeClient = await createFACTClient('./INVALID_FACT_PATH', 'invalid-api-key-for-testing', {
            timeout: 5000,
            caching: {
                enabled: false,
                prefix: 'test',
                ttlSeconds: 60,
                minTokens: 100,
            },
        });
        try {
            await knowledgeClient.connect();
        }
        catch (_error) { }
        const _isHealthy = await knowledgeClient.health();
        try {
            await knowledgeClient.query('test query');
        }
        catch (_error) { }
    }
    catch (_error) { }
}
export async function runAllExamples() {
    const examples = [
        example1_CreateFACTClient,
        example2_CreateWithFactory,
        example3_PerformQueries,
        example4_UseHelpers,
        example5_MonitorPerformance,
        example6_ErrorHandling,
    ];
    for (const example of examples) {
        try {
            await example();
        }
        catch (error) {
            console.error(`❌ Example failed:`, error);
        }
    }
}
if (require.main === module) {
    runAllExamples().catch(console.error);
}
export default {
    example1_CreateFACTClient,
    example2_CreateWithFactory,
    example3_PerformQueries,
    example4_UseHelpers,
    example5_MonitorPerformance,
    example6_ErrorHandling,
    runAllExamples,
};
//# sourceMappingURL=knowledge-client-example.js.map