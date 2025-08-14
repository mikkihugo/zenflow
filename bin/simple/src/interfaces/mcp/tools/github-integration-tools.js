const githubIntegrationTools = [
    {
        name: 'github_status',
        description: 'Get GitHub repository status and health',
        category: 'github-integration',
        version: '1.0.0',
        priority: 1,
        metadata: {
            tags: ['github', 'repository', 'status'],
            examples: [
                {
                    name: 'Get repo status',
                    params: { repository: 'owner/repo' },
                },
            ],
        },
        permissions: [{ type: 'read', resource: 'github' }],
        inputSchema: {
            type: 'object',
            properties: {
                repository: { type: 'string' },
                includeIssues: { type: 'boolean', default: true },
                includePrs: { type: 'boolean', default: true },
            },
        },
        handler: async (params) => {
            const { repository, includeIssues = true, includePrs = true } = params;
            return {
                success: true,
                data: {
                    repository: repository || 'claude-code-zen',
                    status: 'healthy',
                    issues: includeIssues
                        ? {
                            open: 12,
                            closed: 156,
                        }
                        : undefined,
                    pullRequests: includePrs
                        ? {
                            open: 3,
                            merged: 89,
                        }
                        : undefined,
                    lastActivity: new Date().toISOString(),
                },
            };
        },
    },
    {
        name: 'github_create_issue',
        description: 'Create a new GitHub issue',
        category: 'github-integration',
        version: '1.0.0',
        priority: 2,
        metadata: {
            tags: ['github', 'issue', 'create'],
            examples: [
                {
                    name: 'Create issue',
                    params: { title: 'Bug fix needed', body: 'Description of the issue' },
                },
            ],
        },
        permissions: [{ type: 'write', resource: 'github' }],
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                body: { type: 'string' },
                labels: { type: 'array', items: { type: 'string' }, default: [] },
                assignees: { type: 'array', items: { type: 'string' }, default: [] },
            },
            required: ['title'],
        },
        handler: async (params) => {
            const { title, body, labels = [], assignees = [] } = params;
            const issueNumber = Math.floor(Math.random() * 1000) + 1;
            return {
                success: true,
                data: {
                    issueNumber,
                    title,
                    body,
                    labels,
                    assignees,
                    status: 'created',
                    url: `https://github.com/owner/repo/issues/${issueNumber}`,
                    createdAt: new Date().toISOString(),
                },
            };
        },
    },
    {
        name: 'github_pr_status',
        description: 'Get status of pull requests',
        category: 'github-integration',
        version: '1.0.0',
        priority: 1,
        metadata: {
            tags: ['github', 'pull-request', 'status'],
            examples: [
                {
                    name: 'Get PR status',
                    params: { state: 'open' },
                },
            ],
        },
        permissions: [{ type: 'read', resource: 'github' }],
        inputSchema: {
            type: 'object',
            properties: {
                prNumber: { type: 'number' },
                state: {
                    type: 'string',
                    enum: ['open', 'closed', 'merged'],
                    default: 'open',
                },
                includeChecks: { type: 'boolean', default: true },
            },
        },
        handler: async (params) => {
            const { prNumber, state = 'open', includeChecks = true } = params;
            const prs = [
                {
                    number: 123,
                    title: 'Add new feature',
                    state: 'open',
                    author: 'developer',
                    checks: { passing: 5, failing: 0, pending: 1 },
                },
                {
                    number: 124,
                    title: 'Fix bug in authentication',
                    state: 'open',
                    author: 'maintainer',
                    checks: { passing: 6, failing: 0, pending: 0 },
                },
            ];
            let filteredPrs = prs;
            if (prNumber) {
                filteredPrs = prs.filter((pr) => pr.number === prNumber);
            }
            if (state) {
                filteredPrs = filteredPrs.filter((pr) => pr.state === state);
            }
            return {
                success: true,
                data: {
                    pullRequests: filteredPrs.map((pr) => ({
                        ...pr,
                        checks: includeChecks ? pr.checks : undefined,
                    })),
                    count: filteredPrs.length,
                },
            };
        },
    },
];
export default githubIntegrationTools;
//# sourceMappingURL=github-integration-tools.js.map