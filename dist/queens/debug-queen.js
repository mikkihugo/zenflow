import { performance } from 'perf_hooks';
import { BaseQueen, Task, Result } from './base-queen.js';
import { NeuralEngine } from '../neural/neural-engine.js';

export class DebugQueen extends BaseQueen {
    private neuralEngine: NeuralEngine;
    private errorPatterns: Map<string, ErrorPattern>;
    private bugTypes: Set<string>;
    private securityChecks: Map<string, SecurityCheck>;

    constructor() {
        super('DebugQueen', 'bug-detection');
        this.confidence = 0.88;
        this.neuralEngine = new NeuralEngine();
        this.errorPatterns = new Map();
        this.bugTypes = new Set([
            'null-pointer', 'memory-leak', 'race-condition', 'buffer-overflow',
            'type-error', 'logic-error', 'async-error', 'security-vulnerability',
            'performance-issue', 'resource-leak', 'deadlock', 'infinite-loop'
        ]);
        this.securityChecks = new Map();
        this.initializePatterns();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.neuralEngine.initialize();
        await this.neuralEngine.loadModel('bug-detector-v2');
    }

    private initializePatterns(): void {
        // Common error patterns
        this.errorPatterns.set('null-pointer', {
            pattern: /(\w+)\.(\w+)/g,
            check: (code: string) => this.checkNullPointer(code),
            fix: (code: string) => this.fixNullPointer(code),
            severity: 'high',
            description: 'Potential null pointer exception'
        });

        this.errorPatterns.set('async-error', {
            pattern: /await\s+(?!.*catch)/g,
            check: (code: string) => this.checkAsyncError(code),
            fix: (code: string) => this.fixAsyncError(code),
            severity: 'medium',
            description: 'Unhandled async operation'
        });

        this.errorPatterns.set('memory-leak', {
            pattern: /setInterval|setTimeout|addEventListener/g,
            check: (code: string) => this.checkMemoryLeak(code),
            fix: (code: string) => this.fixMemoryLeak(code),
            severity: 'high',
            description: 'Potential memory leak'
        });

        this.errorPatterns.set('sql-injection', {
            pattern: /query.*\+.*\$\{|\bexec\(.*\+/g,
            check: (code: string) => this.checkSQLInjection(code),
            fix: (code: string) => this.fixSQLInjection(code),
            severity: 'critical',
            description: 'SQL injection vulnerability'
        });

        this.errorPatterns.set('xss', {
            pattern: /innerHTML\s*=.*\$\{|dangerouslySetInnerHTML/g,
            check: (code: string) => this.checkXSS(code),
            fix: (code: string) => this.fixXSS(code),
            severity: 'critical',
            description: 'Cross-site scripting vulnerability'
        });

        // Security checks
        this.securityChecks.set('weak-crypto', {
            patterns: [/md5\(/g, /sha1\(/g, /Math\.random\(\)/g],
            message: 'Weak cryptographic functions detected',
            fix: 'Use crypto.randomBytes() or bcrypt for secure operations'
        });

        this.securityChecks.set('hardcoded-secrets', {
            patterns: [/password\s*=\s*["'][^"']+["']/gi, /api_key\s*=\s*["'][^"']+["']/gi],
            message: 'Hardcoded secrets detected',
            fix: 'Use environment variables or secure configuration management'
        });
    }

    async process(task: Task): Promise<Result> {
        const startTime = performance.now();
        this.trackTaskStart(task.id);

        try {
            this.logger.info(`Processing debug task: ${task.prompt.substring(0, 50)}...`);

            const analysis = await this.analyzeCode(task);
            const recommendations = await this.generateRecommendations(analysis, task);
            
            const result: Result = {
                taskId: task.id,
                queenName: this.name,
                recommendation: recommendations.primary,
                confidence: recommendations.confidence,
                reasoning: recommendations.reasoning,
                processingTime: performance.now() - startTime,
                alternatives: recommendations.alternatives,
                metadata: {
                    bugsFound: analysis.issues.length,
                    severity: analysis.maxSeverity,
                    categories: [...new Set(analysis.issues.map(i => i.type))],
                    securityIssues: analysis.securityIssues.length,
                    performanceIssues: analysis.performanceIssues.length,
                    fixComplexity: analysis.fixComplexity
                }
            };

            this.trackTaskComplete(task.id, result);
            return result;

        } catch (error) {
            this.logger.error(`Debug analysis failed for task ${task.id}:`, error);
            const result: Result = {
                taskId: task.id,
                queenName: this.name,
                recommendation: `❌ Debug analysis failed: ${error.message}\n\nPlease provide code context for analysis.`,
                confidence: 0.1,
                reasoning: `Analysis failed: ${error.message}`,
                processingTime: performance.now() - startTime
            };
            this.trackTaskComplete(task.id, result);
            return result;
        }
    }

    private async analyzeCode(task: Task): Promise<CodeAnalysis> {
        const code = task.context?.code || task.prompt;
        const language = task.context?.language || this.detectLanguage(code);
        
        // Perform static analysis
        const issues = await this.staticAnalysis(code, language);
        const securityIssues = await this.securityAnalysis(code, language);
        const performanceIssues = await this.performanceAnalysis(code, language);
        
        // Use neural network for complex pattern detection
        const neuralIssues = await this.neuralAnalysis(code, task);
        
        const allIssues = [...issues, ...neuralIssues];
        const maxSeverity = this.getMaxSeverity(allIssues);
        const fixComplexity = this.calculateFixComplexity(allIssues);

        return {
            code,
            language,
            issues: allIssues,
            securityIssues,
            performanceIssues,
            maxSeverity,
            fixComplexity,
            riskScore: this.calculateRiskScore(allIssues, securityIssues, performanceIssues)
        };
    }

    private async staticAnalysis(code: string, language: string): Promise<Issue[]> {
        const issues: Issue[] = [];
        
        for (const [type, pattern] of this.errorPatterns.entries()) {
            if (pattern.check(code)) {
                issues.push({
                    type,
                    severity: pattern.severity,
                    description: pattern.description,
                    line: this.findLine(code, pattern.pattern),
                    fix: pattern.fix(code),
                    confidence: 0.85
                });
            }
        }

        // Language-specific checks
        switch (language) {
            case 'javascript':
            case 'typescript':
                issues.push(...this.analyzeJavaScript(code));
                break;
            case 'python':
                issues.push(...this.analyzePython(code));
                break;
            case 'java':
                issues.push(...this.analyzeJava(code));
                break;
        }

        return issues;
    }

    private async securityAnalysis(code: string, language: string): Promise<SecurityIssue[]> {
        const securityIssues: SecurityIssue[] = [];
        
        for (const [type, check] of this.securityChecks.entries()) {
            for (const pattern of check.patterns) {
                if (pattern.test(code)) {
                    securityIssues.push({
                        type,
                        severity: 'critical',
                        description: check.message,
                        fix: check.fix,
                        line: this.findLine(code, pattern),
                        cwe: this.getCWE(type)
                    });
                }
            }
        }

        return securityIssues;
    }

    private async performanceAnalysis(code: string, language: string): Promise<PerformanceIssue[]> {
        const perfIssues: PerformanceIssue[] = [];
        
        // Check for common performance anti-patterns
        const performanceChecks = [
            {
                pattern: /for\s*\(.*in\s+.*\)/g,
                type: 'inefficient-loop',
                impact: 'medium',
                description: 'for...in loop can be slow for arrays'
            },
            {
                pattern: /querySelector(?:All)?\(.*\)/g,
                type: 'dom-query',
                impact: 'low',
                description: 'Repeated DOM queries can impact performance'
            },
            {
                pattern: /JSON\.parse\(JSON\.stringify\(/g,
                type: 'deep-clone',
                impact: 'medium',
                description: 'Inefficient deep cloning method'
            }
        ];

        for (const check of performanceChecks) {
            if (check.pattern.test(code)) {
                perfIssues.push({
                    type: check.type,
                    impact: check.impact as 'low' | 'medium' | 'high',
                    description: check.description,
                    line: this.findLine(code, check.pattern),
                    suggestion: this.getPerformanceFix(check.type)
                });
            }
        }

        return perfIssues;
    }

    private async neuralAnalysis(code: string, task: Task): Promise<Issue[]> {
        try {
            const prompt = `Analyze this code for bugs and issues:

\`\`\`
${code}
\`\`\`

Identify:
1. Logic errors
2. Edge cases not handled
3. Type issues
4. Potential runtime errors

Provide detailed analysis:`;

            const result = await this.neuralEngine.inference(prompt, {
                temperature: 0.3,
                maxTokens: 512
            });

            return this.parseNeuralAnalysis(result.text);
        } catch (error) {
            this.logger.warn('Neural analysis failed:', error);
            return [];
        }
    }

    private parseNeuralAnalysis(analysis: string): Issue[] {
        const issues: Issue[] = [];
        const lines = analysis.split('\n');
        
        for (const line of lines) {
            if (line.includes('ERROR:') || line.includes('BUG:') || line.includes('ISSUE:')) {
                issues.push({
                    type: 'neural-detected',
                    severity: 'medium',
                    description: line.replace(/^(ERROR:|BUG:|ISSUE:)\s*/, ''),
                    line: 0,
                    fix: 'Review and fix based on neural analysis',
                    confidence: 0.7
                });
            }
        }
        
        return issues;
    }

    private async generateRecommendations(analysis: CodeAnalysis, task: Task): Promise<Recommendations> {
        const { issues, securityIssues, performanceIssues } = analysis;
        
        let report = '🐛 **Debug Analysis Report**\n\n';
        
        // Summary
        report += `**Summary:**\n`;
        report += `- ${issues.length} issues found\n`;
        report += `- ${securityIssues.length} security vulnerabilities\n`;
        report += `- ${performanceIssues.length} performance concerns\n`;
        report += `- Risk Score: ${analysis.riskScore}/10\n\n`;

        // Critical issues first
        const criticalIssues = [...issues, ...securityIssues].filter(i => i.severity === 'critical');
        if (criticalIssues.length > 0) {
            report += '🚨 **Critical Issues:**\n';
            for (const issue of criticalIssues) {
                report += `- ${issue.description}\n`;
                if (issue.fix) {
                    report += `  **Fix:** ${issue.fix}\n`;
                }
            }
            report += '\n';
        }

        // High priority issues
        const highIssues = issues.filter(i => i.severity === 'high');
        if (highIssues.length > 0) {
            report += '⚠️ **High Priority Issues:**\n';
            for (const issue of highIssues) {
                report += `- ${issue.description}\n`;
                if (issue.fix) {
                    report += `  **Fix:** ${issue.fix}\n`;
                }
            }
            report += '\n';
        }

        // Performance issues
        if (performanceIssues.length > 0) {
            report += '🚀 **Performance Improvements:**\n';
            for (const issue of performanceIssues) {
                report += `- ${issue.description}\n`;
                report += `  **Suggestion:** ${issue.suggestion}\n`;
            }
            report += '\n';
        }

        // Generate fixed code if possible
        const fixedCode = this.generateFixedCode(analysis);
        if (fixedCode) {
            report += '✅ **Suggested Fixed Code:**\n\n```\n' + fixedCode + '\n```\n\n';
        }

        // Best practices
        report += this.generateBestPractices(analysis);
        
        const confidence = this.calculateConfidence(analysis);
        
        return {
            primary: report,
            confidence,
            reasoning: `Analyzed ${analysis.language} code using static analysis, security scanning, and neural pattern detection`,
            alternatives: await this.generateAlternatives(analysis)
        };
    }

    private generateFixedCode(analysis: CodeAnalysis): string | null {
        try {
            let fixedCode = analysis.code;
            
            // Apply fixes for detected issues
            for (const issue of analysis.issues) {
                if (issue.fix && issue.fix !== 'Review and fix based on neural analysis') {
                    const pattern = this.errorPatterns.get(issue.type);
                    if (pattern) {
                        fixedCode = pattern.fix(fixedCode);
                    }
                }
            }
            
            return fixedCode !== analysis.code ? fixedCode : null;
        } catch (error) {
            this.logger.warn('Failed to generate fixed code:', error);
            return null;
        }
    }

    private generateBestPractices(analysis: CodeAnalysis): string {
        let practices = '📋 **Best Practices & Recommendations:**\n\n';
        
        switch (analysis.language) {
            case 'javascript':
            case 'typescript':
                practices += '- Use strict mode (`"use strict"`) to catch common errors\n';
                practices += '- Add proper TypeScript types to prevent type errors\n';
                practices += '- Use ESLint to catch potential issues during development\n';
                practices += '- Implement proper error boundaries in React applications\n';
                break;
                
            case 'python':
                practices += '- Use type hints for better code documentation and error prevention\n';
                practices += '- Use pylint or flake8 for static analysis\n';
                practices += '- Follow PEP 8 style guidelines\n';
                practices += '- Use virtual environments for dependency management\n';
                break;
                
            case 'java':
                practices += '- Use Optional<T> to handle null values safely\n';
                practices += '- Implement proper exception handling with specific exception types\n';
                practices += '- Use static analysis tools like SpotBugs or PMD\n';
                practices += '- Follow naming conventions and coding standards\n';
                break;
        }
        
        practices += '- Write comprehensive unit tests\n';
        practices += '- Use code reviews to catch issues early\n';
        practices += '- Implement proper logging for debugging\n';
        practices += '- Consider using automated testing and CI/CD pipelines\n';
        
        return practices;
    }

    private async generateAlternatives(analysis: CodeAnalysis): Promise<string[]> {
        const alternatives: string[] = [];
        
        // Quick fix summary
        if (analysis.issues.length > 0) {
            const quickFix = `🔧 **Quick Fix Summary:**\n${analysis.issues.map(i => `- ${i.description}: ${i.fix}`).join('\n')}`;
            alternatives.push(quickFix);
        }
        
        // Security-focused review
        if (analysis.securityIssues.length > 0) {
            const securityFocus = `🔒 **Security-Focused Review:**\n${analysis.securityIssues.map(i => `- ${i.description}: ${i.fix}`).join('\n')}`;
            alternatives.push(securityFocus);
        }
        
        return alternatives;
    }

    // Language-specific analysis methods
    private analyzeJavaScript(code: string): Issue[] {
        const issues: Issue[] = [];
        
        // Check for common JS issues
        if (code.includes('==') && !code.includes('===')) {
            issues.push({
                type: 'loose-equality',
                severity: 'medium',
                description: 'Use strict equality (===) instead of loose equality (==)',
                line: this.findLine(code, /==/g),
                fix: code.replace(/==/g, '==='),
                confidence: 0.9
            });
        }
        
        if (code.includes('var ')) {
            issues.push({
                type: 'var-declaration',
                severity: 'low',
                description: 'Use let or const instead of var for better scoping',
                line: this.findLine(code, /var\s+/g),
                fix: code.replace(/var\s+/g, 'const '),
                confidence: 0.8
            });
        }
        
        return issues;
    }

    private analyzePython(code: string): Issue[] {
        const issues: Issue[] = [];
        
        // Check for bare except clauses
        if (code.includes('except:')) {
            issues.push({
                type: 'bare-except',
                severity: 'medium',
                description: 'Avoid bare except clauses, specify exception types',
                line: this.findLine(code, /except:/g),
                fix: code.replace(/except:/g, 'except Exception:'),
                confidence: 0.85
            });
        }
        
        return issues;
    }

    private analyzeJava(code: string): Issue[] {
        const issues: Issue[] = [];
        
        // Check for string concatenation in loops
        if (code.includes('for') && code.includes('+') && code.includes('String')) {
            issues.push({
                type: 'string-concatenation',
                severity: 'medium',
                description: 'Use StringBuilder for string concatenation in loops',
                line: 0,
                fix: 'Replace string concatenation with StringBuilder',
                confidence: 0.7
            });
        }
        
        return issues;
    }

    // Error pattern check methods
    private checkNullPointer(code: string): boolean {
        // Look for object property access without null checks
        const accessPattern = /(\w+)\.(\w+)/g;
        const nullCheckPattern = /if\s*\(\s*\w+\s*[!=]=\s*null\s*\)/g;
        
        const accesses = code.match(accessPattern) || [];
        const nullChecks = code.match(nullCheckPattern) || [];
        
        return accesses.length > nullChecks.length;
    }

    private fixNullPointer(code: string): string {
        return code.replace(/(\w+)\.(\w+)/g, '($1 && $1.$2)');
    }

    private checkAsyncError(code: string): boolean {
        return /await\s+/.test(code) && !code.includes('try') && !code.includes('catch');
    }

    private fixAsyncError(code: string): string {
        if (code.includes('await') && !code.includes('try')) {
            const awaitMatch = code.match(/(.*await.*)/);
            if (awaitMatch) {
                return code.replace(awaitMatch[1], `try {\n  ${awaitMatch[1]}\n} catch (error) {\n  console.error('Async error:', error);\n  throw error;\n}`);
            }
        }
        return code;
    }

    private checkMemoryLeak(code: string): boolean {
        const hasInterval = /setInterval|setTimeout/.test(code);
        const hasListener = /addEventListener/.test(code);
        const hasCleanup = /clearInterval|clearTimeout|removeEventListener/.test(code);
        
        return (hasInterval || hasListener) && !hasCleanup;
    }

    private fixMemoryLeak(code: string): string {
        let fixed = code;
        
        if (code.includes('setInterval') && !code.includes('clearInterval')) {
            fixed += '\n// Remember to clear interval: clearInterval(intervalId);';
        }
        
        if (code.includes('addEventListener') && !code.includes('removeEventListener')) {
            fixed += '\n// Remember to remove listener: element.removeEventListener(event, handler);';
        }
        
        return fixed;
    }

    private checkSQLInjection(code: string): boolean {
        return /query.*\+.*\$\{|\bexec\(.*\+/.test(code);
    }

    private fixSQLInjection(code: string): string {
        return code + '\n// Use parameterized queries instead of string concatenation';
    }

    private checkXSS(code: string): boolean {
        return /innerHTML\s*=.*\$\{|dangerouslySetInnerHTML/.test(code);
    }

    private fixXSS(code: string): string {
        return code + '\n// Sanitize input or use textContent instead of innerHTML';
    }

    // Helper methods
    private detectLanguage(code: string): string {
        if (code.includes('def ') || code.includes('import ')) return 'python';
        if (code.includes('public class') || code.includes('import java')) return 'java';
        if (code.includes('interface ') || code.includes(': ')) return 'typescript';
        return 'javascript';
    }

    private findLine(code: string, pattern: RegExp): number {
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                return i + 1;
            }
        }
        return 0;
    }

    private getMaxSeverity(issues: Issue[]): 'low' | 'medium' | 'high' | 'critical' {
        const severityOrder = ['low', 'medium', 'high', 'critical'];
        let maxSeverity = 'low';
        
        for (const issue of issues) {
            if (severityOrder.indexOf(issue.severity) > severityOrder.indexOf(maxSeverity)) {
                maxSeverity = issue.severity;
            }
        }
        
        return maxSeverity as 'low' | 'medium' | 'high' | 'critical';
    }

    private calculateFixComplexity(issues: Issue[]): 'low' | 'medium' | 'high' {
        const criticalCount = issues.filter(i => i.severity === 'critical').length;
        const highCount = issues.filter(i => i.severity === 'high').length;
        
        if (criticalCount > 0 || highCount > 3) return 'high';
        if (highCount > 0 || issues.length > 5) return 'medium';
        return 'low';
    }

    private calculateRiskScore(issues: Issue[], securityIssues: SecurityIssue[], performanceIssues: PerformanceIssue[]): number {
        let score = 0;
        
        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical': score += 3; break;
                case 'high': score += 2; break;
                case 'medium': score += 1; break;
                case 'low': score += 0.5; break;
            }
        }
        
        score += securityIssues.length * 2; // Security issues are weighted higher
        score += performanceIssues.length * 0.5;
        
        return Math.min(10, Math.round(score));
    }

    private calculateConfidence(analysis: CodeAnalysis): number {
        let confidence = 0.8; // Base confidence
        
        // Increase confidence with more issues found
        if (analysis.issues.length > 0) confidence += 0.1;
        if (analysis.securityIssues.length > 0) confidence += 0.05;
        
        // Decrease confidence if code is very short or complex
        const lines = analysis.code.split('\n').length;
        if (lines < 5) confidence -= 0.2;
        if (lines > 100) confidence -= 0.1;
        
        return Math.max(0.3, Math.min(0.95, confidence));
    }

    private getCWE(type: string): string {
        const cweMap: { [key: string]: string } = {
            'sql-injection': 'CWE-89',
            'xss': 'CWE-79',
            'weak-crypto': 'CWE-327',
            'hardcoded-secrets': 'CWE-798'
        };
        
        return cweMap[type] || 'CWE-0';
    }

    private getPerformanceFix(type: string): string {
        const fixes: { [key: string]: string } = {
            'inefficient-loop': 'Use for...of or forEach for arrays',
            'dom-query': 'Cache DOM queries in variables',
            'deep-clone': 'Use structuredClone() or a proper deep clone library'
        };
        
        return fixes[type] || 'Review and optimize';
    }

    protected async calculateSuitability(task: Task): Promise<number> {
        let suitability = await super.calculateSuitability(task);
        
        // DebugQueen is highly suitable for debugging and bug detection
        if (task.type === 'bug-detection') {
            suitability += 0.3;
        }
        
        // Check if there's code to analyze
        if (task.context?.code) {
            suitability += 0.2;
        }
        
        return Math.min(suitability, 1.0);
    }
}

// Type definitions
interface ErrorPattern {
    pattern: RegExp;
    check: (code: string) => boolean;
    fix: (code: string) => string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

interface SecurityCheck {
    patterns: RegExp[];
    message: string;
    fix: string;
}

interface Issue {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    line: number;
    fix: string;
    confidence: number;
}

interface SecurityIssue {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    fix: string;
    line: number;
    cwe: string;
}

interface PerformanceIssue {
    type: string;
    impact: 'low' | 'medium' | 'high';
    description: string;
    line: number;
    suggestion: string;
}

interface CodeAnalysis {
    code: string;
    language: string;
    issues: Issue[];
    securityIssues: SecurityIssue[];
    performanceIssues: PerformanceIssue[];
    maxSeverity: 'low' | 'medium' | 'high' | 'critical';
    fixComplexity: 'low' | 'medium' | 'high';
    riskScore: number;
}

interface Recommendations {
    primary: string;
    confidence: number;
    reasoning: string;
    alternatives: string[];
}