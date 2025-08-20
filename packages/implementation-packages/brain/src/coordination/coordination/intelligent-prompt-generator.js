"use strict";
/**
 * @fileoverview Intelligent Prompt Generator for Brain Package
 *
 * AI-powered prompt generation system that provides context-aware,
 * high-quality development prompts with built-in coding standards
 * and best practices for TypeScript development.
 *
 * Features:
 * - Phase-specific prompt generation
 * - Coding standards integration
 * - TypeScript best practices
 * - Complexity management guidelines
 * - File organization standards
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CODING_STANDARDS = exports.IntelligentPromptGenerator = void 0;
exports.createIntelligentPromptGenerator = createIntelligentPromptGenerator;
var foundation_1 = require("@claude-zen/foundation");
/**
 * Intelligent Prompt Generator
 *
 * Generates context-aware, high-quality development prompts with
 * integrated coding standards and best practices.
 */
var IntelligentPromptGenerator = /** @class */ (function () {
    function IntelligentPromptGenerator(behavioralIntelligence, codingPrinciplesResearcher) {
        this.logger = (0, foundation_1.getLogger)('IntelligentPromptGenerator');
        this.behavioralIntelligence = behavioralIntelligence;
        this.codingPrinciplesResearcher = codingPrinciplesResearcher;
        this.defaultConfig = {
            language: 'typescript',
            maxComplexity: 10,
            maxLinesPerFunction: 30,
            maxParameters: 5,
            fileNaming: 'kebab-case',
            includePerformance: true,
            includeSecurity: true
        };
    }
    /**
     * Generate intelligent prompt for development phase using meta-learning with confidence tracking
     */
    IntelligentPromptGenerator.prototype.generatePrompt = function (phase, context, config) {
        return __awaiter(this, void 0, void 0, function () {
            var mergedConfig, complexityScore, researchConfig, adaptivePrinciples, content_1, error_1, dspyOptimizedPrompt, error_2, codingStandards, phaseGuidelines, qualityMetrics, content, enhancedContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mergedConfig = __assign(__assign({}, this.defaultConfig), config);
                        complexityScore = this.calculateComplexityScore(context, phase);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        researchConfig = {
                            language: mergedConfig.language,
                            domain: this.inferDomainFromContext(context),
                            role: this.inferRoleFromPhase(phase),
                            includePerformance: mergedConfig.includePerformance,
                            includeSecurity: mergedConfig.includeSecurity,
                            includeTesting: true,
                            depth: complexityScore > 7 ? 'advanced' : 'intermediate'
                        };
                        return [4 /*yield*/, this.getAdaptivePrinciples(researchConfig)];
                    case 2:
                        adaptivePrinciples = _a.sent();
                        if (adaptivePrinciples) {
                            content_1 = this.buildMetaLearningPromptContent(phase, context, adaptivePrinciples);
                            return [2 /*return*/, {
                                    content: content_1,
                                    codingStandards: adaptivePrinciples.template,
                                    phaseGuidelines: this.generatePhaseGuidelines(phase, context, mergedConfig),
                                    qualityMetrics: this.convertPrinciplesToMetrics(adaptivePrinciples),
                                    complexityScore: complexityScore,
                                    // Add meta-learning metadata
                                    metadata: {
                                        principlesId: this.generatePrinciplesId(researchConfig),
                                        researchConfidence: adaptivePrinciples.researchMetadata.confidence,
                                        usesPrinciplesResearch: true,
                                        researchedAt: adaptivePrinciples.researchMetadata.researchedAt
                                    }
                                }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.warn('Meta-learning prompt generation failed, falling back to DSPy optimization:', error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.generateWithDSPy(phase, context, mergedConfig)];
                    case 5:
                        dspyOptimizedPrompt = _a.sent();
                        if (dspyOptimizedPrompt) {
                            return [2 /*return*/, {
                                    content: dspyOptimizedPrompt.content,
                                    codingStandards: dspyOptimizedPrompt.codingStandards,
                                    phaseGuidelines: dspyOptimizedPrompt.phaseGuidelines,
                                    qualityMetrics: dspyOptimizedPrompt.qualityMetrics,
                                    complexityScore: complexityScore
                                }];
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.warn('DSPy prompt generation failed, falling back to static templates:', error_2);
                        return [3 /*break*/, 7];
                    case 7:
                        codingStandards = this.generateCodingStandards(mergedConfig);
                        phaseGuidelines = this.generatePhaseGuidelines(phase, context, mergedConfig);
                        qualityMetrics = this.generateQualityMetrics(phase, mergedConfig);
                        content = this.buildPromptContent(phase, context, codingStandards, phaseGuidelines);
                        if (!this.behavioralIntelligence) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.enhanceWithBehavioralIntelligence(content, context)];
                    case 8:
                        enhancedContent = _a.sent();
                        return [2 /*return*/, {
                                content: enhancedContent,
                                codingStandards: codingStandards,
                                phaseGuidelines: phaseGuidelines,
                                qualityMetrics: qualityMetrics,
                                complexityScore: complexityScore
                            }];
                    case 9: return [2 /*return*/, {
                            content: content,
                            codingStandards: codingStandards,
                            phaseGuidelines: phaseGuidelines,
                            qualityMetrics: qualityMetrics,
                            complexityScore: complexityScore
                        }];
                }
            });
        });
    };
    /**
     * Generate comprehensive coding standards
     */
    IntelligentPromptGenerator.prototype.generateCodingStandards = function (config) {
        var language = config.language, maxComplexity = config.maxComplexity, maxLinesPerFunction = config.maxLinesPerFunction, maxParameters = config.maxParameters, fileNaming = config.fileNaming;
        var standards = "\n## \uD83C\uDFAF Coding Standards & Best Practices (".concat(language.toUpperCase(), ")\n\n### \uD83D\uDCC1 File Organization & Naming:\n- **Descriptive filenames**: Use clear, descriptive names that indicate file purpose\n  - \u2705 user-authentication-service.").concat(language === 'typescript' ? 'ts' : 'js', "\n  - \u2705 product-catalog-manager.").concat(language === 'typescript' ? 'ts' : 'js', "\n  - \u2705 order-validation-utils.").concat(language === 'typescript' ? 'ts' : 'js', "\n  - \u274C helper.").concat(language === 'typescript' ? 'ts' : 'js', ", utils.").concat(language === 'typescript' ? 'ts' : 'js', ", data.").concat(language === 'typescript' ? 'ts' : 'js', "\n- **Single responsibility**: Each file should have ONE clear purpose\n- **Naming convention**: Use ").concat(fileNaming, " for files\n- **Max functions per file**: 5-7 focused functions maximum\n\n### \u26A1 Function Quality Guidelines:\n- **Single responsibility**: Each function does ONE thing well\n- **Max ").concat(maxLinesPerFunction, " lines**: Keep functions focused and readable\n- **Max ").concat(maxParameters, " parameters**: Use objects for complex parameter sets\n- **Cyclomatic complexity**: Keep below ").concat(maxComplexity, "\n- **Pure functions**: Prefer pure functions when possible\n- **Clear naming**: Function names should describe what they do");
        if (language === 'typescript') {
            standards += "\n\n### \uD83D\uDD37 TypeScript Quality Standards:\n- **Strict typing**: Always use explicit types, avoid 'any'\n- **Interface definitions**: Define clear interfaces for all data structures\n- **Generic types**: Use generics for reusable components\n- **Null safety**: Handle undefined/null cases explicitly\n- **Union types**: Use union types for controlled variants\n- **Type guards**: Implement proper type guards for runtime checks";
        }
        if (config.includePerformance) {
            standards += "\n\n### \u26A1 Performance Guidelines:\n- **Big O awareness**: Consider algorithmic complexity\n- **Memory management**: Avoid memory leaks and excessive allocations\n- **Lazy loading**: Load resources only when needed\n- **Caching strategies**: Implement appropriate caching\n- **Bundle optimization**: Minimize bundle size and dependencies";
        }
        if (config.includeSecurity) {
            standards += "\n\n### \uD83D\uDD12 Security Best Practices:\n- **Input validation**: Validate all external inputs\n- **Error handling**: Don't expose sensitive information in errors\n- **Authentication**: Implement proper authentication and authorization\n- **Data sanitization**: Sanitize user inputs to prevent injection attacks\n- **Dependency security**: Regularly update and audit dependencies";
        }
        return standards;
    };
    /**
     * Generate phase-specific guidelines
     */
    IntelligentPromptGenerator.prototype.generatePhaseGuidelines = function (phase, context, config) {
        switch (phase) {
            case 'specification':
                return "\n### \uD83D\uDCCB Specification Phase Guidelines:\n- **Clear requirements**: Each requirement should be testable and specific\n- **Domain modeling**: Use ".concat(config.language === 'typescript' ? 'TypeScript interfaces' : 'clear data structures', " to model domain entities\n- **API contracts**: Define clear input/output interfaces\n- **Validation rules**: Specify data validation requirements\n- **User stories**: Write clear user stories with acceptance criteria\n- **Edge cases**: Identify and document edge cases and error scenarios");
            case 'pseudocode':
                return "\n### \uD83D\uDD04 Pseudocode Phase Guidelines:\n- **Algorithm clarity**: Write self-documenting pseudocode\n- **Data structures**: Choose appropriate data structures (Map, Set, Array)\n- **Error handling**: Plan for error scenarios and edge cases\n- **Performance considerations**: Consider Big O complexity\n- **Step-by-step logic**: Break down complex operations into clear steps\n- **Variable naming**: Use descriptive names in pseudocode";
            case 'architecture':
                return "\n### \uD83C\uDFD7\uFE0F Architecture Phase Guidelines:\n- **Modular design**: Create loosely coupled, highly cohesive modules\n- **Separation of concerns**: Separate business logic from presentation/data layers\n- **Dependency injection**: Use DI for testability and flexibility\n- **Interface segregation**: Create focused, specific interfaces\n- **Package structure**: Organize code into logical packages/folders\n- **Scalability patterns**: Design for future growth and changes";
            case 'refinement':
                return "\n### \u26A1 Refinement Phase Guidelines:\n- **Performance optimization**: Profile and optimize critical paths\n- **Code review practices**: Focus on readability and maintainability\n- **Testing coverage**: Aim for 80%+ test coverage\n- **Documentation**: Add comprehensive documentation for public APIs\n- **Refactoring**: Eliminate code smells and technical debt\n- **Error handling**: Robust error handling and logging";
            case 'completion':
                return "\n### \u2705 Completion Phase Guidelines:\n- **Production readiness**: Ensure error handling, logging, monitoring\n- **Security validation**: Check for common security vulnerabilities\n- **Performance benchmarks**: Meet defined performance criteria\n- **Documentation completeness**: README, API docs, deployment guides\n- **CI/CD pipeline**: Automated testing and deployment\n- **Monitoring**: Implement proper monitoring and alerting";
            default:
                return "\n### \uD83C\uDFAF General Development Guidelines:\n- **Code quality**: Follow established coding standards\n- **Documentation**: Write clear, comprehensive documentation\n- **Testing**: Implement thorough testing strategies\n- **Performance**: Consider performance implications\n- **Security**: Follow security best practices\n- **Maintainability**: Write code that's easy to maintain and extend";
        }
    };
    /**
     * Generate quality metrics for the phase
     */
    IntelligentPromptGenerator.prototype.generateQualityMetrics = function (phase, config) {
        var baseMetrics = [
            "Cyclomatic complexity: < ".concat(config.maxComplexity),
            "Function length: < ".concat(config.maxLinesPerFunction, " lines"),
            "Parameter count: < ".concat(config.maxParameters),
            'Code coverage: > 80%',
            'Documentation coverage: > 90%'
        ];
        switch (phase) {
            case 'specification':
                return __spreadArray(__spreadArray([], baseMetrics, true), [
                    'Requirements clarity: 100%',
                    'Testable requirements: 100%',
                    'Domain model completeness: > 95%'
                ], false);
            case 'architecture':
                return __spreadArray(__spreadArray([], baseMetrics, true), [
                    'Module coupling: Low',
                    'Module cohesion: High',
                    'Interface segregation: 100%'
                ], false);
            case 'completion':
                return __spreadArray(__spreadArray([], baseMetrics, true), [
                    'Security scan: 0 vulnerabilities',
                    'Performance benchmarks: Met',
                    'Production readiness: 100%'
                ], false);
            default:
                return baseMetrics;
        }
    };
    /**
     * Build the main prompt content
     */
    IntelligentPromptGenerator.prototype.buildPromptContent = function (phase, context, codingStandards, phaseGuidelines) {
        var _a, _b;
        return "\n# \uD83D\uDE80 ".concat(phase.charAt(0).toUpperCase() + phase.slice(1), " Phase Development Prompt\n\n## \uD83D\uDCCB Project Context:\n- **Project**: ").concat(context.name, "\n- **Domain**: ").concat(context.domain, "\n- **Requirements**: ").concat(((_a = context.requirements) === null || _a === void 0 ? void 0 : _a.length) || 0, " defined\n- **Tech Stack**: ").concat(((_b = context.techStack) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'To be determined', "\n\n").concat(codingStandards, "\n\n").concat(phaseGuidelines, "\n\n## \uD83C\uDFAF Implementation Focus:\n1. **Follow naming conventions** - Use descriptive, purpose-driven filenames\n2. **Maintain function complexity** - Keep functions simple and focused\n3. **Ensure type safety** - Use explicit typing throughout\n4. **Write clean code** - Self-documenting, maintainable code\n5. **Plan for testing** - Design with testability in mind\n\n## \uD83D\uDD0D Quality Checklist:\n- [ ] Descriptive filenames that indicate purpose\n- [ ] Single responsibility per file/function\n- [ ] Appropriate complexity levels\n- [ ] Comprehensive error handling\n- [ ] Clear documentation and comments\n- [ ] Type safety (for TypeScript)\n- [ ] Performance considerations\n- [ ] Security best practices\n\nRemember: Write code that tells a story - it should be self-documenting and easy for other developers to understand and maintain.");
    };
    /**
     * Calculate complexity score based on context and phase
     */
    IntelligentPromptGenerator.prototype.calculateComplexityScore = function (context, phase) {
        var _a, _b;
        var score = 1; // Base complexity
        // Add complexity based on requirements
        score += (((_a = context.requirements) === null || _a === void 0 ? void 0 : _a.length) || 0) * 0.1;
        // Add complexity based on tech stack
        score += (((_b = context.techStack) === null || _b === void 0 ? void 0 : _b.length) || 0) * 0.2;
        // Phase-specific complexity adjustments
        switch (phase) {
            case 'specification':
                score *= 0.8; // Specification is typically less complex
                break;
            case 'architecture':
                score *= 1.5; // Architecture is more complex
                break;
            case 'completion':
                score *= 1.3; // Completion has integration complexity
                break;
        }
        return Math.min(Math.max(score, 1), 10); // Clamp between 1-10
    };
    /**
     * Generate prompt using DSPy optimization
     */
    IntelligentPromptGenerator.prototype.generateWithDSPy = function (phase, context, config) {
        return __awaiter(this, void 0, void 0, function () {
            var DSPyLLMBridge, NeuralBridge, getLogger_1, logger, neuralBridge, dspyBridge, promptTask, result, dspyResult, error_3;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../coordination/dspy-llm-bridge'); })];
                    case 1:
                        DSPyLLMBridge = (_c.sent()).DSPyLLMBridge;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../neural-bridge'); })];
                    case 2:
                        NeuralBridge = (_c.sent()).NeuralBridge;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@claude-zen/foundation'); })];
                    case 3:
                        getLogger_1 = (_c.sent()).getLogger;
                        logger = getLogger_1('NeuralBridge');
                        neuralBridge = new NeuralBridge(logger);
                        dspyBridge = new DSPyLLMBridge({
                            teleprompter: 'MIPROv2', // Use MIPROv2 for best optimization
                            maxTokens: 16384,
                            optimizationSteps: 3,
                            coordinationFeedback: true,
                            hybridMode: true
                        }, neuralBridge);
                        return [4 /*yield*/, dspyBridge.initialize()];
                    case 4:
                        _c.sent();
                        promptTask = {
                            id: "prompt-gen-".concat(phase, "-").concat(Date.now()),
                            type: 'generation',
                            input: "Generate a high-quality development prompt for ".concat(phase, " phase.\n\nProject: \"").concat(context.name, "\" in ").concat(context.domain, " domain\nLanguage: ").concat(config.language, "\nRequirements: ").concat(((_a = context.requirements) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'To be determined', "\nTech Stack: ").concat(((_b = context.techStack) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'To be determined', "\n\nThe prompt should include:\n1. Project context section\n2. Coding standards for ").concat(config.language, "\n3. Phase-specific guidelines for ").concat(phase, "\n4. Critical instructions emphasizing descriptive filenames\n5. Quality metrics (complexity < ").concat(config.maxComplexity, ", length < ").concat(config.maxLinesPerFunction, " lines)\n\nGenerate a complete, ready-to-use development prompt."),
                            context: {
                                phase: phase,
                                projectName: context.name,
                                domain: context.domain,
                                requirements: context.requirements || [],
                                techStack: context.techStack || [],
                                language: config.language,
                                maxComplexity: config.maxComplexity,
                                maxLinesPerFunction: config.maxLinesPerFunction,
                                includePerformance: config.includePerformance,
                                includeSecurity: config.includeSecurity,
                                fewShotExamples: this.generateFewShotPromptExamples(phase, config)
                            },
                            priority: 'high'
                        };
                        return [4 /*yield*/, dspyBridge.processCoordinationTask(promptTask)];
                    case 5:
                        result = _c.sent();
                        if (result.success && result.result) {
                            dspyResult = typeof result.result === 'string' ?
                                JSON.parse(result.result) : result.result;
                            return [2 /*return*/, {
                                    content: dspyResult.content || dspyResult.result || 'DSPy generated prompt content',
                                    codingStandards: dspyResult.codingStandards || this.generateCodingStandards(config),
                                    phaseGuidelines: dspyResult.phaseGuidelines || this.generatePhaseGuidelines(phase, context, config),
                                    qualityMetrics: dspyResult.qualityMetrics || this.generateQualityMetrics(phase, config),
                                    complexityScore: this.calculateComplexityScore(context, phase)
                                }];
                        }
                        return [2 /*return*/, null];
                    case 6:
                        error_3 = _c.sent();
                        console.warn('DSPy prompt generation failed:', error_3);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get phase-specific example guidelines for DSPy training
     */
    IntelligentPromptGenerator.prototype.getPhaseExampleGuidelines = function (phase) {
        switch (phase) {
            case 'specification':
                return "- Define clear, testable requirements\n- Model domain entities with TypeScript interfaces\n- Specify validation rules and constraints";
            case 'pseudocode':
                return "- Write self-documenting algorithm steps\n- Choose appropriate data structures\n- Plan error handling and edge cases";
            case 'architecture':
                return "- Design modular, loosely coupled components\n- Separate concerns into logical layers\n- Use dependency injection for testability";
            case 'refinement':
                return "- Optimize performance critical paths\n- Eliminate code smells and technical debt\n- Achieve 80%+ test coverage";
            case 'completion':
                return "- Ensure production-ready error handling\n- Implement proper logging and monitoring\n- Complete security validation";
            default:
                return "- Follow established coding standards\n- Write maintainable, self-documenting code\n- Ensure comprehensive testing";
        }
    };
    /**
     * Generate few-shot examples for DSPy prompt optimization
     */
    IntelligentPromptGenerator.prototype.generateFewShotPromptExamples = function (phase, config) {
        return [
            {
                input: "Generate ".concat(phase, " phase prompt for e-commerce API project in rest-api domain using ").concat(config.language),
                output: "# Development Prompt for ".concat(phase, " Phase\n\n## \uD83D\uDCCB Project Context\n## \uD83C\uDFAF Coding Standards\n## \uD83D\uDCDD CRITICAL INSTRUCTIONS\n1. Use descriptive, purpose-driven filenames\n2. Keep functions simple and focused\n3. Follow ").concat(config.language, " best practices")
            },
            {
                input: "Generate ".concat(phase, " phase prompt for mobile app project in mobile domain using ").concat(config.language),
                output: "# Development Prompt for ".concat(phase, " Phase\n\n## \uD83D\uDCCB Project Context\n## \uD83C\uDFAF Coding Standards\n## \uD83D\uDCDD CRITICAL INSTRUCTIONS\n1. Use descriptive, purpose-driven filenames\n2. Optimize for mobile performance\n3. Follow ").concat(config.language, " best practices")
            }
        ];
    };
    /**
     * Enhance prompt with behavioral intelligence
     */
    IntelligentPromptGenerator.prototype.enhanceWithBehavioralIntelligence = function (content, context) {
        return __awaiter(this, void 0, void 0, function () {
            var projectTags, complexityLevel, agentProfiles, enhancedStats, contextualInsights;
            return __generator(this, function (_a) {
                if (!this.behavioralIntelligence) {
                    return [2 /*return*/, content];
                }
                try {
                    projectTags = this.extractProjectTags(context);
                    complexityLevel = this.assessProjectComplexity(context);
                    agentProfiles = this.behavioralIntelligence.getAllAgentProfiles();
                    enhancedStats = this.behavioralIntelligence.getEnhancedStats();
                    contextualInsights = '';
                    if (context.currentPhase) {
                        contextualInsights += "- Project phase: ".concat(context.currentPhase, " - applying phase-specific patterns\n");
                    }
                    if (context.domainSpecific) {
                        contextualInsights += "- Domain: ".concat(context.domainSpecific, " - leveraging domain expertise\n");
                    }
                    if (complexityLevel > 0.7) {
                        contextualInsights += "- High complexity detected (".concat((complexityLevel * 100).toFixed(1), "%) - extra attention needed\n");
                    }
                    // Include agent performance insights relevant to project type
                    if (enhancedStats.averagePerformance > 0.8) {
                        contextualInsights += "- High-performing agent patterns available (".concat((enhancedStats.averagePerformance * 100).toFixed(1), "%)\n");
                    }
                    return [2 /*return*/, "".concat(content, "\n\n## \uD83E\uDDE0 AI-Enhanced Recommendations:\nBased on ").concat(agentProfiles.size, " agent profiles and project context analysis:\n").concat(contextualInsights, "\n- Focus on areas where similar ").concat(projectTags.join(', '), " projects typically encounter issues\n- Leverage patterns that have proven successful in comparable domains\n- Pay special attention to complexity hotspots identified by behavioral analysis\n- Apply lessons from ").concat(enhancedStats.totalAgents, " agents' collective experience")];
                }
                catch (error) {
                    this.logger.warn('Error enhancing prompt with behavioral intelligence:', error);
                    return [2 /*return*/, content];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Extract project tags from context for behavioral analysis
     */
    IntelligentPromptGenerator.prototype.extractProjectTags = function (context) {
        var tags = [];
        if (context.currentPhase)
            tags.push(context.currentPhase);
        if (context.domainSpecific)
            tags.push(String(context.domainSpecific));
        // Add additional tags based on context properties
        if (context.requirements && context.requirements.length > 0) {
            tags.push("".concat(context.requirements.length, "-requirements"));
        }
        if (tags.length === 0) {
            tags.push('general');
        }
        return tags;
    };
    /**
     * Assess project complexity based on context
     */
    IntelligentPromptGenerator.prototype.assessProjectComplexity = function (context) {
        var complexity = 0.5; // Base complexity
        // Factor in requirements count
        if (context.requirements) {
            complexity += Math.min(context.requirements.length * 0.05, 0.3);
        }
        // Factor in phase complexity
        if (context.currentPhase) {
            var phaseComplexity = {
                'specification': 0.1,
                'pseudocode': 0.2,
                'architecture': 0.4,
                'refinement': 0.3,
                'completion': 0.2
            };
            complexity += phaseComplexity[context.currentPhase] || 0.2;
        }
        // Domain-specific complexity
        if (context.domainSpecific) {
            var domainComplexity = {
                'ml': 0.3,
                'ai': 0.3,
                'distributed': 0.4,
                'security': 0.4,
                'performance': 0.3
            };
            var domain = String(context.domainSpecific).toLowerCase();
            for (var _i = 0, _a = Object.entries(domainComplexity); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (domain.includes(key)) {
                    complexity += value;
                    break;
                }
            }
        }
        return Math.min(complexity, 1.0);
    };
    /**
     * Get adaptive principles using the coding principles researcher
     */
    IntelligentPromptGenerator.prototype.getAdaptivePrinciples = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.codingPrinciplesResearcher) {
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.codingPrinciplesResearcher.getAdaptivePrinciples(config)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_4 = _a.sent();
                        console.warn('Failed to get adaptive principles:', error_4);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Infer domain from project context
     */
    IntelligentPromptGenerator.prototype.inferDomainFromContext = function (context) {
        var _a;
        var domain = (_a = context.domain) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if ((domain === null || domain === void 0 ? void 0 : domain.includes('api')) || (domain === null || domain === void 0 ? void 0 : domain.includes('rest')) || (domain === null || domain === void 0 ? void 0 : domain.includes('service'))) {
            return 'rest-api';
        }
        if ((domain === null || domain === void 0 ? void 0 : domain.includes('web')) || (domain === null || domain === void 0 ? void 0 : domain.includes('frontend')) || (domain === null || domain === void 0 ? void 0 : domain.includes('react')) || (domain === null || domain === void 0 ? void 0 : domain.includes('vue'))) {
            return 'web-app';
        }
        if ((domain === null || domain === void 0 ? void 0 : domain.includes('mobile')) || (domain === null || domain === void 0 ? void 0 : domain.includes('ios')) || (domain === null || domain === void 0 ? void 0 : domain.includes('android'))) {
            return 'mobile-app';
        }
        if (domain === null || domain === void 0 ? void 0 : domain.includes('microservice')) {
            return 'microservices';
        }
        if ((domain === null || domain === void 0 ? void 0 : domain.includes('data')) || (domain === null || domain === void 0 ? void 0 : domain.includes('pipeline')) || (domain === null || domain === void 0 ? void 0 : domain.includes('etl'))) {
            return 'data-pipeline';
        }
        if ((domain === null || domain === void 0 ? void 0 : domain.includes('ml')) || (domain === null || domain === void 0 ? void 0 : domain.includes('machine-learning')) || (domain === null || domain === void 0 ? void 0 : domain.includes('ai'))) {
            return 'ml-model';
        }
        if (domain === null || domain === void 0 ? void 0 : domain.includes('game')) {
            return 'game-dev';
        }
        if ((domain === null || domain === void 0 ? void 0 : domain.includes('blockchain')) || (domain === null || domain === void 0 ? void 0 : domain.includes('crypto'))) {
            return 'blockchain';
        }
        if ((domain === null || domain === void 0 ? void 0 : domain.includes('embedded')) || (domain === null || domain === void 0 ? void 0 : domain.includes('iot'))) {
            return 'embedded';
        }
        if (domain === null || domain === void 0 ? void 0 : domain.includes('desktop')) {
            return 'desktop-app';
        }
        return undefined;
    };
    /**
     * Infer role from development phase
     */
    IntelligentPromptGenerator.prototype.inferRoleFromPhase = function (phase) {
        switch (phase) {
            case 'architecture':
                return 'architect';
            case 'specification':
                return 'tech-lead';
            case 'pseudocode':
            case 'refinement':
            case 'completion':
                return 'fullstack-developer';
            default:
                return undefined;
        }
    };
    /**
     * Build meta-learning prompt content using researched principles
     */
    IntelligentPromptGenerator.prototype.buildMetaLearningPromptContent = function (phase, context, principles) {
        var _a, _b;
        return "# \uD83D\uDE80 ".concat(phase.charAt(0).toUpperCase() + phase.slice(1), " Phase Development Prompt\n## META-LEARNING ENABLED \u2728\n\n## \uD83D\uDCCB Project Context:\n- **Project**: ").concat(context.name, "\n- **Domain**: ").concat(context.domain, "\n- **Requirements**: ").concat(((_a = context.requirements) === null || _a === void 0 ? void 0 : _a.length) || 0, " defined\n- **Tech Stack**: ").concat(((_b = context.techStack) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'To be determined', "\n- **Research Confidence**: ").concat((principles.researchMetadata.confidence * 100).toFixed(1), "%\n\n## \uD83C\uDFAF AI-Researched Standards:\n").concat(principles.template, "\n\n## \uD83D\uDD0D Quality Metrics (Research-Based):\n- **Complexity**: ").concat(principles.qualityMetrics.complexity.metric, " < ").concat(principles.qualityMetrics.complexity.threshold, "\n- **Coverage**: ").concat(principles.qualityMetrics.coverage.metric, " > ").concat(principles.qualityMetrics.coverage.threshold, "%\n- **Maintainability**: ").concat(principles.qualityMetrics.maintainability.metric, " > ").concat(principles.qualityMetrics.maintainability.threshold, "\n- **Performance**: ").concat(principles.qualityMetrics.performance.metric, " < ").concat(principles.qualityMetrics.performance.threshold, "ms\n\n## \uD83E\uDDE0 Meta-Learning Instructions:\n1. **Track your execution**: Note what works well and what doesn't\n2. **Report feedback**: Identify missing guidelines or incorrect assumptions\n3. **Continuous improvement**: This prompt adapts based on your feedback\n4. **Second opinion validation**: Your work may be reviewed by another AI for accuracy\n\n## \uD83D\uDCDD CRITICAL INSTRUCTIONS:\n1. **Follow research-based guidelines** above - these improve over time\n2. **Use descriptive, purpose-driven filenames** \n3. **Maintain function complexity** within researched thresholds\n4. **Consider domain-specific patterns** for ").concat(context.domain || 'general', " applications\n5. **Plan for validation** - another AI may review your work for accuracy\n\nRemember: This prompt learns from your execution. The better you follow and provide feedback on these guidelines, the more effective future prompts become.");
    };
    /**
     * Convert principles to quality metrics
     */
    IntelligentPromptGenerator.prototype.convertPrinciplesToMetrics = function (principles) {
        var metrics = [];
        if (principles.qualityMetrics.complexity) {
            metrics.push("Complexity: ".concat(principles.qualityMetrics.complexity.metric, " < ").concat(principles.qualityMetrics.complexity.threshold));
        }
        if (principles.qualityMetrics.coverage) {
            metrics.push("Coverage: ".concat(principles.qualityMetrics.coverage.metric, " > ").concat(principles.qualityMetrics.coverage.threshold, "%"));
        }
        if (principles.qualityMetrics.maintainability) {
            metrics.push("Maintainability: ".concat(principles.qualityMetrics.maintainability.metric, " > ").concat(principles.qualityMetrics.maintainability.threshold));
        }
        if (principles.qualityMetrics.performance) {
            metrics.push("Performance: ".concat(principles.qualityMetrics.performance.metric, " < ").concat(principles.qualityMetrics.performance.threshold, "ms"));
        }
        return metrics;
    };
    /**
     * Generate principles ID for tracking
     */
    IntelligentPromptGenerator.prototype.generatePrinciplesId = function (config) {
        return "".concat(config.language, "-").concat(config.domain || 'general', "-").concat(config.role || 'general', "-").concat(config.depth || 'intermediate');
    };
    /**
     * Submit agent execution feedback for continuous improvement
     */
    IntelligentPromptGenerator.prototype.submitAgentFeedback = function (principlesId, feedback) {
        return __awaiter(this, void 0, void 0, function () {
            var agentFeedback;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.codingPrinciplesResearcher) {
                            console.warn('Cannot submit feedback: CodingPrinciplesResearcher not available');
                            return [2 /*return*/];
                        }
                        agentFeedback = {
                            principlesId: principlesId,
                            agentId: feedback.agentId,
                            taskType: feedback.taskType,
                            accuracy: feedback.accuracy,
                            completeness: feedback.completeness,
                            usefulness: feedback.usefulness,
                            missingAreas: feedback.missingAreas,
                            incorrectGuidelines: feedback.incorrectGuidelines,
                            additionalNeeds: feedback.additionalNeeds,
                            actualCodeQuality: feedback.actualCodeQuality,
                            executionTime: feedback.executionTime,
                            context: {
                                language: this.defaultConfig.language,
                                taskComplexity: feedback.taskComplexity,
                                requirementsCount: feedback.requirementsCount
                            },
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, this.codingPrinciplesResearcher.submitAgentFeedback(agentFeedback)];
                    case 1:
                        _a.sent();
                        console.log("Agent feedback submitted for principles ".concat(principlesId, ": accuracy=").concat(feedback.accuracy, ", usefulness=").concat(feedback.usefulness));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate second opinion validation prompt
     *
     * Based on user suggestion: launch a 2nd opinion that validates what was done
     * and identifies misunderstandings
     */
    IntelligentPromptGenerator.prototype.generateSecondOpinionPrompt = function (originalPrompt, agentResponse, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                return [2 /*return*/, "# \uD83D\uDD0D SECOND OPINION VALIDATION\n\n## Original Task Prompt:\n```\n".concat(originalPrompt, "\n```\n\n## Agent's Implementation:\n```\n").concat(agentResponse, "\n```\n\n## Project Context:\n- **Project**: ").concat(context.name, "\n- **Domain**: ").concat(context.domain, "\n- **Requirements**: ").concat(((_a = context.requirements) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'Not specified', "\n\n## Validation Instructions:\n\n### 1. \uD83D\uDCCB Requirement Compliance Check\n- Did the agent address all requirements from the original prompt?\n- Are there any missing or misunderstood requirements?\n- Rate compliance: 0-100%\n\n### 2. \uD83C\uDFAF Quality Standards Validation  \n- Does the implementation follow the coding standards specified?\n- Are naming conventions, complexity, and structure appropriate?\n- Rate quality adherence: 0-100%\n\n### 3. \uD83D\uDD0D Misunderstanding Detection\n- Identify any apparent misunderstandings of the task\n- Note any implementations that don't match the intent\n- Highlight areas where clarification might have helped\n\n### 4. \u2705 Correctness Assessment\n- Is the implementation functionally correct?\n- Are there logical errors or potential bugs?\n- Does it solve the intended problem?\n\n### 5. \uD83D\uDE80 Improvement Opportunities\n- What could be improved in the implementation?\n- Are there better approaches or patterns?\n- What additional considerations were missed?\n\n## Output Format:\nProvide your validation in JSON format:\n```json\n{\n  \"compliance_score\": 85,\n  \"quality_score\": 90,\n  \"correctness_score\": 95,\n  \"misunderstandings\": [\"Example: Agent interpreted X as Y instead of Z\"],\n  \"missing_requirements\": [\"Example: Error handling was not implemented\"],\n  \"improvement_suggestions\": [\"Example: Could use more descriptive variable names\"],\n  \"overall_assessment\": \"Good implementation with minor areas for improvement\",\n  \"validation_confidence\": 0.9\n}\n```\n\nBe thorough but constructive. Focus on helping improve both the implementation and future prompt clarity.")];
            });
        });
    };
    return IntelligentPromptGenerator;
}());
exports.IntelligentPromptGenerator = IntelligentPromptGenerator;
/**
 * Export convenient factory function
 */
function createIntelligentPromptGenerator(behavioralIntelligence) {
    return new IntelligentPromptGenerator(behavioralIntelligence);
}
/**
 * Export default configuration
 */
exports.DEFAULT_CODING_STANDARDS = {
    language: 'typescript',
    maxComplexity: 10,
    maxLinesPerFunction: 30,
    maxParameters: 5,
    fileNaming: 'kebab-case',
    includePerformance: true,
    includeSecurity: true
};
