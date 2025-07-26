import { performance } from 'perf_hooks';
import { BaseQueen, Task, Result } from './base-queen.js';
import { NeuralEngine } from '../neural/neural-engine.js';

export class CodeQueen extends BaseQueen {
    private neuralEngine: NeuralEngine;
    private codePatterns: Map<string, string[]>;
    private languageSupport: Set<string>;

    constructor() {
        super('CodeQueen', 'code-generation');
        this.confidence = 0.9;
        this.neuralEngine = new NeuralEngine();
        this.codePatterns = new Map();
        this.languageSupport = new Set([
            'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'cpp', 'c', 'c#', 'php', 'ruby', 'swift', 'kotlin'
        ]);
        this.initializePatterns();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.neuralEngine.initialize();
        await this.neuralEngine.loadModel('code-completion-base');
    }

    private initializePatterns(): void {
        this.codePatterns.set('function', [
            'function {{name}}({{params}}) {\n  {{body}}\n}',
            'const {{name}} = ({{params}}) => {\n  {{body}}\n};',
            'async function {{name}}({{params}}) {\n  {{body}}\n}'
        ]);

        this.codePatterns.set('class', [
            'class {{name}} {\n  constructor({{params}}) {\n    {{body}}\n  }\n}',
            'export class {{name}} {\n  private {{field}}: {{type}};\n\n  constructor({{params}}) {\n    {{body}}\n  }\n}'
        ]);

        this.codePatterns.set('interface', [
            'interface {{name}} {\n  {{properties}}\n}',
            'export interface {{name}} {\n  id: string;\n  {{properties}}\n}'
        ]);

        this.codePatterns.set('api', [
            'async function {{name}}({{params}}) {\n  const response = await fetch("{{url}}");\n  return response.json();\n}',
            'export const {{name}} = async ({{params}}) => {\n  try {\n    const response = await fetch("{{url}}", {\n      method: "{{method}}",\n      headers: {"Content-Type": "application/json"},\n      body: JSON.stringify({{data}})\n    });\n    return await response.json();\n  } catch (error) {\n    console.error("{{name}} failed:", error);\n    throw error;\n  }\n};'
        ]);

        this.codePatterns.set('component', [
            'import React from "react";\n\nexport default function {{name}}({{props}}) {\n  return (\n    <div className="{{className}}">\n      {{content}}\n    </div>\n  );\n}',
            'import { Component } from "@angular/core";\n\n@Component({\n  selector: "{{selector}}",\n  template: `{{template}}`\n})\nexport class {{name}}Component {\n  {{properties}}\n}'
        ]);
    }

    async process(task: Task): Promise<Result> {
        const startTime = performance.now();
        this.trackTaskStart(task.id);

        try {
            this.logger.info(`Processing code generation task: ${task.prompt.substring(0, 50)}...`);

            // Determine task complexity and approach
            const complexity = this.analyzeComplexity(task);
            const language = this.detectLanguage(task);
            const codeType = this.detectCodeType(task);

            let recommendation: string;
            let confidence = 0.8;

            if (complexity === 'high') {
                // Use neural network for complex tasks
                recommendation = await this.generateWithNeuralNetwork(task);
                confidence = 0.85;
            } else {
                // Use pattern-based generation for simpler tasks
                recommendation = await this.generateWithPatterns(task, codeType, language);
                confidence = 0.9;
            }

            // Add best practices and optimizations
            recommendation = this.addBestPractices(recommendation, language, codeType);

            const processingTime = performance.now() - startTime;
            const result: Result = {
                taskId: task.id,
                queenName: this.name,
                recommendation,
                confidence,
                reasoning: `Generated ${codeType} code for ${language} using ${complexity === 'high' ? 'neural network' : 'pattern-based'} approach`,
                processingTime,
                alternatives: await this.generateAlternatives(task, recommendation),
                metadata: {
                    language,
                    codeType,
                    complexity,
                    linesOfCode: recommendation.split('\n').length,
                    estimatedQuality: this.estimateCodeQuality(recommendation)
                }
            };

            this.trackTaskComplete(task.id, result);
            return result;

        } catch (error) {
            this.logger.error(`Code generation failed for task ${task.id}:`, error);
            const result: Result = {
                taskId: task.id,
                queenName: this.name,
                recommendation: `// Error generating code: ${error.message}\n// Please provide more specific requirements`,
                confidence: 0.1,
                reasoning: `Code generation failed: ${error.message}`,
                processingTime: performance.now() - startTime
            };
            this.trackTaskComplete(task.id, result);
            return result;
        }
    }

