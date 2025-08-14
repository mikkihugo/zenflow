import { execa } from 'execa';
import { mkdtemp, unlink, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createInterface } from 'readline';
export async function* runClaudeCode(options) {
    const { systemPrompt, messages, path: workingDir, modelId, thinkingBudgetTokens, } = options;
    const args = ['--model', modelId, '--json'];
    let systemFilePath;
    let tempDir;
    try {
        if (systemPrompt.length > 65536) {
            tempDir = await mkdtemp(join(tmpdir(), 'claude-code-'));
            systemFilePath = join(tempDir, 'system.txt');
            await writeFile(systemFilePath, systemPrompt);
            args.push('--system-file', systemFilePath);
        }
        else {
            args.push('--system', systemPrompt);
        }
        if (thinkingBudgetTokens && thinkingBudgetTokens > 0) {
            args.push('--thinking-budget', thinkingBudgetTokens.toString());
        }
        if (options.disableAllTools) {
            args.push('--disable-tools');
        }
        else {
            const defaultDisallowedTools = [
                'Task',
                'Bash',
                'Grep',
                'Read',
                'Edit',
                'Write',
                'WebSearch',
                'WebFetch',
                'LS',
                'MultiEdit',
                'NotebookEdit',
            ];
            const disallowedTools = options.disallowedTools || defaultDisallowedTools;
            if (disallowedTools.length > 0) {
                args.push('--disallowedTools', disallowedTools.join(' '));
            }
            if (options.allowedTools && options.allowedTools.length > 0) {
                args.push('--allowedTools', options.allowedTools.join(' '));
            }
            args.push('--max-turns', '1');
        }
        for (const message of messages) {
            const content = Array.isArray(message.content)
                ? message.content
                    .filter((c) => c.type === 'text')
                    .map((c) => c.text)
                    .join('')
                : message.content;
            if (content && content.trim()) {
                args.push('--message', `${message.role}: ${content}`);
            }
        }
        const claudeProcess = execa('claude', args, {
            cwd: workingDir || process.cwd(),
            buffer: false,
            timeout: 600000,
            maxBuffer: 20 * 1024 * 1024,
        });
        if (!claudeProcess.stdout) {
            throw new Error('Claude Code process stdout is not available');
        }
        const rl = createInterface({
            input: claudeProcess.stdout,
            crlfDelay: Number.POSITIVE_INFINITY,
        });
        let hasStarted = false;
        for await (const line of rl) {
            if (!line.trim())
                continue;
            try {
                const parsed = JSON.parse(line);
                if (!hasStarted && parsed.type === 'init') {
                    hasStarted = true;
                }
                yield parsed;
            }
            catch (error) {
                yield line;
            }
        }
        const result = await claudeProcess;
        if (result.exitCode !== 0) {
            throw new Error(`Claude Code exited with code ${result.exitCode}`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('ENOENT')) {
                throw new Error("Claude Code CLI not found. Please install Claude Code CLI and ensure it's in your PATH.");
            }
            if (error.message.includes('timeout')) {
                throw new Error('Claude Code execution timed out after 10 minutes');
            }
            if (error.message.includes('maxBuffer')) {
                throw new Error('Claude Code output exceeded maximum buffer size (20MB)');
            }
        }
        throw new Error(`Claude Code execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    finally {
        if (systemFilePath && tempDir) {
            try {
                await unlink(systemFilePath);
            }
            catch (cleanupError) {
                console.warn(`Failed to clean up temporary file: ${cleanupError}`);
            }
        }
    }
}
//# sourceMappingURL=run.js.map