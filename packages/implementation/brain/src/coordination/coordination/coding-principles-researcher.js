/**
 * @fileoverview Coding Principles Researcher - Dynamic Language Standards Research
 *
 * AI-powered research system that dynamically discovers and learns coding principles
 * for different languages, frameworks, and task types. Provides human-reviewable
 * templates that can be improved over time.
 *
 * Features:
 * - Language-specific principle research
 * - Task type optimization (API, web-app, mobile, etc.)
 * - Human-reviewable template generation
 * - Continuous learning from successful patterns
 * - DSPy-optimized principle discovery
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @since 2024-01-01
 */
var __assign =
	(this && this.__assign) ||
	function () {
		__assign =
			Object.assign ||
			((t) => {
				for (var s, i = 1, n = arguments.length; i < n; i++) {
					s = arguments[i];
					for (const p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
				}
				return t;
			});
		return __assign.apply(this, arguments);
	};
const __awaiter =
	(this && this.__awaiter) ||
	((thisArg, _arguments, P, generator) => {
		function adopt(value) {
			return value instanceof P
				? value
				: new P((resolve) => {
						resolve(value);
					});
		}
		return new (P || (P = Promise))((resolve, reject) => {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator.throw(value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	});
const __generator =
	(this && this.__generator) ||
	((thisArg, body) => {
		let _ = {
				label: 0,
				sent: () => {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g = Object.create(
				(typeof Iterator === "function" ? Iterator : Object).prototype,
			);
		return (
			(g.next = verb(0)),
			(g.throw = verb(1)),
			(g.return = verb(2)),
			typeof Symbol === "function" &&
				(g[Symbol.iterator] = function () {
					return this;
				}),
			g
		);
		function verb(n) {
			return (v) => step([n, v]);
		}
		function step(op) {
			if (f) throw new TypeError("Generator is already executing.");
			while ((g && ((g = 0), op[0] && (_ = 0)), _))
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y.return
									: op[0]
										? y.throw || ((t = y.return) && t.call(y), 0)
										: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	});
const __spreadArray =
	(this && this.__spreadArray) ||
	((to, from, pack) => {
		if (pack || arguments.length === 2)
			for (var i = 0, l = from.length, ar; i < l; i++) {
				if (ar || !(i in from)) {
					if (!ar) ar = Array.prototype.slice.call(from, 0, i);
					ar[i] = from[i];
				}
			}
		return to.concat(ar || Array.prototype.slice.call(from));
	});
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LANGUAGE_CONFIGS = exports.CodingPrinciplesResearcher = void 0;
exports.createCodingPrinciplesResearcher = createCodingPrinciplesResearcher;
const foundation_1 = require("@claude-zen/foundation");
/**
 * Coding Principles Researcher
 *
 * Dynamically researches and learns coding principles for different languages,
 * domains, and roles using AI research and human feedback loops.
 */
const CodingPrinciplesResearcher = /** @class */ (() => {
	function CodingPrinciplesResearcher(dspyBridge, behavioralIntelligence) {
		this.dspyBridge = dspyBridge;
		this.behavioralIntelligence = behavioralIntelligence;
		this.cache = new Map();
		this.humanFeedback = new Map();
		this.agentFeedback = new Map();
		this.promptConfidence = new Map();
		this.minimumConfidenceThreshold = 0.7; // Minimum confidence before using principles
		this.logger = (0, foundation_1.getLogger)("CodingPrinciplesResearcher");
	}
	/**
	 * Research coding principles for a specific language/domain/role combination
	 */
	CodingPrinciplesResearcher.prototype.researchPrinciples = function (config) {
		return __awaiter(this, void 0, void 0, function () {
			let cacheKey, cached, researchTask, researchResult, principles, error_1;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						cacheKey = this.generateCacheKey(config);
						cached = this.cache.get(cacheKey);
						if (cached && this.isCacheValid(cached)) {
							return [2 /*return*/, cached];
						}
						_a.label = 1;
						break;
					case 1:
						_a.trys.push([1, 5, undefined, 6]);
						researchTask = {
							id: "principles-research-"
								.concat(cacheKey, "-")
								.concat(Date.now()),
							type: "reasoning",
							input: this.buildResearchPrompt(config),
							context: {
								language: config.language,
								domain: config.domain,
								role: config.role,
								depth: config.depth || "intermediate",
								includePerformance: config.includePerformance,
								includeSecurity: config.includeSecurity,
								includeTesting: config.includeTesting,
							},
							priority: "high",
						};
						return [
							4 /*yield*/,
							this.dspyBridge.processCoordinationTask(researchTask),
						];
					case 2:
						researchResult = _a.sent();
						if (!(researchResult.success && researchResult.result))
							return [3 /*break*/, 4];
						return [
							4 /*yield*/,
							this.parseResearchResult(researchResult.result, config),
						];
					case 3:
						principles = _a.sent();
						// Cache the result
						this.cache.set(cacheKey, principles);
						return [2 /*return*/, principles];
					case 4:
						throw new Error("Research failed to produce valid results");
					case 5:
						error_1 = _a.sent();
						logger.warn("Principles research failed, using fallback:", error_1);
						return [2 /*return*/, this.getFallbackPrinciples(config)];
					case 6:
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Submit human feedback for improving principles
	 */
	CodingPrinciplesResearcher.prototype.submitHumanFeedback = function (
		feedback,
	) {
		return __awaiter(this, void 0, void 0, function () {
			let existing;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						existing = this.humanFeedback.get(feedback.principlesId) || [];
						existing.push(feedback);
						this.humanFeedback.set(feedback.principlesId, existing);
						// Use feedback to improve future research
						return [4 /*yield*/, this.incorporateFeedback(feedback)];
					case 1:
						// Use feedback to improve future research
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Get human-reviewable template for a language/domain
	 */
	CodingPrinciplesResearcher.prototype.getReviewableTemplate = function (
		config,
	) {
		return __awaiter(this, void 0, void 0, function () {
			let principles;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						return [4 /*yield*/, this.researchPrinciples(config)];
					case 1:
						principles = _a.sent();
						return [2 /*return*/, this.generateReviewableTemplate(principles)];
				}
			});
		});
	};
	/**
	 * Update principles based on successful project patterns
	 */
	CodingPrinciplesResearcher.prototype.learnFromSuccess = function (
		config,
		successPatterns,
	) {
		return __awaiter(this, void 0, void 0, function () {
			let cacheKey, existing;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						cacheKey = this.generateCacheKey(config);
						existing = this.cache.get(cacheKey);
						if (!existing) return [3 /*break*/, 2];
						// Enhance existing principles with learned patterns
						return [
							4 /*yield*/,
							this.enhancePrinciplesWithLearning(existing, successPatterns),
						];
					case 1:
						// Enhance existing principles with learned patterns
						_a.sent();
						this.cache.set(cacheKey, existing);
						_a.label = 2;
						break;
					case 2:
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Meta-learning: Research principles with confidence building
	 *
	 * Iteratively researches and improves prompts until confidence threshold is met
	 */
	CodingPrinciplesResearcher.prototype.researchPrinciplesWithConfidence =
		function (_config_1) {
			return __awaiter(
				this,
				arguments,
				void 0,
				function (config, targetConfidence) {
					let cacheKey,
						confidence,
						cached,
						bestPrinciples,
						bestConfidence,
						researchAttempts,
						maxAttempts,
						researchConfig,
						principles,
						researchConfidence,
						error_2;
					if (targetConfidence === void 0) {
						targetConfidence = this.minimumConfidenceThreshold;
					}
					return __generator(this, function (_a) {
						switch (_a.label) {
							case 0:
								cacheKey = this.generateCacheKey(config);
								confidence = this.getPromptConfidence(cacheKey);
								// If we already have high-confidence principles, return them
								if (
									confidence.overallConfidence >= targetConfidence &&
									!confidence.needsImprovement
								) {
									cached = this.cache.get(cacheKey);
									if (cached) {
										return [2 /*return*/, cached];
									}
								}
								bestPrinciples = null;
								bestConfidence = 0;
								researchAttempts = 0;
								maxAttempts = 5;
								_a.label = 1;
								break;
							case 1:
								if (
									!(
										bestConfidence < targetConfidence &&
										researchAttempts < maxAttempts
									)
								)
									return [3 /*break*/, 7];
								researchAttempts++;
								_a.label = 2;
								break;
							case 2:
								_a.trys.push([2, 5, undefined, 6]);
								researchConfig = this.enhanceConfigWithFeedback(
									config,
									confidence,
								);
								return [4 /*yield*/, this.researchPrinciples(researchConfig)];
							case 3:
								principles = _a.sent();
								return [
									4 /*yield*/,
									this.evaluateResearchQuality(principles, config),
								];
							case 4:
								researchConfidence = _a.sent();
								if (researchConfidence > bestConfidence) {
									bestPrinciples = principles;
									bestConfidence = researchConfidence;
									// Update confidence tracking
									confidence = this.updatePromptConfidence(cacheKey, {
										initialConfidence: researchConfidence,
										version: "research-v".concat(researchAttempts),
										improvements: [
											"Research attempt "
												.concat(researchAttempts, ": confidence ")
												.concat(researchConfidence.toFixed(3)),
										],
									});
								}
								logger.info(
									"Research attempt "
										.concat(researchAttempts, ": confidence ")
										.concat(researchConfidence.toFixed(3), " (target: ")
										.concat(targetConfidence, ")"),
								);
								return [3 /*break*/, 6];
							case 5:
								error_2 = _a.sent();
								logger.warn(
									"Research attempt ".concat(researchAttempts, " failed:"),
									error_2,
								);
								return [3 /*break*/, 6];
							case 6:
								return [3 /*break*/, 1];
							case 7:
								if (bestPrinciples) return [3 /*break*/, 9];
								return [4 /*yield*/, this.researchPrinciples(config)];
							case 8:
								// Fallback to basic research if all attempts failed
								return [2 /*return*/, _a.sent()];
							case 9:
								// Cache the best principles found
								this.cache.set(cacheKey, bestPrinciples);
								logger.info(
									"Research completed after "
										.concat(researchAttempts, " attempts. Final confidence: ")
										.concat(bestConfidence.toFixed(3)),
								);
								return [2 /*return*/, bestPrinciples];
						}
					});
				},
			);
		};
	/**
	 * Submit agent execution feedback for continuous improvement
	 */
	CodingPrinciplesResearcher.prototype.submitAgentFeedback = function (
		feedback,
	) {
		return __awaiter(this, void 0, void 0, function () {
			let existing;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						existing = this.agentFeedback.get(feedback.principlesId) || [];
						existing.push(feedback);
						this.agentFeedback.set(feedback.principlesId, existing);
						// Update confidence based on agent feedback
						return [
							4 /*yield*/,
							this.updateConfidenceFromAgentFeedback(feedback),
						];
					case 1:
						// Update confidence based on agent feedback
						_a.sent();
						// Check if principles need improvement
						return [
							4 /*yield*/,
							this.evaluateImprovementNeeds(feedback.principlesId),
						];
					case 2:
						// Check if principles need improvement
						_a.sent();
						return [2 /*return*/];
				}
			});
		});
	};
	/**
	 * Get principles with automatic improvement based on feedback
	 */
	CodingPrinciplesResearcher.prototype.getAdaptivePrinciples = function (
		config,
	) {
		return __awaiter(this, void 0, void 0, function () {
			let cacheKey, confidence, cached;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						cacheKey = this.generateCacheKey(config);
						confidence = this.getPromptConfidence(cacheKey);
						if (
							!(
								confidence.overallConfidence <
									this.minimumConfidenceThreshold || confidence.needsImprovement
							)
						)
							return [3 /*break*/, 2];
						logger.info(
							"Principles need improvement (confidence: ".concat(
								confidence.overallConfidence.toFixed(3),
								"). Researching...",
							),
						);
						return [4 /*yield*/, this.researchPrinciplesWithConfidence(config)];
					case 1:
						return [2 /*return*/, _a.sent()];
					case 2:
						cached = this.cache.get(cacheKey);
						if (cached) {
							return [2 /*return*/, cached];
						}
						return [4 /*yield*/, this.researchPrinciplesWithConfidence(config)];
					case 3:
						// No cached principles, research new ones
						return [2 /*return*/, _a.sent()];
				}
			});
		});
	};
	/**
	 * Build research prompt for DSPy
	 */
	CodingPrinciplesResearcher.prototype.buildResearchPrompt = function (config) {
		const language = config.language,
			domain = config.domain,
			role = config.role,
			depth = config.depth;
		// Get comprehensive research areas based on role and domain
		const researchAreas = this.getComprehensiveResearchAreas(role, domain);
		return "Research and compile comprehensive coding principles for "
			.concat(language, " development.\n\nContext:\n- Language: ")
			.concat(language, "\n- Domain: ")
			.concat(domain || "general", "\n- Role: ")
			.concat(role || "general-developer", "\n- Depth: ")
			.concat(depth || "intermediate", "\n- Include Performance: ")
			.concat(
				config.includePerformance ? "Yes" : "No",
				"\n- Include Security: ",
			)
			.concat(config.includeSecurity ? "Yes" : "No", "\n- Include Testing: ")
			.concat(
				config.includeTesting ? "Yes" : "No",
				"\n\nResearch the following comprehensive areas and provide specific, actionable guidelines:\n\n1. CORE STANDARDS:\n   - Repository structure and organization for ",
			)
			.concat(
				domain || "general",
				" projects\n   - File naming conventions specific to ",
			)
			.concat(language, " and ")
			.concat(
				role || "general-developer",
				" workflows\n   - Folder organization patterns for ",
			)
			.concat(
				domain || "general",
				" applications\n   - Function complexity guidelines appropriate for ",
			)
			.concat(
				role || "developer",
				" responsibilities\n   - Code organization patterns that scale with team size\n   - Error handling best practices for ",
			)
			.concat(
				domain || "general",
				" environments\n   - Documentation standards for ",
			)
			.concat(
				role || "developer",
				" deliverables\n   - Code quality metrics and enforcement strategies\n   - Testing strategy for ",
			)
			.concat(language, " in ")
			.concat(domain || "general", " context\n\n2. LANGUAGE-SPECIFIC:\n   - ")
			.concat(language, " type system best practices for ")
			.concat(
				role || "developer",
				" work\n   - Memory management patterns (if applicable to ",
			)
			.concat(language, ")\n   - Concurrency and async patterns for ")
			.concat(
				domain || "general",
				" applications\n   - Package/module management strategies\n   - Build tools and CI/CD pipeline recommendations for ",
			)
			.concat(language, "\n\n")
			.concat(
				researchAreas.domainSpecific.length > 0
					? "\n3. DOMAIN-SPECIFIC ("
							.concat(domain || "general", "):\n")
							.concat(
								researchAreas.domainSpecific
									.map((area) => "   - ".concat(area))
									.join("\n"),
								"\n",
							)
					: "",
				"\n\n",
			)
			.concat(
				researchAreas.roleSpecific.length > 0
					? "\n4. ROLE-SPECIFIC ("
							.concat(role || "general-developer", "):\n")
							.concat(
								researchAreas.roleSpecific
									.map((area) => "   - ".concat(area))
									.join("\n"),
								"\n",
							)
					: "",
				"\n\n5. QUALITY METRICS & STANDARDS:\n   - Measurable complexity thresholds for ",
			)
			.concat(language, "\n   - Code coverage expectations for ")
			.concat(
				domain || "general",
				" projects\n   - Maintainability indices and technical debt management\n   - Performance benchmarks relevant to ",
			)
			.concat(
				role || "developer",
				" work\n   - Security validation requirements for ",
			)
			.concat(domain || "general", " applications\n\n6. ADVANCED PRACTICES:\n")
			.concat(
				researchAreas.advanced.map((area) => "   - ".concat(area)).join("\n"),
				"\n\nProvide specific, actionable guidelines that a ",
			)
			.concat(role || "developer", " can immediately apply in ")
			.concat(
				language,
				" development.\nFocus on current industry best practices and emerging patterns for ",
			)
			.concat(
				domain || "general",
				" domain.\nInclude specific examples and anti-patterns to avoid.\nConsider the unique challenges and responsibilities of ",
			)
			.concat(
				role || "developer",
				" role.\n\nRespond in JSON format with structured guidelines that cover all research areas comprehensively.",
			);
	};
	/**
	 * Get comprehensive research areas based on role and domain
	 */
	CodingPrinciplesResearcher.prototype.getComprehensiveResearchAreas =
		function (role, domain) {
			return {
				domainSpecific: this.getDomainSpecificResearchAreas(domain),
				roleSpecific: this.getRoleSpecificResearchAreas(role),
				advanced: this.getAdvancedResearchAreas(role, domain),
			};
		};
	/**
	 * Get domain-specific research areas
	 */
	CodingPrinciplesResearcher.prototype.getDomainSpecificResearchAreas = (
		domain,
	) => {
		const domainAreas = {
			"rest-api": [
				"RESTful API design principles and OpenAPI specification",
				"Authentication and authorization patterns (JWT, OAuth2, API keys)",
				"Rate limiting and API versioning strategies",
				"Input validation and sanitization for API endpoints",
				"Error response formatting and HTTP status code usage",
				"API documentation and testing strategies",
				"Microservices communication patterns",
			],
			"web-app": [
				"Component-based architecture and state management",
				"Client-side routing and navigation patterns",
				"Performance optimization (lazy loading, code splitting)",
				"Accessibility (WCAG) compliance and semantic HTML",
				"Progressive Web App (PWA) implementation",
				"Browser compatibility and polyfill strategies",
				"SEO optimization and meta tag management",
			],
			"mobile-app": [
				"Mobile-first design principles and responsive layouts",
				"Touch interaction patterns and gesture handling",
				"Device-specific optimization (iOS/Android guidelines)",
				"Offline functionality and local storage strategies",
				"Push notification implementation",
				"App store deployment and versioning",
				"Performance optimization for mobile devices",
			],
			"desktop-app": [
				"Native desktop UI patterns and platform guidelines",
				"File system integration and local data management",
				"Cross-platform compatibility strategies",
				"Desktop-specific security considerations",
				"System integration (notifications, shortcuts)",
				"Application packaging and distribution",
				"Auto-update mechanisms",
			],
			microservices: [
				"Service decomposition and bounded context design",
				"Inter-service communication patterns (sync/async)",
				"Service discovery and load balancing",
				"Distributed transaction management",
				"Monitoring and observability across services",
				"Container orchestration and deployment strategies",
				"Data consistency and eventual consistency patterns",
			],
			"data-pipeline": [
				"ETL/ELT pipeline design and data flow optimization",
				"Data validation and quality assurance",
				"Stream processing and batch processing patterns",
				"Data schema evolution and versioning",
				"Error handling and data recovery strategies",
				"Monitoring and alerting for data pipelines",
				"Scalability and partitioning strategies",
			],
			"ml-model": [
				"Model training pipeline and experiment tracking",
				"Feature engineering and data preprocessing",
				"Model validation and performance metrics",
				"Model deployment and serving infrastructure",
				"A/B testing and model monitoring",
				"Data versioning and model lineage",
				"MLOps and continuous integration for models",
			],
			blockchain: [
				"Smart contract design patterns and security",
				"Gas optimization and transaction efficiency",
				"Decentralized application (dApp) architecture",
				"Blockchain integration and wallet connectivity",
				"Consensus mechanism considerations",
				"Token economics and governance patterns",
				"Security auditing and formal verification",
			],
			"game-dev": [
				"Game loop architecture and frame timing",
				"Asset management and resource optimization",
				"Physics simulation and collision detection",
				"State management for game objects",
				"Multiplayer networking and synchronization",
				"Performance profiling for real-time systems",
				"Platform-specific optimization (console/PC/mobile)",
			],
			embedded: [
				"Resource-constrained programming patterns",
				"Real-time system design and timing constraints",
				"Hardware abstraction layer design",
				"Power management and energy efficiency",
				"Interrupt handling and concurrency",
				"Memory management in constrained environments",
				"Testing strategies for embedded systems",
			],
		};
		return domain ? domainAreas[domain] || [] : [];
	};
	/**
	 * Get role-specific research areas
	 */
	CodingPrinciplesResearcher.prototype.getRoleSpecificResearchAreas = (
		role,
	) => {
		const roleAreas = {
			"backend-developer": [
				"Database design and query optimization",
				"Server architecture and scalability patterns",
				"Caching strategies and session management",
				"Background job processing and queue management",
				"Logging, monitoring, and observability",
				"Configuration management and environment handling",
				"Third-party service integration patterns",
			],
			"frontend-developer": [
				"Component lifecycle and state management",
				"Browser performance optimization and rendering",
				"CSS architecture and maintainable styling",
				"Cross-browser compatibility and testing",
				"Build tools and asset optimization",
				"User experience (UX) implementation patterns",
				"Internationalization (i18n) and localization",
			],
			"fullstack-developer": [
				"Full-stack architecture and layer separation",
				"Frontend-backend communication patterns",
				"End-to-end testing strategies",
				"Development workflow and toolchain integration",
				"Cross-cutting concerns (authentication, logging)",
				"Technology stack selection and integration",
				"DevOps practices for full-stack applications",
			],
			"mobile-developer": [
				"Platform-specific development guidelines (iOS/Android)",
				"Mobile UI/UX patterns and native components",
				"Device capability integration (camera, GPS, sensors)",
				"App lifecycle management and background processing",
				"Mobile security and data protection",
				"App store guidelines and submission processes",
				"Cross-platform development strategies",
			],
			"devops-engineer": [
				"Infrastructure as Code (IaC) and configuration management",
				"CI/CD pipeline design and automation",
				"Container orchestration and service mesh",
				"Monitoring, logging, and alerting systems",
				"Security scanning and vulnerability management",
				"Disaster recovery and backup strategies",
				"Cost optimization and resource management",
			],
			"ml-engineer": [
				"Machine learning pipeline design and automation",
				"Model versioning and experiment tracking",
				"Feature stores and data pipeline integration",
				"Model serving and inference optimization",
				"A/B testing and model monitoring",
				"MLOps practices and continuous deployment",
				"Distributed training and model parallelization",
			],
			architect: [
				"System architecture patterns and trade-offs",
				"Technology evaluation and decision frameworks",
				"Scalability planning and capacity management",
				"Cross-functional requirement analysis",
				"Technical debt management and refactoring strategies",
				"Team coordination and technical leadership",
				"Documentation and architectural decision records (ADRs)",
			],
			"tech-lead": [
				"Code review processes and quality standards",
				"Team mentoring and knowledge sharing",
				"Technical decision making and consensus building",
				"Project planning and estimation techniques",
				"Risk assessment and mitigation strategies",
				"Stakeholder communication and requirement gathering",
				"Agile/Scrum practices and team productivity",
			],
		};
		return role ? roleAreas[role] || [] : [];
	};
	/**
	 * Get advanced research areas based on role and domain combination
	 */
	CodingPrinciplesResearcher.prototype.getAdvancedResearchAreas = (
		role,
		domain,
	) => {
		const baseAdvanced = [
			"Design patterns and architectural patterns",
			"SOLID principles and clean code practices",
			"Domain-driven design (DDD) concepts",
			"Test-driven development (TDD) and behavior-driven development (BDD)",
			"Continuous integration and deployment strategies",
			"Code review and pair programming practices",
			"Technical documentation and knowledge sharing",
		];
		// Add role-specific advanced areas
		const roleAdvanced = {
			architect: [
				"Enterprise architecture patterns and frameworks",
				"Distributed systems design and CAP theorem",
				"Event-driven architecture and CQRS patterns",
				"Performance engineering and capacity planning",
				"Security architecture and threat modeling",
			],
			"tech-lead": [
				"Team scaling and knowledge transfer strategies",
				"Technical roadmap planning and prioritization",
				"Cross-team collaboration and dependency management",
				"Innovation management and technology adoption",
				"Performance management and career development",
			],
			"devops-engineer": [
				"Site reliability engineering (SRE) practices",
				"Chaos engineering and fault tolerance",
				"Cloud-native architecture and serverless patterns",
				"Security automation and compliance as code",
				"Performance monitoring and optimization",
			],
		};
		// Add domain-specific advanced areas
		const domainAdvanced = {
			microservices: [
				"Service mesh architecture and implementation",
				"Distributed tracing and observability",
				"Event sourcing and eventual consistency",
				"Circuit breaker and bulkhead patterns",
				"Service decomposition strategies",
			],
			"ml-model": [
				"Advanced model architectures and hyperparameter tuning",
				"Distributed training and model parallelization",
				"Model interpretation and explainability",
				"Federated learning and privacy-preserving ML",
				"AutoML and neural architecture search",
			],
		};
		const advanced = __spreadArray([], baseAdvanced, true);
		if (role && roleAdvanced[role]) {
			advanced.push.apply(advanced, roleAdvanced[role]);
		}
		if (domain && domainAdvanced[domain]) {
			advanced.push.apply(advanced, domainAdvanced[domain]);
		}
		return advanced;
	};
	/**
	 * Parse DSPy research result into structured principles
	 */
	CodingPrinciplesResearcher.prototype.parseResearchResult = function (
		result,
		config,
	) {
		return __awaiter(this, void 0, void 0, function () {
			let parsed, principles;
			let _a,
				_b,
				_c,
				_d,
				_e,
				_f,
				_g,
				_h,
				_j,
				_k,
				_l,
				_m,
				_o,
				_p,
				_q,
				_r,
				_s,
				_t,
				_u,
				_v,
				_w,
				_x,
				_y;
			return __generator(this, function (_z) {
				try {
					parsed = typeof result === "string" ? JSON.parse(result) : result;
					principles = {
						language: config.language,
						domain: config.domain,
						role: config.role,
						coreStandards: {
							repositoryStructure: ((_a = parsed.coreStandards) === null ||
							_a === void 0
								? void 0
								: _a.repositoryStructure) || [
								"Use standard ".concat(config.language, " project structure"),
								"Separate source, tests, and documentation",
								"Include clear configuration files",
							],
							fileNaming: ((_b = parsed.coreStandards) === null || _b === void 0
								? void 0
								: _b.fileNaming) || [
								"Use descriptive ".concat(config.language, " file names"),
								"Follow kebab-case convention",
								"Include purpose in filename",
							],
							folderOrganization: ((_c = parsed.coreStandards) === null ||
							_c === void 0
								? void 0
								: _c.folderOrganization) || [
								"Group by feature or domain",
								"Use consistent folder structure",
								"Separate utilities and shared code",
							],
							functionComplexity: ((_d = parsed.coreStandards) === null ||
							_d === void 0
								? void 0
								: _d.functionComplexity) || [
								"Keep functions under 30 lines",
								"Single responsibility principle",
								"Maximum 5 parameters",
							],
							codeOrganization: ((_e = parsed.coreStandards) === null ||
							_e === void 0
								? void 0
								: _e.codeOrganization) || [
								"Group related functionality",
								"Use consistent folder structure",
								"Separate concerns clearly",
							],
							errorHandling: ((_f = parsed.coreStandards) === null ||
							_f === void 0
								? void 0
								: _f.errorHandling) || [
								"Handle errors gracefully",
								"Use appropriate error types",
								"Provide meaningful error messages",
							],
							documentation: ((_g = parsed.coreStandards) === null ||
							_g === void 0
								? void 0
								: _g.documentation) || [
								"Document public APIs",
								"Use inline comments for complex logic",
								"Keep documentation up to date",
							],
							codeQuality: ((_h = parsed.coreStandards) === null ||
							_h === void 0
								? void 0
								: _h.codeQuality) || [
								"Follow consistent coding style",
								"Use linting and formatting tools",
								"Regular code review practices",
							],
							testingStrategy: ((_j = parsed.coreStandards) === null ||
							_j === void 0
								? void 0
								: _j.testingStrategy) || [
								"Write unit tests for core logic",
								"Include integration tests",
								"Maintain high test coverage",
							],
						},
						languageSpecific: {
							typeSystem:
								((_k = parsed.languageSpecific) === null || _k === void 0
									? void 0
									: _k.typeSystem) ||
								this.getDefaultTypeSystem(config.language),
							memoryManagement:
								((_l = parsed.languageSpecific) === null || _l === void 0
									? void 0
									: _l.memoryManagement) ||
								this.getDefaultMemoryManagement(config.language),
							concurrency:
								((_m = parsed.languageSpecific) === null || _m === void 0
									? void 0
									: _m.concurrency) ||
								this.getDefaultConcurrency(config.language),
							packageManagement:
								((_o = parsed.languageSpecific) === null || _o === void 0
									? void 0
									: _o.packageManagement) ||
								this.getDefaultPackageManagement(config.language),
							buildTools:
								((_p = parsed.languageSpecific) === null || _p === void 0
									? void 0
									: _p.buildTools) ||
								this.getDefaultBuildTools(config.language),
						},
						domainSpecific: config.domain
							? {
									architecture:
										((_q = parsed.domainSpecific) === null || _q === void 0
											? void 0
											: _q.architecture) || [],
									dataHandling:
										((_r = parsed.domainSpecific) === null || _r === void 0
											? void 0
											: _r.dataHandling) || [],
									apiDesign:
										((_s = parsed.domainSpecific) === null || _s === void 0
											? void 0
											: _s.apiDesign) || [],
									userInterface:
										((_t = parsed.domainSpecific) === null || _t === void 0
											? void 0
											: _t.userInterface) || [],
									deployment:
										((_u = parsed.domainSpecific) === null || _u === void 0
											? void 0
											: _u.deployment) || [],
								}
							: undefined,
						qualityMetrics: {
							complexity: ((_v = parsed.qualityMetrics) === null ||
							_v === void 0
								? void 0
								: _v.complexity) || { metric: "cyclomatic", threshold: 10 },
							coverage: ((_w = parsed.qualityMetrics) === null || _w === void 0
								? void 0
								: _w.coverage) || { metric: "line", threshold: 80 },
							maintainability: ((_x = parsed.qualityMetrics) === null ||
							_x === void 0
								? void 0
								: _x.maintainability) || {
								metric: "maintainability_index",
								threshold: 70,
							},
							performance: ((_y = parsed.qualityMetrics) === null ||
							_y === void 0
								? void 0
								: _y.performance) || {
								metric: "response_time",
								threshold: 100,
							},
						},
						bestPractices: parsed.bestPractices || [],
						antiPatterns: parsed.antiPatterns || [],
						template: this.generateTemplate(parsed),
						researchMetadata: {
							researchedAt: new Date(),
							sources: parsed.sources || ["AI Research"],
							confidence: 0.85,
							humanReviewed: false,
							lastUpdated: new Date(),
							version: "1.0.0",
						},
					};
					return [2 /*return*/, principles];
				} catch (error) {
					logger.warn("Failed to parse research result:", error);
					return [2 /*return*/, this.getFallbackPrinciples(config)];
				}
			});
		});
	};
	/**
	 * Generate human-reviewable template
	 */
	CodingPrinciplesResearcher.prototype.generateReviewableTemplate = (
		principles,
	) =>
		"# "
			.concat(principles.language.toUpperCase(), " Coding Principles\n")
			.concat(
				principles.domain ? "## Domain: ".concat(principles.domain) : "",
				"\n",
			)
			.concat(
				principles.role ? "## Role: ".concat(principles.role) : "",
				"\n\n## \uD83D\uDCC1 File Naming & Organization\n",
			)
			.concat(
				principles.coreStandards.fileNaming
					.map((item) => "- ".concat(item))
					.join("\n"),
				"\n\n## \u26A1 Function Guidelines  \n",
			)
			.concat(
				principles.coreStandards.functionComplexity
					.map((item) => "- ".concat(item))
					.join("\n"),
				"\n\n## \uD83D\uDD27 ",
			)
			.concat(
				principles.language.charAt(0).toUpperCase() +
					principles.language.slice(1),
				"-Specific\n### Type System\n",
			)
			.concat(
				principles.languageSpecific.typeSystem
					.map((item) => "- ".concat(item))
					.join("\n"),
				"\n\n### Package Management\n",
			)
			.concat(
				principles.languageSpecific.packageManagement
					.map((item) => "- ".concat(item))
					.join("\n"),
				"\n\n## \uD83D\uDCCA Quality Metrics\n- **Complexity**: ",
			)
			.concat(principles.qualityMetrics.complexity.metric, " < ")
			.concat(
				principles.qualityMetrics.complexity.threshold,
				"\n- **Coverage**: ",
			)
			.concat(principles.qualityMetrics.coverage.metric, " > ")
			.concat(
				principles.qualityMetrics.coverage.threshold,
				"%\n- **Maintainability**: ",
			)
			.concat(principles.qualityMetrics.maintainability.metric, " > ")
			.concat(
				principles.qualityMetrics.maintainability.threshold,
				"\n\n---\n**Research Date**: ",
			)
			.concat(
				principles.researchMetadata.researchedAt.toISOString(),
				"\n**Confidence**: ",
			)
			.concat(
				(principles.researchMetadata.confidence * 100).toFixed(1),
				"%\n**Human Reviewed**: ",
			)
			.concat(
				principles.researchMetadata.humanReviewed ? "Yes" : "No",
				"\n\n> This template is AI-generated and should be reviewed by human experts.\n> Please provide feedback to improve future research.",
			);
	// Helper methods for language-specific defaults
	CodingPrinciplesResearcher.prototype.getDefaultTypeSystem = (language) => {
		switch (language) {
			case "typescript":
				return [
					"Use explicit types",
					"Avoid any",
					"Define interfaces",
					"Use union types",
				];
			case "python":
				return [
					"Use type hints",
					"Import from typing",
					"Use Protocol for interfaces",
				];
			case "rust":
				return [
					"Leverage ownership system",
					"Use appropriate lifetimes",
					"Prefer Result over panic",
				];
			default:
				return ["Follow language type conventions"];
		}
	};
	CodingPrinciplesResearcher.prototype.getDefaultMemoryManagement = (
		language,
	) => {
		switch (language) {
			case "rust":
				return [
					"Understand ownership",
					"Use smart pointers appropriately",
					"Avoid memory leaks",
				];
			case "go":
				return [
					"Let GC handle memory",
					"Avoid goroutine leaks",
					"Use sync.Pool for object reuse",
				];
			default:
				return ["Follow language memory best practices"];
		}
	};
	CodingPrinciplesResearcher.prototype.getDefaultConcurrency = (language) => {
		switch (language) {
			case "go":
				return [
					"Use goroutines and channels",
					"Avoid race conditions",
					"Use context for cancellation",
				];
			case "rust":
				return [
					"Use async/await",
					"Leverage Send/Sync traits",
					"Use Arc/Mutex for shared state",
				];
			case "javascript":
			case "typescript":
				return [
					"Use async/await",
					"Handle Promise rejections",
					"Avoid blocking operations",
				];
			default:
				return ["Follow language concurrency patterns"];
		}
	};
	CodingPrinciplesResearcher.prototype.getDefaultPackageManagement = (
		language,
	) => {
		switch (language) {
			case "typescript":
			case "javascript":
				return [
					"Use npm/yarn/pnpm",
					"Lock dependency versions",
					"Audit for vulnerabilities",
				];
			case "rust":
				return [
					"Use Cargo.toml",
					"Specify feature flags",
					"Use workspace for multi-crate projects",
				];
			case "python":
				return [
					"Use pip/poetry",
					"Create requirements.txt",
					"Use virtual environments",
				];
			default:
				return ["Follow language package conventions"];
		}
	};
	CodingPrinciplesResearcher.prototype.getDefaultBuildTools = (language) => {
		switch (language) {
			case "typescript":
				return [
					"Use TypeScript compiler",
					"Configure tsconfig.json",
					"Use bundler like Vite/Webpack",
				];
			case "rust":
				return [
					"Use cargo build",
					"Configure Cargo.toml",
					"Use cargo clippy for linting",
				];
			default:
				return ["Use standard language build tools"];
		}
	};
	CodingPrinciplesResearcher.prototype.generateTemplate = (parsed) =>
		parsed.template || "AI-generated coding principles template";
	CodingPrinciplesResearcher.prototype.generateCacheKey = (config) =>
		""
			.concat(config.language, "-")
			.concat(config.domain || "general", "-")
			.concat(config.role || "general", "-")
			.concat(config.depth || "intermediate");
	CodingPrinciplesResearcher.prototype.isCacheValid = (principles) => {
		const ageInDays =
			(Date.now() - principles.researchMetadata.researchedAt.getTime()) /
			(1000 * 60 * 60 * 24);
		return ageInDays < 30; // Cache valid for 30 days
	};
	CodingPrinciplesResearcher.prototype.getFallbackPrinciples = function (
		config,
	) {
		return {
			language: config.language,
			domain: config.domain,
			role: config.role,
			coreStandards: {
				repositoryStructure: [
					"Use clear directory structure",
					"Separate concerns into folders",
				],
				fileNaming: ["Use descriptive filenames", "Follow naming conventions"],
				folderOrganization: [
					"Group related files",
					"Use consistent folder structure",
				],
				functionComplexity: ["Keep functions simple", "Single responsibility"],
				codeOrganization: [
					"Organize code logically",
					"Group related functionality",
				],
				errorHandling: [
					"Handle errors gracefully",
					"Provide meaningful messages",
				],
				documentation: ["Document public APIs", "Use clear comments"],
				codeQuality: ["Write maintainable code", "Follow coding standards"],
				testingStrategy: ["Write comprehensive tests", "Test edge cases"],
			},
			languageSpecific: {
				typeSystem: this.getDefaultTypeSystem(config.language),
				memoryManagement: this.getDefaultMemoryManagement(config.language),
				concurrency: this.getDefaultConcurrency(config.language),
				packageManagement: this.getDefaultPackageManagement(config.language),
				buildTools: this.getDefaultBuildTools(config.language),
			},
			bestPractices: [],
			antiPatterns: [],
			qualityMetrics: {
				complexity: { metric: "cyclomatic", threshold: 10 },
				coverage: { metric: "line", threshold: 80 },
				maintainability: { metric: "maintainability_index", threshold: 70 },
				performance: { metric: "response_time", threshold: 100 },
			},
			template: "Fallback template - requires research",
			researchMetadata: {
				researchedAt: new Date(),
				sources: ["Fallback"],
				confidence: 0.5,
				humanReviewed: false,
				lastUpdated: new Date(),
				version: "0.1.0-fallback",
			},
		};
	};
	CodingPrinciplesResearcher.prototype.incorporateFeedback = function (
		feedback,
	) {
		return __awaiter(this, void 0, void 0, function () {
			return __generator(this, (_a) => {
				// Use feedback to improve future research prompts and caching
				// This would integrate with the behavioral intelligence system
				logger.info(
					"Incorporating human feedback for principles improvement:",
					feedback.principlesId,
				);
				return [2 /*return*/];
			});
		});
	};
	CodingPrinciplesResearcher.prototype.enhancePrinciplesWithLearning =
		function (principles, patterns) {
			return __awaiter(this, void 0, void 0, function () {
				let patternKeys, patternSuccessRate;
				return __generator(this, function (_a) {
					// Enhance principles with successful patterns learned from actual projects
					principles.researchMetadata.lastUpdated = new Date();
					principles.researchMetadata.confidence = Math.min(
						principles.researchMetadata.confidence + 0.1,
						1.0,
					);
					// Analyze patterns to enhance principles
					if (patterns && typeof patterns === "object") {
						try {
							patternKeys = Object.keys(patterns);
							if (patternKeys.length > 0) {
								patternSuccessRate = this.calculatePatternSuccessRate(patterns);
								if (patternSuccessRate > 0.8) {
									// High success rate patterns enhance confidence
									principles.researchMetadata.confidence = Math.min(
										principles.researchMetadata.confidence + 0.2,
										1.0,
									);
									// Extract best practices from successful patterns
									this.extractBestPracticesFromPatterns(principles, patterns);
								}
								// Add pattern insights to research metadata
								principles.researchMetadata.sources.push(
									"pattern-analysis-".concat(patternKeys.length, "-patterns"),
								);
							}
						} catch (error) {
							this.logger.warn(
								"Error analyzing patterns for principles enhancement:",
								error,
							);
						}
					}
					return [2 /*return*/];
				});
			});
		};
	/**
	 * Calculate success rate from patterns data
	 */
	CodingPrinciplesResearcher.prototype.calculatePatternSuccessRate = function (
		patterns,
	) {
		try {
			if (Array.isArray(patterns)) {
				// If patterns is an array of success/failure data
				const successCount = patterns.filter(
					(p) => p.success === true || p.successful === true,
				).length;
				return patterns.length > 0 ? successCount / patterns.length : 0;
			} else if (typeof patterns === "object") {
				// If patterns has success metrics
				if (patterns.successRate) return patterns.successRate;
				if (patterns.success !== undefined && patterns.total !== undefined) {
					return patterns.total > 0 ? patterns.success / patterns.total : 0;
				}
				// Default success rate based on pattern existence and structure
				const patternCount = Object.keys(patterns).length;
				return patternCount > 3 ? 0.7 : 0.5; // Heuristic: more patterns indicate higher success
			}
			return 0.5; // Default moderate success rate
		} catch (error) {
			this.logger.warn("Error calculating pattern success rate:", error);
			return 0.5;
		}
	};
	/**
	 * Extract best practices from successful patterns
	 */
	CodingPrinciplesResearcher.prototype.extractBestPracticesFromPatterns =
		function (principles, patterns) {
			let _a, _b;
			let _c;
			try {
				// Look for common successful patterns to enhance principles
				if (patterns.commonPatterns) {
					(_a = principles.bestPractices).push.apply(
						_a,
						patterns.commonPatterns.filter(
							(p) =>
								typeof p === "string" &&
								p.length > 10 &&
								!principles.bestPractices.includes(p),
						),
					);
				}
				if (patterns.recommendations) {
					(_b = principles.antiPatterns).push.apply(
						_b,
						((_c = patterns.recommendations.avoid) === null || _c === void 0
							? void 0
							: _c.filter(
									(p) =>
										typeof p === "string" &&
										p.length > 10 &&
										!principles.antiPatterns.includes(p),
								)) || [],
					);
				}
				// Extract quality metrics if available
				if (patterns.qualityMetrics) {
					principles.researchMetadata.confidence = Math.min(
						principles.researchMetadata.confidence +
							(patterns.qualityMetrics.score || 0) * 0.1,
						1.0,
					);
				}
			} catch (error) {
				this.logger.warn(
					"Error extracting best practices from patterns:",
					error,
				);
			}
		};
	/**
	 * Get or initialize prompt confidence for a cache key
	 */
	CodingPrinciplesResearcher.prototype.getPromptConfidence = function (
		cacheKey,
	) {
		if (!this.promptConfidence.has(cacheKey)) {
			this.promptConfidence.set(cacheKey, {
				principlesId: cacheKey,
				initialConfidence: 0.5,
				executionCount: 0,
				averageAccuracy: 0,
				averageCompleteness: 0,
				averageUsefulness: 0,
				overallConfidence: 0.5,
				needsImprovement: true,
				lastUpdated: new Date(),
				improvementHistory: [],
			});
		}
		return this.promptConfidence.get(cacheKey);
	};
	/**
	 * Update prompt confidence based on research quality
	 */
	CodingPrinciplesResearcher.prototype.updatePromptConfidence = function (
		cacheKey,
		update,
	) {
		const confidence = this.getPromptConfidence(cacheKey);
		if (update.initialConfidence !== undefined) {
			confidence.initialConfidence = update.initialConfidence;
			confidence.overallConfidence = update.initialConfidence;
		}
		confidence.improvementHistory.push({
			version: update.version,
			changes: update.improvements,
			confidenceChange: update.initialConfidence
				? update.initialConfidence - confidence.initialConfidence
				: 0,
			timestamp: new Date(),
		});
		confidence.lastUpdated = new Date();
		this.promptConfidence.set(cacheKey, confidence);
		return confidence;
	};
	/**
	 * Evaluate research quality to determine initial confidence
	 */
	CodingPrinciplesResearcher.prototype.evaluateResearchQuality = function (
		principles,
		config,
	) {
		return __awaiter(this, void 0, void 0, function () {
			let qualityScore,
				maxScore,
				requiredCoreAreas,
				filledCoreAreas,
				requiredLangAreas,
				filledLangAreas,
				requiredDomainAreas,
				filledDomainAreas,
				hasValidMetrics,
				templateQuality;
			return __generator(this, (_a) => {
				qualityScore = 0;
				maxScore = 0;
				requiredCoreAreas = Object.keys(principles.coreStandards);
				filledCoreAreas = requiredCoreAreas.filter(
					(area) => principles.coreStandards[area].length > 0,
				);
				qualityScore +=
					(filledCoreAreas.length / requiredCoreAreas.length) * 0.3;
				maxScore += 0.3;
				requiredLangAreas = Object.keys(principles.languageSpecific);
				filledLangAreas = requiredLangAreas.filter(
					(area) => principles.languageSpecific[area].length > 0,
				);
				qualityScore +=
					(filledLangAreas.length / requiredLangAreas.length) * 0.2;
				maxScore += 0.2;
				// Evaluate domain-specific coverage if domain provided
				if (config.domain && principles.domainSpecific) {
					requiredDomainAreas = Object.keys(principles.domainSpecific);
					filledDomainAreas = requiredDomainAreas.filter(
						(area) => principles.domainSpecific[area].length > 0,
					);
					qualityScore +=
						(filledDomainAreas.length /
							Math.max(requiredDomainAreas.length, 1)) *
						0.2;
				}
				maxScore += 0.2;
				hasValidMetrics = Object.values(principles.qualityMetrics).every(
					(metric) => metric.threshold > 0 && metric.metric.length > 0,
				);
				qualityScore += hasValidMetrics ? 0.2 : 0;
				maxScore += 0.2;
				templateQuality = Math.min(principles.template.length / 500, 1) * 0.1;
				qualityScore += templateQuality;
				maxScore += 0.1;
				return [2 /*return*/, Math.min(qualityScore / maxScore, 1)];
			});
		});
	};
	/**
	 * Enhance research config based on existing feedback
	 */
	CodingPrinciplesResearcher.prototype.enhanceConfigWithFeedback = function (
		config,
		confidence,
	) {
		const enhancedConfig = __assign({}, config);
		// Get agent feedback for this principles ID
		const feedbacks = this.agentFeedback.get(confidence.principlesId) || [];
		if (feedbacks.length > 0) {
			// Analyze common missing areas and focus research there
			const missingAreas = feedbacks.flatMap((f) => f.missingAreas);
			const commonMissing = this.getMostCommon(missingAreas);
			// Increase depth if complexity is often too low
			const avgComplexity =
				feedbacks.reduce(
					(sum, f) =>
						sum +
						(f.context.taskComplexity === "simple"
							? 1
							: f.context.taskComplexity === "moderate"
								? 2
								: 3),
					0,
				) / feedbacks.length;
			if (avgComplexity > 2) {
				enhancedConfig.depth = "advanced";
			}
			// Enable additional areas based on feedback
			if (
				commonMissing.some((area) => area.toLowerCase().includes("performance"))
			) {
				enhancedConfig.includePerformance = true;
			}
			if (
				commonMissing.some((area) => area.toLowerCase().includes("security"))
			) {
				enhancedConfig.includeSecurity = true;
			}
			if (commonMissing.some((area) => area.toLowerCase().includes("test"))) {
				enhancedConfig.includeTesting = true;
			}
		}
		return enhancedConfig;
	};
	/**
	 * Update confidence based on agent execution feedback
	 */
	CodingPrinciplesResearcher.prototype.updateConfidenceFromAgentFeedback =
		function (feedback) {
			return __awaiter(this, void 0, void 0, function () {
				let confidence, count;
				return __generator(this, function (_a) {
					confidence = this.getPromptConfidence(feedback.principlesId);
					// Update execution count
					confidence.executionCount++;
					count = confidence.executionCount;
					confidence.averageAccuracy =
						(confidence.averageAccuracy * (count - 1) + feedback.accuracy) /
						count;
					confidence.averageCompleteness =
						(confidence.averageCompleteness * (count - 1) +
							feedback.completeness) /
						count;
					confidence.averageUsefulness =
						(confidence.averageUsefulness * (count - 1) + feedback.usefulness) /
						count;
					// Calculate overall confidence (weighted average)
					confidence.overallConfidence =
						confidence.initialConfidence * 0.3 +
						confidence.averageAccuracy * 0.25 +
						confidence.averageCompleteness * 0.25 +
						confidence.averageUsefulness * 0.2;
					confidence.lastUpdated = new Date();
					this.promptConfidence.set(feedback.principlesId, confidence);
					return [2 /*return*/];
				});
			});
		};
	/**
	 * Evaluate whether principles need improvement based on feedback
	 */
	CodingPrinciplesResearcher.prototype.evaluateImprovementNeeds = function (
		principlesId,
	) {
		return __awaiter(this, void 0, void 0, function () {
			let confidence,
				feedbacks,
				recentFeedbacks,
				recentAvgAccuracy,
				recentAvgUsefulness;
			return __generator(this, function (_a) {
				confidence = this.getPromptConfidence(principlesId);
				feedbacks = this.agentFeedback.get(principlesId) || [];
				if (feedbacks.length < 3) {
					// Need more data before making decisions
					return [2 /*return*/];
				}
				recentFeedbacks = feedbacks.slice(-5);
				recentAvgAccuracy =
					recentFeedbacks.reduce((sum, f) => sum + f.accuracy, 0) /
					recentFeedbacks.length;
				recentAvgUsefulness =
					recentFeedbacks.reduce((sum, f) => sum + f.usefulness, 0) /
					recentFeedbacks.length;
				// Mark for improvement if performance is declining or below threshold
				confidence.needsImprovement =
					confidence.overallConfidence < this.minimumConfidenceThreshold ||
					recentAvgAccuracy < 0.7 ||
					recentAvgUsefulness < 0.7 ||
					feedbacks.some((f) => f.missingAreas.length > 2); // Many missing areas
				this.promptConfidence.set(principlesId, confidence);
				return [2 /*return*/];
			});
		});
	};
	/**
	 * Get most common items from an array
	 */
	CodingPrinciplesResearcher.prototype.getMostCommon = (items) => {
		const frequency = new Map();
		items.forEach((item) => {
			frequency.set(item, (frequency.get(item) || 0) + 1);
		});
		return Array.from(frequency.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map((_a) => {
				const item = _a[0];
				return item;
			});
	};
	return CodingPrinciplesResearcher;
})();
exports.CodingPrinciplesResearcher = CodingPrinciplesResearcher;
/**
 * Export factory function
 */
function createCodingPrinciplesResearcher(dspyBridge, behavioralIntelligence) {
	return new CodingPrinciplesResearcher(dspyBridge, behavioralIntelligence);
}
/**
 * Export default configuration for common languages
 */
exports.DEFAULT_LANGUAGE_CONFIGS = {
	typescript: {
		language: "typescript",
		includePerformance: true,
		includeSecurity: true,
		includeTesting: true,
		depth: "intermediate",
	},
	javascript: {
		language: "javascript",
		includePerformance: true,
		includeSecurity: true,
		includeTesting: true,
		depth: "intermediate",
	},
	python: {
		language: "python",
		includePerformance: true,
		includeSecurity: true,
		includeTesting: true,
		depth: "intermediate",
	},
	rust: {
		language: "rust",
		includePerformance: true,
		includeSecurity: true,
		includeTesting: true,
		depth: "advanced",
	},
	go: {
		language: "go",
		includePerformance: true,
		includeSecurity: true,
		includeTesting: true,
		depth: "intermediate",
	},
	java: {
		language: "java",
		includePerformance: true,
		includeSecurity: true,
		includeTesting: true,
		depth: "intermediate",
	},
	csharp: {
		language: "csharp",
		includePerformance: true,
		includeSecurity: true,
		includeTesting: true,
		depth: "intermediate",
	},
	swift: {
		language: "swift",
		includePerformance: true,
		includeSecurity: false,
		includeTesting: true,
		depth: "intermediate",
	},
	kotlin: {
		language: "kotlin",
		includePerformance: true,
		includeSecurity: true,
		includeTesting: true,
		depth: "intermediate",
	},
};