    private analyzeComplexity(task: Task): 'low' | 'medium' | 'high' {
        const prompt = task.prompt.toLowerCase();
        
        // High complexity indicators
        const highComplexityIndicators = [
            'algorithm', 'optimization', 'performance', 'concurrent', 'parallel',
            'machine learning', 'ai', 'neural', 'complex logic', 'state management',
            'microservice', 'distributed', 'scalable', 'architecture'
        ];

        // Medium complexity indicators  
        const mediumComplexityIndicators = [
            'api', 'database', 'auth', 'validation', 'middleware',
            'component', 'service', 'utility', 'helper', 'parser'
        ];

        if (highComplexityIndicators.some(indicator => prompt.includes(indicator))) {
            return 'high';
        }
        
        if (mediumComplexityIndicators.some(indicator => prompt.includes(indicator))) {
            return 'medium';
        }

        return 'low';
    }

    private detectLanguage(task: Task): string {
        const prompt = task.prompt.toLowerCase();
        const context = task.context?.language?.toLowerCase();
        
        // Check context first
        if (context && this.languageSupport.has(context)) {
            return context;
        }

        // Language detection patterns
        const languagePatterns = {
            'typescript': ['typescript', 'ts', 'tsx', 'interface', 'type'],
            'javascript': ['javascript', 'js', 'jsx', 'react', 'node', 'npm'],
            'python': ['python', 'py', 'flask', 'django', 'pandas', 'numpy'],
            'java': ['java', 'spring', 'maven', 'gradle', 'class'],
            'go': ['go', 'golang', 'goroutine', 'channel'],
            'rust': ['rust', 'cargo', 'unsafe', 'lifetime'],
            'cpp': ['c++', 'cpp', 'std::', 'template'],
            'c#': ['c#', 'csharp', '.net', 'namespace'],
            'swift': ['swift', 'ios', 'uikit', 'swiftui']
        };

        for (const [language, patterns] of Object.entries(languagePatterns)) {
            if (patterns.some(pattern => prompt.includes(pattern))) {
                return language;
            }
        }

        // Default based on context or fallback
        if (task.context?.framework) {
            const framework = task.context.framework.toLowerCase();
            if (['react', 'vue', 'angular'].includes(framework)) return 'typescript';
            if (['express', 'fastify'].includes(framework)) return 'javascript';
            if (['flask', 'django'].includes(framework)) return 'python';
        }

        return 'typescript'; // Default
    }

    private detectCodeType(task: Task): string {
        const prompt = task.prompt.toLowerCase();
        
        const codeTypePatterns = {
            'function': ['function', 'method', 'procedure', 'calculate', 'compute', 'process'],
            'class': ['class', 'object', 'entity', 'model'],
            'interface': ['interface', 'type', 'contract', 'schema'],
            'component': ['component', 'widget', 'element', 'ui'],
            'api': ['api', 'endpoint', 'route', 'service', 'http'],
            'test': ['test', 'spec', 'unit test', 'integration test'],
            'utility': ['utility', 'helper', 'util', 'tool'],
            'hook': ['hook', 'use'],
            'middleware': ['middleware', 'interceptor', 'guard']
        };

        for (const [type, patterns] of Object.entries(codeTypePatterns)) {
            if (patterns.some(pattern => prompt.includes(pattern))) {
                return type;
            }
        }

        return 'function'; // Default
    }

    private async generateWithNeuralNetwork(task: Task): Promise<string> {
        try {
            const enhancedPrompt = this.createEnhancedPrompt(task);
            const result = await this.neuralEngine.inference(enhancedPrompt, {
                temperature: 0.7,
                maxTokens: 1024,
                stopSequences: ['```', '---', 'END']
            });
            
            return this.cleanGeneratedCode(result.text);
        } catch (error) {
            this.logger.warn('Neural network generation failed, falling back to patterns:', error);
            return this.generateWithPatterns(task, this.detectCodeType(task), this.detectLanguage(task));
        }
    }

    private createEnhancedPrompt(task: Task): string {
        const language = this.detectLanguage(task);
        const codeType = this.detectCodeType(task);
        const context = task.context;

        let prompt = `Generate ${language} ${codeType} code for: ${task.prompt}\n\n`;
        
        if (context?.framework) {
            prompt += `Framework: ${context.framework}\n`;
        }
        
        if (context?.code) {
            prompt += `Existing code context:\n${context.code}\n\n`;
        }

        prompt += `Requirements:
- Write clean, maintainable code
- Include proper error handling
- Add TypeScript types if applicable
- Follow best practices for ${language}
- Include helpful comments

Code:`;

        return prompt;
    }

