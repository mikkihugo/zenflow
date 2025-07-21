#!/usr/bin/env node

/**
 * Direct Gemini API Integration Tool
 * 
 * Reverse-engineered from the open-source Gemini CLI to provide:
 * - JSON output support
 * - Streaming responses
 * - Programmatic integration
 * - Better error handling
 * - Neural network analysis optimization
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class GeminiDirectAPI {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey || process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY environment variable required');
        }
        
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = options.model || 'gemini-2.0-flash';
        this.outputFormat = options.outputFormat || 'text'; // 'text', 'json', 'stream'
        this.timeout = options.timeout || 30000;
        this.verbose = options.verbose || false;
    }

    /**
     * Analyze neural network output with structured response
     */
    async analyzeNeuralOutput(neuralData, context = {}) {
        const prompt = `
Analyze this neural network output and respond in JSON format:

Neural Output: ${JSON.stringify(neuralData)}
Context: ${JSON.stringify(context)}

Respond with this exact JSON structure:
{
    "confidence_level": "high|medium|low",
    "interpretation": "brief explanation of what the output means",
    "concerns": ["array", "of", "potential", "issues"],
    "recommendations": ["array", "of", "actionable", "suggestions"],
    "performance_score": 0.0-1.0,
    "next_actions": ["immediate", "steps", "to", "take"]
}
        `.trim();

        return this.generateContent(prompt, { format: 'json' });
    }

    /**
     * Optimize swarm coordination strategy
     */
    async optimizeSwarm(swarmData, taskData = {}) {
        const prompt = `
Optimize this swarm coordination scenario and respond in JSON format:

Swarm Data: ${JSON.stringify(swarmData)}
Task Data: ${JSON.stringify(taskData)}

Respond with this exact JSON structure:
{
    "recommended_topology": "mesh|hierarchical|star|ring|hybrid",
    "agent_allocation": {
        "researchers": 0,
        "coders": 0,
        "analysts": 0,
        "coordinators": 0
    },
    "optimizations": ["specific", "improvements", "to", "make"],
    "expected_improvement": "percentage or description",
    "implementation_steps": ["step1", "step2", "step3"],
    "risks": ["potential", "issues", "to", "watch"],
    "monitoring_metrics": ["key", "metrics", "to", "track"]
}
        `.trim();

        return this.generateContent(prompt, { format: 'json' });
    }

    /**
     * Analyze code for performance issues
     */
    async analyzeCode(code, language = 'unknown') {
        const prompt = `
Analyze this ${language} code for performance issues and respond in JSON format:

\`\`\`${language}
${code}
\`\`\`

Respond with this exact JSON structure:
{
    "performance_issues": [
        {
            "issue": "description of the problem",
            "severity": "high|medium|low",
            "line_numbers": [1, 2, 3],
            "impact": "description of performance impact"
        }
    ],
    "optimizations": [
        {
            "recommendation": "specific improvement to make",
            "expected_benefit": "description of expected improvement",
            "implementation_difficulty": "easy|medium|hard",
            "code_example": "example of improved code"
        }
    ],
    "overall_score": 0.0-1.0,
    "priority_fixes": ["most", "important", "fixes", "first"]
}
        `.trim();

        return this.generateContent(prompt, { format: 'json' });
    }

    /**
     * Debug neural network training issues
     */
    async debugNeuralIssue(issue, errorLogs = '', context = {}) {
        const prompt = `
Debug this neural network training issue and respond in JSON format:

Issue: ${issue}
Error Logs: ${errorLogs}
Context: ${JSON.stringify(context)}

Respond with this exact JSON structure:
{
    "root_cause": "most likely cause of the issue",
    "explanation": "detailed explanation of why this happened",
    "immediate_fixes": [
        {
            "fix": "specific action to take",
            "command": "code or command to run",
            "priority": "high|medium|low"
        }
    ],
    "prevention_strategies": ["how", "to", "prevent", "this", "in", "future"],
    "debugging_steps": ["step-by-step", "debugging", "process"],
    "related_issues": ["other", "potential", "problems", "to", "check"]
}
        `.trim();

        return this.generateContent(prompt, { format: 'json' });
    }

    /**
     * Analyze files in current directory
     */
    async analyzeDirectory(pattern = '**/*.{js,ts,rs,ex,exs,py}', analysisType = 'performance') {
        try {
            const files = await glob(pattern, { 
                ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
                maxDepth: 3
            });

            if (files.length === 0) {
                return { error: 'No files found matching pattern' };
            }

            const fileContents = {};
            let totalSize = 0;

            for (const file of files.slice(0, 10)) { // Limit to 10 files
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    if (content.length < 50000) { // Limit file size
                        fileContents[file] = content;
                        totalSize += content.length;
                        
                        if (totalSize > 200000) break; // Limit total content
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }

            const prompt = `
Analyze these codebase files for ${analysisType} issues and respond in JSON format:

Files:
${Object.entries(fileContents).map(([file, content]) => 
    `--- ${file} ---\n${content.slice(0, 5000)}\n`
).join('\n')}

Respond with this exact JSON structure:
{
    "overall_assessment": "summary of codebase quality",
    "files_analyzed": ${Object.keys(fileContents).length},
    "critical_issues": [
        {
            "file": "filename",
            "issue": "description",
            "severity": "high|medium|low"
        }
    ],
    "recommendations": ["prioritized", "improvements"],
    "architecture_suggestions": ["high-level", "architectural", "improvements"],
    "performance_score": 0.0-1.0,
    "next_steps": ["immediate", "actions", "to", "take"]
}
            `.trim();

            return this.generateContent(prompt, { format: 'json' });

        } catch (error) {
            return { error: `Directory analysis failed: ${error.message}` };
        }
    }

    /**
     * Core content generation with multiple output formats
     */
    async generateContent(prompt, options = {}) {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: this.model,
                generationConfig: {
                    temperature: options.temperature || 0.1,
                    topK: options.topK || 40,
                    topP: options.topP || 0.95,
                    maxOutputTokens: options.maxOutputTokens || 8192,
                }
            });

            if (this.verbose) {
                console.log(`🤖 Generating with model: ${this.model}`);
                console.log(`📝 Prompt length: ${prompt.length} chars`);
            }

            const startTime = Date.now();
            
            if (this.outputFormat === 'stream') {
                return this.generateStreamingContent(model, prompt, options);
            }

            const result = await Promise.race([
                model.generateContent(prompt),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), this.timeout)
                )
            ]);

            const endTime = Date.now();
            const responseText = result.response.text();

            if (this.verbose) {
                console.log(`⚡ Generation time: ${endTime - startTime}ms`);
                console.log(`📊 Response length: ${responseText.length} chars`);
            }

            // Handle different output formats
            if (options.format === 'json') {
                try {
                    // Try to extract JSON from response
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        return JSON.parse(jsonMatch[0]);
                    } else {
                        // Fallback: try to parse entire response
                        return JSON.parse(responseText);
                    }
                } catch (parseError) {
                    return {
                        error: 'Failed to parse JSON response',
                        raw_response: responseText,
                        parse_error: parseError.message
                    };
                }
            }

            if (this.outputFormat === 'json') {
                return {
                    success: true,
                    response: responseText,
                    model: this.model,
                    generation_time_ms: endTime - startTime,
                    usage: result.response.usageMetadata || {}
                };
            }

            return responseText;

        } catch (error) {
            const errorResponse = {
                error: error.message,
                model: this.model,
                timestamp: new Date().toISOString()
            };

            if (this.outputFormat === 'json') {
                return errorResponse;
            }

            throw error;
        }
    }

    /**
     * Generate streaming content
     */
    async generateStreamingContent(model, prompt, options = {}) {
        try {
            const result = await model.generateContentStream(prompt);
            const chunks = [];
            
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    chunks.push(chunkText);
                    if (options.onChunk) {
                        options.onChunk(chunkText);
                    }
                }
            }

            const fullResponse = chunks.join('');
            
            if (options.format === 'json') {
                try {
                    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
                    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(fullResponse);
                } catch (parseError) {
                    return {
                        error: 'Failed to parse JSON from stream',
                        raw_response: fullResponse,
                        parse_error: parseError.message
                    };
                }
            }

            return fullResponse;

        } catch (error) {
            return {
                error: `Streaming failed: ${error.message}`,
                model: this.model,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
🤖 Gemini Direct API Tool

Usage:
  node gemini_direct_api.js <command> [options]

Commands:
  neural <neural_output> [context]     - Analyze neural network output
  swarm <swarm_data> [task_data]       - Optimize swarm coordination
  code <code_string> [language]        - Analyze code performance
  debug <issue> [error_logs] [context] - Debug neural network issues
  directory [pattern] [analysis_type]  - Analyze files in directory
  prompt <prompt_text>                 - Direct prompt

Options:
  --model <model>        - Gemini model (default: gemini-2.0-flash)
  --format <format>      - Output format: text, json, stream
  --temperature <temp>   - Generation temperature (0.0-1.0)
  --verbose             - Verbose output

Examples:
  node gemini_direct_api.js neural '[0.8,0.15,0.05]' '{"task":"classification"}'
  node gemini_direct_api.js swarm '{"agents":100}' '{"type":"training"}'
  node gemini_direct_api.js code 'def train(): pass' python
  node gemini_direct_api.js directory '**/*.rs' performance
  node gemini_direct_api.js prompt "Explain neural networks" --format json
        `);
        process.exit(0);
    }

    try {
        // Parse options
        const options = {};
        let cleanArgs = [];
        
        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith('--')) {
                const option = args[i].slice(2);
                if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                    options[option] = args[i + 1];
                    i++; // Skip next arg
                } else {
                    options[option] = true;
                }
            } else {
                cleanArgs.push(args[i]);
            }
        }

        const gemini = new GeminiDirectAPI(process.env.GEMINI_API_KEY, {
            model: options.model || 'gemini-2.0-flash',
            outputFormat: options.format || 'json',
            verbose: options.verbose || false
        });

        const command = cleanArgs[0];
        let result;

        switch (command) {
            case 'neural':
                const neuralData = JSON.parse(cleanArgs[1] || '[]');
                const neuralContext = cleanArgs[2] ? JSON.parse(cleanArgs[2]) : {};
                result = await gemini.analyzeNeuralOutput(neuralData, neuralContext);
                break;

            case 'swarm':
                const swarmData = JSON.parse(cleanArgs[1] || '{}');
                const taskData = cleanArgs[2] ? JSON.parse(cleanArgs[2]) : {};
                result = await gemini.optimizeSwarm(swarmData, taskData);
                break;

            case 'code':
                const code = cleanArgs[1] || '';
                const language = cleanArgs[2] || 'unknown';
                result = await gemini.analyzeCode(code, language);
                break;

            case 'debug':
                const issue = cleanArgs[1] || '';
                const errorLogs = cleanArgs[2] || '';
                const debugContext = cleanArgs[3] ? JSON.parse(cleanArgs[3]) : {};
                result = await gemini.debugNeuralIssue(issue, errorLogs, debugContext);
                break;

            case 'directory':
                const pattern = cleanArgs[1] || '**/*.{js,ts,rs,ex,exs,py}';
                const analysisType = cleanArgs[2] || 'performance';
                result = await gemini.analyzeDirectory(pattern, analysisType);
                break;

            case 'prompt':
                const prompt = cleanArgs.slice(1).join(' ');
                result = await gemini.generateContent(prompt, {
                    format: options.format === 'json' ? 'json' : undefined,
                    temperature: parseFloat(options.temperature) || 0.1
                });
                break;

            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }

        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error(JSON.stringify({
            error: error.message,
            timestamp: new Date().toISOString()
        }, null, 2));
        process.exit(1);
    }
}

// Export for programmatic use
export { GeminiDirectAPI };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}