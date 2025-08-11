/**
 * Claude Code Execution Function
 * 
 * Based on Cline's run.ts implementation
 * Executes Claude Code programmatically with streaming JSON output
 */

import { execa } from "execa";
import { readFile, writeFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { createInterface } from "readline";
import type { Anthropic } from "@anthropic-ai/sdk";
import type { ClaudeCodeMessage } from "./types.js";

export interface RunClaudeCodeOptions {
    systemPrompt: string;
    messages: Anthropic.Messages.MessageParam[];
    path?: string;
    modelId: string;
    thinkingBudgetTokens?: number;
    allowedTools?: string[];
    disallowedTools?: string[];
    disableAllTools?: boolean;
}

export async function* runClaudeCode(options: RunClaudeCodeOptions): AsyncGenerator<ClaudeCodeMessage | string> {
    const { systemPrompt, messages, path: workingDir, modelId, thinkingBudgetTokens } = options;

    // Build command arguments
    const args = ["--model", modelId, "--json"];

    let systemFilePath: string | undefined;
    let tempDir: string | undefined;

    try {
        // Handle long system prompts by writing to temp file (Claude Code limitation)
        if (systemPrompt.length > 65536) {
            tempDir = await mkdtemp(join(tmpdir(), "claude-code-"));
            systemFilePath = join(tempDir, "system.txt");
            await writeFile(systemFilePath, systemPrompt);
            args.push("--system-file", systemFilePath);
        } else {
            args.push("--system", systemPrompt);
        }

        // Add thinking budget if specified
        if (thinkingBudgetTokens && thinkingBudgetTokens > 0) {
            args.push("--thinking-budget", thinkingBudgetTokens.toString());
        }

        // Configure tools based on options
        if (options.disableAllTools) {
            // Disable all tools for text-only responses
            args.push("--disable-tools");
        } else {
            // Default Claude Code tools that can cause issues (from Cline)
            const defaultDisallowedTools = [
                "Task", "Bash", "Grep", "Read", "Edit", "Write", "WebSearch", 
                "WebFetch", "LS", "MultiEdit", "NotebookEdit"
            ];
            
            const disallowedTools = options.disallowedTools || defaultDisallowedTools;
            if (disallowedTools.length > 0) {
                args.push("--disallowedTools", disallowedTools.join(" "));
            }
            
            if (options.allowedTools && options.allowedTools.length > 0) {
                args.push("--allowedTools", options.allowedTools.join(" "));
            }
            
            // Limit to single turn to prevent recursive tool usage
            args.push("--max-turns", "1");
        }

        // Add each message as a separate argument
        for (const message of messages) {
            const content = Array.isArray(message.content)
                ? message.content
                      .filter(c => c.type === "text")
                      .map(c => (c as any).text)
                      .join("")
                : message.content;

            if (content && content.trim()) {
                args.push("--message", `${message.role}: ${content}`);
            }
        }

        // Execute Claude Code with streaming output
        const claudeProcess = execa("claude", args, {
            cwd: workingDir || process.cwd(),
            buffer: false,
            timeout: 600000, // 10 minute timeout
            maxBuffer: 20 * 1024 * 1024, // 20 MB buffer
        });

        if (!claudeProcess.stdout) {
            throw new Error("Claude Code process stdout is not available");
        }

        // Create readline interface for line-by-line processing
        const rl = createInterface({
            input: claudeProcess.stdout,
            crlfDelay: Infinity,
        });

        let hasStarted = false;

        // Process each line of output
        for await (const line of rl) {
            if (!line.trim()) continue;

            try {
                // Parse JSON messages from Claude Code
                const parsed = JSON.parse(line) as ClaudeCodeMessage;
                
                if (!hasStarted && parsed.type === "init") {
                    hasStarted = true;
                }

                yield parsed;
            } catch (error) {
                // Non-JSON output, treat as raw text
                yield line;
            }
        }

        // Wait for process to complete
        const result = await claudeProcess;

        if (result.exitCode !== 0) {
            throw new Error(`Claude Code exited with code ${result.exitCode}`);
        }

    } catch (error) {
        // Handle various error scenarios
        if (error instanceof Error) {
            if (error.message.includes("ENOENT")) {
                throw new Error(
                    "Claude Code CLI not found. Please install Claude Code CLI and ensure it's in your PATH."
                );
            }
            
            if (error.message.includes("timeout")) {
                throw new Error("Claude Code execution timed out after 10 minutes");
            }

            if (error.message.includes("maxBuffer")) {
                throw new Error("Claude Code output exceeded maximum buffer size (20MB)");
            }
        }

        throw new Error(`Claude Code execution failed: ${error instanceof Error ? error.message : String(error)}`);
        
    } finally {
        // Clean up temporary files
        if (systemFilePath && tempDir) {
            try {
                await unlink(systemFilePath);
                // Note: We don't remove the temp directory as it might contain other files
            } catch (cleanupError) {
                // Ignore cleanup errors - they're not critical
                console.warn(`Failed to clean up temporary file: ${cleanupError}`);
            }
        }
    }
}