    private async generateWithPatterns(task: Task, codeType: string, language: string): Promise<string> {
        const patterns = this.codePatterns.get(codeType) || this.codePatterns.get('function')!;
        const selectedPattern = patterns[0]; // Could be randomized or ML-selected

        const variables = this.extractVariables(task, codeType);
        let code = selectedPattern;

        // Replace template variables
        for (const [key, value] of Object.entries(variables)) {
            code = code.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }

        // Language-specific adjustments
        code = this.adaptToLanguage(code, language);
        
        return code;
    }

    private extractVariables(task: Task, codeType: string): Record<string, string> {
        const prompt = task.prompt;
        
        // Extract function/class names
        const nameMatch = prompt.match(/(?:function|class|interface|component)\s+(\w+)/i) ||
                         prompt.match(/create\s+(?:a\s+)?(\w+)/i) ||
                         prompt.match(/(\w+)\s+(?:function|class|component)/i);
        
        const name = nameMatch ? nameMatch[1] : this.generateDefaultName(codeType);
        
        // Extract parameters
        const paramMatch = prompt.match(/with\s+parameters?\s+([^.]+)/i) ||
                          prompt.match(/takes?\s+([^.]+)\s+as\s+(?:input|parameter)/i);
        
        const params = paramMatch ? paramMatch[1].trim() : '';
        
        return {
            name: this.toCamelCase(name),
            params: params || this.getDefaultParams(codeType),
            body: this.generateDefaultBody(codeType, name),
            type: this.getDefaultType(name),
            properties: this.generateDefaultProperties(name),
            field: this.toCamelCase(name).toLowerCase(),
            url: `/api/${name.toLowerCase()}`,
            method: 'GET',
            data: 'data',
            className: `${name.toLowerCase()}-container`,
            content: `<h1>${name}</h1>`,
            selector: `app-${name.toLowerCase()}`,
            template: `<div>{{${name.toLowerCase()}}}</div>`,
            props: `{ ${this.toCamelCase(name)}: string }`
        };
    }

    private generateDefaultName(codeType: string): string {
        const timestamp = Date.now().toString().slice(-4);
        const defaults = {
            'function': `processData${timestamp}`,
            'class': `DataProcessor${timestamp}`,
            'interface': `IData${timestamp}`,
            'component': `DataComponent${timestamp}`,
            'api': `dataApi${timestamp}`,
            'test': `testData${timestamp}`,
            'utility': `dataUtil${timestamp}`,
            'hook': `useData${timestamp}`,
            'middleware': `dataMiddleware${timestamp}`
        };
        
        return defaults[codeType] || `generated${timestamp}`;
    }

