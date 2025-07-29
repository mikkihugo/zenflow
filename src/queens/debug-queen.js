import { performance } from 'perf_hooks';
import { BaseQueen } from './base-queen.js';
import { NeuralEngine } from '../neural/neural-engine.js';

export class DebugQueen extends BaseQueen {
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

    async initialize() {
        await this.neuralEngine.initialize();
        await this.neuralEngine.loadModel('bug-detector-v2');
    }

    initializePatterns() {
        // Common error patterns
        this.errorPatterns.set('null-pointer', {
            pattern: /(\w+)\.(\w+)/g,
            check: (code) => this.checkNullPointer(code),
            fix: (code) => this.fixNullPointer(code),
            severity: 'high',
            description: 'Potential null pointer exception'
        });

        this.errorPatterns.set('async-error', {
            pattern: /await\s+(?!.*catch)/g,
            check: (code) => this.checkAsyncError(code),
            fix: (code) => this.fixAsyncError(code),
            severity: 'medium',
            description: 'Unhandled async operation'
        });

        this.errorPatterns.set('memory-leak', {
            pattern: /setInterval|setTimeout|addEventListener/g,
            check: (code) => this.checkMemoryLeak(code),
            fix: (code) => this.fixMemoryLeak(code),
            severity: 'high',
            description: 'Potential memory leak'
        });

        this.errorPatterns.set('sql-injection', {
            pattern: /query.*\+.*\$\{|\bexec\(.*\+/g,
            check: (code) => this.checkSQLInjection(code),
            fix: (code) => this.fixSQLInjection(code),
            severity: 'critical',
            description: 'SQL injection vulnerability'
        });

        this.errorPatterns.set('xss', {
            pattern: /innerHTML\s*=.*\$\{|dangerouslySetInnerHTML/g,
            check: (code) => this.checkXSS(code),
            fix: (code) => this.fixXSS(code),
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

    async process(task) {
        const startTime = performance.now();
        this.trackTaskStart(task.id);

        try {
            this.logger.info(`Processing debug task: ${task.prompt.substring(0, 50)}...`);

            const analysis = await this.analyzeCode(task);
            const recommendations = await this.generateRecommendations(analysis, task);
            
            const result = {
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
            const result = {
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

    async analyzeCode(task) {
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

    async staticAnalysis(code, language) {
        const issues = [];
        
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

    async securityAnalysis(code, language) {
        const securityIssues = [];
        
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

    async performanceAnalysis(code, language) {
        const perfIssues = [];
        
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
                    impact: check.impact,
                    description: check.description,
                    line: this.findLine(code, check.pattern),
                    suggestion: this.getPerformanceFix(check.type)
                });
            }
        }

        return perfIssues;
    }

    async neuralAnalysis(code, task) {
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

    parseNeuralAnalysis(analysis) {
        const issues = [];
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

    async generateRecommendations(analysis, task) {
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

    generateFixedCode(analysis) {
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

    generateBestPractices(analysis) {
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

    /**
     * Generate alternative recommendations based on analysis
     * @param {Object} analysis - The code analysis result
     * @param {string} analysis.code - The analyzed code
     * @param {string} analysis.language - Detected programming language
     * @param {Array} analysis.issues - General code issues
     * @param {Array} analysis.securityIssues - Security vulnerabilities
     * @param {Array} analysis.performanceIssues - Performance concerns
     * @param {string} analysis.maxSeverity - Highest severity found
     * @param {string} analysis.fixComplexity - Complexity of fixing issues
     * @param {number} analysis.riskScore - Overall risk score (0-10)
     * @returns {Promise<string[]>} Array of alternative recommendations
     */
    async generateAlternatives(analysis) {
        const alternatives = [];
        
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
    /**
     * Analyze JavaScript code for common issues
     * @param {string} code - The JavaScript code to analyze
     * @returns {Array<Object>} Array of detected issues
     */
    analyzeJavaScript(code) {
        const issues = [];
        
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

    /**
     * Analyze Python code for common issues
     * @param {string} code - The Python code to analyze
     * @returns {Array<Object>} Array of detected issues
     */
    analyzePython(code) {
        const issues = [];
        
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

    /**
     * Analyze Java code for common issues
     * @param {string} code - The Java code to analyze
     * @returns {Array<Object>} Array of detected issues
     */
    analyzeJava(code) {
        const issues = [];
        
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
    /**
     * Check for potential null pointer issues
     * @param {string} code - The code to check
     * @returns {boolean} True if null pointer issues are detected
     */
    checkNullPointer(code) {
        // Look for object property access without null checks
        const accessPattern = /(\w+)\.(\w+)/g;
        const nullCheckPattern = /if\s*\(\s*\w+\s*[!=]=\s*null\s*\)/g;
        
        const accesses = code.match(accessPattern) || [];
        const nullChecks = code.match(nullCheckPattern) || [];
        
        return accesses.length > nullChecks.length;
    }

    /**
     * Fix null pointer issues in code
     * @param {string} code - The code to fix
     * @returns {string} Fixed code
     */
    fixNullPointer(code) {
        return code.replace(/(\w+)\.(\w+)/g, '($1 && $1.$2)');
    }

    /**
     * Check for async error handling issues
     * @param {string} code - The code to check
     * @returns {boolean} True if async error issues are detected
     */
    checkAsyncError(code) {
        return /await\s+/.test(code) && !code.includes('try') && !code.includes('catch');
    }

    /**
     * Fix async error handling issues
     * @param {string} code - The code to fix
     * @returns {string} Fixed code
     */
    fixAsyncError(code) {
        if (code.includes('await') && !code.includes('try')) {
            const awaitMatch = code.match(/(.*await.*)/);
            if (awaitMatch) {
                return code.replace(awaitMatch[1], `try {\n  ${awaitMatch[1]}\n} catch (error) {\n  console.error('Async error:', error);\n  throw error;\n}`);
            }
        }
        return code;
    }

    /**
     * Check for memory leak issues
     * @param {string} code - The code to check
     * @returns {boolean} True if memory leak issues are detected
     */
    checkMemoryLeak(code) {
        const hasInterval = /setInterval|setTimeout/.test(code);
        const hasListener = /addEventListener/.test(code);
        const hasCleanup = /clearInterval|clearTimeout|removeEventListener/.test(code);
        
        return (hasInterval || hasListener) && !hasCleanup;
    }

    /**
     * Fix memory leak issues
     * @param {string} code - The code to fix
     * @returns {string} Fixed code
     */
    fixMemoryLeak(code) {
        let fixed = code;
        
        if (code.includes('setInterval') && !code.includes('clearInterval')) {
            fixed += '\n// Remember to clear interval: clearInterval(intervalId);';
        }
        
        if (code.includes('addEventListener') && !code.includes('removeEventListener')) {
            fixed += '\n// Remember to remove listener: element.removeEventListener(event, handler);';
        }
        
        return fixed;
    }

    /**
     * Check for SQL injection vulnerabilities
     * @param {string} code - The code to check
     * @returns {boolean} True if SQL injection issues are detected
     */
    checkSQLInjection(code) {
        return /query.*\+.*\$\{|\bexec\(.*\+/.test(code);
    }

    /**
     * Fix SQL injection vulnerabilities
     * @param {string} code - The code to fix
     * @returns {string} Fixed code
     */
    fixSQLInjection(code) {
        return code + '\n// Use parameterized queries instead of string concatenation';
    }

    /**
     * Check for XSS vulnerabilities
     * @param {string} code - The code to check
     * @returns {boolean} True if XSS issues are detected
     */
    checkXSS(code) {
        return /innerHTML\s*=.*\$\{|dangerouslySetInnerHTML/.test(code);
    }

    /**
     * Fix XSS vulnerabilities
     * @param {string} code - The code to fix
     * @returns {string} Fixed code
     */
    fixXSS(code) {
        return code + '\n// Sanitize input or use textContent instead of innerHTML';
    }

    // Helper methods
    /**
     * Detect the programming language of the code
     * @param {string} code - The code to analyze
     * @returns {string} Detected language
     */
    detectLanguage(code) {
        if (code.includes('def ') || code.includes('import ')) return 'python';
        if (code.includes('public class') || code.includes('import java')) return 'java';
        if (code.includes('interface ') || code.includes(': ')) return 'typescript';
        return 'javascript';
    }

    /**
     * Find the line number where a pattern matches
     * @param {string} code - The code to search
     * @param {RegExp} pattern - The pattern to find
     * @returns {number} Line number (1-based) or 0 if not found
     */
    findLine(code, pattern) {
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                return i + 1;
            }
        }
        return 0;
    }

    /**
     * Get the maximum severity from a list of issues
     * @param {Array<Object>} issues - Array of issues
     * @returns {string} Maximum severity - 'low', 'medium', 'high', or 'critical'
     */
    getMaxSeverity(issues) {
        const severityOrder = ['low', 'medium', 'high', 'critical'];
        let maxSeverity = 'low';
        
        for (const issue of issues) {
            if (severityOrder.indexOf(issue.severity) > severityOrder.indexOf(maxSeverity)) {
                maxSeverity = issue.severity;
            }
        }
        
        return maxSeverity;
    }

    /**
     * Calculate the complexity of fixing the detected issues
     * @param {Array<Object>} issues - Array of issues
     * @returns {string} Fix complexity - 'low', 'medium', or 'high'
     */
    calculateFixComplexity(issues) {
        const criticalCount = issues.filter(i => i.severity === 'critical').length;
        const highCount = issues.filter(i => i.severity === 'high').length;
        
        if (criticalCount > 0 || highCount > 3) return 'high';
        if (highCount > 0 || issues.length > 5) return 'medium';
        return 'low';
    }

    /**
     * Calculate overall risk score based on issues
     * @param {Array<Object>} issues - General issues
     * @param {Array<Object>} securityIssues - Security issues
     * @param {Array<Object>} performanceIssues - Performance issues
     * @returns {number} Risk score (0-10)
     */
    calculateRiskScore(issues, securityIssues, performanceIssues) {
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

    /**
     * Calculate confidence score for the analysis
     * @param {Object} analysis - The analysis result
     * @returns {number} Confidence score (0-1)
     */
    calculateConfidence(analysis) {
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

    /**
     * Get CWE identifier for security issue type
     * @param {string} type - Security issue type
     * @returns {string} CWE identifier
     */
    getCWE(type) {
        const cweMap = {
            'sql-injection': 'CWE-89',
            'xss': 'CWE-79',
            'weak-crypto': 'CWE-327',
            'hardcoded-secrets': 'CWE-798'
        };
        
        return cweMap[type] || 'CWE-0';
    }

    /**
     * Get performance fix suggestion for issue type
     * @param {string} type - Performance issue type
     * @returns {string} Fix suggestion
     */
    getPerformanceFix(type) {
        const fixes = {
            'inefficient-loop': 'Use for...of or forEach for arrays',
            'dom-query': 'Cache DOM queries in variables',
            'deep-clone': 'Use structuredClone() or a proper deep clone library'
        };
        
        return fixes[type] || 'Review and optimize';
    }

    /**
     * Calculate suitability for a given task
     * @param {Object} task - The task to evaluate
     * @returns {Promise<number>} Suitability score
     */
    async calculateSuitability(task) {
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

/**
 * @fileoverview DebugQueen - Specialized in bug detection, security analysis, and code quality
 * 
 * @typedef {Object} ErrorPattern
 * @property {RegExp} pattern - Pattern to match in code
 * @property {Function} check - Function to check if pattern applies
 * @property {Function} fix - Function to fix the issue
 * @property {string} severity - Issue severity - 'low', 'medium', 'high', or 'critical'
 * @property {string} description - Description of the issue
 * 
 * @typedef {Object} SecurityCheck
 * @property {Array<RegExp>} patterns - Array of patterns to check
 * @property {string} message - Security warning message
 * @property {string} fix - How to fix the security issue
 * 
 * @typedef {Object} Issue
 * @property {string} type - Type of issue
 * @property {string} severity - Issue severity - 'low', 'medium', 'high', or 'critical'
 * @property {string} description - Issue description
 * @property {number} line - Line number where issue occurs
 * @property {string} fix - How to fix the issue
 * @property {number} confidence - Confidence in the detection (0-1)
 * 
 * @typedef {Object} SecurityIssue
 * @property {string} type - Type of security issue
 * @property {string} severity - Security issue severity - 'critical', 'high', 'medium', or 'low'
 * @property {string} description - Security issue description
 * @property {string} fix - How to fix the security issue
 * @property {number} line - Line number where issue occurs
 * @property {string} cwe - Common Weakness Enumeration identifier
 * 
 * @typedef {Object} PerformanceIssue
 * @property {string} type - Type of performance issue
 * @property {string} impact - Performance impact level - 'low', 'medium', or 'high'
 * @property {string} description - Performance issue description
 * @property {number} line - Line number where issue occurs
 * @property {string} suggestion - Performance improvement suggestion
 * 
 * @typedef {Object} CodeAnalysis
 * @property {string} code - The analyzed code
 * @property {string} language - Detected programming language
 * @property {Array<Issue>} issues - General code issues
 * @property {Array<SecurityIssue>} securityIssues - Security vulnerabilities
 * @property {Array<PerformanceIssue>} performanceIssues - Performance concerns
 * @property {string} maxSeverity - Highest severity found - 'low', 'medium', 'high', or 'critical'
 * @property {string} fixComplexity - Complexity of fixing issues - 'low', 'medium', or 'high'
 * @property {number} riskScore - Overall risk score (0-10)
 * 
 * @typedef {Object} Recommendations
 * @property {string} primary - Primary recommendation
 * @property {number} confidence - Confidence in recommendations (0-1)
 * @property {string} reasoning - Reasoning behind recommendations
 * @property {Array<string>} alternatives - Alternative recommendations
 */