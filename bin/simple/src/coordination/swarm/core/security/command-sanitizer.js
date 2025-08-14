const { spawn } = require('node:child_process');
const path = require('node:path');
class CommandSanitizer {
    static async safeExec(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                ...options,
                stdio: options.stdio || 'pipe',
            });
            let stdout = '';
            let stderr = '';
            if (child?.stdout) {
                child?.stdout?.on('data', (data) => {
                    stdout += data.toString();
                });
            }
            if (child?.stderr) {
                child?.stderr?.on('data', (data) => {
                    stderr += data.toString();
                });
            }
            child?.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
                }
                else {
                    reject(new Error(`Command failed with code ${code}: ${stderr}`));
                }
            });
            child?.on('error', (error) => {
                reject(error);
            });
        });
    }
    static validateIssueNumber(issueNumber) {
        const num = Number.parseInt(issueNumber, 10);
        if (Number.isNaN(num) || num <= 0 || num > 999999) {
            throw new Error('Invalid issue number: must be positive integer < 1000000');
        }
        return num;
    }
    static validateRepoIdentifier(identifier) {
        const repoRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
        if (!repoRegex.test(identifier) || identifier.length > 39) {
            throw new Error('Invalid repository identifier: must be alphanumeric with hyphens, max 39 chars');
        }
        return identifier;
    }
    static sanitizeSwarmId(swarmId) {
        const sanitized = swarmId.replace(/[^a-zA-Z0-9_-]/g, '');
        if (sanitized.length === 0 || sanitized.length > 50) {
            throw new Error('Invalid swarm ID: must be alphanumeric with underscores/hyphens, max 50 chars');
        }
        return sanitized;
    }
    static sanitizeLabel(label) {
        const sanitized = label.replace(/[^a-zA-Z0-9._-]/g, '');
        if (sanitized.length === 0 || sanitized.length > 50) {
            throw new Error('Invalid label: must be alphanumeric with dots/underscores/hyphens, max 50 chars');
        }
        return sanitized;
    }
    static sanitizeMessage(message) {
        if (typeof message !== 'string') {
            throw new Error('Message must be a string');
        }
        const sanitized = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        if (sanitized.length > 10000) {
            throw new Error('Message too long: maximum 10000 characters');
        }
        return sanitized;
    }
    static validateFilePath(filePath) {
        const normalized = path.normalize(filePath);
        if (normalized.includes('..') || path.isAbsolute(normalized)) {
            throw new Error('Invalid file path: no directory traversal or absolute paths allowed');
        }
        const allowedExtensions = ['.json', '.md', '.txt', '.yml', '.yaml'];
        const ext = path.extname(normalized).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            throw new Error(`Invalid file extension: only ${allowedExtensions.join(', ')} allowed`);
        }
        return normalized;
    }
    static sanitizeBranchName(branchName) {
        const sanitized = branchName.replace(/[^a-zA-Z0-9._/-]/g, '');
        if (sanitized.length === 0 ||
            sanitized.length > 100 ||
            sanitized.startsWith('/') ||
            sanitized.endsWith('/') ||
            sanitized.includes('..')) {
            throw new Error('Invalid branch name');
        }
        return sanitized;
    }
    static validateEnvironment() {
        const required = ['GITHUB_OWNER', 'GITHUB_REPO'];
        const missing = required.filter((env) => !process.env[env]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        try {
            CommandSanitizer.validateRepoIdentifier(process.env['GITHUB_OWNER']);
            CommandSanitizer.validateRepoIdentifier(process.env['GITHUB_REPO']);
        }
        catch (error) {
            throw new Error(`Invalid environment variable: ${error.message}`);
        }
    }
    static createGitHubArgs(operation, params) {
        const validOperations = {
            'issue-list': ['issue', 'list'],
            'issue-edit': ['issue', 'edit'],
            'issue-comment': ['issue', 'comment'],
            'pr-create': ['pr', 'create'],
        };
        if (!validOperations[operation]) {
            throw new Error(`Invalid GitHub operation: ${operation}`);
        }
        const baseArgs = validOperations[operation];
        const args = [...baseArgs];
        if (params?.repo) {
            const [owner, repo] = params?.repo?.split('/');
            CommandSanitizer.validateRepoIdentifier(owner);
            CommandSanitizer.validateRepoIdentifier(repo);
            args.push('--repo', `${owner}/${repo}`);
        }
        switch (operation) {
            case 'issue-list':
                if (params?.state) {
                    const validStates = ['open', 'closed', 'all'];
                    if (validStates.includes(params?.state)) {
                        args.push('--state', params?.state);
                    }
                }
                if (params?.label) {
                    args.push('--label', CommandSanitizer.sanitizeLabel(params?.label));
                }
                if (params?.limit) {
                    const limit = Number.parseInt(params?.limit, 10);
                    if (limit > 0 && limit <= 1000) {
                        args.push('--limit', limit.toString());
                    }
                }
                args.push('--json', 'number,title,labels,assignees,state,body');
                break;
            case 'issue-edit':
                if (params?.issueNumber) {
                    args.push(CommandSanitizer.validateIssueNumber(params?.issueNumber).toString());
                }
                if (params?.addLabel) {
                    args.push('--add-label', CommandSanitizer.sanitizeLabel(params?.addLabel));
                }
                if (params?.removeLabel) {
                    args.push('--remove-label', CommandSanitizer.sanitizeLabel(params?.removeLabel));
                }
                break;
            case 'issue-comment':
                if (params?.issueNumber) {
                    args.push(CommandSanitizer.validateIssueNumber(params?.issueNumber).toString());
                }
                if (params?.body) {
                    args.push('--body', CommandSanitizer.sanitizeMessage(params?.body));
                }
                break;
            case 'pr-create':
                if (params?.title) {
                    args.push('--title', CommandSanitizer.sanitizeMessage(params?.title));
                }
                if (params?.body) {
                    args.push('--body', CommandSanitizer.sanitizeMessage(params?.body));
                }
                if (params?.base) {
                    args.push('--base', CommandSanitizer.sanitizeBranchName(params?.base));
                }
                if (params?.head) {
                    args.push('--head', CommandSanitizer.sanitizeBranchName(params?.head));
                }
                break;
        }
        return args;
    }
    static createGitArgs(operation, params) {
        const validOperations = {
            checkout: ['checkout'],
            add: ['add'],
            commit: ['commit'],
            push: ['push'],
        };
        if (!validOperations[operation]) {
            throw new Error(`Invalid git operation: ${operation}`);
        }
        const args = [...validOperations[operation]];
        switch (operation) {
            case 'checkout':
                if (params?.createBranch) {
                    args.push('-b');
                }
                if (params?.branch) {
                    args.push(CommandSanitizer.sanitizeBranchName(params?.branch));
                }
                break;
            case 'add':
                if (params?.file) {
                    args.push(CommandSanitizer.validateFilePath(params?.file));
                }
                break;
            case 'commit':
                if (params?.message) {
                    args.push('-m', CommandSanitizer.sanitizeMessage(params?.message));
                }
                break;
            case 'push':
                if (params?.remote) {
                    args.push(CommandSanitizer.validateRepoIdentifier(params?.remote));
                }
                if (params?.branch) {
                    args.push(CommandSanitizer.sanitizeBranchName(params?.branch));
                }
                break;
        }
        return args;
    }
}
module.exports = CommandSanitizer;
//# sourceMappingURL=command-sanitizer.js.map