    private toCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1).replace(/[-_\s]+(.)?/g, (_, char) => 
            char ? char.toUpperCase() : ''
        );
    }

    private getDefaultParams(codeType: string): string {
        const defaults = {
            'function': 'data: any',
            'class': '',
            'interface': '',
            'component': 'props: any',
            'api': 'req: Request, res: Response',
            'test': '',
            'utility': 'input: string',
            'hook': 'initialValue: any',
            'middleware': 'req: Request, res: Response, next: NextFunction'
        };
        
        return defaults[codeType] || 'data: any';
    }

    private generateDefaultBody(codeType: string, name: string): string {
        const defaults = {
            'function': '// TODO: Implement logic\n  return data;',
            'class': `this.${this.toCamelCase(name)} = {};`,
            'interface': '',
            'component': 'return <div>{props.children}</div>;',
            'api': 'res.json({ message: "Success" });',
            'test': 'expect(true).toBe(true);',
            'utility': 'return input.toUpperCase();',
            'hook': 'const [value, setValue] = useState(initialValue);\n  return [value, setValue];',
            'middleware': 'next();'
        };
        
        return defaults[codeType] || '// TODO: Implement';
    }

    private getDefaultType(name: string): string {
        return `I${name.charAt(0).toUpperCase() + name.slice(1)}`;
    }

    private generateDefaultProperties(name: string): string {
        return `id: string;\n  name: string;\n  ${this.toCamelCase(name)}: any;`;
    }

    private adaptToLanguage(code: string, language: string): string {
        switch (language) {
            case 'python':
                return code
                    .replace(/function\s+(\w+)/g, 'def $1')
                    .replace(/const\s+(\w+)\s*=/g, '$1 =')
                    .replace(/{\s*$/gm, ':')
                    .replace(/}\s*$/gm, '')
                    .replace(/;$/gm, '');
                    
            case 'java':
                return `public class Generated {\n  ${code.replace(/function\s+(\w+)/g, 'public void $1')}\n}`;
                
            case 'go':
                return code
                    .replace(/function\s+(\w+)/g, 'func $1')
                    .replace(/const\s+(\w+)\s*=/g, '$1 :=');
                    
            default:
                return code;
        }
    }

    private addBestPractices(code: string, language: string, codeType: string): string {
        let enhanced = code;
        
        // Add TypeScript types if applicable
        if (language === 'typescript' && !enhanced.includes(': ')) {
            enhanced = this.addTypeAnnotations(enhanced, codeType);
        }
        
        // Add error handling
        if (codeType === 'function' || codeType === 'api') {
            enhanced = this.addErrorHandling(enhanced, language);
        }
        
        // Add JSDoc comments
        enhanced = this.addDocumentation(enhanced, codeType);
        
        return enhanced;
    }

    private addTypeAnnotations(code: string, codeType: string): string {
        // Basic type annotation patterns
        const patterns = [
            { from: /(\w+)\s*\(\s*([^)]*)\s*\)\s*{/, to: '$1($2): void {' },
            { from: /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/, to: 'const $1 = ($2): void =>' }
        ];
        
        patterns.forEach(pattern => {
            code = code.replace(pattern.from, pattern.to);
        });
        
        return code;
    }

    private addErrorHandling(code: string, language: string): string {
        if (language === 'javascript' || language === 'typescript') {
            // Wrap main logic in try-catch
            if (!code.includes('try')) {
                const bodyMatch = code.match(/{([^}]+)}/s);
                if (bodyMatch) {
                    const body = bodyMatch[1].trim();
                    const errorHandling = `  try {\n    ${body.replace(/\n/g, '\n    ')}\n  } catch (error) {\n    console.error('Error:', error);\n    throw error;\n  }`;
                    code = code.replace(bodyMatch[0], `{\n${errorHandling}\n}`);
                }
            }
        }
        
        return code;
    }

    private addDocumentation(code: string, codeType: string): string {
        const lines = code.split('\n');
        const firstLine = lines.findIndex(line => 
            line.includes('function') || line.includes('class') || line.includes('interface')
        );
        
        if (firstLine >= 0) {
            const docComment = this.generateDocComment(codeType, lines[firstLine]);
            lines.splice(firstLine, 0, docComment);
        }
        
        return lines.join('\n');
    }

    private generateDocComment(codeType: string, codeLine: string): string {
        const nameMatch = codeLine.match(/(?:function|class|interface)\s+(\w+)/);
        const name = nameMatch ? nameMatch[1] : 'Generated';
        
        return `/**
 * ${name} - Generated by CodeQueen
 * 
 * @description Automatically generated ${codeType}
 * @param {any} params - Input parameters
 * @returns {any} Result of the operation
 */`;
    }

    private cleanGeneratedCode(code: string): string {
        return code
            .replace(/^```[\w]*\n?/gm, '') // Remove code block markers
            .replace(/\n?```$/gm, '')
            .trim();
    }

    private async generateAlternatives(task: Task, primarySolution: string): Promise<string[]> {
        const alternatives: string[] = [];
        const codeType = this.detectCodeType(task);
        const patterns = this.codePatterns.get(codeType);
        
        if (patterns && patterns.length > 1) {
            // Generate alternative using different pattern
            try {
                const altPattern = patterns[1];
                const variables = this.extractVariables(task, codeType);
                let altCode = altPattern;
                
                for (const [key, value] of Object.entries(variables)) {
                    altCode = altCode.replace(new RegExp(`{{${key}}}`, 'g'), value);
                }
                
                alternatives.push(altCode);
            } catch (error) {
                this.logger.debug('Failed to generate alternative:', error);
            }
        }
        
        return alternatives;
    }

    private estimateCodeQuality(code: string): number {
        let quality = 0.5; // Base quality
        
        // Positive indicators
        if (code.includes('try') && code.includes('catch')) quality += 0.1;
        if (code.includes('/**')) quality += 0.1;
        if (code.includes(': ')) quality += 0.1; // Type annotations
        if (code.includes('const ') || code.includes('let ')) quality += 0.1;
        if (code.includes('async') || code.includes('await')) quality += 0.1;
        
        // Negative indicators
        if (code.includes('any')) quality -= 0.05;
        if (code.includes('TODO')) quality -= 0.1;
        if (code.split('\n').length < 5) quality -= 0.1; // Too simple
        
        return Math.max(0, Math.min(1, quality));
    }

    protected async calculateSuitability(task: Task): Promise<number> {
        let suitability = await super.calculateSuitability(task);
        
        // CodeQueen is highly suitable for code generation tasks
        if (task.type === 'code-generation') {
            suitability += 0.3;
        }
        
        // Boost for supported languages
        const language = this.detectLanguage(task);
        if (this.languageSupport.has(language)) {
            suitability += 0.1;
        }
        
        return Math.min(suitability, 1.0);
    }
}