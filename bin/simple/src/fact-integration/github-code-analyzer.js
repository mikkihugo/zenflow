import { basename, extname } from 'node:path';
import { Octokit } from '@octokit/rest';
export class GitHubCodeAnalyzer {
    octokit;
    rateLimitRemaining = 5000;
    rateLimitResetTime = 0;
    constructor(token) {
        this.octokit = new Octokit({
            auth: token || process.env.GITHUB_TOKEN,
        });
    }
    async analyzeRepository(repoInfo) {
        try {
            const { data: repo } = await this.octokit.repos.get({
                owner: repoInfo.owner,
                repo: repoInfo.repo,
            });
            const repoMetadata = {
                name: repo.full_name,
                description: repo.description || '',
                language: repo.language || 'unknown',
                stars: repo.stargazers_count,
                license: repo.license?.name || 'unknown',
                topics: repo.topics || [],
                lastUpdate: repo.updated_at,
            };
            const { data: tree } = await this.octokit.git.getTree({
                owner: repoInfo.owner,
                repo: repoInfo.repo,
                tree_sha: repoInfo.branch || repo.default_branch,
                recursive: 'true',
            });
            const interestingFiles = tree.tree.filter((item) => item.type === 'blob' && this.isInterestingFile(item.path || ''));
            const snippets = [];
            const patterns = [];
            const batchSize = 10;
            for (let i = 0; i < interestingFiles.length; i += batchSize) {
                const batch = interestingFiles.slice(i, i + batchSize);
                const batchResults = await Promise.allSettled(batch.map((file) => this.analyzeFile(repoInfo, file, repoMetadata)));
                for (const result of batchResults) {
                    if (result.status === 'fulfilled' && result.value) {
                        snippets.push(...result.value.snippets);
                        if (result.value.pattern) {
                            patterns.push(result.value.pattern);
                        }
                    }
                }
                await this.checkRateLimit();
            }
            const detectedPatterns = await this.detectProjectPatterns(repoInfo, tree.tree, repoMetadata);
            patterns.push(...detectedPatterns);
            return {
                snippets: this.deduplicateSnippets(snippets),
                patterns: this.deduplicatePatterns(patterns),
                repoMetadata,
            };
        }
        catch (error) {
            console.error(`Failed to analyze repository ${repoInfo.owner}/${repoInfo.repo}:`, error);
            throw error;
        }
    }
    async analyzeHexPackageRepos(packageName, version) {
        const searchQueries = [
            `${packageName} language:elixir`,
            `${packageName} phoenix example`,
            `${packageName} tutorial elixir`,
            `"${packageName}" in:readme language:elixir`,
        ];
        const allSnippets = [];
        const allPatterns = [];
        let officialRepo;
        for (const query of searchQueries) {
            try {
                const { data: searchResults } = await this.octokit.search.repos({
                    q: query,
                    sort: 'stars',
                    order: 'desc',
                    per_page: 10,
                });
                for (const repo of searchResults.items) {
                    const repoInfo = {
                        owner: repo.owner.login,
                        repo: repo.name,
                    };
                    try {
                        const analysis = await this.analyzeRepository(repoInfo);
                        if (repo.full_name
                            .toLowerCase()
                            .includes(packageName.toLowerCase()) ||
                            repo.description?.toLowerCase().includes('official')) {
                            officialRepo = analysis.snippets;
                        }
                        allSnippets.push(...analysis.snippets);
                        allPatterns.push(...analysis.patterns);
                        await this.checkRateLimit();
                    }
                    catch (error) {
                        console.warn(`Failed to analyze ${repo.full_name}:`, error);
                    }
                }
            }
            catch (error) {
                console.warn(`Search failed for query "${query}":`, error);
            }
        }
        return {
            officialRepo,
            exampleRepos: this.filterSnippetsByCategory(allSnippets, 'example'),
            tutorialRepos: this.filterSnippetsByCategory(allSnippets, 'documentation'),
            patterns: this.deduplicatePatterns(allPatterns),
        };
    }
    extractGitHubDependencies(content, fileType) {
        const githubDeps = [];
        switch (fileType) {
            case 'mix.exs': {
                const elixirGitPattern = /\{:(\w+),\s*github:\s*['"]([\w-]+\/([\w-]+))['"]\s*(?:,\s*ref:\s*['"]([^'"]+)['"])?\s*(?:,\s*subdir:\s*['"]([^'"]+)['"])?\s*\}/g;
                let elixirMatch;
                while ((elixirMatch = elixirGitPattern.exec(content)) !== null) {
                    githubDeps.push({
                        name: elixirMatch[1],
                        repo: elixirMatch[2],
                        ref: elixirMatch[4],
                        subdir: elixirMatch[5],
                    });
                }
                break;
            }
            case 'package.json':
                try {
                    const packageJson = JSON.parse(content);
                    const deps = {
                        ...packageJson.dependencies,
                        ...packageJson.devDependencies,
                    };
                    for (const [name, version] of Object.entries(deps)) {
                        if (typeof version === 'string' && version.includes('github:')) {
                            const githubUrl = version.replace('github:', '');
                            githubDeps.push({ name, repo: githubUrl });
                        }
                    }
                }
                catch {
                }
                break;
            case 'Cargo.toml': {
                const cargoGitPattern = /(\w+)\s*=\s*\{\s*git\s*=\s*['"](https:\/\/github\.com\/([\w-]+\/([\w-]+)))['"]\s*(?:,\s*branch\s*=\s*['"]([^'"]+)['"])?\s*\}/g;
                let cargoMatch;
                while ((cargoMatch = cargoGitPattern.exec(content)) !== null) {
                    githubDeps.push({
                        name: cargoMatch[1],
                        repo: cargoMatch[4],
                        ref: cargoMatch[5],
                    });
                }
                break;
            }
        }
        return githubDeps;
    }
    generateFACTEntries(toolName, version, analysis) {
        const snippets = analysis.officialRepo || analysis.exampleRepos;
        return {
            documentation: `GitHub-sourced documentation and examples for ${toolName}@${version}`,
            snippets: snippets
                .filter((s) => s.category === 'example')
                .map((s) => ({
                title: s.title,
                code: s.code,
                description: s.description,
            })),
            examples: snippets
                .filter((s) => s.category === 'pattern')
                .map((s) => ({
                title: s.title,
                code: s.code,
                explanation: s.description,
            })),
            bestPractices: analysis.patterns.map((p) => ({
                practice: p.name,
                rationale: p.description,
            })),
            troubleshooting: snippets
                .filter((s) => s.tags.includes('troubleshooting'))
                .map((s) => ({
                issue: s.title,
                solution: s.code,
            })),
        };
    }
    isInterestingFile(path) {
        const interestingExtensions = [
            '.ex',
            '.exs',
            '.erl',
            '.hrl',
            '.gleam',
            '.rs',
            '.js',
            '.ts',
            '.py',
            '.md',
            '.yml',
            '.yaml',
            '.toml',
            '.json',
        ];
        const interestingPaths = [
            'examples/',
            'example/',
            'demo/',
            'samples/',
            'tutorials/',
            'guides/',
            'docs/',
            'lib/',
            'src/',
            'priv/',
            'config/',
            'test/',
            'spec/',
        ];
        const ext = extname(path);
        const pathLower = path.toLowerCase();
        return (interestingExtensions.includes(ext) &&
            (interestingPaths.some((p) => pathLower.includes(p)) ||
                pathLower.includes('readme') ||
                pathLower.includes('example') ||
                pathLower.includes('tutorial')));
    }
    async analyzeFile(repoInfo, file, repoMetadata) {
        try {
            const { data: fileData } = await this.octokit.repos.getContent({
                owner: repoInfo.owner,
                repo: repoInfo.repo,
                path: file.path,
            });
            if ('content' in fileData) {
                const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
                const language = this.detectLanguage(file.path);
                if (content.length > 50000) {
                    return null;
                }
                const snippets = this.extractSnippetsFromFile(content, file.path, language, repoMetadata);
                return { snippets };
            }
        }
        catch (error) {
            return null;
        }
        return null;
    }
    extractSnippetsFromFile(content, filePath, language, repoMetadata) {
        const snippets = [];
        const fileName = basename(filePath);
        if (filePath.includes('example') || filePath.includes('demo')) {
            snippets.push({
                id: `${repoMetadata.name}:${filePath}`,
                title: `${fileName} - ${repoMetadata.name}`,
                description: `Example from ${repoMetadata.description}`,
                code: content,
                language,
                filePath,
                repoUrl: `https://github.com/${repoMetadata.name}`,
                tags: ['example', 'github', language],
                category: 'example',
                complexity: this.estimateComplexity(content),
                metadata: {
                    lines: content.split('\n').length,
                    stars: repoMetadata.stars,
                    license: repoMetadata.license,
                },
            });
        }
        if (language === 'elixir') {
            const functions = this.extractElixirFunctions(content);
            for (const func of functions) {
                snippets.push({
                    id: `${repoMetadata.name}:${filePath}:${func.name}`,
                    title: `${func.name} - Elixir Function`,
                    description: func.doc || `Function ${func.name} from ${repoMetadata.name}`,
                    code: func.code,
                    language: 'elixir',
                    filePath,
                    repoUrl: `https://github.com/${repoMetadata.name}`,
                    tags: ['function', 'elixir', 'github'],
                    category: 'pattern',
                    complexity: this.estimateComplexity(func.code),
                    metadata: {
                        lines: func.code.split('\n').length,
                        stars: repoMetadata.stars,
                        license: repoMetadata.license,
                    },
                });
            }
        }
        return snippets;
    }
    extractElixirFunctions(content) {
        const functions = [];
        const funcPattern = /(?:@doc\s+["']([^"']+)["']\s+)?def\s+(\w+)(?:\([^)]*\))?\s+do\s*(.*?)\s+end/gms;
        let match;
        while ((match = funcPattern.exec(content)) !== null) {
            functions.push({
                name: match[2],
                code: match[0],
                doc: match[1],
            });
        }
        return functions;
    }
    detectLanguage(filePath) {
        const ext = extname(filePath);
        const langMap = {
            '.ex': 'elixir',
            '.exs': 'elixir',
            '.erl': 'erlang',
            '.hrl': 'erlang',
            '.gleam': 'gleam',
            '.rs': 'rust',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.py': 'python',
            '.md': 'markdown',
        };
        return langMap[ext] || 'text';
    }
    estimateComplexity(code) {
        const lines = code.split('\n').length;
        const complexPatterns = [
            /GenServer/,
            /Supervisor/,
            /Task\./,
            /Agent\./,
            /async/,
            /await/,
            /Task\./,
            /Stream\./,
            /Ecto\./,
            /Phoenix\./,
            /Plug\./,
        ];
        const complexityScore = complexPatterns.filter((pattern) => pattern.test(code)).length;
        if (lines < 20 && complexityScore === 0)
            return 'basic';
        if (lines < 100 && complexityScore < 3)
            return 'intermediate';
        return 'advanced';
    }
    async detectProjectPatterns(repoInfo, tree, repoMetadata) {
        const patterns = [];
        if (tree.some((file) => file.path === 'mix.exs') &&
            tree.some((file) => file.path?.includes('phoenix'))) {
            patterns.push({
                name: 'Phoenix Web Application',
                description: 'Standard Phoenix web application structure',
                files: tree
                    .filter((f) => f.path?.match(/\.(ex|exs|eex)$/))
                    .map((f) => ({
                    path: f.path,
                    purpose: this.inferFilePurpose(f.path),
                    content: '',
                })),
                setup: ['mix deps.get', 'mix ecto.setup', 'mix phx.server'],
                usage: [
                    'Visit http://localhost:4000',
                    'Start with lib/my_app_web/router.ex for routing',
                    'Add controllers in lib/my_app_web/controllers/',
                ],
                ecosystem: 'beam',
            });
        }
        return patterns;
    }
    inferFilePurpose(filePath) {
        if (filePath.includes('controller'))
            return 'HTTP request handling';
        if (filePath.includes('model') || filePath.includes('schema'))
            return 'Data modeling';
        if (filePath.includes('view'))
            return 'View rendering';
        if (filePath.includes('router'))
            return 'URL routing';
        if (filePath.includes('test'))
            return 'Testing';
        if (filePath.includes('config'))
            return 'Configuration';
        return 'Application logic';
    }
    async checkRateLimit() {
        try {
            const { data: rateLimit } = await this.octokit.rateLimit.get();
            this.rateLimitRemaining = rateLimit.rate.remaining;
            this.rateLimitResetTime = rateLimit.rate.reset * 1000;
            if (this.rateLimitRemaining < 10) {
                const waitTime = this.rateLimitResetTime - Date.now();
                if (waitTime > 0) {
                    console.log(`Rate limit low (${this.rateLimitRemaining}), waiting ${waitTime}ms`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));
                }
            }
        }
        catch (error) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    deduplicateSnippets(snippets) {
        const seen = new Set();
        return snippets.filter((snippet) => {
            const key = `${snippet.title}:${snippet.code.slice(0, 100)}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    deduplicatePatterns(patterns) {
        const seen = new Set();
        return patterns.filter((pattern) => {
            if (seen.has(pattern.name))
                return false;
            seen.add(pattern.name);
            return true;
        });
    }
    filterSnippetsByCategory(snippets, category) {
        return snippets.filter((s) => s.category === category);
    }
}
export default GitHubCodeAnalyzer;
//# sourceMappingURL=github-code-analyzer.js.map