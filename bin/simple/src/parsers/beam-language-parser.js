import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
export class BeamLanguageParser {
    async parseFile(filePath) {
        try {
            const content = await readFile(filePath, 'utf8');
            const ext = extname(filePath);
            const language = this.detectLanguage(ext);
            if (!language)
                return null;
            switch (language) {
                case 'elixir':
                    return await this.parseElixirFile(filePath, content);
                case 'erlang':
                    return await this.parseErlangFile(filePath, content);
                case 'gleam':
                    return await this.parseGleamFile(filePath, content);
                default:
                    return null;
            }
        }
        catch (error) {
            console.error(`Failed to parse ${filePath}:`, error);
            return null;
        }
    }
    detectLanguage(ext) {
        switch (ext.toLowerCase()) {
            case '.ex':
            case '.exs':
                return 'elixir';
            case '.erl':
            case '.hrl':
                return 'erlang';
            case '.gleam':
                return 'gleam';
            default:
                return null;
        }
    }
    async parseElixirFile(filePath, content) {
        const moduleName = this.extractElixirModuleName(content) || basename(filePath, '.ex');
        const functions = this.extractElixirFunctions(content);
        const types = this.extractElixirTypes(content);
        const docs = this.extractElixirDocs(content);
        const deps = this.extractElixirDependencies(content);
        return {
            name: moduleName,
            path: filePath,
            language: 'elixir',
            exports: functions,
            types: types,
            documentation: docs,
            dependencies: deps,
            metadata: {
                hasGenServer: content.includes('use GenServer'),
                hasSupervisor: content.includes('use Supervisor'),
                hasApplication: content.includes('use Application'),
                hasPlug: content.includes('use Plug'),
                hasPhoenix: content.includes('use Phoenix'),
            },
        };
    }
    async parseErlangFile(filePath, content) {
        const moduleName = this.extractErlangModuleName(content) || basename(filePath, '.erl');
        const functions = this.extractErlangFunctions(content);
        const types = this.extractErlangTypes(content);
        const docs = this.extractErlangDocs(content);
        const deps = this.extractErlangDependencies(content);
        return {
            name: moduleName,
            path: filePath,
            language: 'erlang',
            exports: functions,
            types: types,
            documentation: docs,
            dependencies: deps,
            metadata: {
                behaviour: this.extractErlangBehaviours(content),
                exports: this.extractErlangExports(content),
            },
        };
    }
    async parseGleamFile(filePath, content) {
        const moduleName = basename(filePath, '.gleam');
        const functions = this.extractGleamFunctions(content);
        const types = this.extractGleamTypes(content);
        const docs = this.extractGleamDocs(content);
        const deps = this.extractGleamDependencies(content);
        return {
            name: moduleName,
            path: filePath,
            language: 'gleam',
            exports: functions,
            types: types,
            documentation: docs,
            dependencies: deps,
            metadata: {
                hasExternal: content.includes('@external'),
                hasFFI: content.includes('external'),
            },
        };
    }
    extractElixirModuleName(content) {
        const match = content.match(/defmodule\s+([A-Z][A-Za-z0-9._]*)/);
        return match ? match[1] : null;
    }
    extractElixirFunctions(content) {
        const functions = [];
        const defRegex = /(?:def|defp)\s+([a-z_][a-zA-Z0-9_]*(?:\?|!)?)\s*(?:\(([^)]*)\))?/g;
        const lines = content.split('\n');
        let match;
        while ((match = defRegex.exec(content)) !== null) {
            const functionName = match[1];
            const params = match[2] || '';
            const arity = params ? params.split(',').length : 0;
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const isPrivate = content
                .substring(match.index - 10, match.index)
                .includes('defp');
            functions.push({
                name: functionName,
                arity: arity,
                visibility: isPrivate ? 'private' : 'public',
                signature: `${functionName}(${params})`,
                lineNumber: lineNumber,
            });
        }
        return functions;
    }
    extractElixirTypes(content) {
        const types = [];
        const typeRegex = /@type\s+([a-z_][a-zA-Z0-9_]*(?:\([^)]*\))?)\s*::\s*([^\n]+)/g;
        let match;
        while ((match = typeRegex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            types.push({
                name: match[1],
                definition: match[2].trim(),
                lineNumber: lineNumber,
            });
        }
        return types;
    }
    extractElixirDocs(content) {
        const docs = [];
        const docRegex = /@moduledoc\s+"""(.*?)"""/gs;
        let match;
        while ((match = docRegex.exec(content)) !== null) {
            docs.push(match[1].trim());
        }
        return docs;
    }
    extractElixirDependencies(content) {
        const deps = [];
        const useMatches = content.matchAll(/use\s+([A-Z][A-Za-z0-9._]*)/g);
        for (const match of useMatches) {
            deps.push(match[1]);
        }
        const importMatches = content.matchAll(/import\s+([A-Z][A-Za-z0-9._]*)/g);
        for (const match of importMatches) {
            deps.push(match[1]);
        }
        const aliasMatches = content.matchAll(/alias\s+([A-Z][A-Za-z0-9._]*)/g);
        for (const match of aliasMatches) {
            deps.push(match[1]);
        }
        return [...new Set(deps)];
    }
    extractErlangModuleName(content) {
        const match = content.match(/-module\s*\(\s*([a-z][a-zA-Z0-9_]*)\s*\)/);
        return match ? match[1] : null;
    }
    extractErlangFunctions(content) {
        const functions = [];
        const funcRegex = /^([a-z][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*->/gm;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            const functionName = match[1];
            const params = match[2] || '';
            const arity = params ? params.split(',').length : 0;
            const lineNumber = content.substring(0, match.index).split('\n').length;
            functions.push({
                name: functionName,
                arity: arity,
                visibility: 'public',
                signature: `${functionName}(${params})`,
                lineNumber: lineNumber,
            });
        }
        return functions;
    }
    extractErlangTypes(content) {
        const types = [];
        const typeRegex = /-type\s+([a-z_][a-zA-Z0-9_]*(?:\([^)]*\))?)\s*::\s*([^.]+)\./g;
        let match;
        while ((match = typeRegex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            types.push({
                name: match[1],
                definition: match[2].trim(),
                lineNumber: lineNumber,
            });
        }
        return types;
    }
    extractErlangDocs(content) {
        const docs = [];
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('%%') && trimmed.length > 3) {
                docs.push(trimmed.substring(2).trim());
            }
        }
        return docs;
    }
    extractErlangDependencies(content) {
        const deps = [];
        const includeRegex = /-include\s*\(\s*"([^"]+)"\s*\)/g;
        let match;
        while ((match = includeRegex.exec(content)) !== null) {
            deps.push(match[1]);
        }
        return deps;
    }
    extractErlangBehaviours(content) {
        const behaviours = [];
        const behaviourRegex = /-behaviour\s*\(\s*([a-z][a-zA-Z0-9_]*)\s*\)/g;
        let match;
        while ((match = behaviourRegex.exec(content)) !== null) {
            behaviours.push(match[1]);
        }
        return behaviours;
    }
    extractErlangExports(content) {
        const exports = [];
        const exportRegex = /-export\s*\(\s*\[([^\]]+)\]\s*\)/g;
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            const funcs = match[1].split(',').map((f) => f.trim());
            exports.push(...funcs);
        }
        return exports;
    }
    extractGleamFunctions(content) {
        const functions = [];
        const funcRegex = /(?:pub\s+)?fn\s+([a-z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/g;
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            const functionName = match[1];
            const params = match[2] || '';
            const arity = params ? params.split(',').length : 0;
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const isPublic = content
                .substring(match.index - 10, match.index)
                .includes('pub');
            functions.push({
                name: functionName,
                arity: arity,
                visibility: isPublic ? 'public' : 'private',
                signature: `${functionName}(${params})`,
                lineNumber: lineNumber,
            });
        }
        return functions;
    }
    extractGleamTypes(content) {
        const types = [];
        const typeRegex = /(?:pub\s+)?type\s+([A-Z][a-zA-Z0-9_]*)\s*(?:\([^)]*\))?\s*=\s*([^\n]+)/g;
        let match;
        while ((match = typeRegex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            types.push({
                name: match[1],
                definition: match[2].trim(),
                lineNumber: lineNumber,
            });
        }
        return types;
    }
    extractGleamDocs(content) {
        const docs = [];
        const docRegex = /\/\/\/\s*(.*)/g;
        let match;
        while ((match = docRegex.exec(content)) !== null) {
            docs.push(match[1].trim());
        }
        return docs;
    }
    extractGleamDependencies(content) {
        const deps = [];
        const importRegex = /import\s+([a-z][a-zA-Z0-9_/]*)/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            deps.push(match[1]);
        }
        return deps;
    }
}
export default BeamLanguageParser;
//# sourceMappingURL=beam-language-parser.js.map